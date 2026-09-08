import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  deleteAdminHomestay,
  getAdminHomestays,
  updateAdminHomestayStatus,
} from '../services/adminHomestayService';
import { isWithinDateFilter, pickDateValue } from '../utils/dateFilter';

const HOMESTAYS_PER_PAGE = 4;
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1587061949409-02df41d5e562?q=80&w=600&auto=format&fit=crop';

function buildImageList(homestay) {
  const imageUrls = Array.isArray(homestay.imageUrls) ? homestay.imageUrls.filter(Boolean) : [];
  const mainImage = homestay.mainImage || imageUrls[0] || FALLBACK_IMAGE;

  return [mainImage, ...imageUrls.filter((imageUrl) => imageUrl !== mainImage)];
}

function normalizeHomestay(homestay) {
  const images = buildImageList(homestay);

  return {
    id: homestay.homeId,
    code: `HMS-${String(homestay.homeId).padStart(3, '0')}`,
    name: homestay.homeName,
    address: homestay.homeAddress,
    province: homestay.province,
    description: homestay.homeDescription,
    pricePerNight: homestay.pricePerNight,
    status: homestay.status,
    discountPercent: homestay.discountPercent,
    maxGuest: homestay.maxGuest,
    ratingAvg: homestay.ratingAvg,
    ratingCount: homestay.ratingCount,
    bedroomCount: homestay.bedroomCount,
    bathroomCount: homestay.bathroomCount,
    kitchenCount: homestay.kitchenCount,
    livingRoomCount: homestay.livingRoomCount,
    bedCount: homestay.bedCount,
    checkinTime: homestay.checkinTime,
    checkoutTime: homestay.checkoutTime,
    image: images[0],
    images,
    ownerId: homestay.ownerId,
    ownerCode: `USR-${String(homestay.ownerId).padStart(3, '0')}`,
    ownerName: homestay.ownerName,
    ownerEmail: homestay.ownerEmail,
    ownerPhone: homestay.ownerPhone,
    createdAt: homestay.createdAt,
    updatedAt: homestay.updatedAt,
  };
}

function getActionLabel(status) {
  if (status === 'APPROVED') return 'duyệt';
  if (status === 'REJECTED') return 'từ chối';
  if (status === 'BLOCKED') return 'chặn';
  return 'cập nhật';
}

export function useAdminHomestays() {
  const [homestays, setHomestays] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedHomestay, setSelectedHomestay] = useState(null);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadHomestays = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await getAdminHomestays();
      setHomestays(data.map(normalizeHomestay));
    } catch (error) {
      setErrorMessage(error.message || 'Không thể tải danh sách homestay.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    getAdminHomestays()
      .then((data) => {
        if (isMounted) {
          setHomestays(data.map(normalizeHomestay));
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error.message || 'Không thể tải danh sách homestay.');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredHomestays = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return homestays.filter((homestay) => {
      const matchesSearch =
        homestay.name?.toLowerCase().includes(keyword) ||
        homestay.ownerName?.toLowerCase().includes(keyword) ||
        homestay.address?.toLowerCase().includes(keyword) ||
        homestay.province?.toLowerCase().includes(keyword);
      const matchesStatus = statusFilter === 'ALL' || homestay.status === statusFilter;
      const matchesDate = isWithinDateFilter(
        pickDateValue(homestay, ['createdAt', 'updatedAt']),
        dateFilter,
        dateFrom,
        dateTo
      );

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [dateFilter, dateFrom, dateTo, homestays, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredHomestays.length / HOMESTAYS_PER_PAGE);
  const indexOfLastHomestay = currentPage * HOMESTAYS_PER_PAGE;
  const indexOfFirstHomestay = indexOfLastHomestay - HOMESTAYS_PER_PAGE;
  const currentHomestays = filteredHomestays.slice(indexOfFirstHomestay, indexOfLastHomestay);

  const updateHomestayInState = (updatedHomestay) => {
    const normalizedHomestay = normalizeHomestay(updatedHomestay);

    setHomestays((currentHomestays) =>
      currentHomestays.map((homestay) =>
        homestay.id === normalizedHomestay.id ? normalizedHomestay : homestay
      )
    );
    setSelectedHomestay((currentHomestay) =>
      currentHomestay?.id === normalizedHomestay.id ? normalizedHomestay : currentHomestay
    );
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setDateFilter('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const updateHomestayStatus = async (homestay, status) => {
    if (!window.confirm(`Bạn có chắc chắn muốn ${getActionLabel(status)} homestay này không?`)) {
      return;
    }

    try {
      const updatedHomestay = await updateAdminHomestayStatus(homestay.id, status);
      updateHomestayInState(updatedHomestay);
    } catch (error) {
      setErrorMessage(error.message || 'Không thể cập nhật trạng thái homestay.');
    }
  };

  const removeHomestay = async (homestay) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa homestay này khỏi danh sách quản lý không?')) {
      return;
    }

    try {
      await deleteAdminHomestay(homestay.id);
      setHomestays((currentHomestays) =>
        currentHomestays.filter((currentHomestay) => currentHomestay.id !== homestay.id)
      );
      setSelectedHomestay((currentHomestay) =>
        currentHomestay?.id === homestay.id ? null : currentHomestay
      );
    } catch (error) {
      setErrorMessage(error.message || 'Không thể xóa homestay.');
    }
  };

  return {
    currentHomestays,
    currentPage,
    errorMessage,
    filteredHomestays,
    dateFilter,
    dateFrom,
    dateTo,
    homestays,
    indexOfFirstHomestay,
    indexOfLastHomestay,
    isLoading,
    searchTerm,
    selectedHomestay,
    selectedOwner,
    statusFilter,
    totalPages,
    handleSearchChange,
    handleStatusFilterChange,
    loadHomestays,
    removeHomestay,
    resetFilters,
    setCurrentPage,
    setDateFilter,
    setDateFrom,
    setDateTo,
    setSelectedHomestay,
    setSelectedOwner,
    updateHomestayStatus,
  };
}

