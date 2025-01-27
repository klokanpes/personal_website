# Generated by Django 5.1.2 on 2025-01-26 13:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("personal_website", "0012_darkmode_preference"),
    ]

    operations = [
        migrations.AlterField(
            model_name="blog_post",
            name="image_url",
            field=models.URLField(blank=True, max_length=400),
        ),
        migrations.AlterField(
            model_name="blog_post",
            name="source_url",
            field=models.URLField(blank=True, max_length=400),
        ),
    ]
