import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Interview } from './pages/Interview';
import { Login } from './pages/Login';
import { createContext, useEffect } from 'react';
import { useState } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode';
import { Register } from './pages/Register';

interface UserData {
  token: string;
  id: string;
  data: {
    Fname: string;
    Lname: string;
    email: string;
  };
}

interface UserContextType {
  user: UserData | null;
  setUser: React.Dispatch<React.SetStateAction<UserData | null>>;
}

export const UserContext = createContext<UserContextType | null>(null);

async function refreshToken(currentToken:string): Promise<string | null> {
  try {
    const response = await axios.post('http://localhost:3000/refresh_token', {"token":currentToken}, { withCredentials: true });
    return response.data.token;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
}

function App() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (user) {
      console.log('User data:', user);
      const { exp } = jwtDecode<{ exp: number }>(user.token);

      // Calculate the time until the token expires
      const timeUntilExpiry = exp * 1000 - Date.now();

      // Set a timeout to refresh the token just before it expires
      const timeout = setTimeout(async () => {
        const newToken = await refreshToken(user.token);
        if (newToken) {
          setUser((prevUser) => prevUser ? { ...prevUser, token: newToken } : null);
          console.log('Token refreshed successfully');
        } else {
          setUser(null); // Log out the user if the token cannot be refreshed
          console.log('Failed to refresh token, logging out');
        }
      }, timeUntilExpiry - 5000); // Refresh 5 seconds before expiry

      return () => clearTimeout(timeout); // Cleanup the timeout on component unmount or user change
    }
  }, [user]);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div className="w-screen h-screen overflow-hidden bg-primary z-0 relative text-white bg-base">
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/interview" element={<Interview />} />
          </Routes>
        </Router>
      </div>
      
    </UserContext.Provider>
  );
}

export default App;