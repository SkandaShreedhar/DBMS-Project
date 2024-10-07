import React from 'react';
import { useNavigate } from 'react-router-dom';

function Navbar({ setAuthenticated }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        setAuthenticated(false);
        navigate('/');
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <h1 className="navbar-brand">Chat Application</h1>
            <div className="collapse navbar-collapse">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <button className="btn btn-link text-white" onClick={handleLogout}>Logout</button>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="/history">Chat History</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="/users">Users</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="/group-chat">Group Chat</a>
                    </li>
                </ul>
            </div>
        </nav>
    );
}

export default Navbar;
