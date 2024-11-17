import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AiOutlineEye } from "react-icons/ai";
import { PiHeart } from "react-icons/pi";
import { FaRegComment } from "react-icons/fa";
import { booksCategoryIcons, puzzlesCategoryIcons } from "../../constants";
import { calculatePageCount, getCurrentPageProducts, getNumberOfPagesNextToActivePage } from "../../pagination";
import Pagination from "react-pagination-js";
import { ThemeContext } from "../../ThemeContext";
import axios from "axios";
import NavBar from "../NavBar/NavBar";
import Footer from "../Footer/Footer";
import "./Search.css";

export default function Search() {

  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;

  const navigate = useNavigate(); 
  const { query } = useParams();
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    axios.get(`/user/search/${query}`)
      .then((res) => { setProducts(res.data.products); })
      .catch((err) => { console.log(err); });
  }, [query]);

  const handleProduct = (id) => {
    navigate(`/product/${id}`);
  };
  
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  let productsPerPage = 12;

  const numberOfPages = calculatePageCount(products, productsPerPage);

  const currentProducts = getCurrentPageProducts(
    products,
    currentPage,
    productsPerPage
  );
    
  const numberOfPagesNextToActivePage = getNumberOfPagesNextToActivePage(numberOfPages);

  return (
    <>
      <NavBar />
      <div className={`search-container ${darkMode ? "search-container-dark" : "search-container-light"}`}>
        {currentProducts.length > 0 ? (
          currentProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((product) => {
            return (
              <div className={`search-product ${darkMode ? "search-product-dark" : "search-product-light"}`}
                key={product._id}
                onClick={() => { handleProduct(product._id); }}
              >
                {product.cloudinaryId ? (
                  <img className="search-product-img" src={product.image} alt=""/>
                ) : null}
                  <div className="home-product-info">
                    <span className={`home-product-title ${darkMode ? "home-product-title-dark" : "home-product-title-light"}`}  
                      dangerouslySetInnerHTML={{ __html: product.title }}/>
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
          })
          ) : (
            <>
            <div className={`search-no-results ${darkMode ? "search-no-results-dark" : "search-no-results-light"}`}>
              <h3 style={{ marginTop: '0.5rem' }}>На жаль, нічого не знайдено...</h3>
            </div>
            <div className="search-img">
              <img
                  className="img"
                  src="https://res.cloudinary.com/cloud8/image/upload/v1700819240/book_from_puzzles_lidipi.png"
                  alt=""
                />
            </div>
            </>
          )
        }
      </div>
        {currentProducts.length > 0 && (
          <Pagination
            key={`${products.length}`}
            currentPage={currentPage}
            totalSize={products.length}
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