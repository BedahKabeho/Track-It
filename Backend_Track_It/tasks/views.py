import secrets
from datetime import timedelta
from urllib.parse import urlencode

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Count, Exists, F, OuterRef, Q
from django.shortcuts import get_object_or_404
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils import timezone
from rest_framework import generics, permissions, serializers, status
from rest_framework.authtoken.models import Token
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView
from .authentication import ActiveTokenAuthentication
from .models import Notification, Role, SignupEmailVerification, Task, UserRole, Workspace
from .permissions import (
    IsAdminRole,
    IsNotSuperuserCreatingTasks,
    IsOwner,
    IsSuperAdmin,
    has_admin_role,
)
from .serializers import AdminTaskSerializer, AdminUserSerializer, NotificationSerializer, TaskSerializer, WorkspaceSerializer
from django.conf import settings
from django.contrib.auth import get_user_model
from django.core import signing
from django.db import transaction
from django.shortcuts import redirect
from django.urls import reverse
from django.utils.http import url_has_allowed_host_and_scheme
from .models import SocialAccount
from .oauth import oauth
User = get_user_model()


def user_payload(user):
    full_name = " ".join(part for part in (user.first_name, user.last_name) if part).strip()
    is_admin = has_admin_role(user)
    return {
        "id": user.id,
        "full_name": full_name or user.get_username(),
        "email": user.email,
        "role": "ADMIN" if is_admin else "USER",
        "is_admin": is_admin,
        "is_superuser": user.is_superuser,
    }


class LegacyRegisterSerializer(serializers.Serializer):
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


class SignupEmailVerificationRequestSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=150, trim_whitespace=True)
    email = serializers.EmailField(max_length=150)
    terms_accepted = serializers.BooleanField()

    def validate_email(self, value):
        normalized = value.strip().lower()
        if User.objects.filter(
            Q(username__iexact=normalized) | Q(email__iexact=normalized)
        ).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return normalized

    def validate_terms_accepted(self, value):
        if not value:
            raise serializers.ValidationError("You must accept the terms to create an account.")
        return value


class SignupEmailCodeSerializer(serializers.Serializer):
    email = serializers.EmailField(max_length=150)
    code = serializers.RegexField(regex=r"^\d{6}$")

    def validate_email(self, value):
        return value.strip().lower()


class RegisterSerializer(serializers.Serializer):
    verification_token = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True, trim_whitespace=False)

    def validate(self, attrs):
        try:
            payload = signing.loads(
                attrs["verification_token"],
                salt="trackit-signup-email-verification",
                max_age=15 * 60,
            )
            verification = SignupEmailVerification.objects.get(
                pk=payload["verification_id"],
                email=payload["email"],
                verified_at__isnull=False,
                expires_at__gt=timezone.now(),
            )
        except (
            signing.BadSignature,
            KeyError,
            TypeError,
            ValueError,
            SignupEmailVerification.DoesNotExist,
        ) as exc:
            raise serializers.ValidationError(
                {"verification_token": "Verify your email address before creating an account."}
            ) from exc

        if User.objects.filter(
            Q(username__iexact=verification.email) | Q(email__iexact=verification.email)
        ).exists():
            raise serializers.ValidationError(
                {"verification_token": "An account with this email already exists."}
            )

        candidate = User(
            username=verification.email,
            email=verification.email,
            first_name=verification.full_name.partition(" ")[0],
        )
        try:
            validate_password(attrs["password"], user=candidate)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": exc.messages}) from exc

        attrs["verification"] = verification
        return attrs

    def create(self, validated_data):
        verification = SignupEmailVerification.objects.select_for_update().get(
            pk=validated_data["verification"].pk,
            verified_at__isnull=False,
            expires_at__gt=timezone.now(),
        )
        full_name = verification.full_name.strip()
        first_name, _, last_name = full_name.partition(" ")
        user = User.objects.create_user(
            username=verification.email,
            email=verification.email,
            first_name=first_name,
            last_name=last_name,
            password=validated_data["password"],
        )
        verification.delete()
        return user


class SignupEmailVerificationRequestView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = SignupEmailVerificationRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        now = timezone.now()
        verification = SignupEmailVerification.objects.select_for_update().filter(
            email=data["email"]
        ).first()

        if verification and verification.sent_at > now - timedelta(seconds=60):
            return Response(
                {"detail": "Please wait before requesting another verification code."},
                status=status.HTTP_429_TOO_MANY_REQUESTS,
            )

        code = f"{secrets.randbelow(1_000_000):06d}"
        if verification is None:
            verification = SignupEmailVerification(email=data["email"])
        verification.full_name = data["full_name"]
        verification.terms_accepted = data["terms_accepted"]
        verification.code_hash = make_password(code)
        verification.attempts = 0
        verification.sent_at = now
        verification.expires_at = now + timedelta(minutes=10)
        verification.verified_at = None
        verification.save()

        send_mail(
            subject="Verify your TrackIt account",
            message=(
                f"Your TrackIt verification code is {code}.\n\n"
                "Enter this code to verify your email address and continue creating your account. "
                "The code expires in 10 minutes."
            ),
            from_email=settings.DEFAULT_FROM_EMAIL or None,
            recipient_list=[verification.email],
            fail_silently=False,
        )
        return Response(
            {"detail": "A verification code has been sent to your email address."},
            status=status.HTTP_200_OK,
        )


