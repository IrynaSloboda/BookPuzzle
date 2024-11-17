import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Nav, InputGroup, Button } from "react-bootstrap";
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { ThemeContext } from "../../ThemeContext";
import { questions } from "../../constants";
import axios from "axios";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import "./ResetPassword.css";

export default function EditProfile() {
    const navigate = useNavigate();

    const theme = useContext(ThemeContext);
    const darkMode = theme.state.darkMode;

    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [email, setEmail] = useState("");
    const [secretAnswer, setSecretAnswer] = useState("");
    const [secretQuestion, setSecretQuestion] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const toggleShowPassword = () => setShowPassword(!showPassword);
    const [showConfirmedPassword, setShowConfirmedPassword] = useState(false);
    const toggleShowConfirmedPassword = () => setShowConfirmedPassword(!showConfirmedPassword);


  useEffect(() => {
    if (localStorage.getItem("token")) {
      navigate("/");
    }
  }, [navigate]);

  const handleSubmit = (event) => {
    const form = event.currentTarget;
    event.preventDefault();
    if (form.checkValidity() === false) {
      event.stopPropagation();
      return;
    }

    if (password !== confirmPassword) {
      setError(true);
      setErrorMsg("Паролі не співпадають!");
      setTimeout(() => { setError(false); setErrorMsg(""); }, 3000);
      event.stopPropagation();
      return;
    }

    axios.post(`/auth/reset-password/${email}`, 
        {
          password,
          secretAnswer,
        }
      ).then((res) => { navigate("/login"); })
      .catch((err) => {
        setError(true);
        setErrorMsg(err.response.data.error);
        setTimeout(() => { setError(false); setErrorMsg(""); }, 8000);
      }, [email]);

  };


  return (
    <>
      <NavBar />
      <div className={`resetPassword-wrapper ${darkMode ? "resetPassword-wrapper-dark" : "resetPassword-wrapper-light"}`}>
        <Container className="resetPassword-container">
          <Card className={`card ${darkMode ? "card-dark" : "card-light"}`}>
            <Card.Body>
              <Card.Title className={`card-title ${darkMode ? "card-title-dark" : "card-title-light"}`}>
                Скинути пароль
              </Card.Title>
              <Form onSubmit={handleSubmit}>

                <Form.Group className="mb-3 position-relative">
                  <Form.Control type="email" placeholder="Введіть e-mail"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3 position-relative">
                  <Form.Control className="secret-question"
                    as="select" 
                    value={secretQuestion} 
                    onChange={(e) => setSecretQuestion(e.target.value)}
                  >
                    <option value="" disabled selected>Секретне запитання, на яке ви відповіли</option>
                    {questions.map((question) => (
                      <option key={question} value={question}>
                        {question}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>

                <Form.Group className="mb-3 position-relative">
                  <Form.Control type="text" placeholder="Введіть свою відповідь"
                    value={secretAnswer}
                    onChange={(e) => setSecretAnswer(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3 position-relative">
                  <Form.Control 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="Введіть новий пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <InputGroup.Text 
                    className={`password-toggle ${darkMode ? "password-toggle-dark" : "password-toggle-light"}`}
                    onClick={toggleShowPassword} 
                  >
                    {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </InputGroup.Text>
                </Form.Group>

                <Form.Group className="mb-3 position-relative">
                  <Form.Control 
                    type={showConfirmedPassword ? 'text' : 'password'} 
                    placeholder="Підтвердіть пароль"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <InputGroup.Text 
                    className={`password-toggle ${darkMode ? "password-toggle-dark" : "password-toggle-light"}`}
                    onClick={toggleShowConfirmedPassword} 
                  >
                    {showConfirmedPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                  </InputGroup.Text>
                </Form.Group>

                <div className="remembered-password">
                  <span className={`remembered-password-question ${darkMode ? "remembered-password-question-dark" : "remembered-password-question-light"}`}>
                    Згадали пароль?
                  </span>
                  <Nav.Link onClick={() => { navigate("/login"); }}> Увійти </Nav.Link>
                </div>
                <div className="d-flex justify-content-center">
                  <Button variant="primary" type="submit"> Скинути </Button>
                </div>
              </Form>
              <div className="error">{error && <p>{errorMsg}</p>}</div>
            </Card.Body>
          </Card>
        </Container>
      </div>
      <Footer />
    </>
  );
}
