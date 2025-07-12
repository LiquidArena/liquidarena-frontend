// "use client";

// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import GradientLine from "@/components/ui/cards/gradient-line";
// import { GradientButton, GradientLink } from "@/components/ui/gradient-button";
// import { Loader2, Coins } from "lucide-react";
// import { useSearchParams, useParams } from "next/navigation";
// import { useEffect, useState, useMemo } from "react";
// import { useAvailableBattlePositions } from "@/hooks/use-create-battle";
// import { useJoinBattleWithApproval } from "@/hooks/use-join-battle-with-approval";
// import { useLPPositionUSDValue } from "@/hooks/use-lp-usd-value";
// import { useBattleDetails, useAllActiveBattles, useCompleteBattleDetails, useBattlesWaitingForOpponent, useBattlesByStatus } from "@/hooks/use-battle-contract";
// import { useUniswapNFTApproval } from "@/hooks/use-uniswap-nft-approval";

// // Component to display LP position with USD value for selection
// function LPPositionSelector({ position, isSelected, onSelect, requiredStakeValue }: {
//   position: {
//     tokenId: string;
//     poolName?: string;
//     token0Symbol?: string;
//     token1Symbol?: string;
//     fee: number;
//   };
//   isSelected: boolean;
//   onSelect: () => void;
//   requiredStakeValue: number;
// }) {
//   const { usdValue, isLoading, error, isConnected, isOwner } = useLPPositionUSDValue(position.tokenId);

//   // Get raw value for comparison
//   const getRawUSDValue = () => {
//     if (!isConnected || isOwner === false || isLoading || error) return 0;

//     if (usdValue && usdValue.valueUSD !== "0") {
//       return parseFloat(usdValue.valueUSD);
//     }
//     return 0;
//   };

//   // Get display value (converted to readable format)
//   const getDisplayValue = () => {
//     if (!isConnected) return "Connect Wallet";
//     if (isOwner === false) return "Not Owned";
//     if (isLoading) return "Loading...";
//     if (error) return "Error";

//     const rawValue = getRawUSDValue();
//     if (rawValue === 0) return "$0.00";

//     // Convert using same logic as other components
//     const divisors = [1, 1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24, 1e27, 1e30];

//     for (const divisor of divisors) {
//       const testValue = rawValue / divisor;
//       if (testValue >= 0.1 && testValue <= 10) {
//         return `$${testValue.toFixed(2)}`;
//       }
//     }
//     return `$${(rawValue / 1e30).toFixed(2)}`;
//   };

//   // Compare raw values directly with 5% tolerance
//   const rawPositionValue = getRawUSDValue();
//   const tolerance = 0.05; // 5% tolerance
//   const minValue = requiredStakeValue * (1 - tolerance);
//   const maxValue = requiredStakeValue * (1 + tolerance);
//   const isCompatible = rawPositionValue >= minValue && rawPositionValue <= maxValue;

//   return (
//     <Card
//       className={`cursor-pointer transition-all ${
//         isSelected
//           ? "bg-green-600/20 border-green-400"
//           : isCompatible
//           ? "bg-black/20 border-green-600 hover:border-green-400"
//           : "bg-black/10 border-red-600/30 opacity-50 cursor-not-allowed"
//       }`}
//       onClick={isCompatible ? onSelect : undefined}
//     >
//       <CardContent className="p-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center space-x-3">
//             <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
//               <Coins className="w-4 h-4 text-cyan-400" />
//             </div>
//             <div>
//               <div className="text-white font-medium">
//                 {position.poolName || `${position.token0Symbol}/${position.token1Symbol}`}
//               </div>
//               <div className="text-xs text-gray-400">
//                 Token #{position.tokenId} • {(position.fee / 10000)}% Fee
//               </div>
//             </div>
//           </div>
//           <div className="text-right">
//             <div className={`font-medium ${isCompatible ? 'text-green-400' : 'text-red-400'}`}>
//               {getDisplayValue()}
//             </div>
//             <div className="text-xs text-gray-400">
//               {isCompatible ? "✓ Compatible" : "✗ Incompatible"}
//             </div>
//             <div className="text-xs text-gray-500">
//               Required: ${requiredStakeValue.toLocaleString()} ±5%
//             </div>
//           </div>
//         </div>
//         {isLoading && (
//           <div className="flex items-center mt-2 text-xs text-gray-400">
//             <Loader2 className="w-3 h-3 mr-1 animate-spin" />
//             Fetching value...
//           </div>
//         )}
//       </CardContent>
//     </Card>
//   );
// }

