from django.shortcuts import render
from django.conf import settings
from rest_framework.decorators import throttle_classes, api_view
from rest_framework.response import Response
from website.throttling import GeneralRateThrottle, EmailRateThrottle, DownloadRateThrottle
from rest_framework.exceptions import Throttled
from django.core.paginator import Paginator
from django.http import FileResponse
import datetime
from email_validator import validate_email, EmailNotValidError
import asyncio
from mailjet_rest import Client
import logging
from rest_framework.response import Response


from .models import File, Blog_post, Homepage_content, About_me_content, Education, Work_experience, Hobbies, Projects_content, Contact_content, Message, Email_counter, Technology_experience, Terms_and_conditions_content, Terms_and_conditions_agreement, Darkmode_preference


# Ratelimit functionality adapted from: https://www.django-rest-framework.org/api-guide/throttling/
# Custom 404 adapted from: https://learndjango.com/tutorials/customizing-django-404-and-500-error-pages



mailjet_api_key_public = settings.MAILJET_API_KEY_PUBLIC
mailjet_api_key_secret = settings.MAILJET_API_KEY_SECRET

my_private_mail = settings.MY_PRIVATE_EMAIL_ADDRESS
my_public_mail = settings.MY_PUBLIC_EMAIL_ADDRESS
my_name = settings.MY_NAME

# Logging adapted from: https://docs.djangoproject.com/en/5.1/topics/logging/
console_logger = logging.getLogger("console_logger")
file_logger = logging.getLogger("file_logger")



def index(request):
    # This is to trigger the creation of a session cookie that I can later work with within some of my API views
    # created with help from: https://docs.djangoproject.com/en/5.1/topics/http/sessions/
    if not request.session.session_key:
        request.session.create()

    return render(request, "personal_website/index.html")
    
    
""" All of the following views are API endpoints """

@api_view(["GET"])
@throttle_classes([GeneralRateThrottle])
def file(request):
    try:
        """
        There is a common logic in all API endpoint views handled by throttling applied through Django REST framework. It would
        work even without these try/except blocks but I would like to catch the instances it gets triggered for logging purposes.
        """
        # return a json response to show the file availability
        try:
            this_file = File.objects.get()
        except File.DoesNotExist:
            error_log("error", "Not-existing file has been requested for download.")
            # Because I have to use the DRF decorators for throttling to work, I also have to use the DRF Response
            return Response({"message": "File does not exist."}, status=404)
        
        return Response({"file": [this_file.serialize()]}, status=200)
    except Throttled:
        error_log("critical", "Throttling has been triggered in file GET request.")
        return Response({"error": "Too many requests."}, status=429)


@api_view(["GET"])
@throttle_classes([DownloadRateThrottle])    
def file_download(request):
    try:
        # return FileResponse to download the file - from: https://docs.djangoproject.com/en/5.1/ref/request-response/
        try:
            this_file = File.objects.get()
        except File.DoesNotExist:
            error_log("error", "Not-existing file has been requested for download.")
            return Response({"message": "File does not exist."}, status=404)
        error_log("warning", "CV was downloaded.")
        return FileResponse(open(this_file.file.path, "rb"), as_attachment=True, filename=f"{this_file.name}", status=200)
    except Throttled:
        error_log("critical", "Throttling has been triggered in file download request.")
        return Response({"error": "Too many requests."}, status=429)
    

@api_view(["GET"])
@throttle_classes([GeneralRateThrottle])
def blog_post(request, page_num=1):
    try:
        # return a json response with all of the blog posts
        try:
            posts = Blog_post.objects.all()
            if len(posts) == 0:
                raise Blog_post.DoesNotExist
        except Blog_post.DoesNotExist:
            return Response({"message": "No posts."}, status=404)

        # return content
        # order posts in reverse chronological order
        posts = posts.order_by("-timestamp").all()
        # paginator class instance, one post per page
        paginator = Paginator(posts, 1)
        # error checking whether the input is an int
        try:
            page_number = int(page_num)
        except ValueError:
            # if not, error
            error_log("warning", "A blog page was requested without a number of a page as an argument.")
            return Response({"error": "You must provide a number."}, status=400)
        number_of_pages = paginator.num_pages
        if number_of_pages > paginator.num_pages:
            # error checking, whether I have such a page, if not, error
            error_log("warning", "A non-existent blog page has been requested.")
            return Response({"error": "This page does not exist."}, status=404)
        # fill this_page with the content given by the paginator class
        this_page = paginator.page(page_number)
        # serialize the contents of this_page
        this_page = [page.serialize() for page in this_page]
        # set the content of the response
        response = {
            "posts": this_page,
            "number_of_pages": number_of_pages,
            "this_page_number": page_number
        }
        # return the content
        return Response(response, status=200)
    except Throttled:
        error_log("critical", "Throttling has been triggered in blogs.")
        return Response({"error": "Too many requests."}, status=429)
    

