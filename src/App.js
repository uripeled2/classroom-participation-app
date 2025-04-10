import React, { useState } from 'react';
import './styles/App.css';
import TeacherRoom from './components/TeacherRoom';
import StudentRoom from './components/StudentRoom';
import JoinRoom from './components/JoinRoom';

function App() {
  const [role, setRole] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [name, setName] = useState('');

  const handleJoinRoom = (selectedRole, roomCode, username) => {
    setRole(selectedRole);
    setRoomId(roomCode);
    setName(username);
  };

  return (
    <div className="app">
      {!role && (
        <JoinRoom onJoin={handleJoinRoom} />
      )}
      
      {role === 'teacher' && (
        <TeacherRoom roomId={roomId} name={name} />
      )}
      
      {role === 'student' && (
        <StudentRoom roomId={roomId} name={name} />
      )}
    </div>
  );
}

export default App;
