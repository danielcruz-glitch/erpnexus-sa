import { ReactNode } from "react";
import { cn } from "@/lib/utils";
export function Card({ children, className }: { children: ReactNode; className?: string }) { return <section className={cn("rounded-2xl border border-white/10 bg-panel/90 shadow-halo", className)}>{children}</section>; }