@api_view(["GET"])
@throttle_classes([GeneralRateThrottle])
def homepage_content(request):
    try:
        # return a json response with the content of the main page
        try:
            site_content = Homepage_content.objects.get()
        except Homepage_content.DoesNotExist:
            return Response({"message": "There is no content."}, status=404)
        # return content in markdown format and transform it into html client side to reduce server load.
        response = [site_content.serialize()]
        return Response(response, status=200)
    except Throttled:
        error_log("critical", "Throttling has been triggered in homepage content request.")
        return Response({"error": "Too many requests."}, status=429)
    
@api_view(["GET"])    
@throttle_classes([GeneralRateThrottle])
def about_me_content(request):
    try:
        response = []
        # adds to the response by appending valid information
        try:
            about_me = About_me_content.objects.get()
            response.append({"about_me_content": [about_me.serialize()]})
        except About_me_content.DoesNotExist:
            response.append({"about_me_content": ""})
        
        try:
            technology_experience = Technology_experience.objects.all()
            if len(technology_experience) == 0:
                raise Technology_experience.DoesNotExist
            technology_experience = technology_experience.order_by("name").all()
            response.append({"technology_experience": [experience.serialize() for experience in technology_experience]})
        except Technology_experience.DoesNotExist:
            response.append({"technology_experience": ""})

        try:
            education = Education.objects.all()
            if len(education) == 0:
                raise Education.DoesNotExist
            education = education.order_by("-date_from").all()
            response.append({"education": [entry.serialize() for entry in education]})
        except Education.DoesNotExist:
            response.append({"education": ""})

        try:
            work_experience = Work_experience.objects.all()
            if len(work_experience) == 0:
                raise Work_experience.DoesNotExist
            work_experience = work_experience.order_by("-date_to").all()
            response.append({"work_experience": [experience.serialize() for experience in work_experience]})
        except Work_experience.DoesNotExist:
            response.append({"work_experience": ""})

        try: 
            hobbies = Hobbies.objects.all()
            if len(hobbies) == 0:
                raise Hobbies.DoesNotExist
            hobbies = hobbies.order_by("name").all()
            response.append({"hobbies": [hobby.serialize() for hobby in hobbies]})
        except Hobbies.DoesNotExist:
            response.append({"hobbies": ""})

        # return json response with the content of the about_me page and include Education, Work Experience and Hobbies in the response
        return Response(response, status=200)
    except Throttled:
        error_log("critical", "Throttling has been triggered in about_me section.")
        return Response({"error": "Too many requests."}, status=429)


@api_view(["GET"])
@throttle_classes([GeneralRateThrottle])
def projects_content(request, page_num=1):
    try:            
        projects = Projects_content.objects.all()
        if not projects:
            return Response({"message": "There are no projects."}, status=404)
        
        projects = projects.order_by("-created").all()
        
        paginator = Paginator(projects, 10)

        try: 
            page_number = int(page_num)
        except ValueError:
            error_log("warning", "A page was requested in projects without a page number in the int format being provided.")
            return Response({"error": "You must provide a number."}, status=400)
        
        number_of_pages = paginator.num_pages
        if number_of_pages > paginator.num_pages:
            # error checking, whether I have such a page, if not, error
            error_log("warning", "Invalid page number was requested from projects content.")
            return Response({"error": "This page does not exist."}, status=406)
        # fill this_page with the content given by the paginator class
        this_page = paginator.page(page_number)
        # serialize the contents of this_page
        this_page = [page.serialize() for page in this_page]
        # set the content of the response
        response = {
            "projects": this_page,
            "number_of_pages": number_of_pages,
            "this_page_number": page_number
        }
        # return the content
        return Response(response, status=200)
    except Throttled:
        error_log("critical", "Throttling has been triggered in projects.")
        return Response({"error": "Too many requests."}, status=429)
    

