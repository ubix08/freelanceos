import { useState, useEffect } from "react";
import { Card, Button, Input } from "../components/ui";
import { initAuth, googleSignIn, getAccessToken, logout } from "../lib/auth";
import type { User } from "firebase/auth";
import { CheckCircle, Circle, Trash2, LogOut, Plus, Calendar, Repeat } from "lucide-react";

export function TasksPage() {
  const [needsAuth, setNeedsAuth] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [taskLists, setTaskLists] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [activeListId, setActiveListId] = useState<string | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");
  const [recurrence, setRecurrence] = useState("none");

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setNeedsAuth(false);
        setUser(user);
        setToken(token);
        fetchTaskLists(token);
      },
      () => setNeedsAuth(true)
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setToken(result.accessToken);
        setUser(result.user);
        setNeedsAuth(false);
        fetchTaskLists(result.accessToken);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setToken(null);
    setUser(null);
    setNeedsAuth(true);
    setTaskLists([]);
    setTasks([]);
  };

  const fetchTaskLists = async (accessToken: string) => {
    try {
      const res = await fetch("https://tasks.googleapis.com/tasks/v1/users/@me/lists", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        setTaskLists(data.items);
        setActiveListId(data.items[0].id);
        fetchTasks(data.items[0].id, accessToken);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async (listId: string, accessToken: string) => {
    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const data = await res.json();
      setTasks(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim() || !activeListId) return;
    const currentToken = await getAccessToken();
    if (!currentToken) return;

    let notes = "";
    if (recurrence !== "none") {
      notes = `Recurrence: ${recurrence}`;
    }

    const body: any = { title: newTaskTitle };
    if (newTaskDate) {
      body.due = new Date(newTaskDate).toISOString();
    }
    if (notes) {
      body.notes = notes;
    }

    try {
      const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${activeListId}/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${currentToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setNewTaskTitle("");
        setNewTaskDate("");
        setRecurrence("none");
        fetchTasks(activeListId, currentToken);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (task: any) => {
    const currentToken = await getAccessToken();
    if (!currentToken || !activeListId) return;

    const newStatus = task.status === "completed" ? "needsAction" : "completed";
    try {
      await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${activeListId}/tasks/${task.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${currentToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...task, status: newStatus }),
      });
      
      if (newStatus === "completed" && task.notes && task.notes.includes("Recurrence: ") && task.due) {
         const recurrenceRule = task.notes.split("Recurrence: ")[1].trim();
         const oldDue = new Date(task.due);
         const nextDue = new Date(oldDue);
         if (recurrenceRule === "daily") {
             nextDue.setDate(nextDue.getDate() + 1);
         } else if (recurrenceRule === "weekly") {
             nextDue.setDate(nextDue.getDate() + 7);
         } else if (recurrenceRule === "monthly") {
             nextDue.setMonth(nextDue.getMonth() + 1);
         }
         
         await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${activeListId}/tasks`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${currentToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              title: task.title,
              notes: task.notes,
              due: nextDue.toISOString()
            }),
         });
      }

      fetchTasks(activeListId, currentToken);
    } catch (err) {
      console.error(err);
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this task?");
    if (!confirmed) return;
    
    const currentToken = await getAccessToken();
    if (!currentToken || !activeListId) return;
    
    try {
      await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${activeListId}/tasks/${taskId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      fetchTasks(activeListId, currentToken);
    } catch (err) {
      console.error(err);
    }
  };

  if (needsAuth) {
    return (
      <div className="max-w-xl mx-auto flex flex-col items-center justify-center min-h-[500px] space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Connect Google Tasks</h2>
          <p className="text-text-secondary">Sign in with your Google account to view and manage your to-do lists directly from FreelancerOS.</p>
        </div>
        <button className="gsi-material-button" onClick={handleLogin} disabled={isLoggingIn}>
          <div className="gsi-material-button-state"></div>
          <div className="gsi-material-button-content-wrapper flex items-center justify-center px-4 py-2 bg-white rounded shadow-sm border border-border-muted hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="gsi-material-button-icon mr-3">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={{display: 'block', width: '20px', height: '20px'}}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
            <span className="gsi-material-button-contents font-medium text-gray-700">Sign in with Google</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-text-secondary mt-1">Manage your Google Tasks.</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="text-sm">
           <LogOut className="w-4 h-4 mr-2" /> Disconnect
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        <div className="col-span-1 space-y-2 text-sm bg-bg-surface p-2 rounded-lg border border-border-subtle">
           {taskLists.map(list => (
              <div 
                 key={list.id} 
                 className={`px-3 py-2 rounded-md cursor-pointer transition-colors ${activeListId === list.id ? "bg-bg-elevated font-medium text-text-primary" : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary"}`}
                 onClick={() => {
                    setActiveListId(list.id);
                    if (token) fetchTasks(list.id, token);
                 }}
              >
                 {list.title}
              </div>
           ))}
           {taskLists.length === 0 && <div className="text-center p-4 text-text-muted">No lists found.</div>}
        </div>

        <Card className="col-span-3 p-6 flex flex-col min-h-[500px]">
           <div className="flex flex-col gap-4 flex-1">
              <div className="flex flex-col gap-3 mb-2 bg-bg-base p-4 rounded-lg border border-border-subtle shadow-sm">
                 <Input
                    placeholder="Add a new task..."
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleCreateTask()}
                    className="border-none bg-transparent shadow-none px-0 text-sm focus-visible:ring-0"
                 />
                 <div className="flex gap-2 items-center text-sm pt-2 border-t border-border-subtle border-dashed">
                    <Input type="date" value={newTaskDate} onChange={e => setNewTaskDate(e.target.value)} className="w-[140px] text-xs h-8" />
                    <select value={recurrence} onChange={e => setRecurrence(e.target.value)} className="h-8 rounded-md border border-border-muted bg-bg-base px-2 text-xs flex-1 text-text-secondary outline-none">
                       <option value="none">Does not repeat</option>
                       <option value="daily">Daily</option>
                       <option value="weekly">Weekly</option>
                       <option value="monthly">Monthly</option>
                    </select>
                    <Button onClick={handleCreateTask} className="px-3 h-8 text-xs font-semibold"><Plus className="w-3 h-3 mr-1" /> Add Task</Button>
                 </div>
              </div>

              <div className="space-y-1">
                 {tasks.length === 0 && (
                    <div className="text-center text-text-muted py-8">All caught up!</div>
                 )}
                 {tasks.filter(t => t.status !== "completed").map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 hover:bg-bg-surface rounded-md group transition-colors">
                       <button onClick={() => handleToggleTask(task)} className="text-text-muted hover:text-brand transition-colors shrink-0">
                          <Circle className="w-5 h-5" />
                       </button>
                       <div className="flex-1 flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">{task.title}</span>
                          {(task.due || (task.notes && task.notes.includes("Recurrence:"))) && (
                             <div className="flex items-center gap-3 mt-1 text-[11px] text-text-muted font-medium">
                                {task.due && (
                                   <span className="flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      {new Date(task.due).toLocaleDateString()}
                                   </span>
                                )}
                                {task.notes && task.notes.includes("Recurrence:") && (
                                   <span className="flex items-center gap-1 text-brand/80">
                                      <Repeat className="w-3 h-3" />
                                      {task.notes.split("Recurrence: ")[1].trim()}
                                   </span>
                                )}
                             </div>
                          )}
                       </div>
                       <button onClick={() => handleDeleteTask(task.id)} className="text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <Trash2 className="w-4 h-4" />
                       </button>
                    </div>
                 ))}
                 
                 {tasks.filter(t => t.status === "completed").length > 0 && (
                    <div className="pt-6 mt-6 border-t border-border-subtle">
                       <h4 className="text-xs font-bold uppercase tracking-wider text-text-muted mb-3 px-2">Completed</h4>
                       {tasks.filter(t => t.status === "completed").map(task => (
                          <div key={task.id} className="flex items-center gap-3 p-3 hover:bg-bg-surface rounded-md group transition-colors opacity-60 hover:opacity-100">
                             <button onClick={() => handleToggleTask(task)} className="text-brand transition-colors">
                                <CheckCircle className="w-5 h-5" />
                             </button>
                             <span className="flex-1 text-sm line-through">{task.title}</span>
                             <button onClick={() => handleDeleteTask(task.id)} className="text-text-muted hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-4 h-4" />
                             </button>
                          </div>
                       ))}
                    </div>
                 )}
              </div>
           </div>
        </Card>
      </div>

    </div>
  );
}
