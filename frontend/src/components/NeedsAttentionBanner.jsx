function NeedsAttentionBanner({ tasks = [] }) {
  if (!tasks.length) return null;

  return (
    <div className="mb-4 rounded-lg border border-red-300 bg-red-50 p-4 shadow-sm">
      <p className="font-semibold text-red-900">Needs Attention</p>
      <p className="text-sm text-red-700">
        {tasks.length} task(s) are due today or overdue. Focus on these first.
      </p>
    </div>
  );
}

export default NeedsAttentionBanner;
