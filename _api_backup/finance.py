from http.server import BaseHTTPRequestHandler
import json
from urllib.parse import parse_qs, urlparse
import yfinance as yf
from datetime import datetime, timedelta

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            # Parse query parameters
            parsed_url = urlparse(self.path)
            query_params = parse_qs(parsed_url.query)
            
            symbol = query_params.get('symbol', ['RELIANCE.NS'])[0]
            request_type = query_params.get('type', ['quote'])[0]
            
            ticker = yf.Ticker(symbol)
            
            if request_type == 'quote':
                result = self.get_quote(ticker, symbol)
            elif request_type == 'chart':
                period = query_params.get('period', ['1mo'])[0]
                interval = query_params.get('interval', ['1d'])[0]
                result = self.get_chart(ticker, symbol, period, interval)
            else:
                result = self.get_quote(ticker, symbol)
            
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(result).encode())
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
    
    def get_quote(self, ticker, symbol):
        info = ticker.info
        history = ticker.history(period='2d')
        
        current_price = info.get('regularMarketPrice') or info.get('currentPrice')
        previous_close = info.get('previousClose') or info.get('regularMarketPreviousClose')
        
        if current_price is None and len(history) > 0:
            current_price = float(history['Close'].iloc[-1])
        if previous_close is None and len(history) > 1:
            previous_close = float(history['Close'].iloc[-2])
        
        return {
            "meta": {
                "symbol": symbol,
                "shortName": info.get('shortName', symbol),
                "regularMarketPrice": current_price,
                "previousClose": previous_close,
                "regularMarketChange": (current_price - previous_close) if current_price and previous_close else 0,
                "regularMarketChangePercent": ((current_price - previous_close) / previous_close * 100) if current_price and previous_close else 0,
                "regularMarketVolume": info.get('regularMarketVolume', 0),
                "marketCap": info.get('marketCap', 0),
                "currency": info.get('currency', 'INR'),
            }
        }
    
    def get_chart(self, ticker, symbol, period, interval):
        history = ticker.history(period=period, interval=interval)
        
        if history.empty:
            return {"error": "No data available"}
        
        timestamps = [int(ts.timestamp()) for ts in history.index]
        
        return {
            "meta": {
                "symbol": symbol,
                "currency": ticker.info.get('currency', 'INR'),
                "regularMarketPrice": float(history['Close'].iloc[-1]) if len(history) > 0 else 0,
            },
            "timestamp": timestamps,
            "indicators": {
                "quote": [{
                    "open": [float(x) if x == x else None for x in history['Open'].tolist()],
                    "high": [float(x) if x == x else None for x in history['High'].tolist()],
                    "low": [float(x) if x == x else None for x in history['Low'].tolist()],
                    "close": [float(x) if x == x else None for x in history['Close'].tolist()],
                    "volume": [int(x) if x == x else None for x in history['Volume'].tolist()],
                }]
            }
        }
