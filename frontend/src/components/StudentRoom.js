import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

function StudentRoom({ roomId, name }) {
  const [socket, setSocket] = useState(null);
  const [roomStatus, setRoomStatus] = useState('waiting'); // waiting, question, selected, timer
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [timer, setTimer] = useState(null);
  const [joinError, setJoinError] = useState('');

  // Connect to socket server on component mount
  useEffect(() => {
    // Use environment variable for server URL or default to localhost
    const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001');
    setSocket(newSocket);

    // Attempt to join the room
    newSocket.emit('join-room', { roomId, name });

    // If server says the room doesn't exist
    newSocket.on('join-error', (errorMsg) => {
      setJoinError(errorMsg);
    });

    // Listen for question being asked
    newSocket.on('question-asked', () => {
      setRoomStatus('question');
      setHasRaisedHand(false);
      setIsSelected(false);
    });

    // Listen for timer start
    newSocket.on('timer-start', (time) => {
      setRoomStatus('timer');
      setTimer(time);
    });

    // Listen for student selection
    newSocket.on('selected', (selectedStudentId) => {
      const wasSelected = selectedStudentId === newSocket.id;
      setIsSelected(wasSelected);
      setRoomStatus('selected');
    });

    // Listen for room reset
    newSocket.on('room-reset', () => {
      setRoomStatus('waiting');
      setHasRaisedHand(false);
      setIsSelected(false);
      setTimer(null);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, name]);

  const raiseHand = () => {
    if (roomStatus !== 'question' || hasRaisedHand) return;
    
    setHasRaisedHand(true);
    
    if (socket) {
      socket.emit('raise-hand', { roomId });
    }
  };

  return (
    <div className="card">
      {/* Display error if we got one */}
      {joinError && <p style={{ color: 'red' }}>{joinError}</p>}  

      <h1>Student Room</h1>
      <h2>Room: {roomId}</h2>
      <p>Welcome, {name}!</p>
      
      {roomStatus === 'waiting' && (
        <div>
          <p>Waiting for the teacher to ask a question...</p>
        </div>
      )}
      
      {roomStatus === 'question' && (
        <div>
          <h3>The teacher asked a question!</h3>
          {!hasRaisedHand ? (
            <button 
              className="btn btn-large"
              onClick={raiseHand}
            >
              Raise Hand ✋
            </button>
          ) : (
            <p>Your hand is raised. Waiting for selection...</p>
          )}
        </div>
      )}
      
      {roomStatus === 'timer' && (
        <div>
          <h3>Time remaining: {timer}s</h3>
          <p>{hasRaisedHand ? 
            'Your hand is raised. Waiting for selection...' : 
            'You did not raise your hand for this question.'}</p>
        </div>
      )}
      
      {roomStatus === 'selected' && (
        <div>
          {isSelected ? (
            <div>
              <h2 style={{ color: '#4CAF50' }}>You were selected to answer! 🎯</h2>
              <p>Please answer the question.</p>
            </div>
          ) : (
            <p>Another student was selected to answer this question.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentRoom;
