# Block+ - Decentralized File Storage on CESS Network

## 🎯 What is Block+?

Block+ is a **decentralized file storage service** running on the **CESS Network** with DeOSS. It provides secure, private, and censorship-resistant file storage using blockchain technology.

## 🔐 Why Decentralized Storage?

- **True Ownership**: You control your data, not corporations
- **Enhanced Security**: End-to-end encryption & no single point of failure
- **Censorship Resistance**: Files can't be arbitrarily removed
- **Cost Efficiency**: Reduced middleman costs

## 🏗️ Tech Stack

- **Blockchain**: CESS Network (Substrate-based)
- **Web3**: @polkadot.js, @polkadot/extension-dapp
- **Backend**: Express.js, SQLite, JWT, Multer
- **Frontend**: React, TypeScript, TanStack Router, Tailwind CSS


## 📁 Features
- ✅ Easy-to-use (Clear abstraction, no previous knowledge is Blockchain is needed)
- ✅ Secure file upload/download
- ✅ Client-side encryption
- ✅ Wallet-based authentication (Polkadot.js)
- ✅ File management (list, delete)
- ✅ Progress tracking & notifications

## 🌐 Usage

1. Open frontend URL
2. Connect Polkadot wallet
3. Register username
4. Upload/manage files

## 🚀 Setup

1. **Backend:**
```bash
cd backend
npm install
```
Edit `.env`:
```env
JWT_SECRET="your_jwt_secret_key"
TERRITORY="your_territory_name"
ACCOUNT="your_wallet"
SIGNATURE="your_signature"
MESSAGE="your_territory_name"
CESS_API_URL="deoss_gateway_addr"
```

2. **Frontend:**
```bash
cd frontend
npm install
```

## ▶️ Run

**Backend (always port 5003):**
```bash
cd backend
npm run dev
```

**Frontend (random port):**
```bash
cd frontend
npm run dev
```
Check console for frontend URL.

## 🌐 Use

1. Open frontend URL from console
2. Register with Polkadot{.js} extension
3. Everything works automatically after login

## 📝 Notes
- Backend: `localhost:5003`
- Frontend: `localhost:[RANDOM_PORT]`
- Polkadot wallet required
- Edit `.env` before starting backend

---

*Block+ puts you in control of your digital assets in the Web3 era.*
