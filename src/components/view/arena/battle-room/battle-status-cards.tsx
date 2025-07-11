"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GradientButton, GradientLink } from "@/components/ui/gradient-button";
import { AlertCircle, Trophy, Users } from "lucide-react";

import { formatAddress, getWinner } from "./utils";

export function LoadingState() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-24">
      <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Loading Battle...
          </h2>
          <p className="text-gray-400">
            Fetching battle details from blockchain
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

interface NotFoundStateProps {
  battleError?: any;
}

export function NotFoundState({ battleError }: NotFoundStateProps) {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-24">
      <Card className="bg-black/40 border-red-800/30 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Battle Not Found
          </h2>
          <p className="text-gray-400 mb-4">
            {battleError?.message ||
              "This battle doesn't exist or failed to load"}
          </p>
          <GradientLink href="/arena" className="text-center w-fit mx-auto">
            Return to Arena
          </GradientLink>
        </CardContent>
      </Card>
    </div>
  );
}

export function WaitingForOpponentState() {
  return (
    <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        <Users className="h-16 w-16 text-purple-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">
          Waiting for Opponent
        </h2>
        <p className="text-gray-400 mb-6">
          Share this battle ID to invite other players
        </p>
        <div className="animate-pulse">
          <div className="text-purple-400">
            Searching for worthy opponents...
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ReadyToResolveStateProps {
  resolveError: string | null;
  isResolving: boolean;
  handleResolveBattle: () => void;
}

export function ReadyToResolveState({
  resolveError,
  isResolving,
  handleResolveBattle,
}: ReadyToResolveStateProps) {
  return (
    <div className="text-center">
      <Card className="mb-8 bg-black/40 border-orange-800/30 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <Trophy className="h-16 w-16 text-orange-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Battle Ready to Resolve
          </h2>
          <p className="text-gray-400 mb-6">
            The battle has ended and can now be resolved
          </p>

          {resolveError && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-400/30 rounded-lg">
              <div className="text-red-400 text-sm">{resolveError}</div>
            </div>
          )}

          <GradientButton
            onClick={handleResolveBattle}
            disabled={isResolving}
            className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
            size="lg"
          >
            {isResolving ? "Resolving..." : "Resolve Battle"}
          </GradientButton>
        </CardContent>
      </Card>
    </div>
  );
}

interface BattleEndedStateProps {
  battleDetails: any;
}

export function BattleEndedState({ battleDetails }: BattleEndedStateProps) {
  const winner = getWinner(battleDetails);

  return (
    <Card className="bg-black/40 border-purple-800/30 backdrop-blur-sm">
      <CardContent className="p-8 text-center">
        <Trophy className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
        <h2 className="text-3xl font-bold text-white mb-4">Battle Complete!</h2>

        {(() => {
          if (!winner) {
            return (
              <div className="text-xl text-gray-300 mb-6">
                Battle ended - checking results...
              </div>
            );
          }

          return (
            <>
              <div className="text-xl text-gray-300 mb-2">
                Winner:{" "}
                <span
                  className={`font-bold ${
                    winner.winner === "creator"
                      ? "text-cyan-400"
                      : winner.winner === "opponent"
                        ? "text-pink-400"
                        : "text-yellow-400"
                  }`}
                >
                  {winner.winner === "creator"
                    ? `Creator (${formatAddress(battleDetails.creator)})`
                    : winner.winner === "opponent"
                      ? `Opponent (${formatAddress(battleDetails.opponent)})`
                      : "DRAW"}
                </span>
              </div>
              <div className="text-sm text-gray-400 mb-6">
                Reason: {winner.reason}
              </div>
            </>
          );
        })()}

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-gray-800/20">
            <div className="text-white font-medium">Creator Status</div>
            <div
              className={`text-lg font-bold ${
                battleDetails.creatorInRange ? "text-green-400" : "text-red-400"
              }`}
            >
              {battleDetails.creatorInRange ? "In Range" : "Out of Range"}
            </div>
          </div>
          <div className="p-4 rounded-lg bg-gray-800/20">
            <div className="text-white font-medium">Opponent Status</div>
            <div
              className={`text-lg font-bold ${
                battleDetails.opponentInRange
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {battleDetails.opponentInRange ? "In Range" : "Out of Range"}
            </div>
          </div>
        </div>

        <GradientLink href="/arena" className="text-center w-fit mx-auto">
          Return to Arena
        </GradientLink>
      </CardContent>
    </Card>
  );
}
