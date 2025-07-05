import { cn } from "@/lib/utils";
import { Hourglass, Skull, Trophy } from "lucide-react";

type RecentBattleCardProps = {
  isWinner: boolean;
  opponentAddress: string;
  amount: string;
  status: string;
  timeStamp?: string;
};

export default function RecentBattleCard({
  status,
  isWinner,
  opponentAddress,
  amount,
  timeStamp,
}: RecentBattleCardProps) {
  return (
    <div
      className={cn(
        "group overflow-hidden relative flex gap-4 items-center py-2 px-4 w-full rounded-2xl hover:shadow-lg transition-all duration-300 ease-in-out",
        {
          "bg-green-200/10 hover:shadow-green-900/50":
            isWinner && status === "ended",
          "bg-red-200/10 hover:shadow-red-900/50":
            !isWinner && status === "ended",
          "bg-amber-200/10 hover:shadow-amber-900/50":
            status === "queued" || status === "onGoing",
        },
      )}
    >
      <div
        className={cn("shadow-md border p-2 rounded-xl", {
          "bg-green-600/10 border-slate-200/5": isWinner,
          "bg-red-600/10 border-slate-200/5": !isWinner,
        })}
      >
        {status === "queued" ? (
          <Hourglass className="text-slate-200" />
        ) : isWinner ? (
          <Trophy className="text-slate-200" />
        ) : (
          <Skull className="text-slate-200" />
        )}
      </div>
      <div>
        <p className="font-bold">
          {status === "queued" ? "WAITING" : isWinner ? "WINNER" : "LOSER"}
        </p>
        <ul className="text-xs text-slate-400">
          <li>
            {status !== "queued"
              ? `vs ${opponentAddress}`
              : "Waiting for opponent..."}
          </li>
          <li>
            {amount} {timeStamp}
          </li>
        </ul>
      </div>
      <p className="absolute text-5xl font-bold -bottom-2.5 right-4 italic opacity-10 group-hover:opacity-50 transition-opacity duration-300 ease-in-out">
        {status !== "queued" && <>{isWinner ? "+" : "-"}</>}
        {amount}
      </p>
    </div>
  );
}

export function RecentBattleCardSkeleton() {
  return Array.from({ length: 2 }).map((_, i) => (
    <div
      key={i}
      className="bg-gray-200/10 animate-pulse px-4 py-2 min-h-16 rounded-xl"
    />
  ));
}
