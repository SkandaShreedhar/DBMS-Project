import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:5000'); // have to update with my server URL

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
        <div>
            <h2>Group Chat</h2>
            <div>
                {groupChat.map((msg, index) => (
                    <p key={index}>{msg.username}: {msg.message}</p>
                ))}
            </div>
            <input
                type="text"
                value={groupMessage}
                onChange={(e) => setGroupMessage(e.target.value)}
            />
            <button onClick={sendGroupMessage}>Send</button>
        </div>
    );
}

export default GroupChat;
