const express = require('express');
const router = express.Router();
const { createTask, getTasks, deleteTask, editTask } = require('../controller/taskController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/create', authMiddleware, createTask);
router.get('/get', authMiddleware, getTasks);
router.delete('/delete/:id', authMiddleware, deleteTask);
router.put('/edit/:id', authMiddleware, editTask);

module.exports = router;
