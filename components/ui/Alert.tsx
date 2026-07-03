interface AlertProps {
  message: string;
  onDismiss?: () => void;
}

/** Inline error banner, used inside the application form on a failed submit. */
export default function Alert({ message, onDismiss }: AlertProps) {
  return (
    <div
      role="alert"
      className="flex items-start justify-between gap-3 rounded-3xl border border-red-500/40 bg-[#3E1212]/90 px-5 py-4 text-sm text-red-100 shadow-card animate-fadeUp"
    >
      <div className="flex flex-col gap-2 text-left">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-200">มีบางอย่างผิดพลาด</p>
        <span className="text-sm text-red-100">{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss error"
          className="flex-shrink-0 rounded-full bg-red-500/10 px-3 py-2 text-red-200 transition hover:bg-red-500/20"
        >
          ปิด
        </button>
      )}
    </div>
  );
}
