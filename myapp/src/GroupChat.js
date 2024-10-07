import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:5000'); // Update with your server URL

function GroupChat() {
    const [groupMessage, setGroupMessage] = useState('');
    const [groupChat, setGroupChat] = useState([]);

    useEffect(() => {
        socket.on('receive_group_message', (data) => {
            setGroupChat((prev) => [...prev, data]);
        });
    }, []);

    const sendGroupMessage = () => {
        socket.emit('send_group_message', { message: groupMessage });
        setGroupMessage('');
    };

    return (
        <div className="container mt-5">
            <div className="chat-window border rounded p-3">
                <h2>Group Chat</h2>
                <div>
                    {groupChat.map((msg, index) => (
                        <p key={index}>{msg.username}: {msg.message}</p>
                    ))}
                </div>
                <div className="chat-input mt-3">
                    <input
                        type="text"
                        className="form-control"
                        value={groupMessage}
                        onChange={(e) => setGroupMessage(e.target.value)}
                    />
                    <button className="btn btn-primary mt-2" onClick={sendGroupMessage}>Send</button>
                </div>
            </div>
        </div>
    );
}

export default GroupChat;
