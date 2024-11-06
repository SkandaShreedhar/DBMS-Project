import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Loader from "./components/Loader";
import Home from "./pages/Home";
import Sidebar from "components/Sidebar";
import Chat from "pages/Chat";
import Auth from "components/Auth/Auth";
import Signin from "components/Signin/Signin";
import Signup from "components/Signup/Signup";

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
			<Router>
				<div className="app-content">
					<Sidebar />
					<Switch>
						<Route exact path="/" component={Home} />
						<Route path="/chat/:id" component={Chat} />
						<Route path="/signin" component={Signin} />
						<Route path="/signup" component={Signup} />
					</Switch>
				</div>
			</Router>
		</div>
	);
}

export default App;
