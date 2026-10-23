
from rest_framework import serializers
from django.utils import timezone
from .models import Workspace, Task, Notification


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
