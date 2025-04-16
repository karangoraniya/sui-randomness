import { clsx, type ClassValue } from "clsx";
import { WinnerEvent, Winner } from "@/lib/type";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function processWinners(
  winnerEvent: WinnerEvent,
  resolvedAddresses: Record<string, string>
): Winner[] | null {
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

    return selectedWinners;
  }
  return null;
}
