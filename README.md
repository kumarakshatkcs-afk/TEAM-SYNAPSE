# Sentinel Ledger: AI-Powered Fraud Defense

**Sentinel Ledger** is a full-stack system that combines off-chain AI fraud detection with on-chain Solana smart contracts to secure financial transactions.

## 🔥 Features
- **AI Backend**: Python FastAPI service using Isolation Forest to detect fraud.
- **Smart Contract**: Solana (Anchor) program that verifies AI signatures and blocks fraudulent transactions.
- **Oracle**: Node.js middleware that bridges the AI backend and the blockchain.
- **Dashboard**: Next.js + TailwindCSS admin interface for real-time monitoring.

## 📂 Project Structure
```
sentinel-ledger/
├── backend/          # Python FastAPI AI Model
├── smart-contract/   # Solana Anchor Program (Rust)
├── oracle/           # Node.js Middleware
└── frontend/         # Next.js Dashboard
```

## 🚀 Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+
- Rust & Cargo
- Solana CLI & Anchor

### 1. Run AI Backend
```bash
cd backend
pip install -r requirements.txt
python train_model.py  # Train the dummy model
uvicorn main:app --reload
```
API will be running at `http://127.0.0.1:8000`.

### 2. Run Smart Contract (Localnet)
```bash
cd smart-contract
anchor build
anchor test  # Deploys to localnet and runs tests
```
*Note: Ensure `solana-test-validator` is running if not using `anchor test`.*

### 3. Run Oracle
```bash
cd oracle
npm install
node index.js
```
The oracle will start polling/simulating transactions and submitting them to the chain.

### 4. Run Frontend Dashboard
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to view the dashboard.

## 🏗 Architecture
```mermaid
graph LR
    Client[Client / Transaction Source] -->|Tx Data| Oracle[Oracle Middleware]
    Oracle -->|1. Request Score| AI[AI Backend (FastAPI)]
    AI -->|2. Score + Signature| Oracle
    Oracle -->|3. Submit Signed Tx| Solana[Solana Smart Contract]
    Solana -->|4. Verify & Log| Ledger[On-Chain Ledger]
    Frontend[React Dashboard] -->|Read Logs| Solana
    Frontend -->|Monitor| Oracle
```

## 🔮 Future Work
- **Governance Token**: Implement a DAO for voting on fraud thresholds.
- **Multi-chain Support**: Expand to Ethereum and Polygon.
- **Federated Learning**: Allow banks to train the model collaboratively without sharing data.