// export default function BattleView() {
//   const params = useParams();
//   const searchParams = useSearchParams();
//   const battleId = params?.id as string;
//   const requiredStakeParam = searchParams.get("requiredStake");
//   const shouldJoin = searchParams.get("join") === "true";

//   const isHost = searchParams.get("host") === "true";
//   const [battleStatus, setBattleStatus] = useState<
//     "waiting" | "selecting" | "active" | "finished"
//   >("waiting"); // Start with waiting, will be updated based on contract data
//   const [selectedTokenId, setSelectedTokenId] = useState("");

//   // Get real LP positions from the user's wallet
//   const { positions, isLoading: positionsLoading } = useAvailableBattlePositions();

//   // Use the new approval-based join battle hook
//   const {
//     startJoinBattle,
//     approveToken,
//     joinBattle,
//     currentStep,
//     needsApproval,
//     isApproving,
//     isJoining,
//     isSuccess: joinSuccess,
//     error: joinError,
//     transactionHash: joinTransactionHash,
//     approvalHash: joinApprovalHash,
//   } = useJoinBattleWithApproval();

//   // Uniswap V3 NFT approval hook (0x3dCc735C74F10FE2B9db2BB55C40fbBbf24490f7)
//   const {
//     needsApproval: needsNFTApproval,
//     isApproving: isApprovingNFT,
//     error: nftApprovalError,
//     transactionHash: nftApprovalHash,
//     approveAll: approveAllNFTs,
//   } = useUniswapNFTApproval();

//   // Get battle data from active battles list to check if battle exists
//   const { battles: allBattles } = useAllActiveBattles();

//   // Also check queued battles (battles waiting for opponent)
//   const { battleIds: queuedBattleIds } = useBattlesWaitingForOpponent();

//   // Also check battles by "queued" status as fallback
//   const { battleIds: queuedByStatusIds } = useBattlesByStatus("queued");

//   console.log("=== BATTLE DATA FETCHING DEBUG ===");
//   console.log("Battle ID from URL:", battleId);
//   console.log("All active battles:", allBattles);
//   console.log("Queued battles (waiting for opponent):", queuedBattleIds);
//   console.log("Queued battles (by status):", queuedByStatusIds);

//   // Check if the battle exists in any of the lists
//   const currentBattleIndex = allBattles.battleIds.findIndex(id => id === battleId);
//   const isInActiveBattles = currentBattleIndex >= 0;
//   const isInQueuedBattles = queuedBattleIds.includes(battleId);
//   const isInQueuedByStatus = queuedByStatusIds.includes(battleId);
//   const battleExists = isInActiveBattles || isInQueuedBattles || isInQueuedByStatus;

//   console.log("Battle exists:", battleExists);
//   console.log("Is in active battles:", isInActiveBattles);
//   console.log("Is in queued battles:", isInQueuedBattles);

//   // Get detailed battle information using the proper hook
//   const { battleDetails, isLoading: battleDetailsLoading, error: battleDetailsError } = useBattleDetails(battleExists ? battleId : undefined);

//   // Also try complete battle details as fallback
//   const { battleDetails: completeBattleDetails, isLoading: completeBattleDetailsLoading, error: completeBattleDetailsError } = useCompleteBattleDetails(battleExists ? battleId : undefined);

//   console.log("Battle details loading:", battleDetailsLoading);
//   console.log("Battle details from contract:", battleDetails);
//   console.log("Complete battle details:", completeBattleDetails);

