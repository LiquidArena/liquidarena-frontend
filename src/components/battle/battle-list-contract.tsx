// "use client";

// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   useAllActiveBattles,
//   useBatchBattleDetails,
//   useUserBattles
// } from "@/hooks/use-battle-contract";
// import { useAccount } from "wagmi";
// import { CONTRACTS } from "@/lib/contracts";
// import {
//   Loader2,
//   Sword,
//   Trophy,
//   Clock,
//   Users,
//   Target,
//   Coins,
//   RefreshCw,
//   AlertCircle,
//   User,
//   Crown
// } from "lucide-react";

// export function BattleListFromContract() {
//   const { address, isConnected } = useAccount();
//   const [activeTab, setActiveTab] = useState("all");

//   // Fetch all active battles from contract
//   const {
//     battles: activeBattles,
//     isLoading: activeBattlesLoading,
//     error: activeBattlesError,
//     refetch: refetchActiveBattles
//   } = useAllActiveBattles();

//   // Fetch user's battles
//   const {
//     userBattles,
//     isLoading: userBattlesLoading,
//     error: userBattlesError
//   } = useUserBattles();

//   // Get detailed info for active battles
//   const {
//     battles: battleDetails,
//     isLoading: detailsLoading
//   } = useBatchBattleDetails(activeBattles.battleIds.slice(0, 10)); // Limit to first 10 to avoid too many calls

//   const isLoading = activeBattlesLoading || detailsLoading;

//   // Convert USD values like we do in other components
//   const convertUSDValue = (rawValue: string) => {
//     if (!rawValue || rawValue === "0") return "$0.00";

//     const value = parseFloat(rawValue);
//     const divisors = [1, 1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24, 1e27, 1e30];

//     for (const divisor of divisors) {
//       const testValue = value / divisor;
//       if (testValue >= 0.1 && testValue <= 10) {
//         return `$${testValue.toFixed(2)}`;
//       }
//     }

//     return `$${(value / 1e30).toFixed(2)}`;
//   };

//   const getBattleStatusColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case 'waiting': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
//       case 'active': return 'bg-green-500/20 text-green-300 border-green-500/30';
//       case 'resolved': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
//       default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
//     }
//   };

//   const formatAddress = (addr: string) => {
//     if (!addr || addr === "0x0000000000000000000000000000000000000000") return "None";
//     return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
//   };

//   if (activeBattlesError) {
//     return (
//       <Card className="bg-gray-900/50 border-gray-700">
//         <CardContent className="p-6">
//           <div className="flex items-center space-x-3 text-red-400">
//             <AlertCircle className="w-5 h-5" />
//             <span>Failed to load battles from contract: {activeBattlesError.message}</span>
//           </div>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       <Card className="bg-gray-900/50 border-gray-700">
//         <CardHeader className="flex flex-row items-center justify-between">
//           <div>
//             <CardTitle className="text-white flex items-center">
//               <Sword className="w-5 h-5 mr-2 text-cyan-400" />
//               Live Battles from Contract
//             </CardTitle>
//             <p className="text-gray-400 text-sm mt-1">
//               Real-time data from LPBattleVault: {CONTRACTS.RANGE_BATTLE}
//             </p>
//           </div>
//           <Button
//             onClick={refetchActiveBattles}
//             variant="outline"
//             size="sm"
//             className="border-gray-600"
//           >
//             <RefreshCw className="w-4 h-4 mr-1" />
//             Refresh
//           </Button>
//         </CardHeader>

//         <CardContent>
//           <Tabs value={activeTab} onValueChange={setActiveTab}>
//             <TabsList className="bg-gray-800/50 border border-gray-700/50 rounded-xl">
//               <TabsTrigger
//                 value="all"
//                 className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white"
//               >
//                 <Target className="w-4 h-4 mr-2" />
//                 All Battles ({activeBattles.battleIds.length})
//               </TabsTrigger>
//               {isConnected && (
//                 <TabsTrigger
//                   value="user"
//                   className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
//                 >
//                   <User className="w-4 h-4 mr-2" />
//                   My Battles ({userBattles.battleIds.length})
//                 </TabsTrigger>
//               )}
//             </TabsList>

//             <TabsContent value="all" className="mt-6">
//               {isLoading ? (
//                 <div className="flex items-center justify-center py-8">
//                   <Loader2 className="w-6 h-6 animate-spin text-cyan-400 mr-2" />
//                   <span className="text-gray-400">Loading battles from contract...</span>
//                 </div>
//               ) : activeBattles.battleIds.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Target className="w-12 h-12 text-gray-500 mx-auto mb-3" />
//                   <p className="text-gray-400">No active battles found on contract</p>
//                 </div>
//               ) : (
//                 <div className="grid gap-4">
//                   {activeBattles.battleIds.map((battleId, index) => {
//                     const status = activeBattles.statuses[index];
//                     const details = battleDetails.find(d => d.battleId === battleId);

