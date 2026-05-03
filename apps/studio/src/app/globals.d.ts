interface Window {
  Pi?: {
    init: (config: { version: string; sandbox: boolean }) => void;
    authenticate: (
      scopes: string[],
      onIncompletePaymentFound: (payment: any) => void
    ) => Promise<{
      accessToken: string;
      user: {
        username: string;
        uid: string;
      };
    }>;
    createPayment: (
      paymentData: {
        amount: number;
        memo: string;
        metadata: Record<string, any>;
      },
      callbacks: {
        onReadyForServerApproval: (paymentId: string) => void;
        onReadyForServerCompletion: (paymentId: string, txid: string) => void;
        onCancel: (paymentId: string) => void;
        onError: (error: Error, payment?: any) => void;
      }
    ) => void;
  };
}
