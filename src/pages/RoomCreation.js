import React, { useState } from 'react';
import { auth, db } from '../firebase/firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, where, getDocs, arrayUnion } from 'firebase/firestore';
import "../pages/RoomCreation.css";
import logo from "../images/logo.png";

const RoomCreation = () => {
  const [bingoEntries, setBingoEntries] = useState(['']); 
  const [error, setError] = useState('');
  const [gameDuration, setGameDuration] = useState(''); // New state for game duration
  const [punishment, setPunishment] = useState(''); // New state for punishment
  const navigate = useNavigate();

  // Create a room code
  const generateRoomCode = (length = 6) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let roomCode = '';
    for (let i = 0; i < length; i++) {
      roomCode += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return roomCode;
  };

  const isRoomCodeUnique = async (roomCode) => {
    const roomsRef = collection(db, 'rooms');
    const q = query(roomsRef, where('roomCode', '==', roomCode));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // Returns true if code is unique
  };

  const handleAddEntry = () => {
    if (bingoEntries.length < 50) {
      setBingoEntries([...bingoEntries, '']);
    } else {
      alert('You can add up to 50 entries only.');
    }
  };

  const handleRemoveEntry = (index) => {
    const newEntries = bingoEntries.filter((_, i) => i !== index);
    setBingoEntries(newEntries);
  };

  const handleChange = (index, value) => {
    const newEntries = [...bingoEntries];
    newEntries[index] = value;
    setBingoEntries(newEntries);
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    setError('');

    // Validate that all bingo entries are unique
    const uniqueEntries = new Set(bingoEntries);
    if (uniqueEntries.size !== bingoEntries.length) {
      setError('Entries must be unique.');
      return;
    }

    // Validate that all bingo entries have no more than 120 characters
    if (bingoEntries.some(entry => entry.length > 120)) {
    setError('Bingo entries must not exceed 120 characters.');
    return;
    }

    if (parseInt(gameDuration) > 10 || parseInt(gameDuration) <= 0) {
        setError('Game duration must be between 1 and 10 hours.');
        return;
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('You must be logged in to create a room.');
        return;
      }

      let roomCode;
      let isUnique = false;

      // Ensure the room code is unique
      while (!isUnique) {
        roomCode = generateRoomCode();
        isUnique = await isRoomCodeUnique(roomCode);
      }

      const roomRef = await addDoc(collection(db, 'rooms'), {
        createdBy: user.uid,
        members: [user.uid],
        createdAt: serverTimestamp(),
        roomCode,
        bingoEntries: bingoEntries.map(entry => entry.trim()), // Store the bingo entries
        gameDuration: parseInt(gameDuration), // Store game duration
        punishment: arrayUnion(punishment.trim()), // Store punishment
        playerBoards: {},
      });

      navigate(`/rooms/${roomRef.id}`, { state: { roomCode, bingoEntries: bingoEntries.map(entry => entry.trim()) } }); // Redirect to newly created room
    } catch (err) {
      console.error('Error creating room:', err);
      setError('Failed to create room. Please try again.');
    }
  };

  return (
    <div className='room-creation'>
      <img src={logo} alt="Pungo Logo" className="logo" />
      <div className="create-room-container">
        <form onSubmit={handleCreateRoom}>
        <div>
            <label>
              Game Duration (In hours, max is 10 hours):
              <input
                type="number"
                value={gameDuration}
                onChange={(e) => setGameDuration(e.target.value)}
                min="1"
                max="10"
                required
              />
            </label>
          </div>

          <div>
            <label>
              Punishment (To be added to the punishment wheel):
              <input
                type="text"
                value={punishment}
                onChange={(e) => setPunishment(e.target.value)}
                placeholder="Enter a punishment."
                required
              />
            </label>
          </div>
          <div>
            <h3>Bingo Entries</h3>
            {bingoEntries.map((entry, index) => (
              <div key={index} className="bingo-entry">
                <input
                  type="text"
                  value={entry}
                  onChange={(e) => handleChange(index, e.target.value)}
                  placeholder={`Entry ${index + 1}`}
                  required
                  maxLength={120}
                />
                {bingoEntries.length > 1 && (
                  <button type="button" onClick={() => handleRemoveEntry(index)}>
                    Remove
                  </button>
                )}
              </div>
            ))}
            {bingoEntries.length < 50 && (
              <button type="button" onClick={handleAddEntry}>
                Add Entry
              </button>
            )}
          </div>
          <button type="submit">Create Room</button>
        </form>
        {error && <p>{error}</p>}
      </div>
    </div>
  );
};

export default RoomCreation;
