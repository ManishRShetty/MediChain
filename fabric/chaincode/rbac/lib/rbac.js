/*
 * SPDX-License-Identifier: MIT
 */

'use strict';

const { Contract } = require('fabric-contract-api');

// Role Enum Mapping to preserve Solidity logic (0=None, 1=Admin, etc.)
const Role = {
    None: 0,
    Admin: 1,
    Company: 2,
    Doctor: 3,
    Auditor: 4,
    Patient: 5
};

class RBAC extends Contract {

    async initLedger(ctx) {
        const id = ctx.clientIdentity.getID();

        // Simulating constructor: msg.sender becomes Admin
        const userInfo = {
            name: "Admin",
            physicalAddress: "Admin Location",
            walletAddress: id, // Mapping Fabric ID to walletAddress field
            role: Role.Admin,
            isRegistered: true
        };

        await ctx.stub.putState(`USER_${id}`, Buffer.from(JSON.stringify(userInfo)));

        // Track the deployer as a separate key if needed for 'onlyDeployer' Logic
        // In Solidity: address public immutable deployer;
        await ctx.stub.putState('DEPLOYER', Buffer.from(id));

        // Emit RoleAssigned event
        const eventPayload = { user: id, role: Role.Admin };
        ctx.stub.setEvent('RoleAssigned', Buffer.from(JSON.stringify(eventPayload)));

        console.log(`Ledger initialized. Deployer/Admin: ${id}`);
    }

    // Helper to get user from state
    async _getUser(ctx, id) {
        const userBytes = await ctx.stub.getState(`USER_${id}`);
        if (!userBytes || userBytes.length === 0) {
            return null;
        }
        return JSON.parse(userBytes.toString());
    }

    // Modifier: onlyRole
    async _checkRole(ctx, requiredRole) {
        const id = ctx.clientIdentity.getID();
        const user = await this._getUser(ctx, id);

        if (!user || user.role !== requiredRole) {
            throw new Error(`Unauthorized: Incorrect Role. Required: ${requiredRole}, Current: ${user ? user.role : 'None'}`);
        }
    }

    // Modifier: onlyDeployer
    async _checkDeployer(ctx) {
        const id = ctx.clientIdentity.getID();
        const deployerBytes = await ctx.stub.getState('DEPLOYER');
        if (!deployerBytes || deployerBytes.toString() !== id) {
            throw new Error("Unauthorized: Only Deployer");
        }
    }

    async registerUser(ctx, name, physicalAddress) {
        const id = ctx.clientIdentity.getID();

        const existingUser = await this._getUser(ctx, id);
        if (existingUser && existingUser.isRegistered) {
            throw new Error("User already registered");
        }

        const userInfo = {
            name: name,
            physicalAddress: physicalAddress,
            walletAddress: id,
            role: Role.None,
            isRegistered: true
        };

        await ctx.stub.putState(`USER_${id}`, Buffer.from(JSON.stringify(userInfo)));

        // Emit UserRegistered event
        const eventPayload = { user: id, name, physicalAddress, walletAddress: id };
        ctx.stub.setEvent('UserRegistered', Buffer.from(JSON.stringify(eventPayload)));

        return JSON.stringify(userInfo);
    }

    async requestRole(ctx, role) {
        const id = ctx.clientIdentity.getID();
        const intRole = parseInt(role);

        const user = await this._getUser(ctx, id);
        if (!user || !user.isRegistered) {
            throw new Error("User must be registered first");
        }

        if (intRole === Role.None || intRole === Role.Admin) {
            throw new Error("Invalid role request");
        }

        // Check if request already pending
        const requestBytes = await ctx.stub.getState(`REQUEST_${id}`);
        if (requestBytes && requestBytes.length > 0) {
            const req = JSON.parse(requestBytes.toString());
            if (req.isPending) {
                throw new Error("Already requested");
            }
        }

        const request = {
            requestedRole: intRole,
            isPending: true
        };

        await ctx.stub.putState(`REQUEST_${id}`, Buffer.from(JSON.stringify(request)));

        // Emit RoleRequested
        ctx.stub.setEvent('RoleRequested', Buffer.from(JSON.stringify({ user: id, role: intRole })));
    }