//   // Use complete battle details if regular battle details fail
//   const finalBattleDetails = useMemo(() => {
//     return battleDetails || (completeBattleDetails ? {
//       battleId: completeBattleDetails.battleId,
//       creator: completeBattleDetails.creator,
//       opponent: completeBattleDetails.opponent,
//       usdValue: completeBattleDetails.valueUSD,
//       winner: completeBattleDetails.winner,
//       status: completeBattleDetails.status
//     } : null);
//   }, [battleDetails, completeBattleDetails]);

//   const finalLoading = battleDetailsLoading || completeBattleDetailsLoading;
//   const finalError = battleDetailsError || completeBattleDetailsError;

//   // Convert USD value from contract - use raw value directly for comparison
//   const getRequiredStakeValue = () => {
//     if (finalBattleDetails?.usdValue && finalBattleDetails.usdValue !== "0") {
//       // Return the raw value as a number for comparison with LP position values
//       return parseFloat(finalBattleDetails.usdValue);
//     }

//     // Fallback to URL parameter if contract call fails
//     if (requiredStakeParam) {
//       return parseFloat(requiredStakeParam);
//     }

//     return 1250; // final fallback
//   };

//   const requiredStakeValue = getRequiredStakeValue();

//   // Helper function to format USD value
//   const formatUSDValue = (value: string) => {
//     if (!value || value === "0") return "$0.00";

//     const rawValue = parseFloat(value);
//     const divisors = [1, 1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24, 1e27, 1e30];

//     for (const divisor of divisors) {
//       const testValue = rawValue / divisor;
//       if (testValue >= 0.1 && testValue <= 10) {
//         return `$${testValue.toFixed(2)}`;
//       }
//     }
//     return `$${(rawValue / 1e30).toFixed(2)}`;
//   };

//   // Determine battle status based on contract data
//   useEffect(() => {
//     if (finalBattleDetails?.status) {
//       const contractStatus = finalBattleDetails.status.toLowerCase();

//       if (contractStatus === "queued") {
//         // Battle is waiting for opponent
//         if (shouldJoin) {
//           setBattleStatus("selecting"); // Show join interface
//         } else {
//           setBattleStatus("waiting"); // Show waiting state
//         }
//       } else if (contractStatus === "ongoing" || contractStatus === "onGoing") {
//         setBattleStatus("active"); // Show active battle view
//       } else if (contractStatus === "ended" || contractStatus === "readytoresolve") {
//         setBattleStatus("finished"); // Show finished battle view
//       }
//     } else if (isInActiveBattles && currentBattleIndex >= 0) {
//       // Check status from active battles list
//       const statusFromList = allBattles.statuses[currentBattleIndex]?.toLowerCase();
//       if (statusFromList === "ongoing" || statusFromList === "onGoing") {
//         setBattleStatus("active");
//       } else if (statusFromList === "queued") {
//         setBattleStatus(shouldJoin ? "selecting" : "waiting");
//       } else if (statusFromList === "ended" || statusFromList === "readytoresolve") {
//         setBattleStatus("finished");
//       }
//     } else if (shouldJoin && battleExists) {
//       // Fallback: if we have join=true in URL and battle exists, show join interface
//       setBattleStatus("selecting");
//     } else if (battleExists && !shouldJoin) {
//       // If battle exists but no join parameter, show view interface
//       setBattleStatus("active");
//     } else if (battleId && battleId !== "0") {
//       // If we have a valid battle ID, show the join interface
//       setBattleStatus("selecting");
//     }
//   }, [finalBattleDetails, shouldJoin, battleExists, isInActiveBattles, currentBattleIndex, allBattles.statuses, battleId]);

//   console.log("=== BATTLE STATUS DEBUG ===");
//   console.log("Final battle details:", finalBattleDetails);
//   console.log("Required stake value (raw):", requiredStakeValue);
//   console.log("Current battle status (UI):", battleStatus);
//   console.log("Should join from URL:", shouldJoin);
//   console.log("========================");

