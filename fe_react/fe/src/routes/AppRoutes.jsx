import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
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
import HostReviews from '../pages/host/HostReviews';
import About from '../pages/public/About';
import Activities from '../pages/public/Activities';
import Home from '../pages/public/Home';
import HomestayDetail from '../pages/public/HomestayDetail';
import Login from '../pages/public/Login';
import Partners from '../pages/public/Partners';
import Register from '../pages/public/Register';
import Search from '../pages/public/SearchContent';
import VnpayResult from '../pages/public/VnpayResult';
import Favorite from '../pages/user/Favorite';
import Profile from '../pages/user/Profile';
import HostBooking from '../pages/host/HostBooking';
import HostComplaints from '../pages/host/HostComplaints';
import { addFavorite, getFavoriteIds, removeFavorite } from '../services/favoriteService';
import { getAuthToken } from '../services/authStorage';
import ChatWidget from "../components/chatbot/ChatWidget";

function ChatbotVisibility() {
  const location = useLocation();

  const hiddenRoutes = ["/admin", "/host", "/profile", "/login", "/register"];
  const hideChatbot = hiddenRoutes.some((route) =>
    location.pathname === route || location.pathname.startsWith(route + "/")
  );

  if (hideChatbot) return null;

  return <ChatWidget />;
}

export default function AppRoutes() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    let isMounted = true;

    async function loadFavoriteIds() {
      if (!getAuthToken()) return;
      try {
        const ids = await getFavoriteIds();
        if (isMounted) setFavorites(ids);
      } catch {
        if (isMounted) setFavorites([]);
      }
    }

    loadFavoriteIds();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleFavorite = async (id) => {
    if (!getAuthToken()) {
      setFavorites((currentFavorites) =>
        currentFavorites.includes(id)
          ? currentFavorites.filter((favoriteId) => favoriteId !== id)
          : [...currentFavorites, id]
      );
      return;
    }

    const wasFavorite = favorites.includes(id);
    setFavorites((currentFavorites) =>
      wasFavorite
        ? currentFavorites.filter((favoriteId) => favoriteId !== id)
        : [...currentFavorites, id]
    );

    try {
      const ids = wasFavorite ? await removeFavorite(id) : await addFavorite(id);
      setFavorites(ids);
    } catch {
      setFavorites((currentFavorites) =>
        wasFavorite
          ? [...currentFavorites, id]
          : currentFavorites.filter((favoriteId) => favoriteId !== id)
      );
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home favorites={favorites} toggleFavorite={toggleFavorite} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/search" element={<Search favorites={favorites} toggleFavorite={toggleFavorite} />} />
        <Route path="/favorites" element={<Favorite favorites={favorites} toggleFavorite={toggleFavorite} />} />
        <Route path="/activities" element={<Activities />} />
        <Route path="/about" element={<About />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/homestay/:id" element={<HomestayDetail favorites={favorites} toggleFavorite={toggleFavorite} />} />
        <Route path="/payment/result" element={<VnpayResult />} />



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
        
        <Route path="/host">
          <Route index element={<HostDashboard />} />
          <Route path="homestays" element={<HomestayManagement />} />
          <Route path="revenue" element={<HostRevenue />} />
          <Route path="bookings" element={<HostBooking />} />
          <Route path="reviews" element={<HostReviews />} />
          <Route path="complaints" element={<HostComplaints />} />
        </Route>

      </Routes>

       <ChatbotVisibility />
    </BrowserRouter>
  );
}



