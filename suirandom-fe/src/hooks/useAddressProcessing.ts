import { useState, useEffect } from "react";
import { isValidSuiAddress, isValidSuiNSName } from "@mysten/sui/utils";
import { resolveNames } from "@/lib/helpers";
import { toast } from "sonner";

export function useAddressProcessing(addresses: string) {
  const [validAddresses, setValidAddresses] = useState<string[]>([]);
  const [suiNames, setSuiNames] = useState<string[]>([]);
  const [resolvedAddresses, setResolvedAddresses] = useState<
    Record<string, string>
  >({});
  const [isResolvingNames, setIsResolvingNames] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processAddresses = async () => {
      setIsResolvingNames(true);
      setError(null);
      try {
        const addressList = addresses
          .split(/[\n,]/) // Split by newline or comma
          .map((addr) => addr.trim())
          .filter(Boolean);

        // Check for duplicate entries in the original input
        const inputDuplicates = addressList.filter(
          (item, index) => addressList.indexOf(item) !== index
        );

        if (inputDuplicates.length > 0) {
          setError(
            `Duplicate entries detected: ${inputDuplicates.join(
              ", "
            )}. Each address or name should only be entered once.`
          );
        }

        const validSuiAddresses = addressList.filter((addr) =>
          isValidSuiAddress(addr)
        );
        const potentialSuiNames = addressList.filter((addr) =>
          isValidSuiNSName(addr)
        );

        setSuiNames(potentialSuiNames);

        // Resolve SuiNS names
        const newResolvedAddresses = await resolveNames(potentialSuiNames);
        setResolvedAddresses(newResolvedAddresses);

        // Check for duplicate addresses from different names
        const addressValues = Object.values(newResolvedAddresses);
        const duplicateAddresses = addressValues.filter(
          (addr, index) => addressValues.indexOf(addr) !== index
        );

        // Check if any resolved addresses appear in direct addresses
        const overlappingAddresses = validSuiAddresses.filter((addr) =>
          addressValues.includes(addr)
        );

        if (duplicateAddresses.length > 0 || overlappingAddresses.length > 0) {
          // Find which names resolve to duplicate addresses
          const duplicateNames: string[] = [];

          // Find names that resolve to the same address
          Object.entries(newResolvedAddresses).forEach(([name1, addr1]) => {
            Object.entries(newResolvedAddresses).forEach(([name2, addr2]) => {
              if (name1 !== name2 && addr1 === addr2) {
                if (!duplicateNames.includes(name1)) duplicateNames.push(name1);
                if (!duplicateNames.includes(name2)) duplicateNames.push(name2);
              }
            });
          });

          // Check for names that resolve to directly entered addresses
          Object.entries(newResolvedAddresses).forEach(([name, addr]) => {
            if (validSuiAddresses.includes(addr)) {
              duplicateNames.push(name);
            }
          });

          if (duplicateNames.length > 0) {
            setError(
              `Some SuiNS names resolve to the same address: ${duplicateNames.join(
                ", "
              )}. Only unique addresses will be used.`
            );
          }
        }

        // Create a unique set of addresses (removing duplicates)
        const uniqueAddresses = Array.from(
          new Set([
            ...validSuiAddresses,
            ...Object.values(newResolvedAddresses),
          ])
        );

        setValidAddresses(uniqueAddresses);
      } catch (error) {
        console.error("Error processing addresses:", error);
        toast.error("Error processing addresses");
      } finally {
        setIsResolvingNames(false);
      }
    };

    if (addresses) {
      processAddresses();
    } else {
      setValidAddresses([]);
      setSuiNames([]);
      setResolvedAddresses({});
      setError(null);
    }
  }, [addresses]);

  return {
    validAddresses,
    suiNames,
    resolvedAddresses,
    isResolvingNames,
    error,
  };
}
