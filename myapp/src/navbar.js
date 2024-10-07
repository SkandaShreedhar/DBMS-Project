import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory

function Navbar({ setAuthenticated }) {
    const navigate = useNavigate(); // Use useNavigate

    const handleLogout = () => {
        setAuthenticated(false); // Call the logout API if needed
        navigate('/login'); // Use navigate instead of history.push
    };

    return (
        <nav>
            <h1>Chat Application</h1>
            <ul>
                <li><button onClick={handleLogout}>Logout</button></li>
                <li><a href="/history">Chat History</a></li>
                <li><a href="/users">Users</a></li>
                <li><a href="/group-chat">Group Chat</a></li>
            </ul>
        </nav>
    );
}

export default Navbar;
