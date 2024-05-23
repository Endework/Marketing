const puppeteer = require('puppeteer');
const fs = require('fs');
const { Parser } = require('json2csv');

const fetchReviews = async () => {
  const banks = {
    "CBE": "https://play.google.com/store/apps/details?id=com.ofss.dgbb&hl=en_US&pli=1",
    "DebubGlobalBank": "https://play.google.com/store/apps/details?id=com.ofss.dgbb&hl=en_US",
    "BOA": "https://play.google.com/store/apps/details?id=com.boa.boaMobileBanking&hl=en_US",
    "Wegagen": "https://play.google.com/store/apps/details?id=com.act.wegagen&hl=en&gl=US"
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
        } catch (error) {
          console.error(error);
        }
        reviews.push(review);
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
  fs.writeFileSync('googleplay.csv', csv);

  return reviews
}

fetchReviews().then(reviews => console.log(reviews)).catch(err => console.error(err));
