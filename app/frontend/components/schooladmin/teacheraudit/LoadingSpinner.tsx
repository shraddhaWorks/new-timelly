"use client";

interface LoadingSpinnerProps {
  className?: string;
}

/** Reusable loading spinner for lists and sections */
export default function LoadingSpinner({
  className = "flex justify-center py-12",
}: LoadingSpinnerProps) {
  return (
    <div className={className} role="status" aria-label="Loading">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-white/30 border-t-white" />
    </div>
  );
}
