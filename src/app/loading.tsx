export default function Loading() {
  return (
    <main
      className="min-h-dvh flex flex-col items-center justify-center gap-6 px-6"
      aria-busy="true"
      aria-label="Loading ChronoFlow"
    >
      <div className="w-12 h-12 rounded-2xl skeleton" />
      <div className="space-y-3 w-full max-w-md">
        <div className="h-8 skeleton w-3/4 mx-auto" />
        <div className="h-4 skeleton w-full" />
        <div className="h-4 skeleton w-5/6 mx-auto" />
        <div className="h-14 skeleton w-full mt-6 rounded-xl" />
      </div>
    </main>
  );
}
