from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("error/<str:error_header>/<str:error_message>/<int:error_status>", views.error_render, name="error_render"),

    # API routes
    path("check_file", views.file, name="file"),
    path("file_download", views.file_download, name="file_download"),
    path("blog_post/<int:page_num>", views.blog_post, name="blog_post"),
    path("homepage_content", views.homepage_content, name="homepage_content"),
    path("about_me_content", views.about_me_content, name="about_me_content"),
    path("projects_content/<int:page_num>", views.projects_content, name="projects_content"),
    path("contact_content", views.contact_content, name="contact_content"),
    path("email", views.email, name="email"),
    path("frontend_error", views.frontend_error_log, name="frontend_error_log"),
    path("get_terms_and_conditions_content", views.get_terms_and_conditions_content, name="get_terms_and_conditions_content"),
    path("set_cookie_preferences", views.set_cookie_preferences, name="set_cookie_preferences"),
    path("get_cookie_preferences", views.get_cookie_preferences, name="get_cookie_preferences"),
    path("set_darkmode_preference", views.set_darkmode_preference, name="set_darkmode_preference"),
    path("get_darkmode_preference", views.get_darkmode_preference, name="get_darkmode_preference"),
]


