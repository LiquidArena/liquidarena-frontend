import { BattleDetails } from "@/hooks/use-battle-contract";
import { ZERO_ADDRESS } from "@/lib/contracts";

import { BattleStatus, LPPosition, WinnerInfo } from "./types";

export function getDurationLeft(battle: BattleDetails): {
  secondsLeft: number;
  isOngoing: boolean;
  isEnded: boolean;
} {
  const now = Math.floor(Date.now() / 1000);
  const endTime = battle.startTime + battle.duration;
  const secondsLeft = endTime - now;

  return {
    secondsLeft: Math.max(secondsLeft, 0),
    isOngoing: secondsLeft > 0,
    isEnded: secondsLeft <= 0,
  };
}

export function calculateRequiredStakeValue(usdValue?: string): number {
  if (!usdValue) return 0;

  const rawValue = parseFloat(usdValue);
  const divisors = [1, 1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24, 1e27, 1e30];

  for (const divisor of divisors) {
    const testValue = rawValue / divisor;
    if (testValue >= 0.1 && testValue <= 10) {
      return testValue;
    }
  }

  // Fallback to 1e30 divisor if no suitable divisor found
  return rawValue / 1e30;
}

export function calculateToleranceRange(
  requiredStakeValue: number,
  tolerance: number = 0.05,
) {
  const minValue = requiredStakeValue * (1 - tolerance);
  const maxValue = requiredStakeValue * (1 + tolerance);
  return { minValue, maxValue };
}

export function getPositionCompatibility(
  usdValue: number,
  minValue: number,
  maxValue: number,
): boolean {
  return usdValue >= minValue && usdValue <= maxValue;
}

export function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getBattleStatus(
  battleDetails: BattleDetails | undefined,
  isBattleLoading: boolean,
  battleError: any,
  address: string | undefined,
): BattleStatus {
  const invalidBattleArena =
    battleDetails?.creator === ZERO_ADDRESS &&
    battleDetails?.creatorTokenId === "0";

  if (isBattleLoading) return "loading";
  if (battleError || !battleDetails || invalidBattleArena) return "notFound";

  const isHost = battleDetails.creator === address;
  const hasOpponent =
    battleDetails.opponent !== "0x0000000000000000000000000000000000000000";
  const isResolved = battleDetails.isResolved;

  if (isResolved) {
    return "ended";
  }

  if (!hasOpponent) {
    return isHost ? "waitingForOpponent" : "selectingPosition";
  }

  // Battle has opponent, check if it's ongoing or ready to resolve
  const durationInfo = getDurationLeft(battleDetails);

  if (
    durationInfo.isEnded ||
    !battleDetails.creatorInRange ||
    !battleDetails.opponentInRange
  ) {
    return "readyToResolve";
  }

  return "ongoing";
}

export function getWinner(
  battleDetails: BattleDetails | undefined,
): WinnerInfo | null {
  if (!battleDetails) return null;

  // Check contract winner first
  if (
    battleDetails.winner &&
    battleDetails.winner !== "0x0000000000000000000000000000000000000000"
  ) {
    return {
      winner:
        battleDetails.winner === battleDetails.creator ? "creator" : "opponent",
      address: battleDetails.winner,
      reason: "Contract determined winner",
    };
  }

  // Fallback logic based on range status
  if (!battleDetails.creatorInRange && battleDetails.opponentInRange) {
    return {
      winner: "opponent",
      address: battleDetails.opponent,
      reason: "Creator went out of price range",
    };
  }
  if (!battleDetails.opponentInRange && battleDetails.creatorInRange) {
    return {
      winner: "creator",
      address: battleDetails.creator,
      reason: "Opponent went out of price range",
    };
  }
  if (!battleDetails.creatorInRange && !battleDetails.opponentInRange) {
    return {
      winner: "draw",
      address: "",
      reason: "Both players went out of range",
    };
  }

  return null;
}

export function getUSDDisplay(
  usdValue: any,
  isConnected: boolean,
  isOwner: boolean | undefined,
  isLoading: boolean,
  error: any,
) {
  if (!isConnected) return { display: "Connect Wallet", numericValue: 0 };
  if (isOwner === false) return { display: "Not Owned", numericValue: 0 };
  if (isLoading) return { display: "Loading...", numericValue: 0 };
  if (error) return { display: "Error", numericValue: 0 };

  if (usdValue && usdValue.valueUSD !== "0") {
    const rawValue = parseFloat(usdValue.valueUSD);
    const divisors = [
      1, 1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24, 1e27, 1e30,
    ];

    for (const divisor of divisors) {
      const testValue = rawValue / divisor;
      if (testValue >= 0.1 && testValue <= 10) {
        return {
          display: `$${testValue.toFixed(2)}`,
          numericValue: testValue,
        };
      }
    }
  }
  return { display: "$0.00", numericValue: 0 };
}

export function sortLPPositionsByCompatibility(
  positions: LPPosition[],
  getCompatibility: (position: LPPosition) => boolean,
): LPPosition[] {
  return [...positions].sort((a, b) => {
    const aCompatible = getCompatibility(a);
    const bCompatible = getCompatibility(b);

    // Compatible positions first
    if (aCompatible && !bCompatible) return -1;
    if (!aCompatible && bCompatible) return 1;

    // Within same compatibility group, sort by tokenId
    return parseInt(a.tokenId) - parseInt(b.tokenId);
  });
}
