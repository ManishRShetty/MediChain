/*
 * SPDX-License-Identifier: MIT
 */

'use strict';

const sinon = require('sinon');
const chai = require('chai');
const expect = chai.expect;

const RBAC = require('../lib/rbac');
const { Context } = require('fabric-contract-api');
const { ChaincodeStub } = require('fabric-shim');

describe('RBAC Smart Contract', () => {

    let contract;
    let ctx;
    let mockStub;

    // Role Enum for reference
    const Role = {
        None: 0,
        Admin: 1,
        Company: 2,
        Doctor: 3,
        Auditor: 4,
        Patient: 5
    };

    beforeEach(() => {
        contract = new RBAC();
        ctx = sinon.createStubInstance(Context);
        mockStub = sinon.createStubInstance(ChaincodeStub);
        ctx.stub = mockStub;

        // Mock Client Identity
        ctx.clientIdentity = {
            getID: sinon.stub().returns('User1')
        };

        // Mock State Handling
        this.mockState = {};
        mockStub.putState.callsFake(async (key, value) => {
            this.mockState[key] = value;
        });
        mockStub.getState.callsFake(async (key) => {
            return this.mockState[key] || Buffer.from('');
        });
        mockStub.deleteState.callsFake(async (key) => {
            delete this.mockState[key];
        });

        // Event Handling
        mockStub.setEvent.returns();
    });

    describe('initLedger', () => {
        it('should initialize the ledger with the deployer as Admin', async () => {
            await contract.initLedger(ctx);

            const adminUser = JSON.parse(this.mockState['USER_User1'].toString());
            expect(adminUser.role).to.equal(Role.Admin);
            expect(adminUser.walletAddress).to.equal('User1');
            expect(this.mockState['DEPLOYER'].toString()).to.equal('User1');
        });
    });

    describe('registerUser', () => {
        it('should register a new user', async () => {
            await contract.registerUser(ctx, 'Alice', 'Wonderland');

            const user = JSON.parse(this.mockState['USER_User1'].toString());
            expect(user.name).to.equal('Alice');
            expect(user.role).to.equal(Role.None);
            sinon.assert.calledWith(mockStub.setEvent, 'UserRegistered');
        });

        it('should fail if user already registered', async () => {
            await contract.registerUser(ctx, 'Alice', 'Wonderland');
            try {
                await contract.registerUser(ctx, 'Alice', 'Wonderland');
                expect.fail('Should have thrown error');
            } catch (err) {
                expect(err.message).to.equal('User already registered');
            }
        });
    });

    describe('requestRole', () => {
        beforeEach(async () => {
            // Register User1 first
            await contract.registerUser(ctx, 'Alice', 'Wonderland');
        });

        it('should allow user to request a valid role', async () => {
            await contract.requestRole(ctx, Role.Doctor);

            const request = JSON.parse(this.mockState['REQUEST_User1'].toString());
            expect(request.requestedRole).to.equal(Role.Doctor);
            expect(request.isPending).to.true;
        });

        it('should fail if requesting None or Admin', async () => {
            try {
                await contract.requestRole(ctx, Role.Admin);
                expect.fail();
            } catch (err) {
                expect(err.message).to.equal('Invalid role request');
            }
        });
    });

    describe('approveRole', () => {
        beforeEach(async () => {
            // Setup: Admin (User1) and Applicant (User2)
            // 1. Init Ledger to make User1 Admin
            await contract.initLedger(ctx);

            // 2. Register User2 (switch identity mock)
            ctx.clientIdentity.getID.returns('User2');
            await contract.registerUser(ctx, 'Bob', 'Builderland');

            // 3. User2 requests Role
            await contract.requestRole(ctx, Role.Company);

            // Switch back to Admin (User1)
            ctx.clientIdentity.getID.returns('User1');
        });

        it('should approve a pending request when called by Admin/Deployer', async () => {
            await contract.approveRole(ctx, 'User2');

            // Check User2 Role
            const user2 = JSON.parse(this.mockState['USER_User2'].toString());
            expect(user2.role).to.equal(Role.Company);

            // Check Request Deleted
            expect(this.mockState['REQUEST_User2']).to.be.undefined;
        });

        it('should fail if caller is not Admin', async () => {
            // Switch to User3 (who is not registered or just not admin)
            ctx.clientIdentity.getID.returns('User3');

            try {
                await contract.approveRole(ctx, 'User2');
                expect.fail();
            } catch (err) {
                // The error comes from _checkRole finding no user or non-admin user
                // Or _checkDeployer failing
                expect(err.message).to.include('Unauthorized');
            }
        });
    });

    describe('getAllRoleRequests', () => {
        it('should return all pending requests', async () => {
            // Mock Iterator
            const mockIterator = {
                next: sinon.stub()
            };
            // First call returns User2 request
            mockIterator.next.onFirstCall().resolves({
                done: false,
                value: {
                    key: 'REQUEST_User2',
                    value: Buffer.from(JSON.stringify({ requestedRole: Role.Doctor, isPending: true }))
                }
            });
            // Second call done
            mockIterator.next.onSecondCall().resolves({ done: true });

            mockStub.getStateByRange.returns(mockIterator);

            const results = await contract.getAllRoleRequests(ctx);
            const parsed = JSON.parse(results);

            expect(parsed).to.have.lengthOf(1);
            expect(parsed[0].address).to.equal('User2');
            expect(parsed[0].role).to.equal(Role.Doctor);
        });
    });

});
