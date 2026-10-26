import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def assign_or_remove_unowned_deletion_notices(apps, schema_editor):
    Notification = apps.get_model("tasks", "Notification")
    unowned = Notification.objects.filter(
        notification_type="task_deleted",
        user__isnull=True,
    ).select_related("task__workspace")

    for notification in unowned.iterator():
        if notification.task_id:
            notification.user_id = notification.task.workspace.user_id
            notification.save(update_fields=["user"])
        else:
            # A deleted task no longer carries its workspace owner. Such a
            # broadcast cannot safely be assigned to an individual user.
            notification.delete()


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("tasks", "0005_broadcast_task_deletion_notifications"),
    ]

    operations = [
        migrations.RunPython(assign_or_remove_unowned_deletion_notices, migrations.RunPython.noop),
        migrations.DeleteModel(name="NotificationRead"),
        migrations.AlterField(
            model_name="notification",
            name="user",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="trackitz_notifications",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
