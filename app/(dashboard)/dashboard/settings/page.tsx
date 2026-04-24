import Link from "next/link";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
const items = [{ href: "/dashboard/settings/company", title: "Main Account setup", text: "Payment destination, remit-to identity, default terms, and company billing controls." },{ href: "/dashboard/settings/users", title: "User management", text: "Assign roles, activate users, and keep Main Account support roles restricted properly." }];
export default function SettingsPage() { return <div><Topbar title="Settings" subtitle="Administrative control for the people and payment structure behind ERPNexus." /><div className="grid gap-5 md:grid-cols-2">{items.map((item) => <Link key={item.href} href={item.href}><Card className="h-full p-6 transition hover:border-cyan-300/30 hover:bg-white/5"><h2 className="text-xl font-semibold text-white">{item.title}</h2><p className="mt-3 text-sm leading-6 text-slate-300">{item.text}</p></Card></Link>)}</div></div>; }
