from django.shortcuts import render

from rest_framework import viewsets, permissions
from .models import Workspace, Task
from .serializers import WorkspaceSerializer, TaskSerializer
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')
        role = request.data.get('role', 'User')

        if not username or not password:
            return Response({"error": "Username and password are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists."}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password, email=email, role=role)
        return Response({
            "message": "User registered successfully.",
            "user": {"id": user.id, "username": user.username, "role": user.role}
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