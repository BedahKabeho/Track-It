
from rest_framework import serializers
from .models import Workspace, Task, Notification


class WorkspaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Workspace
        fields = ["id", "name", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Workspace name cannot be empty."
            )

        request = self.context.get("request")

        if request and request.user.is_authenticated:
            if Workspace.objects.filter(
                user=request.user,
                name__iexact=value,
            ).exists():
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
            "notification_type",
            "message",
            "scheduled_for",
            "created_at",
        ]