@api_view(["GET"])
@throttle_classes([GeneralRateThrottle])
def contact_content(request):
    try:
        try:
            contact = Contact_content.objects.get()
        except Contact_content.DoesNotExist:
            return Response({"message": "No contact info."}, status=404)
        
        response = [contact.serialize()]

        # return a json response with the content of the contact page together with social links(github and linkedin)
        return Response(response, status=200)
        # return content in markdown format and transform it into html client side to reduce server load.
    except Throttled:
        error_log("critical", "Throttling has been triggered in contact info.")
        return Response({"error": "Too many requests."}, status=429)
    

@api_view(["POST"])
@throttle_classes([EmailRateThrottle])
def email(request):
    try:
        # set max variables
        maximum_allowed_emails_per_month = 6000
        maximum_allowed_emails_per_day = 200

        # get todays date
        today = datetime.date.today()

        # initiate email sending flag to false
        can_send_email = False
        # initiate empty error_message string
        error_message = ""
        
        # get the contents of the json request
        data = request.data
        sender_name = data.get("name")
        sender_header = data.get("header")
        sender_email = data.get("email")
        sender_message_content = data.get("content")

        # validate the senders email - especially for deliverability
        # email validation adapted from: https://pypi.org/project/email-validator/
        try:
            sender_email_info = validate_email(sender_email, check_deliverability=True)
            sender_email = sender_email_info.normalized
        except EmailNotValidError as email_validation_error:
            # if invalid, return error
            error_log("warning", f"Email validation error: {email_validation_error}")
            return Response({"error": f"Email validation failed. Error: {email_validation_error}"}, status=400)

        # Instantiate a new instance of a message class
        new_message = Message(name=sender_name, email=sender_email, header=sender_header, message_content=sender_message_content)

        # now error checking - get the information about the last sent email
        try:
            last_request = Email_counter.objects.get()
            if last_request == "":
                raise Email_counter.DoesNotExist
        except Email_counter.DoesNotExist:
            # if there is none, create it
            last_request = Email_counter.objects.create(current_value_today=0,current_value_this_month=0, date=today)

        """
        logic that gets the last inputed value from EmailCounter, checks whether it is still the same month as in the counter and then
        # increments the last value by two (one email is sent to me as an alert, one is sent to the sender as confirmation) if it is still the same month
        # or sets it to 2 if it is month+n
        # lastly it returns true if the number of sent messages is lower that set treshold or false if it is not. 
        # all other functionality of this function is within this if block. If it returns false, it should also return a Jsonresponse with the error - no more messages for this month
        """
        # Write the actual cases these if statements accomplish!!! To be sure there is everything.
        # if month and year are the same
        if today.month == last_request.date.month and today.year == last_request.date.year:
            # if they are the same as today
            if today.day == last_request.date.day:
                # if there is still available capacity
                if (last_request.current_value_today + 2) <= maximum_allowed_emails_per_day and (last_request.current_value_this_month + 2) <= maximum_allowed_emails_per_month:
                    last_request.current_value_today += 2
                    last_request.current_value_this_month += 2
                    can_send_email = True
                else:
                    error_log("critical", f"No more email capacity today({last_request.date}).")
                    error_message = "No more available email capacity."
            # if it is a different day in the same month and year
            else:
                # if there is available capacity
                if (last_request.current_value_this_month + 2) <= maximum_allowed_emails_per_month:
                    last_request.current_value_today = 2
                    last_request.current_value_this_month += 2
                    can_send_email = True
                else:
                    error_log("critical", f"No more available email capacity this month({last_request.date.month}/{last_request.date.year})")
                    error_message = "No more available email capacity."
        # if month is different but still within the same year, or a different year - main thing is that month is different
        else:
            # initialize everything to base values and change flag
            last_request.current_value_today = 2
            last_request.current_value_this_month = 2
            can_send_email = True

        # if everything went well, save the current values
        if can_send_email == True:
            last_request.date = today
            last_request.last_edited = datetime.datetime.now()
            last_request.save()

            if new_message.is_valid_message():
                # if new message is valid, save it
                new_message.save()

                # and asynchronously call the send email function, based on: https://docs.python.org/3.10/library/asyncio.html
                asyncio.run(send_email(new_message.name, new_message.header, new_message.email, new_message.message_content))
                error_log("warning", f"Email service triggered. Remaining values of emails today ({last_request.date.day}/{last_request.date.month}) - {200 - last_request.current_value_today}, this month ({last_request.date.month}/{last_request.date.year}) - {6000-last_request.current_value_this_month}")
                return Response({"message": "Your message was sent."}, status=201)
            else:
                # if invalid, return error
                return Response({"error": "Invalid message content."}, status=400)

        else:
            # if the can_send_email flag is still false, return the error.
            return Response({"error": error_message}, status=418)
    except Throttled:
        error_log("critical", "Throttling has been triggered in message sending.")
        return Response({"error": "Too many requests."}, status=429)
    

