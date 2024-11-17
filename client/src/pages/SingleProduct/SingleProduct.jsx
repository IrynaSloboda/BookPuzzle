import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { Card, Button, Modal, Offcanvas, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { AiOutlineEye } from "react-icons/ai";
import { PiHeart, PiHeartFill } from "react-icons/pi";
import { FaRegComment, FaComment } from "react-icons/fa";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { ThemeContext } from "../../ThemeContext";
import { booksCategoryIcons, puzzlesCategoryIcons } from "../../constants";
import axios from "axios";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import { useNavigate } from "react-router-dom";
import "./SingleProduct.css";

export default function SingleProduct() {

  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;

  const navigate = useNavigate();

  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [saved, setSaved] = useState(false);
  const [rated, setRated] = useState(false);
  const [commented, setCommented] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [userId, setUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [reservations, setReservations] = useState([]);
  const [hasOutdatedReservation, setHasOutdatedReservation] = useState(false);
  const [hasBookReservation, setHasBookReservation] = useState(false);
  const [hasPuzzleReservation, setHasPuzzleReservation] = useState(false);
  const [userToken, setUserToken] = useState(localStorage.getItem("token") || "");
  const [views, setViews] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [products, setProducts] = useState([]);
  const [savedProducts, setSavedProducts] = useState([]);
  const [hoverRating, setHoverRating] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  
  const handleRatingSubmit = (id, rating) => {
    if (loggedIn) {
      if (!rated) {
        axios.post(`/user/product/rate/${id}`, 
            {
              rating: rating,
              user_id: userId,
            }
          ).then((res) => {
            setProduct(res.data.product);
            setAverageRating(res.data.product.rating);
            if (loggedIn) {
              res.data.product.hasRated.forEach((rate) => {
                if (rate === userId) {
                  setRated(true);
                }
              });
            }
          })
          .catch((err) => { console.log(err); });
      } 
    }
  };

  useEffect(() => {
    axios
      .get(`/user/product/${id}`)
      .then((res) => {
        setProduct(res.data.product);
        setAverageRating(res.data.product.rating); 
      })
      .catch((err) => {
        console.log(err);
      });
  }, [id]);

  // Функція для відображення повної, часткової чи пустої зірки
  const renderStar = (index) => {
    const currentRating = hoverRating || averageRating;
    if (index <= Math.floor(currentRating)) {
      // Повна зірка
      return <span key={index} className="star full">★</span>;
    } else if (index === Math.ceil(currentRating)) {
      // Часткова зірка
      const fractionalPart = currentRating % 1; // Дробова частина
      return (
        <span key={index} className="star half">
          <span className="filled" style={{ width: `${fractionalPart * 100}%` }}>★</span>
          <span className="empty">★</span>
        </span>
      );
    } else {
      // Порожня зірка
      return <span key={index} className="star empty">★</span>;
    }
  };


  const renderStars = () => {
    const stars = [];
  
    for (let i = 1; i <= 5; i++) {
      const tooltipText = !loggedIn
        ? "Щоб залишити оцінку, увійдіть в профіль."
        : rated
        ? "Ви вже залишили оцінку."
        : "";

      stars.push(
        <OverlayTrigger
          key={i}
          placement="top" // Можна вибрати "top", "bottom", "left", "right"
          overlay={
              tooltipText ? (
                <Tooltip>{tooltipText}</Tooltip>
              ) : (
                <></> // Повертаємо пустий фрагмент, якщо немає тексту
              )
            }
          >
          <span
            onClick={() => {
              if (loggedIn && !rated) {
                handleRatingSubmit(id, i);
              }
            }}
            onMouseEnter={() => {
              if (loggedIn && !rated) {
                setHoverRating(i);
              }
            }}
            onMouseLeave={() => {
              if (loggedIn && !rated) {
                setHoverRating(0);
              }
            }}
            style={{
              cursor: loggedIn && !rated ? "pointer" : "default",
              color: hoverRating >= i ? "gold" : "gray",
            }}
          >
            {renderStar(i)}
          </span>
        </OverlayTrigger>
      );
    }
    return stars;
  };


  useEffect(() => {
    axios.post(`/user/product/${id}/views`)
      .then((res) => {
        setViews(res.data.product.views);
      })
      .catch((err) => { console.log(err); });
  }, [id]);
 
  
  useEffect(() => {
    if (localStorage.getItem("token")) {
      axios
        .post(`/user/reservations`, {
          token: localStorage.getItem("token"),
        })
        .then((res) => {
          setReservations(res.data.reservations);

          const hasOutdatedReservation = res.data.reservations.some(reservation => new Date(reservation.endDate) < new Date() && reservation.returned === false);
          setHasOutdatedReservation(hasOutdatedReservation);

          const hasBookReservation = res.data.reservations.some(reservation => reservation.productType === "Книга" && reservation.returned === false);
          setHasBookReservation(hasBookReservation);

          const hasPuzzleReservation = res.data.reservations.some(reservation => reservation.productType === "Пазл" && reservation.returned === false);
          setHasPuzzleReservation(hasPuzzleReservation);


        })
        .catch((err) => { console.log(err); });
    } else {
      console.log("");
    }
  }, []);


  useEffect(() => {
    if (localStorage.getItem("token")) {
      axios.post(`/user/data`, 
          {
            token: localStorage.getItem("token"),
          }
        ).then((res) => {
          setLoggedIn(true);
          setUserId(res.data.id);
          setUserToken(localStorage.getItem("token"));
          setProducts(res.data.products);
          setSavedProducts(res.data.savedProducts);
          setIsAdmin(res.data.isAdmin);
        })
        .catch((err) => {
          localStorage.removeItem("token");
          setLoggedIn(false);
        });
    }
    axios.get(`/user/product/${id}`)
      .then((res) => {
        setProduct(res.data.product);
        if (loggedIn) {
          res.data.product.saves.forEach((save) => {
            if (save === userId) {
              setSaved(true);
            }
          });
          res.data.product.hasRated.forEach((rate) => {
            if (rate === userId) {
              setRated(true);
            }
          });
          res.data.product.hasCommented.forEach((commented) => {
            if (commented === userId) {
              setCommented(true);
            }
          });
        }
      })
      .catch((err) => { console.log(err); });
  }, [id, loggedIn, userId]);

  const handleSave = (id) => {
    if (loggedIn) {
      if (!saved) {
        axios.post(`/user/product/save/${id}`, 
            {
              user_id: userId,
            }
          ).then((res) => {
            setProduct(res.data.product);
            if (loggedIn) {
              res.data.product.saves.forEach((save) => {
                if (save === userId) {
                  setSaved(true);
                }
              });
            }
          })
          .catch((err) => { console.log(err); });
      } else {
        axios.post(`/user/product/unsave/${id}`,
            {
              user_id: userId,
            }
          ).then((res) => {
            setProduct(res.data.product);
            if (loggedIn) {
              res.data.product.saves.forEach((save) => {
                if (save === userId) {
                  setSaved(true);
                }
              });
              setSaved(false);
            }
          })
          .catch((err) => { console.log(err); });
      }
    }
  };

  const addComment = (id) => {
    if (loggedIn) {
      if (!commented) {
        axios.post(`/user/product/comment/${id}`, 
            {
              user_id: userId,
          comment: document.getElementById("comment").value,
            }
          ).then((res) => {
            setProduct(res.data.product);
            document.getElementById("comment").value = "";
            if (loggedIn) {
              res.data.product.hasCommented.forEach((commented) => {
                if (commented === userId) {
                  setCommented(true);
                }
              });
            }
          })
          .catch((err) => { console.log(err); });
      } 
    }
  };

  const handleDelete = (id) => {
    setIdToDelete(id);
    setShowModal(true);
  };
  
  const handleConfirmDelete = () => {
    axios
      .post(`/user/delete`, {
        token: localStorage.getItem("token"),
        id: idToDelete,
      })
      .then((res) => {
        setProducts(res.data.products);
        setSavedProducts(res.data.savedProducts);
        navigate("/");
      })
      .catch((err) => {
        if (err.response.status === 401) {
          navigate("/login");
        }
      });
    setShowModal(false);
  };
  
  const handleCancelDelete = () => {
    setShowModal(false);
  };

  return (
    <>
      <NavBar />
      <div className={`singleProduct-container ${darkMode ? "singleProduct-container-dark" : "singleProduct-container-light"}`}>
        <div className="singleProduct">
          <Card className={`card ${darkMode ? "card-dark" : "card-light"}`}>
            <Card.Body>
              <div className="singleProduct-content">
                <div className="singleProduct-left">
                  {product.cloudinaryId ? <Card.Img src={product.image} /> : null}
                </div>
                <div className="singleProduct-all-details">
                <div className="singleProduct-details">
                  <div className="singleProduct-details-header">
                    <h1 className={`h1 ${darkMode ? "h1-dark" : "h1-light"}`}>{product.title}</h1>
                  </div>
                  <div className="singleProduct-details-header">
                    <span className="singleProduct-label">{product.type === "Книга" ? "Автор:" : "Компанія:" }</span>
                    <span className="singleProduct-detail">{product.author}</span>
                  </div>
                  <div className="singleProduct-details-header">
                    <span className="singleProduct-label">{product.type === "Книга" ? "Жанр:" : "Категорія:" }</span>
                    <span className="singleProduct-detail"> 
                    {product.type === "Книга" ? booksCategoryIcons[product.category] : puzzlesCategoryIcons[product.category] }
                    {product.category}</span>
                  </div>
                  <div className="singleProduct-details-header">
                    <span className="singleProduct-label">{product.type === "Книга" ? "Кількість сторінок:" : "Кількість деталей:" }</span>
                    <span className="singleProduct-detail">{product.amountPagesDetails}</span>
                  </div>
                  <div className="singleProduct-details-header">
                    <span className="singleProduct-label">{product.type === "Книга" ? "Рік видання:" : "Вага (кг):" }</span>
                    <span className="singleProduct-detail">{product.yearWeight}</span>
                  </div>
                  <div className="singleProduct-details-header">
                    <span className="singleProduct-label">{product.type === "Книга" ? "Мова:" : "Країна:" }</span>
                    <span className="singleProduct-detail">{product.languageCountry}</span>
                  </div>
                  <div className="singleProduct-details-header">
                    <span className="singleProduct-label">{product.type === "Книга" ? "Обкладинка:" : "Розмір коробки (см):" }</span>
                    <span className="singleProduct-detail">{product.coverSize}</span>
                  </div>
                  <div className="singleProduct-details-header">
                    <span className="singleProduct-label">{product.type === "Книга" ? "Видавництво:" : "Розмір картинки (см):" }</span>
                    <span className="singleProduct-detail">{product.publisherPicSize}</span>
                  </div>
                  <div className="singleProduct-details-header">
                    <span className="singleProduct-label">Вікова категорія:</span>
                    <span className="singleProduct-detail">{product.age}</span>
                  </div>
                </div> 

                <div className="rating-section">
                  <div className="stars">
                    {renderStars()}
                  </div>
                </div>
                
                  <div className="button-utilities">
                    <div className="utilities">
                          <div className="utility-item view">
                            <AiOutlineEye />{" "} <span>{product.views}</span>
                          </div>
                          {loggedIn ? ( 
                            <div className={`utility-item save ${saved ? "saved" : ""}`}
                              onClick={() => { handleSave(id); }}
                            >
                              {saved ? <PiHeartFill /> : <PiHeart /> } {" "} <span>{product.saves ? product.saves.length : 0}</span>
                            </div>
                            ) : (
                              <div className="utility-item save disabled" title="Увійдіть, щоб додати в обране" onClick={() => { navigate("/login"); }}> 
                                <PiHeart />{" "} <span>{product.saves ? product.saves.length : 0}</span>
                              </div>
                            ) 
                          }
                          <div className={`utility-item comment ${commented ? "commented" : ""} `} onClick={handleShow}>
                          {commented ? <FaComment /> : <FaRegComment /> } {" "} <span>{product.comments ? product.comments.length : 0}</span>
                        </div>
                    </div>

             

                    
                      <Offcanvas className={`comments ${darkMode ? "comments-dark" : "comments-light"}`}
                        show={show} placement="end" onHide={handleClose}
                        >
                        <Offcanvas.Header closeButton>
                          <Offcanvas.Title>Обговорення</Offcanvas.Title>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                          <div className={`comment-box ${darkMode ? "comment-box-dark" : "comment-box-light"}`}>
                                {loggedIn ? 
                                (
                                  <>
                                    <Form onSubmit={(e) => { e.preventDefault(); addComment(id); }} >
                                      <Form.Group>
                                        <Form.Label>Ваш відгук</Form.Label>
                                        <Form.Control id="comment" as="textarea" rows="3" />
                                      </Form.Group>
                                      <Button type="submit" className="mt-3">
                                        Додати
                                      </Button>
                                    </Form>

                                  </>
                                ) : (
                                  <Form.Label className="comment-notlogged">
                                    <a href="/login" className="login-link">Увійдіть</a>, щоб залишити відгук.
                                  </Form.Label>
                                )}
                          </div>
                          <div className={`comment-container ${darkMode ? "comment-container-dark" : "comment-container-light"}`}>
                            {product.comments ? (
                              product.comments.sort((a, b) => new Date(b.date) - new Date(a.date)).map((comment) => {
                                return (
                                  <Card className="comment" key={comment._id}>
                                    <div className="comment-author">{comment.name}</div>
                                    <div className="comment-date"> {new Date(comment.date).toLocaleString()} </div>
                                    <div className="comment-content"> {comment.comment} </div>
                                  </Card>
                                );
                              })
                            ) : ( <div> </div> )}
                          </div>
                        </Offcanvas.Body>
                      </Offcanvas>
                    
                  {isAdmin &&
                    (
                      <>
                      <div className="buttons-right">
                              
                        <FiEdit className="edit-button" onClick={() => { navigate(`/edit/${product._id}`); }}/>
                        <RiDeleteBin6Line className="delete-button" onClick={() => { handleDelete(product._id); }}/>

                              <Modal show={showModal} onHide={handleCancelDelete}>
                                <Modal.Header closeButton className={`modal-header ${darkMode ? "modal-header-dark" : "modal-header-light"}`}>
                                  <Modal.Title>Підтвердження видалення</Modal.Title>
                                </Modal.Header>
                                <Modal.Body className={`modal-body ${darkMode ? "modal-body-dark" : "modal-body-light"}`}>
                                  Ви впевнені, що хочете видалити?
                                </Modal.Body>
                                <Modal.Footer className={`modal-footer ${darkMode ? "modal-footer-dark" : "modal-footer-light"}`}>
                                  <Button variant="secondary" className="button-cancel-deleting" onClick={handleCancelDelete}>
                                    Скасувати
                                  </Button>
                                  <Button variant="danger" className="button-confirm-deleting" onClick={handleConfirmDelete}>
                                    Видалити
                                  </Button>
                                </Modal.Footer>
                              </Modal>
                            </div>
                            </>
                            )
                    }

                    {!loggedIn && (
                      <Form.Label className="reservebtn-notlogged">
                      <a href="/login" className="login-link">Увійдіть</a> в профіль, щоб зарезервувати {product.type === "Книга" ? "книгу" : "пазл"}.
                    </Form.Label>
                    )}

                    {!isAdmin && loggedIn && !hasOutdatedReservation && !(hasBookReservation && product.type === "Книга") && !(hasPuzzleReservation && product.type === "Пазл") ? (
                      <>
                      {product.amountInStock === 0 ? (
                        <div className="out-of-stock">
                          На жаль, {product.type === "Книга" ? "даної книги" : "даного пазла"} зараз немає в наявності.
                        </div>
                      ) : (
                        <Button variant="primary" className="reserve" onClick={() => navigate(`/reserve/${id}`)}>
                          Зарезервувати
                        </Button>
                      )}
                      
                      </>
                    ) : (
                    <>
                      {!isAdmin && loggedIn && (hasOutdatedReservation === true) ? (
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Ви не можете робити жодних резервацій, поки у Вас є протерміновані!</Tooltip>}
                        >
                          <span className="d-inline-block">
                            <Button variant="primary" className="reserve reserve-disabled-button" disabled style={{ pointerEvents: 'none' }}>
                              Зарезервувати
                            </Button>
                          </span>
                        </OverlayTrigger>
                      ) : (
                        <>
                          {!isAdmin && loggedIn && (
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>У вас вже є резервація {product.type === "Книга" ? "книги!" : "пазла!"}</Tooltip>}
                            >
                              <span className="d-inline-block">
                                <Button variant="primary" className="reserve reserve-disabled-button" disabled style={{ pointerEvents: 'none' }}>
                                  Зарезервувати
                                </Button>
                              </span>
                            </OverlayTrigger>
                          )}
                        </>
                      )}
                      </>
                    )}

                  </div>
                </div>
              </div>
              
            </Card.Body>
            <div className="singleProduct-description">
              <span
                className={`${ darkMode ? "singleProduct-description-dark" : "singleProduct-description-light" }`}
                dangerouslySetInnerHTML={{ __html: product.content }}
              />
            </div>

          {product.type === "Книга" && (
            <>
            <div className="singleProduct-about-author">
              <span className="singleProduct-detail about-author-title">Про автора</span>
            </div>
            <div className="singleProduct-description">
              <span
                className={`${ darkMode ? "singleProduct-description-dark" : "singleProduct-description-light" }`}
                dangerouslySetInnerHTML={{ __html: product.aboutAuthor }}
              />
            </div>
            </>
          )}
          </Card>
        </div>
      </div>
      <div className={`space-between ${darkMode ? "space-between-dark" : "space-between-light"}`}>.</div>
      <Footer />
    </>
  );
  
}