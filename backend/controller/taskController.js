const mongoose = require("mongoose");
const TaskModel = require("../models/Task");
const UserModel = require("../models/User");
const { getIO } = require("../socket");

const createTask = async (req, res) => {
    try {
        const { title, description, status, dueDate, priority, assignedTo, isAssignedByAdmin ,AssignedBy} = req.body;
        const userId = req.user.id;
        const task = await TaskModel.create({ 


            Task: title,
            Description: description, 
            Status: status,
            DueDate: dueDate,
            Priority: priority,
            AssignedBy: AssignedBy,
            AssignedTo: assignedTo,
            IsAssignedByAdmin: isAssignedByAdmin,
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
        const userId = req.user.id;
        const tasks = await TaskModel.find({ AssignedBy: userId });
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

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
        const { title, description, status, dueDate, priority, assignedTo } = req.body;
        const userId = req.user.id;

        const task = await TaskModel.findOneAndUpdate(
            { _id: id},
            { 
                Task: title,
                Description: description,
                Status: status,
                UpdatedAt: new Date(),
                DueDate: dueDate,
                Priority: priority,
                AssignedTo: assignedTo,
                AssignedBy: userId,
                IsAssignedByAdmin: isAssignedByAdmin,
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

const bulkCreateTasks = async (req, res) => {
    try {
        const tasks = req.body;
        const userId = req.user.id;
        const createdTasks = [];

        for (let task of tasks) {
            const newTask = await TaskModel.create({
                Task: task.Title,
                Description: task.Description,
                Status: task.Status,
                DueDate: task.DueDate,
                Priority: task.Priority,
                AssignedBy: userId,
                AssignedTo: task.AssignedTo,
                IsAssignedByAdmin: req.user.role === 'admin'
            });
            createdTasks.push(newTask);
            getIO().emit('new-task', newTask);
        }

        res.status(201).json(createdTasks);
    } catch (error) {
        console.error('Error bulk creating tasks:', error);
        res.status(500).json({ error: error.message });
    }
};

const assignTask = async (req, res) => {
    try {
        const { taskId, userId } = req.body;
        const adminId = req.user.id;

        if (req.user.role !== 'admin') {
            return res.status(403).json({ error: "Only admins can assign tasks" });
        }

        const user = await UserModel.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const task = await TaskModel.findByIdAndUpdate(
            taskId,
            { 
                AssignedTo: userId,
                AssignedBy: adminId,
                IsAssignedByAdmin: true
            },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        getIO().emit('task-updated', task);
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTask, getTasks, deleteTask, editTask, bulkCreateTasks, assignTask };