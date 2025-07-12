import { POSITION_MANAGER_ABI, RANGE_BATTLE_ABI } from "@/contracts/abis";
import { CONTRACTS, MONAD_TESTNET } from "@/lib/contracts";
import { NextRequest, NextResponse } from "next/server";
import { Address, createPublicClient, http } from "viem";

// Create a public client for reading from the blockchain
const publicClient = createPublicClient({
  chain: MONAD_TESTNET,
  transport: http(),
});

export async function POST(request: NextRequest) {
  try {
    const { tokenId, userAddress } = await request.json();

    if (!tokenId) {
      return NextResponse.json(
        { error: "Token ID is required" },
        { status: 400 },
      );
    }

    if (!userAddress) {
      return NextResponse.json(
        { error: "User address is required" },
        { status: 400 },
      );
    }

    // console.log(`Fetching USD value for token ${tokenId} and checking ownership for user ${userAddress}`);

    // First check if the user owns this token
    let isOwner = false;
    try {
      const owner = await publicClient.readContract({
        address: CONTRACTS.POSITION_MANAGER as Address,
        abi: POSITION_MANAGER_ABI,
        functionName: "ownerOf",
        args: [BigInt(tokenId)],
      });

      isOwner = owner === userAddress;
      // console.log(`Token ${tokenId} owner: ${owner}, user: ${userAddress}, isOwner: ${isOwner}`);
    } catch (ownerError) {
      console.error(
        `Error checking ownership for token ${tokenId}:`,
        ownerError,
      );
      return NextResponse.json(
        {
          error: "Failed to verify token ownership",
          isOwner: false,
          usdValue: null,
        },
        { status: 400 },
      );
    }

    // Only fetch USD value if user owns the token
    if (!isOwner) {
      // console.log(`User ${userAddress} does not own token ${tokenId}`);
      return NextResponse.json(
        {
          error: "User does not own this token",
          isOwner: false,
          usdValue: null,
        },
        { status: 403 },
      );
    }

    try {
      // Fetch USD value from the Range Battle contract
      const usdValueData = await publicClient.readContract({
        address: CONTRACTS.RANGE_BATTLE as Address,
        abi: RANGE_BATTLE_ABI,
        functionName: "getLPTokenValueUSD",
        args: [BigInt(tokenId)],
      });

      if (
        !usdValueData ||
        !Array.isArray(usdValueData) ||
        usdValueData.length < 3
      ) {
        throw new Error("Invalid USD value data returned from contract");
      }

      const [amount0, amount1, usdValue] = usdValueData;

      const result = {
        amount0: (amount0 as bigint).toString(),
        amount1: (amount1 as bigint).toString(),
        valueUSD: (usdValue as bigint).toString(),
      };

      // console.log(`Successfully fetched USD value for token ${tokenId}:`, result);

      return NextResponse.json({
        usdValue: result,
        isOwner: true,
      });
    } catch (contractError) {
      console.error(
        `Failed to fetch USD value for token ${tokenId}:`,
        contractError,
      );

      // Handle specific contract errors
      if (contractError instanceof Error) {
        const errorMessage = contractError.message.toLowerCase();

        if (
          errorMessage.includes("execution reverted") ||
          errorMessage.includes("invalid token") ||
          errorMessage.includes("position not found")
        ) {
          return NextResponse.json(
            {
              error: "Position not found or invalid in battle contract",
              isOwner: true,
              usdValue: null,
            },
            { status: 404 },
          );
        }

        if (
          errorMessage.includes("network") ||
          errorMessage.includes("timeout")
        ) {
          return NextResponse.json(
            {
              error: "Network error - please try again",
              isOwner: true,
              usdValue: null,
            },
            { status: 503 },
          );
        }
      }

      return NextResponse.json(
        {
          error: "Failed to fetch USD value from contract",
          isOwner: true,
          usdValue: null,
          details:
            contractError instanceof Error
              ? contractError.message
              : "Unknown error",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in USD value API:", error);
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
