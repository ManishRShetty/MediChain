# Backend Migration Checklist

- [x] **Setup Fabric Client**: Created `fabricClient.js` with `submitTransaction` and `evaluateTransaction`.
- [x] **Register User**: Migrated `/api/v1/registerUser` to use `fabric.submitTransaction(..., 'registerUser', ...)`
- [x] **Get Role**: Migrated `/api/v1/role/:user_address` using `fabric.evaluateTransaction`.
- [x] **Request Role**: Migrated `/api/v1/requestRole`.
- [x] **Approve Role**: Migrated `/api/v1/approve-role` (Requires Admin identity).
- [x] **Get Requests**: Migrated `/api/v1/getAllRoleRequests`.

## Pending Tasks for Full Migration

- [ ] **Product Registry**: Create `ProductRegistry` chaincode and migrate product routes (`registerProduct`, `getProduct`, etc.).
- [ ] **Trial Manager**: Create `TrialManager` chaincode and migrate trial routes (`submitTrial`, `approveTrial`, `viewTrial`).
- [ ] **Wallet Management**: Implement a proper CA registration flow (register/enroll) to populate the file system wallet (`fabric/backend/wallet`). Currently, we assume identities exist.
- [ ] **IPFS**: The existing IPFS `uploadToPinata` logic in `index.js` needs to be copied over or integrated if contracts reference IPFS Hashes (Trial Data).
- [ ] **Event Listeners**: If the frontend relies on socket events, implement `contract.addContractListener()` in `fabricClient.js` and emit socket events.
