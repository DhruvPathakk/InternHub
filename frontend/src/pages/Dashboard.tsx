import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PlusCircle, ClipboardList, CheckCircle2, Clock, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { api } from "@/lib/api";
import { toast } from "sonner";
import type { Submission, SubmissionCategory } from "@/lib/submission";
import { isAxiosError } from "axios";

function getFilenameFromContentDisposition(headerValue: string | undefined) {
  if (!headerValue) return null;
  // Examples:
  // content-disposition: attachment; filename="report.pdf"
  // content-disposition: attachment; filename*=UTF-8''report%20final.pdf
  const filenameStarMatch = /filename\*\s*=\s*UTF-8''([^;]+)/i.exec(headerValue);
  if (filenameStarMatch?.[1]) {
    try {
      return decodeURIComponent(filenameStarMatch[1]);
    } catch {
      return filenameStarMatch[1];
    }
  }
  const filenameMatch = /filename\s*=\s*"?([^"]+)"?/i.exec(headerValue);
  return filenameMatch?.[1] ?? null;
}

const filters: { label: string; value: SubmissionCategory | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Design", value: "design" },
  { label: "Development", value: "dev" },
  { label: "Research", value: "research" },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activeFilter, setActiveFilter] = useState<SubmissionCategory | "all">("all");

  const load = async () => {
    const res = await api.get<Submission[]>("/submissions");
    setSubmissions(res.data);
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoading(true);
      try {
        await load();
      } catch (err: unknown) {
        if (cancelled) return;
        if (isAxiosError(err)) toast.error(err.response?.data?.message ?? "Failed to load dashboard");
        else toast.error("Failed to load dashboard");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredSubmissions = useMemo(() => {
    if (activeFilter === "all") return submissions;
    return submissions.filter((s) => s.category === activeFilter);
  }, [activeFilter, submissions]);

  const pending = useMemo(
    () => filteredSubmissions.filter((s) => s.status !== "completed" && s.status !== "approved"),
    [filteredSubmissions]
  );
  const completed = useMemo(
    () => filteredSubmissions.filter((s) => s.status === "completed" || s.status === "approved"),
    [filteredSubmissions]
  );

  const stats = {
    total: filteredSubmissions.length,
    inProgress: pending.length,
    completed: completed.length,
  };

  const complete = async (id: string) => {
    setWorkingId(id);
    try {
      await api.put(`/submissions/${id}/complete`);
      await load();
      toast.success("Marked as completed");
    } catch (err: unknown) {
      if (isAxiosError(err)) toast.error(err.response?.data?.message ?? "Failed to complete");
      else toast.error("Failed to complete");
    } finally {
      setWorkingId(null);
    }
  };

  const remove = async (id: string) => {
    setWorkingId(id);
    try {
      await api.delete(`/submissions/${id}`);
      await load();
      toast.success("Deleted");
    } catch (err: unknown) {
      if (isAxiosError(err)) toast.error(err.response?.data?.message ?? "Failed to delete");
      else toast.error("Failed to delete");
    } finally {
      setWorkingId(null);
    }
  };

  const download = async (submission: Submission) => {
    setWorkingId(submission._id);
    try {
      const res = await api.get(`/submissions/${submission._id}/download`, {
        responseType: "blob",
      });

      const filename =
        getFilenameFromContentDisposition(res.headers["content-disposition"]) ||
        `${submission.projectTitle ?? "download"}`;

      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      if (isAxiosError(err)) toast.error(err.response?.data?.message ?? "Download failed");
      else toast.error("Download failed");
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground text-sm mt-1">Track and manage intern submissions</p>
        </div>
        <Link to="/submit">
          <Button variant="gradient" className="gap-2">
            <PlusCircle className="h-4 w-4" strokeWidth={2} />
            Submit Project
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: ClipboardList, label: "Total", value: stats.total, color: "bg-secondary" },
          { icon: Clock, label: "Pending", value: stats.inProgress, color: "bg-task-research" },
          { icon: CheckCircle2, label: "Completed", value: stats.completed, color: "bg-task-design" },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <div
            key={label}
            className="flex items-center gap-4 p-4 rounded-xl bg-card border animate-fade-in-up"
            style={{ animationDelay: `${i * 100}ms`, animationFillMode: "both" }}
          >
            <div className={`p-2.5 rounded-lg ${color}`}>
              <Icon className="h-5 w-5 text-primary" strokeWidth={2} />
            </div>
            <div>
              <p className="text-2xl font-display font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6 animate-fade-in overflow-x-auto pb-2">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" strokeWidth={2} />
        {filters.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setActiveFilter(value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
              activeFilter === value
                ? "gradient-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-sky-200/55 dark:bg-sky-950/55 border border-sky-300/60 dark:border-sky-900/60 rounded-xl p-4">
          <h2 className="font-display font-bold text-lg text-sky-950 dark:text-sky-100 mb-3">Pending</h2>
          <div className="space-y-3">
            {pending.map((s) => (
              <div
                key={s._id}
                className="bg-sky-100/60 dark:bg-sky-950/35 border border-sky-200/70 dark:border-sky-900/60 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{s.projectTitle ?? "Untitled"}</p>
                  {s.category ? <Badge variant="secondary">{s.category}</Badge> : null}
                </div>
                {s.description ? <p className="text-sm text-muted-foreground mt-1">{s.description}</p> : null}
                {s.deadline ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    Deadline: {new Date(s.deadline).toLocaleDateString()}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="default"
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                    disabled={workingId === s._id}
                    onClick={() => complete(s._id)}
                  >
                    {workingId === s._id ? "Working..." : "Complete"}
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={workingId === s._id}
                    onClick={() => remove(s._id)}
                  >
                    Delete
                  </Button>
                  <button
                    type="button"
                    className="text-sm underline text-primary self-center disabled:opacity-60"
                    disabled={workingId === s._id}
                    onClick={() => download(s)}
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
            {!loading && pending.length === 0 ? (
              <p className="text-sm text-sky-950/70 dark:text-sky-100/70">No pending items.</p>
            ) : null}
          </div>
        </section>

        <section className="bg-slate-900/10 dark:bg-black/60 border border-slate-300/60 dark:border-slate-800/70 rounded-xl p-4">
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-slate-100 mb-3">Completed</h2>
          <div className="space-y-3">
            {completed.map((s) => (
              <div
                key={s._id}
                className="bg-slate-900/5 dark:bg-black/40 border border-slate-200/70 dark:border-slate-800/70 rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{s.projectTitle ?? "Untitled"}</p>
                  {s.category ? <Badge variant="secondary">{s.category}</Badge> : null}
                </div>
                {s.description ? <p className="text-sm text-muted-foreground mt-1">{s.description}</p> : null}
                {s.deadline ? (
                  <p className="text-xs text-muted-foreground mt-2">
                    Deadline: {new Date(s.deadline).toLocaleDateString()}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="destructive"
                    disabled={workingId === s._id}
                    onClick={() => remove(s._id)}
                  >
                    Delete
                  </Button>
                  <button
                    type="button"
                    className="text-sm underline text-primary self-center disabled:opacity-60"
                    disabled={workingId === s._id}
                    onClick={() => download(s)}
                  >
                    Download
                  </button>
                </div>
              </div>
            ))}
            {!loading && completed.length === 0 ? (
              <p className="text-sm text-slate-900/70 dark:text-slate-100/70">No completed items yet.</p>
            ) : null}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
