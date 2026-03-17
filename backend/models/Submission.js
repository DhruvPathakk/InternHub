const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: "Task" },
  projectTitle: { type: String, trim: true },
  description: { type: String, trim: true },
  category: {
    type: String,
    enum: ["design", "dev", "research"],
    required: true,
  },
  deadline: { type: Date, required: true },
  internId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  fileUrl: String,
  fileOriginalName: String,
  fileMimeType: String,
  status: {
    type: String,
    enum: ["pending", "completed", "approved", "rejected"],
    default: "pending",
  },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Submission", submissionSchema);