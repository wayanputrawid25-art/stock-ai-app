from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import random
import feedparser
from textblob import TextBlob

app = FastAPI()

# =========================
# CORS
# =========================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# CONFIG
# =========================

RSS_URL = "https://news.google.com/rss/search?q=saham+indonesia"

WATCHLIST = [
    "BBCA",
    "BBRI",
    "BMRI",
    "TLKM",
    "ASII",
    "ANTM",
    "GOTO",
    "MAPI"
]

# =========================
# HOME
# =========================

@app.get("/")
def home():
    return {
        "status": "online",
        "message": "Stock AI API Running"
    }

# =========================
# FORECAST AI
# =========================

@app.get("/forecast")
def get_ai_forecast():

    forecasts = [
        {
            "stock": "BBCA",
            "forecast": "Bullish",
            "confidence": random.randint(75, 95)
        },
        {
            "stock": "BBRI",
            "forecast": "Bearish",
            "confidence": random.randint(60, 88)
        },
        {
            "stock": "ANTM",
            "forecast": "Neutral",
            "confidence": random.randint(50, 70)
        },
        {
            "stock": "MAPI",
            "forecast": "Bullish",
            "confidence": random.randint(70, 90)
        }
    ]

    return random.choice(forecasts)

# =========================
# DETECT TICKERS
# =========================

def detect_tickers(text):

    found = []

    for ticker in WATCHLIST:

        if ticker.lower() in text.lower():
            found.append(ticker)

    return found

# =========================
# SENTIMENT ANALYSIS
# =========================

def analyze_sentiment(text):

    analysis = TextBlob(text)

    score = analysis.sentiment.polarity

    if score > 0:
        return "POSITIVE"

    elif score < 0:
        return "NEGATIVE"

    return "NEUTRAL"

# =========================
# NEWS API
# =========================

@app.get("/news")
def get_market_news():

    feed = feedparser.parse(RSS_URL)

    results = []

    for entry in feed.entries[:15]:

        sentiment = analyze_sentiment(entry.title)

        results.append({
            "title": entry.title,
            "link": entry.link,
            "sentiment": sentiment,
            "tickers": detect_tickers(entry.title)
        })

    return results

# =========================
# MARKET ANALYSIS
# =========================

@app.get("/market-analysis")
def generate_market_analysis():

    feed = feedparser.parse(RSS_URL)

    news = []

    for entry in feed.entries[:20]:

        sentiment = analyze_sentiment(entry.title)

        news.append({
            "title": entry.title,
            "sentiment": sentiment,
            "tickers": detect_tickers(entry.title)
        })

    result = []

    for ticker in WATCHLIST:

        positive = 0
        negative = 0
        neutral = 0

        for item in news:

            if ticker in item["tickers"]:

                if item["sentiment"] == "POSITIVE":
                    positive += 1

                elif item["sentiment"] == "NEGATIVE":
                    negative += 1

                else:
                    neutral += 1

        score = positive - negative

        # Forecast Logic
        if score > 0:
            forecast = "BULLISH"

        elif score < 0:
            forecast = "BEARISH"

        else:
            forecast = "NEUTRAL"

        total = positive + negative + neutral

        confidence = 50

        if total > 0:

            confidence = min(
                95,
                int(
                    (
                        max(
                            positive,
                            negative,
                            neutral
                        ) / total
                    ) * 100
                )
            )

        result.append({
            "ticker": ticker,
            "forecast": forecast,
            "score": score,
            "positive": positive,
            "negative": negative,
            "neutral": neutral,
            "confidence": confidence
        })

    return result
