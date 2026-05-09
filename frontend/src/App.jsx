import { useEffect, useState } from "react";
import "./App.css";

function App() {

  const API_URL = "https://YOUR-BACKEND.onrender.com";

  const [forecast, setForecast] = useState(null);
  const [news, setNews] = useState([]);
  const [marketAnalysis, setMarketAnalysis] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState("BBCA");

  useEffect(() => {

    loadData();

    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => clearInterval(interval);

  }, []);

  const loadData = async () => {

    try {

      const forecastRes = await fetch(`${API_URL}/forecast`);
      const forecastData = await forecastRes.json();
      setForecast(forecastData);

      const newsRes = await fetch(`${API_URL}/news`);
      const newsData = await newsRes.json();
      setNews(newsData);

      const marketRes = await fetch(`${API_URL}/market-analysis`);
      const marketData = await marketRes.json();
      setMarketAnalysis(marketData);

    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="app">

      <div className="hero-card">

        <div className="hero-top">
          <img
            src="https://cdn-icons-png.flaticon.com/512/2784/2784487.png"
            alt="logo"
            className="logo"
          />

          <div>
            <h1>Stock AI Forecast</h1>
            <p>Indonesia Market Intelligence Dashboard</p>
          </div>
        </div>

        {forecast && (
          <div className="forecast-box">
            <h2>{forecast.stock}</h2>
            <div className="forecast-tag">
              {forecast.forecast}
            </div>

            <div className="confidence-text">
              Confidence {forecast.confidence}%
            </div>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{
                  width: `${forecast.confidence}%`
                }}
              />
            </div>
          </div>
        )}

      </div>

      <div className="section-card">

        <div className="section-title">
          📈 Live Market Chart
        </div>

        <select
          value={selectedTicker}
          onChange={(e) => setSelectedTicker(e.target.value)}
          className="select-box"
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
            title="chart"
            src={`https://s.tradingview.com/widgetembed/?symbol=IDX:${selectedTicker}&interval=D&theme=dark`}
            width="100%"
            height="100%"
          />
        </div>

      </div>

      <div className="section-title analysis-title">
        🤖 AI Market Analysis
      </div>

      {marketAnalysis.map((item, index) => (

        <div className="analysis-card" key={index}>

          <div className="ticker-name">
            {item.ticker}
          </div>

          <div
            className={`forecast-state ${item.forecast}`}
          >
            {item.forecast}
          </div>

          <div className="score-text">
            Score: {item.score}
          </div>

          <div className="confidence-text">
            Confidence: {item.confidence}%
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${item.confidence}%`
              }}
            />
          </div>

          <div className="stats-row">
            <span>🟢 {item.positive}</span>
            <span>🔴 {item.negative}</span>
            <span>⚪ {item.neutral}</span>
          </div>

        </div>
      ))}

      <div className="section-title analysis-title">
        📰 Latest News
      </div>

      {news.map((item, index) => (

        <a
          href={item.link}
          target="_blank"
          className="news-card"
          key={index}
        >

          <div className={`news-sentiment ${item.sentiment}`}>
            {item.sentiment}
          </div>

          <div className="ticker-wrap">
            {item.tickers.map((ticker, idx) => (
              <span className="ticker-badge" key={idx}>
                {ticker}
              </span>
            ))}
          </div>

          <div className="news-title">
            {item.title}
          </div>

        </a>

      ))}

    </div>
  );
}

export default App;
