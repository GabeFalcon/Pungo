import React, { useState } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import logo from "../images/logo.png";
import "./RejoinRoom.css";

const RejoinRoom = () => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRejoin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('You must be logged in to rejoin a room.');
        return;
      }

      const roomsRef = collection(db, 'rooms');
      const q = query(roomsRef, where('roomCode', '==', roomCode));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('Room not found.');
        return;
      }

      const roomDoc = querySnapshot.docs[0];
      const roomData = roomDoc.data();
      const roomId = roomDoc.id;

      if (!roomData.members.includes(user.uid)) {
        setError('You are not a member of this room.');
        return;
      }

      navigate(`/rooms/${roomId}`, { state: { roomCode } });

    } catch (err) {
      console.error('Error rejoining room:', err);
      setError('Failed to rejoin room. Please try again.');
    }
  };

  return (
    <div className="rejoin-room-container">
      <img src={logo} alt="Pungo Logo" className="logo" />
      <form onSubmit={handleRejoin}>
        <input
          type="text"
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          placeholder="Enter Room Code"
          required
        />
        <button type="submit">Rejoin Room</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
};

export default RejoinRoom;
