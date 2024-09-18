const { default: mongoose } = require("mongoose");

const User = mongoose.Schema({
    Name: {
        type: String,
        required: true,
    },
    Email: {
        type: String,
        required: true,
    },
    Password: {
        type: String,
        required: true,
    },
    Tasks: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task',
    },
    fcmToken: {
        type: String,
        default: "null",
      },
    Role: { type: String, enum: ['admin', 'user'], default: 'user' }
},{timestamps: true});
const UserModel = mongoose.model("User", User);
module.exports = UserModel; 

