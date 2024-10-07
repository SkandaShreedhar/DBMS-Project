import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'; // Use Routes instead of Switch
import Login from './Login';
import Chat from './Chat';
import ChatHistory from './ChatHistory';
import UserList from './UserList';
import Navbar from './navbar';
import GroupChat from './GroupChat'; 

function App() {
    const [authenticated, setAuthenticated] = useState(false);

    return (
        <Router>
            <Navbar setAuthenticated={setAuthenticated} />
            <Routes> {/* Change Switch to Routes */}
                <Route path="/" element={authenticated ? <Chat /> : <Login setAuthenticated={setAuthenticated} />} />
                <Route path="/history" element={<ChatHistory />} />
                <Route path="/group-chat" element={<GroupChat />} />
                <Route path="/users" element={<UserList />} />
            </Routes>
        </Router>
    );
}

export default App;
