const { default: mongoose } = require("mongoose");
const Task = mongoose.Schema({
    Task: {
        type: String,
        required: true,
    },
    Description: {
        type: String,
        default: null,
    },
    Status: {
        type: String,
        default: 'current',
        enum: ['current','pending', 'completed'],
    },
    Priority: {
        type: String,
        default: 'low',
        enum: ['low', 'medium', 'high'],
    },
    DueDate: {
        type: Date,
        default: null,
    },
    AssignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    AssignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',  // The admin or user who created/assigned the task
        required: false
    },
    IsAssignedByAdmin: {
        type: Boolean,
        default: false , // True if assigned by admin, false if by user
        required : false
    }
},{timestamps: true});
const TaskModel = mongoose.model("Task", Task);
module.exports = TaskModel;

