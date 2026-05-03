const colorMap = {
  "To Do": "bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20",
  "In Progress": "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
  Done: "bg-green-50 text-green-600 border border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20",
};

function TaskStatusBadge({ status }) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold tracking-wide uppercase shadow-sm ${
        colorMap[status] || "bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-800 dark:text-gray-300 dark:border-slate-700"
      }`}
    >
      {status}
    </span>
  );
}

export default TaskStatusBadge;
