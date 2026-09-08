
import { useEffect, useMemo, useState } from 'react';
import { emptyHostHomestayForm } from '../data/hostHomestayData';
import { isWithinDateFilter, pickDateValue } from '../utils/dateFilter';
import {
  createHostHomestay,
  deleteHostHomestay,
  getHostHomestays,
  updateHostHomestay,
  uploadHostHomestayImages,
} from '../services/hostHomestayService';

const ITEMS_PER_PAGE = 10;

const DEFAULT_CHECKIN_TIME = '14:00';
const DEFAULT_CHECKIN_END_TIME = '20:00';
const DEFAULT_CHECKOUT_START_TIME = '08:00';
const DEFAULT_CHECKOUT_TIME = '12:00';

function createEmptyHomestayForm() {
  return {
    ...emptyHostHomestayForm,
    checkinTime: emptyHostHomestayForm.checkinTime || DEFAULT_CHECKIN_TIME,
    checkinEndTime: emptyHostHomestayForm.checkinEndTime || DEFAULT_CHECKIN_END_TIME,
    checkoutStartTime: emptyHostHomestayForm.checkoutStartTime || DEFAULT_CHECKOUT_START_TIME,
    checkoutTime: emptyHostHomestayForm.checkoutTime || DEFAULT_CHECKOUT_TIME,
  };
}

function normalizeHomestayPayload(formFields) {
  return {
    ...formFields,
    price: Number(formFields.price),
    discount: Number(formFields.discount || 0),
    guests: Number(formFields.guests),
    bedrooms: Number(formFields.bedrooms),
    bathrooms: Number(formFields.bathrooms),
    livingRoom: Number(formFields.livingRoom),
    kitchen: Number(formFields.kitchen),
    beds: Number(formFields.beds),
    latitude: formFields.latitude === '' || formFields.latitude == null ? '' : Number(formFields.latitude),
    longitude: formFields.longitude === '' || formFields.longitude == null ? '' : Number(formFields.longitude),
  };
}

function normalizeMainImages(images = []) {
  if (images.length === 0) return [];
  const mainIndex = images.findIndex((image) => Boolean(image.isMain));
  const selectedIndex = mainIndex >= 0 ? mainIndex : 0;

  return images.map((image, index) => ({
    ...image,
    isMain: index === selectedIndex,
  }));
}

async function resolvePersistedImages(images = []) {
  const resolvedImages = [];

  for (const image of normalizeMainImages(images)) {
    if (image?.isLocal && image.file) {
      const [uploadedImage] = await uploadHostHomestayImages([image.file], resolvedImages.length);
      if (uploadedImage) {
        resolvedImages.push({ ...uploadedImage, isMain: Boolean(image.isMain) });
      }
    } else if (image?.url) {
      resolvedImages.push(image);
    }
  }

  return normalizeMainImages(resolvedImages);
}

function mergeHomestay(current, updated) {
  return current.map((homestay) => (homestay.homeId === updated.homeId ? updated : homestay));
}

