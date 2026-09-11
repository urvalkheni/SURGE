import { AppShell } from '@/components/layout/app-shell';
import { PageContainer } from '@/components/layout/page-container';
import { DashboardView } from '@/components/dashboard/dashboard-view';

export const metadata = {
  title: 'Operations Command Center · Ahmedabad 42 MW | RenewableIQ',
  description: 'Industrial renewable energy generation forecasting, real-time grid ramp triage, and prescriptive BESS battery dispatch command center.',
};

export default function DashboardPage() {
  return (
    <AppShell>
      <PageContainer maxWidth="standard" className="py-6">
        <DashboardView />
      </PageContainer>
    </AppShell>
  );
}
