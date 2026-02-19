"use client";

import { useMemo, useState } from "react";
import { getTooltipMessage } from "../HoverTooltip";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import {
  CheckoutDrawer,
  type DetailflowAddonConfig,
  type GeneratedDetailflowConfig,
} from "./CheckoutDrawer";
import { formatPrice } from "./utils";

export type { DetailflowStep } from "./CheckoutDrawer";
export type {
  DetailflowPackageId,
  DetailflowPackagePreset,
  DetailflowGeneralAddOn,
  DetailflowReadinessAddOn,
  DetailflowAddonConfig,
  GeneratedDetailflowConfig,
} from "./CheckoutDrawer";
export type { BookingMode, ReadinessPath } from "../../../lib/rules";

export type ManagementMode = "self-managed" | "ward-managed";
export type ProductDrawerVariant = "simple" | "detailflow-pro";

export type PricedOption = {
  id: string;
  label: string;
  price: number;
  description?: string;
};

export type ProductPricingConfig = {
  productKey: "inkbot" | "detailflow";
  subtitle: string;
  basePrice: number;
  baseLabel?: string;
  optionsHeading: string;
  optionsHint?: string;
  options: PricedOption[];
  managementOptions: Array<PricedOption & { id: ManagementMode }>;
  bundledOptionId?: string;
};

export interface ProductPurchaseDrawerProps {
  productName: string;
  config: ProductPricingConfig | DetailflowAddonConfig;
  triggerLabel?: string;
  variant?: ProductDrawerVariant;
  setTooltipText?: (text: string) => void;
  onGenerateConfig?: (config: GeneratedDetailflowConfig) => void;
}

function isManagementMode(value: string): value is ManagementMode {
  return value === "self-managed" || value === "ward-managed";
}

function isDetailflowAddonConfig(
  config: ProductPricingConfig | DetailflowAddonConfig,
): config is DetailflowAddonConfig {
  return "pricing" in config;
}

