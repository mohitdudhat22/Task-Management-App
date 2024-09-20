import React, { useState, useEffect, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-hot-toast";
import axios from "axios";
import io from 'socket.io-client';
import { CSVLink } from "react-csv";
import Papa from 'papaparse';

const API_URL = import.meta.env.VITE_API_URL;
const socket = io(API_URL);

function Todo() {
  const [todos, setTodos] = useState({ current: [], pending: [], completed: [] });
  const [todo, setTodo] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortBy, setSortBy] = useState('dueDate');
  const [savedFilters, setSavedFilters] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
    checkAdminStatus();

    socket.on('update-task-list', (updatedTask) => {
      setTodos(prev => ({
        ...prev,
        [updatedTask.Status]: prev[updatedTask.Status]?.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        ) || []
      }));
      fetchTasks();
    });

    socket.on('add-new-task', (newTask) => {
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
    });

    socket.on('delete-task', ({ id, status }) => {
      setTodos(prev => ({
        ...prev,
        [status]: prev[status].filter(todo => todo._id !== id)
      }));
    });
  
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
      const response = await axios.get(`${API_URL}/api/users`, getAuthHeaders());
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const checkAdminStatus = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    setIsAdmin(user && user.role === 'admin');
  };

  const addTodo = async () => {
    if (todo.trim() === "") return;

    try {
      const response = await axios.post(`${API_URL}/api/create`, {
        title: todo,
        description: "",
        status: "current"
      }, getAuthHeaders());

      socket.emit('new-task', response.data);

      setTodos(prev => ({
        ...prev,
        current: [...prev.current, response.data]
      }));
      setTodo("");
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

  const editTodo = (id, status) => {
    setIsEditing(true);
    setEditId(id);
    const todoToEdit = todos[status].find(todo => todo._id === id);
    setTodo(todoToEdit.Task);
  };

  const updateTodo = async () => {
    try {
      const response = await axios.put(`${API_URL}/api/edit/${editId}`, {
        title: todo,
        description: "",
        status: "current"
      }, getAuthHeaders());

      socket.emit('task-updated', response.data);

      setTodos(prev => ({
        ...prev,
        current: prev.current.map(item => 
          item._id === editId ? response.data : item
        ),
        pending: prev.pending.map(item => 
          item._id === editId ? response.data : item
        ),
        completed: prev.completed.map(item => 
          item._id === editId ? response.data : item
        )
      }));
      setIsEditing(false);
      setEditId(null);
      setTodo("");
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
        fetchTasks();
      }
    }
  };

  const prepareCSVData = () => {
    return Object.values(todos).flat().map(task => ({
      Title: task.Task,
      Description: task.Description || '',
      DueDate: task.DueDate || '',
      Priority: task.Priority || '',
      Status: task.Status,
      AssignedTo: task.AssignedTo || ''
    }));
  };

  const handleCSVImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error("File size exceeds 1MB limit");
        return;
      }
      
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const validTasks = [];
          const errors = [];
  
          const rows = results.data;
          for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            if (i === rows.length - 1 && !row.Title && !row.Status) {
              continue;
            }
            const rowErrors = validateTask(row);
            if (rowErrors.length === 0) {
              validTasks.push(row);
            } else {
              errors.push({
                row: i + 2,
                errors: rowErrors
              });
            }
          }
  
          if (errors.length > 0) {
            console.log("Import errors:", errors);
            const errorReport = errors.map(error => ({
              Row: error.row,
              Errors: Array.isArray(error.errors) ? error.errors.join('; ') : String(error.errors)
            }));
            const errorCSV = Papa.unparse(errorReport);
            const blob = new Blob([errorCSV], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "import_errors.csv";
            link.click();
            toast.error(`${errors.length} rows failed to import. Check the error report.`);
          }
  
          if (validTasks.length > 0) {
            try {
              const response = await axios.post(`${API_URL}/api/bulk-create`, validTasks, getAuthHeaders());
              toast.success(`Imported ${response.data.length} tasks successfully!`);
              fetchTasks();
            } catch (error) {
              toast.error("Failed to import tasks: " + (error.response?.data?.message || error.message));
              console.error("Import error:", error);
            }
          } else {
            toast.error("No valid tasks found in the CSV file.");
          }
        },
        error: (error) => {
          toast.error("Error parsing CSV: " + error.message);
          console.error("CSV parsing error:", error);
        }
      });
    }
  };

  const assignTask = async (taskId) => {
    if (!selectedUser) {
      toast.error("Please select a user to assign the task");
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/api/assign-task`, {
        taskId,
        userId: selectedUser
      }, getAuthHeaders());

      toast.success("Task assigned successfully");
      fetchTasks();
    } catch (error) {
      toast.error("Failed to assign task: " + (error.response?.data?.message || error.message));
    }
  };

  const validateTask = (task) => {
    const errors = [];
    const requiredFields = ['Title', 'Status'];
    const validStatuses = ['current', 'pending', 'completed'];

    requiredFields.forEach(field => {
      if (!task[field] || task[field].trim() === '') {
        errors.push(`Missing required field: ${field}`);
      }
    });

    if (task.Status && !validStatuses.includes(task.Status.toLowerCase())) {
      errors.push(`Invalid Status: ${task.Status}. Must be 'current', 'pending', or 'completed'`);
    }

    if (task.DueDate) {
      const [day, month, year] = task.DueDate.split('-').map(Number);
      const dueDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (isNaN(dueDate.getTime())) {
        errors.push(`Invalid date format for DueDate: ${task.DueDate}. Expected format: DD-MM-YYYY`);
      } else if (dueDate < today) {
        errors.push(`DueDate cannot be in the past: ${task.DueDate}`);
      }
    }

    const existingTask = Object.values(todos).flat().find(t => t.Task === task.Title);
    if (existingTask) {
      errors.push(`Duplicate task: ${task.Title}`);
    }

    if (task.Description && typeof task.Description !== 'string') {
      errors.push('Description must be a string');
    }

    if (task.AssignedBy && typeof task.AssignedBy !== 'string') {
      errors.push('AssignedBy must be a string');
    }

    if (task.IsAssignedByAdmin !== undefined && typeof task.IsAssignedByAdmin !== 'boolean') {
      errors.push('IsAssignedByAdmin must be a boolean');
    }

    return errors;
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filteredTasks = Object.values(todos).flat();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filteredTasks = filteredTasks.filter(task => {
          if (key === 'dueDate') {
            const taskDate = new Date(task[key]);
            const filterDate = new Date(value);
            return taskDate.toDateString() === filterDate.toDateString();
          }
          return task[key] === value;
        });
      }
    });

    filteredTasks.sort((a, b) => {
      if (sortBy === 'dueDate') {
        return new Date(a[sortBy]) - new Date(b[sortBy]);
      }
      return a[sortBy] > b[sortBy] ? 1 : -1;
    });

    return filteredTasks;
  }, [todos, filters, sortBy]);

  const saveCurrentFilter = () => {
    if (filterName.trim() === "") {
      toast.error("Please enter a name for the filter");
      return;
    }
    setSavedFilters([...savedFilters, { name: filterName, filters: { ...filters } }]);
    setFilterName("");
    toast.success("Filter saved successfully!");
  };

  const loadSavedFilter = (savedFilter) => {
    setFilters(savedFilter.filters);
    toast.success(`Filter "${savedFilter.name}" applied`);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <form onSubmit={(e) => e.preventDefault()} className="mb-8 flex">
        <input
          type="text"
          value={todo}
          onChange={(e) => setTodo(e.target.value)}
          className="flex-grow border border-gray-300 p-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter a new todo"
        />
        <button
          type="button"
          onClick={isEditing ? updateTodo : addTodo}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-r-lg transition duration-300 ease-in-out min-w-[100px]"
        >
          {isEditing ? "Update" : "Add"}
        </button>
      </form>

      <div className="mb-4 flex justify-between">
        <CSVLink
          data={prepareCSVData()}
          filename={"tasks.csv"}
          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded"
        >
          Export CSV
        </CSVLink>
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVImport}
          className="hidden"
          id="csvInput"
        />
        <label htmlFor="csvInput" className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded cursor-pointer">
          Import CSV
        </label>
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex space-x-2">
          <select
            value={filters.status || ""}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
            className="border border-gray-300 p-2 rounded"
          >
            <option value="">All Statuses</option>
            <option value="current">Current</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filters.priority || ""}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
            className="border border-gray-300 p-2 rounded"
          >
            <option value="">AllPriorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
          <input
            type="date"
            value={filters.dueDate || ""}
            onChange={(e) => setFilters({...filters, dueDate: e.target.value})}
            className="border border-gray-300 p-2 rounded"
          />
          <input
            type="text"
            value={filters.assignedTo || ""}
            onChange={(e) => setFilters({...filters, assignedTo: e.target.value})}
            placeholder="Assigned To"
            className="border border-gray-300 p-2 rounded"
          />
        </div>
        <div className="flex space-x-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 p-2 rounded"
          >
            <option value="dueDate">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
            <option value="status">Sort by Status</option>
          </select>
          <input
            type="text"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            placeholder="Filter Name"
            className="border border-gray-300 p-2 rounded"
          />
          <button
            onClick={saveCurrentFilter}
            className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded"
          >
            Save Filter
          </button>
        </div>
        <div className="flex space-x-2 overflow-x-auto">
          {savedFilters.map((filter, index) => (
            <button
              key={index}
              onClick={() => loadSavedFilter(filter)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded whitespace-nowrap"
            >
              {filter.name}
            </button>
          ))}
        </div>
      </div>

      {isAdmin && (
        <div className="mb-4">
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="border border-gray-300 p-2 rounded"
          >
            <option value="">Select User to Assign</option>
            {users.map(user => (
              <option key={user._id} value={user._id}>{user.name}</option>
            ))}
          </select>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-col md:flex-row gap-6">
          {['current', 'pending', 'completed'].map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="flex-1 p-4 bg-gray-100 rounded-lg shadow-md"
                >
                  <h2 className="text-xl font-bold mb-4 capitalize text-gray-700">{status}</h2>
                  {filteredAndSortedTasks.filter(todo => todo.Status === status).map((todo, index) => (
                    <Draggable key={todo._id} draggableId={todo._id.toString()} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-3 mb-3 rounded-lg shadow-sm hover:shadow-md transition duration-300 ease-in-out"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {status !== 'current' && (
                                <input
                                  type="checkbox"
                                  checked={status === 'completed'}
                                  onChange={() => changeStatus(todo._id, status, status === 'pending' ? 'completed' : 'pending')}
                                  className="mr-3 h-5 w-5 text-blue-500"
                                />
                              )}
                              <span className={`${status === 'completed' ? "line-through text-gray-500" : "text-gray-700"} text-lg`}>
                                {todo.Task}
                              </span>
                            </div>
                            <div className="flex space-x-2">
                              {status === 'current' && (
                                <>
                                  <button
                                    onClick={() => changeStatus(todo._id, 'current', 'pending')}
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-full text-sm transition duration-300 ease-in-out"
                                  >
                                    Start
                                  </button>
                                  <button
                                    onClick={() => editTodo(todo._id, status)}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-full text-sm transition duration-300 ease-in-out"
                                  >
                                    Edit
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => deleteTodo(todo._id, status)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-full text-sm transition duration-300 ease-in-out"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            <p>Due: {todo.DueDate || 'Not set'}</p>
                            <p>Priority: {todo.Priority || 'Not set'}</p>
                            <p>Assigned to: {todo.AssignedTo || 'Not assigned'}</p>
                          </div>
                          {isAdmin && (
                            <button
                              onClick={() => assignTask(todo._id)}
                              className="bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-full text-sm transition duration-300 ease-in-out mt-2"
                            >
                              Assign Task
                            </button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default Todo;