//   // Join battle handlers
//   const handleApproveToken = async () => {
//     try {
//       await approveToken();
//     } catch (error) {
//       console.error("Failed to approve token:", error);
//     }
//   };

//   const handleJoinBattleAfterApproval = async () => {
//     try {
//       await joinBattle();
//     } catch (error) {
//       console.error("Failed to join battle:", error);
//     }
//   };

//   // Effect to handle successful join
//   useEffect(() => {
//     if (joinSuccess) {
//       setBattleStatus("active");
//     }
//   }, [joinSuccess]);

//   return (
//     <div className="container max-w-6xl mx-auto px-4 py-24">
//       {/* Battle Loading State */}
//       {finalLoading && (
//         <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
//           <CardContent className="p-8 text-center">
//             <Loader2 className="h-16 w-16 text-purple-400 mx-auto mb-4 animate-spin" />
//             <h2 className="text-2xl font-bold text-white mb-2">
//               Loading Battle Data...
//             </h2>
//             <p className="text-gray-400">
//               Fetching battle information from the blockchain
//             </p>
//           </CardContent>
//         </Card>
//       )}

//       {/* Battle Error State */}
//       {finalError && !finalLoading && (
//         <Card className="bg-black/40 border-red-800/30 backdrop-blur-sm">
//           <CardContent className="p-8 text-center">
//             <div className="text-red-400 text-lg mb-2">
//               ❌ Failed to Load Battle
//             </div>
//             <div className="text-gray-400 text-sm mb-4">
//               Battle ID: {battleId}
//             </div>
//             <div className="text-red-300 text-sm">
//               {finalError}
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Join Battle Interface */}
//       {battleStatus === "selecting" && !isHost && !finalLoading && (
//         <Card className="relative bg-black/40 border-cyan-800/30 backdrop-blur-sm overflow-hidden">
//           <GradientLine />
//           <CardHeader>
//             <CardTitle className="text-white text-2xl font-bold">
//               🎯 Join Battle #{battleId}
//             </CardTitle>
//             <CardDescription className="text-gray-300">
//               Choose your LP token to stake in this battle
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             {/* Battle Information */}
//             <div className="mb-4 p-4 bg-gray-900/20 border border-purple-400/30 rounded-lg">
//               <div className="grid grid-cols-2 gap-4 mb-3">
//                 <div>
//                   <div className="text-sm text-gray-400">Battle ID</div>
//                   <div className="text-white font-bold">#{battleId}</div>
//                 </div>
//                 <div>
//                   <div className="text-sm text-gray-400">Required Stake</div>
//                   <div className="text-yellow-400 font-bold text-lg">
//                     {finalBattleDetails?.usdValue ?
//                       formatUSDValue(finalBattleDetails.usdValue) :
//                       `$${requiredStakeValue.toLocaleString()}`
//                     }
//                   </div>
//                 </div>
//               </div>
//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <div className="text-sm text-gray-400">Creator</div>
//                   <div className="text-cyan-400 font-mono text-sm">
//                     {finalBattleDetails?.creator ?
//                       `${finalBattleDetails.creator.slice(0, 6)}...${finalBattleDetails.creator.slice(-4)}` :
//                       "Loading..."
//                     }
//                   </div>
//                 </div>
//                 <div>
//                   <div className="text-sm text-gray-400">Status</div>
//                   <div className="text-green-400 font-bold">
//                     🔍 OPEN FOR OPPONENTS
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Uniswap V3 NFT Approval Section */}
//             {needsNFTApproval && (
//               <div className="mb-6 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-xl">
//                 <div className="flex items-start space-x-3">
//                   <div className="w-5 h-5 bg-yellow-500/20 rounded-full flex items-center justify-center mt-0.5">
//                     <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
//                   </div>
//                   <div className="flex-1">
//                     <div className="text-yellow-300 font-medium text-sm mb-1">Uniswap V3 NFT Approval Required</div>
//                     <div className="text-yellow-200/80 text-xs mb-3">
//                       Before joining battles, you must approve the Uniswap V3 NFT contract (0x3dCc735C74F10FE2B9db2BB55C40fbBbf24490f7) to allow the battle contract to access your LP NFTs.
//                     </div>
//                     <GradientButton
//                       onClick={approveAllNFTs}
//                       disabled={isApprovingNFT}
//                       className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
//                       size="sm"
//                     >
//                       {isApprovingNFT ? (
//                         <>
//                           <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                           Approving Uniswap V3 NFTs...
//                         </>
//                       ) : (
//                         "🔓 Approve Uniswap V3 NFT Contract"
//                       )}
//                     </GradientButton>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* NFT Approval Error */}
//             {nftApprovalError && (
//               <div className="mb-6 bg-red-900/20 border border-red-500/30 rounded-xl p-4">
//                 <div className="text-red-300 font-medium text-sm mb-1">NFT Approval Failed</div>
//                 <div className="text-red-200/80 text-xs">{nftApprovalError}</div>
//               </div>
//             )}

