import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Nav, InputGroup } from "react-bootstrap";
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';
import { ThemeContext } from "../../ThemeContext";
import { questions } from "../../constants";
import axios from "axios";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import "./Signup.css";

export default function Signup() {
  const navigate = useNavigate();

  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;

  const [error, setError] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [name, setName] = useState("");
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

    axios.post(`/auth/register`, 
        {
          name,
          email,
          password,
          secretAnswer,
        }
      ).then((res) => { navigate("/login"); })
      .catch((err) => {
        setError(true);
        setErrorMsg(err.response.data.error);
        setTimeout(() => { setError(false); setErrorMsg(""); }, 8000);
      });

  };


  return (
    <>
      <NavBar />
      <div className={`signup-wrapper ${darkMode ? "signup-wrapper-dark" : "signup-wrapper-light"}`}>
        <Container className="signup-container">
          <Card className={`card ${darkMode ? "card-dark" : "card-light"}`}>
            <Card.Body>
              <Card.Title className={`card-title ${darkMode ? "card-title-dark" : "card-title-light"}`}>
                Створіть свій профіль
              </Card.Title>
              <Form onSubmit={handleSubmit}>

                <Form.Group className="mb-3 position-relative">
                  <Form.Control type="text" placeholder="Введіть своє ім'я"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3 position-relative">
                  <Form.Control type="email" placeholder="email@example.com"
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

                <Form.Group className="mb-3 position-relative">
                  <Form.Control type={showConfirmedPassword ? 'text' : 'password'} 
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

                <Form.Group className="mb-3 position-relative secretQ">
                  <Form.Label className={`form-label secretQ-label ${darkMode ? "form-label-dark" : "form-label-light"}`}>
                  <span className="secretQ-label">На випадок забутого пароля: </span>
                  </Form.Label>
                  <Form.Control as="select" 
                    value={secretQuestion} 
                    onChange={(e) => setSecretQuestion(e.target.value)}
                    required
                  >
                    <option value="" disabled selected>Оберіть секретне питання</option>
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
                <div className="already-registered">
                  <span className={`already-registered-question ${darkMode ? "already-registered-question-dark" : "already-registered-question-light"}`}>
                    Вже є аккаунт?
                  </span>
                  <Nav.Link onClick={() => { navigate("/login"); }}> Увійти </Nav.Link>
                </div>
                <div className="d-flex justify-content-center">
                  <Button variant="primary" type="submit"> Зареєструватись </Button>
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
