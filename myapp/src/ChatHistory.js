import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ChatHistory() {
    const [history, setHistory] = useState([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get('/api/history'); // have to replace with the actual user endpoint API 
                setHistory(response.data);
            } catch (error) {
                console.error("Error fetching chat history:", error);
            }
        };
        fetchHistory();
    }, []);

    return (
        <div>
            <h2>Chat History</h2>
            <ul>
                {history.map((msg, index) => (
                    <li key={index}>
                        <strong>{msg.username}</strong>: {msg.message}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ChatHistory;
