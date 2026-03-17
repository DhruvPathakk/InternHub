const Submission = require("../models/Submission");
const path = require("path");
const fs = require("fs");

exports.submitTask = async (req, res) => {
  try {
    const { projectTitle, description, category, deadline } = req.body;

    if (!projectTitle)
      return res.status(400).json({ message: "projectTitle is required" });
    if (!category)
      return res.status(400).json({ message: "category is required" });
    if (!deadline)
      return res.status(400).json({ message: "deadline is required" });
    if (!req.file) return res.status(400).json({ message: "file is required" });

    const allowedCategories = new Set(["design", "dev", "research"]);
    if (!allowedCategories.has(category))
      return res.status(400).json({ message: "Invalid category" });

    const deadlineDate = new Date(deadline);
    if (Number.isNaN(deadlineDate.getTime()))
      return res.status(400).json({ message: "Invalid deadline" });

    const submission = await Submission.create({
      projectTitle,
      description,
      category,
      deadline: deadlineDate,
      internId: req.user.id,
      // Store as a public URL path (works cross-platform).
      fileUrl: `/uploads/${req.file.filename}`,
      fileOriginalName: req.file.originalname,
      fileMimeType: req.file.mimetype,
    });

    res.json(submission);
  } catch (err) {
    console.error("Submit task error:", err.message);
    res.status(500).json({ message: "Server error during submission" });
  }
};

exports.downloadSubmissionFile = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findOne({ _id: id, internId: req.user.id });
    if (!submission) return res.status(404).json({ message: "Submission not found" });
    if (!submission.fileUrl) return res.status(404).json({ message: "File not found" });

    const filename = submission.fileUrl.split("/").pop();
    const absolutePath = path.join(__dirname, "..", "uploads", filename);
    if (!fs.existsSync(absolutePath)) return res.status(404).json({ message: "File not found" });

    const downloadName = submission.fileOriginalName || filename;
    return res.download(absolutePath, downloadName);
  } catch (err) {
    console.error("Download file error:", err.message);
    return res.status(500).json({ message: "Server error downloading file" });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const filter = { internId: req.user.id };

    const submissions = await Submission.find(filter)
      .populate("taskId")
      .populate("internId");

    res.json(submissions);
  } catch (err) {
    console.error("Get submissions error:", err.message);
    res.status(500).json({ message: "Server error fetching submissions" });
  }
};

exports.completeSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findOne({ _id: id, internId: req.user.id });
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    submission.status = "completed";
    await submission.save();

    res.json(submission);
  } catch (err) {
    console.error("Complete submission error:", err.message);
    res.status(500).json({ message: "Server error completing submission" });
  }
};

exports.deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await Submission.findOneAndDelete({ _id: id, internId: req.user.id });
    if (!submission) return res.status(404).json({ message: "Submission not found" });

    // Best-effort: delete uploaded file from disk.
    try {
      if (submission.fileUrl) {
        const filename = submission.fileUrl.split("/").pop();
        const absolutePath = path.join(__dirname, "..", "uploads", filename);
        if (fs.existsSync(absolutePath)) fs.unlinkSync(absolutePath);
      }
    } catch (e) {
      console.warn("Could not delete uploaded file:", e?.message ?? e);
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete submission error:", err.message);
    res.status(500).json({ message: "Server error deleting submission" });
  }
};