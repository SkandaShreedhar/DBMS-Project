import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ChatHistory() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get('/api/history'); // Replace with your actual API endpoint
                setHistory(response.data);
            } catch (error) {
                console.error("Error fetching chat history:", error);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div className="container mt-5">
            <h2>Chat History</h2>
            <ul className="list-group">
                {history.map((msg, index) => (
                    <li key={index} className="list-group-item">
                        <strong>{msg.username}</strong>: {msg.message}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ChatHistory;
