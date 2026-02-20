import { Checkbox } from "../ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import type { ReadinessPath } from "../../../lib/rules";

export interface ReadinessGateProps {
  timelineEstimate: string;
  requiredItems: string[];
  readinessScore: number;
  readinessChecks: {
    identity: boolean;
    photos: boolean;
    bookingMethod: boolean;
  };
  readinessChecklist: {
    identity: string;
    photos: string;
    bookingMethod: string;
  };
  onReadinessCheckChange: (key: "identity" | "photos" | "bookingMethod", checked: boolean) => void;
  readinessPath: ReadinessPath;
  onReadinessPathChange: (path: ReadinessPath) => void;
  readinessPathLabels: {
    readyLabel: string;
    notReadyLabel: string;
  };
  readinessNotice: string;
  compatibilityRules: {
    cannotCombine: string[];
    stronglyRecommended: string[];
  };
  conflictErrors?: string[];
  missingRequiredItems?: string[];
}

export function ReadinessGate({
  timelineEstimate,
  requiredItems,
  readinessScore,
  readinessChecks,
  readinessChecklist,
  onReadinessCheckChange,
  readinessPath,
  onReadinessPathChange,
  readinessPathLabels,
  readinessNotice,
  compatibilityRules,
  conflictErrors = [],
  missingRequiredItems = [],
}: ReadinessGateProps) {
  return (
    <>
      <section id="readiness-meter-section" className="rounded-lg border border-border p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Requirements to Move Forward
        </h3>
        <p className="mb-3 text-sm">{timelineEstimate}</p>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {requiredItems.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-border p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Readiness Meter
        </h3>
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full bg-orange-500 transition-all" style={{ width: `${(readinessScore / 3) * 100}%` }} />
        </div>
        <p className="mb-3 text-xs text-muted-foreground">{readinessScore}/3 checklist items complete</p>

        <div className="space-y-2 rounded-md border border-border p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Readiness checklist</p>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox
              id="readiness-identity"
              checked={readinessChecks.identity}
              onCheckedChange={(checked) => onReadinessCheckChange("identity", checked === true)}
            />
            <span>{readinessChecklist.identity}</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox
              id="readiness-photos"
              checked={readinessChecks.photos}
              onCheckedChange={(checked) => onReadinessCheckChange("photos", checked === true)}
            />
            <span>{readinessChecklist.photos}</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox
              id="readiness-booking-method"
              checked={readinessChecks.bookingMethod}
              onCheckedChange={(checked) => onReadinessCheckChange("bookingMethod", checked === true)}
            />
            <span>{readinessChecklist.bookingMethod}</span>
          </label>
        </div>

        <div className="mt-3">
          <RadioGroup value={readinessPath} onValueChange={(value) => onReadinessPathChange(value as ReadinessPath)}>
            <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 text-sm">
              <RadioGroupItem value="ready_now" />
              {readinessPathLabels.readyLabel}
            </label>
            <label className="mt-2 flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 text-sm">
              <RadioGroupItem value="not_ready" />
              {readinessPathLabels.notReadyLabel}
            </label>
          </RadioGroup>
        </div>

        {readinessNotice && <p className="mt-3 text-xs text-orange-600">{readinessNotice}</p>}

        {missingRequiredItems.length > 0 && (
          <div className="mt-3 rounded-md border border-orange-300/40 bg-orange-100/30 p-3 text-xs text-orange-700">
            Missing required readiness items: {missingRequiredItems.join(", ")}.
          </div>
        )}
      </section>

      <section className="rounded-lg border border-border p-4">
        <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Add-On Compatibility Rules
        </h3>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Cannot combine:</p>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {compatibilityRules.cannotCombine.map((rule) => (
            <li key={rule}>• {rule}</li>
          ))}
        </ul>
        <p className="mb-2 mt-3 text-xs font-medium text-muted-foreground">Strongly recommended:</p>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {compatibilityRules.stronglyRecommended.map((rule) => (
            <li key={rule}>• {rule}</li>
          ))}
        </ul>

        {conflictErrors.length > 0 && (
          <div className="mt-3 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
            {conflictErrors.map((error) => (
              <p key={error}>• {error}</p>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
