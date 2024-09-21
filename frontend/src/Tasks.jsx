import { useMemo } from 'react';
import { useTodoContext } from "./Context/TodoContext";
import {
  Grid, Paper, Typography, IconButton, Box, Button,
  Chip, TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, PlayArrow as StartIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

function Tasks() {
  const theme = useTheme();
  const {
    todos,
    filters,
    sortBy,
    users,
    isAdmin,
    deleteTodo,
    changeStatus,
    assignTask,
    setFilters,
    setSortBy,
    savedFilters,
    setSavedFilters,
    filterName,
    setFilterName,
    setTodo,
    setIsEditing,
    setEditId
  } = useTodoContext();
  const navigate = useNavigate();

  const saveCurrentFilter = () => {
    if (filterName.trim() === "") {
      toast.error("Please enter a name for the filter");
      return;
    }
    setSavedFilters([...savedFilters, { name: filterName, filters: { ...filters }, sortBy }]);
    // Reset all form fields
    setFilterName("");
    setFilters({
      Status: "",
      Priority: "",
      DueDate: "",
      AssignedTo: ""
    });
    setSortBy("DueDate"); // Or whatever your default sort is
    toast.success("Filter saved successfully!");
  };

  const loadSavedFilter = (savedFilter) => {
    setFilters(savedFilter.filters);
    toast.success(`Filter "${savedFilter.name}" applied`);
  };

  const filteredAndSortedTasks = useMemo(() => {
    let filteredTasks = Object.values(todos).flat();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filteredTasks = filteredTasks.filter(task => {
          switch (key) {
            case 'Status':
              return task.Status.toLowerCase() === value.toLowerCase();
            case 'Priority':
              return task.Priority.toLowerCase() === value.toLowerCase();
            case 'DueDate':
              if (!task.DueDate) return false;
              const taskDate = new Date(task.DueDate);
              const filterDate = new Date(value);
              return taskDate.toDateString() === filterDate.toDateString();
            case 'AssignedTo':
              return task.AssignedTo === value;
            default:
              return true;
          }
        });
      }
    });

    filteredTasks.sort((a, b) => {
      switch (sortBy) {
        case 'DueDate':
          return new Date(a.DueDate || '9999-12-31') - new Date(b.DueDate || '9999-12-31');
        case 'Priority':
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.Priority.toLowerCase()] - priorityOrder[a.Priority.toLowerCase()];
        case 'Status':
          return a.Status.localeCompare(b.Status);
        default:
          return 0;
      }
    });

    return filteredTasks;
  }, [todos, filters, sortBy]);

  const handleEditTask = (task) => {
    setTodo(task);
    setIsEditing(true);
    setEditId(task._id);
    navigate('/dashboard/todo');
  };

  return (
    <>
      <Paper elevation={2} sx={{ padding: 2, marginBottom: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.Status || ""}
                onChange={(e) => setFilters({...filters, Status: e.target.value})}
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
                value={filters.Priority || ""}
                onChange={(e) => setFilters({...filters, Priority: e.target.value})}
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
              value={filters.DueDate || ""}
              onChange={(e) => setFilters({...filters, DueDate: e.target.value})}
              label="Due Date"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Assigned To</InputLabel>
              <Select
                value={filters.AssignedTo || ""}
                onChange={(e) => setFilters({...filters, AssignedTo: e.target.value})}
                label="Assigned To"
              >
                <MenuItem value="">All Users</MenuItem>
                {users?.map(user => (
                  <MenuItem key={user._id} value={user._id}>{user.Name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
              >
                <MenuItem value="DueDate">Due Date</MenuItem>
                <MenuItem value="Priority">Priority</MenuItem>
                <MenuItem value="Status">Status</MenuItem>
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
      <Grid container spacing={3}>
        {['current', 'pending', 'completed'].map((status) => (
          <Grid item xs={12} md={4} key={status}>
            <Paper
              elevation={3}
              sx={{ padding: 2, height: '100%' }}
            >
              <Typography variant="h6" gutterBottom>{status.charAt(0).toUpperCase() + status.slice(1)}</Typography>
              {filteredAndSortedTasks.filter(todo => todo.Status === status).map((todo) => (
                <Paper
                  key={todo._id}
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
                          <IconButton onClick={() => handleEditTask(todo)} size="small">
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
              ))}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  );
}

export default Tasks;