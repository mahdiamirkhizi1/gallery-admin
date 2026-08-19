export const orderStatusFa: Record<string, string> = {
  PENDING_PAYMENT: "در انتظار پرداخت",
  PARTIALLY_PAID: "بخشی پرداخت شده",
  PAID: "پرداخت شده",
  PROCESSING: "در حال آماده‌سازی",
  SHIPPED: "ارسال شده",
  COMPLETED: "تکمیل شده",
  CANCELLED: "لغو شده",
};
export const paymentStatusFa: Record<string, string> = {
  PENDING: "در انتظار ثبت رسید",
  PROCESSING: "در حال بررسی",
  SUCCESS: "تأیید شده",
  FAILED: "رد شده",
  CANCELLED: "لغو شده",
  EXPIRED: "منقضی شده",
  REFUNDED: "بازپرداخت شده",
  PARTIALLY_REFUNDED: "بخشی بازپرداخت شده",
};
export const paymentMethodFa: Record<string, string> = {
  CARD_TO_CARD: "کارت‌به‌کارت",
  ONLINE: "پرداخت آنلاین",
  CASH_ON_DELIVERY: "پرداخت در محل",
  INSTALLMENT: "اقساطی",
};
export const itemStatusFa: Record<string, string> = {
  AWAITING_PAYMENT: "در انتظار پرداخت",
  PARTIALLY_PAID: "بخشی پرداخت شده",
  RESERVED: "رزرو شده",
  PAID: "پرداخت شده",
  PROCESSING: "در حال آماده‌سازی",
  READY: "آماده تحویل",
  COMPLETED: "تکمیل شده",
  CANCELLED: "لغو شده",
  EXPIRED: "منقضی شده",
};
export const planTypeFa: Record<string, string> = {
  NORMAL: "خرید عادی",
  DISCOUNT: "خرید با تخفیف",
  RESERVE: "رزرو",
  INSTALLMENT: "خرید اقساطی",
};
export const shippingTypeFa: Record<string, string> = {
  EXPRESS: "پست پیشتاز",
  TIPAX: "تیپاکس",
  COURIER: "پیک اختصاصی",
};
