from django.shortcuts import render

from django.shortcuts import get_object_or_404
from django.utils import timezone

from rest_framework import generics, permissions
from rest_framework.exceptions import ValidationError

from .models import Workspace, Task, Notification
from .serializers import (
    WorkspaceSerializer,
    TaskSerializer,
    NotificationSerializer,
)


class WorkspaceListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Workspace.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WorkspaceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Workspace.objects.filter(user=self.request.user)


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Task.objects.filter(
            workspace__user=self.request.user
        )

        workspace_id = self.request.query_params.get("workspace")

        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)

        return queryset

    def perform_create(self, serializer):
        workspace = serializer.validated_data["workspace"]

        if workspace.user_id != self.request.user.id:
            raise ValidationError(
                {"workspace": "You cannot create tasks in this workspace."}
            )

        task = serializer.save()

        if task.status == Task.Status.IN_PROGRESS and not task.started_at:
            task.started_at = timezone.now()
            task.save(update_fields=["started_at"])


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(
            workspace__user=self.request.user
        )

    def perform_update(self, serializer):
        old_task = self.get_object()
        old_status = old_task.status
        new_status = serializer.validated_data.get(
            "status", old_status
        )

        task = serializer.save()

        if (
            new_status == Task.Status.IN_PROGRESS
            and old_status != Task.Status.IN_PROGRESS
        ):
            task.started_at = timezone.now()
            task.completed_at = None
            task.save(update_fields=["started_at", "completed_at"])

        elif (
            new_status == Task.Status.DONE
            and old_status != Task.Status.DONE
        ):
            task.completed_at = timezone.now()
            task.save(update_fields=["completed_at"])

        elif new_status != Task.Status.DONE and old_status == Task.Status.DONE:
            task.completed_at = None
            task.save(update_fields=["completed_at"])


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        )


class NotificationReadView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["patch"]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        )

    def perform_update(self, serializer):
        serializer.save(read_at=timezone.now())

