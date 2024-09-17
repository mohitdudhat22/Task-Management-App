const mongoose = require("mongoose");
const TaskModel = require("../models/Task");

// Create a new task
const createTask = async (req, res) => {
    try {
        const { title, description, status } = req.body;
        console.log(req.body, 'req.body');
        const userId = req.user.user.id;
        console.log(userId, 'userId');
        const task = await TaskModel.create({ 
            Task: title,
            Description: description, 
            Status: status,
            UserId: userId,
        });
        console.log(task, 'task');
        res.status(201).json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: error.message });
    }
};

// Get all tasks for the authenticated user
const getTasks = async (req, res) => {
    try {
        const userId = req.user.user.id;
        console.log(userId, 'userId from getTasks');
        const tasks = await TaskModel.find({ UserId: userId });
        console.log(tasks, 'tasks from the get <<<<<<<<<<<<<<<<<<<<<<<<<<<<');
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete a task by ID (soft delete)
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user.id;
        console.log(userId, 'userId from deleteTask');

        const task = await TaskModel.findByIdAndDelete(id);
        console.log(task, 'task from deleteTask');
        if (!task) {
            return res.status(404).json({ error: "Task not found or already deleted" });
        }

        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a task by ID
const editTask = async (req, res) => {  
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;
        const userId = req.user.user.id;
        console.log(userId, 'userId from editTask');

        const task = await TaskModel.findOneAndUpdate(
            { _id: id}, // Ensure field names match the schema
            { 
                Task: title, // Match schema field names
                Description: description,
                Status: status,
                UpdatedAt: new Date() // This should be automatically managed by Mongoose if you use timestamps
            },
            { new: true } // Return the updated document
        );

        if (!task) {
            return res.status(404).json({ error: "Task not found or not authorized" });
        }

        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTask, getTasks, deleteTask, editTask };