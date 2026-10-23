from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token




urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='api-register'),
    path('auth/login/', obtain_auth_token, name='api-login'),
]

from django.urls import path

from .views import (
    WorkspaceListCreateView,
    WorkspaceDetailView,
    TaskListCreateView,
    TaskDetailView,
    NotificationListView,
    NotificationReadView,
    NotificationListView,
    NotificationReadView,

)

urlpatterns = [
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
