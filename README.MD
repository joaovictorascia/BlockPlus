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
- **Storage**: DeOSS (Decentralized Object Storage Service)
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

## 🔧 DeOSS Setup

Before running Block+, you need to set up the DeOSS container for decentralized storage:

### 1. Create Configuration Directory
```bash
mkdir -p ./deoss-config
```

### 2. Generate Configuration File
```bash
docker rm -f deoss-gen 2>/dev/null || true
docker run --name deoss-gen \
  cesslab/deoss:c6ac8989b3ba59d152c5ab0fed5719988e40e900 \
  oss config
```

### 3. Copy Configuration
```bash
docker cp deoss-gen:/app/conf.yaml ./deoss-config/conf.yaml
docker rm deoss-gen
```

### 4. Update Configuration
Edit `./deoss-config/conf.yaml` and add your mnemonics:
```bash
nano ./deoss-config/conf.yaml
```

### 5. Run DeOSS Container
```bash
docker run -d \
  --name deoss \
  -p 8080:8080 \
  -v ./deoss-config/conf.yaml:/app/config.yaml \
  -v /mnt/deoss:/app/deoss/data \
  cesslab/deoss:latest \
  oss run -c /app/config.yaml
```

### 6. Verify DeOSS is Running
```bash
docker ps | grep deoss
docker logs deoss
```

**Note**: DeOSS will be available at `http://localhost:8080`. Update your backend `.env` file with this address.

## 🚀 Setup

1. **Backend:**
```bash
cd backend
npm install
```
Edit `/back-end/.env`:
```env
JWT_SECRET="your_jwt_secret_key"
PORT=5000                           # Server Port number
TERRITORY="your_territory_name"
ACCOUNT="your_wallet"
SIGNATURE="your_signature"
MESSAGE="your_territory_name"
CESS_API_URL="http://localhost:8080"  # DeOSS gateway address
```

2. **Frontend:**
```bash
cd frontend
npm install
```

## ▶️ Run

**DeOSS (must run first):**
```bash
# Verify DeOSS is running
docker ps | grep deoss
```

**Backend (port 5000):**
```bash
cd backend
npm run dev
```

**Frontend (port 3000):**
```bash
cd frontend
npm run dev
```
Check console for frontend URL.

## 🌐 Use

1. Ensure DeOSS container is running
2. Open frontend URL from console
3. Register with Polkadot{.js} extension
4. Everything works automatically after login

## 📝 Notes
- **DeOSS**: `localhost:8080` (required for storage)
- **Backend**: `localhost:5000`
- **Frontend**: `localhost:3000`
- Polkadot wallet required
- Edit `.env` before starting backend
- DeOSS must be running before using Block+

---

*Block+ puts you in control of your digital assets in the Web3 era.*