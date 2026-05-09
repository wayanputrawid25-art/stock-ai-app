import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [forecast, setForecast] = useState(null);
  const [news, setNews] = useState([]);
  const [marketAnalysis, setMarketAnalysis] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState("BBCA");
  const [loading, setLoading] = useState(true);

  const API_URL = "https://stock-ai-api.onrender.com";

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const forecastRes = await fetch(`${API_URL}/forecast`);
      const forecastData = await forecastRes.json();
      setForecast(forecastData);

      const newsRes = await fetch(`${API_URL}/news`);
      const newsData = await newsRes.json();
      setNews(newsData);

      const marketRes = await fetch(`${API_URL}/market-analysis`);
      const marketData = await marketRes.json();
      setMarketAnalysis(marketData);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="overlay"></div>

      <div className="container">
        {/* HEADER */}
        <div className="header-card">
          <div className="header-left">
            <div className="logo-box">📈</div>

            <div>
              <h1 className="title">Stock AI Forecast</h1>
              <p className="subtitle">
                Indonesia Market Intelligence Dashboard
              </p>
            </div>
          </div>

          <div className="live-badge">LIVE</div>
        </div>

        {/* FORECAST */}
        {forecast && (
          <div className="forecast-card glass-card">
            <div className="forecast-top">
              <div>
                <p className="section-mini">AI FORECAST</p>
                <h2>{forecast.stock}</h2>
              </div>

              <div
                className={`forecast-status ${
                  forecast.forecast === "Bullish"
                    ? "bull"
                    : forecast.forecast === "Bearish"
                    ? "bear"
                    : "neutral"
                }`}
              >
                {forecast.forecast}
              </div>
            </div>

            <div className="confidence-wrapper">
              <div className="confidence-label">
                <span>Confidence</span>
                <span>{forecast.confidence}%</span>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${forecast.confidence}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* CHART */}
        <div className="glass-card chart-card">
          <div className="section-header">
            <div>
              <p className="section-mini">REALTIME</p>
              <h2>Live Market Chart</h2>
            </div>

            <div className="green-dot"></div>
          </div>

          <select
            className="ticker-select"
            value={selectedTicker}
            onChange={(e) => setSelectedTicker(e.target.value)}
          >
            <option value="BBCA">BBCA</option>
            <option value="BBRI">BBRI</option>
            <option value="BMRI">BMRI</option>
            <option value="TLKM">TLKM</option>
            <option value="ASII">ASII</option>
            <option value="ANTM">ANTM</option>
            <option value="GOTO">GOTO</option>
            <option value="MAPI">MAPI</option>
          </select>

          <div className="chart-wrapper">
            <iframe
              title="TradingView"
              src={`https://s.tradingview.com/widgetembed/?symbol=IDX:${selectedTicker}&interval=D&theme=dark`}
              width="100%"
              height="100%"
            />
          </div>
        </div>

        {/* MARKET ANALYSIS */}
        <div className="section-header market-title">
          <div>
            <p className="section-mini">MARKET</p>
            <h2>AI Market Analysis</h2>
          </div>
        </div>

        {loading ? (
          <div className="loading-box glass-card">Loading Market Data...</div>
        ) : (
          marketAnalysis.map((item, index) => (
            <div key={index} className="glass-card analysis-card">
              <div className="analysis-top">
                <div>
                  <h2>{item.ticker}</h2>
                  <p className="score-text">Score: {item.score}</p>
                </div>

                <div
                  className={`analysis-badge ${
                    item.forecast === "BULLISH"
                      ? "bull"
                      : item.forecast === "BEARISH"
                      ? "bear"
                      : "neutral"
                  }`}
                >
                  {item.forecast}
                </div>
              </div>

              <div className="confidence-wrapper">
                <div className="confidence-label">
                  <span>Confidence</span>
                  <span>{item.confidence}%</span>
                </div>

                <div className="progress-bar">
                  <div
                    className={`progress-fill ${
                      item.forecast === "BULLISH"
                        ? "bull-fill"
                        : item.forecast === "BEARISH"
                        ? "bear-fill"
                        : "neutral-fill"
                    }`}
                    style={{ width: `${item.confidence}%` }}
                  ></div>
                </div>
              </div>

              <div className="sentiment-row">
                <div className="sentiment positive">
                  🟢 {item.positive}
                </div>

                <div className="sentiment negative">
                  🔴 {item.negative}
                </div>

                <div className="sentiment neutral-box">
                  ⚪ {item.neutral}
                </div>
              </div>
            </div>
          ))
        )}

        {/* NEWS */}
        <div className="section-header market-title">
          <div>
            <p className="section-mini">NEWS</p>
            <h2>Latest News</h2>
          </div>
        </div>

        {news.map((item, index) => (
          <a
            key={index}
            href={item.link}
            target="_blank"
            className="news-link"
          >
            <div className="glass-card news-card">
              <div className="news-top">
                <div
                  className={`analysis-badge ${
                    item.sentiment === "POSITIVE"
                      ? "bull"
                      : item.sentiment === "NEGATIVE"
                      ? "bear"
                      : "neutral"
                  }`}
                >
                  {item.sentiment}
                </div>

                <div className="news-time">Realtime</div>
              </div>

              {item.tickers.length > 0 && (
                <div className="ticker-row">
                  {item.tickers.map((ticker, idx) => (
                    <div key={idx} className="ticker-chip">
                      {ticker}
                    </div>
                  ))}
                </div>
              )}

              <div className="news-title">{item.title}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default App;
