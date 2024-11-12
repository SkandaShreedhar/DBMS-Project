import React, { useEffect, useState } from "react";
import "./App.css";
import Loader from "./components/Loader";
import Home from "./pages/Home";
import Sidebar from "components/Sidebar";
import Chat from "pages/Chat";
import Signin from "components/Signin/Signin";
import Signup from "components/Signup/Signup";
import AddNewChat from "AddNewChat/AddNewChat";
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

const userPrefersDark =
	window.matchMedia &&
	window.matchMedia("(prefers-color-scheme: dark)").matches;

function App() {
	const [appLoaded, setAppLoaded] = useState(false);
	const [startLoadProgress, setStartLoadProgress] = useState(false);
	const [token, setToken] = useState(null);

	useEffect(() => {
		if (userPrefersDark) document.body.classList.add("dark-theme");
		stopLoad();
	}, []);

	useEffect(() => {
		setToken(localStorage.getItem("token")) 
	}, [])

	const stopLoad = () => {
		setStartLoadProgress(true);
		setTimeout(() => setAppLoaded(true), 3000);
	};

	if (!appLoaded) return <Loader done={startLoadProgress} />;

	return (
		<div className="app">
			<p className="app__mobile-message"> Only available on desktop 😊. </p>
			<BrowserRouter>
				<div className="app-content">
					<Sidebar />
					<Routes>
						<Route exact path="/" element={<Home />} />
						<Route exact path="/addchat" element={<AddNewChat />} />
						<Route path="/chat/:id" element={<Chat />} />
						<Route path="/signin" element={<Signin />} />
						<Route path="/signup" element={<Signup />} />
					</Routes>
				</div>
			</BrowserRouter>
		</div>
	);
}

export default App;
