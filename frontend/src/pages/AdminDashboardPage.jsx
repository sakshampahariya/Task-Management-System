import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Plus, Loader, X, Lock, Unlock, AlertCircle, ChevronRight } from "lucide-react";
import api from "../api";
import TaskStatusBadge from "../components/TaskStatusBadge";

const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300 ${className} ${onClick ? "cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400" : ""}`}>
    {children}
  </div>
);

const Button = ({ children, variant = "primary", onClick, disabled = false, className = "" }) => {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20",
    secondary: "bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-900 dark:text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20",
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 hover:-translate-y-0.5 ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed hover:translate-y-0" : ""} ${className}`}
    >
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
      <div className="bg-white dark:bg-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border border-gray-100 dark:border-slate-700">
        <div className="flex justify-between items-center p-6 sm:p-8 border-b border-gray-100 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 sm:p-8">{children}</div>
      </div>
    </div>
  );
};

const CreateProjectModal = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.name.trim()) {
      setError("Project name is required");
      return;
    }
    setLoading(true);
    try {
      await api.post("/projects", formData);
      setFormData({ name: "", description: "" });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Project">
      {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Project Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            placeholder="Enter project name"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            placeholder="Enter project description"
            rows="3"
          />
        </div>
        <div className="flex gap-4 pt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1 justify-center">Cancel</Button>
          <Button type="submit" disabled={loading} className="flex-1 justify-center">
            {loading ? <Loader className="animate-spin" size={20} /> : <Plus size={20} />}
            {loading ? "Creating..." : "Create Project"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const CreateTaskModal = ({ isOpen, onClose, projects, members, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project_id: "",
    assigned_to: "",
    due_date: "",
    status: "To Do",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!formData.title.trim() || !formData.project_id) {
      setError("Title and Project are required");
      return;
    }
    setLoading(true);
    try {
      await api.post("/tasks", {
        ...formData,
        project_id: Number(formData.project_id),
        assigned_to: formData.assigned_to ? Number(formData.assigned_to) : null,
      });
      setFormData({ title: "", description: "", project_id: "", assigned_to: "", due_date: "", status: "To Do" });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Task">
      {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Task Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            placeholder="Enter task title"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            placeholder="Enter task description"
            rows="3"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Project *</label>
            <select
              name="project_id"
              value={formData.project_id}
              onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Assign To</label>
            <select
              name="assigned_to"
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="">Unassigned</option>
              {members.filter((m) => !m.is_blocked).map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Due Date</label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
        </div>
        <div className="flex gap-4 pt-6">
          <Button variant="secondary" onClick={onClose} className="flex-1 justify-center">Cancel</Button>
          <Button type="submit" disabled={loading} className="flex-1 justify-center bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20">
            {loading ? <Loader className="animate-spin" size={20} /> : <Plus size={20} />}
            {loading ? "Creating..." : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

const ProjectDetailsModal = ({ project, isOpen, onClose, tasks, members, onTaskUpdate, onUserBlockToggle }) => {
  if (!isOpen || !project) return null;
  const projectTasks = tasks.filter((t) => t.project_id === project.id);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Project: ${project.name}`}>
      <div className="space-y-6">
        {project.description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm">{project.description}</p>
        )}
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Assigned Tasks</h3>
          {projectTasks.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 italic text-sm">No tasks created for this project yet.</p>
          ) : (
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
              {projectTasks.map((task) => {
                const assignee = members.find((m) => m.id === task.assigned_to);
                return (
                  <div key={task.id} className="p-5 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-200 dark:border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors">
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start mb-2">
                         <h4 className="font-bold text-gray-900 dark:text-white text-lg">{task.title}</h4>
                      </div>
                      {task.description && <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{task.description}</p>}
                      <div className="flex items-center gap-3">
                         <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                           {assignee ? `Assigned to: ${assignee.name}` : "Unassigned"}
                         </span>
                         {assignee && (
                           <button 
                             onClick={() => onUserBlockToggle(assignee.id, assignee)} 
                             className={`px-3 py-1 text-xs rounded-full font-bold uppercase tracking-wide border shadow-sm transition-colors ${
                               assignee.is_blocked 
                                 ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30 dark:hover:bg-emerald-500/30" 
                                 : "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30 dark:hover:bg-red-500/30"
                             }`}
                             title={assignee.is_blocked ? "Unblock this user" : "Block this user"}
                           >
                             {assignee.is_blocked ? "Unblock" : "Block"}
                           </button>
                         )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Priority</label>
                        <select 
                          value={task.priority || "Medium"} 
                          onChange={(e) => onTaskUpdate(task.id, { priority: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm p-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Status</label>
                        <select 
                          value={task.status} 
                          onChange={(e) => onTaskUpdate(task.id, { status: e.target.value })}
                          className="w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm p-2 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="To Do">To Do</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Done">Done</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

function AdminDashboardPage() {
  const [data, setData] = useState({ tasks: [], projects: [], members: [], user_progress: [] });
  const [loading, setLoading] = useState(true);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [blockingUserId, setBlockingUserId] = useState(null);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [tasksRes, projectsRes, membersRes] = await Promise.all([
        api.get("/tasks"),
        api.get("/projects"),
        api.get("/users/members"),
      ]);

      const tasks = tasksRes.data.tasks || [];
      const projects = projectsRes.data.projects || [];
      const members = membersRes.data.members || [];

      const user_progress = members.map((member) => {
        const memberTasks = tasks.filter((t) => t.assigned_to === member.id);
        return {
          id: member.id,
          name: member.name,
          active: memberTasks.filter((t) => t.status !== "Done").length,
          completed: memberTasks.filter((t) => t.status === "Done").length,
        };
      });

      setData({ tasks, projects, members, user_progress });
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId, currentState) => {
    setBlockingUserId(userId);
    try {
      const endpoint = currentState.is_blocked ? `/users/${userId}/unblock` : `/users/${userId}/block`;
      await api.put(endpoint);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update user status");
    } finally {
      setBlockingUserId(null);
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      await api.put(`/tasks/${taskId}`, updates);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to update task");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full min-h-[50vh]"><Loader className="animate-spin text-indigo-600 dark:text-indigo-400" size={48} /></div>;
  }

  const totalActiveTasks = data.tasks.filter((t) => t.status !== "Done").length;
  const overdueTasks = data.tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== "Done").length;

  return (
    <div className="min-h-screen bg-transparent p-4 lg:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">Admin Overview</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Manage workspace, projects, and your team</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button variant="primary" onClick={() => setShowProjectModal(true)} className="flex-1 md:flex-none justify-center">
              <Plus size={20} /> Project
            </Button>
            <Button variant="success" onClick={() => setShowTaskModal(true)} className="flex-1 md:flex-none justify-center">
              <Plus size={20} /> Task
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl text-red-600 dark:text-red-400 flex items-center gap-3 font-medium">
            <AlertCircle size={22} />
            <span>{error}</span>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-indigo-500/20 hover:-translate-y-1 transition-transform">
            <p className="text-indigo-100 text-sm font-semibold uppercase tracking-wider">Active Tasks</p>
            <p className="text-4xl font-bold mt-2">{totalActiveTasks}</p>
          </Card>
          <Card className="p-6 bg-gradient-to-br from-red-500 to-pink-600 text-white border-none shadow-red-500/20 hover:-translate-y-1 transition-transform">
            <p className="text-red-100 text-sm font-semibold uppercase tracking-wider">Overdue</p>
            <p className="text-4xl font-bold mt-2">{overdueTasks}</p>
          </Card>
          <Card className="p-6 hover:-translate-y-1 transition-transform">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">Projects</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{data.projects.length}</p>
          </Card>
          <Card className="p-6 hover:-translate-y-1 transition-transform">
            <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">Team Members</p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{data.members.length}</p>
          </Card>
        </div>
        
        {/* Projects Overview */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Projects Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.projects.map((project) => (
               <Card key={project.id} onClick={() => setSelectedProject(project)} className="p-6 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <h3 className="font-extrabold text-xl text-gray-900 dark:text-white mb-2">{project.name}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mb-4">{project.description || "No description provided."}</p>
                  <div className="flex justify-between items-center mt-auto">
                    <span className="text-xs font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/20">
                      {data.tasks.filter(t => t.project_id === project.id).length} Tasks
                    </span>
                  </div>
               </Card>
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Member Performance</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.user_progress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" axisLine={false} tickLine={false} />
                  <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'rgba(107, 114, 128, 0.1)'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="active" name="Active" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Task Status Trend</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.user_progress}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                  <XAxis dataKey="name" stroke="#6b7280" axisLine={false} tickLine={false} />
                  <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  <Line type="monotone" dataKey="active" name="Active Tasks" stroke="#6366f1" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  <Line type="monotone" dataKey="completed" name="Completed" stroke="#10b981" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Team Members Management */}
        <Card className="p-6 mb-10 overflow-hidden">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Team Members</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="pb-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="pb-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <th className="pb-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Active</th>
                  <th className="pb-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Done</th>
                  <th className="pb-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Status</th>
                  <th className="pb-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.user_progress.map((member) => {
                  const memberData = data.members.find((m) => m.id === member.id);
                  const isFree = member.active === 0;
                  const isBlocked = memberData?.is_blocked || false;
                  return (
                    <tr key={member.id} className={`border-b border-gray-100 dark:border-slate-700/50 transition-colors ${isBlocked ? "bg-red-50/50 dark:bg-red-900/10" : "hover:bg-gray-50 dark:hover:bg-slate-800/80"}`}>
                      <td className="py-5 px-4 font-bold text-gray-900 dark:text-white">{member.name}</td>
                      <td className="py-5 px-4 text-gray-500 dark:text-gray-400">{memberData?.email}</td>
                      <td className="py-5 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">{member.active}</td>
                      <td className="py-5 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{member.completed}</td>
                      <td className="py-5 px-4 text-center">
                        {isBlocked ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400 border border-red-200 dark:border-red-500/30">Blocked</span>
                        ) : (
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                            isFree 
                              ? "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30" 
                              : "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30"
                          }`}>
                            {isFree ? "Available" : "Busy"}
                          </span>
                        )}
                      </td>
                      <td className="py-5 px-4 text-center flex justify-center">
                        <button
                          disabled={blockingUserId === member.id}
                          onClick={() => handleBlockUser(member.id, memberData)}
                          className={`p-2.5 rounded-xl transition-all shadow-sm ${
                            isBlocked 
                              ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30" 
                              : "bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30"
                          }`}
                          title={isBlocked ? "Unblock User" : "Block User"}
                        >
                          {blockingUserId === member.id ? (
                            <Loader size={18} className="animate-spin" />
                          ) : isBlocked ? (
                            <Unlock size={18} />
                          ) : (
                            <Lock size={18} />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* All Tasks */}
        <Card className="p-6 overflow-hidden">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Tasks</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="pb-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
                  <th className="pb-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Project</th>
                  <th className="pb-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assignee</th>
                  <th className="pb-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="pb-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Due Date</th>
                </tr>
              </thead>
              <tbody>
                {data.tasks.slice(0, 10).map((task) => {
                  const project = data.projects.find((p) => p.id === task.project_id);
                  const assignee = data.members.find((m) => m.id === task.assigned_to);
                  return (
                    <tr key={task.id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors">
                      <td className="py-4 px-4 font-bold text-gray-900 dark:text-white max-w-xs truncate">{task.title}</td>
                      <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{project?.name || "N/A"}</td>
                      <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{assignee?.name || "Unassigned"}</td>
                      <td className="py-4 px-4">
                        <TaskStatusBadge status={task.status} />
                      </td>
                      <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{task.due_date || "No date"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <CreateProjectModal isOpen={showProjectModal} onClose={() => setShowProjectModal(false)} onSuccess={fetchData} />
        <CreateTaskModal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} projects={data.projects} members={data.members} onSuccess={fetchData} />
        <ProjectDetailsModal 
          project={selectedProject} 
          isOpen={!!selectedProject} 
          onClose={() => setSelectedProject(null)} 
          tasks={data.tasks} 
          members={data.members} 
          onTaskUpdate={handleTaskUpdate} 
          onUserBlockToggle={handleBlockUser} 
        />
      </div>
    </div>
  );
}

export default AdminDashboardPage;
