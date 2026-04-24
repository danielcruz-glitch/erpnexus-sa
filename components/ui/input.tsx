import { InputHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Input(props: InputHTMLAttributes<HTMLInputElement>) { return <input {...props} className={cn("w-full rounded-xl border border-sky-200/20 bg-slate-950/70 px-4 py-3 text-sm text-ink outline-none placeholder:text-slate-500 focus:border-accent focus:shadow-[0_0_0_4px_rgba(45,212,191,0.12)]", props.className)} />; }
export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...props} className={cn("min-h-28 w-full rounded-xl border border-sky-200/20 bg-slate-950/70 px-4 py-3 text-sm text-ink outline-none placeholder:text-slate-500 focus:border-accent focus:shadow-[0_0_0_4px_rgba(45,212,191,0.12)]", props.className)} />; }
