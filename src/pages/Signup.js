import React, {useState, useContext, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../images/logo.png";
import { auth, db, doc, setDoc } from '../firebase/firebaseConfig';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { AuthContext } from '../firebase/AuthContext';


const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);


  useEffect(() => {
    // Redirect to homepage if the user is already signed in
    if (currentUser) {
      navigate('/rooms');
    }
  }, [currentUser, navigate]);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    // Check for strong password
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      setError('Password must be at least 8 characters long and include uppercase, lowercase, and a number.');
      return;
    }

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional user information in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        uid: user.uid, // store UID
      });

      // Redirect to username selection page
      navigate('/username-selection', { state: { uid: user.uid } });

    } catch (err) {
      console.error("Error creating user: ", err);
      setError(err.message);
    }
  }
  return (
    <div className="home-container">
      <img src={logo} alt="Pungo Logo" className="logo" />

      <form onSubmit={handleSignUp}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Sign Up</button>
        {error && <p>{error}</p>}
      </form>
    </div>
  );
};

export default SignUp;
