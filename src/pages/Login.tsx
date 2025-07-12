import { useState, useContext } from 'react';
import { UserContext } from '../App';
import { Navigate, Link } from 'react-router-dom';
import { handleLogin } from '../utils/auth';
import Logo from '../assets/logo.png';
import { HireverseTitle } from '../components/common/HireverseTitle';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false); // NEW
    const {user,setUser} = useContext(UserContext);

    if(user) return <Navigate to="/" />;


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLogin(email, password, setUser, rememberMe);
    };



    return (
        <div 
            className="flex flex-col items-center justify-start py-8"
        >
            {/* Logo */}
            <img src={Logo} alt="Logo" className="w-25 mb-0" style={{ width: '100px' }} />
            
            {/* Brand Name */}
            <HireverseTitle size={24} className='mb-4'/>

            {/* Auth Container */}
            <div className="bg-white rounded-3xl shadow-xl w-full max-w-md flex flex-col items-center" 
                 style={{ 
                     backgroundColor: 'rgba(255, 255, 255, 0.92)',
                     padding: '10px 40px',
                     boxShadow: '0 8px 20px rgba(0, 0, 0, 0.25)'
                 }}>
                <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
                    <input
                        type="email"
                        placeholder="Email..."
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full border border-gray-400  rounded-2xl text-sm focus:outline-none focus:bg-white focus:shadow-blue-200"
                        style={{
                            maxWidth: '320px',
                            padding: '10px 18px',
                            margin: '10px 0',
                            backgroundColor: '#faf8f8',
                            fontSize: '14px',
                            boxShadow: 'none'
                        }}
                        onFocus={(e) => {
                            e.target.style.backgroundColor = '#fff';
                            e.target.style.boxShadow = '0 0 0 2px rgba(0, 119, 255, 0.2)';
                        }}
                        onBlur={(e) => {
                            e.target.style.backgroundColor = '#faf8f8';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Password..."
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full border border-gray-400 rounded-2xl text-sm focus:outline-none focus:bg-white focus:shadow-blue-200 "
                        style={{
                            maxWidth: '320px',
                            padding: '10px 18px',
                            margin: '10px 0',
                            backgroundColor: '#faf8f8',
                            fontSize: '14px',
                            boxShadow: 'none'
                        }}
                        onFocus={(e) => {
                            e.target.style.backgroundColor = '#fff';
                            e.target.style.boxShadow = '0 0 0 2px rgba(0, 119, 255, 0.2)';
                        }}
                        onBlur={(e) => {
                            e.target.style.backgroundColor = '#faf8f8';
                            e.target.style.boxShadow = 'none';
                        }}
                    />
                    
                    {/* Remember Me Checkbox */}
                    <label className="flex items-center w-full text-sm text-gray-700" style={{ maxWidth: '320px', marginBottom: '12px', marginTop: '10px' }}>
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={e => setRememberMe(e.target.checked)}
                            className="mr-2"
                        />
                        Remember Me
                    </label>
                    <Link to="/register" className='text-blue-500 underline text-left mb-2'>
                    Don't have an account? Register here
                    </Link>
                    <button
                        type="submit"
                        className="border-none rounded-full font-bold cursor-pointer transition-colors duration-300 hover:bg-blue-800"
                        style={{
                            width: '40%',
                            padding: '4px',
                            marginTop: '1px',
                            backgroundColor: '#1a3f78',
                            color: 'white',
                            fontSize: '16px'
                        }}
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};