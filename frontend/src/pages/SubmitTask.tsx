import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { isAxiosError } from "axios";
import type { SubmissionCategory } from "@/lib/submission";

export default function SubmitTask() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<SubmissionCategory | "">("");
  const [deadline, setDeadline] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Project title is required");
      return;
    }
    if (!file) {
      toast.error("Please attach a file");
      return;
    }
    if (!category) {
      toast.error("Please select a category");
      return;
    }
    if (!deadline) {
      toast.error("Please select a deadline");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append("projectTitle", title.trim());
      if (description.trim()) form.append("description", description.trim());
      form.append("category", category);
      form.append("deadline", new Date(deadline).toISOString());
      form.append("file", file);

      await api.post("/submissions", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSubmitted(true);
      toast.success("Submitted successfully!");
      setTimeout(() => navigate("/dashboard"), 900);
    } catch (err: unknown) {
      if (isAxiosError(err)) toast.error(err.response?.data?.message ?? "Submission failed");
      else toast.error("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-bounce-in">
          <div className="w-20 h-20 gradient-primary rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-primary-foreground" strokeWidth={2} />
          </div>
          <h2 className="font-display font-bold text-2xl mb-2">Project Submitted!</h2>
          <p className="text-muted-foreground">Redirecting to dashboard…</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto animate-fade-in-up">
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl md:text-3xl">Submit a Project</h1>
          <p className="text-muted-foreground text-sm mt-1">Share your work with the team</p>
        </div>

        <Card className="shadow-lg border-border/50">
          <CardHeader>
            <CardTitle className="font-display text-lg">Project Details</CardTitle>
            <CardDescription>Fill in the details about your project</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="title">Project Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Portfolio Website"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what you worked on…"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as SubmissionCategory)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="dev">Development</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deadline">Deadline</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Attachment</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  required
                />
              </div>

              <Button type="submit" variant="gradient" className="w-full gap-2" size="lg" disabled={loading}>
                <Send className="h-4 w-4" strokeWidth={2} />
                {loading ? "Submitting..." : "Submit Project"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
