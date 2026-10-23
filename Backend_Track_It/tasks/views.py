
from rest_framework import generics, permissions, status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from django.contrib.auth import get_user_model

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
User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email', '').strip().lower()
        username = request.data.get('username') or email
        password = request.data.get('password')
        full_name = request.data.get('full_name', '').strip()

        if not username or not password:
            return Response({"error": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

        first_name, _, last_name = full_name.partition(' ')
        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name,
        )
        return Response({
            "message": "User registered successfully.",
            "user": {"id": user.id, "username": user.username, "email": user.email}
        }, status=status.HTTP_201_CREATED)
    
class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of an object or admins to view/edit it.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff or getattr(request.user, 'role', '') == 'Admin':
            return True
        # Check if object has user directly or via workspace
        if hasattr(obj, 'user'):
            return obj.user == request.user
        if hasattr(obj, 'workspace'):
            return obj.workspace.user == request.user
        return False

class WorkspaceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or getattr(user, 'role', '') == 'Admin':
            return Workspace.objects.all()
        return Workspace.objects.filter(user=user)

class WorkspaceListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Workspace.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsOwnerOrAdmin]

    def get_queryset(self):
        user = self.request.user
        # Admins can view all tasks globally; standard users see tasks in their workspaces
        if user.is_staff or getattr(user, 'role', '') == 'Admin':
            return Task.objects.all()
        return Task.objects.filter(workspace__user=user)

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


