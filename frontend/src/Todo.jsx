import { useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { toast } from "react-hot-toast";
import { CSVLink } from "react-csv";
import Papa from 'papaparse';
import axios from "axios";
import { useTodoContext } from "./Context/TodoContext";
import {
  TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Grid, Paper, Typography, IconButton, Box, Chip
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, PlayArrow as StartIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

const API_URL = import.meta.env.VITE_API_URL;

function Todo() {
  const theme = useTheme();
  const {
    todos,
    setTodos,
    validateTask,
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
  const [selectedUser] = useState("");

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
      console.log(response.data);
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
    <Box sx={{ maxWidth: 1200, margin: 'auto', padding: 4 }}>
      <Paper elevation={3} sx={{ padding: 3, marginBottom: 4 }}>
        <form onSubmit={(e) => e.preventDefault()}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Task Title"
                name="Title"
                value={todo.Title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                name="Description"
                value={todo.Description}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  name="Status"
                  value={todo.Status}
                  onChange={handleInputChange}
                  label="Status"
                >
                  <MenuItem value="current">Current</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Due Date"
                name="DueDate"
                value={todo.DueDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  name="Priority"
                  value={todo.Priority}
                  onChange={handleInputChange}
                  label="Priority"
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Assigned To</InputLabel>
                <Select
                  name="AssignedTo"
                  value={todo.AssignedTo}
                  onChange={handleInputChange}
                  label="Assigned To"
                >
                  <MenuItem value="">Select User</MenuItem>
                  {users?.map(user => (
                    <MenuItem key={user._id} value={user._id}>{user.Name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={isEditing ? handleUpdateTodo : handleAddTodo}
              >
                {isEditing ? "Update Task" : "Add Task"}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <Button
          variant="contained"
          color="success"
          component={CSVLink}
          data={prepareCSVData()}
          filename={"tasks.csv"}
        >
          Export CSV
        </Button>
        <input
          type="file"
          accept=".csv"
          onChange={handleCSVImport}
          style={{ display: 'none' }}
          id="csvInput"
        />
        <label htmlFor="csvInput">
          <Button variant="contained" component="span">
            Import CSV
          </Button>
        </label>
      </Box>

      <Paper elevation={2} sx={{ padding: 2, marginBottom: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status || ""}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                label="Status"
              >
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="current">Current</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority || ""}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                label="Priority"
              >
                <MenuItem value="">All Priorities</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              type="date"
              value={filters.dueDate || ""}
              onChange={(e) => setFilters({...filters, dueDate: e.target.value})}
              label="Due Date"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              value={filters.assignedTo || ""}
              onChange={(e) => setFilters({...filters, assignedTo: e.target.value})}
              label="Assigned To"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="dueDate">Due Date</MenuItem>
                <MenuItem value="priority">Priority</MenuItem>
                <MenuItem value="status">Status</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              label="Filter Name"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={saveCurrentFilter}
            >
              Save Filter
            </Button>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {savedFilters.map((filter, index) => (
                <Chip
                  key={index}
                  label={filter.name}
                  onClick={() => loadSavedFilter(filter)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={3}>
          {['current', 'pending', 'completed'].map((status) => (
            <Grid item xs={12} md={4} key={status}>
              <Droppable droppableId={status}>
                {(provided) => (
                  <Paper
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    elevation={3}
                    sx={{ padding: 2, height: '100%' }}
                  >
                    <Typography variant="h6" gutterBottom>{status.charAt(0).toUpperCase() + status.slice(1)}</Typography>
                    {filteredAndSortedTasks.filter(todo => todo.Status === status).map((todo, index) => (
                      <Draggable key={todo._id} draggableId={todo._id.toString()} index={index}>
                        {(provided) => (
                          <Paper
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            elevation={2}
                            sx={{
                              padding: 2,
                              marginBottom: 2,
                              backgroundColor: theme.palette.background.default,
                              '&:hover': {
                                backgroundColor: theme.palette.action.hover,
                              },
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle1">{todo.Task}</Typography>
                              <Box>
                                {status === 'current' && (
                                  <>
                                    <IconButton onClick={() => changeStatus(todo._id, 'current', 'pending')} size="small">
                                      <StartIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleEdit(todo)} size="small">
                                      <EditIcon />
                                    </IconButton>
                                  </>
                                )}
                                <IconButton onClick={() => deleteTodo(todo._id, status)} size="small">
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                              Due: {todo.DueDate || 'Not set'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Priority: {todo.Priority || 'Not set'}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                              Assigned to: {users?.find(user => user._id === todo.AssignedTo)?.Name || 'Not assigned'}
                            </Typography>
                            {isAdmin && (
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => assignTask(todo._id)}
                                sx={{ marginTop: 1 }}
                              >
                                Assign Task
                              </Button>
                            )}
                          </Paper>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </Paper>
                )}
              </Droppable>
            </Grid>
          ))}
        </Grid>
      </DragDropContext>
    </Box>
  );
}

export default Todo;
