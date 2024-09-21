const mongoose = require("mongoose");
const TaskModel = require("../models/Task");
const UserModel = require("../models/User");
const { getIO } = require("../socket");

const createTask = async (req, res) => {
    try {

        const { Title , Description, Status, DueDate, Priority, AssignedTo} = req.body;
        const userId = req.user.id;

        //    const existingTask = await TaskModel.findOne({
        //     Task: Title,
        //     AssignedTo: AssignedTo || userId
        // });

        // if (existingTask) {
        //     return res.status(400).json({ error: "A task with this title already exists for the assigned user." });
        // }
        const task = await TaskModel.create({ 
            Task: Title,
            Description: Description, 
            Status: Status,
            DueDate: DueDate,
            Priority: Priority,
            AssignedBy: userId,
            AssignedTo: AssignedTo,
            IsAssignedByAdmin: req.user.role === 'admin',
        });

        //add task in assignedTo user
        const user = await UserModel.findById(AssignedTo || userId);
        user.Tasks.push(task);
        await user.save();
        await task.save();

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

        if(req.user.role === 'admin'){
            const tasks = await TaskModel.find({ AssignedBy: userId });
            console.log(tasks , "tasks");
            return res.status(200).json(tasks);
        }
        
        const tasks = await TaskModel.find({ AssignedTo: userId });
        console.log(tasks , "tasks");
        return res.status(200).json(tasks);
        
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
        const tasks = req.body.data;
        const userId = req.user.id;
        const createdTasks = [];

        console.log(tasks);

        for (let task of tasks) {

            // Validate and parse the ISO string date
            let dueDate = null;
            const now = new Date();
            if (task.DueDate) {
                dueDate = new Date(task.DueDate);
                if (isNaN(dueDate.getTime())) {
                    throw new Error(`Invalid date format for task "${task.Title}". Please use ISO string format.`);
                }
                if (dueDate <= now) {
                    throw new Error(`Task "${task.Title}" has a due date in the past or present. All due dates must be in the future.`);
                }
            }

            // Find user by name if AssignedTo is a string
            let assignedTo = task.AssignedTo;
            if (typeof assignedTo === 'string' && assignedTo.trim() !== '') {
                const user = await UserModel.findOne({ name: assignedTo });
                assignedTo = user ? user._id : null;
            }

            const newTask = await TaskModel.create({
                Task: task.Title,
                Description: task.Description,
                Status: task.Status,
                DueDate: dueDate,
                Priority: task.Priority,
                AssignedBy: userId,
                AssignedTo: userId,
                IsAssignedByAdmin: req.user.role === 'admin'
            });

            createdTasks.push(newTask);
            if (assignedTo) {
                await UserModel.findByIdAndUpdate(assignedTo, { $push: { Tasks: newTask._id } });
            } else {
                await UserModel.findByIdAndUpdate(userId, { $push: { Tasks: newTask._id } });
            }



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