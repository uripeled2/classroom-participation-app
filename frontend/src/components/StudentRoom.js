import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

function StudentRoom({ roomId, name }) {
  const [socket, setSocket] = useState(null);
  const [roomStatus, setRoomStatus] = useState('waiting'); 
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [timer, setTimer] = useState(null);

  // The student's typed answer
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001');
    setSocket(newSocket);

    // Join the specified room
    newSocket.emit('join-room', { roomId, name });

    // If teacher asks a new question, reset
    newSocket.on('question-asked', () => {
      setRoomStatus('question');
      setHasRaisedHand(false);
      setIsSelected(false);
      setAnswer(''); // Clear previous answer if any
    });

    // Timer started
    newSocket.on('timer-start', (time) => {
      setRoomStatus('timer');
      setTimer(time);
    });

    // Student is selected
    newSocket.on('selected', (selectedStudentId) => {
      const wasSelected = selectedStudentId === newSocket.id;
      setIsSelected(wasSelected);
      setRoomStatus('selected');
    });

    // Room reset
    newSocket.on('room-reset', () => {
      setRoomStatus('waiting');
      setHasRaisedHand(false);
      setIsSelected(false);
      setTimer(null);
      setAnswer('');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, name]);

  // NEW: Single function for both steps
  const raiseHandWithAnswer = () => {
    // Only allow if question is active and you haven't raised your hand yet
    if (roomStatus !== 'question' || hasRaisedHand) return;

    if (socket) {
      // 1) Send the typed answer to the server
      socket.emit('answer-submitted', { roomId, answer });

      // 2) Mark hand as raised
      setHasRaisedHand(true);
      socket.emit('raise-hand', { roomId });
    }
  };

  return (
    <div className="card">
      <h1>Student Room</h1>
      <h2>Room: {roomId}</h2>
      <p>Welcome, {name}!</p>

      {roomStatus === 'waiting' && (
        <p>Waiting for the teacher to ask a question...</p>
      )}

      {roomStatus === 'question' && (
        <div>
          <h3>The teacher asked a question!</h3>
          {/* Textarea for typing the answer */}
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={4}
            cols={40}
          />

          <div style={{ marginTop: '1rem' }}>
            {/* One button to do both: submit answer + raise hand */}
            {!hasRaisedHand ? (
              <button className="btn btn-large" onClick={raiseHandWithAnswer}>
                Submit Answer & Raise Hand ✋
              </button>
            ) : (
              <p>Your hand is raised. Waiting for selection...</p>
            )}
          </div>
        </div>
      )}

      {roomStatus === 'timer' && (
        <div>
          <h3>Time remaining: {timer}s</h3>
          <p>
            {hasRaisedHand
              ? 'Your hand is raised. Waiting for selection...'
              : 'You did not raise your hand for this question.'}
          </p>
        </div>
      )}

      {roomStatus === 'selected' && (
        <div>
          {isSelected ? (
            <h2 style={{ color: '#4CAF50' }}>You were selected to answer! 🎯</h2>
          ) : (
            <p>Another student was selected.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default StudentRoom;
