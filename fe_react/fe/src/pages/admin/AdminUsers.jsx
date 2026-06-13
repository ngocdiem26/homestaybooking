import { useNavigate } from 'react-router-dom';
import AdminUsersView from '../../components/admin/users/AdminUsersView';
import { useAdminUsers } from '../../hooks/useAdminUsers';
import AdminLayout from '../../layouts/AdminLayout';

export default function AdminUsers() {
  const navigate = useNavigate();
  const adminUsers = useAdminUsers();

  return (
    <AdminLayout>
      <AdminUsersView
        {...adminUsers}
        onBackToDashboard={() => navigate('/admin')}
        onChangeRole={adminUsers.changeUserRole}
        onRefresh={adminUsers.loadUsers}
        onResetFilters={adminUsers.resetFilters}
        onRoleFilterChange={adminUsers.handleRoleFilterChange}
        onSearchChange={adminUsers.handleSearchChange}
        onSelectUser={adminUsers.setSelectedUser}
        onToggleStatus={adminUsers.toggleUserStatus}
      />
    </AdminLayout>
  );
}
