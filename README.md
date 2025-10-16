# HatGPT Ultra

## Setup

1. Server env (`server/.env`):
```
MONGO_URI=mongodb://127.0.0.1:27017/hatgpt_ultra
JWT_SECRET=replace_me_with_a_strong_secret
PORT=4000
```

2. Client env (`client/.env`):
```
VITE_API_BASE=/api
```

3. Install & run
- Server: `cd server && npm install && npm run dev`
- Client: `cd client && npm install && npm run dev`

Puter SDK is loaded from `index.html`. Select up to 5 models and chat/compare.
