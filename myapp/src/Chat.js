import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:5000'); // Update with your server URL

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
        <div className="container mt-5">
            <div className="chat-window border rounded p-3">
                <h2>Chat</h2>
                <div>
                    {chat.map((msg, index) => (
                        <p key={index}>{msg}</p>
                    ))}
                </div>
                <div className="chat-input mt-3">
                    <input
                        type="text"
                        className="form-control"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button className="btn btn-primary mt-2" onClick={sendMessage}>Send</button>
                </div>
            </div>
        </div>
    );
}

export default Chat;
