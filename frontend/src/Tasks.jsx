
import { useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useTodoContext } from "./Context/TodoContext";
import {
  Grid, Paper, Typography, IconButton, Box, Button,
  Chip
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, PlayArrow as StartIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import toast from 'react-hot-toast';
import {
    TextField, Select, MenuItem, FormControl, InputLabel
  } from '@mui/material';

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
    handleEdit,
    assignTask,
    onDragEnd,
    setFilters,
    setSortBy,
    savedFilters,
    setSavedFilters,
    filterName,
    setFilterName,
    
  } = useTodoContext();


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




  return (

    <DragDropContext onDragEnd={onDragEnd}>
        
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
  );
}

export default Tasks;