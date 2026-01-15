# API Verification Commands

Ensure your backend is running on `http://localhost:8000` and the Fabric Network is up.

## 1. Register User
Registers the user currently identified by the `wallet_address` (Identity Label).
```bash
curl -X POST http://localhost:8000/api/v1/registerUser \
  -H 'Content-Type: application/json' \
  -d '{"wallet_address":"appUser","name":"Alice","address":"123 Main St"}'
```

## 2. Request Role
Request to become a Doctor (Role ID: 3).
```bash
curl -X POST http://localhost:8000/api/v1/requestRole \
  -H 'Content-Type: application/json' \
  -d '{"user":"appUser","role":3}'
```

## 3. View Pending Requests (Admin)
```bash
curl http://localhost:8000/api/v1/getAllRoleRequests
```
*Take note of the "address" (ID) returned here for the next step.*

## 4. Approve Role (Admin)
Replace `<USER_ID_FROM_STEP_3>` with the actual ID returned.
```bash
curl -X POST http://localhost:8000/api/v1/approve-role \
  -H 'Content-Type: application/json' \
  -d '{"user":"<USER_ID_FROM_STEP_3>"}'
```

## 5. Verify Role
```bash
curl http://localhost:8000/api/v1/role/<USER_ID_FROM_STEP_3>
```

## 6. Count Pending Requests
Should be 0.
```bash
curl http://localhost:8000/api/v1/pendingRequestsCount
```
