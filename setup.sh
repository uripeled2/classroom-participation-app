#!/bin/bash
# Quick setup script for Classroom Participation App

# Install dependencies
echo "Installing dependencies for frontend and backend..."
npm run install:all

# Start the backend server
echo "Starting the backend server..."
npm run start:backend