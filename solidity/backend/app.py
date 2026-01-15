from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from web3 import Web3
import json
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
import logging
from web3 import Web3


logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change this to your frontend domain for security
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

load_dotenv()
w3 = Web3(Web3.HTTPProvider("http://127.0.0.1:8545"))


# Optional: check connection
if w3.is_connected():
    print("Connected to Ethereum node")
else:
    print("Connection failed")

account = os.getenv("ACCOUNT_ADDRESS")
PRIVATE_KEY =os.getenv("PRIVATE_KEY")
CHAIN_ID = int(os.getenv("CHAIN_ID"))

# Load ABIs & Contract Addresses
with open('./artifacts/contracts/RBAC.sol/RBAC.json') as f:
    rbac = json.load(f)
with open('./artifacts/contracts/ProductRegistry.sol/ProductRegistry.json') as f:
    product = json.load(f)
with open('./artifacts/contracts/TrialManager.sol/TrialManager.json') as f:
    trial = json.load(f)

RBAC_ADDRESS = "0xe78A0F7E598Cc8b0Bb87894B0F60dD2a88d6a8Ab"
PRODUCT_ADDRESS = "0x5b1869D9A4C187F2EAa108f3062412ecf0526b24"
TRIAL_ADDRESS = "0xCfEB869F69431e42cdB54A4F4f105C19C080A601"

rbac_contract = w3.eth.contract(address=RBAC_ADDRESS, abi=rbac['abi'])
product_contract = w3.eth.contract(address=PRODUCT_ADDRESS, abi=product['abi'])
trial_contract = w3.eth.contract(address=TRIAL_ADDRESS, abi=trial['abi'])

# print("---------------------------------------------------------->",rbac_contract.functions.getAllRoleRequests().call())
class RegisterUserSchema(BaseModel):
    name: str
    address: str
    wallet_address: str


class RequestRoleSchema(BaseModel):
    role: int
    user: str


class ApproveRoleSchema(BaseModel):
    address: str

@app.get("/api/v1/")
async def healthCheck():
    try:
        role = rbac_contract.functions.getUser("0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1").call()
        logger.debug(f"Result {role}")
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/registerUser")
async def register_user(user_data: RegisterUserSchema):
    """ Registers a new user """
    try:
        logger.debug(f"Received Data: {user_data}")

        # Get the sender's nonce
        nonce = w3.eth.get_transaction_count(user_data.wallet_address)

        # Build transaction
        txn = rbac_contract.functions.registerUser(
            user_data.name, user_data.address
        ).build_transaction({
            'from': user_data.wallet_address
        })
        print("---------->txn",txn)
   

       
        return {"message": "User registered successfully"}

    
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/role/{user_address}")
async def get_user_role(user_address: str):
    """ Fetch user role """
    try:
        role = rbac_contract.functions.getUserRole(user_address).call()
        return {"user": user_address, "role": role}
    
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/login")
async def get_user_role(data: dict):
    """ Fetch user role via POST request """
    try:
        logger.debug(f"Received Data: {data}")
        user_address = data.get("user_address")

        if not user_address:
            raise HTTPException(status_code=400, detail="user_address is required")

        login = rbac_contract.functions.getUser(user_address).call()  # ✅ Fetch user role
        logger.info(f"User Details: {login}")  # ✅ Log details

        return {"user_address": user_address, "role": login,"success": True}
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/requestRole")
async def request_role(data: RequestRoleSchema):
    """ Request a new role """
    try:
        nonce = w3.eth.get_transaction_count(data.user)
        logger.debug(f"Received Data: {data.user}")
        
        txn = rbac_contract.functions.requestRole(data.role).build_transaction({
            'from': data.user,
            'gas': 2000000,
            'gasPrice': w3.to_wei('10', 'gwei'),
            'nonce': nonce
        })

        logger.debug(f"Received Data: {txn}")

        

        return {"message": "Role requested"}
    
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/approve-role")
async def approve_role(data: ApproveRoleSchema):
    """ Approve a role request """
    try:
        print("--------------------------------------------------------------------------------->data",data.address)
        txn = rbac_contract.functions.approveRole(address).build_transaction({
    'from': account,
    'gas': 2000000,  # Optional: Set a gas limit, if required
    'gasPrice': w3.toWei('20', 'gwei'),  # Optional: Set gas price, if required
})


        receipt = w3.eth.wait_for_transaction_receipt(txn)
        # Check transaction status
        if receipt.status == 1:
            return {"message": "Role Approved"}
        else:
            raise HTTPException(status_code=400, detail="Transaction failed")

    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/role-request/{user_address}")
async def get_pending_request(user_address: str):
    """ Get pending role request """
    try:
        role_request = rbac_contract.functions.roleRequests(user_address).call()
        return {
            "user": user_address,
            "requestedRole": role_request[0],
            "isPending": role_request[1]
        }
    
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


ROLE_MAPPING = ["none", "admin", "company", "doctor", "auditor", "patient"]

