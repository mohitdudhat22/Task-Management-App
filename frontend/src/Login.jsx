import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                Email: email,
                Password: password
            });
            console.log('Login successful:', response.data);
            localStorage.setItem('token', response.data.token);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
            setError(error.response?.data?.message || 'Login failed. Please try again.');
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-600">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-600">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <button
                        type="submit"
                        className="w-full py-2 px-4 rounded-md bg-blue-500 text-white hover:bg-blue-600"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Login;