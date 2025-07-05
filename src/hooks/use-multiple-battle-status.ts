import { RANGE_BATTLE_ABI } from "@/contracts/abis";
import { ContractBattleStatus } from "@/types/arena";
import { useReadContracts } from "wagmi";

// Correct contract address for LPBattleVault
const BATTLE_CONTRACT_ADDRESS = "0x78f4f7A63C9a4f2d75749209d6EBf133464cb9e6";

// Use getBattleDetails function from the contract ABI to get status
const BATTLE_STATUS_ABI = [
  {
    inputs: [{ name: "battleId", type: "uint256" }],
    name: "getBattleDetails",
    outputs: [
      { name: "creator", type: "address" },
      { name: "opponent", type: "address" },
      { name: "usdValue", type: "uint256" },
      { name: "winner", type: "address" },
      { name: "status", type: "string" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Convert contract status string to our ContractBattleStatus type
const mapContractStatusToString = (
  statusString: string,
): ContractBattleStatus => {
  const status = statusString.toLowerCase();
  switch (status) {
    case "queued":
      return "queued";
    case "ongoing":
    case "onGoing":
      return "onGoing";
    case "readytoresolve":
    case "readyToResolve":
      return "readyToResolve";
    case "ended":
      return "ended";
    default:
      return "queued";
  }
};

// Helper function to check if address is zero address (no opponent)
const isZeroAddress = (address: string): boolean => {
  return (
    address === "0x0000000000000000000000000000000000000000" ||
    address === "0x0"
  );
};

export const useMultipleBattleStatus = (battleIds: string[]) => {
  const contracts = battleIds.map((battleId) => ({
    address: BATTLE_CONTRACT_ADDRESS,
    abi: BATTLE_STATUS_ABI,
    functionName: "getBattleDetails",
    args: [BigInt(battleId)],
  }));

  const {
    data: results,
    isLoading,
    error,
  } = useReadContracts({
    contracts,
  });

  const statusMap = battleIds.reduce(
    (acc, battleId, index) => {
      const result = results?.[index];
      if (result?.status === "success" && result.result) {
        // result.result is an array: [creator, opponent, usdValue, winner, status]
        const statusString = result.result[4] as string;
        acc[battleId] = mapContractStatusToString(statusString);
      } else {
        acc[battleId] = "queued"; // Default fallback
      }
      return acc;
    },
    {} as Record<string, ContractBattleStatus>,
  );

  // Create opponent map to track player count
  const opponentMap = battleIds.reduce(
    (acc, battleId, index) => {
      const result = results?.[index];
      if (result?.status === "success" && result.result) {
        // opponent is at index 1
        const opponent = result.result[1] as string;
        acc[battleId] = opponent;
      } else {
        acc[battleId] = "0x0"; // Default no opponent
      }
      return acc;
    },
    {} as Record<string, string>,
  );

  // Create player count map
  const playerCountMap = battleIds.reduce(
    (acc, battleId, index) => {
      const opponent = opponentMap[battleId];
      const hasOpponent = !isZeroAddress(opponent);
      acc[battleId] = {
        current: hasOpponent ? 2 : 1,
        max: 2,
        hasOpponent,
        opponent: hasOpponent ? opponent : null,
      };
      return acc;
    },
    {} as Record<
      string,
      {
        current: number;
        max: number;
        hasOpponent: boolean;
        opponent: string | null;
      }
    >,
  );

  return {
    statusMap,
    opponentMap,
    playerCountMap,
    isLoading,
    error,
  };
};
