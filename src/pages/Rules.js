import React from 'react';
import { useNavigate } from 'react-router-dom'; 
import logo from "../images/logo.png";
import './Rules.css'; 

const Rules = () => {
    const navigate = useNavigate(); 

    const goBackToHome = () => {
        navigate('/');
    };

    return (
        <div className="rules-container">
           <img src={logo} alt="Pungo Logo" className="logo" />
            <h1>Game Rules</h1>
            <div className="rules-content">
                <h2>Objective:</h2>
                <p>The goal of the game is to be the first to mark all the numbers in a row, column, or diagonal to get a "Bingo!" Failing to do so will send you to the punishment wheel!</p>
                
                <h2>How to Play:</h2>
                <ul>
                    <li>A host will create a game with their own custom bingo tiles. (Up to 50)</li>
                    <li>Players will need to join the room using the room code provided by the host.</li>
                    <li>Players can mark the numbers by clicking on the cells.</li>
                    <li>All players to complete a line (horizontally, vertically, or diagonally) must click the "Bingo" button.</li>
                    <li>If you don't get a bingo, you’ll be redirected to a punishment wheel!</li>
                    <li>Have fun!</li>
                </ul>

                <h2>Game Duration:</h2>
                <p>The game will last for a set duration, after which it will automatically end.</p>

                <h2>Punishments:</h2>
                <p>All players will submit a punishment before the game begins. If you don't get a Bingo in time, you'll face a fun punishment from the punishment wheel!</p>
            </div>

            {/* Button to navigate back to the homepage */}
            <button className="back-home" onClick={goBackToHome}>Back to Game</button>
        </div>
    );
};

export default Rules;
