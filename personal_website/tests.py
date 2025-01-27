from django.test import TestCase


from django.test import Client
client = Client()

# Make 101 requests to check throttling
for i in range(101):
    response = client.get('/homepage_content')
    print(response.status_code)  # Should return 429 after the rate limit is exceeded
# Create your tests here.

# Test API endpoints

# Test frontend with Selenium
