import { useNavigate } from "react-router-dom";
import logo from "../images/logo.png";
import "../pages/Home.css";
import { getAuth, signOut } from 'firebase/auth';

const Rooms = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        navigate('/');
        console.log('Signed out successfully');
      })
      .catch((error) => {
        // An error occurred.
        console.error('Error signing out:', error);
      });
  };

  return (
    <div className="home-container">
      <img src={logo} alt="Pungo Logo" className="logo" />
      <button onClick={() => navigate("/room-creation")}>Create A Room</button>
      <button onClick={() => navigate("/join-room")}>Join A Room</button>
      <button onClick={() => navigate("/rejoin-room")}>Rejoin A Room</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Rooms;
