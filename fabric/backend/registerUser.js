/*
 * Register User
 * Registers a new user with the CA (using Admin identity) and enrolls them.
 * Usage: node registerUser.js <userId>
 */

'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

// Config
const CCP_PATH = process.env.FABRIC_CONNECTION_PROFILE || path.resolve(__dirname, '../../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
const WALLET_PATH = process.env.FABRIC_WALLET || path.resolve(__dirname, 'wallet');
const CA_HOSTNAME = process.env.FABRIC_CA_HOSTNAME || 'ca.org1.example.com';
const ADMIN_ID = 'admin';

async function main() {
    try {
        // Args
        const userId = process.argv[2];
        if (!userId) {
            console.log('Usage: node registerUser.js <userId>');
            process.exit(1);
        }

        // 1. Load CCP
        if (!fs.existsSync(CCP_PATH)) {
            throw new Error(`Connection profile not found at ${CCP_PATH}`);
        }
        const ccp = JSON.parse(fs.readFileSync(CCP_PATH, 'utf8'));

        // 2. Setup CA
        const caKeys = Object.keys(ccp.certificateAuthorities);
        const caInfo = ccp.certificateAuthorities[CA_HOSTNAME] || ccp.certificateAuthorities[caKeys[0]];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // 3. Open Wallet
        const wallet = await Wallets.newFileSystemWallet(WALLET_PATH);

        // Check if user exists
        const userIdentity = await wallet.get(userId);
        if (userIdentity) {
            console.log(`An identity for the user "${userId}" already exists in the wallet`);
            return;
        }

        // Check if admin exists
        const adminIdentity = await wallet.get(ADMIN_ID);
        if (!adminIdentity) {
            console.log(`An identity for the admin user "${ADMIN_ID}" does not exist in the wallet`);
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // 4. Build Admin User Context (required for registering others)
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, ADMIN_ID);

        // 5. Register User
        console.log(`Registering user: ${userId}...`);
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: userId,
            role: 'client'
        }, adminUser);

        console.log(`Successfully registered user "${userId}" with secret: ${secret}`);

        // 6. Enroll User
        console.log(`Enrolling user: ${userId}...`);
        const enrollment = await ca.enroll({
            enrollmentID: userId,
            enrollmentSecret: secret
        });

        // 7. Import to Wallet
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: ccp.organizations['Org1'].mspid,
            type: 'X.509',
        };
        await wallet.put(userId, x509Identity);
        console.log(`Successfully enrolled user "${userId}" and imported it into the wallet`);

    } catch (error) {
        console.error(`Failed to register user "${process.argv[2]}": ${error}`);
        process.exit(1);
    }
}

main();
