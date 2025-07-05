import { FEE_BATTLE_ABI, RANGE_BATTLE_ABI } from "@/contracts/abis";
import { MONAD_TESTNET } from "@/lib/contracts";
import { NextRequest, NextResponse } from "next/server";
import { Address, createPublicClient, http } from "viem";

// Create a public client for reading from the blockchain
const publicClient = createPublicClient({
  chain: MONAD_TESTNET,
  transport: http(),
});

export async function POST(request: NextRequest) {
  try {
    const { userAddress, contractAddress, battleType } = await request.json();

    if (!userAddress) {
      return NextResponse.json(
        { error: "User address is required" },
        { status: 400 },
      );
    }

    if (!contractAddress) {
      return NextResponse.json(
        { error: "Contract address is required" },
        { status: 400 },
      );
    }

    console.log(
      `Fetching battles for user: ${userAddress} from contract: ${contractAddress}`,
    );

    try {
      // Select the appropriate ABI based on battle type
      const abi = battleType === "range" ? RANGE_BATTLE_ABI : FEE_BATTLE_ABI;

      // Call the getUserBattles function on the contract
      const userBattlesData = await publicClient.readContract({
        address: contractAddress as Address,
        abi: abi,
        functionName: "getUserBattles",
        args: [userAddress as Address],
      });

      if (
        !userBattlesData ||
        !Array.isArray(userBattlesData) ||
        userBattlesData.length < 2
      ) {
        throw new Error("Invalid battle data returned from contract");
      }

      // Extract battle IDs and creator flags
      const [battleIds, isCreator] = userBattlesData;

      // Convert bigint battle IDs to strings for JSON serialization
      const serializedBattleIds = battleIds.map((id: bigint) => id.toString());

      return NextResponse.json({
        battleIds: serializedBattleIds,
        isCreator: isCreator,
      });
    } catch (error) {
      console.error(`Error fetching user battles from contract:`, error);
      return NextResponse.json(
        { error: "Failed to fetch battle data from blockchain" },
        { status: 503 },
      );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed. Use POST." },
    { status: 405 },
  );
}
