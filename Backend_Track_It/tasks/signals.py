from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver

from .models import Role, UserRole


@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def assign_user_role(sender, instance, created, **kwargs):
    if not created:
        return

    role, _ = Role.objects.get_or_create(name=Role.RoleName.USER)

    UserRole.objects.get_or_create(
        user=instance,
        defaults={"role": role}
    )