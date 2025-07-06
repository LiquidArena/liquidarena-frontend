# LP Positions with USD Hook

This hook provides a comprehensive solution for fetching user's LP NFT positions along with their USD values from the battle contract. It's designed to help identify which positions are compatible for joining battles.

## Files Created

1. **`/src/hooks/use-user-lp-positions-with-usd.ts`** - Main hook with utilities
2. **`/src/app/api/v1/positions/usd-value/route.ts`** - API endpoint for fetching USD values
3. **`/src/components/test/user-lp-positions-with-usd.tsx`** - Demo component showing usage

## Hook Usage

### Basic Usage

```tsx
import { useUserLPPositionsWithUSD } from "@/hooks/use-user-lp-positions-with-usd";

function MyComponent() {
  const {
    positions,           // All positions with USD data
    compatiblePositions, // Positions that can be used for battles
    isLoading,          // Overall loading state
    error,              // Any errors that occurred
    totalUsdValue,      // Total USD value of compatible positions
    hasCompatiblePositions, // Boolean flag
    refetch,            // Function to refresh data
  } = useUserLPPositionsWithUSD();

  // Use the data...
}
```

### Advanced Usage

```tsx
import { 
  useUserLPPositionsWithUSD, 
  useLPPositionWithUSD,
  isPositionCompatibleForBattle,
  formatUSDValue 
} from "@/hooks/use-user-lp-positions-with-usd";

function BattlePositionSelector() {
  const { compatiblePositions, isLoading } = useUserLPPositionsWithUSD();

  return (
    <div>
      {compatiblePositions.map(position => (
        <div key={position.tokenId}>
          <h3>{position.poolName}</h3>
          <p>Value: {formatUSDValue(position.usdValue)}</p>
          <p>Compatible: {isPositionCompatibleForBattle(position) ? "Yes" : "No"}</p>
        </div>
      ))}
    </div>
  );
}
```

## Data Structure

### LPPositionWithUSD Interface

```typescript
interface LPPositionWithUSD extends LPPosition {
  usdValue: LPUSDValue | null;      // USD value from battle contract
  isUsdLoading: boolean;            // Loading state for USD value
  usdError: Error | null;           // Error fetching USD value
  isOwner: boolean;                 // Whether user owns this position
}
```

### LPUSDValue Interface

```typescript
interface LPUSDValue {
  amount0: string;    // Token0 amount
  amount1: string;    // Token1 amount
  valueUSD: string;   // Total USD value
}
```

## Key Features

### 1. Comprehensive Position Data
- Fetches all user LP positions from the Position Manager
- Enriches each position with USD value from the battle contract
- Includes ownership verification

### 2. Battle Compatibility Filtering
- Automatically filters positions that can be used for battles
- Checks: ownership, non-zero USD value, active liquidity

### 3. Error Handling
- Graceful error handling for both position fetching and USD value fetching
- Continues to work even if some positions fail to load
- Provides detailed error information

### 4. Performance Optimized
- Parallel fetching of USD values for all positions
- Proper caching with React Query
- Configurable refetch intervals

## Utility Functions

### isPositionCompatibleForBattle(position)
Checks if a position can be used for battles:
- Must be owned by the user
- Must have a non-zero USD value
- Must have active liquidity

### formatUSDValue(usdValue)
Formats USD values for display:
- Handles different decimal places from contract
- Returns user-friendly formatted strings
- Handles null/zero values gracefully

## API Endpoint

The hook uses `/api/v1/positions/usd-value` endpoint which:
- Verifies token ownership
- Fetches USD value from the battle contract
- Returns structured data with error handling

### Request Format
```json
{
  "tokenId": "123",
  "userAddress": "0x..."
}
```

### Response Format
```json
{
  "usdValue": {
    "amount0": "1000000000",
    "amount1": "500000000000000000",
    "valueUSD": "2000000000"
  },
  "isOwner": true
}
```

## Integration with Existing Code

This hook is designed to work alongside existing hooks:
- `useUserLPPositions()` - Base position fetching
- `useLPPositionUSDValue()` - Individual USD value fetching
- `useCanJoinBattle()` - Battle eligibility checking

## Error Handling

The hook handles various error scenarios:
- Network errors
- Contract call failures
- Invalid token IDs
- Ownership verification failures
- Partial data loading (some positions succeed, others fail)

## Testing

Use the demo component to test the hook:

```tsx
import { UserLPPositionsWithUSDDemo } from "@/components/test/user-lp-positions-with-usd";

function TestPage() {
  return <UserLPPositionsWithUSDDemo />;
}
```

## Best Practices

1. **Always check `isConnected`** before using the hook
2. **Handle loading states** appropriately in your UI
3. **Use `compatiblePositions`** for battle-related functionality
4. **Implement error boundaries** for better error handling
5. **Cache data appropriately** using the built-in React Query integration