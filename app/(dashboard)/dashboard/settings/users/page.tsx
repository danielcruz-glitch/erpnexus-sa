import { createAdminClient } from "@/lib/supabase/admin";
import { Topbar } from "@/components/layout/topbar";
import { Card } from "@/components/ui/card";
import { CreateUserForm } from "@/components/forms/create-user-form";
import type { UserListItem } from "@/lib/types";

export default async function UsersSettingsPage() {
  const supabase = createAdminClient();

  const [usersResult, companiesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,full_name,email,role,is_active,companies!profiles_company_id_fkey(id,name)")
      .order("full_name"),
    supabase.from("companies").select("id,name").eq("is_active", true).order("name"),
  ]);

  if (usersResult.error) {
    throw new Error(`Failed to load users: ${usersResult.error.message}`);
  }

  const users = (usersResult.data ?? []) as UserListItem[];
  const companies = (companiesResult.data ?? []) as { id: string; name: string }[];

  return (
    <div>
      <Topbar
        title="User management"
        subtitle="Full admin view of roles, activation state, and company assignment."
      />

      <Card className="mb-6 p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Create new user</h2>
        <CreateUserForm companies={companies} />
      </Card>

      <Card className="overflow-hidden">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/5 text-slate-400">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Role</th>
              <th className="px-6 py-3">Company</th>
              <th className="px-6 py-3">Active</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-white/5 text-slate-200">
                <td className="px-6 py-4">{user.full_name ?? "Unnamed user"}</td>
                <td className="px-6 py-4">{user.email ?? "--"}</td>
                <td className="px-6 py-4">{user.role}</td>
                <td className="px-6 py-4">{user.companies?.[0]?.name ?? "Unassigned"}</td>
                <td className="px-6 py-4">{user.is_active ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
