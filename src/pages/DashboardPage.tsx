import { Dashboard } from "components/Dashboard";
import { SEO } from "components/SEO";

export default function DashboardPage() {
  return (
    <>
      <SEO 
        title="Dashboard" 
        description="Track your work, manage invoices, and view earnings."
      />
      <Dashboard />
    </>
  );
}