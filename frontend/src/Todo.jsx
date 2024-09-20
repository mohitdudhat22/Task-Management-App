import React, { useState, useEffect, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-hot-toast";
import { CSVLink } from "react-csv";
import Papa from 'papaparse';
import axios from "axios";
import { useTodoContext } from "./Context/TodoContext";


const API_URL = import.meta.env.VITE_API_URL;


function Todo() {
  const {
    todos,
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
  } = useTodoContext();

  const [todo, setTodo] = useState({
    Title: "",
    Description: "",
    Status: "current",
    DueDate: "",
    Priority: "medium",
    AssignedTo: ""
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setTodo(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTodo = () => {
    if (todo.Title.trim() === "") return;
    addTodo(todo);
    setTodo({
      Title: "",
      Description: "",
      Status: "current",
      DueDate: "",
      Priority: "medium",
      AssignedTo: ""
    });
  };

  const handleUpdateTodo = () => {
    updateTodo(editId, todo);
    setIsEditing(false);
    setEditId(null);
    setTodo({
      Title: "",
      Description: "",
      Status: "current",
      DueDate: "",
      Priority: "medium",
      AssignedTo: ""
    });
  };

  const handleEdit = (task) => {
    setIsEditing(true);
    setEditId(task._id);
    setTodo({
      Title: task.Task,
      Description: task.Description,
      Status: task.Status,
      DueDate: task.DueDate ? task.DueDate.slice(0, 16) : '',
      Priority: task.Priority,
      AssignedTo: task.AssignedTo
    });
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
              const response = await axios.post(`${API_URL}/api/bulk-create`, {data: validTasks}, getAuthHeaders());
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

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <form onSubmit={(e) => e.preventDefault()} className="mb-8 space-y-4">
        <input
          type="text"
          name="Title"
          value={todo.Title}
          onChange={handleInputChange}
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter task title"
          required
        />
        <textarea
          name="Description"
          value={todo.Description}
          onChange={handleInputChange}
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter task description"
        />
        <select
          name="Status"
          value={todo.Status}
          onChange={handleInputChange}
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="current">Current</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
        <input
          type="datetime-local"
          name="DueDate"
          value={todo.DueDate}
          onChange={handleInputChange}
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="Priority"
          value={todo.Priority}
          onChange={handleInputChange}
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <select
          name="AssignedTo"
          value={todo.AssignedTo}
          onChange={handleInputChange}
          className="w-full border border-gray-300 p-3 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select User</option>
          {users?.map(user => (
            <option key={user._id} value={user._id}>{user.Name}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={isEditing ? handleUpdateTodo : handleAddTodo}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded transition duration-300 ease-in-out"
        >
          {isEditing ? "Update Task" : "Add Task"}
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
            <option value="">All Priorities</option>
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
                                    onClick={() => handleEdit(todo)}
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
                            <p>Assigned to: {users?.find(user => user._id === todo.AssignedTo)?.Name || 'Not assigned'}</p>
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
