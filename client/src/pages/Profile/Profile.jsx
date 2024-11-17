import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Card, ListGroup, Button, Modal } from "react-bootstrap";
import { AiOutlineEye } from "react-icons/ai";
import { RiDeleteBin6Line } from "react-icons/ri";
import { FiEdit } from "react-icons/fi";
import { PiHeart } from "react-icons/pi";
import { FaRegComment } from "react-icons/fa";
import { IoIosSearch } from "react-icons/io";
import { Form } from "react-bootstrap";
import Pagination from "react-pagination-js";
import { ThemeContext } from "../../ThemeContext";
import { booksCategoryIcons, puzzlesCategoryIcons } from "../../constants";
import { calculatePageCount, getCurrentPageProducts, getNumberOfPagesNextToActivePage } from "../../pagination";
import axios from "axios";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import "./Profile.css";


export default function Profile() {
  const navigate = useNavigate();

  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [products, setProducts] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [savedProducts, setSavedProducts] = useState([]);
  const [currentCategory, setCurrentCategory] = useState("Книга");
  const [isProduct, setIsProduct] = useState(true);
  const [isAdmin, setIsAdmin] = useState();
  const [showModal, setShowModal] = useState(false);
  const [idToDelete, setIdToDelete] = useState(null);
  const [idToCancel, setIdToCancel] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(6);
  const [productDetails, setProductDetails] = useState({});
  const [userDetails, setUserDetails] = useState({});
  // const [sent, setSent] = useState({});
  const [returned, setReturned] = useState({});
  const [hasOutdatedReservation, setHasOutdatedReservation] = useState(false);
  const [hasBookReservation, setHasBookReservation] = useState(false);
  const [hasPuzzleReservation, setHasPuzzleReservation] = useState(false);
  const [searchPhone, setSearchPhone] = useState('');

  
  const toggleSent = async (reservationId, currentSent) => {
    try {
      const newSent = !currentSent;
      const response = await axios.post(`/user/reservation/${reservationId}/sent`, { sent: newSent });
      
      setReservations(prevReservations => 
        prevReservations.map(reservation => 
          reservation._id === reservationId ? { ...reservation, sent: newSent } : reservation
        )
      );
    } catch (error) {
      console.error('Помилка:', error);
    }
  };

  const toggleReturned = async (reservationId, currentReturned) => {
    try {
      const newReturned = !currentReturned;
      const response = await axios.post(`/user/reservation/${reservationId}/returned`, { returned: newReturned });
      
      setReservations(prevReservations => 
        prevReservations.map(reservation => 
          reservation._id === reservationId ? { ...reservation, returned: newReturned } : reservation
        )
      );
    } catch (error) {
      console.error('Помилка:', error);
    }
  };  

  function calculateDaysAgo(endDate) {
    const today = new Date();
    const end = new Date(endDate);
    
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    const diffDays = Math.round(Math.abs((today - end) / oneDay));

    return diffDays;
}


function getDaysText(days) {
  const lastDigit = days % 10;
  const lastTwoDigits = days % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return 'днів';
  } else if (lastDigit === 1) {
      return 'день';
  } else if (lastDigit >= 2 && lastDigit <= 4) {
      return 'дні';
  } else {
      return 'днів';
  }
}


const calculateDaysRemaining = (endDate) => {
  const today = new Date();
  const end = new Date(endDate);
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Перетворення в дні
  return diffDays;
};



