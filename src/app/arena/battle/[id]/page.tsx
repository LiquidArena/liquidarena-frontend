import GridPatternBackground from "@/components/ui/grid-pattern-background";
import BattleView from "@/components/view/arena/battle-page";

export default function BattlePage() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20">
      <GridPatternBackground />
      <BattleView />
    </section>
  );
}
