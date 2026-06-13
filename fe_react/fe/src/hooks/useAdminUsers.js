import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserStatus,
} from '../services/adminUserService';

const USERS_PER_PAGE = 4;

function normalizeUser(user) {
  return {
    id: user.userId,
    code: `USR-${String(user.userId).padStart(3, '0')}`,
    name: user.fullName,
    email: user.email,
    phone: user.phoneNumber,
    role: user.roleName,
    status: user.userStatus,
    dob: user.birthday,
    gender: user.gender,
    address: user.address,
    avatar: user.avatar,
    createdAt: user.createdAt,
  };
}

function getNextStatus(status) {
  return status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
}

function getNextRole(role) {
  if (role === 'CUSTOMER') {
    return 'HOST';
  }

  if (role === 'HOST') {
    return 'CUSTOMER';
  }

  return role;
}

export function useAdminUsers() {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await getAdminUsers();
      setUsers(data.map(normalizeUser));
    } catch (error) {
      setErrorMessage(error.message || 'Không thể tải danh sách người dùng.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    getAdminUsers()
      .then((data) => {
        if (isMounted) {
          setUsers(data.map(normalizeUser));
        }
      })
      .catch((error) => {
        if (isMounted) {
          setErrorMessage(error.message || 'Không thể tải danh sách người dùng.');
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

  const filteredUsers = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(keyword) ||
        user.email?.toLowerCase().includes(keyword) ||
        user.phone?.toLowerCase().includes(keyword);
      const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [roleFilter, searchTerm, users]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const indexOfLastUser = currentPage * USERS_PER_PAGE;
  const indexOfFirstUser = indexOfLastUser - USERS_PER_PAGE;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const updateUserInState = (updatedUser) => {
    const normalizedUser = normalizeUser(updatedUser);

    setUsers((currentUsers) =>
      currentUsers.map((user) => (user.id === normalizedUser.id ? normalizedUser : user))
    );
    setSelectedUser((currentUser) =>
      currentUser?.id === normalizedUser.id ? normalizedUser : currentUser
    );
  };

  const handleRoleFilterChange = (role) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setRoleFilter('ALL');
    setCurrentPage(1);
  };

  const toggleUserStatus = async (user) => {
    const nextStatus = getNextStatus(user.status);
    const actionLabel = nextStatus === 'BLOCKED' ? 'khóa' : 'mở khóa';

    if (!window.confirm(`Bạn có chắc chắn muốn ${actionLabel} tài khoản này không?`)) {
      return;
    }

    try {
      const updatedUser = await updateAdminUserStatus(user.id, nextStatus);
      updateUserInState(updatedUser);
    } catch (error) {
      setErrorMessage(error.message || 'Không thể cập nhật trạng thái người dùng.');
    }
  };

  const changeUserRole = async (user) => {
    const nextRole = getNextRole(user.role);

    if (nextRole === user.role) {
      setErrorMessage('Không thể đổi vai trò của tài khoản admin.');
      return;
    }

    if (!window.confirm(`Chuyển vai trò tài khoản này thành ${nextRole}?`)) {
      return;
    }

    try {
      const updatedUser = await updateAdminUserRole(user.id, nextRole);
      updateUserInState(updatedUser);
    } catch (error) {
      setErrorMessage(error.message || 'Không thể cập nhật vai trò người dùng.');
    }
  };

  return {
    currentPage,
    currentUsers,
    errorMessage,
    filteredUsers,
    indexOfFirstUser,
    indexOfLastUser,
    isLoading,
    roleFilter,
    searchTerm,
    selectedUser,
    totalPages,
    users,
    changeUserRole,
    handleRoleFilterChange,
    handleSearchChange,
    loadUsers,
    resetFilters,
    setCurrentPage,
    setSelectedUser,
    toggleUserStatus,
  };
}
