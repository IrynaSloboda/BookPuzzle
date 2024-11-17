import "./Header.css";
import { useContext } from "react";
import { ThemeContext } from "../../ThemeContext";

export default function Header() {

  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;

  return (
    <header className={`header ${darkMode ? "header-dark" : "header-light"}`}>
      <div className={`header-titles ${darkMode ? "header-titles-dark" : "header-titles-light"}`}>
        <span className="header-title-sm">
        Світ Думок - це царство книг і пазлів, де кожна сторінка, кожен елемент головоломки - це вікно у захоплюючий світ знань та розваги. 
        Наша бібліотека - це магічне місце, де слова стають живими, а пазли складаються у неймовірні картини.
        </span>
        <span className={`header-title-lg ${darkMode ? "header-title-lg-dark" : "header-title-lg-light"}`}>СВІТ ДУМОК</span>
          <span className="header-phrase1">Читай</span>
          <span className="header-phrase2">Насолоджуйся</span>
          <span className="header-phrase3">Складай</span>
      </div>
      {darkMode ? (
        <img
          className="header-img"
          src="https://res.cloudinary.com/cloud8/image/upload/v1726514817/final_s5ujlg.png"
          alt=""
        />
      ) : (
        <img
          className="header-img"
          src="https://res.cloudinary.com/cloud8/image/upload/v1699624868/Frame_295_3_yhgkr3.png"
          alt=""
        />
      )}

      <div className={`header-bottom ${darkMode ? "header-bottom-dark" : "header-bottom-light"}`}>
        {/*A small donation from you goes a long way for someone in need */}
      </div>
      
    </header>
  );
}