import { cn } from "@/lib/utils";

export default function ArchOrnament({
  position,
  direction,
}: {
  position: "top" | "bottom";
  direction: "left" | "right";
}) {
  return (
    <div
      className={cn(
        "absolute flex items-center gap-2 w-[calc(100%-40px)] justify-end",
        {
          "-top-1.5 left-0": position === "top" && direction === "left",
          "-top-1.5 right-0": position === "top" && direction === "right",
          "-bottom-11 lg:-bottom-5.5 left-0":
            position === "bottom" && direction === "left",
          "-bottom-11 lg:-bottom-5.5 right-0":
            position === "bottom" && direction === "right",
        },
      )}
    >
      <div className="bg-gray-300 skew-x-[3.6rad] w-10 h-0.5 -mr-2"></div>
      <div className="bg-gray-300 skew-x-[3.6rad] w-20 h-2"></div>
      <div className="bg-gray-300 skew-x-[3.6rad] w-40 h-2"></div>
    </div>
  );
}