async def send_email(email_name, email_header, email_address, email_content):
    # based on: https://docs.python.org/3.10/library/asyncio.html
    try:
        await send_confirmation_email(email_name, email_header, email_address, email_content)
        await send_email_to_me(email_name, email_header, email_address, email_content)
    except Exception as error:
        error_log("error", f"An error occured while sending email messages: {error}")


async def send_confirmation_email(email_name, email_header, email_address, email_content):
    # The following code is adapted from the official mailjet documentation.
    """
    This call sends a message to the sender of the message as a confirmation.
    """
    api_key = mailjet_api_key_public
    api_secret = mailjet_api_key_secret
    mailjet = Client(auth=(api_key, api_secret), version='v3.1')
    data = {
    'Messages': [
            {
                "From": {
                    "Email": my_public_mail,
                    "Name": my_name
                },
                "To": [
                    {
                        "Email": email_address,
                        "Name": email_name
                    }
                ],
                "TemplateID": 6632436,
                "TemplateLanguage": True,
                "Subject": "Sent Message Confirmation",
                "Variables": {
                    "email_content": email_content,
                    "email_header": email_header
                    }
            }
        ]
    }
    result = mailjet.send.create(data=data)
    if result.status_code != 200 and result.status_code != 201:
        error_log("error", f"An error occured while sending confirmation mail. Error: {result.status_code}, Content: {result.json()}")


async def send_email_to_me(email_name, email_header, email_address, email_content):
    # The following code is adapted from mailjet official documentation
    """
    This call sends a message to me with the content of the new message from the user.
    """
    api_key = mailjet_api_key_public
    api_secret = mailjet_api_key_secret
    mailjet = Client(auth=(api_key, api_secret), version='v3.1')
    data = {
    'Messages': [
            {
                "From": {
                    "Email": my_public_mail,
                    "Name": my_name
                },
                "To": [
                    {
                        "Email": my_private_mail,
                        "Name": "Receiver"
                    }
                ],
                "TemplateID": 6632510,
                "TemplateLanguage": True,
                "Subject": "Sent Message Confirmation",
                "Variables": {
                    "email_content": email_content,
                    "email_header": email_header,
                    "email_address": email_address,
                    "email_sender_name": email_name
                    }
            }
        ]
    }
    result = mailjet.send.create(data=data)
    if result.status_code != 200 and result.status_code != 201:
        error_log("error", f"An error occured while sending confirmation mail. Error: {result.status_code}, Content: {result.json()}")


def error_log(level, error_message):
    # This is a helper function for logging purposes
    if level == "critical":
        console_logger.critical(error_message)
        file_logger.critical(error_message)
    elif level == "error":
        console_logger.error(error_message)
        file_logger.error(error_message)
    else:
        console_logger.warning(error_message)
        file_logger.warning(error_message)


@api_view(["POST"])
def frontend_error_log(request):
    # this function receives a POST request from the frontend with the contents of an error that happened in the frontend and logs it
    try:
        data = request.data
        error_message = data.get("error_message")
        file_logger.error(f"FRONTEND ERROR: {error_message}")
        console_logger.error(f"FRONTEND ERROR: {error_message}")
        return Response({"success": "Error was logged."}, status=201)
    except Exception as this_error:
        return Response({"error": f"An error occured during logging FRONTEND errors and nothing was logged. Error: {this_error}"}, status=500)
    

def error_render(request, error_header, error_message, error_status):
    # This function renders an error page based on an API fetch request. I created it but it ended up not getting used yet.
    error_log("warning", f"Error page rendered. Header: {error_header}, message: {error_message}, status: {error_status}")
    return render(request, "personal_website/error.html", {
            "error_title": error_header,
            "error_content": error_message,
            "error_status": error_status
        })


