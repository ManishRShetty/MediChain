# Solidity to Fabric Chaincode Mapping (RBAC)

| Solidity Function | Chaincode Function | State Key(s) Used | Notes |
|-------------------|--------------------|-------------------|-------|
| `constructor()` | `initLedger(ctx)` | `USER_{id}`, `DEPLOYER` | Sets caller as Admin |
| `registerUser(name, physAddr)` | `registerUser(ctx, name, physAddr)` | `USER_{id}` | Uses standard JSON |
| `requestRole(role)` | `requestRole(ctx, role)` | `USER_{id}`, `REQUEST_{id}` | Enforces Role Enum as Int |
| `approveRole(user)` | `approveRole(ctx, user)` | `USER_{user}`, `REQUEST_{user}` | Checks `DEPLOYER` and Admin role |
| `getRole(user)` | `getRole(ctx, user)` | `USER_{user}` | |
| `getUser(user)` | `getUser(ctx, user)` | `USER_{user}` | Returns JSON string |
| `getAllRoleRequests()` | `getAllRoleRequests(ctx)` | `REQUEST_{id}` (Range Query) | Iterates `REQUEST_` keys |
| `getPendingRequestsCount()` | `getPendingRequestsCount(ctx)` | `REQUEST_{id}` (Range Query) | Helper function |
| `getUsersByRole(role)` | `getUsersByRole(ctx, role)` | `USER_{id}` (Range Query) | Iterates `USER_` keys (Scan) |

## Data Structures

**UserInfo (Solidity)**
```solidity
struct UserInfo {
    string name;
    string physicalAddress;
    address walletAddress;
    Role role;
    bool isRegistered;
}
```

**UserInfo (Fabric JSON)**
```json
{
    "name": "Alice",
    "physicalAddress": "123 Street",
    "walletAddress": "UserClientID",
    "role": 0, // Integer (0=None, 1=Admin...)
    "isRegistered": true
}
```

## Key Differences

1. **Identity**: Solidity uses `msg.sender` (wallet address). Fabric uses `ctx.clientIdentity.getID()` (Client Identity).
2. **Iteration**: Solidity iterates an array accessing a mapping. Fabric iterates keys via `getStateByRange` ('USER_').
3. **Modifiers**: `onlyRole` and `onlyDeployer` are implemented as helper methods call at the start of functions.
