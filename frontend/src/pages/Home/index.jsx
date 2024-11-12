import React, { useEffect } from "react";
import "./styles/main.css";
import { useNavigate } from 'react-router-dom';

const Home = () => {
	const darkTheme = document.body.classList.contains("dark-theme");
	const navigate = useNavigate();

	useEffect(() => {
		if (localStorage.getItem("token") == null) {
			navigate("/signin")
		}
	}, [localStorage.getItem("token")])

	return (
		<div className="home">
		</div>
	);
};

export default Home;
