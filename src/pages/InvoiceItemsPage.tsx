import { useCurrentUser } from "app/auth";
import { PageHeader } from "components/PageHeader";
import { Button } from "@/components/ui/button";
import { InvoiceItemsSettings } from "components/InvoiceItemsSettings";
import { Translate } from "components/Translate";
import { NoIndex } from "components/NoIndex";

export default function InvoiceItemsPage() {
  const { user } = useCurrentUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 md:pb-0">
        <NoIndex />
        <PageHeader title="Invoice Items Library" subtitle="Manage your reusable invoice items" />
        <main className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <div className="bg-card border rounded-lg p-8 shadow-sm max-w-md mx-auto">
            <h2 className="text-2xl font-bold mb-4"><Translate>Please Sign In</Translate></h2>
            <p className="text-muted-foreground mb-6">
              <Translate>You need to be signed in to manage your invoice items.</Translate>
            </p>
            <Button asChild className="w-full">
              <a href="/login"><Translate>Sign In</Translate></a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 md:pb-0">
      <NoIndex />
      <PageHeader title="Invoice Items Library" subtitle="Manage your reusable invoice items" />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
         <InvoiceItemsSettings />
      </main>
    </div>
  );
}
