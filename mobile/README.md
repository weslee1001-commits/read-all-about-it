# Mobile (Expo)

This folder contains guidance to create an Expo mobile app that connects to the same backend.

Quick start:

```bash
npx expo init mobile-app
# choose a managed React Native template
cd mobile-app
npm install socket.io-client
# Implement shared UI/colors and call the backend at http://localhost:4000 (or your deployed URL)
```

Use the same design tokens (prime blue / accent) and the `POST /reviews` and Socket.IO events.
