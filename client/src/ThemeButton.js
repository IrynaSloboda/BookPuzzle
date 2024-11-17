import React, { useContext } from "react";
import { ThemeContext } from "./ThemeContext";
import { TbSunMoon } from "react-icons/tb";

export default function SwitchButton() {
  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;

  const onClick = () => {
    if (darkMode) {
      theme.dispatch({ type: "LIGHTMODE" });
    } else {
      theme.dispatch({ type: "DARKMODE" });
    }
  };

  return (
    <button className={`btn ${darkMode ? "btn-dark" : "btn-light"}`} onClick={onClick} 
            style={{backgroundColor: 'transparent', border: 'none', boxShadow: 'none'}}>
      {<TbSunMoon style={{fontSize: '28px'}} />}
    </button>
  );
}
