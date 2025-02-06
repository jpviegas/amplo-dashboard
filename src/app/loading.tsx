export default function Loading() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="relative h-16 w-16">
          <div className="absolute left-0 top-0 h-full w-full rounded-full border-4 border-gray-200"></div>
          <div className="absolute left-0 top-0 h-full w-full animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800">Carregando</h3>
          <p className="text-sm text-gray-500">Aguarde ...</p>
        </div>

        <div className="h-1 w-48 overflow-hidden rounded-full bg-gray-200">
          <div className="animate-loading-bar h-full bg-blue-500"></div>
        </div>
      </div>
    </div>
  );
}
