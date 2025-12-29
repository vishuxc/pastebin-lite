# Pastebin Lite

Pastebin Lite is a backend application that allows users to create text pastes and share a link to view them.
Pastes can optionally expire based on time-to-live (TTL) or maximum view count.

---

## Features

- Create text paste
- Generate shareable URL
- View paste in browser
- Time-based expiry (TTL)
- View-count limit
- Safe HTML rendering

---

## Tech Stack

- Backend: Node.js, Express
- Database: MySQL

---

## API Endpoints

GET /api/healthz  
POST /api/pastes  
GET /api/pastes/:id  
GET /p/:id  

---

## Persistence Layer

This project uses MySQL as the persistence layer.
All paste data is stored in the database to ensure persistence across requests.

---

## Deterministic Time Support

When TEST_MODE=1 is enabled, the application reads the header:

x-test-now-ms

This is used for expiry logic during automated testing.

---

## Run Locally

1. Install dependencies
   npm install

2. Create .env file
   PORT=3000  
   DB_HOST=localhost  
   DB_USER=root  
   DB_PASSWORD=yourpassword  
   DB_NAME=pastebin_lite  

3. Create database and table

4. Start server
   node src/app.js
