/*
 * Fabric Client Module
 * Wraps fabric-network SDK for easy transaction submission and evaluation.
 */

const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

// Configuration from Env Vars or Defaults
const CONNECTION_PROFILE_PATH = process.env.FABRIC_CONNECTION_PROFILE || path.resolve(__dirname, '../../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
const WALLET_PATH = process.env.FABRIC_WALLET || path.resolve(__dirname, 'wallet');
const CHANNEL_NAME = process.env.FABRIC_CHANNEL || 'mychannel';
const CHAINCODE_NAME = process.env.FABRIC_CHAINCODE || 'rbac';
const DISCOVERY_ENABLED = process.env.FABRIC_DISCOVERY === 'true';

/**
 * loads the common connection profile
 */
const loadCCP = () => {
    if (!fs.existsSync(CONNECTION_PROFILE_PATH)) {
        throw new Error(`Connection profile not found at: ${CONNECTION_PROFILE_PATH}`);
    }
    const ccp = JSON.parse(fs.readFileSync(CONNECTION_PROFILE_PATH, 'utf8'));
    return ccp;
};

/**
 * Connect to the Gateway
 * @param {string} identityLabel - The label of the identity in the wallet (e.g., 'appUser', 'admin')
 */
const connect = async (identityLabel) => {
    // Load Wallet
    const wallet = await Wallets.newFileSystemWallet(WALLET_PATH);

    // Check if identity exists
    const identity = await wallet.get(identityLabel);
    if (!identity) {
        throw new Error(`An identity for the user "${identityLabel}" does not exist in the wallet. Please register via CA first (not implemented in this snippet).`);
    }

    // Connect to Gateway
    const gateway = new Gateway();
    const ccp = loadCCP();

    await gateway.connect(ccp, {
        wallet,
        identity: identityLabel,
        discovery: { enabled: DISCOVERY_ENABLED, asLocalhost: true }
    });

    // Get Network and Contract
    const network = await gateway.getNetwork(CHANNEL_NAME);
    const contract = network.getContract(CHAINCODE_NAME);

    return { gateway, contract };
};

/**
 * Submit a transaction (Ordering Service involved)
 * Use for state-changing operations: registerUser, requestRole, etc.
 */
const submitTransaction = async (identityLabel, functionName, ...args) => {
    let gateway;
    try {
        const connection = await connect(identityLabel);
        gateway = connection.gateway;
        const contract = connection.contract;

        console.log(`[Submit] ${functionName} as ${identityLabel} with args: ${args.join(', ')}`);

        const result = await contract.submitTransaction(functionName, ...args);

        // Result is Buffer
        if (result && result.length > 0) {
            return result.toString('utf8');
        }
        return null;

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        throw error;
    } finally {
        if (gateway) {
            gateway.disconnect();
        }
    }
};

/**
 * Evaluate a transaction (Query only, no Orderer)
 * Use for reading state: getUser, getRole, etc.
 */
const evaluateTransaction = async (identityLabel, functionName, ...args) => {
    let gateway;
    try {
        const connection = await connect(identityLabel);
        gateway = connection.gateway;
        const contract = connection.contract;

        console.log(`[Evaluate] ${functionName} as ${identityLabel} with args: ${args.join(', ')}`);

        const result = await contract.evaluateTransaction(functionName, ...args);

        if (result && result.length > 0) {
            return result.toString('utf8');
        }
        return null;

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        throw error;
    } finally {
        if (gateway) {
            gateway.disconnect();
        }
    }
};

module.exports = {
    submitTransaction,
    evaluateTransaction,
    WALLET_PATH
};
