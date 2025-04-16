// utils/winnerUtils.ts

import { WinnerEvent, Winner } from "@/lib/type";

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
