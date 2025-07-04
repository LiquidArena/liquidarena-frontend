import { cn } from "@/lib/utils";
import { Skull, Trophy } from "lucide-react";

type RecentBattleCardProps = {
  isWinner: boolean;
  opponentAddress: string;
  amount: string;
  timeStamp: string;
};

export default function RecentBattleCard({
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
          "bg-green-200/10 hover:shadow-green-900/50": isWinner,
          "bg-red-200/10 hover:shadow-red-900/50": !isWinner,
        },
      )}
    >
      <div
        className={cn("shadow-md border p-2 rounded-xl", {
          "bg-green-600/10 border-slate-200/5": isWinner,
          "bg-red-600/10 border-slate-200/5": !isWinner,
        })}
      >
        {isWinner ? (
          <Trophy className="text-slate-200" />
        ) : (
          <Skull className="text-slate-200" />
        )}
      </div>
      <div>
        <p className="font-bold">{isWinner ? "WIN" : "LOSE"}</p>
        <ul className="text-xs text-slate-400">
          <li>vs {opponentAddress}</li>
          <li>
            {amount} | {timeStamp}
          </li>
        </ul>
      </div>
      <p className="absolute text-5xl font-bold -bottom-2.5 right-4 italic opacity-10 group-hover:opacity-50 transition-opacity duration-300 ease-in-out">
        {isWinner ? "+" : "-"}
        {amount}
      </p>
    </div>
  );
}