//             {/* NFT Approval Success */}
//             {nftApprovalHash && (
//               <div className="mb-6 bg-green-900/20 border border-green-500/30 rounded-xl p-3">
//                 <div className="text-green-300 font-medium text-sm mb-1">NFT Approval Transaction</div>
//                 <div className="text-green-200/80 text-xs font-mono break-all">
//                   {nftApprovalHash}
//                 </div>
//               </div>
//             )}

//             {/* LP Position Selection - Only show after NFT approval */}
//             {!needsNFTApproval && positions && positions.length > 0 && (
//               <div className="space-y-3">
//                 <div className="text-sm text-green-400 font-medium">
//                   ✓ Your Compatible LP Positions
//                 </div>
//                 <div className="grid gap-3">
//                   {positions.map((position) => (
//                     <LPPositionSelector
//                       key={position.tokenId}
//                       position={position}
//                       isSelected={selectedTokenId === position.tokenId}
//                       onSelect={() => setSelectedTokenId(position.tokenId)}
//                       requiredStakeValue={requiredStakeValue}
//                     />
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* No positions available */}
//             {!needsNFTApproval && (!positions || positions.length === 0) && (
//               <div className="text-center py-8">
//                 <div className="text-red-400 text-lg mb-2">
//                   No LP Positions Found
//                 </div>
//                 <div className="text-gray-400 text-sm">
//                   You need Uniswap V3 LP tokens worth approximately {formatUSDValue(finalBattleDetails?.usdValue || "0")} to join this battle
//                 </div>
//               </div>
//             )}

//             {/* Loading positions */}
//             {!needsNFTApproval && positionsLoading && (
//               <div className="text-center py-8">
//                 <Loader2 className="h-8 w-8 text-purple-400 mx-auto mb-4 animate-spin" />
//                 <div className="text-purple-400 text-lg mb-2">
//                   Loading Your LP Positions...
//                 </div>
//                 <div className="text-gray-400 text-sm">
//                   Fetching your Uniswap V3 positions from the blockchain
//                 </div>
//               </div>
//             )}

//             {/* Join Battle Steps */}
//             {!needsNFTApproval && selectedTokenId && (
//               <div className="mt-6 space-y-4">
//                 {/* Step Progress */}
//                 <div className="flex items-center justify-between text-sm">
//                   <div className="flex items-center space-x-2">
//                     <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
//                       currentStep === 'checking' || currentStep === 'approval' || currentStep === 'joining' || currentStep === 'complete'
//                         ? 'bg-green-600 text-white'
//                         : 'bg-gray-600 text-gray-300'
//                     }`}>
//                       {currentStep === 'complete' ? '✓' : '1'}
//                     </div>
//                     <span>Approve NFT</span>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
//                       currentStep === 'joining' || currentStep === 'complete'
//                         ? 'bg-green-600 text-white'
//                         : 'bg-gray-600 text-gray-300'
//                     }`}>
//                       {currentStep === 'complete' ? '✓' : '2'}
//                     </div>
//                     <span>Join Battle</span>
//                   </div>
//                 </div>

