import axios from 'axios';
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;
function Registration() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('user');
    const [isFormValid, setIsFormValid] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        validateForm();
    }, [name, email, password, confirmPassword, role]);

    const validateForm = () => {
        const isValid = 
            name.trim() !== '' && 
            email.trim() !== '' && 
            password.trim() !== '' && 
            password === confirmPassword &&
            role.trim() !== '';
        setIsFormValid(isValid);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        if (isFormValid) {
            try {
                const response = await axios.post(`${API_URL}/api/auth/register`, {
                    Name: name,
                    Email: email,
                    Password: password,
                    Role: role || 'user'
                });
                console.log('Registration successful:', response.data);
                setSuccessMessage(response.data.message);
                // Clear form fields after successful registration
                setName('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setRole('user');
            } catch (error) {
                console.error('Registration failed:', error);
                setError(error.response?.data?.message || 'Registration failed. Please try again.');
            }
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-4">Register</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mb-4 p-2 border border-gray-300 rounded w-full"
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mb-4 p-2 border border-gray-300 rounded w-full"
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="mb-4 p-2 border border-gray-300 rounded w-full"
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="mb-4 p-2 border border-gray-300 rounded w-full"
                />
                <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    className="mb-4 p-2 border border-gray-300 rounded w-full"
                >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                </select>
                <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`p-2 w-full rounded ${isFormValid ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}
                >
                    Submit
                </button>
            </form>
        </div>
    );
}

export default Registration;