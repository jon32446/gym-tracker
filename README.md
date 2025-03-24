# Gym Tracker PWA

A simple, offline-capable Progressive Web App (PWA) for tracking your gym workouts. This application allows you to record and manage your exercise history with details like date, muscle group, exercise, sets, reps, and weights.

## Deployment

The app is available at https://jon32446.github.io/gym-tracker/

You can also run it locally for development as described in the [Local Development](#local-development) section.

## Features

- **Progressive Web App** - Install on your home screen (iOS, Android, desktop)
- **Works Offline** - All data stored locally using IndexedDB
- **Complete Workout Management**
  - Add, edit, and delete workout entries
  - Filter workouts by date
  - Group exercises by muscle groups with autocomplete
  - View workout history in a sortable table
- **Data Management**
  - Export workout data as CSV for backup
  - Import workout data from CSV files
  - Securely clear all data with confirmation safeguards
- **Responsive Design** - Optimized for mobile and desktop
- **Automatic Updates** - Notification system for new versions

## Installation Instructions

### iOS (iPhone/iPad)

1. Open Safari and navigate to https://jon32446.github.io/gym-tracker/
2. Tap the Share button (rectangle with arrow) at the bottom of the screen
3. Scroll down and tap "Add to Home Screen"
4. Give the app a name (or keep the default) and tap "Add"
5. The app icon will appear on your home screen

### Android

1. Open Chrome and navigate to https://jon32446.github.io/gym-tracker/
2. Tap the three-dot menu in the top-right corner
3. Tap "Add to Home screen" or "Install app"
4. Confirm by tapping "Add" or "Install"
5. The app icon will appear on your home screen

### Desktop (Windows/Mac/Linux)

1. Open Chrome, Edge, or any Chromium-based browser
2. Navigate to https://jon32446.github.io/gym-tracker/
3. Look for the install icon (+ symbol) in the address bar
4. Click it and select "Install"
5. The app will open in its own window and be added to your applications

## Using the App

1. **Adding Workouts**:
   - Select a date, muscle group, and exercise
   - Enter sets, reps, and weight information
   - Click "Add Exercise" to save

2. **Managing Workouts**:
   - View your workout history in the table
   - Use the date filter to show workouts from a specific day
   - Edit or delete individual entries using the action buttons

3. **Data Management**:
   - **Export CSV**: Create a backup of all your workout data
   - **Import CSV**: Restore data from a previously exported CSV file
   - **Clear All Data**: Remove all workout data (requires typing "DELETE" to confirm)

## Updating the App

When a new version is available, you'll see an "Update Available" notification at the bottom of the screen. You have two options:

1. **Update Now**: Click this button to immediately reload with the latest version
2. **Later**: Dismiss the notification and continue using the current version

### Force Update Instructions

If you don't see the update notification or need to force an update:

#### iOS
1. Close the app by swiping it up from the app switcher
2. Go to Settings → Safari → Advanced → Website Data
3. Find and remove data for the app's domain (jon32446.github.io)
4. Reopen the app from your home screen

#### Android
1. Open Chrome and tap the three-dot menu
2. Go to Settings → Site Settings → All Sites
3. Find the app's domain (jon32446.github.io)
4. Tap "Clear & reset"
5. Reopen the app from your home screen

#### Desktop
1. Open the browser you used to install the app
2. Navigate to the app URL
3. Press Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac) to force reload
4. Alternatively, clear the browser cache for the specific site

## Local Development

To run this app locally for development:

1. Clone the repository:
   ```
   git clone https://github.com/jon32446/gym-tracker.git
   cd gym-tracker
   ```

2. Start a local web server using one of these methods:

   With Node.js:
   ```
   npx http-server
   ```

   With Python 3:
   ```
   python -m http.server
   ```

   With Python 2:
   ```
   python -m SimpleHTTPServer
   ```

3. Access the app at `http://localhost:8000` or whichever port your server uses

## Data Privacy

- All data is stored locally on your device using IndexedDB
- No information is sent to any external servers
- Your workout data never leaves your device unless you export it
- Clearing your browser data will also delete your workout history

## Support and Feedback

For issues or feature requests, please open an issue on the GitHub repository.
