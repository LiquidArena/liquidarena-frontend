import { useListOfBattles } from "@/hooks/use-battle-data";
import { useMultipleBattleStatus } from "@/hooks/use-multiple-battle-status";
import { BattleData, BattleStats } from "@/types/arena";
import { useMemo, useState } from "react";

export const useArena = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const {
    data,
    isLoading: isLoadingBattles,
    error: battlesError,
  } = useListOfBattles();

  // Extract battle IDs for status fetching
  const battleIds = useMemo(() => {
    return (
      data?.LPBattleVault_BattleCreated?.map((battle) =>
        battle.battleId.toString(),
      ) || []
    );
  }, [data]);

  // Fetch battle statuses and player counts from contract
  const {
    statusMap,
    playerCountMap,
    isLoading: isLoadingStatuses,
    error: statusesError,
  } = useMultipleBattleStatus(battleIds);

  // Transform data with real contract status
  const battles: BattleData[] = useMemo(() => {
    if (!data?.LPBattleVault_BattleCreated) return [];

    return data.LPBattleVault_BattleCreated.map((battle) => ({
      id: battle.id,
      battleId: battle.battleId.toString(),
      creator: battle.creator,
      creatorTokenId: battle.creatorTokenId.toString(),
      duration: battle.duration.toString(),
      totalValueUSD: battle.totalValueUSD.toString(),
      status: statusMap[battle.battleId.toString()] || "queued",
      createdAt: "Recently",
    }));
  }, [data, statusMap]);

  // Calculate stats based on contract statuses
  const stats: BattleStats = useMemo(() => {
    const queuedBattles = battles.filter((b) => b.status === "queued").length;
    const onGoingBattles = battles.filter((b) => b.status === "onGoing").length;
    const readyToResolveBattles = battles.filter(
      (b) => b.status === "readyToResolve",
    ).length;
    const endedBattles = battles.filter((b) => b.status === "ended").length;

    const totalVolume = battles.reduce((sum, battle) => {
      return sum + parseFloat(battle.totalValueUSD) / 1e18;
    }, 0);

    return {
      queuedBattles,
      onGoingBattles,
      readyToResolveBattles,
      endedBattles,
      totalBattles: battles.length,
      totalVolume,
    };
  }, [battles]);

  // Filter battles
  const filteredBattles = useMemo(() => {
    return battles.filter((battle) => {
      const matchesSearch =
        battle.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
        battle.battleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        battle.creatorTokenId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === "all" || battle.status === filterStatus;

      return matchesSearch && matchesStatus;
    });
  }, [battles, searchTerm, filterStatus]);

  const isLoading = isLoadingBattles || isLoadingStatuses;
  const error = battlesError || statusesError;

  return {
    // Data
    battles: filteredBattles,
    stats,
    isLoading,
    error,
    playerCountMap,

    // Filters
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,

    // Dialog
    isCreateDialogOpen,
    setIsCreateDialogOpen,
  };
};