//                     return (
//                       <Card key={battleId} className="bg-gray-800/30 border-gray-700/50">
//                         <CardContent className="p-4">
//                           <div className="flex items-center justify-between mb-3">
//                             <div className="flex items-center space-x-3">
//                               <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
//                                 <Sword className="w-4 h-4 text-cyan-400" />
//                               </div>
//                               <div>
//                                 <h4 className="text-white font-semibold">Battle #{battleId}</h4>
//                                 <p className="text-gray-400 text-sm">Range Battle</p>
//                               </div>
//                             </div>
//                             <Badge className={getBattleStatusColor(status)}>
//                               {status}
//                             </Badge>
//                           </div>

//                           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                             <div>
//                               <div className="text-gray-400 mb-1">Creator</div>
//                               <div className="text-white font-mono">
//                                 {details ? formatAddress(details.creator) : "Loading..."}
//                               </div>
//                             </div>
//                             <div>
//                               <div className="text-gray-400 mb-1">Opponent</div>
//                               <div className="text-white font-mono">
//                                 {details ? formatAddress(details.opponent) : "Loading..."}
//                               </div>
//                             </div>
//                             <div>
//                               <div className="text-gray-400 mb-1">Value</div>
//                               <div className="text-green-400 font-semibold">
//                                 {details ? convertUSDValue(details.usdValue) : "Loading..."}
//                               </div>
//                             </div>
//                             <div>
//                               <div className="text-gray-400 mb-1">Winner</div>
//                               <div className="text-yellow-400">
//                                 {details?.winner && details.winner !== "0x0000000000000000000000000000000000000000"
//                                   ? formatAddress(details.winner)
//                                   : "TBD"
//                                 }
//                               </div>
//                             </div>
//                           </div>
//                         </CardContent>
//                       </Card>
//                     );
//                   })}
//                 </div>
//               )}
//             </TabsContent>

//             <TabsContent value="user" className="mt-6">
//               {!isConnected ? (
//                 <div className="text-center py-8">
//                   <Users className="w-12 h-12 text-gray-500 mx-auto mb-3" />
//                   <p className="text-gray-400">Connect your wallet to view your battles</p>
//                 </div>
//               ) : userBattlesLoading ? (
//                 <div className="flex items-center justify-center py-8">
//                   <Loader2 className="w-6 h-6 animate-spin text-purple-400 mr-2" />
//                   <span className="text-gray-400">Loading your battles...</span>
//                 </div>
//               ) : userBattles.battleIds.length === 0 ? (
//                 <div className="text-center py-8">
//                   <Crown className="w-12 h-12 text-gray-500 mx-auto mb-3" />
//                   <p className="text-gray-400">You haven't participated in any battles yet</p>
//                 </div>
//               ) : (
//                 <div className="grid gap-4">
//                   {userBattles.battleIds.map((battleId, index) => {
//                     const isCreator = userBattles.isCreator[index];

//                     return (
//                       <Card key={battleId} className="bg-gray-800/30 border-gray-700/50">
//                         <CardContent className="p-4">
//                           <div className="flex items-center justify-between mb-3">
//                             <div className="flex items-center space-x-3">
//                               <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
//                                 isCreator
//                                   ? 'bg-gradient-to-br from-cyan-500/20 to-purple-500/20'
//                                   : 'bg-gradient-to-br from-purple-500/20 to-pink-500/20'
//                               }`}>
//                                 {isCreator ? <Crown className="w-4 h-4 text-cyan-400" /> : <Sword className="w-4 h-4 text-purple-400" />}
//                               </div>
//                               <div>
//                                 <h4 className="text-white font-semibold">Battle #{battleId}</h4>
//                                 <p className="text-gray-400 text-sm">
//                                   {isCreator ? "You created this battle" : "You joined this battle"}
//                                 </p>
//                               </div>
//                             </div>
//                             <Badge className={isCreator ? "bg-cyan-500/20 text-cyan-300" : "bg-purple-500/20 text-purple-300"}>
//                               {isCreator ? "Creator" : "Participant"}
//                             </Badge>
//                           </div>
//                         </CardContent>
//                       </Card>
//                     );
//                   })}
//                 </div>
//               )}
//             </TabsContent>
//           </Tabs>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
