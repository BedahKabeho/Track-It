
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.utils import timezone

from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from rest_framework.authtoken.models import Token

from .models import Workspace, Task, Notification
from .serializers import (
    WorkspaceSerializer,
    TaskSerializer,
    NotificationSerializer,
)

User = get_user_model()


# -------------------------
# REGISTER
# -------------------------

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request):
        username = str(request.data.get("username", "")).strip()
        email = str(request.data.get("email", "")).strip()
        password = request.data.get("password", "")

        if not username or not password:
            return Response(
                {"error": "Username and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if User.objects.filter(username__iexact=username).exists():
            return Response(
                {"error": "Username already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            validate_password(password)
        except DjangoValidationError as exc:
            return Response(
                {"password": exc.messages},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
        )

        return Response(
            {
                "message": "User registered successfully.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "role": "User",
                },
            },
            status=status.HTTP_201_CREATED,
        )


# -------------------------
# LOGOUT
# -------------------------

class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if not isinstance(request.auth, Token):
            return Response(
                {"error": "Token authentication is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        request.auth.delete()

        return Response(
            {"message": "Logged out successfully."},
            status=status.HTTP_200_OK,
        )


# -------------------------
# WORKSPACES / PROJECTS
# -------------------------

class WorkspaceListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return Workspace.objects.all()

        return Workspace.objects.filter(user=user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WorkspaceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            return Workspace.objects.all()

        return Workspace.objects.filter(user=user)


# -------------------------
# TASKS
# -------------------------

class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            queryset = Task.objects.all()
        else:
            queryset = Task.objects.filter(workspace__user=user)

        workspace_id = self.request.query_params.get("workspace")
        task_status = self.request.query_params.get("status")

        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)

        if task_status:
            queryset = queryset.filter(status=task_status)

        return queryset.select_related("workspace")

    def perform_create(self, serializer):
        workspace = serializer.validated_data["workspace"]

        if workspace.user_id != self.request.user.id:
            raise ValidationError({
                "workspace": "You cannot create tasks in this workspace."
            })

        task = serializer.save()

        if task.status == Task.Status.IN_PROGRESS:
            task.started_at = timezone.now()
            task.save(update_fields=["started_at"])

        elif task.status == Task.Status.DONE:
            task.completed_at = timezone.now()
            task.save(update_fields=["completed_at"])


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.is_staff:
            queryset = Task.objects.all()
        else:
            queryset = Task.objects.filter(workspace__user=user)

        return queryset.select_related("workspace")

    def perform_update(self, serializer):
        task = self.get_object()
        old_status = task.status

        new_workspace = serializer.validated_data.get(
            "workspace", task.workspace
        )

        if new_workspace.user_id != self.request.user.id:
            raise ValidationError({
                "workspace": "You cannot move tasks into this workspace."
            })

        task = serializer.save()
        fields_to_update = []

        if task.status == Task.Status.IN_PROGRESS:
            if old_status != Task.Status.IN_PROGRESS:
                task.started_at = timezone.now()
                task.completed_at = None
                fields_to_update = ["started_at", "completed_at"]

        elif task.status == Task.Status.DONE:
            if old_status != Task.Status.DONE:
                task.completed_at = timezone.now()
                fields_to_update = ["completed_at"]

        elif old_status == Task.Status.DONE:
            task.completed_at = None
            fields_to_update = ["completed_at"]

        if fields_to_update:
            task.save(update_fields=fields_to_update)


# -------------------------
# NOTIFICATIONS
# -------------------------

class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            user=self.request.user
        ).select_related("task")


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
