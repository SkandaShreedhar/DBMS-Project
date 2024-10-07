import React, { useEffect, useState } from 'react';
import axios from 'axios';

function UserList() {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('/api/users'); // Replace with your actual API endpoint
                setUsers(response.data);
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers();
    }, []);

    return (
        <div className="container mt-5">
            <h2>Online Users</h2>
            <ul className="list-group">
                {users.map((user, index) => (
                    <li key={index} className="list-group-item">{user.username}</li>
                ))}
            </ul>
        </div>
    );
}

export default UserList;
