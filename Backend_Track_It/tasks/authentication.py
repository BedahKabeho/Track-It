from django.utils import timezone
from rest_framework.authentication import SessionAuthentication, TokenAuthentication

from .models import UserRole


def record_user_activity(user):
    UserRole.objects.filter(user_id=user.pk).update(last_active_at=timezone.now())


class ActiveTokenAuthentication(TokenAuthentication):
    def authenticate(self, request):
        result = super().authenticate(request)
        if result is not None:
            record_user_activity(result[0])
        return result


class ActiveSessionAuthentication(SessionAuthentication):
    def authenticate(self, request):
        result = super().authenticate(request)
        if result is not None:
            record_user_activity(result[0])
        return result
