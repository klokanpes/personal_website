# Generated by Django 5.1.2 on 2025-01-16 11:43

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        (
            "personal_website",
            "0007_email_counter_current_year_projects_content_created",
        ),
    ]

    operations = [
        migrations.RenameField(
            model_name="email_counter",
            old_name="current_month",
            new_name="current_value_this_month",
        ),
        migrations.RenameField(
            model_name="email_counter",
            old_name="current_value",
            new_name="current_value_today",
        ),
        migrations.RemoveField(
            model_name="email_counter",
            name="current_year",
        ),
        migrations.AddField(
            model_name="email_counter",
            name="date",
            field=models.DateField(default=datetime.date(2025, 1, 16)),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="projects_content",
            name="youtube_url",
            field=models.TextField(),
        ),
    ]
