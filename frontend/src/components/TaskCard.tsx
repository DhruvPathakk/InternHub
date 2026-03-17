import { Palette, Code, Search, Calendar, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Task, TaskCategory, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const categoryConfig: Record<TaskCategory, { icon: typeof Palette; label: string; variant: "design" | "dev" | "research" }> = {
  design: { icon: Palette, label: "Design", variant: "design" },
  dev: { icon: Code, label: "Development", variant: "dev" },
  research: { icon: Search, label: "Research", variant: "research" },
};

const statusLabels: Record<TaskStatus, string> = {
  pending: "Pending",
  "in-progress": "In Progress",
  completed: "Completed",
};

export default function TaskCard({ task, index = 0 }: { task: Task; index?: number }) {
  const cat = categoryConfig[task.category];
  const CatIcon = cat.icon;

  return (
    <Card
      className={cn(
        "group hover:scale-[1.02] hover:shadow-md transition-all duration-200 animate-fade-in-up",
      )}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
    >
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <h3 className="font-display font-semibold text-sm leading-tight truncate pr-2">{task.title}</h3>
          <p className="text-xs text-muted-foreground">by {task.submittedBy}</p>
        </div>
        <Badge variant={cat.variant} className="shrink-0 gap-1">
          <CatIcon className="h-3 w-3" strokeWidth={2} />
          {cat.label}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>

        <div className="flex items-center justify-between text-xs">
          <span className={cn(
            "font-medium",
            task.status === "completed" && "text-primary",
            task.status === "in-progress" && "text-task-research-text",
            task.status === "pending" && "text-muted-foreground",
          )}>
            {statusLabels[task.status]}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-3 w-3" strokeWidth={2} />
            {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        </div>

        <Progress value={task.progress} className="h-1.5" />

        {task.link && (
          <a
            href={task.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" strokeWidth={2} />
            View Link
          </a>
        )}
      </CardContent>
    </Card>
  );
}
