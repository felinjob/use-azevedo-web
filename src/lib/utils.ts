import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBaseUrl(): string {
  // 1. Variável de ambiente explícita
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, '');
  }
  // 2. Se estiver em produção na Vercel, cravar a URL oficial da Use Azevedo
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
    return 'https://useazevedo.vercel.app';
  }
  // 3. Ambiente local de desenvolvimento
  return 'http://localhost:3000';
}
