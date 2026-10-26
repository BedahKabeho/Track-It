from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from django.db.models import Count, Exists, OuterRef, Q
from django.utils import timezone
from rest_framework import generics, permissions, serializers, status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Notification, Task, Workspace, UserRole
from .permissions import IsTrackItAdmin
from .serializers import AdminTaskSerializer, AdminUserSerializer, NotificationSerializer, TaskSerializer, WorkspaceSerializer

User = get_user_model()


def user_payload(user):
    full_name = " ".join(part for part in (user.first_name, user.last_name) if part).strip()
    return {
        "id": user.id,
        "full_name": full_name or user.get_username(),
        "email": user.email,
        "is_admin": bool(
            user.is_staff
            or user.is_superuser
            or UserRole.objects.filter(user=user, role__name="Admin").exists()
        ),
    }


class RegisterSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150, trim_whitespace=True)
    email = serializers.EmailField(max_length=150)
    password = serializers.CharField(write_only=True, trim_whitespace=False)
    terms_accepted = serializers.BooleanField()

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(username__iexact=normalized).exists() or User.objects.filter(email__iexact=normalized).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return normalized

    def validate_terms_accepted(self, value):
        if not value:
            raise serializers.ValidationError("You must accept the terms to create an account.")
        return value

    def validate(self, attrs):
        candidate = User(username=attrs["email"], email=attrs["email"], first_name=attrs["full_name"])
        try:
            validate_password(attrs["password"], user=candidate)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": exc.messages}) from exc
        return attrs

    
    def create(self, validated_data):
      full_name = validated_data["full_name"].strip()
      first_name, _, last_name = full_name.partition(" ")

      user = User.objects.create_user(
        username=validated_data["email"],
        email=validated_data["email"],
        first_name=first_name,
        last_name=last_name,
        password=validated_data["password"],
    )

      return user



class RegisterView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, _ = Token.objects.get_or_create(user=user)
        return Response({"user": user_payload(user), "token": token.key}, status=status.HTTP_201_CREATED)


class CurrentUserView(APIView):
    authentication_classes = [TokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({"user": user_payload(request.user)})


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        if isinstance(request.auth, Token):
            request.auth.delete()
        return Response({"message": "Logged out successfully."}, status=status.HTTP_200_OK)


class WorkspaceListCreateView(generics.ListCreateAPIView):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Workspace.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class WorkspaceDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Workspace.objects.filter(user=self.request.user)


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Task.objects.filter(workspace__user=self.request.user)
        workspace_id = self.request.query_params.get("workspace")
        if workspace_id:
            queryset = queryset.filter(workspace_id=workspace_id)
        return queryset

    def perform_create(self, serializer):
        workspace = serializer.validated_data["workspace"]
        if workspace.user_id != self.request.user.id:
            raise ValidationError({"workspace": "You cannot create tasks in this workspace."})
        task = serializer.save()
        if task.status == Task.Status.IN_PROGRESS and not task.started_at:
            task.started_at = timezone.now()
            task.save(update_fields=["started_at"])


class TaskDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        is_admin = (
            user.is_authenticated
            and (
                user.is_superuser
                or user.is_staff
                or UserRole.objects.filter(
                    user=user,
                    role__name="Admin"
                ).exists()
            )
        )
        if is_admin:
            return Task.objects.select_related(
                "workspace",
                "workspace__user"
            ).all()

        return Task.objects.filter(workspace__user=user)

    def perform_update(self, serializer):
        old_task = self.get_object()
        old_status = old_task.status
        new_status = serializer.validated_data.get("status", old_status)
        task = serializer.save()
        if new_status == Task.Status.IN_PROGRESS and old_status != Task.Status.IN_PROGRESS:
            task.started_at = timezone.now()
            task.completed_at = None
            task.save(update_fields=["started_at", "completed_at"])
        elif new_status == Task.Status.DONE and old_status != Task.Status.DONE:
            task.completed_at = timezone.now()
            task.save(update_fields=["completed_at"])
        elif new_status != Task.Status.DONE and old_status == Task.Status.DONE:
            task.completed_at = None
            task.save(update_fields=["completed_at"])


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationReadView(generics.UpdateAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["patch"]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    def perform_update(self, serializer):
        serializer.save(read_at=timezone.now())

class AdminStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsTrackItAdmin]

    def get(self, request):
        return Response({
            "total_users": User.objects.count(),
            "total_workspaces": Workspace.objects.count(),
            "total_tasks": Task.objects.count(),
            "pending_tasks": Task.objects.filter(status=Task.Status.PENDING).count(),
            "in_progress_tasks": Task.objects.filter(status=Task.Status.IN_PROGRESS).count(),
            "completed_tasks": Task.objects.filter(status=Task.Status.DONE).count(),
        })


class AdminUserListView(generics.ListAPIView):
    serializer_class = AdminUserSerializer
    permission_classes = [permissions.IsAuthenticated, IsTrackItAdmin]

    def get_queryset(self):
        queryset = User.objects.annotate(
            workspace_count=Count("workspaces", distinct=True),
            task_count=Count("workspaces__tasks", distinct=True),
            admin_role=Exists(UserRole.objects.filter(user_id=OuterRef("pk"), role__name="Admin")),
        ).order_by("-date_joined")
        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
            )
        return queryset


class AdminTaskListView(generics.ListAPIView):
    serializer_class = AdminTaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsTrackItAdmin]

    def get_queryset(self):
        queryset = Task.objects.select_related("workspace", "workspace__user").all()
        task_status = self.request.query_params.get("status")
        if task_status and task_status != "all":
            valid_statuses = {choice for choice, _label in Task.Status.choices}
            if task_status not in valid_statuses:
                return queryset.none()
            queryset = queryset.filter(status=task_status)

        workspace_id = self.request.query_params.get("workspace")
        if workspace_id and workspace_id.isdigit():
            queryset = queryset.filter(workspace_id=int(workspace_id))

        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search)
                | Q(description__icontains=search)
                | Q(workspace__name__icontains=search)
                | Q(workspace__user__first_name__icontains=search)
                | Q(workspace__user__last_name__icontains=search)
                | Q(workspace__user__email__icontains=search)
            )
        return queryset
