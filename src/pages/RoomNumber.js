import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { collection, query, where, getDocs, doc, setDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebaseConfig';
import logo from "../images/logo.png";
import "../pages/RoomNumber.css";

const RoomNumber = () => {
    const location = useLocation();
    const [roomCode, setRoomCode] = useState('');
    const [bingoCard, setBingoCard] = useState([]);
    const [loading, setLoading] = useState(true); // Add a loading state
    const [hasBingo, setHasBingo] = useState(false); // Track if there is a bingo
    const [scoreboard, setScoreboard] = useState([]); // Set up scoreboard
 
    useEffect(() => {
      // Retrieve room code from location state
      if (location.state && location.state.roomCode) {
        setRoomCode(location.state.roomCode);
      }
    }, [location]);
  
    useEffect(() => {
        const fetchBingoEntries = async () => {
            if (roomCode) {
                try {
                    const roomsRef = collection(db, 'rooms');
                    const q = query(roomsRef, where('roomCode', '==', roomCode));
                    const querySnapshot = await getDocs(q);
    
                    if (!querySnapshot.empty) {
                        const roomDoc = querySnapshot.docs[0];
                        const roomData = roomDoc.data();
                        const roomId = roomDoc.id;
                        const user = auth.currentUser;
                        if (!user) return;
    
                        let userBoard = roomData.playerBoards?.[user.uid]?.card;
    
                        if (!userBoard) {
                            const { bingoEntries } = roomData;
                            if (!bingoEntries || bingoEntries.length < 24) {
                                console.error('Not enough bingo entries to generate a card.');
                                return;
                            }
    
                            const shuffledEntries = [...bingoEntries].sort(() => Math.random() - 0.5);
                            const card = [];
                            let index = 0;
                            for (let i = 0; i < 5; i++) {
                                const row = [];
                                for (let j = 0; j < 5; j++) {
                                    if (i === 2 && j === 2) {
                                        row.push({ text: 'Free', marked: true });
                                    } else {
                                        row.push({ text: shuffledEntries[index], marked: false });
                                        index++;
                                    }
                                }
                                card.push(row);
                            }
    
                            const formattedCard = card.map(row => ({ cells: row }));
    
                            await setDoc(doc(db, 'rooms', roomId), {
                                playerBoards: {
                                    ...roomDoc.data().playerBoards,
                                    [user.uid]: {
                                        card: formattedCard,
                                        markedCount: roomDoc.data().playerBoards?.[user.uid]?.markedCount || 0,
                                        hasBingo: roomDoc.data().playerBoards?.[user.uid]?.hasBingo || false
                                    }
                                }
                            }, { merge: true });
                            
    
                            userBoard = card;
                        }
    
                        const formattedCard = Array.isArray(userBoard) 
                            ? userBoard.map(row => row.cells) 
                            : [];
                        if (Array.isArray(formattedCard) && formattedCard.length === 5 && formattedCard.every(r => Array.isArray(r) && r.length === 5)) {
                            setBingoCard(formattedCard);
                        } else {
                            console.error('Invalid bingo card format.');
                            window.location.reload();
                        }
                        checkForBingo(formattedCard);
                    } else {
                        console.error('Room does not exist.');
                    }
                } catch (error) {
                    console.error('Error fetching bingo entries', error);
                } finally {
                    setLoading(false); // Mark loading as complete
                }
            }
        };
    
        fetchBingoEntries();
    }, [roomCode]);

    useEffect(() => {
        if (!roomCode) return;

        const roomsRef = collection(db, 'rooms');
        const q = query(roomsRef, where('roomCode', '==', roomCode));

        // Real-time listener for scoreboard updates
        const unsubscribeScoreboard = onSnapshot(q, async (querySnapshot) => {
            if (!querySnapshot.empty) {
                const roomDoc = querySnapshot.docs[0].data();
                const playerBoards = roomDoc.playerBoards || {};

                const playerList = await Promise.all(
                    Object.entries(playerBoards).map(async ([userId, data]) => {
                        const username = await getUsername(userId);
                        return {
                            userId,
                            username,
                            markedCount: data.markedCount || 0,
                            hasBingo: data.hasBingo || false,
                        };
                    })
                );

                setScoreboard(playerList);
            }
        });

        return () => unsubscribeScoreboard(); // Cleanup on unmount
        
    }, [roomCode]);

    useEffect(() => {
        if (!roomCode) return;
    
        const fetchGameDuration = async () => {
            const roomsRef = collection(db, 'rooms');
            const q = query(roomsRef, where('roomCode', '==', roomCode));
            const querySnapshot = await getDocs(q);
    
            if (!querySnapshot.empty) {
                const roomDoc = querySnapshot.docs[0];
                const roomData = roomDoc.data();
                const gameDuration = roomData.gameDuration; // In minutes
                const createdAt = roomData.createdAt?.toDate(); // Convert Firestore timestamp to JS Date
                
                if (!gameDuration || !createdAt) return;
    
                const endTime = new Date(createdAt.getTime() + gameDuration * 60 * 60 * 1000); // Hours into milliseconds
                const interval = setInterval(() => {
                    const now = new Date();
                    if (now >= endTime) {
                        clearInterval(interval);
                        checkPunishment();
                    }
                }, 1000);
    
                return () => clearInterval(interval); // Cleanup on unmount
            }
        };
    
        fetchGameDuration();
    }, [roomCode]);
    
    const checkPunishment = async () => {
        const user = auth.currentUser;
        if (!user) return;
    
        const roomsRef = collection(db, 'rooms');
        const q = query(roomsRef, where('roomCode', '==', roomCode));
        const querySnapshot = await getDocs(q);
    
        if (!querySnapshot.empty) {
            const roomDoc = querySnapshot.docs[0];
            const playerBoards = roomDoc.data().playerBoards || {};
    
            if (!playerBoards[user.uid]?.hasBingo) {
                // Redirect to punishment wheel
                window.location.href = `/punishment-wheel/${roomDoc.id}`;
            }
        }
    };
    
    

    // Function to get username from Firestore
    const getUsername = async (userId) => {
        try {
            const userDoc = await getDoc(doc(db, "users", userId));
            return userDoc.exists() ? userDoc.data().username : userId;
        } catch (error) {
            console.error("Error fetching username:", error);
            return userId; // Fallback to userId if error occurs
        }
    };

  
    const handleMarkCell = async (rowIndex, cellIndex) => {
        const user = auth.currentUser;
        if (!user) return;
    
        // Toggle marked status
        const updatedCard = [...bingoCard];
        updatedCard[rowIndex][cellIndex].marked = !updatedCard[rowIndex][cellIndex].marked;
    
        setBingoCard(updatedCard);
        checkForBingo(updatedCard); // Check for bingo after marking

        // Count marked tiles
        const markedCount = updatedCard.flat().filter(cell => cell.marked).length;
    
        // Convert 2D array into Firestore-compatible format
        const formattedCard = updatedCard.map(row => ({ cells: row }));
    
        // Save to Firestore
        const roomsRef = collection(db, 'rooms');
        const q = query(roomsRef, where('roomCode', '==', roomCode));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const roomDoc = querySnapshot.docs[0];
            const roomId = roomDoc.id;
    
            await setDoc(doc(db, 'rooms', roomId), {
                playerBoards: {
                    ...roomDoc.data().playerBoards,
                    [user.uid]: {
                        card: formattedCard,
                        markedCount: markedCount,
                        hasBingo: false
                    }
                }
            }, { merge: true });
        }
    };

    // Store if player has a bingo
    const handleBingo = async () => {
        const user = auth.currentUser;
        if (!user || !hasBingo) return;
    
        const roomsRef = collection(db, 'rooms');
        const q = query(roomsRef, where('roomCode', '==', roomCode));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const roomDoc = querySnapshot.docs[0];
            const roomId = roomDoc.id;
    
            const playerData = roomDoc.data().playerBoards[user.uid];
            if (playerData.hasBingo) return; // Prevent duplicate Firestore writes
    
            await setDoc(doc(db, 'rooms', roomId), {
                playerBoards: {
                    ...roomDoc.data().playerBoards,
                    [user.uid]: {
                        ...playerData,
                        hasBingo: true
                    }
                }
            }, { merge: true });
        }
    
        alert("Congrats! 🎉");
    };
    

    const checkForBingo = (card) => {
        // Check rows
        for (let row of card) {
            if (row.every(cell => cell.marked)) {
                setHasBingo(true);
                return;
            }
        }

        // Check columns
        for (let col = 0; col < 5; col++) {
            if (card.every(row => row[col].marked)) {
                setHasBingo(true);
                return;
            }
        }

        // Check diagonals
        if (card.every((row, idx) => row[idx].marked)) {
            setHasBingo(true);
            return;
        }
        if (card.every((row, idx) => row[4 - idx].marked)) {
            setHasBingo(true);
            return;
        }

        setHasBingo(false);
    };
    
    return (
<div className="room-page">
    <img src={logo} alt="Pungo Logo" className="logo" />
    <h1>Room Code: {roomCode}</h1>

    {loading ? (
        <p>Loading...</p>
    ) : (
        <div className="bingo-card">
            {bingoCard?.length > 0 ? (
                bingoCard.map((row, rowIndex) => (
                    Array.isArray(row) && row.length ? (  // Check if 'row' is valid
                        <div key={rowIndex} className="bingo-row">
                            {row.map((cell, cellIndex) => (
                                <div
                                    key={cellIndex}
                                    className={`bingo-cell ${cell.marked ? 'marked' : ''} ${cell.text.length > 60 && cell.marked ? 'scroll-text' : ''}`}
                                    onClick={() => handleMarkCell(rowIndex, cellIndex)}
                                >
                                    <span>{cell.text}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p key={rowIndex}>Invalid row data.</p>
                    )
                ))
            ) : (
                <p>No bingo card data available.</p>
            )}
        </div>
    )}
                {/* Bingo Button */}
                <button 
                className={`bingo-button ${hasBingo ? "active" : "disabled"}`} 
                onClick={handleBingo}
                disabled={!hasBingo}
            >
                {hasBingo ? "Bingo! 🎉" : "Bingo!"}
            </button>
            {/* Scoreboard */}
<div className="scoreboard">
    <h2>Scoreboard</h2>
    <table>
        <thead>
            <tr>
                <th>Player</th>
                <th>Marked Tiles</th>
                <th>Bingo</th>
            </tr>
        </thead>
        <tbody>
            {scoreboard.map((player, index) => (
                <tr key={index}>
                    <td>{player.username}</td>
                    <td>{player.markedCount}</td>
                    <td>{player.hasBingo ? <span>🎉 Bingo!</span> : <span>❌</span>}</td>
                </tr>
            ))}
        </tbody>
    </table>
</div>

</div>
    );
}
 export default RoomNumber;