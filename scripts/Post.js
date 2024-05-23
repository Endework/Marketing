const puppeteer = require('puppeteer');
const fs = require('fs');
const { Parser } = require('json2csv');

const fetchMessages = async () => {
  const TELEGRAM_URL = "https://t.me/tikvahethiopia/"
  let postIds = ['86450', '86164', '85979', '85379', '85187', '85084', '84985', '84880', '84798', '84685', '84448', '84348', '84259', '84193', '87018', '86867', '86831', '86555', '86335', '86200', '85730', '85407', '85306', '84836', '84630', '84534', '87041', '86185', '86036', '85945', '86126', '85697', '85495', '85289', '85110'];
  let messages = []

  for (let id of postIds) {
    const browser = await puppeteer.launch({
      headless: true,
      args: [`--no-sandbox`, `--headless`, `--disable-dev-shm-usage`]
    });

    const page = await browser.newPage();
    await page.goto(`${TELEGRAM_URL}${id}?embed=1&mode=tme`, {
      waitUntil: 'networkidle0',
    });

    let views = await page.evaluate(() => {
      try {
        const span = document.body.querySelector(".tgme_widget_message_views")
        if (span !== undefined) {
          return span.innerText
        } else {
          return null
        }
      } catch (error) {
        return null
      }
    });

    let date = await page.evaluate(() => {
      try {
        const timeElement = document.body.querySelector("body > div > div.tgme_widget_message_bubble > div.tgme_widget_message_footer.js-message_footer > div.tgme_widget_message_info.js-message_info > span.tgme_widget_message_meta > a > time")
        if (timeElement !== undefined) {
          return timeElement.innerText
        } else {
          return null
        }
      } catch (error) {
        return null
      }
    });

    let imageLink = await page.evaluate(() => {
      try {
        const imageElement = document.body.querySelector("body > div > div.tgme_widget_message_bubble > a.tgme_widget_message_photo_wrap")
        if (imageElement !== undefined) {
          return imageElement.href
        } else {
          return null
        }
      } catch (error) {
        return null
      }
    });

    messages.push({
      "id": id,
      "views": views,
      "date": date,
      "imageLink": imageLink
    })

    console.log(`Post ID: ${id}, Views: ${views}, Date: ${date}, Image Link: ${imageLink}`);
    await browser.close();
  }

  // Convert JSON to CSV
  const parser = new Parser();
  const csv = parser.parse(messages);

  // Write CSV to a file
  fs.writeFileSync('post.csv', csv);

  return messages
}

fetchMessages().then(messages => console.log(messages)).catch(err => console.error(err));
