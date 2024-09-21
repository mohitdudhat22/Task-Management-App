import { createContext, useContext, useState, useEffect } from 'react';
import io from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import PropTypes from 'prop-types';
import { getAuthHeaders, fetchTasks, fetchUsers, checkAdminStatus } from './apiUtils';
import axios from 'axios';

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
  const [selectedUser, setSelectedUser] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterName, setFilterName] = useState("");

  useEffect(() => {
    fetchTasks(setTodos);
    fetchUsers(setUsers);
    checkAdminStatus(setIsAdmin);

    socket.on('update-task-list', handleSocketUpdate);
    socket.on('add-new-task', handleNewTask);
    socket.on('delete-task', handleDeleteTask);

    return () => {
      socket.off('update-task-list');
      socket.off('add-new-task');
      socket.off('delete-task');
    };
  }, []);

  const handleSocketUpdate = (updatedTask) => {
    setTodos(prev => ({
      ...prev,
      [updatedTask.Status]: prev[updatedTask.Status]?.map(task => 
        task._id === updatedTask._id ? updatedTask : task
      ) || []
    }));
    fetchTasks(setTodos);
  };

  const handleNewTask = (newTask) => {
    setTodos(prev => {
      const status = newTask.status || 'current';
      fetchTasks(setTodos);
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
      fetchTasks(setTodos);
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
      fetchTasks(setTodos);
    } catch (error) {
      toast.error("Failed to update todo status");
      console.error(error);
    }
  };

  const assignTask = async (taskId, userId) => {
    try {
      const response = await axios.post(`${API_URL}/api/assign-task`, {
        taskId,
        userId
      }, getAuthHeaders());
      console.log(response.data);
      toast.success("Task assigned successfully");
      fetchTasks(setTodos);

    } catch (error) {
      toast.error("Failed to assign task: " + (error.response?.data?.message || error.message));
    }
  };

  const saveFilter = (name, filterConfig) => {
    const newFilter = { id: uuidv4(), name, config: filterConfig };
    setSavedFilters(prev => [...prev, newFilter]);
    toast.success("Filter saved successfully!");
  };

  const deleteFilter = (filterId) => {
    setSavedFilters(prev => prev.filter(filter => filter.id !== filterId));
    toast.success("Filter deleted successfully!");
  };

  const applyFilter = (filterConfig) => {
    setFilters(filterConfig);
    toast.success("Filter applied successfully!");
  };

  const bulkCreateTasks = async (tasks) => {
      console.log(tasks)
    try {
      const response = await axios.post(`${API_URL}/api/bulk-create`, tasks, getAuthHeaders());
      toast.success(`Created ${response.data.length} tasks successfully!`);
      fetchTasks(setTodos);
    } catch (error) {
      toast.error("Failed to create tasks: " + (error.response?.data?.message || error.message));
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceStatus = source.droppableId;
    const destStatus = destination.droppableId;

    const newTodos = { ...todos };
    const [movedTask] = newTodos[sourceStatus].splice(source.index, 1);
    newTodos[destStatus].splice(destination.index, 0, movedTask);

    setTodos(newTodos);

    if (sourceStatus !== destStatus) {
      try {
        await axios.put(`${API_URL}/api/edit/${movedTask._id}`, {
          status: destStatus
        }, getAuthHeaders());
        toast.success("Task status updated successfully!");
      } catch (error) {
        toast.error("Failed to update task status");
        console.error(error);
        fetchTasks(setTodos);
      }
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
    fetchTasks: () => fetchTasks(setTodos),
    addTodo,
    deleteTodo,
    updateTodo,
    changeStatus,
    getAuthHeaders,
    assignTask,
    saveFilter,
    deleteFilter,
    applyFilter,
    bulkCreateTasks,
    onDragEnd,
    selectedUser, 
    setSelectedUser,
    isEditing,
    setIsEditing,
    editId,
    setEditId,
    filterName,
    setFilterName
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};

TodoProvider.propTypes = {
  children: PropTypes.node.isRequired,
};