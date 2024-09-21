import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}`} } : {};
};

const fetchTasks = async (setTodos) => {
  try {
    const response = await axios.get(`${API_URL}/api/get`, getAuthHeaders());
    const tasks = response.data;
    setTodos({
      current: tasks.filter(task => task.Status === 'current'),
      pending: tasks.filter(task => task.Status === 'pending'),
      completed: tasks.filter(task => task.Status === 'completed')
    });
  } catch (error) {
    toast.error(error.response?.data?.error || "Failed to fetch tasks");
    console.error(error);
  }
};

const fetchUsers = async (setUsers) => {
  try {
    const response = await axios.get(`${API_URL}/api/getAllUsers`, getAuthHeaders());
    setUsers(response.data.users);
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

const checkAdminStatus = (setIsAdmin) => {
  const user = JSON.parse(localStorage.getItem('user'));
  setIsAdmin(user && user.role === 'admin');
};

export { getAuthHeaders, fetchTasks, fetchUsers, checkAdminStatus, API_URL};