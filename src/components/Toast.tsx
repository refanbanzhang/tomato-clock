import { useEffect } from "react";

interface ToastProps {
  message: string;
  sub?: string;
  duration?: number;
  onDismiss: () => void;
}

export default function Toast({
  message,
  sub,
  duration = 5000,
  onDismiss,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, duration);
    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  return (
    <div role="alert">
      <p>{message}</p>
      {sub && <p>{sub}</p>}
      <button type="button" onClick={onDismiss}>
        关闭
      </button>
    </div>
  );
}
