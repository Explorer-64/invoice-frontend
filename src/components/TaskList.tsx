import React, { useState, useEffect } from "react";
import { Check, Trash2, Plus, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import brain from "brain";
import { Translate } from "components/Translate";
import { useLanguage } from "utils/translationContext";
import { TaskResponse, UpdateTaskRequest } from "types";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function TaskList({ className }: Props) {
  const { translate } = useLanguage();
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [placeholder, setPlaceholder] = useState("Add a new task...");

  useEffect(() => {
    translate("Add a new task...").then(setPlaceholder);
  }, [translate]);

  const fetchTasks = async () => {
    try {
      // Fetch only pending tasks
      const response = await brain.list_tasks({ status: "pending", limit: 50 });
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Failed to fetch tasks", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleComplete = async (task: TaskResponse) => {
    // Optimistic update
    setTasks(prev => prev.filter(t => t.id !== task.id));
    
    try {
      await brain.update_task(
        { taskId: task.id }, 
        { status: "completed" }
      );
      toast.success("Task completed");
    } catch (error) {
      // Revert on error
      setTasks(prev => [...prev, task].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      toast.error("Failed to complete task");
    }
  };

  const handleDelete = async (taskId: number) => {
    // Optimistic update
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    setTasks(prev => prev.filter(t => t.id !== taskId));
    
    try {
      await brain.delete_task({ taskId });
      toast.success("Task deleted");
    } catch (error) {
      // Revert on error
      setTasks(prev => [...prev, taskToDelete].sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
      toast.error("Failed to delete task");
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setIsAdding(true);
    try {
      const response = await brain.create_task({
        title: newTaskTitle,
        type: "manual"
      });
      const newTask = await response.json();
      setTasks(prev => [newTask, ...prev]);
      setNewTaskTitle("");
      toast.success("Task added");
    } catch (error) {
      toast.error("Failed to create task");
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        <h2 className="text-sm font-medium text-foreground"><Translate>To-Do List</Translate></h2>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
            <Skeleton className="w-5 h-5 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("mb-6", className)}>
      <h2 className="text-sm font-medium text-foreground mb-3 flex items-center justify-between">
        <span><Translate>To-Do List</Translate></span>
        <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {tasks.length}
        </span>
      </h2>

      {/* Add Task Input */}
      <form onSubmit={handleAddTask} className="mb-3 flex gap-2">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder={placeholder}
          className="flex-1 bg-card border border-border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
        <button
          type="submit"
          disabled={!newTaskTitle.trim() || isAdding}
          className="bg-primary text-primary-foreground rounded-xl px-3 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Plus className="w-5 h-5" />
        </button>
      </form>

      {/* Task List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground bg-card/50 border border-border/50 border-dashed rounded-xl">
            <p className="text-sm"><Translate>No pending tasks</Translate></p>
          </div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              className="group flex items-start gap-3 p-3 bg-card border border-border hover:border-primary/20 rounded-xl transition-all"
            >
              <button
                onClick={() => handleComplete(task)}
                className="mt-0.5 w-5 h-5 rounded-full border-2 border-muted-foreground/30 hover:border-primary hover:bg-primary/10 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <Check className="w-3 h-3 text-transparent group-hover:text-primary transition-colors" />
              </button>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground leading-snug break-words">
                  {task.title}
                </p>
                {task.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                    {task.description}
                  </p>
                )}
                {task.due_date && (
                   <div className="flex items-center gap-1 mt-1.5 text-xs text-orange-600 dark:text-orange-500">
                       <Calendar className="w-3 h-3" />
                       <span>
                           {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                       </span>
                   </div>
                )}
                 {task.type === 'auto' && (
                   <div className="flex items-center gap-1 mt-1.5 text-xs text-blue-600 dark:text-blue-400">
                       <AlertCircle className="w-3 h-3" />
                       <span><Translate>Suggestion</Translate></span>
                   </div>
                )}
              </div>

              <button
                onClick={() => handleDelete(task.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
