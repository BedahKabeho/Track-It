from rest_framework import permissions
from .models import UserRole

class IsAdminUserRole(permissions.BasePermission):
    """
    Allows access only to users with the 'Admin' role or is_staff status.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'Admin' or request.user.is_staff))

class IsTrackItAdmin(permissions.BasePermission):
    """
    Allows access only to Track It administrators.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        # Django superusers automatically qualify as admins.
        if user.is_superuser:
            return True

        # Check the user's assigned Track It role.
        return UserRole.objects.filter(
            user=user,
            role__name="Admin"
        ).exists()    