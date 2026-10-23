from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token

from .views import (
    NotificationListView,
    NotificationReadView,
    RegisterView,
    TaskDetailView,
    TaskListCreateView,
    WorkspaceDetailView,
    WorkspaceListCreateView,
)


urlpatterns = [
    path("auth/register/", RegisterView.as_view(), name="api-register"),
    path("auth/login/", obtain_auth_token, name="api-login"),
    path("workspaces/", WorkspaceListCreateView.as_view(), name="workspace-list-create"),
    path("workspaces/<int:pk>/", WorkspaceDetailView.as_view(), name="workspace-detail"),
    path("tasks/", TaskListCreateView.as_view(), name="task-list-create"),
    path("tasks/<int:pk>/", TaskDetailView.as_view(), name="task-detail"),
    path("notifications/", NotificationListView.as_view(), name="notification-list"),
    path("notifications/<int:pk>/read/", NotificationReadView.as_view(), name="notification-read"),
]
