import { useState, useEffect } from 'react';
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  toggleUserActive,
  type UpdateUserData 
} from '@/core/auth/actions/auth-actions';
import type { User } from '@/core/auth/interface/user.interface';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getAllUsers();
      if (data) {
        setUsers(data);
      } else {
        setError('No se pudieron cargar los usuarios');
      }
    } catch (err) {
      setError('Error al cargar usuarios');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
  };
};

export const useUser = (userId: string) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getUserById(userId);
      if (data) {
        setUser(data);
      } else {
        setError('Usuario no encontrado');
      }
    } catch (err) {
      setError('Error al cargar usuario');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (updateData: UpdateUserData) => {
    if (!userId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await updateUser(userId, updateData);
      if (updatedUser) {
        setUser(updatedUser);
        return true;
      } else {
        setError('No se pudo actualizar el usuario');
        return false;
      }
    } catch (err) {
      setError('Error al actualizar usuario');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (isActive: boolean) => {
    if (!userId) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      const updatedUser = await toggleUserActive(userId, isActive);
      if (updatedUser) {
        setUser(updatedUser);
        return true;
      } else {
        setError('No se pudo cambiar el estado del usuario');
        return false;
      }
    } catch (err) {
      setError('Error al cambiar estado del usuario');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  return {
    user,
    loading,
    error,
    updateUser: updateUserData,
    toggleActive,
    refetch: fetchUser,
  };
};