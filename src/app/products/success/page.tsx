import type { Metadata } from "next";
import SuccessClient from "./SuccessClient";

export const metadata: Metadata = {
  title: "Payment Success | Ward Studio",
  description:
    "DetailFlow deposit payment success page with next-step onboarding instructions.",
};

export default function ProductSuccessPage() {
  return <SuccessClient />;
}
