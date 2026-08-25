import {
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  Receipt,
  IndianRupee,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { usePayments } from "@/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/common/EmptyState";
import type { Payment } from "@/types/payment";

function PaymentsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64" />
    </div>
  );
}

function statusConfig(status: Payment["status"]) {
  switch (status) {
    case "PAID":
      return { icon: CheckCircle, color: "text-green-500", badge: "default" as const, label: "Paid" };
    case "PENDING":
      return { icon: Clock, color: "text-amber-500", badge: "secondary" as const, label: "Pending" };
    case "FAILED":
      return { icon: XCircle, color: "text-red-500", badge: "destructive" as const, label: "Failed" };
    case "REFUNDED":
      return { icon: Receipt, color: "text-blue-500", badge: "outline" as const, label: "Refunded" };
  }
}

export function StudentPaymentsPage() {
  const { user } = useAuth();
  const userId = user?.id || "";

  const { data: payments, isLoading } = usePayments(userId);

  const totalPaid = (payments || [])
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingAmount = (payments || [])
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalTransactions = payments?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground">
          View your payment history and receipts.
        </p>
      </div>

      {isLoading ? (
        <PaymentsSkeleton />
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Paid</p>
                    <p className="text-2xl font-bold">
                      <IndianRupee className="inline h-4 w-4" />
                      {totalPaid.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending</p>
                    <p className="text-2xl font-bold">
                      <IndianRupee className="inline h-4 w-4" />
                      {pendingAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                  <div className="rounded-lg bg-amber-100 p-3 dark:bg-amber-900/30">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Transactions</p>
                    <p className="text-2xl font-bold">{totalTransactions}</p>
                  </div>
                  <div className="rounded-lg bg-primary/10 p-3">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {!payments?.length ? (
                <EmptyState
                  title="No payments yet"
                  description="Your payment history will appear here."
                  icon={<CreditCard className="h-12 w-12" />}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Course ID</th>
                        <th className="pb-3 font-medium">Amount</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Receipt</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => {
                        const config = statusConfig(payment.status);
                        const StatusIcon = config.icon;
                        return (
                          <tr key={payment.id} className="border-b last:border-0">
                            <td className="py-3">
                              {new Date(payment.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td className="py-3">
                              <span className="font-mono text-xs">
                                {payment.courseId.slice(0, 8)}...
                              </span>
                            </td>
                            <td className="py-3 font-medium">
                              <IndianRupee className="inline h-3 w-3" />
                              {payment.amount.toLocaleString("en-IN")}
                            </td>
                            <td className="py-3">
                              <Badge variant={config.badge} className="gap-1">
                                <StatusIcon className={`h-3 w-3 ${config.color}`} />
                                {config.label}
                              </Badge>
                            </td>
                            <td className="py-3">
                              {payment.receiptUrl ? (
                                <a
                                  href={payment.receiptUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  View
                                </a>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
