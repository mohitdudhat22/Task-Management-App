import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

const TodoContext = createContext();

export const useTodoContext = () => useContext(TodoContext);

export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState({ current: [], pending: [], completed: [] });
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('dueDate');
  const [savedFilters, setSavedFilters] = useState([]);
  const [users, setUsers] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    checkAdminStatus();

    socket.on('update-task-list', handleSocketUpdate);
    socket.on('add-new-task', handleNewTask);
    socket.on('delete-task', handleDeleteTask);

    return () => {
      socket.off('update-task-list');
      socket.off('add-new-task');
      socket.off('delete-task');
    };
  }, []);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { headers: { Authorization: `Bearer ${token}`} } : {};
  };

  const fetchTasks = async () => {
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

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/getAllUsers`, getAuthHeaders());
      setUsers(response.data.users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const checkAdminStatus = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    setIsAdmin(user && user.role === 'admin');
  };

  const handleSocketUpdate = (updatedTask) => {
    setTodos(prev => ({
      ...prev,
      [updatedTask.Status]: prev[updatedTask.Status]?.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      ) || []
    }));
    fetchTasks();
  };

  const handleNewTask = (newTask) => {
    setTodos(prev => {
      const status = newTask.status || 'current';
      fetchTasks();
      return {
        ...prev,
        [status]: Array.isArray(prev[status]) 
          ? [...prev[status], newTask] 
          : [newTask]
      };
    });
  };

  const handleDeleteTask = ({ id, status }) => {
    setTodos(prev => ({
      ...prev,
      [status]: prev[status].filter(todo => todo._id !== id)
    }));
  };

  const addTodo = async (todo) => {
    try {
      const response = await axios.post(`${API_URL}/api/create`, todo, getAuthHeaders());

      socket.emit('new-task', response.data);

      setTodos(prev => ({
        ...prev,
        current: [...prev.current, response.data]
      }));
      toast.success("Todo added successfully!");
    } catch (error) {
      console.error("Error adding todo:", error.response?.data || error.message);
      toast.error("Failed to add todo");
    }
  };

  const deleteTodo = async (id, status) => {
    try {
      await axios.delete(`${API_URL}/api/delete/${id}`, getAuthHeaders());
      setTodos(prev => ({
        ...prev,
        [status]: prev[status].filter(todo => todo._id !== id)
      }));
      toast.success("Todo deleted!");
    } catch (error) {
      toast.error("Failed to delete todo");
      console.error(error);
    }
  };

  const updateTodo = async (id, updatedTodo) => {
    try {
      const response = await axios.put(`${API_URL}/api/edit/${id}`, updatedTodo, getAuthHeaders());

      socket.emit('task-updated', response.data);

      setTodos(prev => ({
        ...prev,
        current: prev.current.map(item => item._id === id ? response.data : item),
        pending: prev.pending.map(item => item._id === id ? response.data : item),
        completed: prev.completed.map(item => item._id === id ? response.data : item)
      }));
      toast.success("Todo updated successfully!");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to update todo");
      console.error(error);
    }
  };

  const changeStatus = async (id, currentStatus, newStatus) => {
    try {
      const response = await axios.put(`${API_URL}/api/edit/${id}`, {
        status: newStatus
      }, getAuthHeaders());

      socket.emit('task-updated', response.data);

      setTodos(prev => ({
        ...prev,
        [currentStatus]: prev[currentStatus].filter(todo => todo._id !== id),
        [newStatus]: [...prev[newStatus], response.data]
      }));
      toast.success(`Todo moved to ${newStatus}!`);
      fetchTasks();
    } catch (error) {
      toast.error("Failed to update todo status");
      console.error(error);
    }
  };

  const value = {
    todos,
    setTodos,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    savedFilters,
    setSavedFilters,
    users,
    isAdmin,
    fetchTasks,
    addTodo,
    deleteTodo,
    updateTodo,
    changeStatus,
    getAuthHeaders
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};