import React, { useEffect } from "react";
import "./styles/main.css";
import Icon from "components/Icon";
import introImgLight from "assets/images/intro-connection-light.jpg";
import introImgDark from "assets/images/intro-connection-dark.jpg";
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