function ProductPurchaseDrawerSimple({
  productName,
  config,
  triggerLabel = "Purchase",
  setTooltipText,
}: {
  productName: string;
  config: ProductPricingConfig;
  triggerLabel?: string;
  setTooltipText?: (text: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAfterPurchaseOpen, setIsAfterPurchaseOpen] = useState(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [managementMode, setManagementMode] = useState<ManagementMode>("self-managed");

  const optionMap = useMemo(
    () => new Map(config.options.map((option) => [option.id, option])),
    [config.options],
  );

  const managementOptionMap = useMemo(
    () => new Map(config.managementOptions.map((option) => [option.id, option])),
    [config.managementOptions],
  );

  const bundledSelected = Boolean(
    config.bundledOptionId && selectedOptionIds.includes(config.bundledOptionId),
  );

  const effectiveSelectedOptionIds = useMemo(() => {
    if (!config.bundledOptionId) return selectedOptionIds;
    if (!selectedOptionIds.includes(config.bundledOptionId)) return selectedOptionIds;
    return [config.bundledOptionId];
  }, [config.bundledOptionId, selectedOptionIds]);

  const selectedOptions = useMemo(
    () =>
      effectiveSelectedOptionIds
        .map((id) => optionMap.get(id))
        .filter((value): value is PricedOption => Boolean(value)),
    [effectiveSelectedOptionIds, optionMap],
  );

  const optionsSubtotal = useMemo(
    () => selectedOptions.reduce((sum, option) => sum + option.price, 0),
    [selectedOptions],
  );

  const managementSelection = managementOptionMap.get(managementMode);
  const managementPrice = managementSelection?.price ?? 0;
  const total = config.basePrice + optionsSubtotal + managementPrice;

  function resetToDefaults() {
    setIsAfterPurchaseOpen(false);
    setSelectedOptionIds([]);
    setManagementMode("self-managed");
  }

  function handleOpenChange(open: boolean) {
    setIsOpen(open);
    if (open) {
      resetToDefaults();
    }
  }

  function handlePurchaseClick() {
    setIsOpen(false);
    setIsAfterPurchaseOpen(true);
  }

  function handleOptionToggle(optionId: string, checked: boolean) {
    const bundledId = config.bundledOptionId;
    if (bundledId && optionId === bundledId) {
      setSelectedOptionIds(checked ? [bundledId] : []);
      return;
    }
    if (bundledId && selectedOptionIds.includes(bundledId)) {
      return;
    }
    setSelectedOptionIds((prev) => {
      if (checked) {
        if (prev.includes(optionId)) return prev;
        return [...prev, optionId];
      }
      return prev.filter((id) => id !== optionId);
    });
  }

  function handleManagementChange(value: string) {
    if (!isManagementMode(value)) return;
    setManagementMode(value);
  }

  return (
    <>
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerTrigger asChild>
          <Button
            className="bg-orange-500 text-white hover:bg-orange-600"
            onMouseEnter={() => setTooltipText?.(getTooltipMessage(triggerLabel))}
            onMouseLeave={() => setTooltipText?.("")}
          >
            {triggerLabel}
          </Button>
        </DrawerTrigger>

        <DrawerContent className="mx-auto w-full max-w-3xl">
          <>
            <DrawerHeader className="pb-2">
              <DrawerTitle className="text-xl">{productName}</DrawerTitle>
              <DrawerDescription>{config.subtitle}</DrawerDescription>
            </DrawerHeader>

            <div className="space-y-5 overflow-y-auto px-4 pb-2">
              <section className="rounded-lg border border-border p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {config.optionsHeading}
                </h3>
                {config.optionsHint && (
                  <p className="mb-3 text-sm text-muted-foreground">{config.optionsHint}</p>
                )}
                <div className="space-y-3">
                  {config.options.map((option) => {
                    const isSelected = selectedOptionIds.includes(option.id);
                    const isDisabled = bundledSelected && config.bundledOptionId !== option.id;

                    return (
                      <label
                        key={option.id}
                        className="flex cursor-pointer items-start gap-3 rounded-md border border-border p-3"
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={isDisabled}
                          onCheckedChange={(checked) =>
                            handleOptionToggle(option.id, checked === true)
                          }
                          className="mt-0.5"
                        />
                        <span className="flex-1">
                          <span className="block text-sm font-medium">{option.label}</span>
                          {option.description && (
                            <span className="block text-xs text-muted-foreground">
                              {option.description}
                            </span>
                          )}
                        </span>
                        <span className="text-sm font-medium text-muted-foreground">
                          +{formatPrice(option.price)}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {bundledSelected && config.bundledOptionId && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Full Setup already bundles major build phases.
                  </p>
                )}
              </section>

              <section className="rounded-lg border border-border p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Management Mode
                </h3>
                <RadioGroup value={managementMode} onValueChange={handleManagementChange}>
                  {config.managementOptions.map((option) => (
                    <label
                      key={option.id}
                      className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3"
                    >
                      <RadioGroupItem value={option.id} />
                      <span className="flex-1 text-sm font-medium">{option.label}</span>
                      <span className="text-sm text-muted-foreground">
                        +{formatPrice(option.price)}
                      </span>
                    </label>
                  ))}
                </RadioGroup>
              </section>

              <section className="rounded-lg border border-border p-4">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Pricing
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>{config.baseLabel || "Base package"}</span>
                    <span>{formatPrice(config.basePrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Selected add-ons</span>
                    <span>{formatPrice(optionsSubtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Management</span>
                    <span>{formatPrice(managementPrice)}</span>
                  </div>
                  <div className="border-t border-border pt-2 text-base font-semibold">
                    <div className="flex items-center justify-between">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            <DrawerFooter>
              <Button
                className="bg-orange-500 text-white hover:bg-orange-600"
                onClick={handlePurchaseClick}
              >
                {triggerLabel}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline">Cancel</Button>
              </DrawerClose>
            </DrawerFooter>
          </>
        </DrawerContent>
      </Drawer>

      <Drawer direction="right" open={isAfterPurchaseOpen} onOpenChange={setIsAfterPurchaseOpen}>
        <DrawerContent className="h-full w-full sm:max-w-[40rem]">
          <DrawerHeader>
            <DrawerTitle className="text-xl">Purchase request prepared</DrawerTitle>
            <DrawerDescription>Confirmed configuration for {productName}.</DrawerDescription>
          </DrawerHeader>

          <div className="space-y-4 overflow-y-auto px-4 pb-2">
            <section className="rounded-lg border border-border p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Selected Options
              </h3>
              {selectedOptions.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {selectedOptions.map((option) => (
                    <li key={option.id} className="flex items-center justify-between">
                      <span>{option.label}</span>
                      <span>+{formatPrice(option.price)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No add-ons selected.</p>
              )}
            </section>

            <section className="rounded-lg border border-border p-4">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Management Mode
              </h3>
              <div className="flex items-center justify-between text-sm">
                <span>{managementSelection?.label || "Self-managed"}</span>
                <span>+{formatPrice(managementPrice)}</span>
              </div>
            </section>

            <section className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </section>
          </div>

          <DrawerFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAfterPurchaseOpen(false);
                setIsOpen(true);
              }}
            >
              Start new purchase
            </Button>
            <DrawerClose asChild>
              <Button className="bg-orange-500 text-white hover:bg-orange-600">Done</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export function ProductPurchaseDrawer({
  productName,
  config,
  triggerLabel = "Purchase",
  variant = "simple",
  setTooltipText,
  onGenerateConfig,
}: ProductPurchaseDrawerProps) {
  if (variant === "detailflow-pro" && isDetailflowAddonConfig(config)) {
    return (
      <CheckoutDrawer
        productName={productName}
        config={config}
        triggerLabel={triggerLabel}
        setTooltipText={setTooltipText}
        onGenerateConfig={onGenerateConfig}
      />
    );
  }

  return (
    <ProductPurchaseDrawerSimple
      productName={productName}
      config={config as ProductPricingConfig}
      triggerLabel={triggerLabel}
      setTooltipText={setTooltipText}
    />
  );
}
