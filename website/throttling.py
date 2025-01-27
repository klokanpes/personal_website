from rest_framework.throttling import AnonRateThrottle

# Adapted from Django REST Throttling: https://www.django-rest-framework.org/api-guide/throttling/ and https://www.django-rest-framework.org/api-guide/throttling/#anonratethrottle

class GeneralRateThrottle(AnonRateThrottle):
    scope = "general"

class EmailRateThrottle(AnonRateThrottle):
    scope = "email"

class DownloadRateThrottle(AnonRateThrottle):
    scope = "download"