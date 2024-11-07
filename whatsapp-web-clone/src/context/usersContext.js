import { createContext, useContext, useEffect, useState } from "react";
import contacts from "data/contacts";
import { useSocketContext } from "./socketContext";

const UsersContext = createContext();

const useUsersContext = () => useContext(UsersContext);

const UsersProvider = ({ children }) => {
	const socket = useSocketContext();

	const [users, setUsers] = useState([]);

	useEffect(() => {
		fetch("http://localhost:5000/chats_and_groups", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"token": localStorage.getItem('token')
			})
		}).then(data => {
			return data.json()
		}).then(data => {
			if (data && data.otherUsernames) {
				let length = data.otherUsernames.length;
				let objs = []
				for (let i = 0; i < length; i++) {
					objs.push(
						{
							id: data.otherUserIDS[i],
							profile_picture: null,
							name: data.otherUsernames[i],
							phone_number: "+2348123456789",
							whatsapp_name: data.otherUsernames[i],
							unread: 0,
							messages: {
								TODAY: [
									
								],
							},
							group: false,
							pinned: true,
							typing: false,
						}
					)
				}
				setUsers(objs)
			}
		})
	}, [])

	const _updateUserProp = (userId, prop, value) => {
		setUsers((users) => {
			const usersCopy = [...users];
			let userIndex = users.findIndex((user) => user.id === userId);
			const userObject = usersCopy[userIndex];
			usersCopy[userIndex] = { ...userObject, [prop]: value };
			return usersCopy;
		});
	};

	const setUserAsTyping = (data) => {
		const { userId } = data;
		_updateUserProp(userId, "typing", true);
	};

	const setUserAsNotTyping = (data) => {
		const { userId } = data;
		_updateUserProp(userId, "typing", false);
	};

	const fetchMessageResponse = (data) => {
		setUsers((users) => {
			const { userId, response } = data;

			let userIndex = users.findIndex((user) => user.id === userId);
			const usersCopy = JSON.parse(JSON.stringify(users));
			const newMsgObject = {
				content: response,
				sender: userId,
				time: new Date().toLocaleTimeString(),
				status: null,
			};

			usersCopy[userIndex].messages.TODAY.push(newMsgObject);

			return usersCopy;
		});
	};

	useEffect(() => {
		socket.on("fetch_response", fetchMessageResponse);
		socket.on("start_typing", setUserAsTyping);
		socket.on("stop_typing", setUserAsNotTyping);
	}, [socket]);

	const setUserAsUnread = (userId) => {
		_updateUserProp(userId, "unread", 0);
	};

	const addNewMessage = (userId, message) => {
		let userIndex = users.findIndex((user) => user.id === userId);
		const usersCopy = [...users];
		const newMsgObject = {
			content: message,
			sender: null,
			time: new Date().toLocaleTimeString(),
			status: "delivered",
		};

		usersCopy[userIndex].messages.TODAY.push(newMsgObject);
		setUsers(usersCopy);

		socket.emit("fetch_response", { userId });
	};

	return (
		<UsersContext.Provider value={{ users, setUserAsUnread, addNewMessage }}>
			{children}
		</UsersContext.Provider>
	);
};

export { useUsersContext, UsersProvider };
