/*
 * Migrated Backend (Fabric)
 * Replaces web3.js calls with fabricClient calls
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fabric = require('./fabricClient');

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

// Identity Strategy:
// For this migration, we assume the frontend sends 'user_address' or 'wallet_address'
// which matches an IDENTITY LABEL in the local file system wallet (fabric/backend/wallet).
// In a real app, you would use JWTs to map to an identity.
const DEFAULT_ADMIN = process.env.FABRIC_ADMIN || 'admin';

/* ----------------------------------------------------
   Endpoints
   ---------------------------------------------------- */

// Register User
// Solidity: registerUser(name, physicalAddress)
app.post("/api/v1/registerUser", async (req, res) => {
    try {
        // user to register (matches identity label in wallet that invokes this)
        const { name, address, wallet_address } = req.body;

        // Fabric Note: In our chaincode, registerUser registers the INVOKING identity.
        // So we must connect as 'wallet_address' to register itself.
        // BUT, usually a user is not registered in the wallet yet if they are new.
        // In CA based flows, you 'register' with CA, then 'enroll', then 'register' on chaincode.
        // For this migration, we assume the identity 'wallet_address' ALREADY exists in the wallet (enrolled).

        const result = await fabric.submitTransaction(wallet_address, 'registerUser', name, address);
        res.json({ message: "User registered", result: JSON.parse(result || '{}') });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ detail: error.message });
    }
});

// Get User Role
// Solidity: getRole(user) -> but our endpoint reads getUserRole(user)
// We use evaluateTransaction with the Admin identity usually, or the user themselves.
// We'll use the user passed in params if available in wallet, or fall back to Admin for reading public info.
app.get("/api/v1/role/:user_address", async (req, res) => {
    try {
        const userAddress = req.params.user_address; // This is the ID/Identity Label

        // Using Admin to query reading role of any user
        // Or could use userAddress if they are in wallet
        const result = await fabric.evaluateTransaction(DEFAULT_ADMIN, 'getRole', userAddress);

        res.json({ user: userAddress, role: result }); // result is "0", "1", etc.
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ detail: error.message });
    }
});

// Request Role
// Solidity: requestRole(roleEnum)
app.post("/api/v1/requestRole", async (req, res) => {
    try {
        const { user, role } = req.body; // user is identity label, role is int

        // Connect as the USER to request own role
        const result = await fabric.submitTransaction(user, 'requestRole', role.toString());
        res.json({ message: "Role requested", result });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Approve Role
// Solidity: approveRole(userToApprove) -- Only Admin/Deployer
app.post("/api/v1/approve-role", async (req, res) => {
    try {
        const { user } = req.body; // user to approve

        // Connect as ADMIN
        const result = await fabric.submitTransaction(DEFAULT_ADMIN, 'approveRole', user);

        res.json({ message: `Role approved for ${user}`, result });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Get All Role Requests
// Solidity: getAllRoleRequests()
app.get("/api/v1/getAllRoleRequests", async (req, res) => {
    try {
        // Can be called by anyone (public view) or Admin. construct uses Admin.
        const result = await fabric.evaluateTransaction(DEFAULT_ADMIN, 'getAllRoleRequests');
        const requests = JSON.parse(result || '[]');

        // Format to match old API if needed
        // Old API: { addresses: [], roles: [] }
        // New API: [{ address, role }, ...]
        // Keeping struct/JSON for better cleanliness or converting:

        const addresses = requests.map(r => r.address);
        const roles = requests.map(r => r.role);

        res.json({ addresses, roles, original: requests });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

// Get Pending Requests Count
app.get("/api/v1/pendingRequestsCount", async (req, res) => {
    try {
        const result = await fabric.evaluateTransaction(DEFAULT_ADMIN, 'getPendingRequestsCount');
        res.json({ pendingRequests: result }); // result is a number string
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Fabric Backend running on http://localhost:${port}`);
    console.log(`Using Wallet: ${fabric.WALLET_PATH}`);
});
