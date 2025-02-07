import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc } from 'firebase/firestore';

const UsernameSelection = () => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { uid } = location.state;

  const handleUsernameSelection = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Check if username already exists in the 'usernames' collection
      const usernameDocRef = doc(db, 'usernames', username);
      const usernameDoc = await getDoc(usernameDocRef);
      if (usernameDoc.exists()) {
        setError('Username is already taken.');
        return;
      }

      // Reserve the username by creating a document in the 'usernames' collection
      await setDoc(usernameDocRef, { uid });

      // Update the user's document in the 'users' collection with the selected username
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, { username }, { merge: true });

      // Redirect to the desired page after successful username selection
      navigate('/rooms');
    } catch (err) {
      console.error("Error assigning username: ", err);
      setError('An error occurred while assigning the username. Please try again.');
    }
  };

  return (
    <div className="home-container">
      <form onSubmit={handleUsernameSelection}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a username"
          required
        />
        <button type="submit">Submit</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default UsernameSelection;
