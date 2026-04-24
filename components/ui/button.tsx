import { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Button({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) { return <button className={cn("inline-flex items-center justify-center rounded-xl border border-white/10 bg-accent px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60", className)} {...props} />; }
