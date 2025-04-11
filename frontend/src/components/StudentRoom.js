import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

function StudentRoom({ roomId, name }) {
  const [socket, setSocket] = useState(null);
  // 'waiting' | 'question' | 'timer' | 'selected'
  const [roomStatus, setRoomStatus] = useState('waiting'); 
  const [hasRaisedHand, setHasRaisedHand] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [timer, setTimer] = useState(null);
  const [answer, setAnswer] = useState('');
  const [answerStatus, setAnswerStatus] = useState('none'); // 'none' | 'correct' | 'wrong'
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001');
    setSocket(newSocket);

    // Join the specified room
    newSocket.emit('join-room', { roomId, name });

    // If server says the room doesn't exist
    newSocket.on('join-error', (errorMsg) => {
      setJoinError(errorMsg);
    });

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

    newSocket.on('answer-marked', ({ studentId, answerStatus }) => {
      // If it's THIS student, update their local status
      if (studentId === newSocket.id) {
        setAnswerStatus(answerStatus);
      }
    });

    newSocket.on('answer-updated', ({ studentId, answer, answerStatus }) => {
      // if it's the local user
      if (studentId === newSocket.id) {
        setAnswer(answer);         // Store the new answer
        setAnswerStatus(answerStatus); // Should be 'none' in this scenario
      }
    });

    // Room reset
    newSocket.on('room-reset', () => {
      setRoomStatus('waiting');
      setHasRaisedHand(false);
      setIsSelected(false);
      setTimer(null);
      setAnswer('');
      setAnswerStatus('none');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, name]);

  // Tick the timer down locally
  useEffect(() => {
    let interval;
    if (roomStatus === 'timer' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [roomStatus, timer]);

  // This single button function does two things:
  // 1) Submit/Update the answer every time
  // 2) Raise hand only the first time (if not already raised)
  const submitOrUpdateAnswer = () => {
    if (!socket) return;
    // Only allow if question or timer is active
    if (roomStatus !== 'question' && roomStatus !== 'timer') return;

    // 1) Always update the server with the new answer
    socket.emit('answer-submitted', { roomId, answer });

    // 2) If student hasn’t raised hand yet, raise it now
    if (!hasRaisedHand) {
      setHasRaisedHand(true);
      socket.emit('raise-hand', { roomId });
    }
  };

  const renderQuestionUI = () => {
    // Student can always type or re-submit while it's question or timer
    return (
      <div>
        <h3>The teacher asked a question!</h3>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          placeholder="Type your answer here..."
          rows={4}
          cols={40}
        />

        <div style={{ marginTop: '1rem' }}>
          <button className="btn btn-large" onClick={submitOrUpdateAnswer}>
            {hasRaisedHand
              ? 'Update Answer'
              : 'Submit Answer & Raise Hand ✋'}
          </button>
          {hasRaisedHand && <p>Your hand is raised.</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="card">
      {/* Display error if we got one */}
      {joinError && <p style={{ color: 'red' }}>{joinError}</p>}  
      <h1>Student Room</h1>
      <h2>Room: {roomId}</h2>
      <p>Welcome, {name}!</p>

      {roomStatus === 'waiting' && <p>Waiting for the teacher to ask a question...</p>}

      {/* Show question UI for both 'question' and 'timer' states */}
      {(roomStatus === 'question' || roomStatus === 'timer') && renderQuestionUI()}

      {/* Show timer if in 'timer' state */}
      {roomStatus === 'timer' && (
        <div>
          <h3>Time remaining: {timer}s</h3>
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

      {/* If teacher marked wrong */}
      {answerStatus === 'wrong' && (
        <div style={{ color: 'red', marginTop: '1rem' }}>
          Teacher says your answer is WRONG. Feel free to update and re-submit.
        </div>
      )}
    </div>
  );
}

export default StudentRoom;
