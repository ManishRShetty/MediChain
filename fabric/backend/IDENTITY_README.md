# Identity Management

Scripts to populate the Fabric wallet.

## Prerequisites
- `npm install` inside `fabric/backend`
- Fabric Test Network up and running

## Usage

### 1. Enroll Admin
This must be done first to get the `admin` credentials from the Fabric CA.
```bash
node enrollAdmin.js
```
*Creates `wallet/admin.id`*

### 2. Register & Enroll User
Create a new identity (e.g., `appUser1`, `Alice`).
```bash
node registerUser.js appUser1
```
*Creates `wallet/appUser1.id`*

### 3. Use in Backend
The backend `fabricClient.js` expects these identities to exist in the `wallet` directory.
When submitting transactions, pass the identity label (e.g., `appUser1`).

## Troubleshooting
- **Connection Profile Not Found**: Check `CCP_PATH` in the scripts. Default assumes `../../fabric-samples/...`.
- **CA Hostname**: Ensure `ca.org1.example.com` matches your CCP.
