import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("tasks", "0003_role_useractivity_userrole"),
    ]

    operations = [
        migrations.AlterField(
            model_name="notification",
            name="notification_type",
            field=models.CharField(
                choices=[
                    ("due_2_days", "Due in 2 days"),
                    ("due_1_day", "Due in 1 day"),
                    ("overdue", "Overdue"),
                    ("in_progress", "In-progress reminder"),
                    ("task_deleted", "Task deleted"),
                ],
                max_length=30,
            ),
        ),
        migrations.AlterField(
            model_name="notification",
            name="task",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="notifications",
                to="tasks.task",
            ),
        ),
    ]
