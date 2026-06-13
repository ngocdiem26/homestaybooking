import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AdminBookings from '../pages/admin/AdminBookings';
import AdminComplaints from '../pages/admin/AdminComplaints';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminHomestays from '../pages/admin/AdminHomestays';
import AdminPromotions from '../pages/admin/AdminPromotions';
import AdminRevenue from '../pages/admin/AdminRevenue';
import AdminReviews from '../pages/admin/AdminReviews';
import AdminUsers from '../pages/admin/AdminUsers';
import HomestayManagement from '../pages/host/HomestayManagement';
import HostDashboard from '../pages/host/HostDashboard';
import HostRevenue from '../pages/host/Revenue';
import About from '../pages/public/About';
import Activities from '../pages/public/Activities';
import Home from '../pages/public/Home';
import HomestayDetail from '../pages/public/HomestayDetail';
import Login from '../pages/public/Login';
import Partners from '../pages/public/Partners';
import Register from '../pages/public/Register';
import Search from '../pages/public/SearchContent';
import Favorite from '../pages/user/Favorite';
import Profile from '../pages/user/Profile';

export default function AppRoutes() {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (id) => {
    setFavorites((currentFavorites) =>
      currentFavorites.includes(id)
        ? currentFavorites.filter((favoriteId) => favoriteId !== id)
        : [...currentFavorites, id]
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home favorites={favorites} toggleFavorite={toggleFavorite} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search />} />
        <Route path="/favorites" element={<Favorite favorites={favorites} toggleFavorite={toggleFavorite} />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/about" element={<About />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/homestay/:id" element={<HomestayDetail />} />

        <Route path="/host" element={<HostDashboard />} />
        <Route path="/host/homestays" element={<HomestayManagement />} />
        <Route path="/host/revenue" element={<HostRevenue />} />

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
}
