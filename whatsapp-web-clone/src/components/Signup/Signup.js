import React, { useState } from 'react'
import { Link, useHistory } from 'react-router-dom';

function Signup() {
	const [phoneNumber, setPhoneNumber] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const history = useHistory()

	const handlePhoneNumberChange = (e) => {
		setPhoneNumber(e.target.value);
	};

	const handlePasswordChange = (e) => {
		setPassword(e.target.value);
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		setError('');

		if (!phoneNumber || !password) {
			setError('Please enter both phone number and password');
			return;
		}

		fetch("http://localhost:5000/signup", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				"phoneNumber": phoneNumber,
				"password": password
			})
		}).then(data => {
			history.push("/signin")
		})
	};

	return (
		<>
			<div className="w-[100vw] h-[100vh] flex justify-center items-center text-white">
				<div className="w-[30vw] h-fit mx-auto p-6 rounded-lg shadow-md">
					<h2 className="text-2xl font-semibold mb-6 text-center">Sign Up</h2>
					{error && <p className="text-red-500 text-center mb-4">{error}</p>}
					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-gray-700 font-medium mb-1" htmlFor="phone">
								Phone Number
							</label>
							<input
								type="tel"
								id="phone"
								value={phoneNumber}
								onChange={handlePhoneNumberChange}
								className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
								placeholder="Enter your phone number"
							/>
						</div>
						<div>
							<label className="block text-gray-700 font-medium mb-1" htmlFor="password">
								Password
							</label>
							<input
								type="password"
								id="password"
								value={password}
								onChange={handlePasswordChange}
								className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
								placeholder="Enter your password"
							/>
						</div>
						<button
							type="submit"
							className="w-full bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition duration-300"
							onSubmit={handleSubmit}
						>
							Sign Up
						</button>
						<div>
							<Link
								to="/signin"
								className="w-full text-white py-2 rounded-lg font-semibold transition duration-300"
							>
								Go to Sign In
							</Link>
						</div>
					</form>
				</div>
			</div>
		</>
	)
}

export default Signup