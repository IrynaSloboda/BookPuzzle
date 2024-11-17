import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar, Container, Nav, Form, FormControl, Button, NavDropdown } from "react-bootstrap";
import { ThemeContext } from "../../ThemeContext";
import SwitchButton from "../../ThemeButton";
import axios from "axios";
import "./NavBar.css";

export default function NavBar() {
  const navigate = useNavigate();

  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;

  const [loggedIn, setLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (localStorage.getItem("token")) { 
      setLoggedIn(true);
      axios.post(`/user/data`, 
          {
            token: localStorage.getItem("token"),
          }
        ).then((res) => { 
          setName(res.data.name); 
          setEmail(res.data.email); 
          setIsAdmin(res.data.isAdmin);
        })
        .catch((err) => { localStorage.removeItem("token"); setLoggedIn(false); });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setLoggedIn(false);
    //window.location.reload();
    navigate("/login");
  };

  const handleSearch = () => {
    navigate(`/search/${query}`);
  };
  
  return (
    <>
      <Navbar collapseOnSelect expand="lg" sticky="top" variant={darkMode ? "dark" : "light"} 
        className={`navbar ${darkMode ? "navbar-dark" : "navbar-light"}`}
        >
        <Container>
        
          <div className="brand-btn">
            <Navbar.Brand className={`bookpuzzle ${darkMode ? "bookpuzzle-dark" : "bookpuzzle-light"}`} onClick={() => { navigate("/"); }} >
              <img src="https://res.cloudinary.com/cloud8/image/upload/v1699461136/logo2_f4eyau.png" alt="Логотип" className="logo-image" />
              Світ Думок
            </Navbar.Brand>
          </div>

          <Navbar.Toggle aria-controls="responsive-navbar-nav" />

          <Navbar.Collapse>
            <Nav className="me-auto">
              <Form className="d-flex">
                <FormControl type="search" placeholder="Пошук..." className="me-2" aria-label="Search"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); }}
                  onKeyPress={(e) => { if (e.key === "Enter") { handleSearch(); } }}
                />
              </Form>
            </Nav>

            {loggedIn ? (
              <Nav className="button-icon">
                {isAdmin && (
                  <Nav.Link>
                    <Button variant="success" className="new-product" onClick={() => { navigate("/new"); }} >
                      Додати книгу/пазл
                    </Button>                 
                  </Nav.Link>
                )}

                {/*!isAdmin && (
                  <Nav.Link>
                    <Button variant="success" className="give-product" onClick={() => {  }} >
                      Віддати книгу/пазл
                    </Button>                 
                  </Nav.Link>
                )*/}

              
                <NavDropdown align={{ lg: "end" }}
                  title={ <img className="user-icon" src="https://res.cloudinary.com/cloud8/image/upload/v1701182643/icon-w_audmcj.png" alt="" /> }
                >
                  <NavDropdown.Item>{name}</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={() => { navigate("/profile"); }}>
                    Мій профіль
                  </NavDropdown.Item>
                  <NavDropdown.Item onClick={logout}>Вийти</NavDropdown.Item>
                </NavDropdown>

                <Nav className="nav-theme-btn">
                  <SwitchButton />
                </Nav>

              </Nav>
            ) : (
              <Nav className="buttons">
                <Nav.Link>
                  <Button variant="success" className="login"
                    onClick={() => { navigate("/login"); }}
                  >
                    Вхід
                  </Button>
                </Nav.Link>

                <Nav.Link>
                  <Button variant="success" className="signup"
                    onClick={() => { navigate("/signup"); }}
                  >
                    Реєстрація
                  </Button>
                </Nav.Link>

                <Nav className="nav-theme-btn">
                  <SwitchButton />
                </Nav>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}
