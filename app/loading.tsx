export default async function Loading() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative size-16">
          <div className="absolute top-0 left-0 h-full w-full rounded-full border-4"></div>
          <div className="absolute top-0 left-0 h-full w-full animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>

        <div className="text-center">
          <h3 className="text-lg font-semibold">Carregando</h3>
          <p className="text-sm">Aguarde...</p>
        </div>
      </div>
    </main>
  );
}
