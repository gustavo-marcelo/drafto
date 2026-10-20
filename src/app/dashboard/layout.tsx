import { Suspense } from "react";

import { DashboardShell } from "@/components/layout/dashboard-shell";
import { UserMenu } from "@/components/layout/user-menu";
import { getCurrentUser } from "@/lib/dal";

export const instant = false;

async function UserArea() {
  const user = await getCurrentUser();
  return <UserMenu name={user.name} email={user.email} />;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      userSlot={
        <Suspense fallback={<span className="text-primary-400 text-sm">...</span>}>
          <UserArea />
        </Suspense>
      }
    >
      {children}
    </DashboardShell>
  );
}
