import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { useEffect, useState } from "react";
import './PunishmentWheel.css';

const API_KEY = "6ca4e07f-a154-40a8-88d0-006e32643f3d";
const API_URL = "https://wheelofnames.com/api/v1/wheels/shared";

const PunishmentWheel = () => {
    const { roomId } = useParams();
    const navigate = useNavigate();
    const [wheelUrl, setWheelUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAndCreateWheel = async () => {
            if (!roomId) return;

            try {
                // Fetch punishments from Firestore
                const roomRef = doc(db, "rooms", roomId);
                const roomSnap = await getDoc(roomRef);

                if (!roomSnap.exists()) {
                    setError("Room not found.");
                    setLoading(false);
                    return;
                }

                const punishments = roomSnap.data().punishment || [];
                if (punishments.length === 0) {
                    setError("No punishments available.");
                    setLoading(false);
                    return;
                }

                // Create the Wheel with Custom Configurations
                const wheelData = {
                    shareMode: "copyable",
                    wheelConfig: {
                        title: "Your fate has been decided...",
                        description: "No Bingo?? It's Punishment Time!!",
                        entries: punishments.map((p) => ({ text: p })),
                        afterSpinSound: "cinematic-drum-impact",
                        afterSpinSoundVolume: 50,
                        allowDuplicates: true,
                        animateWinner: false,
                        autoRemoveWinner: false,
                        centerText: "",
                        colorSettings: [
                            { color: "#d600d6", enabled: true },
                            { color: "#9933ff", enabled: true },
                            { color: "#00f57b", enabled: true },
                            { color: "#00ffff", enabled: true },
                            { color: "#a33737", enabled: true },
                            { color: "#4a54c7", enabled: true },
                        ],
                        coverImageName: "",
                        coverImageType: "",
                        customCoverImageDataUri: "",
                        customPictureDataUri: "",
                        customPictureName: "",
                        displayHideButton: true,
                        displayRemoveButton: false,
                        displayWinnerDialog: true,
                        drawOutlines: false,
                        drawShadow: true,
                        duringSpinSound: "ticking-sound",
                        duringSpinSoundVolume: 50,
                    },
                };

                const headers = {
                    "Content-Type": "application/json",
                    "x-api-key": API_KEY,
                };

                const response = await fetch(API_URL, {
                    method: "POST",
                    headers,
                    body: JSON.stringify(wheelData),
                });

                const jsonResponse = await response.json();

                if (jsonResponse?.data?.path) {
                    setWheelUrl(`https://wheelofnames.com/${jsonResponse.data.path}?embed=true`);

                    // Start the auto-redirect timer (5 min)
                    setTimeout(() => {
                        navigate("/");
                    }, 5 * 60 * 1000);
                } else {
                    setError("Failed to create the wheel.");
                }
            } catch (err) {
                setError("An error occurred while creating the wheel.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAndCreateWheel();
    }, [roomId, navigate]);

    return (
        <div className="wheel-container">
            <h1>Punishment Wheel</h1>

            {loading && <p>Loading punishment wheel...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {wheelUrl && (
                <div className="wheel-frame">
                    <iframe
                        src={wheelUrl}
                        width="100%"
                        height="500px"
                        frameBorder="0"
                        allowFullScreen
                        title="Punishment Wheel"
                    ></iframe>
                </div>
            )}
        </div>
    );
};

export default PunishmentWheel;
