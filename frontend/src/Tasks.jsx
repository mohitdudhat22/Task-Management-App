import { useMemo } from 'react';
import { useTodoContext } from "./Context/TodoContext";
import {
  Grid, Typography, IconButton, Box, Button,
  Chip, TextField, Select, MenuItem, FormControl, InputLabel,
  Card, CardContent, CardActions, Divider
} from '@mui/material';
import { 
  Delete as DeleteIcon, 
  Edit as EditIcon, 
  PlayArrow as StartIcon, 
  FilterAlt as FilterIcon,
  Assignment as TaskIcon,
  PriorityHigh as PriorityIcon,
  Person as PersonIcon
} from '@mui/icons-material';
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
    let filteredTasks = [...todos.current, ...todos.pending, ...todos.completed];
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
              {
                let taskDate = new Date(task.DueDate);
                let filterDate = new Date(value);
                return taskDate.toDateString() === filterDate.toDateString();
              }
            case 'AssignedTo':
              return task.AssignedTo === value;
            default:
              return true;
          }
        });
      }
    });

    filteredTasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      switch (sortBy) {
        case 'DueDate':
          return new Date(a.DueDate || '9999-12-31') - new Date(b.DueDate || '9999-12-31');
        case 'Priority':
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
    <Box sx={{ padding: 3, backgroundColor: theme.palette.background.default }}>
      <Card 
        elevation={3} 
        sx={{ 
          marginBottom: 4, 
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <CardContent sx={{ color: theme.palette.text.primary }}>
          <Typography variant="h5" gutterBottom sx={{ 
            display: 'flex', 
            alignItems: 'center',
            color: theme.palette.primary.main,
            fontWeight: 'bold'
          }}>
            <FilterIcon sx={{ marginRight: 1 }} /> Task Filters
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: theme.palette.text.primary }}>Status</InputLabel>
                <Select
                  value={filters.Status || ""}
                  onChange={(e) => setFilters({...filters, Status: e.target.value})}
                  label="Status"
                  sx={{
                    color: theme.palette.text.primary,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.divider,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.action.hover,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
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
                <InputLabel sx={{ color: theme.palette.text.primary }}>Priority</InputLabel>
                <Select
                  value={filters.Priority || ""}
                  onChange={(e) => setFilters({...filters, Priority: e.target.value})}
                  label="Priority"
                  sx={{
                    color: theme.palette.text.primary,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.divider,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.action.hover,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
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
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: theme.palette.divider,
                    },
                    '&:hover fieldset': {
                      borderColor: theme.palette.action.hover,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: theme.palette.text.primary,
                  },
                  '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel sx={{ color: theme.palette.text.primary }}>Assigned To</InputLabel>
                <Select
                  value={filters.AssignedTo || ""}
                  onChange={(e) => setFilters({...filters, AssignedTo: e.target.value})}
                  label="Assigned To"
                  sx={{
                    color: theme.palette.text.primary,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.divider,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.action.hover,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
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
                <InputLabel sx={{ color: theme.palette.text.primary }}>Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                  sx={{
                    color: theme.palette.text.primary,
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.divider,
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.action.hover,
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  <MenuItem value="DueDate">Due Date</MenuItem>
                  <MenuItem value="Priority">Priority</MenuItem>
                  <MenuItem value="Status">Status</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
        <Divider sx={{ backgroundColor: theme.palette.divider }} />
        <CardActions sx={{ 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          padding: 2, 
          backgroundColor: theme.palette.background.paper 
        }}>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flex: 1 }}>
            <TextField
              size="small"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              label="Filter Name"
              sx={{ 
                minWidth: 200,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: theme.palette.divider,
                  },
                  '&:hover fieldset': {
                    borderColor: theme.palette.action.hover,
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: theme.palette.primary.main,
                  },
                },
                '& .MuiInputLabel-root': {
                  color: theme.palette.text.primary,
                },
                '& .MuiInputBase-input': {
                  color: theme.palette.text.primary,
                },
              }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={saveCurrentFilter}
              startIcon={<FilterIcon />}
              sx={{ borderRadius: 2 }}
            >
              Save Filter
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', marginTop: { xs: 2, sm: 0 } }}>
            {savedFilters.map((filter, index) => (
              <Chip
                key={index}
                label={filter.name}
                onClick={() => loadSavedFilter(filter)}
                color="primary"
                sx={{ borderRadius: 4 }}
              />
            ))}
          </Box>
        </CardActions>
      </Card>
      
      <Grid container spacing={3}>
        {['current', 'pending', 'completed'].map((status) => (
          <Grid item xs={12} md={4} key={status}>
            <Card elevation={3} sx={{ 
              height: '100%', 
              borderRadius: 4, 
              backgroundColor: theme.palette.background.paper,
              transition: 'box-shadow 0.3s',
              '&:hover': {
                boxShadow: theme.shadows[10],
              },
            }}>
              <CardContent sx={{ 
                backgroundColor: theme.palette.primary.main, 
                color: theme.palette.primary.contrastText,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
              }}>
                <Typography variant="h6" gutterBottom sx={{ 
                  textTransform: 'capitalize', 
                  display: 'flex', 
                  alignItems: 'center',
                  fontWeight: 'bold'
                }}>
                  <TaskIcon sx={{ marginRight: 1 }} /> {status} Tasks
                </Typography>
              </CardContent>
              <CardContent sx={{ 
                maxHeight: 'calc(100vh - 300px)', 
                overflowY: 'auto', 
                '&::-webkit-scrollbar': { display: 'none' }, 
                scrollbarWidth: 'none',
                padding: 2,
              }}>
                {filteredAndSortedTasks.filter(todo => todo.Status === status).map((todo) => (
                  <Card
                    key={todo._id}
                    variant="outlined"
                    sx={{
                      marginBottom: 2,
                      borderRadius: 2,
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: theme.shadows[5],
                        backgroundColor: theme.palette.action.hover,
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <CardContent>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>{todo.Task}</Typography>
                      <Typography variant="body2" sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        color: theme.palette.text.secondary,
                        marginBottom: 0.5,
                      }}>
                        <PriorityIcon sx={{ marginRight: 1, fontSize: 'small', color: theme.palette.secondary.main }} />
                        Priority: {todo.Priority || 'Not set'}
                      </Typography>
                      <Typography variant="body2" sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        color: theme.palette.text.secondary
                      }}>
                        <PersonIcon sx={{ marginRight: 1, fontSize: 'small', color: theme.palette.info.main }} />
                        Assigned to: {users?.find(user => user._id === todo.AssignedTo)?.Name || 'Not assigned'}
                      </Typography>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      {status === 'current' && (
                        <>
                          <IconButton onClick={() => changeStatus(todo._id, 'current', 'pending')} size="small" title="Start Task" sx={{ color: theme.palette.success.main }}>
                            <StartIcon />
                          </IconButton>
                          <IconButton onClick={() => handleEditTask(todo)} size="small" title="Edit Task" sx={{ color: theme.palette.warning.main }}>
                            <EditIcon />
                          </IconButton>
                        </>
                      )}
                      <IconButton onClick={() => deleteTodo(todo._id, status)} size="small" title="Delete Task" sx={{ color: theme.palette.error.main }}>
                        <DeleteIcon />
                      </IconButton>
                      {isAdmin && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => assignTask(todo._id)}
                          sx={{ 
                            borderRadius: 2,
                            color: theme.palette.primary.main,
                            borderColor: theme.palette.primary.main,
                            '&:hover': {
                              backgroundColor: theme.palette.primary.main,
                              color: theme.palette.primary.contrastText,
                            }
                          }}
                        >
                          Assign Task
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

export default Tasks;