import { useEffect, useState } from "react";

function App() {

  const [forecast, setForecast] = useState(null);
  const [news, setNews] = useState([]);
  const [marketAnalysis, setMarketAnalysis] = useState([]);
  const [selectedTicker, setSelectedTicker] = useState("BBCA");
  const [loading, setLoading] = useState(true);

  const fetchData = () => {

    fetch("http://localhost:8000/forecast")
      .then((res) => res.json())
      .then((data) => {
        setForecast(data);
      });

    fetch("http://localhost:8000/news")
      .then((res) => res.json())
      .then((data) => {
        setNews(data);
      });

    fetch("http://localhost:8000/market-analysis")
      .then((res) => res.json())
      .then((data) => {
        setMarketAnalysis(data);
        setLoading(false);
      });
  };

  useEffect(() => {

    fetchData();

    const interval = setInterval(() => {
      fetchData();
    }, 30000);

    return () => clearInterval(interval);

  }, []);


  const getForecastColor = (forecast) => {

    if (forecast === "BULLISH") {
      return "#00ff99";
    }

    if (forecast === "BEARISH") {
      return "#ff4d4d";
    }

    return "#cccccc";
  };


  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0b0f19",
        color: "white",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >

      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >

        <div
          style={{
            background: "linear-gradient(135deg, #121826, #1f2937)",
            padding: "25px",
            borderRadius: "20px",
            marginBottom: "25px",
            boxShadow: "0 0 20px rgba(0,0,0,0.3)",
          }}
        >

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >

            <div
              style={{
                fontSize: "50px",
              }}
            >
              📈
            </div>

            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "36px",
                }}
              >
                Stock AI Forecast
              </h1>

              <div
                style={{
                  marginTop: "8px",
                  color: "#9ca3af",
                }}
              >
                Indonesia Market Intelligence Dashboard
              </div>
            </div>

          </div>

        </div>


        {forecast && (

          <div
            style={{
              background: "#111827",
              padding: "25px",
              borderRadius: "20px",
              marginBottom: "25px",
              border: "1px solid #1f2937",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >

              <div>
                <div
                  style={{
                    fontSize: "40px",
                    fontWeight: "bold",
                  }}
                >
                  {forecast.stock}
                </div>

                <div
                  style={{
                    marginTop: "10px",
                    color: getForecastColor(forecast.forecast.toUpperCase()),
                    fontWeight: "bold",
                    fontSize: "24px",
                  }}
                >
                  {forecast.forecast}
                </div>
              </div>

              <div
                style={{
                  textAlign: "right",
                }}
              >
                <div
                  style={{
                    color: "#9ca3af",
                  }}
                >
                  AI Confidence
                </div>

                <div
                  style={{
                    fontSize: "38px",
                    fontWeight: "bold",
                  }}
                >
                  {forecast.confidence}%
                </div>
              </div>

            </div>

          </div>

        )}


        <div
          style={{
            background: "#111827",
            padding: "25px",
            borderRadius: "20px",
            marginBottom: "25px",
            border: "1px solid #1f2937",
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >

            <h2
              style={{
                margin: 0,
              }}
            >
              📊 Live Market Chart
            </h2>

            <div
              style={{
                background: "#0f172a",
                padding: "8px 14px",
                borderRadius: "10px",
                color: "#00ff99",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              LIVE
            </div>

          </div>


          <select
            value={selectedTicker}
            onChange={(e) => setSelectedTicker(e.target.value)}
            style={{
              width: "100%",
              padding: "14px",
              background: "#0f172a",
              color: "white",
              border: "1px solid #334155",
              borderRadius: "12px",
              marginBottom: "20px",
              fontSize: "16px",
            }}
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


          <iframe
            title="TradingView"
            src={`https://s.tradingview.com/widgetembed/?symbol=IDX:${selectedTicker}&interval=D&theme=dark`}
            style={{
              width: "100%",
              height: "520px",
              border: "none",
              borderRadius: "15px",
              background: "#000",
            }}
            allowFullScreen
          />

        </div>


        <div
          style={{
            marginBottom: "25px",
          }}
        >

          <h2>
            🤖 AI Market Analysis
          </h2>


          {loading ? (

            <div>
              Loading...
            </div>

          ) : (

            marketAnalysis.map((item, index) => (

              <div
                key={index}
                style={{
                  background: "#111827",
                  padding: "22px",
                  borderRadius: "18px",
                  marginTop: "15px",
                  border: "1px solid #1f2937",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >

                  <div>

                    <div
                      style={{
                        fontSize: "34px",
                        fontWeight: "bold",
                      }}
                    >
                      {item.ticker}
                    </div>

                    <div
                      style={{
                        marginTop: "8px",
                        color: getForecastColor(item.forecast),
                        fontWeight: "bold",
                        fontSize: "22px",
                      }}
                    >
                      {item.forecast}
                    </div>

                  </div>


                  <div
                    style={{
                      textAlign: "right",
                    }}
                  >

                    <div
                      style={{
                        color: "#9ca3af",
                      }}
                    >
                      AI Confidence
                    </div>

                    <div
                      style={{
                        fontSize: "30px",
                        fontWeight: "bold",
                      }}
                    >
                      {item.confidence}%
                    </div>

                  </div>

                </div>


                <div
                  style={{
                    marginTop: "20px",
                    background: "#1e293b",
                    height: "12px",
                    borderRadius: "10px",
                    overflow: "hidden",
                  }}
                >

                  <div
                    style={{
                      width: `${item.confidence}%`,
                      background: getForecastColor(item.forecast),
                      height: "100%",
                    }}
                  />

                </div>


                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "18px",
                    color: "#d1d5db",
                  }}
                >

                  <div>
                    🟢 Positive: {item.positive}
                  </div>

                  <div>
                    🔴 Negative: {item.negative}
                  </div>

                  <div>
                    ⚪ Neutral: {item.neutral}
                  </div>

                </div>

              </div>

            ))

          )}

        </div>


        <div>

          <h2>
            📰 Latest News
          </h2>


          {news.map((item, index) => (

            <a
              key={index}
              href={item.link}
              target="_blank"
              rel="noreferrer"
              style={{
                textDecoration: "none",
              }}
            >

              <div
                style={{
                  background: "#111827",
                  padding: "22px",
                  borderRadius: "18px",
                  marginTop: "15px",
                  border: "1px solid #1f2937",
                }}
              >

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >

                  <div
                    style={{
                      color: getForecastColor(item.sentiment),
                      fontWeight: "bold",
                    }}
                  >
                    {item.sentiment}
                  </div>


                  <div>

                    {item.tickers.map((ticker, idx) => (

                      <span
                        key={idx}
                        style={{
                          background: "#2563eb",
                          color: "white",
                          padding: "5px 10px",
                          borderRadius: "8px",
                          marginLeft: "5px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      >
                        {ticker}
                      </span>

                    ))}

                  </div>

                </div>


                <div
                  style={{
                    color: "#f8fafc",
                    fontSize: "18px",
                    lineHeight: "1.6",
                  }}
                >
                  {item.title}
                </div>

              </div>

            </a>

          ))}

        </div>

      </div>

    </div>
  );
}

export default App;