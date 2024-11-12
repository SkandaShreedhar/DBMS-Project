import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom';

function AddNewChat() {
	const [phoneNumber, setPhoneNumber] = useState('');
	const [error, setError] = useState('');
	const navigate = useNavigate();

	const handlePhoneNumberChange = (e) => {
		setPhoneNumber(e.target.value);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setError('');

		fetch("http://localhost:5000/addnewchat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"username": phoneNumber,
                "token": localStorage.getItem("token")
			})
		}).then(data => {
            navigate("/")
			window.location.reload()
			return data.json()
		})
	};

	return (
		<>
			<div className="w-[100vw] h-[100vh] flex justify-center items-center text-white">
				<div className="w-[30vw] h-fit mx-auto p-6 rounded-lg shadow-md">
					<h2 className="text-2xl font-semibold mb-6 text-center">Add New Chat</h2>
					{error && <p className="text-red-500 text-center mb-4">{error}</p>}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-gray-700 font-medium mb-1" htmlFor="phone">
								Username
							</label>
							<input
								type="tel"
								id="phone"
								value={phoneNumber}
								onChange={handlePhoneNumberChange}
								className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
								placeholder="Enter username of the person"
							/>
						</div>
						<button
							type="submit"
							className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
							onSubmit={handleSubmit}
						>
							Add!
						</button>
					</form>
				</div>
			</div>
		</>
	)
}

export default AddNewChat