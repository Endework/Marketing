const puppeteer = require('puppeteer');
const fs = require('fs');
const { Parser } = require('json2csv');

const fetchReviews = async () => {
  const banks = {
    "DebubGlobalBank": "https://play.google.com/store/apps/details?id=com.ofss.dgbb&hl=en_US",
  };
  let reviews = [];

  for (let bank in banks) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    try {
      await page.goto(banks[bank], {
        waitUntil: 'networkidle0',
      });

      // Click the "See All Reviews" button
      try {
        const seeAllReviewsButton = await page.waitForSelector("span[jsname='V67aGc']", { visible: true, timeout: 30000 });
        if (seeAllReviewsButton) {
          console.log(`"See All Reviews" button found for ${bank}`);
          await seeAllReviewsButton.click();
          await page.waitForSelector("div[class='d15Mdf bAhLNe']", { visible: true, timeout: 30000 });
        } else {
          console.log(`"See All Reviews" button not found for ${bank}`);
          await browser.close();
          continue;  // Skip to the next bank
        }
      } catch (error) {
        console.log(`Error clicking "See All Reviews" button for ${bank}:`, error);
        await browser.close();
        continue;  // Skip to the next bank
      }

      // Scrape the first 20 unique reviews
      let scrapedReviews = new Set();
      let reviewElements = [];

      const scrapeReviews = async () => {
        const newReviewElements = await page.evaluate(() => {
          let elements = document.querySelectorAll("div[class='d15Mdf bAhLNe']");
          let reviews = [];
          elements.forEach((element) => {
            let review = {};
            try {
              review.name = element.querySelector("span[class='X43Kjb']").innerText;
              review.date = element.querySelector("span[class='p2TkOb']").innerText;
              review.message = element.querySelector("span[jsname='bN97Pc']").innerText;
              let starElement = element.querySelector("div[class='pf5lIe'] div");
              if (starElement !== null) {
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

        newReviewElements.forEach(review => {
          if (!scrapedReviews.has(review.message) && scrapedReviews.size < 20) {
            scrapedReviews.add(review.message);
            review.bank = bank;  // Add the bank name to each review
            reviewElements.push(review);
          }
        });
      };

      const clickSeeMoreReviews = async () => {
        try {
          await page.waitForSelector("span[jsname='uRdD4b']", { visible: true, timeout: 30000 });
          await page.click("span[jsname='uRdD4b']");
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for 2 seconds
        } catch (error) {
          console.log('No more "See More Reviews" button found or failed to click it.');
          return false;
        }
        return true;
      };

      let scrollAttempts = 0;
      const maxScrollAttempts = 30; // Increase the limit to the number of scroll attempts

      while (scrapedReviews.size < 20 && scrollAttempts < maxScrollAttempts) {
        await scrapeReviews();

        if (scrapedReviews.size >= 20) break;

        // Click "See More Reviews" button if it exists
        const clicked = await clickSeeMoreReviews();
        if (!clicked) break;

        scrollAttempts++;
      }

      reviews = reviews.concat(reviewElements.slice(0, 20)); // Ensure no more than 20 reviews are added

      console.log(`Finished scraping reviews for ${bank}`);
    } catch (error) {
      console.error(`Error navigating or scraping reviews for ${bank}:`, error);
    } finally {
      await browser.close();
    }
  }

  if (reviews.length > 0) {
    // Convert JSON to CSV
    const parser = new Parser();
    const csv = parser.parse(reviews);

    // Write CSV to a file
    fs.writeFileSync('global.csv', csv);
  } else {
    console.log('No reviews found.');
  }

  return reviews;
};

fetchReviews().then(reviews => console.log(reviews)).catch(err => console.error(err));
