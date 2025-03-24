# Gym Tracker PWA

A simple, offline-capable Progressive Web App (PWA) for tracking your gym workouts. This application allows you to plan and record your gym sessions with details like date, muscle group, exercise, sets, reps, and weights.

## Features

- Progressive Web App (PWA) - can be installed on your iPhone home screen
- Works offline - all data stored locally on your device
- No Apple developer fees required
- Simple and intuitive interface
- Add, edit, and delete workout entries
- Filter workouts by date
- Responsive design - works on mobile and desktop

## Installation on iPhone

1. Open Safari and navigate to the hosted app URL
2. Tap the Share button at the bottom of the screen
3. Scroll down and tap "Add to Home Screen"
4. Give the app a name (or keep the default) and tap "Add"
5. The app icon will appear on your home screen

## Local Development

To run this app locally for development:

1. You'll need a simple HTTP server. If you have Node.js installed, you can use:
   ```
   npx http-server
   ```

2. Or with Python:
   ```
   # Python 3
   python -m http.server
   
   # Python 2
   python -m SimpleHTTPServer
   ```

3. Access the app at `http://localhost:8000` (or whichever port your server uses)

## Data Storage

This app uses IndexedDB for local storage:
- All your workout data is stored locally on your device
- No data is sent to any server
- Clearing your browser data will also clear your workout data

## Deployment

To deploy this app for use on your iPhone:

1. Host the files on any web server or hosting service (GitHub Pages, Netlify, Vercel, etc.)
2. Access the URL on your iPhone using Safari
3. Follow the "Installation on iPhone" instructions above
