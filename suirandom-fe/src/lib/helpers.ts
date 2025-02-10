import { SuiClient } from "@mysten/sui/client";

const client = new SuiClient({ url: "https://rpc-mainnet.suiscan.xyz" });

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
