# ZeroShare: Privacy-Preserving Data Analysis Platform

An enterprise-grade prototype for secure multi-party computation (SMPC) and document integrity verification.

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js**: v18+ 
- **MongoDB**: Running locally at `mongodb://localhost:27017`
- **Redis**: Running locally at `6379` (Optional, system will fallback)

### 2. Installation
```bash
npm install
```

### 3. Run the Application
```bash
npm start
```
The application will be live at: **http://localhost:5000**

## 🔐 Access Credentials
For the purpose of evaluation and testing, use the following credentials on the login screen:

- **Organization ID**: `admin`
- **Secure Key**: `password123`

*(Note: These are seeded automatically via the backend on first run.)*

## 🛡️ Key Features
- **Dashboard Overview**: Centralized view of system health and historical proofs.
- **Privacy Analysis**: SMPC-based aggregate computation across multiple university nodes.
- **Document Integrity**: Local document hashing (SHA-256) and immutable storage.
- **Audit System**: Cryptographic event logging for all privileged actions.
- **Zero-Raw-Data Strategy**: No PDF or sensitive raw datasets are ever stored on the server.

## 🛠️ Security Hardening
- **JWT Authentication**: Secure session management (2-hour expiry).
- **Rate Limiting**: Protection against brute-force and DoS attacks.
- **SMPC Privacy**: Local data masking ensures only encrypted/aggregated data hits the computation layer.
- **Centralized Error Handling**: Standardized responses without stack trace leakage.
