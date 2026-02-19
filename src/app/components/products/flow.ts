export type CheckoutPrimaryState =
  | "idle"
  | "selecting"
  | "checkout_started"
  | "redirecting_to_stripe"
  | "return_success_loading"
  | "payment_confirmed"
  | "payment_failed"
  | "verification_error";

export type CheckoutInteractionState =
  | "booking_clicked"
  | "booking_confirmed"
  | "email_sent_shown"
  | "copy_config_clicked"
  | "support_clicked"
  | "resend_clicked";

export type CheckoutFlowContext = {
  primaryState: CheckoutPrimaryState;
  interactions: Partial<Record<CheckoutInteractionState, boolean>>;
  lastInteraction: CheckoutInteractionState | null;
  orderId: string;
  errorMessage: string;
  transitionLocked: boolean;
};

export type CheckoutFlowAction =
  | { type: "RESET" }
  | { type: "OPEN_DRAWER" }
  | { type: "START_CHECKOUT" }
  | { type: "REDIRECT_TO_STRIPE" }
  | { type: "START_RETURN_CONFIRM" }
  | { type: "PAYMENT_CONFIRMED"; orderId: string }
  | { type: "PAYMENT_FAILED"; errorMessage: string }
  | { type: "VERIFICATION_ERROR"; errorMessage: string }
  | { type: "RETRY_VERIFICATION" }
  | { type: "MARK_INTERACTION"; interaction: CheckoutInteractionState }
  | { type: "SET_TRANSITION_LOCK"; locked: boolean };

export const initialCheckoutFlowContext: CheckoutFlowContext = {
  primaryState: "idle",
  interactions: {},
  lastInteraction: null,
  orderId: "",
  errorMessage: "",
  transitionLocked: false,
};

export function checkoutFlowReducer(
  state: CheckoutFlowContext,
  action: CheckoutFlowAction,
): CheckoutFlowContext {
  switch (action.type) {
    case "RESET":
      return {
        ...initialCheckoutFlowContext,
      };
    case "OPEN_DRAWER":
      return {
        ...state,
        primaryState: "selecting",
        errorMessage: "",
      };
    case "START_CHECKOUT":
      return {
        ...state,
        primaryState: "checkout_started",
        errorMessage: "",
        transitionLocked: true,
      };
    case "REDIRECT_TO_STRIPE":
      return {
        ...state,
        primaryState: "redirecting_to_stripe",
        transitionLocked: true,
      };
    case "START_RETURN_CONFIRM":
      return {
        ...state,
        primaryState: "return_success_loading",
        transitionLocked: true,
        errorMessage: "",
      };
    case "PAYMENT_CONFIRMED":
      return {
        ...state,
        primaryState: "payment_confirmed",
        orderId: action.orderId,
        transitionLocked: false,
        errorMessage: "",
      };
    case "PAYMENT_FAILED":
      return {
        ...state,
        primaryState: "payment_failed",
        transitionLocked: false,
        errorMessage: action.errorMessage,
      };
    case "VERIFICATION_ERROR":
      return {
        ...state,
        primaryState: "verification_error",
        transitionLocked: false,
        errorMessage: action.errorMessage,
      };
    case "RETRY_VERIFICATION":
      return {
        ...state,
        primaryState: "return_success_loading",
        transitionLocked: true,
        errorMessage: "",
      };
    case "MARK_INTERACTION":
      return {
        ...state,
        interactions: {
          ...state.interactions,
          [action.interaction]: true,
        },
        lastInteraction: action.interaction,
      };
    case "SET_TRANSITION_LOCK":
      return {
        ...state,
        transitionLocked: action.locked,
      };
    default:
      return state;
  }
}