const extendReservation = async (reservationId, endDate) => {
  const newEndDate = new Date(endDate);
  newEndDate.setDate(newEndDate.getDate() + 14); // Додаємо 14 днів

  try {
    await axios.post(`/user/reservation/${reservationId}/extend`, 
    { 
      newEndDate, 
      token: localStorage.getItem("token"), 
    });
    setReservations(prevReservations => 
      prevReservations.map(reservation => 
        reservation._id === reservationId ? { ...reservation, endDate: newEndDate } : reservation
      )
    );
  } catch (error) {
    console.error('Помилка продовження резервації:', error);
  }
};



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
      axios
        .post(`/user/profile`, {
          token: localStorage.getItem("token"),
        })
        .then((res) => {
          setName(res.data.name);
          setEmail(res.data.email);
          setIsAdmin(res.data.isAdmin);
          setProducts(res.data.products);
          setSavedProducts(res.data.savedProducts);
          setReservations(res.data.reservations);
          setReturned(res.data.returned);
        })
        .catch((err) => { navigate("/login"); });
    } else {
      navigate("/login");
    }
  }, [returned]);


  const handleCancel = (id) => {
    setIdToCancel(id);
    setShowModal(true);
  };

  
  const handleConfirmCancelReservation = () => {
    axios
      .post(`/user/delete/reservation`, {
        token: localStorage.getItem("token"),
        id: idToCancel,
      })
      .then((res) => {
        setReservations(res.data.reservations);
        setShowModal(false);
      })
      .catch((err) => {
        if (err.response.status === 401) {
          navigate("/login");
        }
      });
  };

 

  const handleProduct = (id) => {
    navigate(`/product/${id}`);
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

  
  const filterAndSortProducts = (sourceProducts, type) => {
    return sourceProducts
      .filter(product => product.type === type)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const filterAndSortReservations = (sourceReservations, type) => {
    return sourceReservations
      .filter(reservation => reservation.productType === type)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  const booksProducts = filterAndSortProducts(products, "Книга");
  const puzzlesProducts = filterAndSortProducts(products, "Пазл");
  let displayedProducts = currentCategory === "Книга" ? booksProducts : puzzlesProducts;

  const booksSavedProducts = filterAndSortProducts(savedProducts, "Книга");
  const puzzlesSavedProducts = filterAndSortProducts(savedProducts, "Пазл");
  let displayedSavedProducts = currentCategory === "Книга" ? booksSavedProducts : puzzlesSavedProducts;

  const booksReservations = filterAndSortReservations(reservations, "Книга");
  const puzzlesReservations = filterAndSortReservations(reservations, "Пазл");
  let displayedReservations = currentCategory === "Книга" ? booksReservations : puzzlesReservations;


  if (searchPhone) {
    displayedReservations = displayedReservations.filter(reservation => reservation.phone.includes(searchPhone));
  }

  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const numberOfPages = calculatePageCount(isProduct ? displayedProducts : displayedSavedProducts, productsPerPage);

  let pageTotalSize;
  let currentDisplayedProducts;
  if (!isProduct) {
    if (!isAdmin) {
      currentDisplayedProducts = displayedSavedProducts;
      pageTotalSize = displayedSavedProducts.length;
    } else if (isAdmin) {
      currentDisplayedProducts = displayedProducts;
      pageTotalSize = displayedProducts.length;
    }
  } else if (isProduct) {
    currentDisplayedProducts = displayedReservations;
    pageTotalSize = displayedReservations.length;
  }

  const [sortOption, setSortOption] = useState('all-reservs');
  const handleSort = (option) => {
    setSortOption(option);
  }


  const sortProducts = (option) => {
    let sortedProducts = [...currentDisplayedProducts];
    switch(option) {
      case 'all-reservs':
        sortedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'not-received-reservs':
        sortedProducts = sortedProducts.filter(a => !a.sent && !a.address);
        break;
      case 'not-sent-reservs':
        sortedProducts = sortedProducts.filter(a => !a.sent && a.address);
        break;
      case 'outdated-reservs':
        sortedProducts = sortedProducts.filter(a => new Date(a.endDate) < new Date());
        break;
      default:
        // Не потрібно нічого робити, повертаємо оригінальний масив
        break;
    }
    return sortedProducts;
}
  const sortedProducts = sortProducts(sortOption);



  const currentProducts = getCurrentPageProducts(
    sortedProducts,
    currentPage,
    productsPerPage
  );

  useEffect(() => {
    const fetchProductDetails = async () => {
      const details = {};
      const detailsUser = {};
      for (const reservation of reservations) {
        try {
          const response = await axios.get(`user/product/${reservation.product}`); 
          details[reservation.product] = response.data;

          const responseUser = await axios.get(`user/userdata/${reservation.userId}`); 
          detailsUser[reservation.userId] = responseUser.data;
        } catch (error) {
          console.error("Помилка при отриманні інформації про продукт:", error);
        }
      }
      setProductDetails(details);
      setUserDetails(detailsUser);
    };
    fetchProductDetails();
  }, [reservations]);
  
    
  const numberOfPagesNextToActivePage = getNumberOfPagesNextToActivePage(numberOfPages);

  useEffect(() => {
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [currentCategory]);
 
  useEffect(() => {
    setCurrentPage(1);
  }, [productsPerPage]);

  const handleCategoryChange = (category) => {
    setCurrentCategory(category);
    localStorage.setItem('selectedCategory', category);
  };

  useEffect(() => {
    const selectedCategory = localStorage.getItem('selectedCategory');
    if (selectedCategory) {
      setCurrentCategory(selectedCategory);
    }
  }, []);


  return (
    <>
      <NavBar />
      <div className={`profile-container ${darkMode ? "profile-container-dark" : "profile-container-light"}`}>
        <div className={`profile-card ${darkMode ? "profile-card-dark" : "profile-card-light"}`}>
          <Card className={`card ${darkMode ? "card-dark" : "card-light"}`}>
            <Card.Header>Мій профіль</Card.Header>
            <Card.Body className={`card-body ${darkMode ? "card-body-dark" : "card-body-light"}`}>
              <div className="basic-profile">
                <img className="user-icon" src="https://res.cloudinary.com/cloud8/image/upload/v1701182643/icon-w_audmcj.png" alt="" />
                <div>
                  <h1>{name}</h1>
                  <div className="user-email">{email}</div>
                  
                  <div className="user-info">
                    {isAdmin && ( <> Всього книг і пазлів - {products.length} </>) }
                    {!isAdmin && ( <> Всього резервацій - {reservations.length} </>) }
                  </div>
                </div>
              </div>
              <ListGroup className={`list-group ${darkMode ? "list-group-dark" : "list-group-light"}`}>
                <ListGroup.Item
                  className={`list-group-item ${darkMode ? "list-group-item-dark" : "list-group-item-light"} ${isProduct ? "active" : ""}`}
                  onClick={() => { setIsProduct(true); }}
                >
                  {!isAdmin ? (
                    <>
                      {currentCategory === "Книга" ? (
                        <>
                          Мої резервації <span>{booksReservations.length}</span>
                        </>
                      ) : (
                        <>
                          Мої резервації <span>{puzzlesReservations.length}</span>
                        </>
                      )
                    }
                    </>
                  ) : (
                    <>
                      {currentCategory === "Книга" ? (
                        <>
                          Резервації <span>{booksReservations.length}</span>
                        </>
                      ) : (
                        <>
                          Резервації <span>{puzzlesReservations.length}</span>
                        </>
                      )
                    }
                    </>
                  )}

                </ListGroup.Item>

                <ListGroup.Item
                  className={`list-group-item ${darkMode ? "list-group-item-dark" : "list-group-item-light"} ${!isProduct ? "active" : ""}`}
                  onClick={() => { setIsProduct(false); }}
                >
                  
                  {!isAdmin ? (
                    <>
                      {currentCategory === "Книга" ? (
                        <>
                          Улюблені книги <span>{booksSavedProducts.length}</span>
                        </>
                      ) : (
                        <>
                          Улюблені пазли <span>{puzzlesSavedProducts.length}</span>
                        </>
                      )
                    }
                    </>
                  ) : (
                    <>
                    {currentCategory === "Книга" ? (
                        <>
                          Додані книги <span>{booksProducts.length}</span>
                        </>
                      ) : (
                        <>
                          Додані пазли <span>{puzzlesProducts.length}</span>
                        </>
                      )
                    }
                    </>
                  )}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>

          <Form.Group className={`mb-3 sorting2 ${darkMode ? "sorting2-dark" : "sorting2-light"}`}>
            <div className="d-flex">
              <div 
                variant={currentCategory === 'Книга' ? 'primary' : 'outline-primary'} 
                className={`show-book-btn ${darkMode ? "sorting-button-dark" : "sorting-button-light"}`}
                onClick={() => handleCategoryChange('Книга')}
              />
                
              <div 
                variant={currentCategory === 'Пазл' ? 'primary' : 'outline-primary'} 
                className={` show-puzzle-btn ${darkMode ? "sorting-button-dark" : "sorting-button-light"}`}
                onClick={() => handleCategoryChange('Пазл')}
              />
            </div>
          </Form.Group>

          
          {isProduct && (
            <Form.Group className={`mb-3 products-perPage ${darkMode ? "products-perPage-dark" : "products-perPage-light"}`}>
            <Form.Label className={`form-label-sort ${darkMode ? "form-label-sort-dark" : "form-label-sort-light"}`}>
              Елементів на сторінці:
            </Form.Label>
            <Form.Control className={`products-perPage-control ${darkMode ? "products-perPage-control-dark" : "products-perPage-control-light"}`}
              as="select"
              value={productsPerPage}
              onChange={(e) => setProductsPerPage(Number(e.target.value))}
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={36}>36</option>
              <option value={60}>60</option>
              <option value={96}>96</option>
            </Form.Control>
          </Form.Group>
          )}

          {!isProduct && (
            <Form.Group className={`mb-3 products-perPage ${darkMode ? "products-perPage-dark" : "products-perPage-light"}`}>
            <Form.Label className={`form-label-sort ${darkMode ? "form-label-sort-dark" : "form-label-sort-light"}`}>
              Елементів на сторінці:
            </Form.Label>
            <Form.Control className={`products-perPage-control ${darkMode ? "products-perPage-control-dark" : "products-perPage-control-light"}`}
              as="select"
              value={productsPerPage}
              onChange={(e) => setProductsPerPage(Number(e.target.value))}
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={36}>36</option>
              <option value={60}>60</option>
              <option value={96}>96</option>
            </Form.Control>
          </Form.Group>
          )}

          {isAdmin && isProduct && (
            <Form.Group className={`mb-3 sorting ${darkMode ? "sorting-dark" : "sorting-light"}`}>
            <Form.Label className={`form-label-sort ${darkMode ? "form-label-sort-dark" : "form-label-sort-light"}`}>
              Сортувати за:
            </Form.Label>
            <Form.Control className={`sorting-control ${darkMode ? "sorting-control-dark" : "sorting-control-light"}`} 
              as="select"
              value={sortOption}
              onChange={(e) => handleSort(e.target.value)}
            >
              <option value="all-reservs">Всі</option>
              <option value="not-received-reservs">Не отримані</option>
              <option value="not-sent-reservs">Не відправлені</option>
              <option value="outdated-reservs">Протерміновані</option>
            </Form.Control>
          </Form.Group>
          )}

          {!isAdmin && isProduct && (
            <div className="address-to-take">
            <p>Отримуйте резервації щодня з 10:00 до 20:00<br/>за адресою: <a href="https://maps.app.goo.gl/2qFntNqwf63n6G2w9" target="_blank">вул. Львівська, 8</a></p>
          </div>
          )}

        {isAdmin && isProduct && (
          <Form.Group controlId="phoneSearch" className={`mb-3 input-with-icon search-phone ${darkMode ? "search-phone-dark" : "search-phone-light"}`}>
            <div className="input-container">
              <IoIosSearch className="search-icon" />
              <Form.Control 
                type="text" 
                placeholder="Введіть номер телефону" 
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
              />
            </div>
          </Form.Group>
        )}

        </div>
          <div className="profile-products">
            {isProduct ? (
              <>

                {currentProducts.length === 0 && (            
                  <>
                    <div className={`no-products ${darkMode ? "no-products-dark" : "no-products-light"}`}>
                      <h2 className={`create-first-title ${darkMode ? "create-first-title-dark" : "create-first-title-light"}`}>Здається тут нічого немає...</h2>
                      <p className={`create-first ${darkMode ? "create-first-dark" : "create-first-light"}`}>Спробуйте пошукати щось інше</p>
                    </div>
                  </>)
                }

                <div className="profile-products2">
                  {currentProducts.sort((a, b) => new Date(a.createdAt).getTime() - 
                  new Date(b.createdAt).getTime()).reverse().map((reservation) => {
                    const productInfo = productDetails[reservation.product];
                    const userInfo = userDetails[reservation.userId];
                    return (
                      <Card className={`product-card ${darkMode ? "product-card-dark" : "product-card-light"}`} 
                        key={reservation._id}
                      >
                        {productInfo && productInfo.product && ( 
                        <>
                          {productInfo.product.cloudinaryId ? (
                            <Card.Img variant="top" src={productInfo.product.image} />
                          ) : null}
                          <Card.Body>
                            
                          <div className="home-product-info">
                            

                            <span className={`home-product-title res-title ${darkMode ? "home-product-title-dark" : "home-product-title-light"}`}
                                dangerouslySetInnerHTML={{ __html: productInfo.product.title }}
                                onClick={() => { handleProduct(productInfo.product._id); }}
                            />
                            <div className="home-product-author-date profile-product-author">
                              <span className="home-product-author res-author">{productInfo.product.author}</span>
                            </div>
                          </div>

                          <hr className="horizontal-line" />
        
                          {isAdmin ? (
                            <>
                              <div className={`home-product-resdate1 home-product-resdate ${darkMode ? "home-product-resdate-dark" : "home-product-resdate-light"}`}> 
                                <span className="info-field"> Період резервації: </span> <span className={`${darkMode ? "white-space-dark" : "white-space-light"}`}>s</span>  {new Date(reservation.startDate).toLocaleDateString()} – {new Date(reservation.endDate).toLocaleDateString()} 
                              </div>

                              <div className={`home-product-address ${darkMode ? "home-product-address-dark" : "home-product-address-light"}`}> 
                                {reservation.address === null ? (
                                  <div className={`home-product-resdate ${darkMode ? "home-product-resdate-dark" : "home-product-resdate-light"}`}> 
                                    {userInfo && userInfo.user && (<div> <span className="info-field"> Ім'я: </span> {userInfo.user.name} </div>)}
                                    <div> <span className="info-field"> Пошта: </span> {userInfo && userInfo.user && (<span>{userInfo.user.email}</span>)}</div>
                                    <div> <span className="info-field"> Телефон: </span> {reservation.phone}</div>
                                    <div> <span className="info-field"> Доставка: </span> Забираю самостійно</div>
                                  </div>
                                ) : (
                                  <div className={`home-product-resdate ${darkMode ? "home-product-resdate-dark" : "home-product-resdate-light"}`}> 
                                    <div> <span className="info-field"> Ім'я: </span> {reservation.fullName} </div>
                                    <div> <span className="info-field"> Пошта: </span> {userInfo && userInfo.user && (<span>{userInfo.user.email}</span>)}</div>
                                    <div> <span className="info-field"> Телефон: </span> {reservation.phone} </div>
                                    <div> <span className="info-field"> Доставка: </span> {reservation.address} </div>
                                  </div>
                                )}
                              </div>

                            </>
                          ) : (
                            <div className={`home-product-phone ${darkMode ? "home-product-phone-dark" : "home-product-phone-light"}`}>     
                              <span className="info-field"> Період резервації: </span> {new Date(reservation.startDate).toLocaleDateString()} – {new Date(reservation.endDate).toLocaleDateString()}
                            </div>
                          )}
                          <hr className="horizontal-line" />

                    <div className="cancel-sent-return-buttons-text">

                        {(isAdmin && reservation.sent === false && (new Date(reservation.endDate) > new Date())) && (
                          <>
                            <div className="profile-buttons-RR-container">
                              <Button className="delete-button cancel-btn" variant="outline-danger"
                                onClick={() => { handleCancel(reservation._id); }}>
                                Відмінити
                              </Button>

                              <Modal show={showModal} onHide={handleCancelDelete}>
                                <Modal.Header closeButton className={`modal-header ${darkMode ? "modal-header-dark" : "modal-header-light"}`}>
                                  <Modal.Title>Підтвердження видалення</Modal.Title>
                                </Modal.Header>
                                <Modal.Body className={`modal-body ${darkMode ? "modal-body-dark" : "modal-body-light"}`}>
                                  Ви впевнені, що хочете видалити резервацію?
                                </Modal.Body>
                                <Modal.Footer className={`modal-footer ${darkMode ? "modal-footer-dark" : "modal-footer-light"}`}>
                                  <Button variant="secondary" className="button-cancel-deleting" onClick={handleCancelDelete}>
                                    Скасувати
                                  </Button>
                                  <Button variant="danger" className="button-confirm-deleting" onClick={handleConfirmCancelReservation}>
                                    Видалити
                                  </Button>
                                </Modal.Footer>
                              </Modal>
                            </div>
                            </>
                           )}

                          {(!isAdmin && reservation.sent === false && reservation.returned === false) && (new Date(reservation.endDate) > new Date()) && (
                            <>
                            <div className="profile-buttons-RR-container">
                              <Button className="delete-button cancel-btn" variant="outline-danger"
                                onClick={() => { handleCancel(reservation._id); }}>
                                Відмінити
                              </Button>

                              {!isAdmin && (reservation.address === null) && (new Date(reservation.endDate) > new Date()) && (reservation.sent === false) && !hasOutdatedReservation && (
                                <div className="profile-text-RR-container">
                                  <span className="reservation-getting">Заберіть резервацію у зручний час!</span>
                                </div>
                              )}

                              {!isAdmin && (reservation.address !== null) && (new Date(reservation.endDate) > new Date()) && (reservation.sent === false) && !hasOutdatedReservation && (
                                <div className="profile-text-RR-container">
                                  <span className="reservation-waiting">Будь ласка, очікуйте відправлення!</span>
                                </div>
                              )}

                              {!isAdmin && (reservation.address !== null) && (new Date(reservation.endDate) > new Date()) && (reservation.sent === false) && hasOutdatedReservation && (
                                <div className="profile-text-RR-container">
                                  <span className="reservation-waiting-delivery">Відправлення не буде здійснено, поки у Вас є заборгованість!</span>
                                </div>
                              )}

                              <Modal show={showModal} onHide={handleCancelDelete}>
                                <Modal.Header closeButton className={`modal-header ${darkMode ? "modal-header-dark" : "modal-header-light"}`}>
                                  <Modal.Title>Підтвердження видалення</Modal.Title>
                                </Modal.Header>
                                <Modal.Body className={`modal-body ${darkMode ? "modal-body-dark" : "modal-body-light"}`}>
                                  Ви впевнені, що хочете видалити резервацію?
                                </Modal.Body>
                                <Modal.Footer className={`modal-footer ${darkMode ? "modal-footer-dark" : "modal-footer-light"}`}>
                                  <Button variant="secondary" className="button-cancel-deleting" onClick={handleCancelDelete}>
                                    Скасувати
                                  </Button>
                                  <Button variant="danger" className="button-confirm-deleting" onClick={handleConfirmCancelReservation}>
                                    Видалити
                                  </Button>
                                </Modal.Footer>
                              </Modal>
                            </div>
                            </>
                           )}
                           
                          {(!isAdmin && reservation.returned === true) && (
                            <>
                            <div className="profile-buttons-RR-container">
                              <Button className="delete-button cancel-btn" variant="outline-danger"
                                onClick={() => { handleCancel(reservation._id); }}>
                                Видалити
                              </Button>

                              <Modal show={showModal} onHide={handleCancelDelete}>
                                <Modal.Header closeButton className={`modal-header ${darkMode ? "modal-header-dark" : "modal-header-light"}`}>
                                  <Modal.Title>Підтвердження видалення</Modal.Title>
                                </Modal.Header>
                                <Modal.Body className={`modal-body ${darkMode ? "modal-body-dark" : "modal-body-light"}`}>
                                  Ви впевнені, що хочете видалити резервацію?
                                </Modal.Body>
                                <Modal.Footer className={`modal-footer ${darkMode ? "modal-footer-dark" : "modal-footer-light"}`}>
                                  <Button variant="secondary" className="button-cancel-deleting" onClick={handleCancelDelete}>
                                    Скасувати
                                  </Button>
                                  <Button variant="danger" className="button-confirm-deleting" onClick={handleConfirmCancelReservation}>
                                    Видалити
                                  </Button>
                                </Modal.Footer>
                              </Modal>
                            </div>
                            </>
                           )}

                          

                        {!isAdmin && (new Date(reservation.endDate) > new Date()) && (reservation.sent === true) && (
                            <div className="profile-buttons-RR-container">
                              <div className={`reservation-time-will-end ${darkMode ? "reservation-time-will-end-dark" : "reservation-time-will-end-light"}`}>
                                {(new Date(reservation.endDate) > new Date()) && (reservation.returned === false) && ( // Перевірка чи час резервації вийшов
                                <span> Термін спливає через {calculateDaysAgo(reservation.endDate)} {getDaysText(calculateDaysAgo(reservation.endDate))}.</span>)}

                              {!reservation.extended && calculateDaysRemaining(reservation.endDate) <= 3 && (
                                  <div className="extend-reservation" onClick={() => extendReservation(reservation._id, reservation.endDate)}>
                                    <span>Натисніть тут, якщо бажаєте продовжити резервацію на 2 тижні</span>
                                  </div>
                                )}
                              </div>
                            </div>
                           )}

                        

                          {(!isAdmin && (new Date(reservation.endDate) < new Date()) && (reservation.returned === false)) && (
                            <div className="profile-buttons-RR-container">
                              <div className="reservation-time-outdated">
                                {(new Date(reservation.endDate) < new Date()) && (reservation.returned === false) && ( // Перевірка чи час резервації вийшов
                                <span> Час резервації вийшов! Будь ласка, поверніть {reservation.productType === "Книга" ? "книгу" : "пазл" } найближчим часом! </span>)}
                              </div>
                            </div>
                           )}


                          {!isAdmin && (reservation.address === null) && (new Date(reservation.endDate) > new Date()) && (reservation.sent === false) && hasOutdatedReservation && (
                            <div className="profile-text-RR-container">
                              <span className="reservation-waiting-delivery">Ви не можете забрати {reservation.productType === "Книга" ? "книгу" : "пазл" }, поки у Вас є заборгованість!</span>
                            </div>
                           )}
                           
                           {(isAdmin && (new Date(reservation.endDate) < new Date()) && (reservation.returned === false) ) ? (
                            <div className="profile-text-RR-container">
                              <Button 
                                className={`profile-buttons-RR ${reservation.returned ? "returned-button-clicked" : "returned-button"}`} 
                                onClick={() => toggleReturned(reservation._id, reservation.returned)}>
                                {reservation.returned ? "Повернуто ✓" : "Повернуто"}
                              </Button>
                              <div className="reservation-time-outdated">
                                  Час резервації вийшов {calculateDaysAgo(reservation.endDate)} {getDaysText(calculateDaysAgo(reservation.endDate))} тому
                              </div>
                            </div>
                           ) : (
                            <>
                            {(isAdmin && (new Date(reservation.endDate) < new Date()) && (reservation.returned === true)) && (
                            <div className="profile-buttons-RR-container">
                              <Button 
                                className={`profile-buttons-RR ${reservation.returned ? "returned-button-clicked" : "returned-button"}`} 
                                onClick={() => toggleReturned(reservation._id, reservation.returned)}>
                                {"Повернуто ✓"}
                              </Button>
                            </div>
                            )}
                            </>
                           )}

                          {(isAdmin && (new Date(reservation.endDate) > new Date()) && (reservation.returned === false)) && (
                            <>
                            <div className="profile-buttons-RR-container">
                              <Button 
                                className={`profile-buttons-RR ${reservation.sent ? "sent-button-clicked" : "sent-button"}`} 
                                onClick={() => toggleSent(reservation._id, reservation.sent)}>
                                  {reservation.address == null ? (
                                    reservation.sent ? "Отримано ✓" : "Отримано"
                                    ) : (
                                    reservation.sent ? "Відправлено ✓" : "Відправлено"
                                  )}
                              </Button>
                            </div>
                            </>
                           )}

                          {isAdmin && (new Date(reservation.endDate) > new Date()) && (reservation.sent === true) && (
                            <div className="profile-buttons-RR-container">
                              <Button 
                                className={`profile-buttons-RR returned-btn-admin ${reservation.returned ? "returned-button-clicked" : "returned-button"}`} 
                                onClick={() => toggleReturned(reservation._id, reservation.returned)}>
                                {reservation.returned ? "Повернуто ✓" : "Повернуто"}
                              </Button>
                            </div>
                           )}

                            

                      </div>
                          </Card.Body>
                        </>)}
                      </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                {currentProducts.length === 0 && (            
                  <>
                    <div className={`no-products ${darkMode ? "no-products-dark" : "no-products-light"}`}>
                      <h2 className={`create-first-title ${darkMode ? "create-first-title-dark" : "create-first-title-light"}`}>Здається тут нічого немає...</h2>
                      <p className={`create-first ${darkMode ? "create-first-dark" : "create-first-light"}`}>Спробуйте пошукати щось інше</p>
                    </div>
                  </>)
                }



                {isAdmin ? (
                  <div className="profile-products2">
                  {currentProducts.sort((a, b) => new Date(a.createdAt).getTime() - 
                  new Date(b.createdAt).getTime()).reverse().map((product) => {
                    return (
                      <Card className={`product-card card-admin ${darkMode ? "product-card-dark" : "product-card-light"}`} key={product._id}>
                        {product.cloudinaryId ? (
                          <Card.Img variant="top" src={product.image} />
                        ) : null}
                        <Card.Body>
                          <span className={`home-product-title res-title ${darkMode ? "home-product-title-dark" : "home-product-title-light"}`}
                                dangerouslySetInnerHTML={{ __html: product.title }}
                                onClick={() => { handleProduct(product._id); }}
                            />
                          
                          <div className="product-info-body">
                            <div className="items-left">
                              
                              <div className="product-category"> {product.author} </div>
                              <div className="product-category"> 
                              {product.type === "Книга" ? (booksCategoryIcons[product.category]
                                ) : (
                                  puzzlesCategoryIcons[product.category]
                                )} {product.category}
                              </div>
                              <div className="saves-views">
                                <span> <AiOutlineEye /> {product.views} </span>
                                <span> <PiHeart /> {product.saves.length} </span>
                                <span> <FaRegComment /> {product.comments.length} </span>
                              </div>
                            </div>

                            <div className="buttons-right">
                              <div className="product-info"> {new Date(product.createdAt).toLocaleDateString()} </div>
                              <FiEdit className="edit-button" onClick={() => { navigate(`/edit/${product._id}`); }}/>
                              <RiDeleteBin6Line className="delete-button" onClick={() => { handleDelete(product._id); }}/>

                              <Modal show={showModal} onHide={handleCancelDelete}>
                                <Modal.Header closeButton className={`modal-header ${darkMode ? "modal-header-dark" : "modal-header-light"}`}>
                                  <Modal.Title>Підтвердження видалення</Modal.Title>
                                </Modal.Header>
                                <Modal.Body className={`modal-body ${darkMode ? "modal-body-dark" : "modal-body-light"}`}>
                                  Ви впевнені, що хочете видалити продукт?
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
                          </div>
                        </Card.Body>
                      </Card>
                    );
                  })}
                  
                </div>
                ) : (
                  <div className="saved-Products">
                  {currentProducts.sort((a, b) => new Date(a.createdAt).getTime() - 
                  new Date(b.createdAt).getTime()).reverse().map((product) => {
                    return (
                      <div className={`home-product ${darkMode ? "home-product-dark" : "home-product-light"}`}
                        key={product._id}
                        onClick={() => { handleProduct(product._id); }}
                      >
                        {product.cloudinaryId ? ( <img className="home-product-img" src={product.image} alt=""/> ) : null}
        
                          <div className="home-product-info">
                            <span className={`home-product-title ${darkMode ? "home-product-title-dark" : "home-product-title-light"}`}  dangerouslySetInnerHTML={{ __html: product.title }}/>
                            <div className="home-product-author-date">
                              <span className="home-product-author">{product.author}</span>
                            </div>
                          </div>
        
                          <div className={`home-product-content ${darkMode ? "home-product-content-dark" : "home-product-content-light"}`} 
                                dangerouslySetInnerHTML={{ __html: product.content }} 
                          />
                          <div className={`home-product-bottom ${darkMode ? "home-product-bottom-dark" : "home-product-bottom-light"}`}>
                            <div className={`home-product-right-bottom ${darkMode ? "home-product-right-bottom-dark" : "home-product-right-bottom-light"}`}>
                              <div className={`home-product-category ${darkMode ? "home-product-category-dark" : "home-product-category-light"}`}>
                                {product.type === "Книга" ? (booksCategoryIcons[product.category]
                                  ) : (
                                    puzzlesCategoryIcons[product.category]
                                  )} {product.category}
                              </div>
        
                              <div className="items">
                                <span> <AiOutlineEye /> {product.views} </span>
                                <span> <PiHeart /> {product.saves.length} </span>
                                <span> <FaRegComment /> {product.comments.length} </span>
                              </div>
                            </div>
                          </div>
                      </div>
                    );
                  })}
                </div>
                )}
                
              </>
            )}
          </div>
      </div>
      <div className={`space-between2 ${darkMode ? "space-between2-dark" : "space-between2-light"}`}>.</div>
      {currentProducts.length > 0 && (
        <Pagination
          key={`${displayedProducts}-${displayedSavedProducts.length}`}
          currentPage={currentPage}
          totalSize={pageTotalSize}
          sizePerPage={productsPerPage}
          changeCurrentPage={handlePageChange}
          numberOfPagesNextToActivePage={numberOfPagesNextToActivePage}
          theme={darkMode ? "dark-theme" : "light-theme"}
          paginationClassName="pagination-wrapper"
          nextLinkClassName={`pagination-next ${currentPage === numberOfPages ? "pagination-disabled-link" : ""}`}
          prevLinkClassName={`pagination-prev ${currentPage === 1 ? "pagination-disabled-link" : ""}`}
          activeLinkClassName="pagination-active-link"
          linkClassName="pagination-link"
          disabledClassName="pagination-disabled-link"
          disable={currentPage === 1 || currentPage === numberOfPages}
        />
      )}
      <div className={`space-between ${darkMode ? "space-between-dark" : "space-between-light"}`}>.</div>
      <Footer />
    </>
  );
}
