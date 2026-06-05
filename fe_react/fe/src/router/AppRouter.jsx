import { useState } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "../pages/public/Index";
import Login from "../pages/public/Login";
import Register from "../pages/public/Register";
import Search from "../pages/public/SearchContent";
import Favorites from "../pages/public/Favorites";
import Activities from "../pages/public/Activities";
import About from "../pages/public/About";
import Partners from "../pages/public/Partners";
import Profile from "../pages/user/Profile";

// cấu hình điều hướng 
// localhost:5173/ => index.jsx
// localhost:5173/login => Login.jsx
const AppRouter = () => {
    // Quản lý state danh sách yêu thích chung ở file Router thượng tầng để truyền đồng bộ cho các trang
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (id) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  };
    return (
        <BrowserRouter>
            <Routes>
            {/* <Route path="/" element={<Index />} /> */}
            <Route path="/" element={<Index favorites={favorites} toggleFavorite={toggleFavorite} />} />
            {/* <Route path="/" element={<Login />} /> */}

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/search" element={<Search />} />
            <Route path="/favorites" element={<Favorites favorites={favorites} toggleFavorite={toggleFavorite} />} />
            <Route path="/activities" element={<Activities />} />
            <Route path="/about" element={<About /> } />
            <Route path="/partners" element={<Partners /> } />
            <Route path="/profile" element={<Profile />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;