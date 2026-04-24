import { Sidebar } from "@/components/layout/sidebar";

// All dashboard routes are user-specific and authenticated — never statically prerender.
export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) { return <div className="flex min-h-screen bg-transparent"><Sidebar /><main className="flex-1 px-6 py-8 lg:px-10">{children}</main></div>; }
