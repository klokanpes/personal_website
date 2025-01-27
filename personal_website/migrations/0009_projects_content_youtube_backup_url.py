# Generated by Django 5.1.2 on 2025-01-16 13:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        (
            "personal_website",
            "0008_rename_current_month_email_counter_current_value_this_month_and_more",
        ),
    ]

    operations = [
        migrations.AddField(
            model_name="projects_content",
            name="youtube_backup_url",
            field=models.URLField(default="https://www.youtube.com/"),
            preserve_default=False,
        ),
    ]
