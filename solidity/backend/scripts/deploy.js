// // require('dotenv').config();
// const { ethers } = require('ethers');
// const fs = require('fs');

// // Load environment variables
// const RPC_URL = "http://127.0.0.1:8545/";
// const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// // Connect to Ethereum network
// const provider = new ethers.JsonRpcProvider(RPC_URL);
// const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

// // Function to deploy contract
// async function deployContract(abiPath, bytecodePath, constructorArgs = []) {
//     const abi = JSON.parse(fs.readFileSync(abiPath, 'utf8')).abi;
//     const bytecode = JSON.parse(fs.readFileSync(bytecodePath, 'utf8')).bytecode;

//     const factory = new ethers.ContractFactory(abi, bytecode, wallet);
//     const contract = await factory.deploy(...constructorArgs);

//     console.log(`Deploying contract...`);
//     await contract.waitForDeployment();

//     const contractAddress = await contract.getAddress();
//     console.log(`Deployed at: ${contractAddress}`);
//     return contractAddress;
// }

// // Main function to deploy all contracts
// async function main() {
//     const rbacPath = './artifacts/contracts/RBAC.sol/RBAC.json';
//     const productPath = './artifacts/contracts/ProductRegistry.sol/ProductRegistry.json';
//     const trialPath = './artifacts/contracts/TrialManager.sol/TrialManager.json';

//     console.log("Deploying RBAC...");
//     const rbacAddress = await deployContract(rbacPath, rbacPath);

//     console.log("Deploying ProductRegistry...");
//     const productAddress = await deployContract(productPath, productPath, [rbacAddress]);

//     console.log("Deploying TrialManager...");
//     const trialAddress = await deployContract(trialPath, trialPath, [rbacAddress, productAddress]);

//     console.log("✅ Deployment Complete");
//     console.log("RBAC:", rbacAddress);
//     console.log("ProductRegistry:", productAddress);
//     console.log("TrialManager:", trialAddress);
// }

// // Run the script
// main().catch(console.error);



// require("dotenv").config();
// const axios = require("axios");
// const FormData = require("form-data");
// const fs = require("fs");
// const path = require("path");

// const PINATA_API_KEY = process.env.PINATA_API_KEY;
// const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

// // Function to upload file to Pinata
// async function uploadToPinata(filePath) {
//     const fileStream = fs.createReadStream(filePath);
//     const formData = new FormData();
//     formData.append("file", fileStream);

//     const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

//     try {
//         const response = await axios.post(url, formData, {
//             headers: {
//                 ...formData.getHeaders(),
//                 pinata_api_key: PINATA_API_KEY,
//                 pinata_secret_api_key: PINATA_SECRET_API_KEY,
//             },
//         });

//         console.log(`Uploaded ${path.basename(filePath)} to IPFS:`);
//         console.log(`🔗 IPFS CID: ${response.data.IpfsHash}`);
//         return response.data.IpfsHash;
//     } catch (error) {
//         console.error(`Error uploading ${path.basename(filePath)}:`, error);
//     }
// }

// // Main function to upload contract artifacts
// async function main() {
//     const artifactsDir = "./artifacts/contracts";

//     // List all contract files in the artifacts directory
//     const contractFiles = fs.readdirSync(artifactsDir).map((file) => path.join(artifactsDir, file));

//     for (const file of contractFiles) {
//         if (file.endsWith(".json")) {
//             await uploadToPinata(file);
//         }
//     }
// }

// // Run the upload process
// main().catch(console.error);





const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with account:", deployer.address);

    // Deploy RBAC contract
    const RBAC = await hre.ethers.getContractFactory("RBAC");
    const rbac = await RBAC.deploy();
    await rbac.waitForDeployment();
    console.log("RBAC deployed at:", await rbac.getAddress());

    // Deploy ProductRegistry contract
    const ProductRegistry = await hre.ethers.getContractFactory("ProductRegistry");
    const productRegistry = await ProductRegistry.deploy(await rbac.getAddress());
    await productRegistry.waitForDeployment();
    console.log("ProductRegistry deployed at:", await productRegistry.getAddress());

    // Deploy TrialManager contract
    const TrialManager = await hre.ethers.getContractFactory("TrialManager");
    const trialManager = await TrialManager.deploy(await rbac.getAddress(), await productRegistry.getAddress());
    await trialManager.waitForDeployment();
    console.log("TrialManager deployed at:", await trialManager.getAddress());
}

// Run deployment script
main().catch((error) => {
    console.error(error);
    process.exit(1);
});
