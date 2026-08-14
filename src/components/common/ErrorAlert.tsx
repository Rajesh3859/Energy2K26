"use client";

interface ErrorAlertProps {
  title?: string;
  message: string;
}

export default function ErrorAlert({
  title = "An error occurred",
  message,
}: ErrorAlertProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
      <h3 className="font-semibold text-red-900">{title}</h3>
      <p className="mt-1 text-sm text-red-600">{message}</p>
    </div>
  );
}
