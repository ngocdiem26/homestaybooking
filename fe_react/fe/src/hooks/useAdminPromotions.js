import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createAdminPromotion,
  deleteAdminPromotion,
  getAdminPromotionTargets,
  getAdminPromotions,
  updateAdminPromotion,
  updateAdminPromotionStatus,
} from '../services/adminPromotionService';
import { isWithinDateFilter, pickDateValue } from '../utils/dateFilter';

const PROMOTIONS_PER_PAGE = 5;

const initialPromotionForm = {
  promotionName: '',
  promotionCode: '',
  promotionScope: 'GLOBAL',
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
  userIds: [],
  homeIds: [],
  tierIds: [],
};

const emptyTargetOptions = {
  users: [],
  homestays: [],
  tiers: [],
};

function normalizeIds(ids) {
  if (!Array.isArray(ids)) return [];
  return [...new Set(ids.map((id) => Number(id)).filter((id) => Number.isFinite(id) && id > 0))];
}

function targetCodes(ids, prefix) {
  return normalizeIds(ids).map((id) => `${prefix}-${String(id).padStart(3, '0')}`);
}

function isTierScope(scope) {
  return scope === 'TIER' || scope === 'HOMESTAY_TIER';
}

function normalizePromotion(promotion) {
  return {
    id: promotion.promotionId,
    name: promotion.promotionName,
    code: promotion.promotionCode,
    promotionScope: promotion.promotionScope || 'GLOBAL',
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
    userIds: normalizeIds(promotion.userIds),
    homeIds: normalizeIds(promotion.homeIds),
    tierIds: normalizeIds(promotion.tierIds),
    assignedUsers: promotion.assignedUsers || [],
    assignedHomestays: promotion.assignedHomestays || [],
    assignedTiers: promotion.assignedTiers || [],
    createdAt: promotion.createdAt,
    updatedAt: promotion.updatedAt,
  };
}

function toPayload(form) {
  return {
    promotionName: form.promotionName.trim(),
    promotionCode: form.promotionCode.trim().toUpperCase(),
    promotionScope: form.promotionScope || 'GLOBAL',
    discountType: form.discountType,
    discountValue: Number(form.discountValue),
    startDate: isTierScope(form.promotionScope) ? null : (form.startDate || null),
    endDate: isTierScope(form.promotionScope) ? null : (form.endDate || null),
    promotionDescription: form.promotionDescription?.trim() || null,
    maxDiscount: form.maxDiscount === '' ? null : Number(form.maxDiscount),
    minOrderAmount: form.minOrderAmount === '' ? 0 : Number(form.minOrderAmount),
    usageLimitTotal: form.usageLimitTotal === '' ? null : Number(form.usageLimitTotal),
    usageLimitPerUser: form.usageLimitPerUser === '' ? null : Number(form.usageLimitPerUser),
    status: form.status,
    userIds: normalizeIds(form.userIds),
    userCodes: targetCodes(form.userIds, 'USR'),
    homeIds: normalizeIds(form.homeIds),
    homeCodes: targetCodes(form.homeIds, 'HMS'),
    tierIds: normalizeIds(form.tierIds),
  };
}

function toForm(promotion) {
  return {
    promotionName: promotion.name || '',
    promotionCode: promotion.code || '',
    promotionScope: promotion.promotionScope || 'GLOBAL',
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
    userIds: normalizeIds(promotion.userIds),
    homeIds: normalizeIds(promotion.homeIds),
    tierIds: normalizeIds(promotion.tierIds),
  };
}

function resetIrrelevantTargets(form, nextScope) {
  const needsUsers = nextScope === 'USER' || nextScope === 'HOMESTAY_USER';
  const needsHomes = ['HOMESTAY', 'HOMESTAY_USER', 'HOMESTAY_TIER'].includes(nextScope);
  const needsTiers = isTierScope(nextScope);

  return {
    ...form,
    promotionScope: nextScope,
    userIds: needsUsers ? form.userIds : [],
    homeIds: needsHomes ? form.homeIds : [],
    tierIds: needsTiers ? form.tierIds : [],
  };
}

export function useAdminPromotions() {
  const [promotions, setPromotions] = useState([]);
  const [targetOptions, setTargetOptions] = useState(emptyTargetOptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState(initialPromotionForm);

  const loadPromotionTargets = useCallback(async () => {
    const data = await getAdminPromotionTargets();
    setTargetOptions({
      users: data?.users || [],
      homestays: data?.homestays || [],
      tiers: data?.tiers || [],
    });
  }, []);

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

    Promise.all([getAdminPromotions(), getAdminPromotionTargets()])
      .then(([promotionData, targetData]) => {
        if (isMounted) {
          setPromotions(promotionData.map(normalizePromotion));
          setTargetOptions({
            users: targetData?.users || [],
            homestays: targetData?.homestays || [],
            tiers: targetData?.tiers || [],
          });
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
        promotion.code?.toLowerCase().includes(keyword) ||
        promotion.promotionScope?.toLowerCase().includes(keyword);
      const matchesDate = isWithinDateFilter(
        pickDateValue(promotion, ['createdAt', 'startDate', 'updatedAt']),
        dateFilter,
        dateFrom,
        dateTo
      );

      return matchesStatus && matchesSearch && matchesDate;
    });
  }, [dateFilter, dateFrom, dateTo, promotions, searchTerm, statusFilter]);

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
    loadPromotionTargets().catch(() => undefined);
  };

  const openEditForm = (promotion) => {
    setEditingPromotion(promotion);
    setForm(toForm(promotion));
    setIsFormOpen(true);
    loadPromotionTargets().catch(() => undefined);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPromotion(null);
    setForm(initialPromotionForm);
  };

  const updateFormField = (field, value) => {
    setForm((currentForm) => {
      if (field === 'promotionScope') {
        return resetIrrelevantTargets(currentForm, value);
      }
      return { ...currentForm, [field]: value };
    });
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
    setDateFilter('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  return {
    currentPage,
    currentPromotions,
    editingPromotion,
    errorMessage,
    dateFilter,
    dateFrom,
    dateTo,
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
    targetOptions,
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
    setDateFilter,
    setDateFrom,
    setDateTo,
    setSelectedPromotion,
    togglePromotionStatus,
    updateFormField,
  };
}
