import React from "react";
import "./styles/main.css";
import Icon from "../Icon";

const Loader = ({ done }) => {
	return (
		<div className="loader ">
			<h1 className="loader__title"> Chat Application</h1>
			<div
				className={`loader__progress ${done ? "loader__progress--done" : ""}`}
			></div>
		</div>
	);
};

export default Loader;
