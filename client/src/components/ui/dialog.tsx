import * as React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
      <button className="absolute right-4 top-4 rounded-sm p-1 text-white opacity-80 transition hover:opacity-100" onClick={() => onOpenChange(false)}>
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

function DialogTrigger({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <div onClick={onClick}>{children}</div>;
}

function DialogContent({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn(className)}>{children}</div>;
}

function DialogClose({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button onClick={onClick}>{children}</button>;
}

export { Dialog, DialogTrigger, DialogContent, DialogClose };
