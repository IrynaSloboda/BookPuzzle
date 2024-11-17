import React, { useContext } from "react";
import { Container } from "react-bootstrap";
import { ThemeContext } from "../../ThemeContext";
import "./Footer.css";

export default function Footer() {

  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;

  return (
    <footer className={`footer ${darkMode ? "footer-dark" : "footer-light"}`}>
      <Container className={`footer-text ${darkMode ? "footer-text-dark" : "footer-text-light"}`}>
        <h3 className={`footer-bookpuzzle ${darkMode ? "footer-bookpuzzle-dark" : "footer-bookpuzzle-light"}`}>Світ Думок</h3>
        Світ Думок - це царство книг і пазлів, де кожна сторінка, кожен елемент головоломки - це вікно у захоплюючий світ знань та розваги. 
        Наша бібліотека - це магічне місце, де слова стають живими, а пазли складаються у неймовірні картини. © 2024
      </Container>
    </footer>
  );
}
