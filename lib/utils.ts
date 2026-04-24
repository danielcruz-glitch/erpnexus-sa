import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }
export function currency(value: number) { return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value || 0); }
export function formatDate(value?: string | null) { if (!value) return "--"; return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value)); }
export function daysAlive(value?: string | null) { if (!value) return 0; const created = new Date(value).getTime(); return Math.max(0, Math.floor((Date.now() - created)/(1000*60*60*24))); }