class SignupEmailVerificationView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = SignupEmailCodeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        try:
            verification = SignupEmailVerification.objects.select_for_update().get(
                email=data["email"],
                expires_at__gt=timezone.now(),
            )
        except SignupEmailVerification.DoesNotExist:
            return Response(
                {"code": ["The code is invalid or has expired. Request a new code."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if verification.verified_at:
            return Response(
                {"code": ["This email has already been verified. Continue creating your account."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if verification.attempts >= 5:
            return Response(
                {"code": ["Too many incorrect attempts. Request a new verification code."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not check_password(data["code"], verification.code_hash):
            verification.attempts += 1
            verification.save(update_fields=["attempts"])
            return Response(
                {"code": ["The verification code is incorrect."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        verification.verified_at = timezone.now()
        verification.expires_at = verification.verified_at + timedelta(minutes=15)
        verification.save(update_fields=["verified_at", "expires_at"])
        verification_token = signing.dumps(
            {"verification_id": verification.pk, "email": verification.email},
            salt="trackit-signup-email-verification",
        )
        return Response(
            {
                "detail": "Email verified. You can now create your password.",
                "verification_token": verification_token,
            },
            status=status.HTTP_200_OK,
        )


class RoleUpdateSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=("ADMIN", "USER"))


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, trim_whitespace=False)


class RegisterView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    @transaction.atomic
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(
            {"detail": "Account created successfully. You can now sign in."},
            status=status.HTTP_201_CREATED,
        )


class CurrentUserView(APIView):
    authentication_classes = [ActiveTokenAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response({"user": user_payload(request.user)})


class PasswordResetRequestView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip().lower()
        user = User.objects.filter(email__iexact=email, is_active=True).first()

        if user:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            reset_url = (
                f"{settings.FRONTEND_URL.rstrip('/')}/reset-password/"
                f"#{urlencode({'uid': uid, 'token': token})}"
            )
            send_mail(
                subject="Reset your TrackIt password",
                message=(
                    "We received a request to reset your TrackIt password. "
                    f"Use this link to choose a new password:\n\n{reset_url}\n\n"
                    "If you did not request this, you can ignore this email."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL or None,
                recipient_list=[user.email],
                fail_silently=False,
            )

        return Response(
            {"detail": "If an account exists for that email, a password reset link has been sent."},
            status=status.HTTP_200_OK,
        )


class PasswordResetConfirmView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            uid = force_str(urlsafe_base64_decode(data["uid"]))
            user = User._default_manager.get(pk=uid, is_active=True)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise ValidationError({"detail": "This password reset link is invalid or expired."})

        if not default_token_generator.check_token(user, data["token"]):
            raise ValidationError({"detail": "This password reset link is invalid or expired."})

        try:
            validate_password(data["new_password"], user=user)
        except DjangoValidationError as exc:
            raise ValidationError({"new_password": exc.messages}) from exc

        user.set_password(data["new_password"])
        user.save(update_fields=["password"])
        Token.objects.filter(user=user).delete()
        return Response(
            {"detail": "Your password has been reset. You can now sign in."},
            status=status.HTTP_200_OK,
        )


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
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Workspace.objects.filter(user=self.request.user)


class TaskListCreateView(generics.ListCreateAPIView):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsNotSuperuserCreatingTasks]

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
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
        return Task.objects.filter(workspace__user=self.request.user)

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
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

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
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        queryset = User.objects.annotate(
            workspace_count=Count("workspaces", distinct=True),
            task_count=Count("workspaces__tasks", distinct=True),
            admin_role=Exists(UserRole.objects.filter(user_id=OuterRef("pk"), role__name="Admin")),
            last_active_at=F("trackit_role__last_active_at"),
        ).order_by("-date_joined")
        if not self.request.user.is_superuser:
            queryset = queryset.filter(is_superuser=False)
        search = self.request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(
                Q(username__icontains=search)
                | Q(first_name__icontains=search)
                | Q(last_name__icontains=search)
                | Q(email__icontains=search)
            )
        return queryset


class AdminUserRoleUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsSuperAdmin]

    @transaction.atomic
    def patch(self, request, user_id):
        target = get_object_or_404(User, pk=user_id)
        if target.is_superuser:
            raise ValidationError({"role": "Superuser roles are managed through Django."})

        serializer = RoleUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role_name = (
            Role.RoleName.ADMIN
            if serializer.validated_data["role"] == "ADMIN"
            else Role.RoleName.USER
        )
        role, _ = Role.objects.get_or_create(name=role_name)
        UserRole.objects.update_or_create(user=target, defaults={"role": role})
        return Response({"user": user_payload(target)}, status=status.HTTP_200_OK)


class AdminTaskListView(generics.ListAPIView):
    serializer_class = AdminTaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]

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


def _oauth_redirect_uri(request, provider):
    return request.build_absolute_uri(
        reverse(f"oauth-{provider}-callback")
    )


def _frontend_token_redirect(token):
    # URL fragment is not sent in the HTTP request to the server.
    return redirect(f"{settings.FRONTEND_URL.rstrip('/')}/login#token={token}")


def _get_or_create_social_user(provider, provider_id, email, name=""):
    User = get_user_model()

    with transaction.atomic():
        social_account = (
            SocialAccount.objects.select_related("user")
            .filter(provider=provider, provider_user_id=str(provider_id))
            .first()
        )

        if social_account:
            return social_account.user

        # Only link an existing account when the provider supplied
        # a verified email address.
        if email:
            user = User.objects.filter(email__iexact=email).first()
        else:
            user = None

        if user:
            # Do not silently attach a social login to an existing
            # account solely because an email address matches.
            raise ValueError(
                "An account with this email already exists. "
                "Sign in using the existing account first."
            )

        username_base = (email.split("@")[0] if email else name) or provider
        username_base = "".join(
            c for c in username_base if c.isalnum() or c in "._-"
        )[:120] or provider

        username = username_base
        suffix = 1
        while User.objects.filter(username=username).exists():
            username = f"{username_base[:110]}_{suffix}"
            suffix += 1

        user = User.objects.create_user(
            username=username,
            email=email or "",
        )

        SocialAccount.objects.create(
            user=user,
            provider=provider,
            provider_user_id=str(provider_id),
            email=email or "",
        )

        return user


def _issue_social_token(user):
    token, _ = Token.objects.get_or_create(user=user)
    return token.key


def _oauth_error_redirect():
    return redirect(f"{settings.FRONTEND_URL.rstrip('/')}/login?oauth_error=failed")


def _google_verified_email(userinfo):
    email = userinfo.get("email", "")
    verified = userinfo.get("email_verified", False)
    return email if email and verified else ""


def _github_verified_email(client, token):
    response = client.get("user/emails", token=token)
    response.raise_for_status()

    emails = response.json()
    for item in emails:
        if item.get("primary") and item.get("verified"):
            return item.get("email", "")

    return ""


def _start_oauth(request, provider):
    if provider == "google":
        client = oauth.google
    else:
        client = oauth.github

    if not client.client_id or not client.client_secret:
        return _oauth_error_redirect()

    return client.authorize_redirect(
        request,
        _oauth_redirect_uri(request, provider),
    )


def _finish_oauth(request, provider):
    client = oauth.google if provider == "google" else oauth.github

    try:
        token = client.authorize_access_token(request)

        if provider == "google":
            userinfo = token.get("userinfo")
            if not userinfo:
                userinfo = await_google_userinfo(client, token)

            provider_id = userinfo.get("sub")
            email = _google_verified_email(userinfo)
            name = userinfo.get("name", "")
        else:
            response = client.get("user", token=token)
            response.raise_for_status()
            profile = response.json()

            provider_id = profile.get("id")
            email = _github_verified_email(client, token)
            name = profile.get("login", "")

        if not provider_id:
            raise ValueError("The provider did not return a user ID.")

        user = _get_or_create_social_user(
            provider,
            provider_id,
            email,
            name,
        )
        return _frontend_token_redirect(_issue_social_token(user))

    except Exception:
        return _oauth_error_redirect()


def await_google_userinfo(client, token):
    response = client.get("userinfo", token=token)
    response.raise_for_status()
    return response.json()


def google_login(request):
    return _start_oauth(request, "google")


def google_callback(request):
    return _finish_oauth(request, "google")


def github_login(request):
    return _start_oauth(request, "github")


def github_callback(request):
    return _finish_oauth(request, "github")
class AdminTaskDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = AdminTaskSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminRole]
    queryset = Task.objects.select_related("workspace", "workspace__user").all()

    def perform_destroy(self, instance):
        owner = instance.workspace.user
        title = instance.title
        with transaction.atomic():
            Notification.objects.create(
                user=owner,
                task=instance,
                notification_type=Notification.Type.TASK_DELETED,
                message=f'Your task "{title}" was deleted by an administrator.',
            )
            instance.delete()
