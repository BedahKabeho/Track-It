
from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token

from .views import (
    RegisterView,
    LogoutView,
    WorkspaceListCreateView,
    WorkspaceDetailView,
    TaskListCreateView,
    TaskDetailView,
    NotificationListView,
    NotificationReadView,
)

urlpatterns = [
    # Authentication
    path(
        "auth/register/",
        RegisterView.as_view(),
        name="register",
    ),
    path(
        "auth/login/",
        obtain_auth_token,
        name="login",
    ),
    path(
        "auth/logout/",
        LogoutView.as_view(),
        name="logout",
    ),

    # Workspaces
    path(
        "workspaces/",
        WorkspaceListCreateView.as_view(),
        name="workspace-list-create",
    ),
    path(
        "workspaces/<int:pk>/",
        WorkspaceDetailView.as_view(),
        name="workspace-detail",
    ),

    # Tasks
    path(
        "tasks/",
        TaskListCreateView.as_view(),
        name="task-list-create",
    ),
    path(
        "tasks/<int:pk>/",
        TaskDetailView.as_view(),
        name="task-detail",
    ),

    # Notifications
    path(
        "notifications/",
        NotificationListView.as_view(),
        name="notification-list",
    ),
    path(
        "notifications/<int:pk>/read/",
        NotificationReadView.as_view(),
        name="notification-read",
    ),
]
