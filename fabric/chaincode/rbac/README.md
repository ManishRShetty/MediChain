# RBAC Chaincode

Hyperledger Fabric implementation of the Role-Based Access Control (RBAC) smart contract.

## Prerequisites

- Node.js v18+
- Hyperledger Fabric Test Network

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run Tests:
   ```bash
   npm test
   ```

## Deployment API

To deploy on Fabric Test Network:

1. **Package**:
   ```bash
   peer lifecycle chaincode package rbac.tar.gz --path ./fabric/chaincode/rbac --lang node --label rbac_1.0
   ```

2. **Install** (on peers):
   ```bash
   peer lifecycle chaincode install rbac.tar.gz
   ```

3. **Approve** (Org Admin):
   ```bash
   peer lifecycle chaincode approveformyorg ... --package-id <ID> ...
   ```

4. **Commit**:
   ```bash
   peer lifecycle chaincode commit ...
   ```

## Usage

**Init Ledger (Constructor equivalent)**
```bash
peer chaincode invoke ... -c '{"Args":["initLedger"]}'
```

**Register User**
```bash
peer chaincode invoke ... -c '{"Args":["registerUser", "Alice", "123 Main St"]}'
```

**Request Role (Doctor = 3)**
```bash
peer chaincode invoke ... -c '{"Args":["requestRole", "3"]}'
```
