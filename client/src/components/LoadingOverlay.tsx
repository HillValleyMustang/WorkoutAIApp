export default function LoadingOverlay({ isVisible, message = "Processing your workout..." }: { 
  isVisible: boolean; 
  message?: string; 
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl p-8 flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-upper-a border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
}
