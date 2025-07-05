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
