import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { Form, Button, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "../../ThemeContext";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import "./Reservation.css";

export default function Reservation() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [reservations, setReservations] = useState([]);
  const [lastReservationData, setLastReservationData] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [fullName, setFullName] = useState("");
  const [deliveryOption, setDeliveryOption] = useState("take-yourself");

  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;

  useEffect(() => {
    axios
      .get(`/user/product/${id}`)
      .then((res) => {
        setProduct(res.data.product);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      // Fetch reservations
      axios
        .post(`/user/reservations`, {
          token: localStorage.getItem("token"),
        })
        .then((res) => {
          setReservations(res.data.reservations);
          // Set last reservation data if there are reservations
          if (res.data.reservations.length > 0) {
            setLastReservationData(res.data.reservations[res.data.reservations.length - 1]);
          }
        })
        .catch((err) => {
          navigate("/login");
        });
    } else {
      navigate("/login");
    }
  }, []);

  useEffect(() => {
    if (lastReservationData) {
      setPhone(lastReservationData.phone);
      setAddress(lastReservationData.address);
      setFullName(lastReservationData.fullName);
    }
  }, [lastReservationData]);

  const handleReserve = (event) => {
    event.preventDefault();

    axios
      .post(`/user/reserve`, {
        id: id,
        fullName: deliveryOption === "delivery" ? fullName : null,
        startDate: startDate,
        endDate: endDate,
        phone: phone,
        address: deliveryOption === "delivery" ? address : null,
        token: localStorage.getItem("token"),
      })
      .then((res) => {
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <>
      <NavBar />
      <div className={`reservation-container ${darkMode ? "reservation-container-dark" : "reservation-container-light"}`}>
        <h1 className={`reservation-main-title ${darkMode ? "reservation-main-title-dark" : "reservation-main-title-light"}`}>
          Резервація {product.type === "Книга" ? "Книги" : "Пазла"}
        </h1>

        <div className="reservation-content">

        <div className="reservation-left" 
        style={{ marginLeft: product.type === "Книга" ? "-70px" : "0", 
                marginRight: product.type === "Книга" ? "-80px" : "0", 
                marginTop: product.type === "Пазл" ? "-25px" : "0" }}>
          {product.cloudinaryId ? (
            <img className="reservation-img" src={product.image} alt={product.title} />
          ) : null}
        </div>


            <div className="reservation-center">
              
              <div className="reservation-product-details">
                <h3 className={`h3 ${darkMode ? "h3-dark" : "h3-light"}`}>{product.title}</h3>
                <span className="product-creator">{product.author}</span>
              </div>

              <form className={`reservation-form ${darkMode ? "reservation-form-dark" : "reservation-form-light"}`}>
                <div className="input-data">
                  <Form.Label className={`form-label-startDate ${darkMode ? "form-label-startDate-dark" : "form-label-startDate-light"}`}>
                    Початкова дата:
                  </Form.Label>
                  <Form.Control 
                    type="date"
                    value={startDate}
                    min={new Date().toISOString().split('T')[0]} // Мінімальне значення - сьогоднішня дата
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="input-data">
                  <Form.Label className={`form-label-endDate ${darkMode ? "form-label-endDate-dark" : "form-label-endDate-light"}`}>
                    Кінцева дата:
                  </Form.Label>
                  <Form.Control 
                    type="date"
                    value={endDate}
                    min={startDate ? new Date(new Date(startDate).getTime() + 86400000).toISOString().split('T')[0] : ''} // Мінімальне значення - початкова дата плюс один день
                    max={startDate ? new Date(new Date(startDate).getTime() + 5356800000).toISOString().split('T')[0] : ''} // Максимальне значення - початкова дата плюс один місяць
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
                <div className="input-data">
                  <Form.Label className={`form-label-phone ${darkMode ? "form-label-phone-dark" : "form-label-phone-light"}`}>
                    Телефон:
                  </Form.Label>
                  <Form.Control 
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </form>
              
            </div>
                                    
            <div className={`reservation-right ${darkMode ? "reservation-right-dark" : "reservation-right-light"}`}>
            <h5 className={`h5 ${darkMode ? "h5-dark" : "h5-light"}`}>Оберіть спосіб отримання:</h5>
              <Row>
                <Col>
                  <Form.Check
                    type="radio"
                    label="Забрати самому"
                    name="deliveryOption"
                    id="take-yourself"
                    checked={deliveryOption === "take-yourself"}
                    onChange={() => setDeliveryOption("take-yourself")}
                  />
                </Col>
                <Col>
                  <Form.Check
                    type="radio"
                    label="Доставка"
                    name="deliveryOption"
                    id="delivery"
                    checked={deliveryOption === "delivery"}
                    onChange={() => setDeliveryOption("delivery")}
                  />
                </Col>
              </Row>

              <form className={`delivery-info ${darkMode ? "delivery-info-dark" : "delivery-info-light"}`} onSubmit={handleReserve}>
              {deliveryOption === "delivery" ? (
                <>
                  <div className="input-data">
                    <Form.Label className={`form-label-fullname ${darkMode ? "form-label-fullname-dark" : "form-label-fullname-light"}`}>
                      Повне ім'я:
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder=""
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="input-data">
                    <Form.Label className={`form-label-address ${darkMode ? "form-label-address-dark" : "form-label-address-light"}`}>
                      Адреса:
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="вул. Львівська, 1"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                  
                  
                </>
              ) : (
                <>                
                <div className={`address-to-take ${darkMode ? "address-to-take-dark" : "address-to-take-light"}`}>
                  <p>Забрати свої резервації можна за адресою: <br/> 
                  <a href="https://maps.app.goo.gl/2qFntNqwf63n6G2w9" target="_blank">вул. Львівська, 8</a></p>
                  <p>Відкрито щодня з 10:00 до 20:00</p>
                </div>
                </>
              )
              }
              <Button variant="primary" className="reserve reservation-save" type="submit">
                Зберегти
              </Button>
              </form>
              
            </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
