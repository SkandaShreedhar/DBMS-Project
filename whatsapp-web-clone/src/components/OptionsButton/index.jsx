import React, { useState } from "react";
import Icon from "components/Icon";
import "./styles/main.css";
import { useNavigate } from "react-router-dom";

const OptionsBtn = ({
	className,
	iconId,
	iconClassName,
	ariaLabel,
	options = [],
	position = "left",
	showPressed = true,
	...props
}) => {
	const navigate = useNavigate();
	const [showOptions, setShowOptions] = useState(false);

	const handleLogOut = () => {
		localStorage.removeItem("token")
		navigate("/signin")
	}

	const handleAddNewChat = () => {
		navigate("/addchat")
	}

	return (
		<div className="pos-rel">
			<button
				aria-label={ariaLabel}
				className={`options-btn ${
					showOptions && showPressed ? "options-btn--pressed" : ""
				} ${className || ""}`}
				onClick={() => setShowOptions(!showOptions)}
				{...props}
			>
				<Icon id={iconId} className={iconClassName} />
			</button>
			<ul
				className={`options-btn__options ${
					showOptions ? "options-btn__options--active" : ""
				} ${position === "right" ? "options-btn__options--right" : ""}`}
			>
				{/* {options.map((option, index) => (
					<li className="options-btn__option" key={index}>
						{option}
					</li>
				))} */}

					<li onClick={handleAddNewChat} className="options-btn__option">
						New Chat
					</li>
					<li onClick={handleLogOut} className="options-btn__option">
						Logout
					</li>
			</ul>
		</div>
	);
};

export default OptionsBtn;
