import { GraphQLClient, gql } from "graphql-request";

const PONDER_GRAPHQL_URL =
  process.env.NEXT_PUBLIC_PONDER_GRAPHQL_URL || "http://localhost:42069";

export const graphqlClient = new GraphQLClient(PONDER_GRAPHQL_URL, {
  headers: {
    "Content-Type": "application/json",
  },
});

export const GET_ALL_BATTLES = gql`
  query GetAllBattles($limit: Int) {
    LPBattleVault_BattleCreated(order_by: { battleId: desc }, limit: $limit) {
      id
      battleId
      creator
      creatorTokenId
      duration
      totalValueUSD
    }
    LPFeeBattle_BattleCreated(order_by: { battleId: desc }, limit: $limit) {
      id
      battleId
      creator
      creatorTokenId
    }
  }
`;

export const GET_ALL_USER_BATTLES = gql`
  query GetAllUserBattles($userAddress: String!) {
    created: LPBattleVault_BattleCreated(
      where: { creator: { _eq: $userAddress } }
      order_by: { battleId: desc }
    ) {
      id
      battleId
      creator
      creatorTokenId
      duration
      totalValueUSD
    }

    joined: LPBattleVault_BattleJoined(
      where: { opponent: { _eq: $userAddress } }
      order_by: { battleId: desc }
    ) {
      id
      battleId
      opponent
      opponentTokenId
      startTime
    }

    won: LPBattleVault_BattleResolved(
      where: { winner: { _eq: $userAddress } }
      order_by: { battleId: desc }
    ) {
      id
      battleId
      winner
      resolverReward
    }

    # Get ALL resolved battles to calculate losses
    allResolved: LPBattleVault_BattleResolved(order_by: { battleId: desc }) {
      id
      battleId
      winner
      resolverReward
    }
  }
`;
