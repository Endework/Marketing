from google_play_scraper import Sort, reviews_all
import json
import datetime

# Custom JSON Encoder
class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime.datetime):
            return obj.isoformat()
        return super(DateTimeEncoder, self).default(obj)

# List of bank app identifiers on Google Play Store
banks = {
    "CBE": "com.combanketh.mobilebanking",
    "DGB": "com.ofss.dgbb",  # Debub Global Bank[^1^][1]
    "BOA": "com.boa.boaMobileBanking",
    "Wegagenbank": "com.act.wegagen"  # Wegagen Bank of Ethiopia[^2^][4]
}


for bank, app_id in banks.items():
    print(f"Fetching reviews for {bank}")
    
    # Fetch all reviews
    result = reviews_all(
        app_id,
        sleep_milliseconds=0,  # defaults to 0
        lang='en',  # defaults to 'en'
        country='us',  # defaults to 'us'
        sort=Sort.MOST_RELEVANT,  # defaults to Sort.MOST_RELEVANT
        filter_score_with=None  # defaults to None(means all score)
    )

    # Print each review
    for review in result:
        print(json.dumps(review, cls=DateTimeEncoder, indent=2))

    # Alternatively, write the reviews to a JSON file
    with open(f'{bank}_reviews.json', 'w') as f:
        json.dump(result, f, cls=DateTimeEncoder, indent=2)

    print(f"Finished fetching reviews for {bank}")
