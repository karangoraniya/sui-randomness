import { ThemeVars } from "@mysten/dapp-kit";
import { SuiClient } from "@mysten/sui/client";

const client = new SuiClient({ url: "https://rpc-mainnet.suiscan.xyz" });
export const testnetClient = new SuiClient({
  url: "https://rpc-testnet.suiscan.xyz",
});

export const resolveNames = async (names: string[]) => {
  const resolved: Record<string, string> = {};
  for (const name of names) {
    try {
      const response = await client.resolveNameServiceAddress({
        name: name,
      });
      if (response) {
        resolved[name] = response;
      }
    } catch (error) {
      console.error(`Failed to resolve name: ${name}`, error);
    }
  }
  return resolved;
};

// Validate number of winners
const validateWinnerCount = (
  count: number,
  totalAddresses: number
): boolean => {
  return count > 0 && count <= totalAddresses && count <= 100;
};

// Shared validation function
export const validateSelection = (numWinners: number, addressCount: number) => {
  if (!validateWinnerCount(numWinners, addressCount)) {
    throw new Error(
      "Invalid number of winners. Must be between 1 and total addresses, max 100."
    );
  }

  if (addressCount < 2) {
    throw new Error("Need at least 2 valid addresses to select winners.");
  }
};

// Helper function to shorten addresses
export const shortenAddress = (address: string) => {
  if (!address) return "";
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

//theme helpers

export const darkTheme: ThemeVars = {
  blurs: {
    modalOverlay: "16px",
  },
  backgroundColors: {
    primaryButton: "#3B82F6",
    primaryButtonHover: "#2563EB",
    outlineButtonHover: "rgba(59, 130, 246, 0.1)",
    walletItemHover: "rgba(255, 255, 255, 0.1)",
    walletItemSelected: "rgba(59, 130, 246, 0.2)",
    modalOverlay: "rgba(0, 0, 0, 0.8)",
    modalPrimary: "#1F2937",
    modalSecondary: "#374151",
    iconButton: "transparent",
    iconButtonHover: "rgba(255, 255, 255, 0.1)",
    dropdownMenu: "#1F2937",
    dropdownMenuSeparator: "#374151",
  },
  borderColors: {
    outlineButton: "#4B5563",
  },
  colors: {
    primaryButton: "#FFFFFF",
    outlineButton: "#D1D5DB",
    body: "#F9FAFB",
    bodyMuted: "#9CA3AF",
    bodyDanger: "#EF4444",
    iconButton: "#9CA3AF",
  },
  radii: {
    small: "4px",
    medium: "8px",
    large: "12px",
    xlarge: "16px",
  },
  shadows: {
    primaryButton: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    walletItemSelected: "0 0 0 2px #3B82F6",
  },
  fontWeights: {
    normal: "400",
    medium: "500",
    bold: "600",
  },
  fontSizes: {
    small: "14px",
    medium: "16px",
    large: "18px",
    xlarge: "20px",
  },
  typography: {
    fontFamily: "Inter, sans-serif",
    fontStyle: "normal",
    lineHeight: "1.5",
    letterSpacing: "normal",
  },
};
