export const PRODUCTS = {
  detailflow: {
    product_id: "detailflow",
    order_prefix: "DF",
  },
  inkbot: {
    product_id: "inkbot",
    order_prefix: "IB",
  },
} as const;

export type ProductId = (typeof PRODUCTS)[keyof typeof PRODUCTS]["product_id"];
