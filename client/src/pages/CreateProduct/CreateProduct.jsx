import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Card, Button } from "react-bootstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@aaditya1978/ckeditor5-build-classic";
import { ThemeContext } from "../../ThemeContext";
import { genresBooks, categoriesPuzzles, types, covers, ages } from "../../constants";
import axios from "axios";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";
import "./CreateProduct.css";

export default function CreateProduct() {

  const theme = useContext(ThemeContext);
  const darkMode = theme.state.darkMode;

  const navigate = useNavigate();

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
  const [amountPagesDetails, setAmountPagesDetails] = useState(0);
  const [yearWeight, setYearWeight] = useState(0);
  const [languageCountry, setLanguageCountry] = useState("");
  const [age, setAge] = useState("");
  const [coverSize, setCoverSize] = useState("");
  const [publisherPicSize, setPublisherPicSize] = useState("");
  const [amountInStock, setAmountInStock] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login");
    }
    setType("Книга");
  }, [navigate]);

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
    formData.append("title", title);
    formData.append("author", author);
    formData.append("aboutAuthor", aboutAuthor);
    formData.append("content", sanitizeContent);
    formData.append("image", imageData);
    formData.append("date", new Date());
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
    
    axios({
      method: "post",
      url: `/user/create`,
      data: formData,
    })
      .then((res) => { navigate("/"); })
      .catch((err) => {
        setError(true);
        setErrorMessage(err.response.data.error);
        navigate("/login");
      });
  };

  useEffect(() => {
    if (type !== "Книга") {
      setTitle("");
      setAuthor("");
      setAboutAuthor("");
      setContent("");
      setCategory("");
      setAmountPagesDetails("");
      setYearWeight("");
      setLanguageCountry("");
      setCoverSize("");
      setPublisherPicSize("");
      setAmountInStock("");
    }
  }, [type]);
  

  return (
    <>
      <NavBar />
      <div className={`createProduct-container ${darkMode ? "createProduct-container-dark" : "createProduct-container-light"}`}>
        <Container>
          <Card className={`card ${darkMode ? "card-dark" : "card-light"}`}>
            <Card.Body>
              <h1 className="heading">Новий продукт</h1>
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
                          required
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
                          <Form.Control className="author" type="text"
                            value={amountInStock}
                            onChange={(e) => { 
                              const input = e.target.value;
                              if (/^\d*\.?\d*$/.test(input)) {
                                setAmountInStock(input);
                              }
                            }}
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
                          <Form.Control className="author" type="text" 
                            value={amountPagesDetails}
                            onChange={(e) => { 
                              const input = e.target.value;
                              if (/^\d*\.?\d*$/.test(input)) {
                                setAmountPagesDetails(input);
                              }
                            }}
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
                  <Form.Control type="text" placeholder="Введіть назву"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); }}
                    required
                  />
                </Form.Group>
                <CKEditor editor={ClassicEditor}
                  onChange={(event, editor) => { const data = editor.getData(); setContent(data); }}
                  config={{ placeholder: "Додайте опис...", }}
                />
                {type === "Книга" && (
                  <>
                  <Form.Label className={`form-label about-author ${darkMode ? "form-label-dark" : "form-label-light"}`}>Про автора:</Form.Label>
                  <CKEditor editor={ClassicEditor}
                    onChange={(event, editor) => { const data = editor.getData(); setAboutAuthor(data); }}
                    config={{ placeholder: "Додайте опис...", }}
                  />
                  </>
                )}
                <Button type="submit" className="mt-3 submit">
                  Додати
                </Button>
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
