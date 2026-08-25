import { useMemo } from "react";
import { useAllPayments } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { DollarSign, TrendingUp, Clock } from "lucide-react";

interface PaymentRow {
  id: string;
  user_id: string;
  course_id: string;
  amount: number;
  currency: string;
  status: string;
  receipt_url?: string;
  paid_at?: string;
  created_at: string;
}

function getStatusVariant(status: string) {
  if (status === "PAID") return "default" as const;
  if (status === "FAILED") return "destructive" as const;
  if (status === "REFUNDED") return "secondary" as const;
  return "outline" as const;
}

export function AdminPaymentsPage() {
  const { data: payments, isLoading, error } = useAllPayments();

  const stats = useMemo(() => {
    if (!payments?.length) return { total: 0, paid: 0, pending: 0, revenue: 0 };
    const rows = payments as unknown as PaymentRow[];
    const paid = rows.filter((p) => p.status === "PAID").length;
    const pending = rows.filter((p) => p.status === "PENDING").length;
    const revenue = rows
      .filter((p) => p.status === "PAID")
      .reduce((sum, p) => sum + p.amount, 0);
    return { total: rows.length, paid, pending, revenue };
  }, [payments]);

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive">Failed to load payments.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground">View payment records</p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.revenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-1">
              <Clock className="h-4 w-4 text-orange-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Records</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 rounded bg-muted animate-pulse" />
              ))}
            </div>
          ) : !payments?.length ? (
            <EmptyState
              title="No payments yet"
              description="Payment records will appear here."
              icon={<DollarSign className="h-12 w-12" />}
            />
          ) : (
            <div className="space-y-2">
              {(payments as unknown as PaymentRow[]).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">
                        {payment.amount.toLocaleString()} {payment.currency}
                      </p>
                      <Badge variant={getStatusVariant(payment.status)}>
                        {payment.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      User: {payment.user_id.slice(0, 8)}... &middot; Course:{" "}
                      {payment.course_id.slice(0, 8)}...
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </p>
                    {payment.paid_at && (
                      <p className="text-xs text-green-600">
                        Paid: {new Date(payment.paid_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
