import type { PropsWithChildren } from 'react';
import { clsx } from 'clsx';

export function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx('rounded-xl border bg-white shadow-sm', className)}>{children}</div>;
}

export function CardHeader({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx('p-4 border-b flex items-center justify-between', className)}>{children}</div>;
}

export function CardBody({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={clsx('p-4', className)}>{children}</div>;
}


