import { useState, useContext } from 'react';
import { UserContext } from '../App';
import { Navigate } from 'react-router-dom';
import axios from 'axios';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const userContext = useContext(UserContext);
    if(!userContext) {
        throw new Error('UserContext is not available');
    }
    const { user, setUser } = userContext;

    if(user) return <Navigate to="/" />;


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Email:', email);
        console.log('Password:', password);
        axios.post('http://localhost:3000/login', { email, password })
            .then((response) => {
                console.log('Login successful:', response.data);
                setUser(response.data);
                
            })
            .catch((error) => {
                window.alert(`Error code ${error.status} - ${error.response.statusText}: ${error.response.data}`);
            }
        );
        
    };



    return (
        <div className="flex justify-center items-center h-screen text-black">
            <form onSubmit={handleSubmit} className="flex flex-col w-80 bg-white p-6 shadow-md rounded">
                <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
                <label htmlFor="email" className="mb-2 font-medium">Email</label>
                <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <label htmlFor="password" className="mb-2 font-medium">Password</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mb-4 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                    Login
                </button>
            </form>
        </div>
    );
};