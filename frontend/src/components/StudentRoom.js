import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

function StudentRoom({ roomId, name }) {
  const [socket, setSocket] = useState(null);
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

  // This single button function does two things:
  // 1) Submit/Update the answer every time
  // 2) Raise hand only the first time (if not already raised)
  const submitOrUpdateAnswer = () => {
    if (!socket) return;

    // 1) Always update the server with the new answer
    socket.emit('answer-submitted', { roomId, answer });

    // 2) If student hasn’t raised hand yet, raise it now
    if (!hasRaisedHand && roomStatus === 'question') {
      setHasRaisedHand(true);
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
        <p>Waiting for the teacher to ask a question...</p>
      )}

      {(roomStatus === 'question' || roomStatus === 'timer') && (
        <div>
          <h3>The teacher asked a question!</h3>

          {/* Textarea for student's answer */}
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
                : 'Submit Answer & Raise Hand ✋'
              }
            </button>

            {hasRaisedHand && <p>You have raised your hand. Waiting for teacher’s action...</p>}
          </div>
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

      {roomStatus === 'timer' && (
        <div>
          <h3>Time remaining: {timer}s</h3>
        </div>
      )}

      {/* If teacher marked the answer wrong, show feedback; can keep updating */}
      {answerStatus === 'wrong' && (
        <div style={{ color: 'red', marginTop: '1rem' }}>
          Teacher says your answer is WRONG. Feel free to change and resubmit.
        </div>
      )}

      {/* If teacher marked correct, you can show a message or do nothing */}
      {/* {answerStatus === 'correct' && <p>Your answer is correct!</p>} */}
    </div>
  );
}

export default StudentRoom;
