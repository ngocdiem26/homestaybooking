import { useNavigate } from 'react-router-dom';
import AdminHomestaysView from '../../components/admin/homestays/AdminHomestaysView';
import { useAdminHomestays } from '../../hooks/useAdminHomestays';
import AdminLayout from '../../layouts/AdminLayout';

export default function AdminHomestays() {
  const navigate = useNavigate();
  const adminHomestays = useAdminHomestays();

  return (
    <AdminLayout>
      <AdminHomestaysView
        {...adminHomestays}
        onBackToDashboard={() => navigate('/admin')}
        onDelete={adminHomestays.removeHomestay}
        onRefresh={adminHomestays.loadHomestays}
        onResetFilters={adminHomestays.resetFilters}
        onSearchChange={adminHomestays.handleSearchChange}
        onSelectHomestay={adminHomestays.setSelectedHomestay}
        onSelectOwner={adminHomestays.setSelectedOwner}
        onStatusFilterChange={adminHomestays.handleStatusFilterChange}
        onUpdateStatus={adminHomestays.updateHomestayStatus}
      />
    </AdminLayout>
  );
}
