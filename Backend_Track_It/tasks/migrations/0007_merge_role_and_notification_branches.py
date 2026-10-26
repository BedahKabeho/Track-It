from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("tasks", "0005_merge_0004_backfill_user_roles_0004_socialaccount"),
        ("tasks", "0006_task_deletion_notifications_per_owner"),
    ]

    operations = []
