import GridPatternBackground from "@/components/ui/grid-pattern-background";
import BattleView from "@/components/view/arena/battle-page";

interface BattlePageProps {
  params: Promise<{ id: string }>;
}

export default async function BattlePage({ params }: BattlePageProps) {
  const { id } = await params;

  return (
    <section className="min-h-screen bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-cyan-900/20">
      <GridPatternBackground />
      <BattleView battleId={id} />
    </section>
  );
}
