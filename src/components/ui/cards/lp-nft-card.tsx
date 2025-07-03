import { cn } from "@/lib/utils";
import { Coins } from "lucide-react";

import { Badge } from "../badge";

export default function LPNFTCard({
  pairs,
  value,
  isActive,
}: {
  pairs: string;
  value: string;
  isActive: boolean;
}) {
  return (
    <div className="flex gap-4 items-center py-2 px-4 bg-slate-600/10 w-full rounded-2xl hover:shadow-lg transition-all duration-300 ease-in-out">
      <div className="bg-slate-600/10 border-slate-200/5 shadow-md border p-2 rounded-xl">
        <Coins className="text-slate-200" />
      </div>
      <div>
        <p>{pairs}</p>
        <span className="text-sm">{value}</span>
      </div>
      <Badge
        className={cn("ml-auto", {
          "bg-green-200 text-green-600": isActive,
          "bg-orange-200 text-orange-600": !isActive,
        })}
      >
        {isActive ? "active" : "in-battle"}
      </Badge>
    </div>
  );
}
