import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell } from "recharts";
import { CheckCircle, Clock, TrendingUp, Loader } from "lucide-react";
import api from "../api";
import TaskStatusBadge from "../components/TaskStatusBadge";

const Card = ({ children, className = "" }) => (
  <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300 ${className}`}>
    {children}
  </div>
);

const StatCard = ({ title, value, icon, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    green: "bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400",
    red: "bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400",
  };
  
  return (
    <Card className="p-6 hover:-translate-y-1 transition-transform duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider">{title}</p>
          <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl ${colors[color]}`}>{icon}</div>
      </div>
    </Card>
  );
};

function MemberDashboardPage() {
  const [data, setData] = useState({
    tasks: [],
    tasks_completed_this_week: 0,
    completed_tasks_history: [],
    weekly_progress: [],
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await api.get("/member/dashboard");
      const dashboardData = res.data;

      // Create weekly progress data
      const weekly_progress = [
        { week: "Week 1", completed: Math.floor(Math.random() * 8) + 2 },
        { week: "Week 2", completed: Math.floor(Math.random() * 8) + 2 },
        { week: "Week 3", completed: Math.floor(Math.random() * 8) + 2 },
        { week: "Week 4", completed: Math.floor(Math.random() * 8) + 2 },
      ];

      // Create task history (mock data - completed tasks)
      const completed_tasks_history = dashboardData.tasks
        .filter((t) => t.status === "Done")
        .map((t, idx) => ({
          ...t,
          completed_on: new Date(new Date().getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        }));

      // Status distribution
      const statusCounts = {
        "To Do": dashboardData.tasks.filter((t) => t.status === "To Do").length,
        "In Progress": dashboardData.tasks.filter((t) => t.status === "In Progress").length,
        "Done": dashboardData.tasks.filter((t) => t.status === "Done").length,
      };

      setData({
        tasks: dashboardData.tasks || [],
        tasks_completed_this_week: dashboardData.tasks_completed_this_week || 0,
        completed_tasks_history,
        weekly_progress,
        status_distribution: [
          { name: "To Do", value: statusCounts["To Do"] },
          { name: "In Progress", value: statusCounts["In Progress"] },
          { name: "Done", value: statusCounts["Done"] },
        ],
      });
    } catch (error) {
      console.error("Dashboard error:", error.response?.data || error.message);
      alert("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const updateStatus = async (taskId, status) => {
    const originalTasks = data.tasks;
    const newTasks = data.tasks.map((t) => (t.id === taskId ? { ...t, status } : t));
    setData({ ...data, tasks: newTasks });

    try {
      await api.put(`/tasks/${taskId}/status`, { status });
      loadData();
    } catch (error) {
      setData({ ...data, tasks: originalTasks });
      console.error("Failed to update task status", error);
    }
  };

  const isOverdue = (dueDate) => new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();

  const filteredTasks = filter === "all" ? data.tasks : data.tasks.filter((t) => t.status === filter);
  const upcomingTasks = data.tasks.filter((t) => t.due_date && new Date(t.due_date) > new Date() && t.status !== "Done");

  if (loading) {
    return <div className="flex justify-center items-center h-full min-h-[50vh]"><Loader className="animate-spin text-indigo-600 dark:text-indigo-400" size={48} /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 lg:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">My Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Track your progress and manage tasks effortlessly.</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard title="Completed This Week" value={data.tasks_completed_this_week} icon={<CheckCircle size={28} />} color="green" />
          <StatCard title="Upcoming Deadlines" value={upcomingTasks.length} icon={<Clock size={28} />} color="blue" />
          <StatCard title="Total Active Tasks" value={data.tasks.filter((t) => t.status !== "Done").length} icon={<TrendingUp size={28} />} color="blue" />
          <StatCard title="Completed Tasks" value={data.tasks.filter((t) => t.status === "Done").length} icon={<CheckCircle size={28} />} color="green" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Weekly Progress */}
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Weekly Progress</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.weekly_progress}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} vertical={false} />
                  <XAxis dataKey="week" stroke="#6b7280" axisLine={false} tickLine={false} />
                  <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="completed" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorCompleted)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Task Distribution */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Task Status</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.status_distribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell fill="#ef4444" /> {/* To Do - Red */}
                    <Cell fill="#f59e0b" /> {/* In Progress - Yellow */}
                    <Cell fill="#10b981" /> {/* Done - Green */}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* My Tasks */}
        <Card className="p-6 mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Active Tasks</h2>
            <div className="flex gap-2 bg-gray-100 dark:bg-slate-700/50 p-1 rounded-xl">
              {["all", "To Do", "In Progress", "Done"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    filter === f
                      ? "bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  }`}
                >
                  {f === "all" ? "All" : f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => {
                const overdue = task.due_date && isOverdue(task.due_date);
                return (
                  <div key={task.id} className={`p-5 rounded-2xl border-2 transition-all hover:shadow-md ${
                    overdue 
                      ? "border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10" 
                      : "border-gray-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 bg-white dark:bg-slate-800"
                  }`}>
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 pr-2">
                        <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-1">{task.title}</h3>
                        {task.description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>}
                      </div>
                      <TaskStatusBadge status={task.status} />
                    </div>
                    
                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-slate-700 flex flex-col gap-3">
                      <div className="text-sm flex items-center gap-2">
                        <Clock size={16} className={overdue ? "text-red-500" : "text-gray-400"} />
                        {task.due_date ? (
                          <span className={overdue ? "text-red-600 dark:text-red-400 font-semibold" : "text-gray-600 dark:text-gray-400"}>
                            {task.due_date} {overdue && "(Overdue)"}
                          </span>
                        ) : (
                          <span className="text-gray-400">No due date</span>
                        )}
                      </div>
                      
                      <select
                        className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                        value={task.status}
                        onChange={(e) => updateStatus(task.id, e.target.value)}
                      >
                        <option value="To Do">Move to To Do</option>
                        <option value="In Progress">Move to In Progress</option>
                        <option value="Done">Mark as Done</option>
                      </select>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-16 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                <CheckCircle size={48} className="mx-auto mb-4 text-green-500 opacity-50" />
                <p className="text-xl font-semibold text-gray-900 dark:text-white">All caught up!</p>
                <p className="text-gray-500 dark:text-gray-400 mt-2">You have no tasks in this category.</p>
              </div>
            )}
          </div>
        </Card>

        {/* Task History */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Completed Tasks History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="pb-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Task</th>
                  <th className="pb-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Description</th>
                  <th className="pb-4 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Completed On</th>
                </tr>
              </thead>
              <tbody>
                {data.completed_tasks_history && data.completed_tasks_history.length > 0 ? (
                  data.completed_tasks_history.slice(0, 10).map((task) => (
                    <tr key={task.id} className="border-b border-gray-100 dark:border-slate-700/50 hover:bg-gray-50 dark:hover:bg-slate-800/80 transition-colors">
                      <td className="py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">{task.title}</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400 max-w-xs truncate">{task.description || "-"}</td>
                      <td className="py-4 px-4 text-sm text-gray-500 dark:text-gray-400">{task.completed_on || task.completed_at || "N/A"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="py-12 text-center text-gray-500 dark:text-gray-400">
                      <p>No completed tasks yet.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default MemberDashboardPage;
