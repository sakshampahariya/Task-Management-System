import { Loader } from "lucide-react";

function GlassLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-md flex flex-col items-center gap-4">
        <Loader className="animate-spin text-blue-600" size={40} />
        <p className="font-semibold text-gray-900">Loading...</p>
      </div>
    </div>
  );
}

export default GlassLoader;
