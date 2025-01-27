# Generated by Django 5.1.2 on 2024-12-31 13:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("personal_website", "0002_about_me_content_github_url_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="EmailCounter",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("current_value", models.IntegerField()),
                ("current_month", models.IntegerField()),
                ("last_edited", models.DateField(auto_now_add=True)),
            ],
        ),
        migrations.RemoveField(
            model_name="contact_content",
            name="content",
        ),
        migrations.AddField(
            model_name="message",
            name="header",
            field=models.CharField(default="Default", max_length=200),
            preserve_default=False,
        ),
        migrations.AlterField(
            model_name="blog_post",
            name="title",
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name="education",
            name="name",
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name="file",
            name="name",
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name="hobbies",
            name="name",
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name="message",
            name="email",
            field=models.EmailField(max_length=200),
        ),
        migrations.AlterField(
            model_name="message",
            name="message_content",
            field=models.TextField(max_length=500),
        ),
        migrations.AlterField(
            model_name="message",
            name="name",
            field=models.CharField(max_length=200),
        ),
        migrations.AlterField(
            model_name="projects_content",
            name="name",
            field=models.CharField(max_length=300),
        ),
        migrations.AlterField(
            model_name="work_experience",
            name="name",
            field=models.CharField(max_length=200),
        ),
    ]
