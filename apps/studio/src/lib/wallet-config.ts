
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, polygon, arbitrum, optimism, base } from 'wagmi/chains';

// Get WalletConnect Project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ||
                  process.env.NEXT_PUBLIC_REOWN_PROJECT_ID ||
                  'da5be88025eba75c383463a8030f4de4'; // Fallback to known working ID

export const wagmiConfig = getDefaultConfig({
  appName: 'AIX Studio',
  projectId,
  chains: [
    mainnet,
    sepolia,    // Testnet
    polygon,    // L2 for cheaper transactions
    arbitrum,   // L2
    optimism,   // L2
    base,       // Coinbase L2
  ],
  ssr: true, // Enable server-side rendering support
});

// Export as both names for compatibility
export const config = wagmiConfig;