@app.get("/api/v1/getname/{role}")
async def get_users_by_role(role: str):
    """Fetch users by role"""
    try:
        role = role.lower()
        if role not in ROLE_MAPPING:
            raise HTTPException(status_code=400, detail="Invalid role")

        role_id = ROLE_MAPPING.index(role)  # Convert role name to enum index
        users = rbac_contract.functions.getUsersRole(role_id).call()
        return {"role": role, "users": users}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/pendingRequests")
async def get_pending_requests_count():
    """Fetch all pending role requests with user details"""
    try:
        usersCount = rbac_contract.functions.getAllRoleRequests().call()

        # Fetch detailed user info for each pending request
        structured_requests = []
        for i in range(len(usersCount[0])):  # Loop through addresses
            address = usersCount[0][i]
            role = usersCount[1][i]

            # Fetch user details from the contract
            user_info = rbac_contract.functions.getUser(address).call()  
            user_name = user_info[0]  # Assuming getUser returns (name, other details...)

            structured_requests.append({
                "address": address,
                "role": role,
                "name": user_name
            })

        return {"pendingRequests": structured_requests}

    except Exception as e:
        logger.error(f"Error fetching role requests: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/pendingRequestsCount")
async def get_pending_requests_count():
    """ Fetch all pending role requests """
    try:

        usersCount = rbac_contract.functions.getPendingRequestsCount().call()

        logging.debug(f"Users: {usersCount}")


    
        return {"pendingRequests": usersCount}

    except Exception as e:
        logger.error(f"Error fetching role requests: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



### ------------------------- PRODUCT ROUTES ------------------------- ###

class RegisterProductSchema(BaseModel):
    productName: str
    user: str


@app.post("/api/v1/register")
async def register_product(data: RegisterProductSchema):
    try:
        nonce = w3.eth.get_transaction_count(account)
        txn = product_contract.functions.registerProduct(data.productName).build_transaction({
            'chainId': CHAIN_ID,
            'gas': 300000,
            'gasPrice': w3.to_wei('20', 'gwei'),
            'nonce': nonce,
            'from': data.user
        })
        signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        return {"message": "Product registered", "tx_hash": tx_hash.hex()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/{product_id}")
async def get_product(product_id: int):
    try:
        product = product_contract.functions.getProduct(product_id).call()
        return {
            "productId": product_id,
            "productName": product[0],
            "company": product[1],
            "exists": product[2]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/{product_id}/exists")
async def check_product_exists(product_id: int):
    try:
        exists = product_contract.functions.productExists(product_id).call()
        return {"productId": product_id, "exists": exists}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/{product_id}/company")
async def get_product_company(product_id: int):
    try:
        company = product_contract.functions.getProductCompany(product_id).call()
        return {"productId": product_id, "company": company}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


### ------------------------- TRIAL ROUTES ------------------------- ###

class SubmitTrialSchema(BaseModel):
    productId: int
    patient: str
    trialName: str
    dataHash: str
    doctor: str

class ApproveTrialSchema(BaseModel):
    trialId: int
    admin: str


@app.post("/api/v1/submit")
async def submit_trial(data: SubmitTrialSchema):
    try:
        nonce = w3.eth.get_transaction_count(account)
        txn = trial_contract.functions.submitTrial(
            data.productId, data.patient, data.trialName, data.dataHash
        ).build_transaction({
            'chainId': CHAIN_ID,
            'gas': 400000,
            'gasPrice': w3.to_wei('20', 'gwei'),
            'nonce': nonce,
            'from': data.doctor
        })
        signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        return {"message": "Trial submitted", "tx_hash": tx_hash.hex()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/v1/approve")
async def approve_trial(data: ApproveTrialSchema):
    try:
        nonce = w3.eth.get_transaction_count(account)
        txn = trial_contract.functions.approveTrial(
            data.trialId
        ).build_transaction({
            'chainId': CHAIN_ID,
            'gas': 200000,
            'gasPrice': w3.to_wei('20', 'gwei'),
            'nonce': nonce,
            'from': data.admin
        })
        signed_txn = w3.eth.account.sign_transaction(txn, private_key=private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
        return {"message": "Trial approved", "tx_hash": tx_hash.hex()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/{trial_id}")
async def view_trial(trial_id: int):
    try:
        trial = trial_contract.functions.viewTrial(trial_id).call()
        return {
            "trialId": trial_id,
            "productId": trial[0],
            "trialName": trial[1],
            "dataHash": trial[2],
            "approved": trial[3],
            "doctor": trial[4],
            "patient": trial[5],
            "company": trial[6]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/patient")
async def view_my_trials(patient: str):
    try:
        trials = trial_contract.functions.viewMyTrials().call({'from': patient})
        return format_trials(trials)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/doctor")
async def view_doctor_trials(doctor: str):
    try:
        trials = trial_contract.functions.viewDoctorTrials().call({'from': doctor})
        return format_trials(trials)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/v1/company")
async def view_company_trials(company: str):
    try:
        trials = trial_contract.functions.viewCompanyTrials().call({'from': company})
        return format_trials(trials)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def format_trials(trials):
    return [{
        "trialId": t[0],
        "productId": t[1],
        "trialName": t[2],
        "dataHash": t[3],
        "approved": t[4],
        "doctor": t[5],
        "patient": t[6],
        "company": t[7]
    } for t in trials]
