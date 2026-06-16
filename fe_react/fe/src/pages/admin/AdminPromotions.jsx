import { useNavigate } from 'react-router-dom';
import AdminPromotionsView from '../../components/admin/promotions/AdminPromotionsView';
import { useAdminPromotions } from '../../hooks/useAdminPromotions';
import AdminLayout from '../../layouts/AdminLayout';

export default function AdminPromotions() {
  const navigate = useNavigate();
  const adminPromotions = useAdminPromotions();

  return (
    <AdminLayout>
      <AdminPromotionsView
        {...adminPromotions}
        onBackToDashboard={() => navigate('/admin')}
        onDelete={adminPromotions.removePromotion}
        onEdit={adminPromotions.openEditForm}
        onRefresh={adminPromotions.loadPromotions}
        onResetFilters={adminPromotions.resetFilters}
        onSearchChange={adminPromotions.handleSearchChange}
        onSelectPromotion={adminPromotions.setSelectedPromotion}
        onStatusFilterChange={adminPromotions.handleStatusFilterChange}
        onToggleStatus={adminPromotions.togglePromotionStatus}
      />
    </AdminLayout>
  );
}
