import React, { useState } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, arrayUnion, doc } from 'firebase/firestore';
import logo from "../images/logo.png";
import "./JoinRoom.css";

const JoinRoom = () => {
  const [roomCode, setRoomCode] = useState(''); // Stores the room code
  const [punishment, setPunishment] = useState(''); // Store the punishment entered
  const [error, setError] = useState(''); // Store error messages
  const navigate = useNavigate(); // Navigation

  const handleJoinRoom = async (e) => {
    e.preventDefault(); // Prevents the form from reloading the page
    setError('');

    // Check if the user is logged in
    try {
      const user = auth.currentUser;
      if (!user) {
        setError('You must be logged in to join a room.');
        return;
      }

      // Check if the room exists
      const roomsRef = collection(db, 'rooms');
      const q = query(roomsRef, where('roomCode', '==', roomCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Room not found. Please check the code and try again.');
        return;
      }

      // Get room data
      const roomDoc = querySnapshot.docs[0];
      const roomData = roomDoc.data();
      const roomId = roomDoc.id;

      // Check if the user is already a member
      if (roomData.members.includes(user.uid)) {
        setError('You are already in this room.');
        return;
      }

      // Ensure the user has entered a punishment
      if (!punishment.trim()) {
        setError('You must enter a punishment to join.');
        return;
      }

      // Add user to the room's members and store their punishment
      const roomRef = doc(db, 'rooms', roomId);
      await updateDoc(roomRef, {
        members: arrayUnion(user.uid),
        punishment: arrayUnion(punishment.trim()), // Correctly appends the punishment
      });

      navigate(`/rooms/${roomId}`, { state: { roomCode } }); // Redirect to the game room
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join room. Please try again.');
    }
  };

  return (
    <div className="join-room-container">
      <img src={logo} alt="Pungo Logo" className="logo" />
      <form onSubmit={handleJoinRoom}>
        <input
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          placeholder="Enter Room Code"
          required
        />
        <input
          type="text"
          value={punishment}
          onChange={(e) => setPunishment(e.target.value)}
          placeholder="Enter your punishment"
          required
        />
        <button type="submit">Join Room</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default JoinRoom;
