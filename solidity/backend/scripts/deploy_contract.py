import json
import os
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

w3 = Web3(Web3.HTTPProvider(os.getenv("RPC_URL")))
private_key = os.getenv("PRIVATE_KEY")
account = os.getenv("ACCOUNT_ADDRESS")

def deploy_contract(abi, bytecode, constructor_args=()):
    account = w3.eth.account.from_key(private_key)
    nonce = w3.eth.get_transaction_count(account.address)

    # If contract has constructor arguments
    if constructor_args:
        contract = w3.eth.contract(abi=abi, bytecode=bytecode)
        transaction = contract.constructor(*constructor_args).build_transaction({
            'from': account.address,
            'nonce': nonce,
            'gas': 3000000,
            'gasPrice': w3.to_wei('20', 'gwei')
        })
    else:
        contract = w3.eth.contract(abi=abi, bytecode=bytecode)
        transaction = contract.constructor().build_transaction({
            'from': account.address,
            'nonce': nonce,
            'gas': 3000000,
            'gasPrice': w3.to_wei('20', 'gwei')
        })

    signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"Deployed at: {tx_receipt.contractAddress}")
    return tx_receipt.contractAddress



def main():
    with open('./artifacts/contracts/RBAC.sol/RBAC.json') as f:
        rbac = json.load(f)
    with open('./artifacts/contracts/ProductRegistry.sol/ProductRegistry.json') as f:
        product = json.load(f)
    with open('./artifacts/contracts/TrialManager.sol/TrialManager.json') as f:
        trial = json.load(f)


    rbac_address = deploy_contract(rbac['abi'], rbac['bytecode'])


    product_address = deploy_contract(product['abi'], product['bytecode'], (rbac_address,))


    trial_address = deploy_contract(trial['abi'], trial['bytecode'], (rbac_address, product_address))


    print("RBAC:", rbac_address)
    print("ProductRegistry:", product_address)
    print("TrialManager:", trial_address)

if __name__ == "__main__":
    main()
