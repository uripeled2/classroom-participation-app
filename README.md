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