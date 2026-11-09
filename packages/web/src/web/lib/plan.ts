import { useQuery } from "@tanstack/react-query";
import { useCustomer } from "autumn-js/react";
import { api } from "./api";

export type BillingOverride = { isAdmin: boolean; planId: string | null };

/**
 * The effective plan for the signed-in account.
 *
 * Autumn stays authoritative for paying customers. Allowlisted staff accounts
 * are reported by `GET /api/billing/me` so the grant lives on the server
 * instead of being hard-coded into client-visible code.
 */
export function useEffectivePlan() {
  const { data: customer } = useCustomer();

  const { data: override } = useQuery({
    queryKey: ["billing", "me"],
    queryFn: async (): Promise<BillingOverride> => {
      try {
        const res = await api.billing.me.$get();
        if (!res.ok) return { isAdmin: false, planId: null };
        return (await res.json()) as BillingOverride;
      } catch {
        // An older API deployment without this route must not break the page;
        // callers simply fall back to the Autumn plan.
        return { isAdmin: false, planId: null };
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const isAdmin = override?.isAdmin === true;
  const autumnPlan = customer?.subscriptions?.[0]?.planId ?? "free";
  const planId = isAdmin ? (override?.planId ?? "premium") : autumnPlan;

  return { planId, isAdmin, customer };
}
