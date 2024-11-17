import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Form, Card, Button } from "react-bootstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@aaditya1978/ckeditor5-build-classic";
import { ThemeContext } from "../../ThemeContext";
import { genresBooks, categoriesPuzzles, types, covers, ages } from "../../constants";
import axios from "axios";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import "./EditProduct.css";

export default function EditProduct() {

  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;

  const navigate = useNavigate();

  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [aboutAuthor, setAboutAuthor] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [imageData, setImageData] = useState(null);
  const [imageName, setImageName] = useState("");
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [yearWeight, setYearWeight] = useState(0);
  const [amountPagesDetails, setAmountPagesDetails] = useState(0);
  const [languageCountry, setLanguageCountry] = useState("");
  const [age, setAge] = useState("");
  const [coverSize, setCoverSize] = useState("");
  const [publisherPicSize, setPublisherPicSize] = useState("");
  const [amountInStock, setAmountInStock] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
    axios.get(`/user/product/${id}`)
      .then((res) => {
        setTitle(res.data.product.title);
        setAuthor(res.data.product.author);
        setAboutAuthor(res.data.product.aboutAuthor);
        setContent(res.data.product.content);
        setImageData(res.data.product.image);
        setImage(res.data.product.image);
        setCategory(res.data.product.category);
        setType(res.data.product.type);
        setAmountPagesDetails(res.data.product.amountPagesDetails);
        setYearWeight(res.data.product.yearWeight);
        setLanguageCountry(res.data.product.languageCountry);
        setAge(res.data.product.age);
        setCoverSize(res.data.product.coverSize);
        setPublisherPicSize(res.data.product.publisherPicSize);
        setAmountInStock(res.data.product.amountInStock);
      })
      .catch((err) => { navigate("/login"); });
  }, [navigate, id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const sanitizeContent = content.trim();

    if (sanitizeContent.length > 1500) {
      setError(true);
      setErrorMessage("Опис має містити не більше 1300 символів");
      setTimeout(() => { setError(false); setErrorMessage(""); }, 3000);
      return;
    }

    const formData = new FormData();
    formData.append("id", id);
    formData.append("title", title);
    formData.append("author", author);
    formData.append("aboutAuthor", aboutAuthor);
    formData.append("content", sanitizeContent);
    formData.append("image", imageData);
    formData.append("category", category);
    formData.append("type", type);
    formData.append("amountPagesDetails", amountPagesDetails);
    formData.append("yearWeight", yearWeight);
    formData.append("languageCountry", languageCountry);
    formData.append("age", age);
    formData.append("coverSize", coverSize);
    formData.append("publisherPicSize", publisherPicSize);
    formData.append("amountInStock", amountInStock);
    formData.append("token", localStorage.getItem("token"));
    
    axios.post(`/user/edit`, formData)
      .then((res) => { navigate("/"); })
      .catch((err) => {
        setError(true);
        setErrorMessage(err.response.data.error);
        if (err.response.status === 401) {
          navigate("/login");
        }
      });
  };

  const [initialState, setInitialState] = useState({
    title: '',
    author: '',
    aboutAuthor: '',
    content: '',
    image: null,
    imageData: null,
    imageName: '',
    category: '',
    type: '',
    amountPagesDetails: 0,
    yearWeight: 0,
    languageCountry: '',
    age: '',
    coverSize: '',
    publisherPicSize: '',
    amountInStock: 0,
  });

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
    axios.get(`/user/product/${id}`)
      .then((res) => {
        setInitialState({
          title: res.data.product.title,
          author: res.data.product.author,
          aboutAuthor: res.data.product.aboutAuthor,
          content: res.data.product.content,
          imageData: res.data.product.image,
          image: res.data.product.image,
          category: res.data.product.category,
          type: res.data.product.type,
          amountPagesDetails: res.data.product.amountPagesDetails,
          yearWeight: res.data.product.yearWeight,
          languageCountry: res.data.product.languageCountry,
          age: res.data.product.age,
          coverSize: res.data.product.coverSize,
          publisherPicSize: res.data.product.publisherPicSize,
          amountInStock: res.data.product.amountInStock,
        });
      })
      .catch((err) => { navigate("/login"); });
  }, [id]);

  const handleCancel = () => {
    setTitle(initialState.title);
    setAuthor(initialState.author);
    setAboutAuthor(initialState.aboutAuthor);
    setContent(initialState.content);
    setImage(initialState.image);
    setImageData(initialState.imageData);
    setImageName(initialState.imageName);
    setCategory(initialState.category);
    setType(initialState.type);
    setAmountPagesDetails(initialState.amountPagesDetails);
    setYearWeight(initialState.yearWeight);
    setLanguageCountry(initialState.languageCountry);
    setAge(initialState.age);
    setCoverSize(initialState.coverSize);
    setPublisherPicSize(initialState.publisherPicSize);
    setAmountInStock(initialState.amountInStock);
    navigate("/profile");
  };
  

  return (
    <>
      <NavBar />
      <div className={`editProduct-container ${darkMode ? "editProduct-container-dark" : "editProduct-container-light"}`}>
        <Container>
          <Card className={`card ${darkMode ? "card-dark" : "card-light"}`}>
            <Card.Body>
              <h1 className="heading">Редагування</h1>
              <Form onSubmit={handleSubmit}>
              <div className="image-characteristics-section">    
                <div className="image-section">
                  <Form.Group >
                    <Form.Label>Зображення:</Form.Label>
                    <Form.Control type="File" accept="image/*"
                      value={imageName}
                      onChange={(e) => {
                        setImage(URL.createObjectURL(e.target.files[0]));
                        setImageData(e.target.files[0]);
                        setImageName(e.target.value);
                      }}
                      name="image"
                    />
                    {image && ( <img className="img-preview" src={image} alt="preview" /> )}
                    <br />
                    {image && (
                      <Button variant="primary" className="remove-image"
                        onClick={() => { setImage(null); setImageData(null); setImageName(""); }}
                      >
                        Видалити
                      </Button>
                    )}
                  </Form.Group>
                </div>
                
                <div className="characteristics-section">
                      <div className={`form-category-goal ${darkMode ? "form-category-goal-dark" : "form-category-goal-light"}`}>
                        <Form.Group className="mb-3 radio-button">
                          <Form.Label className={`form-label ${darkMode ? "form-label-dark" : "form-label-light"}`}>
                            Тип:
                          </Form.Label>
                          {types.map((typeOption) => (
                            <div key={typeOption} className="mb-31">
                              <Form.Check
                                type="radio"
                                label={typeOption}
                                name="type"
                                id={typeOption}
                                checked={type === typeOption}
                                onChange={() => setType(typeOption)}
                              />
                            </div>
                          ))}
                        </Form.Group>

                        <Form.Group className="mb-3 goal">
                          <Form.Label className={`form-label ${darkMode ? "form-label-dark" : "form-label-light"}`}>
                            Доступна кількість:
                          </Form.Label>
                          <Form.Control type="number"
                            value={amountInStock}
                            onChange={(e) => { setAmountInStock(e.target.value); }}
                            min="1"
                          />
                        </Form.Group>

                        <Form.Group className="mb-3 goal">
                          <Form.Label className={`form-label ${darkMode ? "form-label-dark" : "form-label-light"}`}>
                            {type === "Книга" ? "Жанр:" : "Категорія:"}
                          </Form.Label>
                          <Form.Control 
                            as="select" 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)}
                            required
                          >
                            <option value="" disabled defaultValue>
                              {type === "Книга" ? "Оберіть жанр" : "Оберіть категорію"}
                            </option>
                            {type === "Книга" ? (
                              genresBooks.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))
                            ) : (
                              categoriesPuzzles.map((category) => (
                                <option key={category} value={category}>
                                  {category}
                                </option>
                              ))
                            )}
                          </Form.Control>
                        </Form.Group>

                        <Form.Group className="mb-3 goal">
                          <Form.Label className={`form-label ${darkMode ? "form-label-dark" : "form-label-light"}`}>
                            {type === "Книга" ? "Автор:" : "Компанія:"}
                          </Form.Label>
                          <Form.Control className="author" type="text"  placeholder=""
                            value={author}
                            onChange={(e) => { setAuthor(e.target.value); }}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3 goal">
                          <Form.Label className={`form-label ${darkMode ? "form-label-dark" : "form-label-light"}`}>
                            {type === "Книга" ? "Рік видання:" : "Вага (кг):"} 
                          </Form.Label>
                          <Form.Control className="author" type="text"
                            value={yearWeight}
                            onChange={(e) => { 
                              const input = e.target.value;
                              if (/^\d*\.?\d*$/.test(input)) {
                                setYearWeight(input);
                              }
                            }}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3 goal">
                          <Form.Label className={`form-label ${darkMode ? "form-label-dark" : "form-label-light"}`}>
                            {type === "Книга" ? "Кількість сторінок:" : "Кількість деталей:"}
                          </Form.Label>
                          <Form.Control type="number" 
                            value={amountPagesDetails}
                            onChange={(e) => { setAmountPagesDetails(e.target.value); }}
                            min="0"
                          />
                        </Form.Group>

                        {type === "Книга" ? (
                          <>
                          <Form.Group className="mb-3 goal">
                            <Form.Label className={`form-label ${darkMode ? "form-label-dark" : "form-label-light"}`}>
                              Мова:
                            </Form.Label>
                            <Form.Control className="author" type="text"  placeholder=""
                              value={languageCountry}
                              onChange={(e) => { setLanguageCountry(e.target.value); }}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3 goal">
                            <Form.Label className={`form-label ${darkMode ? "form-label-dark" : "form-label-light"}`}>
                              Видавництво:
                            </Form.Label>
                            <Form.Control className="author" type="text"  placeholder=""
                              value={publisherPicSize}
                              onChange={(e) => { setPublisherPicSize(e.target.value); }}
                            />
                          </Form.Group>

                          <Form.Group className="mb-3 goal">
                            <Form.Label className={`form-label ${darkMode ? "form-label-dark" : "form-label-light"}`}>
                              Обкладинка:
                            </Form.Label>
                            <Form.Control 
                              as="select" 
                              value={coverSize} 
                              onChange={(e) => setCoverSize(e.target.value)}
                              required
                            >
                              <option value="" disabled selected>Оберіть тип обкладинки</option>
                              {covers.map((coverSize) => (
                                <option key={coverSize} value={coverSize}>
                                  {coverSize}
                                </option>
                              ))}
                            </Form.Control>
                            </Form.Group>
                          </>
                        ):(
                          <>
                            <Form.Group className="mb-3 goal">
                              <Form.Label className={`form-label ${darkMode ? "form-label-dark" : "form-label-light"}`}>
                                Країна:
                              </Form.Label>
                              <Form.Control className="author" type="text"  placeholder=""
                                value={languageCountry}
                                onChange={(e) => { setLanguageCountry(e.target.value); }}
                              />
                            </Form.Group>

                            <Form.Group className="mb-3 goal">
                              <Form.Label className={`form-label ${darkMode ? "form-label-dark" : "form-label-light"}`}>
                                Розмір коробки (см):
                              </Form.Label>
                              <Form.Control className="author" type="text" placeholder=""
                                value={coverSize}
                                onChange={(e) => {
                                  let input = e.target.value;
                                  input = input.replace(/[^\dx\s]/g, '');
                                  const numbers = input.match(/\d+/g);
                                  if (numbers && numbers.length >= 3) {
                                    const length = parseInt(numbers[0]);
                                    const width = parseInt(numbers[1]);
                                    const height = parseInt(numbers[2]);
                                    const maxLength = Math.min(length, 99);
                                    const maxWidth = Math.min(width, 99);
                                    const maxHeight = Math.min(height, 99);
                                    input = `${maxLength}x${maxWidth}x${maxHeight}`;
                                  }
                                  setCoverSize(input);
                                }}
                              />
                            </Form.Group>

                            <Form.Group className="mb-3 goal">
                              <Form.Label className={`form-label ${darkMode ? "form-label-dark" : "form-label-light"}`}>
                                Розмір картинки (см):
                              </Form.Label>
                              <Form.Control className="author" type="text" placeholder=""
                                value={publisherPicSize}
                                onChange={(e) => {
                                  let input = e.target.value;
                                  input = input.replace(/[^\dx\s]/g, '');
                                  const numbers = input.match(/\d+/g);
                                  if (numbers && numbers.length >= 2) {
                                    const length = parseInt(numbers[0]);
                                    const width = parseInt(numbers[1]);
                                    const maxLength = Math.min(length, 999);
                                    const maxWidth = Math.min(width, 999);
                                    input = `${maxLength}x${maxWidth}`;
                                  }
                                  setPublisherPicSize(input);
                                }}
                              />
                            </Form.Group>
                          </>
                        )}

                        <Form.Group className="mb-3 goal">
                          <Form.Label className={`form-label ${darkMode ? "form-label-dark" : "form-label-light"}`}>
                            Вікова категорія:
                          </Form.Label>
                          <Form.Control 
                            as="select" 
                            value={age} 
                            onChange={(e) => setAge(e.target.value)}
                            required
                          >
                            <option value="" disabled selected>Оберіть вікову категорію</option>
                            {ages.map((age) => (
                              <option key={age} value={age}>
                                {age}
                              </option>
                            ))}
                          </Form.Control>
                        </Form.Group>
                      </div>
                  </div>
              </div>

                <Form.Group className="mb-3">
                  <Form.Control type="text" placeholder="Назва"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); }}
                    required
                  />
                </Form.Group>
                <CKEditor editor={ClassicEditor}
                  onChange={(event, editor) => { const data = editor.getData(); setContent(data); }}
                  data={content}
                  config={{ placeholder: "Додайте опис...", }}
                />
                {type === "Книга" && (
                  <>
                  <Form.Label className={`form-label about-author ${darkMode ? "form-label-dark" : "form-label-light"}`}>Про автора:</Form.Label>
                  <CKEditor editor={ClassicEditor}
                    onChange={(event, editor) => { const data = editor.getData(); setAboutAuthor(data); }}
                    data={aboutAuthor}
                    config={{ placeholder: "Додайте опис...", }}
                  />
                  </>
                )}
                <div className="buttons">
                  <Button type="submit" className="mt-3 submit">Оновити</Button>
                  <Button type="submit" className="mt-3 cancel" onClick={handleCancel}>Скасувати</Button>
                </div>
              </Form>
              {error && <p className="error">{errorMessage}</p>}
            </Card.Body>
          </Card>
        </Container>
      </div>
      <Footer />
    </>
  );
}
