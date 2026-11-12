export type CreatePaymentInput = {
  amount: number;
  email?: string;
  currency?: "PHP";
};

export type PaymentProvider = {
  createPayment: (input: CreatePaymentInput) => Promise<{ redirectUrl: string }>;
};

/** MVP stub. Swap for a real gateway later (SPEC §9). */
export const stubPaymentProvider: PaymentProvider = {
  async createPayment() {
    // Gifts are given from the Parish tab, so that is where we stay.
    return { redirectUrl: "/parish" };
  },
};
