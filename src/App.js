import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from './firebase/AuthContext';
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Rules from "./pages/Rules";
import Rooms from "./pages/Rooms";
import RoomNumber from "./pages/RoomNumber";
import RoomCreation from "./pages/RoomCreation";
import JoinRoom from "./pages/JoinRoom.js";
import RejoinRoom from "./pages/RejoinRoom.js";
import UsernameSelection from "./pages/UsernameSelection";
import PunishmentWheel from "./pages/PunishmentWheel.js";

function App() {
return ( 
<AuthProvider>
<Router>
<Routes>
<Route path="/" element={<Home />} />
<Route path="/login" element={<Login />} />
<Route path="/signup" element={<Signup />} />
<Route path="/username-selection" element={<UsernameSelection />} />
<Route path="/rules" element={<Rules />} />
<Route path="/rooms" element={<Rooms />} />
<Route path="/room-creation" element={<RoomCreation />} />
<Route path="/join-room" element={<JoinRoom />} />
<Route path="/rejoin-room" element={<RejoinRoom />} />
<Route path="/rooms/:roomId" element={<RoomNumber />} />
<Route path="/punishment-wheel/:roomId" element={<PunishmentWheel />} />
</Routes> 
</Router>
</AuthProvider>
);
}

export default App;