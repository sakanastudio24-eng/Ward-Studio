export const PRODUCTS = {
  detailflow: {
    product_id: "detailflow",
    order_prefix: "DF",
  },
} as const;

export type ProductId = (typeof PRODUCTS)[keyof typeof PRODUCTS]["product_id"];
