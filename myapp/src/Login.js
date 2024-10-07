import React, { useState } from 'react';
import axios from 'axios';

function Login({ setAuthenticated }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        try {
            const response = await axios.post('/api/login', { username, password });
            if (response.data.success) {
                setAuthenticated(true);
            } else {
                setError('Invalid credentials');
            }
        } catch (error) {
            setError('Login failed');
        }
    };

    return (
        <div className="container mt-5">
            <h2>Login</h2>
            <div className="form-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
                <input
                    type="password"
                    className="form-control mt-2"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button className="btn btn-primary mt-3" onClick={handleLogin}>Login</button>
                {error && <p className="text-danger">{error}</p>}
            </div>
        </div>
    );
}

export default Login;
