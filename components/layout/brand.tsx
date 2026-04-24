import Link from "next/link";
import { MAIN_BRAND } from "@/lib/app-config";
export function Brand() { return <Link href="/" className="inline-flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 text-lg font-black text-slate-950">E</div><div><p className="text-base font-semibold tracking-wide text-white">{MAIN_BRAND}</p><p className="text-xs uppercase tracking-[0.28em] text-muted">Support App</p></div></Link>; }
