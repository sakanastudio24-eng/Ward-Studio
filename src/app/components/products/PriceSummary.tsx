import { formatPrice } from "./utils";

export interface PriceSummaryProps {
  title?: string;
  tierPrice: number;
  addOnSubtotal: number;
  total: number;
  depositToday: number;
  remainingBalance: number;
}

export function PriceSummary({
  title = "Pricing Summary",
  tierPrice,
  addOnSubtotal,
  total,
  depositToday,
  remainingBalance,
}: PriceSummaryProps) {
  return (
    <section className="rounded-lg border border-border p-4">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span>Tier Price</span>
          <span>{formatPrice(tierPrice)}</span>
        </div>
        <div className="flex items-center justify-between text-muted-foreground">
          <span>Selected Add-ons (General + Readiness)</span>
          <span>{formatPrice(addOnSubtotal)}</span>
        </div>
        <div className="border-t border-border pt-2">
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Total Price</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span>Deposit Today</span>
          <span>{formatPrice(depositToday)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Remaining Balance</span>
          <span>{formatPrice(remainingBalance)}</span>
        </div>
      </div>
    </section>
  );
}
