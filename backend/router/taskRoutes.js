const express = require('express');
const router = express.Router();
const { createTask, getTasks, deleteTask, editTask, bulkCreateTasks, assignTask } = require('../controller/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const { getAllUsers } = require('../controller/teamController');


router.post('/create', authMiddleware, createTask);
router.get('/get', authMiddleware, getTasks);
router.delete('/delete/:id', authMiddleware, deleteTask);
router.put('/edit/:id', authMiddleware, editTask);
router.get('/getAllUsers', authMiddleware, getAllUsers);
router.post('/bulk-create', authMiddleware, bulkCreateTasks);
router.post('/assign-task', authMiddleware, assignTask);
module.exports = router;
