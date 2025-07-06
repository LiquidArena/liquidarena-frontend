import GridPatternBackground from "@/components/ui/grid-pattern-background";
import BattleView from "@/components/view/arena/battle-page";

interface BattlePageProps {
  params: { id: string };
}

export default function BattlePage({ params }: BattlePageProps) {
  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20">
      <GridPatternBackground />
      <BattleView battleId={params.id} />
    </section>
  );
}
