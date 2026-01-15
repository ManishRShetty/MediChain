# MedicalChain Fabric Migration

This directory contains the migrated Hyperledger Fabric components replacing the original Ethereum/Web3 implementation.

## Project Structure

- **`chaincode/rbac/`**: The `RBAC` smart contract converted to Fabric Chaincode (Node.js).
- **`backend/`**: Node.js Express backend using `fabric-network` SDK to interact with the chaincode.
- **`scripts/`**: Helper scripts to deploy locally to `fabric-samples/test-network`.

## Local Development Guide

### 1. Prerequisites
- [Hyperledger Fabric Prerequisites](https://hyperledger-fabric.readthedocs.io/en/latest/prereqs.html) (Docker, Go, Node.js)
- `fabric-samples` installed/cloned locally.

### 2. Start Fabric Network

Navigate to your `fabric-samples/test-network` directory:

```bash
cd path/to/fabric-samples/test-network
./network.sh up createChannel -c mychannel -ca -s couchdb
```

### 3. Deploy Chaincode

You can use the helper script in `fabric/scripts/`:

```bash
cd fabric/scripts
./deploy_easy.sh <PATH_TO_FABRIC_SAMPLES>
```

Or manually:

```bash
# From fabric-samples/test-network
./network.sh deployCC \
  -ccn rbac \
  -ccp <ABSOLUTE_PATH_TO_REPO>/fabric/chaincode/rbac \
  -ccl javascript \
  -c mychannel
```

### 4. Setup Backend Identities

Navigate to `fabric/backend`:

```bash
cd fabric/backend
npm install
```

Set the connection profile path (update environment variable or edit file if needed). By default it looks for `../../fabric-samples/...`. If your `fabric-samples` is elsewhere, export:

```bash
export FABRIC_CONNECTION_PROFILE=/path/to/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json
```

Enroll Admin and Register User:

```bash
node enrollAdmin.js
node registerUser.js appUser
```

### 5. Run Backend

```bash
export FABRIC_WALLET=./wallet
export FABRIC_IDENTITY=appUser
export FABRIC_CHAINCODE=rbac
npm start
```

Backend will run on port **8000**.

### 6. Verify Endpoints

**Register User:**
```bash
curl -X POST http://localhost:8000/api/v1/registerUser \
  -H 'Content-Type: application/json' \
  -d '{"wallet_address":"appUser","name":"Alice","address":"123 Main St"}'
```

**Get Role:**
```bash
curl http://localhost:8000/api/v1/role/appUser
```

**Run Automated Tests:**
```bash
npm test
```

## CI/CD Service

The GitHub Actions workflow `.github/workflows/fabric-integration.yml` automatically checks out the repo, installs Fabric, deploys the chaincode, and runs the backend integration tests on every push.