    // Only Admin AND Only Deployer (as per Solidity code: onlyRole(Role.Admin) onlyDeployer)
    async approveRole(ctx, userToApproveId) {
        // Checks
        await this._checkRole(ctx, Role.Admin);
        await this._checkDeployer(ctx);

        const requestBytes = await ctx.stub.getState(`REQUEST_${userToApproveId}`);
        if (!requestBytes || requestBytes.length === 0) {
            throw new Error("No pending request");
        }

        const request = JSON.parse(requestBytes.toString());
        if (!request.isPending) {
            throw new Error("No pending request");
        }

        // Update User Role
        const user = await this._getUser(ctx, userToApproveId);
        if (!user) {
            throw new Error("User not found (state integrity error)");
        }

        user.role = request.requestedRole;
        await ctx.stub.putState(`USER_${userToApproveId}`, Buffer.from(JSON.stringify(user)));

        // Delete request (Solidity: delete roleRequests[_user])
        await ctx.stub.deleteState(`REQUEST_${userToApproveId}`);

        // Emit RoleAssigned
        ctx.stub.setEvent('RoleAssigned', Buffer.from(JSON.stringify({ user: userToApproveId, role: user.role })));
    }

    async getRole(ctx, userId) {
        const user = await this._getUser(ctx, userId);
        if (!user) return Role.None; // Default for non-existent
        return user.role;
    }

    async getUser(ctx, userId) {
        const user = await this._getUser(ctx, userId);
        if (!user || !user.isRegistered) {
            throw new Error("User not found");
        }
        return JSON.stringify(user);
    }

    // Simulating getAllRoleRequests by iterating range of REQUEST_ keys
    // Solidity iterates 'registeredUsers' and checks 'roleRequests[user].isPending'.
    // Here we can just iterate the REQUEST_ keys directly which is more efficient.
    async getAllRoleRequests(ctx) {
        const iterator = await ctx.stub.getStateByRange('REQUEST_', 'REQUEST_\uFFFF');
        let results = [];

        let result = await iterator.next();
        while (!result.done) {
            const key = result.value.key; // REQUEST_{id}
            const userId = key.split('_')[1];
            const request = JSON.parse(result.value.value.toString('utf8'));

            if (request.isPending) {
                results.push({
                    address: userId,
                    role: request.requestedRole
                });
            }
            result = await iterator.next();
        }
        return JSON.stringify(results);
    }

    // Helper for getUsersByRole
    // Using simple iteration over all users. In production handling thousands of users, 
    // you would use Rich Queries (CouchDB) `{"selector":{"role": X}}`.
    // Sticking to range iterator for 'USER_' to be safe for LevelDB too.
    async getUsersByRole(ctx, role) {
        const intRole = parseInt(role);
        const iterator = await ctx.stub.getStateByRange('USER_', 'USER_\uFFFF');
        let users = [];

        let result = await iterator.next();
        while (!result.done) {
            const user = JSON.parse(result.value.value.toString('utf8'));
            if (user.role === intRole) {
                // Return just the ID (address) as per Solidity: address[] memory
                users.push(user.walletAddress);
            }
            result = await iterator.next();
        }
        return JSON.stringify(users);
    }

    async getCompanies(ctx) { return this.getUsersByRole(ctx, Role.Company); }
    async getDoctors(ctx) { return this.getUsersByRole(ctx, Role.Doctor); }
    async getPatients(ctx) { return this.getUsersByRole(ctx, Role.Patient); }
    async getAuditors(ctx) { return this.getUsersByRole(ctx, Role.Auditor); }

    async getPendingRequestsCount(ctx) {
        // Re-use logic from getAllRoleRequests - efficient iteration
        const iterator = await ctx.stub.getStateByRange('REQUEST_', 'REQUEST_\uFFFF');
        let count = 0;

        let result = await iterator.next();
        while (!result.done) {
            const request = JSON.parse(result.value.value.toString('utf8'));
            if (request.isPending) count++;
            result = await iterator.next();
        }
        return count;
    }
}

module.exports = RBAC;
