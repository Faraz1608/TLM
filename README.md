# TLM Post-Settlement Simulator

A production-like post-settlement simulator using MongoDB, Express, React, and Python.

## Prerequisites

- Node.js (LTS)
- MongoDB (running locally)
- Python 3.10+

## Quick Start

### 1. Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB (Running locally on port 27017)

### 2. Start Backend
Open a terminal and run:
```bash
cd backend
npm install
npm run dev
```
*Server runs on `http://localhost:5000`*

### 3. Start Frontend
Open a new terminal and run:
```bash
cd frontend
npm install
npm start
```
*App runs on `http://localhost:5177`*

### 4. Verify
- Open `http://localhost:5177` in your browser.
- You should see the Dashboard.

The Python matcher is invoked by the backend. Ensure `python` is in your PATH.
You can generate mock data using:
```bash
python generate_mock.py
```

## Testing

### Backend Tests
```bash
cd backend
npm test
```

### Manual Verification
1. Start Backend and Frontend.
2. Go to `http://localhost:5173/upload`.
3. Upload `sample_trades.csv` (or generated mock data) as "Expected Trades".
4. Go to `http://localhost:5173/breaks` to see generated breaks (Missing Settlement).


## Architecture

- **Frontend**: React app.
- **Backend**: Node/Express API + MongoDB.
- **Matcher**: Python script (spawned by Node).