//                 {/* Action Buttons */}
//                 {currentStep === 'checking' && needsApproval && (
//                   <GradientButton
//                     onClick={handleApproveToken}
//                     disabled={isApproving}
//                     className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
//                     size="lg"
//                   >
//                     {isApproving ? (
//                       <>
//                         <Loader2 className="w-5 h-5 mr-2 animate-spin" />
//                         Approving NFT...
//                       </>
//                     ) : (
//                       "Approve NFT for Battle Contract"
//                     )}
//                   </GradientButton>
//                 )}

//                 {((currentStep === 'checking' && !needsApproval) || currentStep === 'approval') && (
//                   <GradientButton
//                     onClick={handleJoinBattleAfterApproval}
//                     disabled={isJoining}
//                     className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50"
//                     size="lg"
//                   >
//                     {isJoining ? (
//                       <>
//                         <Loader2 className="w-5 h-5 mr-2 animate-spin" />
//                         Joining Battle...
//                       </>
//                     ) : (
//                       "⚔️ Join Battle"
//                     )}
//                   </GradientButton>
//                 )}

//                 {currentStep === 'complete' && (
//                   <div className="text-center py-4">
//                     <div className="text-green-400 font-bold text-lg mb-2">
//                       ✅ Successfully Joined Battle!
//                     </div>
//                     <div className="text-gray-400 text-sm">
//                       You are now participating in Battle #{battleId}
//                     </div>
//                   </div>
//                 )}

//                 {/* Transaction Hashes */}
//                 {joinApprovalHash && (
//                   <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-3">
//                     <div className="text-blue-300 font-medium text-sm mb-1">Approval Transaction</div>
//                     <div className="text-blue-200/80 text-xs font-mono break-all">
//                       {joinApprovalHash}
//                     </div>
//                   </div>
//                 )}

//                 {joinTransactionHash && (
//                   <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-3">
//                     <div className="text-green-300 font-medium text-sm mb-1">Join Battle Transaction</div>
//                     <div className="text-green-200/80 text-xs font-mono break-all">
//                       {joinTransactionHash}
//                     </div>
//                   </div>
//                 )}

//                 {/* Error Display */}
//                 {joinError && (
//                   <div className="bg-red-900/20 border border-red-500/30 rounded-xl p-4">
//                     <div className="text-red-300 font-medium mb-1">
//                       {currentStep === 'approval' ? 'Approval Failed' : 'Join Battle Failed'}
//                     </div>
//                     <div className="text-red-200/80 text-sm">{joinError}</div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Initial Join Button - when no token selected */}
//             {!needsNFTApproval && !selectedTokenId && positions && positions.length > 0 && (
//               <GradientButton
//                 onClick={() => {}}
//                 disabled={true}
//                 className="w-full bg-gray-600 hover:bg-gray-700 disabled:opacity-50"
//                 size="lg"
//               >
//                 Select an LP Position to Continue
//               </GradientButton>
//             )}
//           </CardContent>
//         </Card>
//       )}

//       {/* Battle Not Found */}
//       {!finalLoading && !finalError && !battleExists && (
//         <Card className="bg-black/40 border-red-800/30 backdrop-blur-sm">
//           <CardContent className="p-8 text-center">
//             <div className="text-red-400 text-lg mb-2">
//               ❌ Battle Not Found
//             </div>
//             <div className="text-gray-400 text-sm mb-4">
//               Battle ID: {battleId}
//             </div>
//             <div className="text-gray-300 text-sm">
//               This battle does not exist or has been removed.
//             </div>
//             <GradientLink href="/arena" className="mt-4 inline-block">
//               Return to Arena
//             </GradientLink>
//           </CardContent>
//         </Card>
//       )}
//     </div>
//   );
// }
