interface Window {
  Pi?: {
    init: (config: { version: string; sandbox: boolean }) => void;
    authenticate: (scopes: string[], onIncompletePaymentFound: (payment: any) => void) => Promise<{ user: { username: string; uid: string } }>;
  };
}
