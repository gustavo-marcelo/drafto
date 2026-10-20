export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-primary-100 h-8 w-48 animate-pulse rounded" />
      <div className="bg-primary-100 h-10 w-full max-w-sm animate-pulse rounded" />
      <div className="bg-primary-100 h-64 w-full animate-pulse rounded-lg" />
    </div>
  );
}
