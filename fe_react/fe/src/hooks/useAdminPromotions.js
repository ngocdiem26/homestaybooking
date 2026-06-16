import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createAdminPromotion,
  deleteAdminPromotion,
  getAdminPromotions,
  updateAdminPromotion,
  updateAdminPromotionStatus,
} from '../services/adminPromotionService';

const PROMOTIONS_PER_PAGE = 5;

const initialPromotionForm = {
  promotionName: '',
  promotionCode: '',
  discountType: 'PERCENT',
  discountValue: '',
  startDate: '',
  endDate: '',
  promotionDescription: '',
  maxDiscount: '',
  minOrderAmount: '',
  usageLimitTotal: '',
  usageLimitPerUser: '',
  status: 'ACTIVE',
};

function normalizePromotion(promotion) {
  return {
    id: promotion.promotionId,
    name: promotion.promotionName,
    code: promotion.promotionCode,
    discountType: promotion.discountType,
    discountValue: promotion.discountValue,
    startDate: promotion.startDate,
    endDate: promotion.endDate,
    description: promotion.promotionDescription,
    maxDiscount: promotion.maxDiscount,
    minOrderAmount: promotion.minOrderAmount,
    usageLimitTotal: promotion.usageLimitTotal,
    usageLimitPerUser: promotion.usageLimitPerUser,
    status: promotion.status,
    createdAt: promotion.createdAt,
    updatedAt: promotion.updatedAt,
  };
}

function toPayload(form) {
  return {
    promotionName: form.promotionName.trim(),
    promotionCode: form.promotionCode.trim().toUpperCase(),
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    startDate: form.startDate,
    endDate: form.endDate,
    promotionDescription: form.promotionDescription?.trim() || null,
    maxDiscount: form.maxDiscount === '' ? null : Number(form.maxDiscount),
    minOrderAmount: form.minOrderAmount === '' ? 0 : Number(form.minOrderAmount),
    usageLimitTotal: form.usageLimitTotal === '' ? null : Number(form.usageLimitTotal),
    usageLimitPerUser: form.usageLimitPerUser === '' ? null : Number(form.usageLimitPerUser),
    status: form.status,
  };
}

function toForm(promotion) {
  return {
    promotionName: promotion.name || '',
    promotionCode: promotion.code || '',
    discountType: promotion.discountType || 'PERCENT',
    discountValue: promotion.discountValue || '',
    startDate: promotion.startDate || '',
    endDate: promotion.endDate || '',
    promotionDescription: promotion.description || '',
    maxDiscount: promotion.maxDiscount || '',
    minOrderAmount: promotion.minOrderAmount || '',
    usageLimitTotal: promotion.usageLimitTotal || '',
    usageLimitPerUser: promotion.usageLimitPerUser || '',
    status: promotion.status || 'ACTIVE',
  };
}

export function useAdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(initialPromotionForm);

  const loadPromotions = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await getAdminPromotions();
      setPromotions(data.map(normalizePromotion));
    } catch (error) {
      setErrorMessage(error.message || 'Không thể tải danh sách khuyến mãi.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    getAdminPromotions()
      .then((data) => {
        if (isMounted) {
          setPromotions(data.map(normalizePromotion));
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error.message || 'Không thể tải danh sách khuyến mãi.');
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

  const filteredPromotions = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return promotions.filter((promotion) => {
      const matchesStatus = statusFilter === 'ALL' || promotion.status === statusFilter;
      const matchesSearch =
        promotion.name?.toLowerCase().includes(keyword) ||
        promotion.code?.toLowerCase().includes(keyword);

      return matchesStatus && matchesSearch;
    });
  }, [promotions, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredPromotions.length / PROMOTIONS_PER_PAGE);
  const indexOfLastPromotion = currentPage * PROMOTIONS_PER_PAGE;
  const indexOfFirstPromotion = indexOfLastPromotion - PROMOTIONS_PER_PAGE;
  const currentPromotions = filteredPromotions.slice(indexOfFirstPromotion, indexOfLastPromotion);

  const updatePromotionInState = (updatedPromotion) => {
    const normalizedPromotion = normalizePromotion(updatedPromotion);

    setPromotions((currentPromotions) =>
      currentPromotions.map((promotion) =>
        promotion.id === normalizedPromotion.id ? normalizedPromotion : promotion
      )
    );
    setSelectedPromotion((currentPromotion) =>
      currentPromotion?.id === normalizedPromotion.id ? normalizedPromotion : currentPromotion
    );
  };

  const openCreateForm = () => {
    setEditingPromotion(null);
    setForm(initialPromotionForm);
    setIsFormOpen(true);
  };

  const openEditForm = (promotion) => {
    setEditingPromotion(promotion);
    setForm(toForm(promotion));
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPromotion(null);
    setForm(initialPromotionForm);
  };

  const updateFormField = (field, value) => {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const savePromotion = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    try {
      const payload = toPayload(form);
      const savedPromotion = editingPromotion
        ? await updateAdminPromotion(editingPromotion.id, payload)
        : await createAdminPromotion(payload);

      if (editingPromotion) {
        updatePromotionInState(savedPromotion);
      } else {
        setPromotions((currentPromotions) => [normalizePromotion(savedPromotion), ...currentPromotions]);
      }

      closeForm();
    } catch (error) {
      setErrorMessage(error.message || 'Không thể lưu mã khuyến mãi.');
    }
  };

  const togglePromotionStatus = async (promotion) => {
    const nextStatus = promotion.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    const actionLabel = nextStatus === 'ACTIVE' ? 'kích hoạt' : 'ngưng';

    if (!window.confirm(`Bạn có chắc chắn muốn ${actionLabel} mã này không?`)) {
      return;
    }

    try {
      const updatedPromotion = await updateAdminPromotionStatus(promotion.id, nextStatus);
      updatePromotionInState(updatedPromotion);
    } catch (error) {
      setErrorMessage(error.message || 'Không thể cập nhật trạng thái khuyến mãi.');
    }
  };

  const removePromotion = async (promotion) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã khuyến mãi này không?')) {
      return;
    }

    try {
      await deleteAdminPromotion(promotion.id);
      setPromotions((currentPromotions) =>
        currentPromotions.filter((currentPromotion) => currentPromotion.id !== promotion.id)
      );
      setSelectedPromotion((currentPromotion) =>
        currentPromotion?.id === promotion.id ? null : currentPromotion
      );
    } catch (error) {
      setErrorMessage(error.message || 'Không thể xóa mã khuyến mãi.');
    }
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
    setCurrentPage(1);
  };

  return {
    currentPage,
    currentPromotions,
    editingPromotion,
    errorMessage,
    filteredPromotions,
    form,
    indexOfFirstPromotion,
    indexOfLastPromotion,
    isFormOpen,
    isLoading,
    promotions,
    searchTerm,
    selectedPromotion,
    statusFilter,
    totalPages,
    closeForm,
    handleSearchChange,
    handleStatusFilterChange,
    loadPromotions,
    openCreateForm,
    openEditForm,
    removePromotion,
    resetFilters,
    savePromotion,
    setCurrentPage,
    setSelectedPromotion,
    togglePromotionStatus,
    updateFormField,
  };
}
