import ErrorState from '@/components/ui/error-state';

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <ErrorState message="404 Page Not Found. Did you forget to add the page to the router?" />
    </div>
  );
}
