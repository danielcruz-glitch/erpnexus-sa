import { Card } from "@/components/ui/card";
export function MetricCard({ label, value, helper }: { label: string; value: string; helper: string }) { return <Card className="p-5"><p className="text-sm text-muted">{label}</p><p className="mt-3 text-3xl font-semibold text-white">{value}</p><p className="mt-2 text-sm text-slate-400">{helper}</p></Card>; }
