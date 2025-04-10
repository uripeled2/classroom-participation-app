import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

function TeacherRoom({ roomId, name }) {
  const [socket, setSocket] = useState(null);
  const [isQuestionActive, setIsQuestionActive] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [timer, setTimer] = useState(10);
  const [isCounting, setIsCounting] = useState(false);

  // Connect to socket server on component mount
  useEffect(() => {
    // Use environment variable for server URL or default to localhost
    const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001'); 
    setSocket(newSocket);

    // Identify as a teacher and create room
    newSocket.emit('create-room', { roomId, name });

    // Listen for students joining
    newSocket.on('student-joined', (student) => {
      setStudents(prev => [...prev, { ...student, hasRaisedHand: false }]);
    });

    // Listen for students leaving
    newSocket.on('student-left', (studentId) => {
      setStudents(prev => prev.filter(s => s.id !== studentId));
    });

    // Listen for hand raises
    newSocket.on('hand-raised', (studentId) => {
      setStudents(prev => prev.map(s => 
        s.id === studentId ? { ...s, hasRaisedHand: true } : s
      ));
    });

    return () => {
      newSocket.disconnect();
    };
  }, [roomId, name]);

  // Timer countdown effect
  useEffect(() => {
    let interval;
    
    if (isCounting && timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setIsCounting(false);
      selectRandomStudent();
    }
    
    return () => clearInterval(interval);
  }, [isCounting, timer]);

  const askQuestion = () => {
    if (isQuestionActive) return;
    
    setIsQuestionActive(true);
    setSelectedStudent(null);
    setStudents(prev => prev.map(s => ({ ...s, hasRaisedHand: false })));
    setTimer(10);
    
    if (socket) {
      socket.emit('ask-question', { roomId });
    }
  };

  const startTimer = () => {
    setIsCounting(true);
    if (socket) {
      socket.emit('timer-started', { roomId });
    }
  };

  const selectRandomStudent = () => {
    const studentsWithHandsRaised = students.filter(s => s.hasRaisedHand);
    
    if (studentsWithHandsRaised.length > 0) {
      const randomIndex = Math.floor(Math.random() * studentsWithHandsRaised.length);
      const selected = studentsWithHandsRaised[randomIndex];
      setSelectedStudent(selected);
      
      if (socket) {
        socket.emit('student-selected', { roomId, studentId: selected.id });
      }
    } else {
      setSelectedStudent(null);
    }
    
    setIsQuestionActive(false);
  };

  const resetRoom = () => {
    setIsQuestionActive(false);
    setSelectedStudent(null);
    setStudents(prev => prev.map(s => ({ ...s, hasRaisedHand: false })));
    setTimer(10);
    setIsCounting(false);
    
    if (socket) {
      socket.emit('reset-room', { roomId });
    }
  };

  return (
    <div>
      <div className="card">
        <h1>Teacher Room</h1>
        <h2>Room Code: <span style={{ color: '#4CAF50' }}>{roomId}</span></h2>
        <p>Share this code with your students so they can join this room.</p>
        
        <div className="mb-2">
          <h3>Connected Students: {students.length}</h3>
          <ul>
            {students.map(student => (
              <li key={student.id}>
                {student.name} {student.hasRaisedHand && '✋'}
                {selectedStudent?.id === student.id && ' 🎯'}
              </li>
            ))}
          </ul>
        </div>
        
        {!isQuestionActive && !selectedStudent && (
          <button className="btn btn-large" onClick={askQuestion}>
            Ask a Question
          </button>
        )}
        
        {isQuestionActive && (
          <div>
            <h3>Question is active!</h3>
            <p>Students who want to answer: {students.filter(s => s.hasRaisedHand).length}</p>
            
            {!isCounting ? (
              <button className="btn" onClick={startTimer}>
                Start 10s Timer
              </button>
            ) : (
              <h3>Time remaining: {timer}s</h3>
            )}
          </div>
        )}
        
        {selectedStudent && (
          <div>
            <h3>Selected student:</h3>
            <p style={{ fontSize: '24px', fontWeight: 'bold' }}>{selectedStudent.name}</p>
          </div>
        )}
        
        <button className="btn btn-secondary" onClick={resetRoom}>
          Reset Room
        </button>
      </div>
    </div>
  );
}

export default TeacherRoom;
