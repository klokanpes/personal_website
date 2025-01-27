# Personal website
This is a personal website that I made for myself. It contains information about me and should serve as an online business card, so to say. The primary intent of this application is to introduce myself, provide some information about the projects that I have worked on in the past and provide a means of contact. 

There is also a secondary purpose to this application. That is to show basic competency to work with technologies that are mentioned on the site as well as others. To achieve this goal, I have implemented additional functionality to show that I am able to look up documentation pertaining to technologies and their functions and implement them based on this documentation. 

## Overview
The application is mainly composed of two parts. The backend is made with Django and the frontend is made with plain JavaScript. The site is styled using CSS.

The application contains a landing page, a section "About Me" that serves as a more interactive version of a CV, and lastly the ability to download my CV. Then, there is a section titled "Projects" that contains information about projects I have already worked on in the past. At the moment of writing this text, it contains the final projects from other CS50 courses I took in the past. Then, there is a Blog section, so that I may share ideas, experiences and so on. Last but not least, there is a section called "Contact" which contains a contact form, through which it is possible to send an email to me. 

The application also contains a dark mode switch, which changes the color of all elements to a different tone. 

There is also a section called Terms and Conditions, which, at the time of writing this, contains only placeholder text that will have to be refined later according to GDPR, since I reside in the EU. 

Additional functionality is provided with a cookie consent modal, that pops up, when a user visits a site for the first time, when his browser window closes(for debugging) or when a session cookie expires(5 days). This is necessary to be in accordance with GDPR. Users are therefore informed that some form of cookies are used. The application uses a session cookie that allows me to "remember" their cookie preferences and a Google Analytics data layer is implemented, if the user agrees with it. 

Lastly, there are links to my social network accounts in the footer. 

As it stands, the application runs on javascript, that is imported into index.html and fills it with content through fetch requests to API enpoints in the backend. This functionality is implemented with the use of Django Rest Framework(DRF), which is being used together with regular Django. This is so because I wanted to, and did, implement rate limiting. At the moment, rate limiting is set up through the DRF. There are three limits. 1000 request per day for regular API endpoints, and 3 request per day for sending emails and downloading the CV. This seems reasonable for me. 

The email sending functionality is implemented in the backend through Mailjet service. The backend logs when an email is sent and guards against overuse since there are limits.

Logging functionality is implemented through Django and the application logs mostly errors that may occur and the email service usage, so that I can be kept informed about its usage and how much of the limit there is left to use. 

## Technologies used
As said previously, the main functionality of the app is done through Django and JavaScript. In the backend, there are more technologies used. 

Backend uses:
- CORS (Cross origin resource sharing) to guard against unauthorized access from scripts and such.
- DRF (Django Rest Framework) - to enable rate limiting
- Logging - to enable logging functionality
- Caching - at the moment done through Djangos LocMemCache - this is necessary for rate limiting functionality
- Session cookies - to enable me to "remember" users privacy settings
- email-validator(https://pypi.org/project/email-validator/) to enable backend email validation before a message is attempted to be sent
- Mailjet-rest Wrapper (https://pypi.org/project/mailjet-rest/) - to enable using mailjet service from the backend, according to their documentation

Frontend uses:
- bootsrapt - for styling purposes
- showdown (https://showdownjs.com/) to enable transforming markdown content to HTML in the frontend code

# Distinctiveness and Complexity
This personal website stands out from my previous problem sets due to its broader scope and technical complexity. Unlike those projects, which were focused on specific functionalities, this application integrates multiple features, including an interactive CV with file download functionality, a portfolio of projects, a blog, and GDPR-compliant elements like a cookie consent modal and "Terms and Conditions" page.

The application demonstrates my ability to integrate advanced features, such as rate limiting for API endpoints using Django Rest Framework, a dynamic dark mode toggle, and markdown rendering for frontend content. In this way, the default Django admin interface can function as a Content Management System. The backend combines Django’s core functionality with DRF for scalability and maintainability, while the frontend uses JavaScript to dynamically populate content via API calls. This API-driven architecture introduces a level of complexity not present in the earlier problem sets by default.

Additionally, the inclusion of privacy-focused features, such as session cookies to store user preferences and Google Analytics integration conditional on consent, highlights a focus on legal compliance and user trust. The above, combined with structured logging and email usage monitoring, make the application a personal showcase and also a robust project. Altogether, this project displays a more complex approach than I have employed in the past.

# Files and what they contain
## models.py
Contains the models I have created for the purpose of the storage of information into a database for this application.
## urls.py
Contains urls I have designed to work with my views.
## views.py
Contains the main backend logic of the application.
## 404.html
Is a custom error page that should catch all 404 errors when the debug mode is turned off. (Adapted from here https://www.w3schools.com/django/django_404.php)
## error.html
Contain a custom error page that is at the moment rendered only when the ratelimiter is applied.
## index.html
Is the main html file for the application. It contains all the divs that are filled with javascript.
## layout.html
Contains the layout of all html files being rendered. Also contains the main navbar. Since the navbar is permanent, it allows the mode switch functionality.
## admin.py
Contains the models I have configured to be accessible in the admin interface, which is being used as a CMS system, among other uses. At the moment it contains all of the models created.
## styles.css
Contains styling for the application. For the most part the visuals are taked care of by this file. Some of the visuals are handled by bootstrap, some are handled by the javascript so that they can dynamically change when mode switch is applied.
## settings.py
Contains the settings of the application. I have added logging, throttling, caching and importing variables from the .env file.
## personal_website.js
This file contains all of the frontend logic with logic elements, fetch calls and constructors.
## throttling.py
Contains three custom throttling classes that the application uses. All of them are based on the AnonRateThrottle DRF class since there is no log in functionality in this app and all trafic is expected to be anonymous.
## error_styles.css
This is a css file to style the error pages. I have created it so that I could avoid name colisions easily. On further thought, it did not have to exist and all could have been handled by a single css file. But it is here now...
## favicon.ico
This is an icon for the app.
## PNG's
All of the other png's are visual materials that this app uses. There are github and linked in logos both in black and white, and some visual materials for the app. The logos for this app were obtained through logo.com
## logs.log
Contains all error and functional logs that were obrained so far during development.
## requirements.txt
Contains additional packages that are needed to run the application.
## Dockerfile
Contains the beginning of the containerization setup which is by far not yet functional.
## docker-compose.yml
Contains the beginning of the containerization setup which is by far not yet functional.

# How to run
When all requirements are met, the application should run with simple Django CLI commands. The only part of the application that will not work out of the box are the mailjet Public and Private keys, that are stored in my own .env file and a list of allowed, comma separated allowed origins. 

To be able to run this application locally, you should create a .env file that contains fields:

- ALLOWED_ORIGINS="allowed_origins_like_the_default_django_one"
- MAILJET_API_KEY_PUBLIC="public_key_from_mailjet"
- MAILJET_API_KEY_SECRET="very_secret_key_from_mailjet"
- MY_PRIVATE_EMAIL_ADDRESS="your_private_email@example.com"
- MY_PUBLIC_EMAIL_ADDRESS="your_public_email@example.com"
- MY_NAME="Your Name"

Mailjet is an emailing service that has a free tier. This application is set up in a way that should not exceed the free tier under any condition - or so I hope. 

# Future implementations
I have created this application with the intent to deploy it. For this to be achieved there are still some things I need to complete though I believe that will take additional time, so I chose to turn in my work as it stands. I believe the application is complete from the functional point of view. 

Before deployment, Redis should be added to provide a more robust and reliable caching solution for the rate limiting and the application has to get containerized with docker. These steps I will complete in the future. 