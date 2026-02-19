import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import type { BookingMode } from "../../../lib/rules";
import type { DetailflowTierId } from "../../../lib/pricing";
import { formatPrice } from "./utils";

export type PackagePreset = {
  id: DetailflowTierId;
  label: string;
  description: string;
  price: number;
  deposit: number;
  final: number;
};

export interface PlanSelectorProps {
  packagePresets: PackagePreset[];
  selectedPackageId: DetailflowTierId;
  selectedTierFeatures: string[];
  onSelectPackage: (packageId: DetailflowTierId) => void;
  bookingMode: BookingMode;
  onBookingModeChange: (mode: BookingMode) => void;
  bookingUrl: string;
  bookingEmbedUrl: string;
  onBookingUrlChange: (value: string) => void;
  onBookingEmbedUrlChange: (value: string) => void;
  bookingMessages: {
    externalLinkMessage: string;
    iframeMessage: string;
    iframeWarning: string;
    contactOnlyMessage: string;
  };
}

export function PlanSelector({
  packagePresets,
  selectedPackageId,
  selectedTierFeatures,
  onSelectPackage,
  bookingMode,
  onBookingModeChange,
  bookingUrl,
  bookingEmbedUrl,
  onBookingUrlChange,
  onBookingEmbedUrlChange,
  bookingMessages,
}: PlanSelectorProps) {
  return (
    <>
      <section className="rounded-lg border border-border p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Tier Selector
        </h3>
        <RadioGroup value={selectedPackageId} onValueChange={(value) => onSelectPackage(value as DetailflowTierId)}>
          {packagePresets.map((preset) => (
            <label
              key={preset.id}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3"
            >
              <RadioGroupItem value={preset.id} className="mt-1" />
              <span className="flex-1">
                <span className="block text-sm font-medium">{preset.label}</span>
                <span className="block text-xs text-muted-foreground">{preset.description}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {formatPrice(preset.price)} total, {formatPrice(preset.deposit)} deposit, {formatPrice(preset.final)} final.
                </span>
              </span>
            </label>
          ))}
        </RadioGroup>
      </section>

      <section className="rounded-lg border border-border p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Selected Tier Features
        </h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {selectedTierFeatures.map((feature) => (
            <li key={feature}>• {feature}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-border p-4">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Booking Preference
        </h3>
        <RadioGroup value={bookingMode} onValueChange={(value) => onBookingModeChange(value as BookingMode)}>
          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3">
            <RadioGroupItem value="external_link" className="mt-1" />
            <span className="text-xs text-muted-foreground">{bookingMessages.externalLinkMessage}</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3">
            <RadioGroupItem value="iframe" className="mt-1" />
            <span className="text-xs text-muted-foreground">{bookingMessages.iframeMessage}</span>
          </label>
          <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3">
            <RadioGroupItem value="contact_only" className="mt-1" />
            <span className="text-xs text-muted-foreground">{bookingMessages.contactOnlyMessage}</span>
          </label>
        </RadioGroup>

        {bookingMode === "external_link" && (
          <div className="mt-3 space-y-2">
            <Label htmlFor="booking-url">Booking URL</Label>
            <Input
              id="booking-url"
              placeholder="https://example-booking.com"
              value={bookingUrl}
              onChange={(event) => onBookingUrlChange(event.target.value)}
            />
          </div>
        )}

        {bookingMode === "iframe" && (
          <div className="mt-3 space-y-2">
            <Label htmlFor="booking-embed-url">Embed URL</Label>
            <Input
              id="booking-embed-url"
              placeholder="https://example-booking.com/embed"
              value={bookingEmbedUrl}
              onChange={(event) => onBookingEmbedUrlChange(event.target.value)}
            />
            <p className="text-xs text-muted-foreground">{bookingMessages.iframeWarning}</p>
          </div>
        )}
      </section>
    </>
  );
}
