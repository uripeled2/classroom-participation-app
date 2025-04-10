const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Store room data
const rooms = {};

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Teacher creates a room
  socket.on('create-room', ({ roomId, name }) => {
    socket.join(roomId);
    
    rooms[roomId] = {
      teacher: { id: socket.id, name },
      students: {},
      isQuestionActive: false,
      selectedStudent: null
    };
    
    console.log(`Teacher ${name} created room ${roomId}`);
  });

  // Student joins a room
  socket.on('join-room', ({ roomId, name }) => {
    if (!rooms[roomId]) {
      socket.emit('error', 'Room does not exist');
      return;
    }
    
    socket.join(roomId);
    
    const student = { id: socket.id, name };
    rooms[roomId].students[socket.id] = student;
    
    // Notify teacher about new student
    const teacherId = rooms[roomId].teacher.id;
    io.to(teacherId).emit('student-joined', student);
    
    console.log(`Student ${name} joined room ${roomId}`);
  });

  // Teacher asks a question
  socket.on('ask-question', ({ roomId }) => {
    if (!rooms[roomId]) return;
    
    rooms[roomId].isQuestionActive = true;
    rooms[roomId].selectedStudent = null;
    
    // Reset all raised hands
    Object.keys(rooms[roomId].students).forEach(studentId => {
      rooms[roomId].students[studentId].hasRaisedHand = false;
    });
    
    // Notify all students in the room
    socket.to(roomId).emit('question-asked');
    
    console.log(`Teacher asked a question in room ${roomId}`);
  });

  // Student raises hand
  socket.on('raise-hand', ({ roomId }) => {
    if (!rooms[roomId] || !rooms[roomId].isQuestionActive) return;
    
    // Mark student as having raised hand
    if (rooms[roomId].students[socket.id]) {
      rooms[roomId].students[socket.id].hasRaisedHand = true;
      
      // Notify teacher
      const teacherId = rooms[roomId].teacher.id;
      io.to(teacherId).emit('hand-raised', socket.id);
      
      console.log(`Student ${rooms[roomId].students[socket.id].name} raised hand in room ${roomId}`);
    }
  });

  // Teacher starts timer
  socket.on('timer-started', ({ roomId }) => {
    if (!rooms[roomId]) return;
    
    // Notify all students in the room
    socket.to(roomId).emit('timer-start', 10); // 10 seconds
    
    console.log(`Timer started in room ${roomId}`);
  });

  // Teacher selects a student
  socket.on('student-selected', ({ roomId, studentId }) => {
    if (!rooms[roomId]) return;
    
    rooms[roomId].isQuestionActive = false;
    rooms[roomId].selectedStudent = studentId;
    
    // Notify all students in the room
    io.to(roomId).emit('selected', studentId);
    
    console.log(`Student ${rooms[roomId].students[studentId]?.name} was selected in room ${roomId}`);
  });

  // Teacher resets the room
  socket.on('reset-room', ({ roomId }) => {
    if (!rooms[roomId]) return;
    
    rooms[roomId].isQuestionActive = false;
    rooms[roomId].selectedStudent = null;
    
    // Reset all raised hands
    Object.keys(rooms[roomId].students).forEach(studentId => {
      rooms[roomId].students[studentId].hasRaisedHand = false;
    });
    
    // Notify all students in the room
    socket.to(roomId).emit('room-reset');
    
    console.log(`Room ${roomId} was reset`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Find all rooms where this user is
    Object.keys(rooms).forEach(roomId => {
      const room = rooms[roomId];
      
      // If user was a teacher, delete the room
      if (room.teacher && room.teacher.id === socket.id) {
        // Notify all students in the room
        io.to(roomId).emit('room-closed');
        delete rooms[roomId];
        console.log(`Room ${roomId} closed because teacher left`);
      }
      // If user was a student, remove from room
      else if (room.students[socket.id]) {
        delete room.students[socket.id];
        
        // Notify teacher
        const teacherId = room.teacher.id;
        io.to(teacherId).emit('student-left', socket.id);
        
        console.log(`Student left room ${roomId}`);
      }
    });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});