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
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminHomestays from "../pages/admin/AdminHomestays";
import AdminBookings from "../pages/admin/AdminBookings";
import AdminPromotions from "../pages/admin/AdminPromotions";
import AdminComplaints from "../pages/admin/AdminComplaints";
import AdminReviews from "../pages/admin/AdminReviews";
import AdminRevenue from '../pages/admin/AdminRevenue';
import HomestayDetail from '../pages/user/HomestayDetail';




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
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/homestay/:id" element={<HomestayDetail />} />
            <Route path="/admin">
            <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="homestays" element={<AdminHomestays />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="promotions" element={<AdminPromotions />} />
                <Route path="complaints" element={<AdminComplaints />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="revenue" element={<AdminRevenue />} />


                
            </Route>
            
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;