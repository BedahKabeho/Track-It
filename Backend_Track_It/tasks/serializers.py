
from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.utils import timezone
from .models import Workspace, Task, Notification

User = get_user_model()


class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = [
            "id",
            "name",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Workspace name cannot be empty."
            )

        request = self.context.get("request")

        if request and request.user.is_authenticated:
            queryset = Workspace.objects.filter(
                user=request.user,
                name__iexact=value,
            )

            if self.instance:
                queryset = queryset.exclude(pk=self.instance.pk)

            if queryset.exists():
                raise serializers.ValidationError(
                    "You already have a workspace with this name."
                )

        return value


class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            "id",
            "workspace",
            "title",
            "description",
            "due_date",
            "status",
            "started_at",
            "completed_at",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "started_at",
            "completed_at",
            "created_at",
            "updated_at",
        ]

    def validate_workspace(self, workspace):
        request = self.context.get("request")

        if request and workspace.user_id != request.user.id:
            raise serializers.ValidationError(
                "You cannot use another user's workspace."
            )

        return workspace

    def validate_due_date(self, value):
        if value < timezone.now():
            raise serializers.ValidationError("Due date cannot be in the past.")

        return value


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "task",
            "notification_type",
            "message",
            "scheduled_for",
            "created_at",
            "read_at",
        ]

        read_only_fields = [
            "id",
            "task",
            "notification_type",
            "message",
            "scheduled_for",
            "created_at",
            "read_at",
        ]


class AdminTaskSerializer(serializers.ModelSerializer):
    workspace_name = serializers.CharField(source="workspace.name", read_only=True)
    user_name = serializers.SerializerMethodField()
    user_email = serializers.EmailField(source="workspace.user.email", read_only=True)

    class Meta:
        model = Task
        fields = [
            "id",
            "title",
            "description",
            "status",
            "due_date",
            "created_at",
            "workspace",
            "workspace_name",
            "user_name",
            "user_email",
        ]

    def get_user_name(self, task):
        user = task.workspace.user
        full_name = " ".join(part for part in (user.first_name, user.last_name) if part).strip()
        return full_name or user.get_username()


class AdminUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    is_superuser = serializers.BooleanField(read_only=True)
    workspace_count = serializers.IntegerField(read_only=True)
    task_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "full_name",
            "email",
            "is_active",
            "role",
            "is_admin",
            "is_superuser",
            "date_joined",
            "last_login",
            "workspace_count",
            "task_count",
        ]

    def get_full_name(self, user):
        full_name = " ".join(part for part in (user.first_name, user.last_name) if part).strip()
        return full_name or user.get_username()

    def get_is_admin(self, user):
        return bool(user.is_superuser or getattr(user, "admin_role", False))

    def get_role(self, user):
        return "ADMIN" if self.get_is_admin(user) else "USER"
