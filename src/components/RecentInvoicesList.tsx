import { useNavigate } from "react-router-dom";
import { Translate } from "components/Translate";
import type { InvoiceListItem } from "types";

interface Props {
  invoices: InvoiceListItem[];
}

export function RecentInvoicesList({ invoices }: Props) {
  const navigate = useNavigate();
  const recentInvoices = invoices.slice(0, 5);

  const renderContent = () => {
    if (recentInvoices.length === 0) {
      return (
        <div className="bg-card border border-border rounded-xl p-4 text-sm text-muted-foreground">
          <Translate>No invoices yet. Create one from the Quick Actions above.</Translate>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {recentInvoices.map((invoice) => (
          <div
            key={invoice.id}
            className="bg-card border border-border rounded-xl p-4 hover:shadow-sm transition-shadow cursor-pointer"
            onClick={() => navigate('/InvoicesPage')}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm font-medium text-foreground mb-0.5">{invoice.client_name}</div>
                <div className="text-xs text-muted-foreground">{invoice.invoice_number}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-foreground">
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(invoice.total)}
                </div>
                <div className={`text-xs capitalize ${
                  invoice.status === 'paid' ? 'text-green-600 font-medium' :
                  invoice.status === 'sent' ? 'text-blue-600' :
                  'text-muted-foreground'
                }`}>
                  <Translate>{invoice.status}</Translate>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-medium text-foreground"><Translate>Recent Invoices</Translate></h2>
        <button
          onClick={() => navigate("/InvoicesPage")}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Translate>View all</Translate>
        </button>
      </div>
      {renderContent()}
    </div>
  );
}
