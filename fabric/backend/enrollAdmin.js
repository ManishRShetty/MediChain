/*
 * Enroll Admin
 * Enrolls the 'admin' identity from the CA and stores it in the wallet.
 * Usage: node enrollAdmin.js
 */

'use strict';

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');

// Config
const CCP_PATH = process.env.FABRIC_CONNECTION_PROFILE || path.resolve(__dirname, '../../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
const WALLET_PATH = process.env.FABRIC_WALLET || path.resolve(__dirname, 'wallet');
const CA_HOSTNAME = process.env.FABRIC_CA_HOSTNAME || 'ca.org1.example.com';

// Default Admin credentials for fabric-ca-server (test-network defaults)
const ADMIN_ID = 'admin';
const ADMIN_SECRET = 'adminpw';

async function main() {
    try {
        // 1. Load Connection Profile
        if (!fs.existsSync(CCP_PATH)) {
            console.error(`Connection profile not found at ${CCP_PATH}`);
            process.exit(1);
        }
        const ccp = JSON.parse(fs.readFileSync(CCP_PATH, 'utf8'));

        // 2. Create CA Client
        const caInfo = ccp.certificateAuthorities[CA_HOSTNAME];
        if (!caInfo) {
            console.error(`CA "${CA_HOSTNAME}" not found in connection profile.`);
            // Fallback to first CA if specific one not found
            const caKeys = Object.keys(ccp.certificateAuthorities);
            if (caKeys.length === 0) throw new Error("No CAs found in CCP");
            console.log(`Falling back to CA: ${caKeys[0]}`);
            var caAuth = ccp.certificateAuthorities[caKeys[0]];
        } else {
            var caAuth = caInfo;
        }

        const caTLSCACerts = caAuth.tlsCACerts.pem;
        const ca = new FabricCAServices(caAuth.url, { trustedRoots: caTLSCACerts, verify: false }, caAuth.caName);

        // 3. Create/Open Wallet
        const wallet = await Wallets.newFileSystemWallet(WALLET_PATH);
        console.log(`Wallet path: ${WALLET_PATH}`);

        // 4. Check if admin already enrolled
        const identity = await wallet.get(ADMIN_ID);
        if (identity) {
            console.log(`An identity for the admin user "${ADMIN_ID}" already exists in the wallet`);
            return;
        }

        // 5. Enroll Admin
        console.log(`Enrolling admin...`);
        const enrollment = await ca.enroll({ enrollmentID: ADMIN_ID, enrollmentSecret: ADMIN_SECRET });

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: ccp.organizations['Org1'].mspid,
            type: 'X.509',
        };

        await wallet.put(ADMIN_ID, x509Identity);
        console.log(`Successfully enrolled admin user "${ADMIN_ID}" and imported it into the wallet`);

    } catch (error) {
        console.error(`Failed to enroll admin user "${ADMIN_ID}": ${error}`);
        process.exit(1);
    }
}

main();
