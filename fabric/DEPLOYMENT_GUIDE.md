# Deployment Guide

This folder contains scripts to deploy the `rbac` chaincode to a local Hyperledger Fabric **Test Network**.

## Prerequisites

1. **fabric-samples** installed and binaries (`peer`, `configtxlator`, etc.) in your PATH.
2. Fabric network up and running (e.g., `./network.sh up createChannel`).

## Scripts

### 1. Easy Deployment (`deploy_easy.sh`)
Wraps the standard `network.sh deployCC` command.

```bash
cd fabric/scripts
./deploy_easy.sh <PATH_TO_FABRIC_SAMPLES>
# Example: ./deploy_easy.sh ~/fabric-samples
```

### 2. Manual Deployment (`deploy_manual.sh`)
Executes individual `peer lifecycle` commands (package, install, approve, commit). Useful for understanding the process or debugging.

```bash
cd fabric/scripts
./deploy_manual.sh <PATH_TO_FABRIC_SAMPLES>
```

### 3. Verification (`verify.sh`)
Runs sample transactions to verify the deployment.

```bash
cd fabric/scripts
./verify.sh <PATH_TO_FABRIC_SAMPLES>
```

## Quick Verification Commands

If you prefer one-liners:

**Check Commit Status:**
```bash
peer lifecycle chaincode querycommitted --channelID mychannel --name rbac
```

**Register User:**
```bash
peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA -C mychannel -n rbac --peerAddresses localhost:7051 --tlsRootCertFiles $ORG1_TLS_ROOT -c '{"function":"registerUser","Args":["Alice", "123 Main St"]}'
```
