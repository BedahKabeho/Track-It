from rest_framework import permissions

from .models import UserRole


class IsTrackItAdmin(permissions.BasePermission):
    """Allow platform level access to administrators and superusers."""

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        if user.is_superuser or user.is_staff:
            return True
        return UserRole.objects.filter(user=user, role__name="Admin").exists()
