const express = require('express');
const { createTask, getAllTasks, updateTask, deleteTask } = require('../controller/teamController');

const router = express.Router();

router.post('/tasks', createTask);           // Create task (Admin or User)
router.get('/tasks', getAllTasks);           // Get all tasks (Admin sees all, user sees own)
router.put('/tasks/:taskId', updateTask);    // Update task (Admin or user’s own task)
router.delete('/tasks/:taskId', deleteTask); // Delete task (Admin or user’s own task)

module.exports = router;
