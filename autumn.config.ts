import { feature, plan, item } from "atmn";

export const scans = feature({
  id: "scans",
  name: "Risk Scans",
  type: "metered",
  consumable: true,
});

export const free = plan({
  id: "free",
  name: "Free",
  autoEnable: true,
  items: [
    item({
      featureId: scans.id,
      included: 10,
      reset: { interval: "month" },
    }),
  ],
});

export const basic = plan({
  id: "basic",
  name: "Basic",
  price: { amount: 700, interval: "month" },
  items: [
    item({
      featureId: scans.id,
      included: 500,
      reset: { interval: "month" },
    }),
  ],
});

export const premium = plan({
  id: "premium",
  name: "Premium",
  price: { amount: 1100, interval: "month" },
  items: [
    item({
      featureId: scans.id,
      included: 99999,
      reset: { interval: "month" },
    }),
  ],
});

export default {
  features: [scans],
  plans: [free, basic, premium],
};
