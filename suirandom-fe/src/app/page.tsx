"use client";
import React, { useState } from "react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Github, FileText, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Link from "next/link";
import {
  ConnectButton,
  useCurrentAccount,
  useSignTransaction,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { bcs } from "@mysten/sui/bcs";
import {
  validateSelection,
  shortenAddress,
  testnetClient,
} from "@/lib/helpers";
import { Winner, WinnerEvent } from "@/lib/type";
import { TokenIcons } from "@/images";
import Image from "next/image";
import { useAddressProcessing } from "@/hooks/useAddressProcessing";
import { processWinners } from "@/utils/winnerUtils";

const SuiRandom = () => {
  const [addresses, setAddresses] = useState("");
  const [digest, setDigest] = useState("");
  const [numWinners, setNumWinners] = useState("1");
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isOffChainLoading, setIsOffChainLoading] = useState(false);
  const [isOnchainLoading, setIsOnchainLoading] = useState(false);
  const [transactionError, setTransactionError] = useState<string | null>(null);

  const {
    validAddresses,
    suiNames,
    resolvedAddresses,
    isResolvingNames,
    error: addressProcessingError,
  } = useAddressProcessing(addresses);

  const isLoading = isOffChainLoading || isOnchainLoading;
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signTransaction } = useSignTransaction();

  // Display either address processing errors or transaction errors
  const displayError = addressProcessingError || transactionError;

  // Transaction functions kept in main component
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
    setTransactionError(null);

    try {
      validateSelection(parseInt(numWinners), validAddresses.length);

      const tx = buildWinnerTransaction(
        "0x75826853aa5e656121619e8510893665a40e2bbf14e2e502746fbd3c83bc5130"
      );
      const builtTx = await tx.build({ client: testnetClient });
      const response = await testnetClient.dryRunTransactionBlock({
        transactionBlock: builtTx,
      });

      if (response.events?.[0]) {
        const processedWinners = processWinners(
          response.events[0] as WinnerEvent,
          resolvedAddresses
        );
        if (processedWinners) {
          setWinners(processedWinners);
          toast.success("Winners selected successfully!");
        } else {
          throw new Error("Failed to process winners");
        }
      } else {
        throw new Error("No winner data in response");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to select winners";
      setTransactionError(errorMessage);
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
    setTransactionError(null);

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

      if (executeResult.events?.[0]) {
        const processedWinners = processWinners(
          executeResult.events[0] as WinnerEvent,
          resolvedAddresses
        );
        if (processedWinners) {
          setWinners(processedWinners);
          toast.success("Winners selected on-chain successfully!");
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to select winners";
      setTransactionError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsOnchainLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <header className="flex items-center justify-center gap-3 mb-8">
          <Image
            src={TokenIcons.SUI}
            alt="SUI"
            width={40}
            height={40}
            className="inline-block rounded-full"
          />
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
            Sui On-Chain Randomness
          </h1>
        </header>

        <Card className="bg-slate-900/60 border-slate-800 backdrop-blur-sm rounded-xl">
          <CardHeader className="relative pb-2">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-2xl text-white">
                  Winner Selection
                </CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  Enter Sui wallet addresses or SuiNS names (one per line or
                  comma-separated). Minimum 2 addresses required.
                </CardDescription>
              </div>

              {/* Connect Button positioned at top right */}
              <div className="md:self-start">
                <ConnectButton connectText="Connect Wallet" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {displayError && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>{displayError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="addresses"
                  className="text-sm font-medium text-slate-300"
                >
                  Addresses/Names
                </Label>
                <Badge
                  variant="outline"
                  className="text-xs font-normal text-slate-400 border-slate-700 rounded-full"
                >
                  Valid addresses: {validAddresses.length} / Total entries:{" "}
                  {addresses.split(/[\n,]/).filter(Boolean).length}
                </Badge>
              </div>
              <Textarea
                id="addresses"
                placeholder="Enter Sui addresses or SuiNS names (one per line or comma-separated)"
                value={addresses}
                onChange={(e) => setAddresses(e.target.value)}
                className="min-h-[150px] bg-slate-950 border-slate-800 placeholder:text-slate-600 rounded-xl"
                disabled={isLoading}
              />
              <div className="space-y-1">
                {suiNames.length > 0 && (
                  <p className="text-xs text-slate-500">
                    SuiNS names: {suiNames.length}{" "}
                    {isResolvingNames && "(Resolving...)"}
                    {!isResolvingNames &&
                      `(Resolved: ${Object.keys(resolvedAddresses).length})`}
                  </p>
                )}
                {!isResolvingNames &&
                  Object.keys(resolvedAddresses).length > 0 && (
                    <div className="mt-2 p-3 bg-slate-800/40 rounded-xl border border-slate-700 text-xs">
                      <p className="text-slate-300 mb-2 font-medium">
                        Resolved SuiNS Names:
                      </p>
                      <div className="space-y-1 max-h-28 overflow-y-auto">
                        {Object.entries(resolvedAddresses).map(
                          ([name, address], index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between"
                            >
                              <span className="text-blue-400">{name}</span>
                              <span className="text-slate-400">
                                {shortenAddress(address)}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="numWinners"
                className="text-sm font-medium text-slate-300"
              >
                Number of Winners
              </Label>
              <Input
                id="numWinners"
                type="number"
                min="1"
                max={Math.min(validAddresses.length, 100)}
                value={numWinners}
                onChange={(e) => setNumWinners(e.target.value)}
                className="max-w-32 bg-slate-950 border-slate-800 rounded-xl"
                disabled={isLoading}
              />
            </div>

            {/* Winners Display Section */}
            {winners.length > 0 && (
              <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
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
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border-slate-700 rounded-xl"
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
                      className="flex items-center justify-between p-3 bg-slate-800 rounded-xl"
                    >
                      <div className="flex-1">
                        {winner.name ? (
                          <>
                            <p className="font-mono text-blue-400">
                              {winner.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {shortenAddress(winner.address)}
                            </p>
                          </>
                        ) : (
                          <p className="font-mono text-sm">
                            {shortenAddress(winner.address)}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">
                        Winner #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transaction Hash Display */}
            {digest && (
              <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Transaction Details</h3>
                  <Link
                    href={`https://testnet.suivision.xyz/txblock/${digest}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm flex items-center gap-2 text-blue-400 hover:text-blue-300"
                  >
                    View on Explorer
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
                <p className="mt-2 font-mono text-sm break-all text-slate-300">
                  {digest}
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex gap-4 flex-wrap">
            <Button
              onClick={selectWinnersOffChain}
              variant="outline"
              className="flex-1 bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200 rounded-xl"
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
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
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
          </CardFooter>
        </Card>

        <footer className="text-center mt-8 pb-4 space-y-4">
          <div className="flex justify-center items-center gap-6">
            <Link
              href="https://docs.sui.io/guides/developer/advanced/randomness-onchain"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors text-slate-400 hover:text-white"
              title="View Documentation"
            >
              <FileText className="w-5 h-5" />
            </Link>
            <Link
              href="https://github.com/karangoraniya/sui-randomness"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors text-slate-400 hover:text-white"
            >
              <Github className="w-5 h-5" />
            </Link>
            <Link
              href="https://twitter.com/GORANIAKARAN"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 transition-colors text-slate-400 hover:text-white"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default SuiRandom;
