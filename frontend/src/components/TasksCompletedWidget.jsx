function TasksCompletedWidget({ count }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-4 shadow-2xl backdrop-blur-lg">
      <p className="text-sm font-medium text-emerald-300">Tasks Completed This Week</p>
      <p className="mt-1 text-3xl font-bold text-emerald-200">{count}</p>
    </div>
  );
}

export default TasksCompletedWidget;
