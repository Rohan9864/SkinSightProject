export default function LoadingSpinner({
  fullScreen = true
}) {
  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center
                      justify-center bg-gray-50">
        <div className="flex flex-col items-center
                        gap-3">
          <div className="w-12 h-12 border-4
                          border-primary-600
                          border-t-transparent
                          rounded-full animate-spin"/>
          <p className="text-gray-500 text-sm
                        font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center py-8">
      <div className="w-8 h-8 border-4
                      border-primary-600
                      border-t-transparent
                      rounded-full animate-spin"/>
    </div>
  );
}