from django.conf import settings
from django.db import migrations


def backfill_user_roles(apps, schema_editor):
    Role = apps.get_model("tasks", "Role")
    UserRole = apps.get_model("tasks", "UserRole")
    User = apps.get_model(*settings.AUTH_USER_MODEL.split("."))
    database = schema_editor.connection.alias
    roles = {
        role.name: role
        for role in Role.objects.using(database).all()
    }
    for name in ("Admin", "User"):
        if name not in roles:
            roles[name] = Role.objects.using(database).create(name=name)

    for user in User.objects.using(database).all().iterator():
        role_name = "Admin" if user.is_staff and not user.is_superuser else "User"
        user_role, created = UserRole.objects.using(database).get_or_create(
            user_id=user.pk,
            defaults={"role_id": roles[role_name].pk},
        )
        if (
            not created
            and role_name == "Admin"
            and user_role.role_id != roles["Admin"].pk
        ):
            user_role.role_id = roles["Admin"].pk
            user_role.save(using=database, update_fields=["role"])


class Migration(migrations.Migration):
    dependencies = [
        ("tasks", "0003_role_useractivity_userrole"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunPython(backfill_user_roles, migrations.RunPython.noop),
    ]
