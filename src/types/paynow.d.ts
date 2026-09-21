declare module "paynow" {
  export class Payment {
    add(title: string, amount: number): Payment;
  }

  export interface InitResponse {
    success: boolean;
    redirectUrl: string;
    pollUrl: string;
    error?: string;
    instructions?: string;
  }

  export interface StatusResponse {
    paid: boolean;
    status: string;
    amount?: number;
    reference?: string;
    paynowReference?: string;
  }

  export class Paynow {
    constructor(integrationId: string, integrationKey: string);
    resultUrl: string;
    returnUrl: string;
    createPayment(reference: string, authEmail?: string): Payment;
    send(payment: Payment): Promise<InitResponse>;
    sendMobile(
      payment: Payment,
      phone: string,
      method: string
    ): Promise<InitResponse>;
    pollTransaction(pollUrl: string): Promise<StatusResponse>;
  }
}
