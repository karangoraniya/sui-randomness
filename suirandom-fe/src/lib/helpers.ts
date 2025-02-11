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
