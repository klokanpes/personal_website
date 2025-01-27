from django.contrib import admin
from .models import File, Blog_post, Homepage_content, About_me_content, Technology_experience, Education, Work_experience, Hobbies, Projects_content, Contact_content, Message, Email_counter, Terms_and_conditions_content, Terms_and_conditions_agreement
# Register your models here.

class Blog_post_admin(admin.ModelAdmin):
    list_display = ("id", "title", "content", "image", "image_url", "source_url")

admin.site.register(File)
admin.site.register(Blog_post, Blog_post_admin)
admin.site.register(Homepage_content)
admin.site.register(About_me_content)
admin.site.register(Technology_experience)
admin.site.register(Education)
admin.site.register(Work_experience)
admin.site.register(Hobbies)
admin.site.register(Projects_content)
admin.site.register(Contact_content)
admin.site.register(Message)
admin.site.register(Email_counter)
admin.site.register(Terms_and_conditions_content)
admin.site.register(Terms_and_conditions_agreement)