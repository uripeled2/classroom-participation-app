import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

function JoinRoom({ onJoin }) {
  const [role, setRole] = useState('student');
  const [roomId, setRoomId] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }
    
    if (role === 'student' && !roomId.trim()) {
      setError('Please enter a room code');
      return;
    }
    
    // Generate a new room ID if teacher is creating a room
    const finalRoomId = role === 'teacher' ? uuidv4().substring(0, 6) : roomId;
    
    onJoin(role, finalRoomId, name);
  };

  return (
    <div className="card">
      <h1 className="text-center mb-2">Classroom Participation App</h1>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>I am a:</label>
          <select 
            value={role} 
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
          </select>
        </div>
        
        <div className="input-group">
          <label>Your Name:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
          />
        </div>
        
        {role === 'student' && (
          <div className="input-group">
            <label>Room Code:</label>
            <input 
              type="text" 
              value={roomId} 
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Enter room code"
            />
          </div>
        )}
        
        <button type="submit" className="btn btn-large">
          {role === 'teacher' ? 'Create Room' : 'Join Room'}
        </button>
      </form>
    </div>
  );
}

export default JoinRoom;
