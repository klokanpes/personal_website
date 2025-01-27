from django.db import models

# Create your models here.
class File(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    file = models.FileField(upload_to="uploads/")
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "timestamp": self.timestamp
        }
    
class Blog_post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(blank=True, upload_to="images/")
    image_url = models.URLField(blank=True, max_length=400)
    source_url = models.URLField(blank=True, max_length=400)

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "content": self.content,
            "timestamp": self.timestamp,
            "image": self.image.url if self.image else None,
            "image_url": self.image_url,
            "source_url": self.source_url
        }

class Homepage_content(models.Model):
    content = models.TextField()
    last_edited = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "content": self.content
        }

class About_me_content(models.Model):
    image = models.ImageField(upload_to="images/")
    content = models.TextField()
    github_url = models.URLField()
    linked_in_url = models.URLField()
    last_edited = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "content": self.content,
            "image_url": self.image.url,
            "github": self.github_url,
            "linkedin": self.linked_in_url
        }
    
class Technology_experience(models.Model):
    name = models.CharField(max_length=200, unique=True)
    description = models.TextField(blank=True)

    def serialize(self):
        return {
            "name": self.name,
            "description": self.description
        }
    
class Education(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    date_from = models.DateField()
    date_to = models.DateField()

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "date_from": self.date_from,
            "date_to": self.date_to
        }

class Work_experience(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    date_from = models.DateField()
    date_to = models.DateField()

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "date_from": self.date_from,
            "date_to": self.date_to
        }

class Hobbies(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description
        }

class Projects_content(models.Model):
    name = models.CharField(max_length=300)
    description = models.TextField()
    git_hub_url = models.URLField()
    youtube_url = models.TextField()
    youtube_backup_url = models.URLField()
    created = models.DateField()

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "git_hub": self.git_hub_url,
            "youtube": self.youtube_url,
            "youtube_backup": self.youtube_backup_url,
            "created": self.created
        }

class Contact_content(models.Model):
    last_edited = models.DateTimeField(auto_now_add=True)
    github_url = models.URLField()
    linked_in_url = models.URLField()

    def serialize(self):
        return {
            "github": self.github_url,
            "linked_in": self.linked_in_url
        }

class Message(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField(max_length=200)
    header = models.CharField(max_length=200)
    message_content = models.TextField(max_length=500)
    timestamp = models.DateTimeField(auto_now_add=True)

    def is_valid_message(self):
        return self.name != "" and self.email != "" and self.message_content != "" and self.header != ""
    

class Email_counter(models.Model):
    current_value_today = models.IntegerField()
    current_value_this_month = models.IntegerField()
    date = models.DateField()
    last_edited = models.DateField(auto_now_add=True)

class Terms_and_conditions_agreement(models.Model):
    session_cookie = models.TextField(unique=True)
    ga4_agreement = models.BooleanField()

    def serialize(self):
        return {
            "session_id": self.session_cookie,
            "ga4_agreement": self.ga4_agreement,
        }
    
    def is_valid_terms_and_conditions_agreement(self):
        return self.session_cookie != "" and (self.ga4_agreement == True or self.ga4_agreement == False)


class Terms_and_conditions_content(models.Model):
    content = models.TextField()

class Darkmode_preference(models.Model):
    # I realize that the last two models are storing redundant data. It would be better achieved by creating another table and using it
    #  as a foreign key, but... Well... Last minute change...
    session_cookie = models.TextField(unique=True)
    darkmode = models.BooleanField()

    def serialize(self):
        return {
            "session_id": self.session_cookie,
            "darkmode": self.darkmode,
        }
    def is_valid_darkmode_prederence(self):
        return self.session_cookie != "" and (self.darkmode == True or self.darkmode == False)  


