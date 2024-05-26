from bs4 import BeautifulSoup
from selenium import webdriver
import time

# URL of the app
url = "https://play.google.com/store/apps/details?id=com.combanketh.mobilebanking"

# Create a new Chrome browser instance
driver = webdriver.Chrome()

# Make the browser go to the URL
driver.get(url)

# Wait for the page to load
time.sleep(5)

# Parse the HTML of the page with BeautifulSoup
soup = BeautifulSoup(driver.page_source, 'html.parser')

# Find all review elements on the page
reviews = soup.find_all('div', class_='d15Mdf')

# Iterate over each review and print it
for review in reviews:
    # Extract the username
    username = review.find('span', class_='X43Kjb').text
    # Extract the rating
    rating = review.find('div', class_='pf5lIe').find_next()['aria-label']
    # Extract the review text
    review_text = review.find('span', class_='p2TkOb').text
    print(f'User: {username}, Rating: {rating}, Review: {review_text}\n')

# Close the browser
driver.quit()
