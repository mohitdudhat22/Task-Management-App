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
    UserId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
},{timestamps: true});
const TaskModel = mongoose.model("Task", Task);
module.exports = TaskModel;

