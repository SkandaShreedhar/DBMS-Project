import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Login';
import Chat from './Chat';
import ChatHistory from './ChatHistory';
import UserList from './UserList';
import Navbar from './navbar';
import GroupChat from './GroupChat'; 
import './App.css'; // Import custom styles

function App() {
    const [authenticated, setAuthenticated] = useState(false);

    return (
        <Router>
            <Navbar setAuthenticated={setAuthenticated} />
            <div className="container">
                <Routes>
                    <Route path="/" element={authenticated ? <Chat /> : <Login setAuthenticated={setAuthenticated} />} />
                    <Route path="/history" element={<ChatHistory />} />
                    <Route path="/group-chat" element={<GroupChat />} />
                    <Route path="/users" element={<UserList />} />
                </Routes>
            </div>
            <footer>
                <p>© 2024 Chat Application. All Rights Reserved.</p>
            </footer>
        </Router>
    );
}

export default App;
