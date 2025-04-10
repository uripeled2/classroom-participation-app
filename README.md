# Classroom Participation App

A real-time web application for facilitating classroom participation by allowing teachers to randomly select students who wish to answer questions.

## Features

- Teacher and student roles
- Real-time room-based participation
- Random student selection after a countdown
- Simple, responsive user interface

## How It Works

1. **Teacher Creates a Room:**
   - Teacher logs in and receives a unique room code
   - Teacher shares the room code with students

2. **Students Join:**
   - Students use the room code to join the teacher's room
   - Students appear in the teacher's participant list

3. **Question Flow:**
   - Teacher asks a question verbally and clicks "Ask a Question" in the app
   - Students who want to answer click "Raise Hand"
   - Teacher starts a 10-second countdown
   - After countdown, the app randomly selects one student from those who raised their hands
   - The selected student's name is highlighted for everyone to see

## Getting Started

### Prerequisites

- Node.js (v14 or newer)
- npm or yarn

### Quick Start

1. Clone the repository
2. Run the setup script:
   ```
   ./setup.sh
   ```
   This will install all dependencies and start the backend server.
   
3. In a separate terminal, start the React development server:
   ```
   npm start
   ```

### Manual Installation

Alternatively, you can install and run the components manually:

1. Install all dependencies:
   ```
   npm install
   ```
2. Start the backend server:
   ```
   node server.js
   ```
3. Start the React development server (in a separate terminal):
   ```
   npm start
   ```

## Deployment Options

### 1. Render.com (Recommended for Simplicity)

Render offers a free tier for both static sites and backend services.

1. Sign up at [Render.com](https://render.com/)

2. Deploy the frontend:
   - Create a new "Static Site"
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`

3. Deploy the backend:
   - Create a new "Web Service"
   - Connect your GitHub repository
   - Set build command: `npm install`
   - Set start command: `node server.js`
   - Select the free plan

4. Update the Socket.IO connection URL in your React components to point to your Render backend URL.

### 2. Netlify + Heroku

1. Deploy frontend to Netlify (free):
   - Sign up at [Netlify.com](https://www.netlify.com/)
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set publish directory: `build`

2. Deploy backend to Heroku (free with limitations):
   - Sign up at [Heroku.com](https://www.heroku.com/)
   - Create a new app
   - Connect your GitHub repository or use Heroku CLI
   - Set up a `Procfile` with: `web: node server.js`
   - Deploy and scale your dynos

3. Update the Socket.IO connection URL in your frontend code to point to your Heroku app URL.

### 3. Railway.app

Railway offers a good free tier with simple deployment:

1. Sign up at [Railway.app](https://railway.app/)
2. Create a new project and connect your GitHub repository
3. Deploy both frontend and backend as separate services
4. Configure environment variables and update the Socket.IO connection URL

### Preparing Your Code for Deployment

1. Update the Socket.IO connection in your React components (TeacherRoom.js and StudentRoom.js):

```javascript
// From this:
const newSocket = io('http://localhost:3001');

// To this:
const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001');
```

2. Add to your package.json:

```json
"engines": {
  "node": ">=14"
},
```

3. Create a .env file for local development:
```
REACT_APP_BACKEND_URL=http://localhost:3001
```

## Technologies Used

- **Frontend:** React.js
- **Backend:** Node.js, Express
- **Real-time Communication:** Socket.IO
- **Styling:** CSS

## Project Structure

```
classroom-participation/
├── public/
├── src/
│   ├── components/
│   │   ├── JoinRoom.js      # Initial room joining component
│   │   ├── StudentRoom.js   # Student view component
│   │   └── TeacherRoom.js   # Teacher view component
│   ├── styles/
│   ├── App.js               # Main application component
│   └── index.js             # Application entry point
└── server.js                # Socket.IO and Express server
```