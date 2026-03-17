const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: String,
  description: String,
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deadline: Date,
});

module.exports = mongoose.model("Task", taskSchema);