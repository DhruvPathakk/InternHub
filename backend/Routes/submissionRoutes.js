const router = require("express").Router();
const {
  submitTask,
  getSubmissions,
  downloadSubmissionFile,
  completeSubmission,
  deleteSubmission,
} = require("../controllers/submissionController");

const { auth } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    const safeExt = ext && ext.length <= 10 ? ext : "";
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${safeExt}`);
  },
});

const upload = multer({ storage });

router.post("/", auth, upload.single("file"), submitTask);
router.get("/", auth, getSubmissions);
router.get("/:id/download", auth, downloadSubmissionFile);
router.put("/:id/complete", auth, completeSubmission);
router.delete("/:id", auth, deleteSubmission);

module.exports = router;