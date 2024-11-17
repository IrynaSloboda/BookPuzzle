import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Nav, InputGroup } from "react-bootstrap";
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { ThemeContext } from "../../ThemeContext";
import axios from "axios";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  
  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;

  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const toggleShowPassword = () => setShowPassword(!showPassword);

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

    axios.post(`/auth/login`, 
        {
          email,
          password,
        }
      ).then((res) => {
        localStorage.setItem("token", res.data.token);
        navigate("/");
      })
      .catch((err) => {
        setError(true);
        setErrorMsg(err.response.data.error);
        setTimeout(() => { setError(false); setErrorMsg(""); }, 8000);
      });

  };

  return (
    <>
      <NavBar />
      <div className={`login-wrapper ${darkMode ? "login-wrapper-dark" : "login-wrapper-light"}`}>
        <Container className="login-container">
          <Card className={`card ${darkMode ? "card-dark" : "card-light"}`}>
            <Card.Body>
              <Card.Title className={`card-title ${darkMode ? "card-title-dark" : "card-title-light"}`}>
                З поверненням! 
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
                  <Form.Control type={showPassword ? 'text' : 'password'} 
                    placeholder="Введіть пароль"
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

                <div className="no-registered">
                  <span className={`no-registered-question ${darkMode ? "no-registered-question-dark" : "no-registered-question-light"}`}>
                    Немає аккаунта?
                  </span>
                  <Nav.Link onClick={() => { navigate("/signup"); }}> Зареєструватись </Nav.Link>
                </div>
                <div className="forgot-password">
                  <Nav.Link className="forgot-password-questionLink" onClick={() => { navigate("/reset-password"); }}>
                    Забули пароль?
                  </Nav.Link>
                </div>
                <div className="d-flex justify-content-center">
                  <Button variant="primary" type="submit" > Увійти </Button>
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
