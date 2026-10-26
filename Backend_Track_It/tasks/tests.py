from datetime import timedelta
from unittest.mock import Mock, patch

from django.contrib import admin
from django.contrib.auth import get_user_model
from django.http import HttpResponseRedirect
from django.test import RequestFactory, TestCase
from django.utils import timezone
from rest_framework.test import APIClient

from .admin import (
    TaskAdmin,
    TrackItUserAdmin,
    demote_trackit_user,
    promote_trackit_admin,
)
from .models import Role, SocialAccount, Task, UserRole, Workspace
from .views import github_callback, google_callback


User = get_user_model()


class SocialSignInTests(TestCase):
    def setUp(self):
        self.request = RequestFactory().get("/api/auth/provider/callback/")
        self.request.session = {}

    @patch("tasks.views.oauth")
    def test_google_callback_creates_user_and_returns_auth_token(self, oauth_mock):
        google = Mock()
        google.authorize_access_token.return_value = {
            "userinfo": {
                "sub": "google-user-123",
                "email": "google@example.com",
                "email_verified": True,
                "name": "Google User",
            }
        }
        oauth_mock.google = google

        response = google_callback(self.request)

        self.assertEqual(response.status_code, 302)
        self.assertIn("/login#token=", response["Location"])
        user = User.objects.get(email="google@example.com")
        self.assertTrue(user.auth_token.key)
        self.assertTrue(
            SocialAccount.objects.filter(
                user=user,
                provider=SocialAccount.Provider.GOOGLE,
                provider_user_id="google-user-123",
            ).exists()
        )

    @patch("tasks.views.oauth")
    def test_github_callback_creates_user_and_returns_auth_token(self, oauth_mock):
        github = Mock()
        github.authorize_access_token.return_value = {"access_token": "provider-token"}
        profile_response = Mock()
        profile_response.json.return_value = {
            "id": 456,
            "login": "github-user",
        }
        email_response = Mock()
        email_response.json.return_value = [
            {
                "email": "github@example.com",
                "primary": True,
                "verified": True,
            }
        ]
        github.get.side_effect = [profile_response, email_response]
        oauth_mock.github = github

        response = github_callback(self.request)

        self.assertEqual(response.status_code, 302)
        self.assertIn("/login#token=", response["Location"])
        user = User.objects.get(email="github@example.com")
        self.assertTrue(user.auth_token.key)
        self.assertTrue(
            SocialAccount.objects.filter(
                user=user,
                provider=SocialAccount.Provider.GITHUB,
                provider_user_id="456",
            ).exists()
        )

    def test_existing_email_sign_in_returns_account_exists_error(self):
        User.objects.create_user(
            username="existing@example.com",
            email="existing@example.com",
            password="Safe-test-password-42!",
        )
        google = Mock()
        google.authorize_access_token.return_value = {
            "userinfo": {
                "sub": "google-existing-user",
                "email": "existing@example.com",
                "email_verified": True,
            }
        }

        with patch("tasks.views.oauth") as oauth_mock:
            oauth_mock.google = google
            response = google_callback(self.request)

        self.assertEqual(response.status_code, 302)
        self.assertIn("oauth_error=account_exists", response["Location"])

    def test_signed_in_user_can_link_google_account(self):
        user = User.objects.create_user(
            username="existing@example.com",
            email="existing@example.com",
            password="Safe-test-password-42!",
        )
        client = APIClient()
        client.force_authenticate(user)

        ticket_response = client.post(
            "/api/auth/social-accounts/link-ticket/",
            {"provider": SocialAccount.Provider.GOOGLE},
            format="json",
        )
        self.assertEqual(ticket_response.status_code, 200)

        google = Mock()
        google.client_id = "google-client-id"
        google.client_secret = "google-client-secret"
        google.authorize_redirect.return_value = HttpResponseRedirect(
            "https://accounts.google.com/o/oauth2/auth"
        )
        google.authorize_access_token.return_value = {
            "userinfo": {
                "sub": "google-existing-user",
                "email": "existing@example.com",
                "email_verified": True,
            }
        }

        with patch("tasks.views.oauth") as oauth_mock:
            oauth_mock.google = google
            start_response = client.get(
                f"/api/auth/google/link/?ticket={ticket_response.data['ticket']}"
            )
            callback_response = client.get(
                "/api/auth/google/callback/?code=oauth-code&state=oauth-state"
            )

        self.assertEqual(start_response.status_code, 302)
        self.assertEqual(callback_response.status_code, 302)
        self.assertIn("social_linked=google", callback_response["Location"])
        self.assertTrue(
            SocialAccount.objects.filter(
                user=user,
                provider=SocialAccount.Provider.GOOGLE,
                provider_user_id="google-existing-user",
            ).exists()
        )

    def test_signed_in_user_can_link_github_account(self):
        user = User.objects.create_user(
            username="github@example.com",
            email="github@example.com",
            password="Safe-test-password-42!",
        )
        client = APIClient()
        client.force_authenticate(user)
        ticket_response = client.post(
            "/api/auth/social-accounts/link-ticket/",
            {"provider": SocialAccount.Provider.GITHUB},
            format="json",
        )
        github = Mock()
        github.client_id = "github-client-id"
        github.client_secret = "github-client-secret"
        github.authorize_redirect.return_value = HttpResponseRedirect(
            "https://github.com/login/oauth/authorize"
        )
        github.authorize_access_token.return_value = {"access_token": "provider-token"}
        profile_response = Mock()
        profile_response.json.return_value = {"id": 789, "login": "github-user"}
        email_response = Mock()
        email_response.json.return_value = [
            {
                "email": "github@example.com",
                "primary": True,
                "verified": True,
            }
        ]
        github.get.side_effect = [profile_response, email_response]

        with patch("tasks.views.oauth") as oauth_mock:
            oauth_mock.github = github
            start_response = client.get(
                f"/api/auth/github/link/?ticket={ticket_response.data['ticket']}"
            )
            callback_response = client.get(
                "/api/auth/github/callback/?code=oauth-code&state=oauth-state"
            )

        self.assertEqual(start_response.status_code, 302)
        self.assertEqual(callback_response.status_code, 302)
        self.assertIn("social_linked=github", callback_response["Location"])
        self.assertTrue(
            SocialAccount.objects.filter(
                user=user,
                provider=SocialAccount.Provider.GITHUB,
                provider_user_id="789",
            ).exists()
        )

    def test_link_ticket_requires_authentication(self):
        response = APIClient().post(
            "/api/auth/social-accounts/link-ticket/",
            {"provider": SocialAccount.Provider.GOOGLE},
            format="json",
        )

        self.assertEqual(response.status_code, 401)


class RoleAccessTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="user@example.com",
            email="user@example.com",
            password="Strong-password-42!",
        )
        self.admin = User.objects.create_user(
            username="admin@example.com",
            email="admin@example.com",
            password="Strong-password-42!",
        )
        admin_role, _ = Role.objects.get_or_create(name=Role.RoleName.ADMIN)
        UserRole.objects.update_or_create(user=self.admin, defaults={"role": admin_role})
        self.superadmin = User.objects.create_superuser(
            username="superadmin@example.com",
            email="superadmin@example.com",
            password="Strong-password-42!",
        )
        self.user_workspace = Workspace.objects.create(user=self.user, name="User workspace")
        self.admin_workspace = Workspace.objects.create(user=self.admin, name="Admin workspace")
        self.user_task = Task.objects.create(
            workspace=self.user_workspace,
            title="User task",
            due_date=timezone.now() + timedelta(days=1),
        )
        self.admin_task = Task.objects.create(
            workspace=self.admin_workspace,
            title="Admin task",
            due_date=timezone.now() + timedelta(days=1),
        )

    def test_registration_cannot_assign_admin_role(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "full_name": "New Account",
                "email": "new@example.com",
                "password": "Unrelated-strong-42!value",
                "terms_accepted": True,
                "role": "ADMIN",
                "is_superuser": True,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.data["user"]["role"], "USER")
        self.assertFalse(response.data["user"]["is_admin"])
        self.assertFalse(response.data["user"]["is_superuser"])

    def test_user_cannot_access_admin_endpoint(self):
        self.client.force_authenticate(self.user)

        response = self.client.get("/api/admin/tasks/")

        self.assertEqual(response.status_code, 403)

    def test_admin_can_view_all_tasks_only_through_admin_endpoint(self):
        self.client.force_authenticate(self.admin)

        admin_response = self.client.get("/api/admin/tasks/")
        normal_response = self.client.get("/api/tasks/")
        other_task_response = self.client.get(f"/api/tasks/{self.user_task.pk}/")

        self.assertEqual(admin_response.status_code, 200)
        self.assertEqual(
            {task["id"] for task in admin_response.data},
            {self.user_task.pk, self.admin_task.pk},
        )
        self.assertEqual(normal_response.status_code, 200)
        self.assertEqual([task["id"] for task in normal_response.data], [self.admin_task.pk])
        self.assertEqual(other_task_response.status_code, 404)

    def test_admin_cannot_change_roles(self):
        self.client.force_authenticate(self.admin)

        response = self.client.patch(
            f"/api/admin/users/{self.user.pk}/role/",
            {"role": "ADMIN"},
            format="json",
        )

        self.assertEqual(response.status_code, 403)

    def test_superadmin_can_promote_user(self):
        self.client.force_authenticate(self.superadmin)

        response = self.client.patch(
            f"/api/admin/users/{self.user.pk}/role/",
            {"role": "ADMIN"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["user"]["role"], "ADMIN")
        self.assertTrue(response.data["user"]["is_admin"])

    def test_staff_flag_alone_does_not_grant_admin_api_access(self):
        staff_user = User.objects.create_user(
            username="staff@example.com",
            email="staff@example.com",
            password="Strong-password-42!",
            is_staff=True,
        )
        self.client.force_authenticate(staff_user)

        response = self.client.get("/api/admin/tasks/")

        self.assertEqual(response.status_code, 403)
        request = RequestFactory().get("/admin/")
        request.user = staff_user
        self.assertFalse(admin.site.has_permission(request))

    def test_superadmin_can_access_django_admin_site(self):
        request = RequestFactory().get("/admin/")
        request.user = self.superadmin

        self.assertTrue(admin.site.has_permission(request))

    def test_django_admin_exposes_user_management_and_read_only_task_oversight(self):
        self.client.force_login(self.superadmin)

        users_response = self.client.get("/admin/auth/user/")
        tasks_response = self.client.get("/admin/tasks/task/")
        request = RequestFactory().get("/admin/")
        request.user = self.superadmin
        user_admin = TrackItUserAdmin(User, admin.site)
        task_admin = TaskAdmin(Task, admin.site)

        self.assertEqual(users_response.status_code, 200)
        self.assertContains(users_response, "Promote selected users to Track-It admin")
        self.assertTrue(user_admin.has_delete_permission(request))
        self.assertEqual(tasks_response.status_code, 200)
        self.assertFalse(task_admin.has_add_permission(request))
        self.assertFalse(task_admin.has_delete_permission(request))

    def test_django_admin_can_promote_and_demote_users(self):
        modeladmin = Mock()

        promote_trackit_admin(
            modeladmin,
            object(),
            User.objects.filter(pk=self.user.pk),
        )
        self.user.refresh_from_db()
        self.assertEqual(self.user.trackit_role.role.name, Role.RoleName.ADMIN)

        demote_trackit_user(
            modeladmin,
            object(),
            User.objects.filter(pk=self.user.pk),
        )
        self.user.refresh_from_db()
        self.assertEqual(self.user.trackit_role.role.name, Role.RoleName.USER)
        modeladmin.message_user.assert_called()

    def test_django_admin_role_actions_do_not_change_superusers(self):
        modeladmin = Mock()

        promote_trackit_admin(
            modeladmin,
            object(),
            User.objects.filter(pk=self.superadmin.pk),
        )

        self.superadmin.refresh_from_db()
        self.assertTrue(self.superadmin.is_superuser)
        self.assertEqual(self.superadmin.trackit_role.role.name, Role.RoleName.USER)

    def test_superadmin_can_oversee_but_not_create_tasks(self):
        self.client.force_authenticate(self.superadmin)

        admin_response = self.client.get("/api/admin/tasks/")
        create_response = self.client.post(
            "/api/tasks/",
            {
                "workspace": self.admin_workspace.pk,
                "title": "Superadmin task",
                "due_date": (timezone.now() + timedelta(days=2)).isoformat(),
            },
            format="json",
        )

        self.assertEqual(admin_response.status_code, 200)
        self.assertEqual(create_response.status_code, 403)
