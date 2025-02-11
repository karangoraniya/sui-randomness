"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Github, FileText } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import {
  ConnectButton,
  useCurrentAccount,
  useSignTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";
import { isValidSuiAddress, isValidSuiNSName } from "@mysten/sui/utils";
import {
  resolveNames,
  shortenAddress,
  testnetClient,
  validateSelection,
} from "@/lib/helpers";
import { Winner, WinnerEvent } from "@/lib/type";
import { TokenIcons } from "@/images";
import Image from "next/image";

const SuiRandom = () => {
  // State management
  const [addresses, setAddresses] = useState("");
  const [digest, setDigest] = useState("");
  const [numWinners, setNumWinners] = useState("1");
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isOffChainLoading, setIsOffChainLoading] = useState(false);
  const [isOnchainLoading, setIsOnchainLoading] = useState(false);
  const isLoading = isOffChainLoading || isOnchainLoading;
  const [error, setError] = useState<string | null>(null);
  const [validAddresses, setValidAddresses] = useState<string[]>([]);
  const [suiNames, setSuiNames] = useState<string[]>([]);
  const [resolvedAddresses, setResolvedAddresses] = useState<
    Record<string, string>
  >({});
  const [isResolvingNames, setIsResolvingNames] = useState(false);

  const currentAccount = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();

  // Process addresses and resolve SuiNS names
  useEffect(() => {
    const processAddresses = async () => {
      setIsResolvingNames(true);
      try {
        const addressList = addresses
          .split(/[\n,]/) // Split by newline or comma
          .map((addr) => addr.trim())
          .filter(Boolean);

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

        // Combine direct addresses and resolved addresses
        const allValidAddresses = [
          ...validSuiAddresses,
          ...Object.values(newResolvedAddresses),
        ];

        setValidAddresses(allValidAddresses);
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
    }
  }, [addresses]);

  // Shared function to process winners
  const processWinners = (winnerEvent: WinnerEvent) => {
    if (winnerEvent.parsedJson?.winners) {
      const selectedWinners = winnerEvent.parsedJson.winners.map(
        (address: string) => ({
          address,
          timestamp: Date.now(),
          name: Object.entries(resolvedAddresses).find(
            ([, resolvedAddr]) => resolvedAddr === address
          )?.[0],
        })
      );

      setWinners(selectedWinners);
      return true;
    }
    return false;
  };

  // Shared transaction builder
  const buildWinnerTransaction = (senderAddress: string) => {
    const tx = new Transaction();
    tx.setSender(senderAddress);
    tx.moveCall({
      target:
        "0xde6dde8c563f08a62410e1702a3138ecbded82dc6e61dc24ba8490fff970ea09::sui_random::select_winners",
      arguments: [
        tx.pure(bcs.vector(bcs.Address).serialize(validAddresses)),
        tx.pure.u64(parseInt(numWinners)),
        tx.object("0x8"),
      ],
    });
    return tx;
  };

  // Select winners off-chain using dry run
  const selectWinnersOffChain = async () => {
    setIsOffChainLoading(true);
    setError(null);

    try {
      validateSelection(parseInt(numWinners), validAddresses.length);

      const tx = buildWinnerTransaction(
        "0x75826853aa5e656121619e8510893665a40e2bbf14e2e502746fbd3c83bc5130"
      ); // for dry run static address added
      const builtTx = await tx.build({ client: testnetClient });
      const response = await testnetClient.dryRunTransactionBlock({
        transactionBlock: builtTx,
      });

      if (
        response.events?.[0] &&
        processWinners(response.events[0] as WinnerEvent)
      ) {
        toast.success("Winners selected successfully!");
      } else {
        throw new Error("No winner data in response");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to select winners";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsOffChainLoading(false);
    }
  };

  const selectWinnersOnchain = async () => {
    if (!currentAccount) {
      toast.error("Please connect your wallet first");
      return;
    }

    setIsOnchainLoading(true);
    setError(null);

    try {
      validateSelection(parseInt(numWinners), validAddresses.length);

      const tx = buildWinnerTransaction(currentAccount.address);

      const { bytes, signature, reportTransactionEffects } =
        await signTransaction({
          transaction: tx,
          chain: "sui:testnet",
        });

      const executeResult = await testnetClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          showEffects: true,
          showEvents: true,
          showRawEffects: true,
        },
      });

      reportTransactionEffects(JSON.stringify(executeResult.rawEffects!));
      setDigest(executeResult.digest);
      if (
        executeResult.events?.[0] &&
        processWinners(executeResult.events[0] as WinnerEvent)
      ) {
        toast.success("Winners selected on-chain successfully!");
      }

      console.log(executeResult.events);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to select winners";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsOnchainLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4">
      <h1 className="text-4xl font-bold text-center mb-8 flex items-center justify-center gap-2">
        <Image
          src={TokenIcons.SUI}
          alt="SUI"
          width={40}
          height={40}
          className="inline-block"
        />
        Sui On-Chain Randomness
      </h1>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Winner Selection</CardTitle>
          <CardDescription>
            Enter Sui wallet addresses or SuiNS names (one per line or
            comma-separated). Minimum 2 addresses required.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="addresses">Addresses/Names</Label>
            <Textarea
              id="addresses"
              placeholder="Enter Sui addresses or SuiNS names (one per line or comma-separated)"
              value={addresses}
              onChange={(e) => setAddresses(e.target.value)}
              className="min-h-32"
              disabled={isLoading}
            />
            <div className="space-y-1">
              <p className="text-sm">
                Valid addresses: {validAddresses.length} / Total entries:{" "}
                {addresses.split(/[\n,]/).filter(Boolean).length}
              </p>
              {suiNames.length > 0 && (
                <p className="text-sm ">
                  SuiNS names: {suiNames.length}{" "}
                  {isResolvingNames && "(Resolving...)"}
                  {!isResolvingNames &&
                    `(Resolved: ${Object.keys(resolvedAddresses).length})`}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="numWinners">Number of Winners</Label>
            <Input
              id="numWinners"
              type="number"
              min="1"
              max={Math.min(validAddresses.length, 100)}
              value={numWinners}
              onChange={(e) => setNumWinners(e.target.value)}
              className="max-w-32"
              disabled={isLoading}
            />
          </div>

          {winners.length > 0 && (
            <div className="space-y-4">
              <div className="border rounded-lg p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Selected Winners 🎉</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const text = winners
                        .map((w) => `👑 ${w.name || shortenAddress(w.address)}`)
                        .join("\n");
                      const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                        `🎉 Random Winner Selected!\n\n${text}\n\n⚡️ Powered by @SuiNetwork\n#Sui #SuiNetwork`
                      )}`;
                      window.open(url, "_blank");
                    }}
                    className="flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share Results
                  </Button>
                </div>
                <div className="space-y-3">
                  {winners.map((winner, index) => (
                    <div
                      key={index}
                      className="flex items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-mono text-sm">
                          {winner.name ? (
                            <span className="text-blue-600">{winner.name}</span>
                          ) : (
                            shortenAddress(winner.address)
                          )}
                        </p>
                        {winner.name && (
                          <p className="text-xs text-gray-500 mt-1">
                            {shortenAddress(winner.address)}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        Winner #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Transaction Hash Display */}
          {digest && (
            <div className="mt-4 p-4  rounded-lg">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Transaction Details</h3>
                <Link
                  href={`https://explorer.polymedia.app/txblock/${digest}?network=testnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm flex items-center gap-2"
                >
                  View on Explorer
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </Link>
              </div>
              <p className="mt-2 font-mono text-sm break-all">{digest}</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex gap-4 flex-wrap">
          <Button
            onClick={selectWinnersOffChain}
            variant="default"
            disabled={
              isOffChainLoading ||
              isOnchainLoading ||
              validAddresses.length < 2 ||
              isResolvingNames
            }
          >
            {isOffChainLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Selecting Off-chain...
              </>
            ) : (
              "Dry Run"
            )}
          </Button>

          <Button
            onClick={selectWinnersOnchain}
            variant="default"
            disabled={
              isOnchainLoading ||
              isOffChainLoading ||
              validAddresses.length < 2 ||
              !currentAccount ||
              isResolvingNames
            }
          >
            {isOnchainLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Selecting On-chain...
              </>
            ) : (
              "Draw"
            )}
          </Button>

          <ConnectButton connectText="Connect Wallet" />
        </CardFooter>
      </Card>

      <footer className="text-center mt-8 pb-4 space-y-4">
        <div className="flex justify-center items-center gap-6">
          {/* Documentation Link */}
          <Link
            href="https://docs.sui.io/guides/developer/advanced/randomness-onchain"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors "
            title="View Documentation"
          >
            <FileText className="w-5 h-5" color="white" />
          </Link>
          <Link
            href="https://github.com/karangoraniya/sui-random-winner"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors"
          >
            <Github color="white" className="w-5 h-5" />
          </Link>
          <Link
            href="https://twitter.com/GORANIAKARAN"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 transition-colors"
          >
            <svg
              color="white"
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </Link>
        </div>
      </footer>
    </div>
  );
};

export default SuiRandom;
