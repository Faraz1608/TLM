import sys
import json
import hashlib
from decimal import Decimal, getcontext

# Set precision high enough
getcontext().prec = 28

def to_decimal(val):
    if val is None:
        return None
    if isinstance(val, dict) and '$numberDecimal' in val:
        return Decimal(val['$numberDecimal'])
    return Decimal(str(val))

def compute_fingerprint(trade_id, break_type, expected_val, actual_val, reason):
    raw = f"{trade_id}|{break_type}|{expected_val}|{actual_val}|{reason}"
    return hashlib.sha256(raw.encode('utf-8')).hexdigest()

def main():
    try:
        # Read input JSON from stdin
        # Expected format: { "trades": [...], "actuals": [...] }
        input_data = sys.stdin.read()
        if not input_data:
            return

        data = json.loads(input_data)
        trades = data.get('trades', [])
        actuals = data.get('actuals', [])
        
        # Index actuals by (account, instrument, settlementDate, side)
        # Note: Dates might be strings, ensure consistency
        actuals_map = {}
        for act in actuals:
            # Key: account|instrument|date|side
            # We need to handle date parsing if needed, but assuming ISO strings match
            key = f"{act['account']}|{act['instrument']}|{act['settlementDate']}|{act.get('side', '')}"
            if key not in actuals_map:
                actuals_map[key] = []
            actuals_map[key].append(act)

        breaks = []
        
        settings = data.get('settings', {})
        # Default to 0.01 if not provided
        cash_tol = settings.get('cashTolerance', 0.01)
        MONEY_TOLERANCE = Decimal(str(cash_tol))
        
        for trade in trades:
            trade_key = f"{trade['account']}|{trade['instrument']}|{trade['settlementDate']}|{trade['side']}"
            candidates = actuals_map.get(trade_key, [])
            
            matched = False
            
            exp_qty = to_decimal(trade['quantity'])
            exp_cash = to_decimal(trade.get('cashAmount', 0))
            
            # 1. Exact Quantity Match
            exact_qty_match = None
            for cand in candidates:
                act_qty = to_decimal(cand['quantity'])
                if act_qty == exp_qty:
                    exact_qty_match = cand
                    break
            
            if exact_qty_match:
                # Check Cash
                act_cash = to_decimal(exact_qty_match.get('cashAmount', 0))
                diff_cash = abs(exp_cash - act_cash)
                
                if diff_cash > MONEY_TOLERANCE:
                    # CASH Break
                    breaks.append({
                        "breakType": "CASH",
                        "expectedTradeId": trade['_id'],
                        "actualSettlementId": exact_qty_match['_id'],
                        "expectedValue": str(exp_cash),
                        "actualValue": str(act_cash),
                        "difference": str(exp_cash - act_cash),
                        "severity": "LOW", # Logic for severity can be expanded
                        "reason": "Cash mismatch",
                        "fingerprint": compute_fingerprint(trade['_id'], "CASH", exp_cash, act_cash, "Cash mismatch")
                    })
                else:
                    # Fully Matched
                    pass
            elif candidates:
                # STOCK Break (Quantity mismatch)
                # Pick the first one for now or logic to find best fit
                cand = candidates[0]
                act_qty = to_decimal(cand['quantity'])
                breaks.append({
                    "breakType": "STOCK",
                    "expectedTradeId": trade['_id'],
                    "actualSettlementId": cand['_id'],
                    "expectedValue": str(exp_qty),
                    "actualValue": str(act_qty),
                    "difference": str(exp_qty - act_qty),
                    "severity": "HIGH",
                    "reason": "Quantity mismatch",
                    "fingerprint": compute_fingerprint(trade['_id'], "STOCK", exp_qty, act_qty, "Quantity mismatch")
                })
            else:
                # Missing Settlement
                breaks.append({
                    "breakType": "STOCK",
                    "expectedTradeId": trade['_id'],
                    "actualSettlementId": None,
                    "expectedValue": str(exp_qty),
                    "actualValue": None,
                    "difference": str(exp_qty),
                    "severity": "HIGH",
                    "reason": "Missing settlement",
                    "fingerprint": compute_fingerprint(trade['_id'], "STOCK", exp_qty, "None", "Missing settlement")
                })

        print(json.dumps({"breaks": breaks}))

    except Exception as e:
        # Output error to stderr or as JSON
        # print(f"Error: {e}", file=sys.stderr)
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
