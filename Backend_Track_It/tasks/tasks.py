
from datetime import datetime, time, timedelta

from celery import shared_task
from django.db import IntegrityError, transaction
from django.utils import timezone
from django.conf import settings
from django.core.mail import send_mail
from django.contrib.auth import get_user_model

from .models import Task, Notification

@shared_task(
    bind=True,
    max_retries=3,
    default_retry_delay=60,
)
def send_notification_email(self, notification_id):
    """Email a saved notification to its owner."""
    try:
        notification = (
            Notification.objects
            .select_related("user", "task")
            .get(pk=notification_id)
        )

        recipient = notification.user.email
        if not recipient:
            return {
                "status": "skipped",
                "reason": "User has no email address",
                "notification_id": notification_id,
            }

        send_mail(
            subject=f"Track-It reminder: {notification.task.title}",
            message=notification.message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[recipient],
            fail_silently=False,
        )

        return {
            "status": "sent",
            "notification_id": notification_id,
        }

    except Notification.DoesNotExist:
        return {
            "status": "skipped",
            "reason": "Notification no longer exists",
            "notification_id": notification_id,
        }

    except Exception as exc:
        raise self.retry(exc=exc)


def latest_schedule_time(hours):
    """Return the latest scheduled UTC time at or before now."""
    now = timezone.localtime(timezone.now())
    candidates = []

    for days_ago in (0, 1):
        scheduled_date = now.date() - timedelta(days=days_ago)

        for hour in hours:
            naive_datetime = datetime.combine(
                scheduled_date,
                time(hour=hour, minute=0),
            )
            candidates.append(
                timezone.make_aware(
                    naive_datetime,
                    timezone.get_current_timezone(),
                )
            )

    return max(candidate for candidate in candidates if candidate <= now)


def create_notification(task, notification_type, message, scheduled_for):
    """Create a notification once per task, type, and scheduled time."""
    try:
        with transaction.atomic():
            notification = Notification.objects.create(
                user_id=task.workspace.user_id,
                task=task,
                notification_type=notification_type,
                message=message,
                scheduled_for=scheduled_for,
            )

            transaction.on_commit(
                lambda notification_id=notification.pk:
                    send_notification_email.delay(notification_id)
            )
        return True
    except IntegrityError:
        # A notification for this exact schedule already exists.
        return False


@shared_task
def send_upcoming_task_reminders():
    """Run at 09:00 and 16:00 Africa/Dar_es_Salaam time."""
    now = timezone.now()
    scheduled_for = latest_schedule_time([9, 16])
    end_time = now + timedelta(hours=48)

    tasks = Task.objects.filter(
        due_date__gt=now,
        due_date__lte=end_time,
    ).exclude(
        status=Task.Status.DONE,
    ).select_related("workspace")

    created = 0

    for task in tasks:
        hours_remaining = (task.due_date - now).total_seconds() / 3600

        if hours_remaining <= 24:
            notification_type = Notification.Type.DUE_1_DAY
            message = f'Task "{task.title}" is due within 24 hours.'
        else:
            notification_type = Notification.Type.DUE_2_DAYS
            message = f'Task "{task.title}" is due within 48 hours.'

        if create_notification(
            task, notification_type, message, scheduled_for
        ):
            created += 1

    return {"notifications_created": created}


@shared_task
def send_overdue_task_reminders():
    """Run daily at 09:00 Africa/Dar_es_Salaam time."""
    now = timezone.now()
    scheduled_for = latest_schedule_time([9])

    tasks = Task.objects.filter(
        due_date__lt=now,
    ).exclude(
        status=Task.Status.DONE,
    ).select_related("workspace")

    created = 0

    for task in tasks:
        if create_notification(
            task,
            Notification.Type.OVERDUE,
            f'Task "{task.title}" is overdue.',
            scheduled_for,
        ):
            created += 1

    return {"notifications_created": created}


@shared_task
def send_in_progress_reminders():
    """Check every 15 minutes; remind once per in-progress period."""
    now = timezone.now()
    cutoff = now - timedelta(hours=6)

    tasks = Task.objects.filter(
        status=Task.Status.IN_PROGRESS,
        started_at__isnull=False,
        started_at__lte=cutoff,
    ).select_related("workspace")

    created = 0

    for task in tasks:
        scheduled_for = task.started_at + timedelta(hours=6)

        if create_notification(
            task,
            Notification.Type.IN_PROGRESS,
            f'Task "{task.title}" has been in progress for six hours.',
            scheduled_for,
        ):
            created += 1

    return {"notifications_created": created}
