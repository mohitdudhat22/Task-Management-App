import { useState } from "react";
import { toast } from "react-hot-toast";
import { CSVLink } from "react-csv";
import Papa from 'papaparse';
import axios from "axios";
import { useTodoContext } from "./Context/TodoContext";
import {
  TextField, Button, Select, MenuItem, FormControl, InputLabel,
  Grid, Paper, Box
} from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL;

function Todo() {
  const {
    todos,
    users,
    fetchTasks,
    addTodo,
    updateTodo,
    getAuthHeaders,
    isEditing,
    setIsEditing,
    editId,
    setEditId,
  } = useTodoContext();


  const [todo, setTodo] = useState({
    Title: "",
    Description: "",
    Status: "current",
    DueDate: "",
    Priority: "medium",
    AssignedTo: ""
  });


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
    console.log("Importing CSV");
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

    // if (task.DueDate) {
    //   const [day, month, year] = task.DueDate.split('-').map(Number);
    //   const dueDate = new Date(year, month - 1, day);
    //   const today = new Date();
    //   today.setHours(0, 0, 0, 0);

    //   if (isNaN(dueDate.getTime())) {
    //     errors.push(`Invalid date format for DueDate: ${task.DueDate}. Expected format: DD-MM-YYYY`);
    //   } else if (dueDate < today) {
    //     errors.push(`DueDate cannot be in the past: ${task.DueDate}`);
    //   }
    // }

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
          <Button variant="contained" component="span" onClick={()=>alert("Importing CSV it needs ISO DATE")}>
            Import CSV
          </Button>
        </label>
      </Box>
    </Box>
  );
}

export default Todo;
