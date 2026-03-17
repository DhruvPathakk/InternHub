export type SubmissionStatus = "pending" | "completed" | "approved" | "rejected";
export type SubmissionCategory = "design" | "dev" | "research";

export interface Submission {
  _id: string;
  projectTitle?: string;
  description?: string;
  category?: SubmissionCategory;
  deadline?: string;
  fileUrl?: string;
  status: SubmissionStatus;
  submittedAt?: string;
}

