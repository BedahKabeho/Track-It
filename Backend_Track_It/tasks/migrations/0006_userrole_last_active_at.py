from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("tasks", "0005_merge_0004_backfill_user_roles_0004_socialaccount"),
    ]

    operations = [
        migrations.AddField(
            model_name="userrole",
            name="last_active_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
