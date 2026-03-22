import { publicEnv } from "../env.public";

const FALLBACK_CAL_LINKS = {
  detailflowSetup: "https://cal.com/zechariah-ward-dl8qoz/template-setup-configuration-call",
  inkbotPlanning: "https://cal.com/zechariah-ward-dl8qoz/automation-bot-planning-session",
  customProjectConsultation:
    "https://cal.com/zechariah-ward-dl8qoz/custom-project-consultation",
  freeStrategyFit: "https://cal.com/zechariah-ward-dl8qoz/free-strategy-fit-call",
} as const;

function normalizeCalUrl(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim() || "";
  if (!trimmed) return fallback;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return fallback;
    return parsed.toString();
  } catch {
    return fallback;
  }
}

export const CAL_LINKS = {
  detailflowSetup: normalizeCalUrl(
    publicEnv.NEXT_PUBLIC_CAL_DETAILFLOW_SETUP_URL,
    FALLBACK_CAL_LINKS.detailflowSetup,
  ),
  inkbotPlanning: normalizeCalUrl(
    publicEnv.NEXT_PUBLIC_CAL_INKBOT_PLANNING_URL,
    FALLBACK_CAL_LINKS.inkbotPlanning,
  ),
  customProjectConsultation: normalizeCalUrl(
    publicEnv.NEXT_PUBLIC_CAL_CUSTOM_PROJECT_URL,
    FALLBACK_CAL_LINKS.customProjectConsultation,
  ),
  freeStrategyFit: normalizeCalUrl(
    publicEnv.NEXT_PUBLIC_CAL_FREE_STRATEGY_URL,
    FALLBACK_CAL_LINKS.freeStrategyFit,
  ),
} as const;
