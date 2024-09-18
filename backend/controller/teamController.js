const TaskModel = require('../models/Task');
const UserModel = require('../models/User');


// Create Task (Admin or User)
const createTask = async (req, res) => {
    console.log("its create body" , req.body)
    try {
        const { Task, Description, UserId, Role } = req.body;
        const user = await UserModel.findById(UserId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Admin can assign task to any user, normal users can only assign to themselves
        const task = new TaskModel({
            Task,
            Description,
            AssignedBy: Role === 'admin' ? UserId : req.body.UserId,  // Admin can assign tasks to any user
            AssignedTo: UserId,
            IsAssignedByAdmin: Role === 'admin' ? true : false 
        });

        await task.save();
        res.status(201).json({ message: 'Task created successfully', task });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all tasks (Admin can see all, user only their own)
const getAllTasks = async (req, res) => {
    try {
        const { UserId, Role } = req.body;
        let tasks;

        if (Role === 'admin') {
            tasks = await TaskModel.find().populate('UserId', 'Name Email');
        } else {
            tasks = await TaskModel.find({ UserId });
        }

        res.status(200).json({ tasks });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Task (Admin can update any task, user can update their own)
const updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { Task, Description, Status, UserId, Role } = req.body;
        const task = await TaskModel.findById(taskId);

        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Admin can update any task, users can only update their own tasks
        if (Role !== 'admin' && task.UserId.toString() !== UserId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        task.Task = Task || task.Task;
        task.Description = Description || task.Description;
        task.Status = Status || task.Status;

        await task.save();
        res.status(200).json({ message: 'Task updated successfully', task });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete Task (Admin can delete any task, user can delete their own)
const deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { UserId, Role } = req.body;
        const task = await TaskModel.findById(taskId);

        if (!task) return res.status(404).json({ message: 'Task not found' });

        // Admin can delete any task, users can only delete their own tasks
        if (Role !== 'admin' && task.toString() !== UserId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await task.delete();
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createTask, getAllTasks, updateTask, deleteTask };
