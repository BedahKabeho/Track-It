
from django.db import models
from django.conf import settings


# Workspace model
# Each user can create multiple workspaces to organize tasks.
class Workspace(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="workspaces",
    )

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "name"],
                name="unique_workspace_name_per_user",
            )
        ]

    def __str__(self):
        return self.name


# Task model
# Stores tasks belonging to a workspace.
class Task(models.Model):

    # Available task statuses
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        IN_PROGRESS = "in_progress", "In Progress"
        DONE = "done", "Done"

    workspace = models.ForeignKey(
        Workspace,
        on_delete=models.CASCADE,
        related_name="tasks",
    )

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    due_date = models.DateTimeField()

    # Every newly created task starts as Pending.
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["due_date", "-created_at"]

    def __str__(self):
        return self.title


# Notification model
# Stores reminders related to tasks.
class Notification(models.Model):

    class Type(models.TextChoices):
        DUE_2_DAYS = "due_2_days", "Due in 2 days"
        DUE_1_DAY = "due_1_day", "Due in 1 day"
        OVERDUE = "overdue", "Overdue"
        IN_PROGRESS = "in_progress", "In-progress reminder"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="trackitz_notifications",
    )

    task = models.ForeignKey(
        Task,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    notification_type = models.CharField(
        max_length=30,
        choices=Type.choices,
    )

    message = models.CharField(max_length=300)
    scheduled_for = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["task", "notification_type", "scheduled_for"],
                name="unique_task_notification_schedule",
            )
        ]

    def __str__(self):
        return f"{self.notification_type}: {self.task.title}"



class UserActivity(models.Model):
    class Action(models.TextChoices):
        CREATED = "created", "Created"
        UPDATED = "updated", "Updated"
        DELETED = "deleted", "Deleted"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activities",
    )

    username = models.CharField(max_length=150)

    action = models.CharField(
        max_length=20,
        choices=Action.choices,
    )

    task = models.ForeignKey(
        "Task",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="activity_history",
    )

    task_id_snapshot = models.IntegerField(
        null=True,
        blank=True,
    )

    task_title = models.CharField(max_length=200)

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-created_at", "-id"]

    def __str__(self):
        return f"{self.username} {self.action} {self.task_title}"


    
class Role(models.Model):
    class RoleName(models.TextChoices):
        ADMIN = "Admin", "Admin"
        USER = "User", "User"

    name = models.CharField(
        max_length=10,
        choices=RoleName.choices,
        unique=True
    )

    def __str__(self):
        return self.name


class UserRole(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="trackit_role"
    )

    role = models.ForeignKey(
        Role,
        on_delete=models.PROTECT,
        related_name="users"
    )

    def __str__(self):
        return f"{self.user.username} - {self.role.name}"

