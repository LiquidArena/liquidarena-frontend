"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BATTLE_DURATIONS,
  type CreateBattleParams,
  formatDuration,
  useAvailableBattlePositions,
} from "@/hooks/use-create-battle";
import { useCreateBattleWithApproval } from "@/hooks/use-create-battle-with-approval";
import { useLPPositionUSDValue } from "@/hooks/use-lp-usd-value";
import type { LPPosition } from "@/lib/lp-position-service";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  Coins,
  Flame,
  Loader2,
  Sparkles,
  Swords,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { ScrollArea } from "../ui/scroll-area";

interface CreateBattleDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Component to display selected position details with USD value
function SelectedPositionDetails({ position }: { position: LPPosition }) {
  const { usdValue, isLoading } = useLPPositionUSDValue(position.tokenId);

  const getUSDDisplay = () => {
    if (isLoading) return "Loading...";

    if (usdValue && usdValue.valueUSD !== "0") {
      const rawValue = parseFloat(usdValue.valueUSD);
      const divisors = [
        1, 1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24, 1e27, 1e30,
      ];

      for (const divisor of divisors) {
        const testValue = rawValue / divisor;
        if (testValue >= 0.1 && testValue <= 10) {
          return `$${testValue.toFixed(2)}`;
        }
      }
      return `$${(rawValue / 1e30).toFixed(2)}`;
    }
    return "$0.00";
  };

  return (
    <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 rounded-xl overflow-hidden">
      <CardContent>
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="text-white font-semibold">Selected Position</h4>
            <p className="text-gray-400 text-sm">Ready for battle</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-900/30 rounded-lg p-3">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              Pool
            </div>
            <div className="text-white font-medium">{position.poolName}</div>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-3">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              USD Value
            </div>
            <div className="text-green-400 font-bold">{getUSDDisplay()}</div>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-3">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              Fee Tier
            </div>
            <div className="text-purple-400 font-medium">
              {position.fee / 10000}%
            </div>
          </div>
          <div className="bg-gray-900/30 rounded-lg p-3">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">
              Token ID
            </div>
            <div className="text-white font-mono">#{position.tokenId}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component to display position with USD value
function PositionSelectItem({ position }: { position: any }) {
  const { usdValue, isLoading, error, isConnected, isOwner } =
    useLPPositionUSDValue(position.tokenId);

  // Convert USD value using the same logic as LPPositionCard
  const getUSDDisplay = () => {
    if (!isConnected) return "Connect Wallet";
    if (isOwner === false) return "Not Owned";
    if (isLoading) return "Loading...";
    if (error) return "Error";

    if (usdValue && usdValue.valueUSD !== "0") {
      const rawValue = parseFloat(usdValue.valueUSD);

      // Try different divisors to find reasonable USD values
      const divisors = [
        1, 1e3, 1e6, 1e9, 1e12, 1e15, 1e18, 1e21, 1e24, 1e27, 1e30,
      ];

      for (const divisor of divisors) {
        const testValue = rawValue / divisor;
        if (testValue >= 0.1 && testValue <= 10) {
          return `$${testValue.toFixed(2)}`;
        }
      }

      // Fallback
      return `$${(rawValue / 1e30).toFixed(2)}`;
    }

    return "$0.00";
  };

  const usdDisplay = getUSDDisplay();

  return (
    <div className="flex items-center gap-4 justify-between w-full py-2">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
          <Coins className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="text-start">
          <span className="font-medium text-white">
            {position.poolName ||
              `${position.token0Symbol}/${position.token1Symbol}`}
          </span>
          <div className="text-xs text-gray-400">
            Token #{position.tokenId} • {position.fee / 10000}% Fee
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge
          variant="secondary"
          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30"
        >
          {usdDisplay}
        </Badge>
        <Badge
          variant="secondary"
          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/30"
        >
          🔥 Active
        </Badge>
      </div>
    </div>
  );
}

export function CreateBattleDialog({
  trigger,
  open,
  onOpenChange,
}: CreateBattleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string>("");
  const [selectedDuration, setSelectedDuration] = useState<number>(3600); // 1 hour default
  const [battleType, setBattleType] = useState<"range" | "fee">("range");

  const {
    positions,
    isLoading: positionsLoading,
    hasPositions,
  } = useAvailableBattlePositions();
  const {
    startBattleCreation,
    approveToken,
    createBattle,
    resetState,
    currentStep,
    needsApproval,
    isApproving,
    isApproved,
    isCreating,
    isSuccess,
    error,
    transactionHash,
    approvalHash,
    currentParams,
  } = useCreateBattleWithApproval();

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsOpen(newOpen);
    }

    if (!newOpen) {
      // Reset form when closing
      setSelectedTokenId("");
      setSelectedDuration(3600);
      setBattleType("range");
      resetState();
    }
  };

  const handleCreateBattle = async () => {
    if (!selectedTokenId) return;

    const params: CreateBattleParams = {
      tokenId: selectedTokenId,
      duration: selectedDuration,
      battleType,
    };

    // Start the process - this will check approval and set the current step
    await startBattleCreation(params);
  };

  const handleApprove = async () => {
    await approveToken();
  };

  const handleCreateBattleAfterApproval = async () => {
    await createBattle();
  };

  const selectedPosition = positions.find((p) => p.tokenId === selectedTokenId);
  const selectedDurationInfo = BATTLE_DURATIONS.find(
    (d) => d.value === selectedDuration,
  );

  const dialogOpen = open !== undefined ? open : isOpen;

  return (
    <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

      <DialogContent className="bg-gradient-to-br from-gray-900/98 via-gray-800/95 to-gray-900/98 border-0 text-white backdrop-blur-xl max-w-3xl shadow-2xl shadow-cyan-500/10">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden rounded-lg">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <DialogHeader className="relative z-10 text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                <Swords className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-center">
            Create Epic Battle
          </DialogTitle>
          <DialogDescription className="text-gray-300 text-sm text-center">
            Challenge liquidity providers in the ultimate DeFi arena
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[50vh]">
          {isSuccess ? (
            <div className="relative z-10 space-y-6">
              {/* Success Animation */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-green-500/25 animate-bounce">
                    <Trophy className="w-12 h-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                    Battle Created Successfully!
                  </h3>
                  <p className="text-gray-300">
                    Your battle is now live and ready for challengers
                  </p>
                </div>
              </div>

              {/* Transaction Details */}
              {transactionHash && (
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">
                      Transaction Hash:
                    </span>
                    <code className="text-green-400 text-sm font-mono bg-gray-900/50 px-2 py-1 rounded">
                      {transactionHash.slice(0, 10)}...
                      {transactionHash.slice(-8)}
                    </code>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={() => handleOpenChange(false)}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 h-12 rounded-xl font-semibold shadow-lg shadow-cyan-500/25"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Awesome!
                </Button>
              </div>
            </div>
          ) : (
            <div className="relative z-10 space-y-8">
              {/* Battle Type Selection */}
              <div className="space-y-4">
                <div className="px-2 space-y-2">
                  <Label className="text-xl font-semibold text-white flex items-center gap-2">
                    <div className="bg-white/5 -skew-x-12 backdrop-blur-sm p-4 w-6 h-6 rounded-sm flex items-center justify-center">
                      <p>1</p>
                    </div>
                    Choose Your Battle Style
                  </Label>
                  <p className="text-gray-400 text-sm">
                    Select the type of competition that suits your strategy
                  </p>
                </div>

                <Tabs
                  value={battleType}
                  onValueChange={(value) =>
                    setBattleType(value as "range" | "fee")
                  }
                >
                  <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 border border-gray-700/50 rounded-2xl p-2 h-auto">
                    <TabsTrigger
                      value="range"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-cyan-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-cyan-500/25 rounded-xl py-4 px-6 transition-all duration-300"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <Target className="w-6 h-6" />
                        <span className="font-semibold">Range Battle</span>
                        <span className="text-xs opacity-80">
                          Price Range Strategy
                        </span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger
                      disabled
                      value="fee"
                      className="disabled:bg-gray-700/20 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-purple-500/25 rounded-xl py-4 px-6 transition-all duration-300"
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <Coins className="w-6 h-6" />
                        <span className="font-semibold">Fee Battle</span>
                        <span className="text-xs opacity-80">
                          Fee Generation Race
                        </span>
                      </div>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="range" className="mt-6">
                    <div className="bg-gradient-to-r from-cyan-900/30 to-cyan-800/20 border border-cyan-500/30 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <Target className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <h4 className="text-cyan-300 font-semibold mb-1">
                            Range Battle Strategy
                          </h4>
                          <p className="text-cyan-200/80 text-sm leading-relaxed">
                            Victory goes to the LP position that stays within
                            its price range the longest. If both positions
                            remain in range, the winner is determined by the
                            highest percentage gain.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="fee" className="mt-6">
                    <div className="bg-gradient-to-r from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <Coins className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="text-purple-300 font-semibold mb-1">
                            Fee Battle Strategy
                          </h4>
                          <p className="text-purple-200/80 text-sm leading-relaxed">
                            The ultimate fee generation competition. Victory
                            belongs to the LP position that accumulates trading
                            fees at the fastest rate.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* LP Position Selection */}
              <div className="space-y-4">
                <div className="text-end px-2 space-y-2">
                  <Label className="text-xl font-semibold text-white flex items-center justify-end gap-2">
                    <div className="bg-white/5 -skew-x-12 backdrop-blur-sm p-4 w-6 h-6 rounded-sm flex items-center justify-center">
                      <p>2</p>
                    </div>
                    Select Your Weapon
                  </Label>
                  <p className="text-gray-400 text-sm">
                    Choose the LP position you want to battle with
                  </p>
                </div>

                {positionsLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-300 font-medium">
                        Scanning Your Arsenal
                      </p>
                      <p className="text-gray-500 text-sm">
                        Loading your LP positions...
                      </p>
                    </div>
                  </div>
                ) : !hasPositions ? (
                  <div className="text-center py-12 space-y-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto">
                      <Target className="w-8 h-8 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-gray-300 font-medium mb-2">
                        No Active Positions Found
                      </p>
                      <p className="text-gray-500 text-sm">
                        You need active LP positions to create battles
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Select
                      value={selectedTokenId}
                      onValueChange={setSelectedTokenId}
                    >
                      <SelectTrigger className="w-full [&>span]:grow bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 min-h-14 rounded-xl transition-all duration-200">
                        <SelectValue placeholder="🎯 Choose your LP position" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800/95 border border-gray-700/50 backdrop-blur-xl rounded-xl w-full">
                        {positions.map((position) => (
                          <SelectItem
                            key={position.tokenId}
                            value={position.tokenId}
                            className="hover:bg-gray-700/50! rounded-lg my-1 cursor-pointer w-full [&>span]:grow"
                          >
                            <PositionSelectItem position={position} />
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500">
                      💡 Only active LP positions with liquidity are shown
                    </p>
                  </div>
                )}
              </div>

              {/* Selected Position Details */}
              {selectedPosition && (
                <SelectedPositionDetails position={selectedPosition} />
              )}

              {/* Duration Selection */}
              <div className="space-y-4">
                <div className="px-2 space-y-2">
                  <Label className="text-xl font-semibold text-white flex items-center gap-2">
                    <div className="bg-white/5 -skew-x-12 backdrop-blur-sm p-4 w-6 h-6 rounded-sm flex items-center justify-center">
                      <p>3</p>
                    </div>
                    Set Battle Duration
                  </Label>
                  <p className="text-gray-400 text-sm">
                    How long will this epic battle last?
                  </p>
                </div>

                <Select
                  value={selectedDuration.toString()}
                  onValueChange={(value) =>
                    setSelectedDuration(parseInt(value))
                  }
                >
                  <SelectTrigger className="[&>span]:grow w-full bg-gray-800/50 border border-gray-700/50 hover:border-gray-600/50 min-h-14 rounded-xl transition-all duration-200">
                    <SelectValue placeholder="⏰ Choose battle duration" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800/95 border border-gray-700/50 backdrop-blur-xl rounded-xl max-h-64">
                    {BATTLE_DURATIONS.map((duration) => (
                      <SelectItem
                        key={duration.value}
                        value={duration.value.toString()}
                        className="hover:bg-gray-700/50 rounded-lg my-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-between w-full py-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-lg flex items-center justify-center">
                              <Clock className="w-4 h-4 text-orange-400" />
                            </div>
                            <div className="text-start">
                              <span className="font-medium text-white">
                                {duration.label}
                              </span>
                              <div className="text-xs text-gray-400">
                                {duration.description}
                              </div>
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-orange-500/30 text-orange-300"
                          >
                            {formatDuration(duration.value)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedDurationInfo && (
                  <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-xl p-4">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-orange-400 flex-shrink-0" />
                      <div>
                        <p className="text-orange-300 font-medium">
                          {selectedDurationInfo.description}
                        </p>
                        <p className="text-orange-200/80 text-sm">
                          Battle will last for{" "}
                          {formatDuration(selectedDuration)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <div className="bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-500/30 rounded-xl p-4 @container">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    </div>
                    <div className="w-full overflow-x-auto">
                      <h4 className="text-red-300 font-semibold mb-1">
                        Battle Creation Failed
                      </h4>
                      <p className="text-red-200/80 text-sm">{error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {!isSuccess && (
          <DialogFooter className="relative z-10 pt-6">
            {/* Step 1: Approval */}
            {currentStep === "approval" && (
              <div className="w-full space-y-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                      1
                    </div>
                    <span>Approve</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <span>Create Battle</span>
                  </div>
                </div>
                <Button
                  onClick={handleApprove}
                  disabled={!selectedTokenId || !hasPositions || isApproving}
                  className="w-full bg-gradient-to-r from-green-500 via-emerald-600 to-teal-600 hover:from-green-600 hover:via-emerald-700 hover:to-teal-700 h-14 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      <span className="text-lg">Approving...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-6 h-6 mr-3" />
                      <span className="text-lg">Approve LP Position</span>
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Step 2: Battle Creation */}
            {currentStep === "creation" && (
              <div className="w-full space-y-4">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <CheckCircle className="w-4 h-4" />
                    </div>
                    <span>Approved</span>
                  </div>
                  <ArrowRight className="w-4 h-4" />
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center text-white font-bold">
                      2
                    </div>
                    <span>Create Battle</span>
                  </div>
                </div>
                <Button
                  onClick={handleCreateBattleAfterApproval}
                  disabled={isCreating}
                  className="w-full bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 hover:from-cyan-600 hover:via-purple-700 hover:to-pink-700 h-14 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                      <span className="text-lg">Forging Battle...</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-6 h-6 mr-3" />
                      <span className="text-lg">
                        Launch {battleType === "range" ? "Range" : "Fee"} Battle
                      </span>
                      <ArrowRight className="w-6 h-6 ml-3" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Initial state - Start Process */}
            {currentStep === "checking" && (
              <Button
                onClick={handleCreateBattle}
                disabled={!selectedTokenId || !hasPositions}
                className="w-full bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 hover:from-cyan-600 hover:via-purple-700 hover:to-pink-700 h-14 rounded-xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-cyan-500/25 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Flame className="w-6 h-6 mr-3" />
                <span className="text-lg">
                  Start {battleType === "range" ? "Range" : "Fee"} Battle
                </span>
                <ArrowRight className="w-6 h-6 ml-3" />
              </Button>
            )}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Default trigger button component
export function CreateBattleButton() {
  return (
    <CreateBattleDialog
      trigger={
        <Button className="relative bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 hover:from-cyan-600 hover:via-purple-700 hover:to-pink-700 text-white h-14 px-4 rounded-2xl font-bold shadow-2xl shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 transform hover:scale-105 active:scale-95 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 via-purple-400/20 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center space-x-3">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Swords className="w-5 h-5" />
            </div>
            <span className="text-lg">Create Epic Battle</span>
          </div>
        </Button>
      }
    />
  );
}
