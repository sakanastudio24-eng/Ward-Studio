import { Checkbox } from "../ui/checkbox";
import { formatPrice } from "./utils";

export type AddonCard = {
  id: string;
  title: string;
  bestFor: string;
  includes: string[];
  price: number;
  checked: boolean;
  disabled?: boolean;
  disabledReason?: string;
};

export interface AddonSelectorProps {
  title: string;
  addons: AddonCard[];
  onToggle: (addonId: string, checked: boolean) => void;
  selectedNote?: string;
  selectedNoteAddonId?: string;
}

export function AddonSelector({
  title,
  addons,
  onToggle,
  selectedNote,
  selectedNoteAddonId,
}: AddonSelectorProps) {
  return (
    <section className="rounded-lg border border-border p-4 select-text">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <div className="space-y-3">
        {addons.map((addOn) => (
          <label
            key={addOn.id}
            className={`flex items-start gap-3 rounded-md border p-3 ${
              addOn.disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
            }`}
          >
            <Checkbox
              checked={addOn.checked}
              disabled={addOn.disabled}
              onCheckedChange={(checked) => onToggle(addOn.id, checked === true)}
              className="mt-0.5"
            />
            <span className="flex-1">
              <span className="block text-sm font-medium">{addOn.title}</span>
              <span className="block text-xs text-muted-foreground">Best for: {addOn.bestFor}</span>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {addOn.includes.map((item) => (
                  <li key={`${addOn.id}-${item}`}>• {item}</li>
                ))}
              </ul>
              {addOn.disabledReason && (
                <span className="mt-2 block text-xs text-orange-600">{addOn.disabledReason}</span>
              )}
              {selectedNote && selectedNoteAddonId === addOn.id && addOn.checked && (
                <span className="mt-2 block text-xs text-muted-foreground">{selectedNote}</span>
              )}
            </span>
            <span className="text-sm font-medium text-muted-foreground">+{formatPrice(addOn.price)}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
