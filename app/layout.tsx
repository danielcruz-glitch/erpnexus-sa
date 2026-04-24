import type { Metadata } from "next";
import "./globals.css";
import { APP_NAME } from "@/lib/app-config";
export const metadata: Metadata = { title: APP_NAME, description: "Sophisticated ERP support workflow and invoicing platform." };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en"><body>{children}</body></html>; }