@api_view(["GET"])
@throttle_classes([GeneralRateThrottle])
def get_cookie_preferences(request):
    # this function gets called by the frontend, searches for the value of the clients session cookie in the database. If there is one, it returns this clients cookie preferences. If there is 
    # not one, it returns the fact, so that a cookie consent dialogue can be displayed
    try:
        this_session_id = request.session.session_key
        try:
            this_session = Terms_and_conditions_agreement.objects.get(session_cookie=this_session_id)
        except Terms_and_conditions_agreement.DoesNotExist:
            return Response({"not_found": "No valid session id found."}, status=200)
        response = [this_session.serialize()]
        return Response(response, status=200)
    except Throttled:
        error_log("critical", "Throttling has been triggered in getting cookie preferences.")
        return Response({"error": "Too many requests."}, status=429)


@api_view(["POST"])
@throttle_classes([GeneralRateThrottle])
def set_cookie_preferences(request):
    # this function gets called by the frontend and saves the value of the users session cookie together with their preferences regarding the use of other cookies
    try:
        this_session_id = request.session.session_key
        data = request.data
        ga4_consent = data.get("ga4_consent")
        try:
            new_cookie_preference = Terms_and_conditions_agreement.objects.get(session_cookie=this_session_id)
            new_cookie_preference.delete()
            raise Terms_and_conditions_agreement.DoesNotExist
        except Terms_and_conditions_agreement.DoesNotExist:
            new_cookie_preference = Terms_and_conditions_agreement(session_cookie=this_session_id, ga4_agreement=ga4_consent)
        if new_cookie_preference.is_valid_terms_and_conditions_agreement():
            new_cookie_preference.save()
            return Response({"success": "Your cookie preferences were saved."}, status=201)
        else:
            return Response({"error": "Invalid input."}, status=400)
    except Throttled:
        error_log("critical", "Throttling has been triggered in setting cookie preferences.")
        return Response({"error": "Too many requests."}, status=429)
    

@api_view(["GET"])
@throttle_classes([GeneralRateThrottle])
def get_terms_and_conditions_content(request):
    # this function returns the content of the terms and conditions in json format
    try:
        try:
            site_content = Terms_and_conditions_content.objects.get()
        except Terms_and_conditions_content.DoesNotExist:
            return Response({"message": "There is no content."}, status=404)
        # return content in markdown format and transform it into html client side to reduce server load.
        response = site_content.content
        return Response(response, status=200)
    except Throttled:
        error_log("critical", "Throttling has been triggered in Terms and Conditions.")
        return Response({"error": "Too many requests."}, status=429)
    

@api_view(["GET"])
@throttle_classes([GeneralRateThrottle])
def get_darkmode_preference(request):
    # this function allows the darkmode to be persistent within the session
    # This one in particular returns whether there is a session key stored in the DB together with the appropriate darkmore setting
    try:
        this_session_id = request.session.session_key
        try:
            darkmode_preference = Darkmode_preference.objects.get(session_cookie=this_session_id)
        except Darkmode_preference.DoesNotExist:
            return Response({"message": "No preference"}, status=200)
        # return content in markdown format and transform it into html client side to reduce server load.
        response = darkmode_preference.serialize()
        return Response(response, status=200)
    except Throttled:
        error_log("critical", "Throttling has been triggered in Terms and Conditions.")
        return Response({"error": "Too many requests."}, status=429)

@api_view(["POST"])
@throttle_classes([GeneralRateThrottle])
def set_darkmode_preference(request):
    # This function allows saving the preffered settings of the dark mode so that it can be persisten. 
    # Whenever the color change is made, a fetch POST request is made to this endpoint to store the settings.
    try:
        this_session_id = request.session.session_key
        data = request.data
        darkmode_preference = data.get("darkmode_preference")
        try:
            # if there is a value, delete it and create new, if there is not, the DoesNotExist will be raised anyway
            new_darkmode_preference = Darkmode_preference.objects.get(session_cookie=this_session_id)
            new_darkmode_preference.delete()
            raise Darkmode_preference.DoesNotExist
        except Darkmode_preference.DoesNotExist:
            new_darkmode_preference = Darkmode_preference(session_cookie=this_session_id, darkmode=darkmode_preference)
        if new_darkmode_preference.is_valid_darkmode_prederence():
            new_darkmode_preference.save()
            return Response({"success": f"Your darkmode preference was saved. Current value: {darkmode_preference}"}, status=201)
        else:
            return Response({"error": "Invalid input."}, status=400)
    except Throttled:
        error_log("critical", "Throttling has been triggered in setting cookie preferences.")
        return Response({"error": "Too many requests."}, status=429)