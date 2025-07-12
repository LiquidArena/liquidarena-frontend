import { POSITION_MANAGER_ABI } from "@/contracts/abis";
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
    const { owner } = await request.json();

    if (!owner) {
      return NextResponse.json(
        { error: "Owner address is required" },
        { status: 400 },
      );
    }

    // console.log(`Fetching LP NFT tokens for owner: ${owner}`);

    try {
      // First, get the balance of LP NFTs for the user
      const balance = await publicClient.readContract({
        address: CONTRACTS.POSITION_MANAGER as Address,
        abi: POSITION_MANAGER_ABI,
        functionName: "balanceOf",
        args: [owner as Address],
      });

      // console.logconsole.log(`User ${owner} has ${balance} LP NFTs`);

      if (!balance || balance === 0n) {
        return NextResponse.json({ tokenIds: [] });
      }

      // Get all token IDs owned by the user
      const tokenIds: string[] = [];

      // Use tokenOfOwnerByIndex to get all token IDs
      for (let i = 0; i < Number(balance); i++) {
        try {
          const tokenId = await publicClient.readContract({
            address: CONTRACTS.POSITION_MANAGER as Address,
            abi: POSITION_MANAGER_ABI,
            functionName: "tokenOfOwnerByIndex",
            args: [owner as Address, BigInt(i)],
          });

          tokenIds.push((tokenId as bigint).toString());
        } catch (error) {
          console.warn(`Failed to fetch token at index ${i}:`, error);
          // Continue with other tokens even if one fails
        }
      }

      // console.log(
      //   `Successfully fetched ${tokenIds.length} token IDs for user ${owner}:`,
      //   tokenIds,
      // );

      return NextResponse.json({ tokenIds });
    } catch (contractError) {
      console.error("Contract call failed:", contractError);

      // Return a more specific error message
      if (contractError instanceof Error) {
        if (contractError.message.includes("execution reverted")) {
          return NextResponse.json(
            {
              error:
                "Position Manager contract not found or user has no positions",
            },
            { status: 404 },
          );
        }
        if (contractError.message.includes("network")) {
          return NextResponse.json(
            { error: "Network error - please try again" },
            { status: 503 },
          );
        }
      }

      return NextResponse.json(
        { error: "Failed to fetch user tokens from contract" },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in user tokens API:", error);
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