export function useHostHomestays() {
  const [homestays, setHomestays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cityFilter, setCityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHomestay, setEditingHomestay] = useState(null);
  const [selectedHomestay, setSelectedHomestay] = useState(null);
  const [detailHomestay, setDetailHomestay] = useState(null);
  const [configTab, setConfigTab] = useState('images');
  const [formFields, setFormFields] = useState(createEmptyHomestayForm);
  const [newAmenityText, setNewAmenityText] = useState('');
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [newRuleText, setNewRuleText] = useState('');

  const loadHomestays = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getHostHomestays();
      setHomestays(data);
      setCurrentPage(1);
    } catch (requestError) {
      setError(requestError.message || 'Không tải được danh sách homestay');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function initializeHomestays() {
      await loadHomestays();
    }

    initializeHomestays();
  }, []);

  const filteredHomestays = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return homestays.filter((homestay) => {
      const matchesKeyword =
        !keyword ||
        homestay.name.toLowerCase().includes(keyword) ||
        homestay.id.toLowerCase().includes(keyword) ||
        homestay.address.toLowerCase().includes(keyword);
      const matchesCity = cityFilter === 'All' || homestay.city === cityFilter;
      const matchesStatus = statusFilter === 'All' || homestay.status === statusFilter;
      const matchesDate = isWithinDateFilter(
        pickDateValue(homestay, ['createdAt', 'updatedAt']),
        dateFilter,
        dateFrom,
        dateTo
      );

      return matchesKeyword && matchesCity && matchesStatus && matchesDate;
    });
  }, [cityFilter, dateFilter, dateFrom, dateTo, homestays, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredHomestays.length / ITEMS_PER_PAGE);
  const indexOfFirstHomestay = (currentPage - 1) * ITEMS_PER_PAGE;
  const indexOfLastHomestay = Math.min(indexOfFirstHomestay + ITEMS_PER_PAGE, filteredHomestays.length);
  const currentHomestays = filteredHomestays.slice(indexOfFirstHomestay, indexOfFirstHomestay + ITEMS_PER_PAGE);

  const setSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const setCity = (value) => {
    setCityFilter(value);
    setCurrentPage(1);
  };

  const setStatus = (value) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setCityFilter('All');
    setStatusFilter('All');
    setDateFilter('all');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
    loadHomestays();
  };

  const openAdd = () => {
    setEditingHomestay(null);
    setFormFields(createEmptyHomestayForm());
    setIsFormOpen(true);
  };

  const openEdit = (homestay) => {
    setEditingHomestay(homestay);
    setFormFields({
      name: homestay.name,
      city: homestay.city,
      province: homestay.province || '',
      address: homestay.address,
      description: homestay.description || '',
      price: homestay.price,
      discount: homestay.discount ?? 0,
      guests: homestay.guests,
      bedrooms: homestay.bedrooms,
      bathrooms: homestay.bathrooms,
      livingRoom: homestay.livingRoom,
      kitchen: homestay.kitchen,
      beds: homestay.beds ?? 1,
      checkinTime: homestay.checkinTime || DEFAULT_CHECKIN_TIME,
      checkinEndTime: homestay.checkinEndTime || DEFAULT_CHECKIN_END_TIME,
      checkoutStartTime: homestay.checkoutStartTime || DEFAULT_CHECKOUT_START_TIME,
      checkoutTime: homestay.checkoutTime || DEFAULT_CHECKOUT_TIME,
      latitude: homestay.latitude ?? '',
      longitude: homestay.longitude ?? '',
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingHomestay(null);
    setFormFields(createEmptyHomestayForm());
  };

  const saveHomestay = async (event, extraConfig = {}) => {
    event.preventDefault();
    setError('');

    const payload = normalizeHomestayPayload(formFields);
    const configPayload = {
      images: extraConfig.images ?? editingHomestay?.images ?? [],
      amenities: extraConfig.amenities ?? editingHomestay?.amenities ?? [],
      services: extraConfig.services ?? editingHomestay?.services ?? [],
      rules: extraConfig.rules ?? editingHomestay?.rules ?? [],
    };

    try {
      const persistedConfig = {
        ...configPayload,
        images: await resolvePersistedImages(configPayload.images),
      };
      const saved = editingHomestay
        ? await updateHostHomestay(editingHomestay.homeId, { ...editingHomestay, ...payload }, persistedConfig)
        : await createHostHomestay(payload, persistedConfig);

      setHomestays((current) =>
        editingHomestay ? mergeHomestay(current, saved) : [saved, ...current]
      );
      closeForm();
    } catch (requestError) {
      setError(requestError.message || 'Không lưu được homestay');
    }
  };

  const deleteHomestay = async (id, options = {}) => {
    const target = homestays.find((homestay) => homestay.id === id);
    if (!target) return false;

    const shouldSkipConfirm = Boolean(options?.skipConfirm);
    if (!shouldSkipConfirm && !window.confirm('Xóa homestay ' + id + '?')) return false;

    try {
      await deleteHostHomestay(target.homeId);
      setHomestays((current) => current.filter((homestay) => homestay.id !== id));
      return true;
    } catch (requestError) {
      setError(requestError.message || 'Không xóa được homestay');
      return false;
    }
  };

  const openConfig = (homestay, tab = 'images') => {
    setSelectedHomestay(homestay);
    setConfigTab(tab);
  };

  const closeConfig = () => setSelectedHomestay(null);

  const saveConfig = async (configPayload) => {
    if (!selectedHomestay) return;

    try {
      const persistedConfig = {
        images: await resolvePersistedImages(configPayload.images ?? selectedHomestay.images),
        amenities: configPayload.amenities ?? selectedHomestay.amenities,
        services: configPayload.services ?? selectedHomestay.services,
        rules: configPayload.rules ?? selectedHomestay.rules,
      };
      const saved = await updateHostHomestay(
        selectedHomestay.homeId,
        { ...selectedHomestay, ...persistedConfig },
        persistedConfig
      );
      setHomestays((current) => mergeHomestay(current, saved));
      setSelectedHomestay(saved);
      setDetailHomestay((current) => (current?.homeId === saved.homeId ? saved : current));
      closeConfig();
    } catch (requestError) {
      setError(requestError.message || 'Không lưu được cập nhật homestay');
    }
  };

  const updateSelectedHomestay = (updater) => {
    if (!selectedHomestay) return;

    let nextHomestay = null;
    setHomestays((current) =>
      current.map((homestay) => {
        if (homestay.id !== selectedHomestay.id) return homestay;
        nextHomestay = updater(homestay);
        return nextHomestay;
      })
    );

    if (!nextHomestay) return;
    setSelectedHomestay(nextHomestay);

    if (nextHomestay.homeId) {
      updateHostHomestay(nextHomestay.homeId, nextHomestay).catch((requestError) => {
        setError(requestError.message || 'Không cập nhật được homestay');
      });
    }
  };

  const addImage = async (files) => {
    if (!selectedHomestay) return;

    try {
      const uploadedImages = await uploadHostHomestayImages(files, selectedHomestay.images.length);
      if (uploadedImages.length === 0) return;
      updateSelectedHomestay((homestay) => ({
        ...homestay,
        images: normalizeMainImages([...homestay.images, ...uploadedImages]),
      }));
    } catch (requestError) {
      setError(requestError.message || 'Không tải được ảnh homestay');
    }
  };

  const setMainImage = (index) => {
    updateSelectedHomestay((homestay) => ({
      ...homestay,
      images: normalizeMainImages(homestay.images.map((image, imageIndex) => ({ ...image, isMain: imageIndex === index }))),
    }));
  };

  const deleteImage = (index) => {
    updateSelectedHomestay((homestay) => {
      const images = homestay.images.filter((_, imageIndex) => imageIndex !== index);
      return { ...homestay, images: normalizeMainImages(images) };
    });
  };

  const addAmenity = () => {
    const amenity = newAmenityText.trim();
    if (!amenity) return;
    updateSelectedHomestay((homestay) => ({
      ...homestay,
      amenities: homestay.amenities.includes(amenity) ? homestay.amenities : [...homestay.amenities, amenity],
    }));
    setNewAmenityText('');
  };

  const deleteAmenity = (amenity) => {
    updateSelectedHomestay((homestay) => ({
      ...homestay,
      amenities: homestay.amenities.filter((item) => item !== amenity),
    }));
  };

  const addService = () => {
    if (!newServiceName.trim() || !newServicePrice) return;
    updateSelectedHomestay((homestay) => ({
      ...homestay,
      services: [
        ...homestay.services,
        { id: Date.now(), name: newServiceName.trim(), price: Number(newServicePrice), status: 'Đang hoạt động' },
      ],
    }));
    setNewServiceName('');
    setNewServicePrice('');
  };

  const toggleService = (serviceId) => {
    updateSelectedHomestay((homestay) => ({
      ...homestay,
      services: homestay.services.map((service) =>
        service.id === serviceId
          ? { ...service, status: service.status === 'Đang hoạt động' ? 'Tạm ngưng' : 'Đang hoạt động' }
          : service
      ),
    }));
  };

  const deleteService = (serviceId) => {
    updateSelectedHomestay((homestay) => ({
      ...homestay,
      services: homestay.services.filter((service) => service.id !== serviceId),
    }));
  };

  const addRule = () => {
    const rule = newRuleText.trim();
    if (!rule) return;
    updateSelectedHomestay((homestay) => ({ ...homestay, rules: [...homestay.rules, rule] }));
    setNewRuleText('');
  };

  const deleteRule = (index) => {
    updateSelectedHomestay((homestay) => ({
      ...homestay,
      rules: homestay.rules.filter((_, ruleIndex) => ruleIndex !== index),
    }));
  };

  return {
    addAmenity,
    addImage,
    addRule,
    addService,
    cityFilter,
    closeConfig,
    closeForm,
    configTab,
    currentHomestays,
    currentPage,
    deleteAmenity,
    deleteHomestay,
    deleteImage,
    deleteRule,
    deleteService,
    dateFilter,
    dateFrom,
    dateTo,
    detailHomestay,
    editingHomestay,
    error,
    filteredHomestays,
    formFields,
    homestays,
    indexOfFirstHomestay,
    indexOfLastHomestay,
    isFormOpen,
    loading,
    newAmenityText,
    newRuleText,
    newServiceName,
    newServicePrice,
    openAdd,
    openConfig,
    openEdit,
    resetFilters,
    saveConfig,
    saveHomestay,
    searchTerm,
    selectedHomestay,
    setCity,
    setConfigTab,
    setCurrentPage,
    setDateFilter,
    setDateFrom,
    setDateTo,
    setDetailHomestay,
    setFormFields,
    setMainImage,
    setNewAmenityText,
    setNewRuleText,
    setNewServiceName,
    setNewServicePrice,
    setSearch,
    setStatus,
    statusFilter,
    toggleService,
    totalPages,
  };
}

