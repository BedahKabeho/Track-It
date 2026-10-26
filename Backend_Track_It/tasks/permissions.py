from rest_framework import permissions

from .models import UserRole


def has_admin_role(user):
    if not user or not user.is_authenticated:
        return False
    return user.is_superuser or UserRole.objects.filter(
        user=user,
        role__name="Admin",
    ).exists()


class IsAdminRole(permissions.BasePermission):
    def has_permission(self, request, view):
        return has_admin_role(request.user)


class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.is_superuser)


class IsNotSuperuserCreatingTasks(permissions.BasePermission):
    message = "Superusers oversee tasks but cannot create them."

    def has_permission(self, request, view):
        return request.method != "POST" or not request.user.is_superuser


class IsOwner(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        user_id = getattr(obj, "user_id", None)
        if user_id is not None:
            return user_id == request.user.pk

        workspace = getattr(obj, "workspace", None)
        if workspace is not None:
            return workspace.user_id == request.user.pk

        task = getattr(obj, "task", None)
        return bool(task and task.workspace.user_id == request.user.pk)
