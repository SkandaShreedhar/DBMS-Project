import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:5000'); // have to update with my server URL

function Chat() {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);

    useEffect(() => {
        socket.on('receive_message', (data) => {
            setChat((prev) => [...prev, data]);
        });
    }, []);

    const sendMessage = () => {
        socket.emit('send_message', { message });
        setMessage('');
    };

    return (
        <div>
            <h2>Chat</h2>
            <div>
                {chat.map((msg, index) => (
                    <p key={index}>{msg}</p>
                ))}
            </div>
            <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}

export default Chat;
