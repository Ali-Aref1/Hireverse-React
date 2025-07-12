import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Interview } from './pages/Interview';
import { Login } from './pages/Login';
import { ResultsDashboard } from './pages/ResultsDashboard';
import { createContext, useEffect, useState } from 'react';
import { refreshToken, getUserInfo } from './utils/auth';
import { jwtDecode } from 'jwt-decode';
import { Register } from './pages/Register';
import { PixelStreamingWrapper } from './components/Interview/PixelStreamingWrapper';
import { Navbar } from './components/common/Navbar';
import { Profile } from './pages/Profile';

type UserData = {
  id: string;
  accessToken: string;
  data: {
    Fname: string;
    Lname: string;
    email: string;
  };
} | null;

interface UserContextType {
  user: UserData;
  setUser: React.Dispatch<React.SetStateAction<UserData>>;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => {},
});

function App() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true); // NEW

  // Auto-login effect: runs once on mount
  useEffect(() => {
    const tryAutoLogin = async () => {
      const newToken = await refreshToken();
      if (newToken) {
        try {
          const userInfo = await getUserInfo(newToken);
          setUser({
            id: userInfo.id,
            accessToken: newToken,
            data: {
              Fname: userInfo.Fname,
              Lname: userInfo.Lname,
              email: userInfo.email,
            },
          });
        } catch (err) {
          setUser(null);
        }
      }
      setLoading(false); // Always set loading to false
    };
    tryAutoLogin();
  }, []);

  // Token refresh scheduling effect
  useEffect(() => {
    if (!user) return;

    let timeout: NodeJS.Timeout;
    console.log(user);
    const scheduleRefresh = (accessToken: string) => {
      const { exp } = jwtDecode<{ exp: number }>(accessToken);
      const timeUntilExpiry = exp * 1000 - Date.now();
      timeout = setTimeout(async () => {
        const newToken = await refreshToken();
        if (newToken) {
          setUser((prevUser) => {
            if (!prevUser) return null;
            scheduleRefresh(newToken);
            return { ...prevUser, accessToken: newToken };
          });
          console.log('Token refreshed successfully');
        } else {
          setUser(null);
          console.log('Failed to refresh token, logging out');
        }
      }, Math.max(timeUntilExpiry - 5000, 0));
    };

    scheduleRefresh(user.accessToken);

    return () => clearTimeout(timeout);
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <div className='fixed inset-0 bg-base w-full h-full bg-no-repeat bg-cover bg-background'></div>
      <div className='fixed inset-0 bg-black bg-opacity-50 w-full h-full'></div>
      <div className="min-h-screen w-full relative text-white font-body">
        <Router>
          <Navbar />
            <main className="pt-24 overflow-y-auto h-screen">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/interview" element={<Interview />} />
              <Route path="/interviews" element={<ResultsDashboard />} />
              <Route path="/profile" element={<Profile/>} />
            </Routes>
          </main>
        </Router>
      </div>
    </UserContext.Provider>
  );
}

export default App;