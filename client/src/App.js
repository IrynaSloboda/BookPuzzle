import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Signup from "./pages/Signup/Signup";
import Login from "./pages/Login/Login";
import CreateProduct from "./pages/CreateProduct/CreateProduct";
import EditProduct from "./pages/EditProduct/EditProduct";
import SingleProduct from "./pages/SingleProduct/SingleProduct";
import Reservation from "./pages/Reservation/Reservation";
import Search from "./components/Search/Search";
import Profile from "./pages/Profile/Profile";
import ResetPassword from "./pages/ResetPassword/ResetPassword";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/signup" element={<Signup />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/new" element={<CreateProduct />} />
          <Route exact path="/edit/:id" element={<EditProduct />} />
          <Route exact path="/product/:id" element={<SingleProduct />} />
          <Route exact path="/reserve/:id" element={<Reservation />} />
          <Route exact path="/search/:query" element={<Search />} />
          <Route exact path="/profile" element={<Profile />} />
          <Route exact path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;