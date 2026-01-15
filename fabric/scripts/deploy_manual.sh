#!/bin/bash

# deploy_manual.sh
# Usage: ./deploy_manual.sh [PATH_TO_FABRIC_SAMPLES]

# Set Setup
FABRIC_SAMPLES_DIR="${1:-../fabric-samples}"
export PATH=${FABRIC_SAMPLES_DIR}/bin:$PATH
export FABRIC_CFG_PATH=${FABRIC_SAMPLES_DIR}/config/

# Chaincode details
CC_NAME="rbac"
CC_SRC_PATH="$(cd "$(dirname "$0")/../chaincode/rbac" && pwd)"
CC_VERSION="1.0"
CC_SEQUENCE="1"
CHANNEL_NAME="mychannel"
ORDERER_CA="${FABRIC_SAMPLES_DIR}/test-network/organizations/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem"

# Org Configs
ORG1_MSP="Org1MSP"
ORG1_MSP_DIR="${FABRIC_SAMPLES_DIR}/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp"
ORG1_TLS_ROOT="${FABRIC_SAMPLES_DIR}/test-network/organizations/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt"
ORG1_ADDRESS="localhost:7051"

ORG2_MSP="Org2MSP"
ORG2_MSP_DIR="${FABRIC_SAMPLES_DIR}/test-network/organizations/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp"
ORG2_TLS_ROOT="${FABRIC_SAMPLES_DIR}/test-network/organizations/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt"
ORG2_ADDRESS="localhost:9051"

# Helper Functions
setGlobals() {
  local ORG=$1
  if [ "$ORG" -eq 1 ]; then
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$ORG1_TLS_ROOT
    export CORE_PEER_MSPCONFIGPATH=$ORG1_MSP_DIR
    export CORE_PEER_ADDRESS=$ORG1_ADDRESS
  else
    export CORE_PEER_LOCALMSPID="Org2MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$ORG2_TLS_ROOT
    export CORE_PEER_MSPCONFIGPATH=$ORG2_MSP_DIR
    export CORE_PEER_ADDRESS=$ORG2_ADDRESS
  fi
}

echo "Packaging chaincode..."
peer lifecycle chaincode package ${CC_NAME}.tar.gz --path ${CC_SRC_PATH} --lang node --label ${CC_NAME}_${CC_VERSION}

echo "Installing on Org1..."
setGlobals 1
peer lifecycle chaincode install ${CC_NAME}.tar.gz

echo "Installing on Org2..."
setGlobals 2
peer lifecycle chaincode install ${CC_NAME}.tar.gz

# Get Package ID
setGlobals 1
PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | grep ${CC_NAME}_${CC_VERSION} | awk '{print $3}' | sed 's/,//')
echo "Package ID: ${PACKAGE_ID}"

echo "Approving for Org1..."
setGlobals 1
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} --package-id ${PACKAGE_ID} --sequence ${CC_SEQUENCE}

echo "Approving for Org2..."
setGlobals 2
peer lifecycle chaincode approveformyorg -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} --package-id ${PACKAGE_ID} --sequence ${CC_SEQUENCE}

echo "Committing chaincode definition..."
# Commit requires majority, so we target both peers here to be safe and demonstrate endorsement
setGlobals 1
peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com --tls --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} --peerAddresses localhost:7051 --tlsRootCertFiles $ORG1_TLS_ROOT --peerAddresses localhost:9051 --tlsRootCertFiles $ORG2_TLS_ROOT --version ${CC_VERSION} --sequence ${CC_SEQUENCE}

echo "Deployment via manual steps completed."
