// firebaseUtils.js
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const db = getFirestore();

export const getBingoEntriesFromDatabase = async (roomCode) => {
  try {
    const roomRef = doc(db, 'rooms', roomCode);
    const roomSnap = await getDoc(roomRef);
    if (roomSnap.exists()) {
      return roomSnap.data().bingoEntries;
    } else {
      console.error('No such document!');
      return [];
    }
  } catch (error) {
    console.error('Error fetching bingo entries:', error);
    return [];
  }
};
