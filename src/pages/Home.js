import { useNavigate } from "react-router-dom";
import logo from "../images/logo.png";
import "../pages/Home.css";

const Home = () => {
  const navigate = useNavigate();

  // Home Page Buttons
  return (
    <div className="home-page">
      <div className="home-container">
        <img src={logo} alt="Pungo Logo" className="logo" />
        <button onClick={() => navigate("/login")}>Login</button>
        <button onClick={() => navigate("/signup")}>Create Account</button>
        <button onClick={() => navigate("/rules")}>Rules</button>
      </div>
    </div>
  );
};

export default Home;
