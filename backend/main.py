from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import feedparser

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

company_mapping = {
    "BANK CENTRAL ASIA": "BBCA",
    "BCA": "BBCA",

    "BANK RAKYAT INDONESIA": "BBRI",
    "BRI": "BBRI",

    "BANK MANDIRI": "BMRI",
    "MANDIRI": "BMRI",

    "TELKOM": "TLKM",
    "MITRATEL": "MTEL",

    "GOTO": "GOTO",
    "GOJEK": "GOTO",
    "TOKOPEDIA": "GOTO",

    "ASTRA": "ASII",

    "ANTAM": "ANTM",

    "MERDEKA COPPER": "MDKA",

    "BNI": "BBNI",

    "MAPI": "MAPI"
}


def analyze_sentiment(text):

    positive_words = [
        "menguat",
        "naik",
        "bullish",
        "laba",
        "cuan",
        "borong",
        "untung",
        "ekspansi",
        "rebound",
        "tumbuh",
        "melonjak"
    ]

    negative_words = [
        "turun",
        "anjlok",
        "bearish",
        "rugi",
        "jual",
        "lepas",
        "koreksi",
        "melemah",
        "serangan",
        "phk",
        "ditahan"
    ]

    text = text.lower()

    positive_score = 0
    negative_score = 0

    for word in positive_words:
        if word in text:
            positive_score += 1

    for word in negative_words:
        if word in text:
            negative_score += 1

    if positive_score > negative_score:
        return "POSITIVE"

    elif negative_score > positive_score:
        return "NEGATIVE"

    else:
        return "NEUTRAL"


def detect_ticker(text):

    text_upper = text.upper()

    found = []

    for company, ticker in company_mapping.items():

        if company in text_upper:

            if ticker not in found:
                found.append(ticker)

    return found


@app.get("/")
def home():
    return {
        "message": "Stock AI Backend Running"
    }


@app.get("/forecast")
def forecast():
    return {
        "stock": "BBCA",
        "forecast": "Bullish",
        "confidence": 82
    }


@app.get("/news")
def get_news():

    rss_url = "https://www.cnbcindonesia.com/market/rss"

    feed = feedparser.parse(rss_url)

    news_list = []

    for entry in feed.entries[:10]:

        news_list.append({
            "title": entry.title,
            "link": entry.link,
            "sentiment": analyze_sentiment(entry.title),
            "tickers": detect_ticker(entry.title)
        })

    return news_list


@app.get("/market-analysis")
def market_analysis():

    rss_url = "https://www.cnbcindonesia.com/market/rss"

    feed = feedparser.parse(rss_url)

    market_data = {}

    for entry in feed.entries[:30]:

        title = entry.title

        sentiment = analyze_sentiment(title)

        tickers = detect_ticker(title)

        for ticker in tickers:

            if ticker not in market_data:

                market_data[ticker] = {
                    "positive": 0,
                    "negative": 0,
                    "neutral": 0
                }

            if sentiment == "POSITIVE":
                market_data[ticker]["positive"] += 1

            elif sentiment == "NEGATIVE":
                market_data[ticker]["negative"] += 1

            else:
                market_data[ticker]["neutral"] += 1

    results = []

    for ticker, data in market_data.items():

        score = (
            data["positive"] * 2
            - data["negative"] * 2
            + data["neutral"]
        )

        if score > 2:
            forecast = "BULLISH"

        elif score < 0:
            forecast = "BEARISH"

        else:
            forecast = "NEUTRAL"

        total_news = (
            data["positive"]
            + data["negative"]
            + data["neutral"]
        )

        sentiment_strength = abs(
            data["positive"] - data["negative"]
        )

        confidence = min(
            95,
            50 + (sentiment_strength * 15)
        )

        results.append({
            "ticker": ticker,
            "forecast": forecast,
            "score": score,
            "confidence": confidence,
            "positive": data["positive"],
            "negative": data["negative"],
            "neutral": data["neutral"]
        })

    return results
