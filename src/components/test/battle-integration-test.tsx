"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useUserLPPositions } from "@/hooks/use-lp-positions";
import { useCreateBattle, BATTLE_DURATIONS } from "@/hooks/use-create-battle";
import { CONTRACTS } from "@/lib/config";
import { LPPositionCard } from "@/components/test/lp-position-card";
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Sword, 
  Target, 
  Coins,
  Wallet,
  RefreshCw
} from "lucide-react";

export function BattleIntegrationTest() {
  const { address, isConnected } = useAccount();
  const [selectedTokenId, setSelectedTokenId] = useState<string>("");
  const [battleType, setBattleType] = useState<'range' | 'fee'>('range');

  // Test LP positions fetching
  const { 
    positions, 
    isLoading: positionsLoading, 
    error: positionsError,
    refetch: refetchPositions 
  } = useUserLPPositions();

  // Test battle creation
  const { 
    createBattle, 
    isCreating, 
    isSuccess, 
    error: createError,
    transactionHash,
    resetState 
  } = useCreateBattle();

  // Note: Battle list functionality removed - focusing only on create battle feature

  const handleCreateTestBattle = async () => {
    if (!selectedTokenId) return;

    await createBattle({
      tokenId: selectedTokenId,
      duration: 3600, // 1 hour
      battleType,
    });
  };

  if (!isConnected) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Wallet className="w-5 h-5 mr-2" />
            Battle Integration Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-yellow-500/50 bg-yellow-500/10">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <AlertDescription className="text-yellow-400">
              Please connect your wallet to test the battle integration.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <span className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Battle Integration Test
            </span>
            <Badge variant="secondary">
              Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Contract Addresses */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-white">Contract Addresses</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-800/50 p-3 rounded">
                <div className="text-gray-400">Range Battle:</div>
                <div className="text-cyan-400 font-mono">{CONTRACTS.RANGE_BATTLE}</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded">
                <div className="text-gray-400">Fee Battle:</div>
                <div className="text-purple-400 font-mono">{CONTRACTS.FEE_BATTLE}</div>
              </div>
              <div className="bg-gray-800/50 p-3 rounded">
                <div className="text-gray-400">Position Manager:</div>
                <div className="text-green-400 font-mono">{CONTRACTS.POSITION_MANAGER}</div>
              </div>
            </div>
          </div>

          {/* LP Positions Test */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">LP Positions</h3>
              <Button 
                onClick={() => refetchPositions()}
                size="sm"
                variant="outline"
                className="border-gray-600"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
            </div>
            
            {positionsLoading ? (
              <div className="flex items-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400 mr-2" />
                <span className="text-gray-400">Loading LP positions...</span>
              </div>
            ) : positionsError ? (
              <Alert className="border-red-500/50 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">
                  Error loading positions: {positionsError.message}
                </AlertDescription>
              </Alert>
            ) : positions.length === 0 ? (
              <Alert className="border-yellow-500/50 bg-yellow-500/10">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <AlertDescription className="text-yellow-400">
                  No LP positions found. You need LP tokens to create battles.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <div className="text-green-400 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Found {positions.length} LP position(s)
                </div>
                <div className="grid gap-2">
                  {positions.slice(0, 3).map((position) => (
                    <LPPositionCard
                      key={position.tokenId}
                      position={position}
                      isSelected={selectedTokenId === position.tokenId}
                      onClick={() => setSelectedTokenId(position.tokenId)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Battle Creation Test */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Create Battle Test</h3>
            
            {isSuccess ? (
              <Alert className="border-green-500/50 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-400">
                  Battle created successfully!
                  {transactionHash && (
                    <div className="text-sm text-gray-400 mt-1">
                      TX: {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            ) : createError ? (
              <Alert className="border-red-500/50 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-400">
                  Error creating battle: {createError}
                </AlertDescription>
              </Alert>
            ) : null}

            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <Button
                  onClick={() => setBattleType('range')}
                  variant={battleType === 'range' ? 'default' : 'outline'}
                  size="sm"
                  className={battleType === 'range' ? 'bg-cyan-600' : 'border-gray-600'}
                >
                  <Target className="w-4 h-4 mr-1" />
                  Range
                </Button>
                <Button
                  onClick={() => setBattleType('fee')}
                  variant={battleType === 'fee' ? 'default' : 'outline'}
                  size="sm"
                  className={battleType === 'fee' ? 'bg-purple-600' : 'border-gray-600'}
                >
                  <Coins className="w-4 h-4 mr-1" />
                  Fee
                </Button>
              </div>
              
              <Button
                onClick={handleCreateTestBattle}
                disabled={!selectedTokenId || isCreating}
                className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Sword className="w-4 h-4 mr-2" />
                    Create Test Battle
                  </>
                )}
              </Button>

              {(isSuccess || createError) && (
                <Button
                  onClick={resetState}
                  variant="outline"
                  size="sm"
                  className="border-gray-600"
                >
                  Reset
                </Button>
              )}
            </div>
          </div>

          {/* Create Battle Focus */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-white">Battle Creation Focus</h3>
            <div className="bg-gray-800/50 p-4 rounded">
              <div className="text-sm text-gray-300">
                ✅ <strong>Create Battle Feature:</strong> Fully implemented with LP position selection, battle type choice, and duration options.
              </div>
              <div className="text-sm text-gray-400 mt-2">
                📝 <strong>Note:</strong> Battle list functionality has been removed to focus on the create battle feature as requested.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
