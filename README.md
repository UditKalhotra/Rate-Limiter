# 🚦 RateGate — Distributed API Rate Limiting Platform

A full-stack API rate limiting system that allows developers to create API keys, define custom rate limit rules, monitor traffic, and protect endpoints from abuse.

Built with **Node.js, Express, MongoDB, Redis, and React**.

---

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication
- Secure password hashing using bcrypt
- Protected routes
- Role-based access control

### 🔑 API Key Management
- Generate API keys for applications
- Manage multiple API keys
- Revoke compromised keys
- Secure API key validation

### ⚡ Rate Limiting Engine

Supports multiple algorithms:

- Sliding Window Rate Limiting
- Token Bucket Rate Limiting

Features:

- Endpoint-level rules
- HTTP method-specific limits
- Real-time request validation
- Abuse prevention

### 📊 Analytics Dashboard

Monitor:

- Total requests
- Allowed requests
- Blocked requests
- API usage patterns
- Traffic statistics

### 🖥️ React Dashboard

Modern frontend dashboard with:

- User authentication
- API key management
- Rule configuration
- Testing console
- Traffic visualization

---

# 🏗️ Architecture


                 React Frontend
                       |
                       |
                    Axios
                       |
                       |
                 Express API
                       |
        --------------------------------
        |              |               |
     MongoDB        Redis        JWT Auth
        |
        |
   Application Data


---

# 🛠️ Tech Stack

## Backend

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | API framework |
| MongoDB | Database |
| Mongoose | ODM |
| Redis | Fast request tracking |
| JWT | Authentication |
| bcrypt | Password hashing |

## Frontend

| Technology | Purpose |
|------------|---------|
| React 18 | UI framework |
| Vite | Build tool |
| Axios | API communication |
| React Router | Navigation |
| Recharts | Data visualization |
| CSS | Styling |

---

# 📁 Project Structure
