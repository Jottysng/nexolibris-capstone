import { AlertCircle, BookOpen, LoaderCircle } from 'lucide-react';
import type { ReactNode } from 'react';

export function LoadingState({ label = 'Cargando' }: { label?: string }) {
  return <div className="state-panel" role="status"><LoaderCircle className="spin" aria-hidden="true" /><p>{label}…</p></div>;
}
export function ErrorState({ message, action }: { message: string; action?: ReactNode }) {
  return <div className="state-panel state-error" role="alert"><AlertCircle aria-hidden="true" /><h2>No pudimos completar la solicitud</h2><p>{message}</p>{action}</div>;
}
export function EmptyState({ title, children }: { title: string; children: ReactNode }) {
  return <div className="state-panel" role="status"><BookOpen aria-hidden="true" /><h2>{title}</h2><div>{children}</div></div>;
}
