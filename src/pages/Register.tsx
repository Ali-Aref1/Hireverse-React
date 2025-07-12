import React from 'react'
import { useState, useContext } from 'react';
import { UserContext } from '../App';
import { Link, Navigate } from 'react-router-dom';
import { handleRegister } from '../utils/auth';
import Logo from '../assets/logo.png';
import { HireverseTitle } from '../components/common/HireverseTitle';

export const Register = () => {
    const [Fname, setFname] = useState('');
    const [Lname, setLname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const {user,setUser} = useContext(UserContext);

    if(user) return <Navigate to="/" />;


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleRegister(Fname, Lname, email, password, setUser);
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
                    type="text"
                    placeholder="First Name"
                    value={Fname}
                    onChange={(e) => setFname(e.target.value)}
                    required
                    className="w-full border border-gray-400 rounded-2xl text-sm focus:outline-none focus:bg-white focus:shadow-blue-200"
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
                    type="text"
                    placeholder="Last Name"
                    value={Lname}
                    onChange={(e) => setLname(e.target.value)}
                    required
                    className="w-full border border-gray-400 rounded-2xl text-sm focus:outline-none focus:bg-white focus:shadow-blue-200"
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
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full border border-gray-400 rounded-2xl text-sm focus:outline-none focus:bg-white focus:shadow-blue-200"
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
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full border border-gray-400 rounded-2xl text-sm focus:outline-none focus:bg-white focus:shadow-blue-200"
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
                <Link to="/login" className='text-blue-500 underline text-left mb-2'>
                    Already have an account? Login here
                </Link>
                <button
                    type="submit"
                    className="border-none rounded-2xl font-bold cursor-pointer transition-colors duration-300 hover:bg-blue-800"
                    style={{
                        width: '40%',
                        padding: '4px',
                        marginTop: '1px',
                        backgroundColor: '#1a3f78',
                        color: 'white',
                        fontSize: '15px'
                    }}
                >
                    Sign Up
                </button>
            </form>
        </div>
    </div>
)
}
