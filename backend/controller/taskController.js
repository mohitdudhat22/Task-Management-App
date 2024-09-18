const mongoose = require("mongoose");
const TaskModel = require("../models/Task");
const { getIO } = require("../socket");

const createTask = async (req, res) => {
    try {
        const { title, description, status } = req.body;
        const userId = req.user.user.id;
        const task = await TaskModel.create({ 
            Task: title,
            Description: description, 
            Status: status,
            AssignedBy: userId,
        });
        task.save();
        getIO().emit('new-task', task);       
         res.status(201).json(task);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: error.message });
    }
};

const getTasks = async (req, res) => {
    try {
        const userId = req.user.user.id;
        const tasks = await TaskModel.find({ AssignedBy: userId });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.user.id;

        const task = await TaskModel.findByIdAndDelete(id);
        if (!task) {
            return res.status(404).json({ error: "Task not found or already deleted" });
        }

        getIO().emit('delete-task', { id: task._id, status: task.Status });
        res.status(200).json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const editTask = async (req, res) => {  
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;
        const userId = req.user.user.id;

        const task = await TaskModel.findOneAndUpdate(
            { _id: id},
            { 
                Task: title,
                Description: description,
                Status: status,
                UpdatedAt: new Date()
            },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ error: "Task not found or not authorized" });
        }
        getIO().emit('task-updated', task);
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTask, getTasks, deleteTask, editTask };