export type TaskCategory = "design" | "dev" | "research";
export type TaskStatus = "pending" | "in-progress" | "completed";

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  status: TaskStatus;
  deadline: string;
  submittedBy: string;
  submittedAt: string;
  link?: string;
  progress: number;
}
