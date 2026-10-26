from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin
from django.contrib.messages import SUCCESS

from .models import Notification, Role, Task, UserActivity, UserRole, Workspace


User = get_user_model()
admin.site.unregister(User)


def _set_trackit_role(modeladmin, request, queryset, role_name, message):
    if queryset.model is User:
        role, _ = Role.objects.get_or_create(name=role_name)
        users = queryset.exclude(is_superuser=True)
        for user in users.iterator():
            UserRole.objects.update_or_create(user=user, defaults={"role": role})
        modeladmin.message_user(request, message.format(count=users.count()), SUCCESS)


@admin.action(description="Promote selected users to Track-It admin")
def promote_trackit_admin(modeladmin, request, queryset):
    _set_trackit_role(
        modeladmin,
        request,
        queryset,
        Role.RoleName.ADMIN,
        "{count} user(s) promoted to Track-It admin. Superusers were unchanged.",
    )


@admin.action(description="Demote selected users to Track-It user")
def demote_trackit_user(modeladmin, request, queryset):
    _set_trackit_role(
        modeladmin,
        request,
        queryset,
        Role.RoleName.USER,
        "{count} user(s) demoted to Track-It user. Superusers were unchanged.",
    )


@admin.register(User)
class TrackItUserAdmin(UserAdmin):
    list_display = (*UserAdmin.list_display, "trackit_role")
    actions = [promote_trackit_admin, demote_trackit_user]

    def get_queryset(self, request):
        return super().get_queryset(request).select_related("trackit_role__role")

    @admin.display(description="Track-It role", ordering="trackit_role__role__name")
    def trackit_role(self, user):
        if user.is_superuser:
            return "Superuser"
        try:
            return user.trackit_role.role.get_name_display()
        except UserRole.DoesNotExist:
            return "User"


@admin.register(Workspace)
class WorkspaceAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "created_at", "updated_at")
    search_fields = ("name", "user__username", "user__email")
    list_select_related = ("user",)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ("title", "workspace", "status", "due_date", "created_at")
    list_filter = ("status",)
    search_fields = ("title", "description", "workspace__name", "workspace__user__email")
    list_select_related = ("workspace", "workspace__user")
    readonly_fields = (
        "workspace",
        "title",
        "description",
        "due_date",
        "status",
        "started_at",
        "completed_at",
        "created_at",
        "updated_at",
    )

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ("notification_type", "user", "task", "scheduled_for", "read_at")
    list_filter = ("notification_type",)
    search_fields = ("user__email", "task__title", "message")
    list_select_related = ("user", "task")
    readonly_fields = tuple(field.name for field in Notification._meta.fields)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(UserActivity)
class UserActivityAdmin(admin.ModelAdmin):
    list_display = ("username", "action", "task_title", "created_at")
    list_filter = ("action",)
    search_fields = ("username", "task_title")
    readonly_fields = tuple(field.name for field in UserActivity._meta.fields)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ("name",)
    readonly_fields = ("name",)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ("user", "role")
    list_select_related = ("user", "role")
    readonly_fields = ("user", "role")
    search_fields = ("user__username", "user__email")

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

# Register your models here.
