import { createContext, useContext, useEffect, useState } from "react";
import { useSocketContext } from "./socketContext";

const UsersContext = createContext();

const useUsersContext = () => useContext(UsersContext);

const UsersProvider = ({ children }) => {
	const socket = useSocketContext();

	const [users, setUsers] = useState([]);
	const [flag, setFlag] = useState(false);
	const [rawData, setRawData] = useState(null);

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
			if (data.status == 401) {
				localStorage.removeItem("token");
				localStorage.removeItem("username");
				return null;
			}
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

								]
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

	const populateMessages = (userID) => {
		fetch("http://localhost:5000/conversation", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"token": localStorage.getItem('token'),
				"recipient_user_id": userID
			})
		}).then(data => {
			return data.json()
		}).then(data => {
			setUsers(users => {
				const usersCopy = [...users];
				let userIndex = users.findIndex(user => user.id == userID);
				
				if (userIndex >= 0) {
					usersCopy[userIndex].messages.TODAY = data.allmessages.map(element => {
						let message = element[0];
						let position = element[1];
	
						return {
							content: message,
							sender: position < 0 ? 1 : null,
							time: position < 0 ? (position * -1) : position,
							status: null,
						}
					})
				}
				return usersCopy
			})
		});
	}

	const joinRoom = (recipient_user_id) => {
		let data = {
			"recipient_user_id": recipient_user_id,
			"token": localStorage.getItem('token')
		}

		socket.emit("join", JSON.stringify(data))
	}

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

		let payload = {
			"token": localStorage.getItem("token"),
			"recipient_user_id": userId,
			"message": message
		}

		socket.emit("message", JSON.stringify(payload));
	};

	useEffect(() => {
		if (rawData) {
			let data = JSON.parse(rawData)
			let userId = data.recipient_user_id
			let position = data.userid
			let message = data.message

			let userIndex = users.findIndex((user) => user.id == userId);

			console.log(userId)

			const usersCopy = [...users];
			const newMsgObject = {
				content: message,
				sender: position < 0 ? 1 : null,
				time: position < 0 ? (position * -1) : position,
				status: null,
			};

			console.log(newMsgObject)
			usersCopy[userIndex].messages.TODAY.push(newMsgObject);
			setUsers(usersCopy);
			setRawData(null)
		}
	}, [flag, rawData])

	const handleMessage = (rawData) => {
		setFlag(flag => !flag)
		setRawData(rawData)
	}

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

	const test = (data) => {
		console.log(data)
	};

	// const fetchMessageResponse = (data) => {
	// 	setUsers((users) => {
	// 		const { userId, response } = data;

	// 		let userIndex = users.findIndex((user) => user.id === userId);
	// 		const usersCopy = JSON.parse(JSON.stringify(users));
	// 		const newMsgObject = {
	// 			content: response,
	// 			sender: userId,
	// 			time: new Date().toLocaleTimeString(),
	// 			status: null,
	// 		};

	// 		usersCopy[userIndex].messages.TODAY.push(newMsgObject);

	// 		return usersCopy;
	// 	});
	// };

	useEffect(() => {
		// socket.on("fetch_response", fetchMessageResponse);
		// socket.on("start_typing", setUserAsTyping);
		// socket.on("stop_typing", setUserAsNotTyping);

		// socket.on("test", test);


		socket.on("message", handleMessage)
	}, [socket]);

	const setUserAsUnread = (userId) => {
		_updateUserProp(userId, "unread", 0);
	};

	return (
		<UsersContext.Provider value={{ users, setUserAsUnread, addNewMessage, populateMessages, joinRoom }}>
			{children}
		</UsersContext.Provider>
	);
};

export { useUsersContext, UsersProvider };
