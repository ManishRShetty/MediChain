#!/bin/bash

# deploy_easy.sh
# Usage: ./deploy_easy.sh [PATH_TO_FABRIC_SAMPLES]

# Default to a common location or current directory dependency
FABRIC_SAMPLES_DIR="${1:-../fabric-samples}"
TEST_NETWORK_DIR="${FABRIC_SAMPLES_DIR}/test-network"

# Current Chaincode Path (Absolute or relative to test-network)
# We calculate absolute path to avoid relative path confusion when calling from another dir
CC_PATH="$(cd "$(dirname "$0")/../chaincode/rbac" && pwd)"

CC_NAME="rbac"
CC_LANG="javascript"
CC_VERSION="1.0"
CC_SEQUENCE="1"
CHANNEL_NAME="mychannel"

echo "Deploying Chaincode: ${CC_NAME}"
echo "Language: ${CC_LANG}"
echo "Path: ${CC_PATH}"
echo "Using network from: ${TEST_NETWORK_DIR}"

if [ ! -d "$TEST_NETWORK_DIR" ]; then
  echo "Error: fabric-samples/test-network directory not found at ${TEST_NETWORK_DIR}"
  echo "Please provide the path to fabric-samples as the first argument."
  echo "Example: ./deploy_easy.sh /home/user/fabric-samples"
  exit 1
fi

pushd "${TEST_NETWORK_DIR}"

# Ensure network is up (optional, but good check)
# ./network.sh up createChannel -c ${CHANNEL_NAME}

# Deploy Chaincode
# -ccn : Chaincode Name
# -ccp : Chaincode Path
# -ccl : Chaincode Language
# -ccv : Chaincode Version
# -ccs : Chaincode Sequence
./network.sh deployCC \
  -ccn "${CC_NAME}" \
  -ccp "${CC_PATH}" \
  -ccl "${CC_LANG}" \
  -ccv "${CC_VERSION}" \
  -ccs "${CC_SEQUENCE}" \
  -c "${CHANNEL_NAME}"

popd

echo "Chaincode Deployment Command Finished."
