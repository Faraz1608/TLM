import csv
import random
from datetime import datetime, timedelta

def generate_mock_data(filename="mock_trades.csv", count=10):
    headers = ["trade_id", "account", "instrument", "isin", "side", "quantity", "price", "currency", "trade_date", "settlement_date", "cash_amount", "status", "fees"]
    
    accounts = ["ACC001", "ACC002", "ACC003"]
    instruments = ["AAPL", "GOOGL", "MSFT", "TSLA"]
    
    with open(filename, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        
        for i in range(count):
            trade_id = f"T{1000+i}"
            account = random.choice(accounts)
            instrument = random.choice(instruments)
            isin = "US" + "".join([str(random.randint(0,9)) for _ in range(10)])
            side = random.choice(["BUY", "SELL"])
            qty = random.randint(10, 1000)
            price = round(random.uniform(100.0, 3000.0), 2)
            currency = "USD"
            t_date = datetime.now().date()
            s_date = t_date + timedelta(days=2)
            cash = round(qty * price, 2)
            status = "SETTLED"
            fees = round(random.uniform(1.0, 10.0), 2)
            
            writer.writerow([
                trade_id, account, instrument, isin, side, qty, price, currency, 
                t_date, s_date, cash, status, fees
            ])
            
    print(f"Generated {count} trades in {filename}")

if __name__ == "__main__":
    generate_mock_data()
