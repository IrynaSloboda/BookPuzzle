import React, { useState, useEffect, useContext } from "react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AiOutlineEye } from "react-icons/ai";
import { PiHeart } from "react-icons/pi";
import { FaRegComment } from "react-icons/fa";
import { GiBookshelf, GiPuzzle } from "react-icons/gi";
import axios from "axios";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import Header from "../../components/Header/Header";
import { calculatePageCount, getCurrentPageProducts, getNumberOfPagesNextToActivePage } from "../../pagination";
import Pagination from "react-pagination-js";
import { ThemeContext } from "../../ThemeContext";
import { categoryIcons } from "../../constants";


import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedType, setSelectedType] = useState("Книга");
  const [isActive, setIsActive] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage, setProductsPerPage] = useState(5);

  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;

  const [recommendedBooks, setRecommendedBooks] = useState([]);
  const [recommendedPuzzles, setRecommendedPuzzles] = useState([]);

  useEffect(() => {
      axios
        .post(`/user/recommendations`, {
          token: localStorage.getItem("token"),
        })
        .then((res) => {
          setRecommendedBooks(res.data.recommendedBooks);
          setRecommendedPuzzles(res.data.recommendedPuzzles);
        })
        .catch((err) => console.log('Error fetching recommendations:', err));
}, []);



  useEffect(() => {
    axios.get(`/user/products`)
      .then((res) => { setProducts(res.data.products); })
      .catch((err) => { console.log(err); });
  }, []);

  const handleProduct = (id) => {
    navigate(`/product/${id}`);
  };

  const handleCategory = (category) => {
    setSelectedCategory(category);
  };

  const handleType = (type) => {
    setSelectedType(type);
    type === "Книга" ? setIsActive(true) : setIsActive(false);
  };

  const filteredProducts = products.filter((product) => {
    return (selectedCategory === null || product.category === selectedCategory) && (selectedType === null || product.type === selectedType);
  });
  
  const [sortOption, setSortOption] = useState('date-desc');
  const [ageSortOption, setAgeSortOption] = useState('all-ages');
  const handleSort = (sortOption, ageSortOption) => {
    setSortOption(sortOption);
    setAgeSortOption(ageSortOption);
  }

  function calculatePerimeter(size) {
    const [width, height] = size.split('x').map(Number);
    const perimeter = 2 * (width + height);
    return perimeter;
  }

  const sortProducts = (sortOption, ageSortOption) => {
    let sortedProducts = [];
    switch(sortOption) {
      case 'date-desc':
        sortedProducts = [...filteredProducts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'rating':
          sortedProducts = [...filteredProducts].sort((a, b) => b.rating - a.rating);
          break;
      case 'title-asc':
        sortedProducts = [...filteredProducts].sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        sortedProducts = [...filteredProducts].sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'author-asc':
        sortedProducts = [...filteredProducts].sort((a, b) => a.author.localeCompare(b.author));
        break;
      case 'author-desc':
        sortedProducts = [...filteredProducts].sort((a, b) => b.author.localeCompare(a.author));
        break;
      case 'yearWeight-asc':
        sortedProducts = [...filteredProducts].sort((a, b) => a.yearWeight - b.yearWeight);
        break;
      case 'yearWeight-desc':
        sortedProducts = [...filteredProducts].sort((a, b) => b.yearWeight - a.yearWeight);
        break;
      case 'publisherPicSize-asc':
        sortedProducts = [...filteredProducts].sort((a, b) => {
          const perimeterA = calculatePerimeter(a.publisherPicSize);
          const perimeterB = calculatePerimeter(b.publisherPicSize);
          return perimeterA - perimeterB;
      });
        break;
      case 'publisherPicSize-desc':
        sortedProducts = [...filteredProducts].sort((a, b) => {
          const perimeterA = calculatePerimeter(a.publisherPicSize);
          const perimeterB = calculatePerimeter(b.publisherPicSize);
          return perimeterB - perimeterA;
      });
        break;
      case 'amountPagesDetails-asc':
        sortedProducts = [...filteredProducts].sort((a, b) => a.amountPagesDetails - b.amountPagesDetails);
        break;
      case 'amountPagesDetails-desc':
        sortedProducts = [...filteredProducts].sort((a, b) => b.amountPagesDetails - a.amountPagesDetails);
        break;
      default:
        sortedProducts = [...filteredProducts];
        break;
    }
      
      
    switch(ageSortOption) {
      case 'children':
        sortedProducts = sortedProducts.filter(a => a.age === "Для дітей" || a.age === "Для дітей та підлітків");
        break;
      case 'teenagers':
        sortedProducts = sortedProducts.filter(a => a.age === "Для дітей та підлітків" || a.age === "Для підлітків" || a.age === "Для підлітків та дорослих");
        break;
      case 'adults':
        sortedProducts = sortedProducts.filter(a => a.age === "Для підлітків та дорослих" || a.age === "Для дорослих");
        break;
      default:
        break;
    }

    return sortedProducts;
  }
  
  const sortedProducts = sortProducts(sortOption, ageSortOption);
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  const numberOfPages = calculatePageCount(sortedProducts, productsPerPage);

  const currentProducts = getCurrentPageProducts(
    sortedProducts,
    currentPage,
    productsPerPage
  );
    
  const numberOfPagesNextToActivePage = getNumberOfPagesNextToActivePage(numberOfPages);

  const renderCategoryButtons = () => {
    const categories = Object.keys(categoryIcons[selectedType]);
    const buttonClass = `${selectedType === 'Пазл' ? 'category-puzzle-btn' : 'category-btn'} ${darkMode ? "category-btn-dark" : "category-btn-light"}`;

  
    return categories.map((category, index) => (
      <button
        key={index}
        className={`${buttonClass}`}
        onClick={() => handleCategory(category)}
      >
        {categoryIcons[selectedType][category]}
        {category === "Любовні романи" ||
        category === "Наукові видання" ||
        category === "Історичні твори" ? (
          <span className="type-btn1">{category}</span>
        ) : (
          category
        )}
      </button>
    ));
  };

  useEffect(() => {
    const savedSortOption = localStorage.getItem("sortOption");
    const savedType = localStorage.getItem("selectedType");
    const savedCurrentPage = localStorage.getItem("currentPage");
    const savedProductsPerPage = localStorage.getItem("productsPerPage");

    if (savedSortOption) setSortOption(savedSortOption);
    if (savedType) setSelectedType(savedType);
    if (savedCurrentPage) setCurrentPage(Number(savedCurrentPage));
    if (savedProductsPerPage) setProductsPerPage(Number(savedProductsPerPage));
  }, []);

  // Зберігаємо значення в localStorage при їх зміні
  useEffect(() => {
    localStorage.setItem("sortOption", sortOption);
  }, [sortOption]);

  useEffect(() => {
    localStorage.setItem("selectedType", selectedType);
  }, [selectedType]);

  useEffect(() => {
    localStorage.setItem("currentPage", currentPage);
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem("productsPerPage", productsPerPage);
  }, [productsPerPage]);

  useEffect(() => {
    setCurrentPage(1); // встановлюємо поточну сторінку в 1 при завантаженні сторінки
  }, []);

  useEffect(() => {
    setCurrentPage(1); // встановлюємо поточну сторінку в 1 при зміні категорії
  }, [selectedCategory]);
 
  useEffect(() => {
    setCurrentPage(1); // встановлюємо поточну сторінку в 1 при зміні кількості відображення проектів
  }, [productsPerPage]);

  useEffect(() => {
    if (selectedType === "Пазл"){
      setIsActive(false);
    }
    setSortOption("date-desc");
    setSelectedCategory(null);
    setCurrentPage(1);
  }, [selectedType]);



  const recommendedProducts = selectedType === 'Книга' ? recommendedBooks : recommendedPuzzles; 

  return (
    <>
      <NavBar />
      <Header />

      <div className={`categories-container ${ darkMode ? "categories-container-dark" : "categories-container-light" }`}>
        {renderCategoryButtons()}
        <button
          className={`${selectedType === "Книга" ? "category-btn" : "category-puzzle-btn"} ${darkMode ? "category-btn-dark" : "category-btn-light"} category-btn-all `}
          onClick={() => handleCategory(null)}
        >
          {selectedType === "Книга" ? <GiBookshelf /> : <GiPuzzle/>} Всі {selectedType === "Книга" ? "книги" : "пазли"}
        </button>
      </div>

      <div className={`select-options ${darkMode ? "select-options-dark" : "select-options-light"}`}> 
        <button className={`type-btn form-label books-button ${isActive ? 'active-book-btn' : ''}`}
            onClick={() => handleType("Книга")}
          >
            Книги
        </button>

        <Form.Group className={`mb-3 sorting ${darkMode ? "sorting-dark" : "sorting-light"}`}>
          <Form.Label className={`form-label-sort ${darkMode ? "form-label-sort-dark" : "form-label-sort-light"}`}>
            Сортувати за:
          </Form.Label>
          <Form.Control className={`sorting-control ${darkMode ? "sorting-control-dark" : "sorting-control-light"}`} 
            as="select" value={sortOption} 
            onChange={(e) => handleSort(e.target.value, ageSortOption)}>
            <option value="date-desc">Замовчуванням</option>
            <option value="rating">Рейтингом</option>
            <option value="title-asc">Назвою (А - Я)</option>
            <option value="title-desc">Назвою (Я - A)</option>
            <option value="author-asc">Автором (А - Я)</option>
            <option value="author-desc">Автором (Я - A)</option>
            {selectedType === "Книга" ? 
              (<option value="yearWeight-desc">Роком видання (новіші спершу)</option>) 
              : (<option value="publisherPicSize-desc">Розміром картини (більші спершу)</option>)
            }
            {selectedType === "Книга" ? 
              ( <option value="yearWeight-asc">Роком видання (старіші спершу)</option> ) 
              : ( <option value="publisherPicSize-asc">Розміром картини (менші спершу)</option> )
            }
            <option value="amountPagesDetails-asc">{selectedType === "Книга" ? "Кількістю сторінок (0-9)" : "Кількістю деталей (0-9)"}</option>
            <option value="amountPagesDetails-desc">{selectedType === "Книга" ? "Кількістю сторінок (9-0)" : "Кількістю деталей (9-0)"}</option>
          </Form.Control>
        </Form.Group>

        <Form.Group className={`mb-3 age-sorting ${darkMode ? "sorting-dark" : "sorting-light"}`}>
          <Form.Label className={`form-label-sort ${darkMode ? "form-label-sort-dark" : "form-label-sort-light"}`}>
            Вік:
          </Form.Label>
          <Form.Control className={`sorting-control ${darkMode ? "sorting-control-dark" : "sorting-control-light"}`} 
            as="select" value={ageSortOption} 
            onChange={(e) => handleSort(sortOption, e.target.value)}>
            <option value="all-ages">Будь-який</option>
            <option value="children">Для дітей</option>
            <option value="teenagers">Для підлітків</option>
            <option value="adults">Для дорослих</option>
            </Form.Control>
        </Form.Group>

        <Form.Group className={`mb-3 products-perPage ${darkMode ? "products-perPage-dark" : "products-perPage-light"}`}>
          <Form.Label className={`form-label-sort ${darkMode ? "form-label-sort-dark" : "form-label-sort-light"}`}>
            На сторінці:
          </Form.Label>
          <Form.Control className={`products-perPage-control ${darkMode ? "products-perPage-control-dark" : "products-perPage-control-light"}`}
            as="select"
            value={productsPerPage}
            onChange={(e) => setProductsPerPage(Number(e.target.value))}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={80}>80</option>
            <option value={100}>100</option>
          </Form.Control>
        </Form.Group>

        <button className={`type-btn form-label puzzles-button ${isActive ? '' : 'active-puzzle-btn'}`}
            onClick={() => handleType("Пазл")}
        >
            Пазли
        </button>
      </div>

      
    <div className={`title-recommended ${darkMode ? "title-recommended-dark" : "title-recommended-light"}`}>
      <h2 className={`create-first-title ${darkMode ? "create-first-title-dark" : "create-first-title-light"}`}>Рекомендації для Вас</h2>   
    </div>

    <div className={`home-container-recommended home-container ${darkMode ? "home-container-recommended-dark" : "home-container-light"}`}>
        {recommendedProducts.length > 0 && (
          recommendedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((product) => {
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
                          {categoryIcons[selectedType][product.category]} {product.category}
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
          })
        )}
      </div>
      <div className={`space-recommended ${darkMode ? "space-recommended-dark" : "space-recommended-light"}`}>.</div>

      <div className={`home-container ${darkMode ? "home-container-dark" : "home-container-light"}`}>
        {currentProducts.length > 0 ? (
          currentProducts.map((product) => {
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
                          {categoryIcons[selectedType][product.category]} {product.category}
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
          })
          ) : (
            <>
              <div className="no-products">
                <h2 className={`create-first-title ${darkMode ? "create-first-title-dark" : "create-first-title-light"}`}>Здається тут нічого немає...</h2>
                <p className={`create-first ${darkMode ? "create-first-dark" : "create-first-light"}`}>Спробуйте пошукати щось інше</p>
              </div>
            </>
          )}
      </div>
      {currentProducts.length > 0 && (
        <Pagination
          key={`${selectedCategory}-${products.length}`}
          currentPage={currentPage}
          totalSize={sortedProducts.length}
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