const puppeteer = require('puppeteer');
const fs = require('fs');
const { Parser } = require('json2csv');

const fetchReviews = async () => {
  const banks = {
    "DebubGlobalBank": "https://play.google.com/store/apps/details?id=com.ofss.dgbb&hl=en_US",
  }
  let reviews = []

  for (let bank in banks) {
    const browser = await puppeteer.launch({
      headless: true,
      args: [`--no-sandbox`, `--headless`, `--disable-dev-shm-usage`]
    });

    const page = await browser.newPage();
    await page.goto(banks[bank], {
      waitUntil: 'networkidle0',
    });

    // Scrape all reviews
    let reviewElements = await page.evaluate(() => {
      let elements = document.querySelectorAll("div[class='EGFGHd']");
      let reviews = [];
      elements.forEach((element) => {
        let review = {};
        try {
          review.name = element.querySelector("div[class='YNR7H']").innerText;
          review.date = element.querySelector("span[class='bp9Aid']").innerText;
          review.message = element.querySelector("div[class='h3YV2d']").innerText;
          let starElement = element.querySelector("div[role='img']");
          if (starElement !== null) {
            // Extract the number of stars from the aria-label attribute
            let ariaLabel = starElement.getAttribute('aria-label');
            review.stars = ariaLabel.split(' ')[1];
          }
          reviews.push(review);
        } catch (error) {
          console.error(error);
        }
      });
      return reviews;
    });

    reviewElements.forEach(review => {
      review.bank = bank;  // Add the bank name to each review
      reviews.push(review);
    });

    // Click the "See All Reviews" button
    await page.waitForSelector(".VfPpkd-vQzf8d");
    await page.click(".VfPpkd-vQzf8d");

    try {
      // Wait for a specific element that appears only after all the reviews have been loaded
      await page.waitForSelector("div[class='EGFGHd']");
    } catch (error) {
      console.log(`No more reviews found for ${bank}`);
      continue;  // Skip to the next bank
    }

    // Scroll down to load more reviews
    await page.evaluate(async () => {
      for (let i = 0; i < 20; i++) {  // Increase the number of scrolls
        window.scrollTo(0, document.body.scrollHeight);
        await new Promise(resolve => setTimeout(resolve, 3000));  // Increase the wait time
      }
    });

    // Scrape more reviews
    reviewElements = await page.evaluate(() => {
      let elements = document.querySelectorAll("div[class='EGFGHd']");
      let reviews = [];
      elements.forEach((element) => {
        let review = {};
        try {
          review.name = element.querySelector("div[class='YNR7H']").innerText;
          review.date = element.querySelector("span[class='bp9Aid']").innerText;
          review.message = element.querySelector("div[class='h3YV2d']").innerText;
          let starElement = element.querySelector("div[role='img']");
          if (starElement !== null) {
            // Extract the number of stars from the aria-label attribute
            let ariaLabel = starElement.getAttribute('aria-label');
            review.stars = ariaLabel.split(' ')[1];
          }
          reviews.push(review);
        } catch (error) {
          console.error(error);
        }
      });
      return reviews;
    });

    reviewElements.forEach(review => {
      review.bank = bank;  // Add the bank name to each review
      reviews.push(review);
    });

    console.log(`Finished scraping reviews for ${bank}`);
    await browser.close();
  }

  // Convert JSON to CSV
  const parser = new Parser();
  const csv = parser.parse(reviews);

  // Write CSV to a file
  fs.writeFileSync('global.csv', csv);

  return reviews
}

fetchReviews().then(reviews => console.log(reviews)).catch(err => console.error(err));
