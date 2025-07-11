import { ERC20_ABI, POSITION_MANAGER_ABI } from "@/contracts/abis";
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
    const { tokenId } = await request.json();

    if (!tokenId) {
      return NextResponse.json(
        { error: "Token ID is required" },
        { status: 400 },
      );
    }

    console.log(
      `Fetching position details for token ${tokenId} from Position Manager: ${CONTRACTS.POSITION_MANAGER}`,
    );

    try {
      // Fetch position data from Uniswap V3 Position Manager
      const positionData = await publicClient.readContract({
        address: CONTRACTS.POSITION_MANAGER as Address,
        abi: POSITION_MANAGER_ABI,
        functionName: "positions",
        args: [BigInt(tokenId)],
      });

      if (
        !positionData ||
        !Array.isArray(positionData) ||
        positionData.length < 12
      ) {
        throw new Error("Invalid position data returned from Position Manager");
      }

      // Position Manager returns: [nonce, operator, token0, token1, fee, tickLower, tickUpper, liquidity, feeGrowthInside0LastX128, feeGrowthInside1LastX128, tokensOwed0, tokensOwed1]
      const [
        ,
        ,
        // nonce (unused)
        // operator (unused)
        token0,
        token1,
        fee,
        tickLower,
        tickUpper,
        liquidity, // feeGrowthInside0LastX128 (unused)
        ,
        ,
        // feeGrowthInside1LastX128 (unused)
        tokensOwed0,
        tokensOwed1,
      ] = positionData;

      // Fetch token information for symbols
      let token0Symbol = "UNKNOWN";
      let token1Symbol = "UNKNOWN";

      try {
        // Fetch token0 symbol
        const token0SymbolResult = await publicClient.readContract({
          address: token0 as Address,
          abi: ERC20_ABI,
          functionName: "symbol",
        });
        token0Symbol = token0SymbolResult as string;
      } catch (error) {
        console.warn(`Failed to fetch token0 symbol for ${token0}:`, error);
      }

      try {
        // Fetch token1 symbol
        const token1SymbolResult = await publicClient.readContract({
          address: token1 as Address,
          abi: ERC20_ABI,
          functionName: "symbol",
        });
        token1Symbol = token1SymbolResult as string;
      } catch (error) {
        console.warn(`Failed to fetch token1 symbol for ${token1}:`, error);
      }

      // Format the position data (USD values will be fetched by frontend hook)
      const position = {
        tokenId: tokenId.toString(),
        token0: token0 as Address,
        token1: token1 as Address,
        fee: Number(fee),
        tickLower: Number(tickLower),
        tickUpper: Number(tickUpper),
        liquidity: (liquidity as bigint).toString(),
        amount0: "0", // Will be populated by frontend hook
        amount1: "0", // Will be populated by frontend hook
        valueUSD: "0", // Will be populated by frontend hook
        fees0: (tokensOwed0 as bigint).toString(), // Use tokensOwed as uncollected fees
        fees1: (tokensOwed1 as bigint).toString(), // Use tokensOwed as uncollected fees
        token0Symbol,
        token1Symbol,
        poolName: `${token0Symbol}/${token1Symbol}`,
      };

      // console.log(`Successfully fetched position details for token ${tokenId}:`, position);

      return NextResponse.json({ position });
    } catch (contractError) {
      console.error(
        `Contract call failed for token ${tokenId}:`,
        contractError,
      );

      // Handle specific error cases
      if (contractError instanceof Error) {
        const errorMessage = contractError.message.toLowerCase();

        // Check for Position Manager specific errors
        if (
          errorMessage.includes("execution reverted") ||
          errorMessage.includes("position not found") ||
          errorMessage.includes("invalid token") ||
          errorMessage.includes("erc721: owner query for nonexistent token")
        ) {
          console.log(
            `Token ${tokenId} not found in Position Manager - this token ID does not exist`,
          );
          return NextResponse.json(
            {
              error: "Position not found",
              message: `Token ID ${tokenId} does not exist in the Position Manager`,
              tokenId: tokenId.toString(),
            },
            { status: 404 },
          );
        }

        if (
          errorMessage.includes("network") ||
          errorMessage.includes("timeout")
        ) {
          return NextResponse.json(
            { error: "Network error - please try again" },
            { status: 503 },
          );
        }

        if (
          errorMessage.includes("abi") ||
          errorMessage.includes("signature")
        ) {
          return NextResponse.json(
            { error: "Contract ABI mismatch or invalid function call" },
            { status: 400 },
          );
        }
      }

      return NextResponse.json(
        {
          error: "Failed to fetch position details from contract",
          tokenId: tokenId.toString(),
          details:
            contractError instanceof Error
              ? contractError.message
              : "Unknown error",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error in position details API:", error);
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
