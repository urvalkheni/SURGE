import { AppShell } from '@/components/layout/app-shell';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Sun, Battery, MapPin, Save } from 'lucide-react';
import { demoPlant } from '@/data/demo-data';

export default function PlantPage() {
  return (
    <AppShell>
      <PageContainer>
        <PageHeader
          title="Plant Digital Twin Configuration"
          description="Technical hardware parametrization, solar array geometry, inverter banks, and BESS storage capacity."
          breadcrumbs={[
            { label: 'System' },
            { label: 'Plant Digital Twin' },
          ]}
          actions={
            <Button size="sm" variant="primary" className="gap-1.5 h-9">
              <Save className="size-3.5" />
              <span>Save Configuration</span>
            </Button>
          }
        />

        <div className="space-y-6">
          {/* Plant Identity Summary Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">Asset Site</span>
                  <MapPin className="size-4 text-primary" />
                </div>
                <CardTitle className="text-sm mt-1">{demoPlant.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-foreground-secondary space-y-1">
                <div>Location: {demoPlant.locationName}</div>
                <div>Coordinates: {demoPlant.latitude}°N, {demoPlant.longitude}°E</div>
                <div className="font-mono text-[11px] text-foreground font-semibold">Node: {demoPlant.gridNodeId}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">Solar PV Array</span>
                  <Sun className="size-4 text-warning" />
                </div>
                <CardTitle className="text-sm mt-1">{demoPlant.dcCapacityMw} MW DC / {demoPlant.acCapacityMw} MW AC</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-foreground-secondary space-y-1">
                <div>Tracker: Single-Axis Tracking (±45°)</div>
                <div>Azimuth: 180° True South · Tilt: 25°</div>
                <div>Inverters: 25 Central Inverter Blocks</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted uppercase tracking-wider">Co-Located BESS</span>
                  <Battery className="size-4 text-primary" />
                </div>
                <CardTitle className="text-sm mt-1">{demoPlant.bess?.nameplateCapacityMwh} MWh Capacity</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-foreground-secondary space-y-1">
                <div>Max Power: ±{demoPlant.bess?.maxDischargeRateMw} MW (4-Hour Storage)</div>
                <div>Current SOC: {demoPlant.bess?.currentSocPercent}% · Efficiency: {demoPlant.bess?.roundTripEfficiencyPercent}%</div>
                <div className="text-primary font-semibold">State: Standby / Pre-Conditioned</div>
              </CardContent>
            </Card>
          </div>

          {/* Subsystem Configuration Form Placeholder */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Hardware Parametrization Engine</CardTitle>
                  <CardDescription>Configure physical string architectures and inverter response curves</CardDescription>
                </div>
                <Badge variant="outline" className="text-[10px]">Phase 10 Asset Twin</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-dashed border-border bg-[#F9FAF8] p-10 text-center text-xs text-foreground-secondary">
                Detailed digital twin configuration form scheduled for Phase 10 implementation, supporting 
                inverter efficiency curves, degradation limits, degradation schedules, and PPA tariff structures.
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    </AppShell>
  );
}
