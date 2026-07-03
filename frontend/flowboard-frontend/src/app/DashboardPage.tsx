import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DashboardPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        Dashboard is intentionally minimal. Your product starts with Projects.
      </CardContent>
    </Card>
  );
}
