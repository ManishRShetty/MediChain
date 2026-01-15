require('dotenv').config();
const express = require('express');
const { Web3 } = require("web3");
const fs = require('fs');
const cors = require('cors');
const multer = require("multer");

const mongoose = require("mongoose");
const File = require("./models/File");


const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());
const axios = require("axios");

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));
const ACCOUNT_ADDRESS = process.env.ACCOUNT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const CHAIN_ID = parseInt(process.env.CHAIN_ID);

// Load ABIs & Contract Addresses
const rbacAbi = JSON.parse(fs.readFileSync('./artifacts/contracts/RBAC.sol/RBAC.json')).abi;
const productAbi = JSON.parse(fs.readFileSync('./artifacts/contracts/ProductRegistry.sol/ProductRegistry.json')).abi;
const trialAbi = JSON.parse(fs.readFileSync('./artifacts/contracts/TrialManager.sol/TrialManager.json')).abi;

const RBAC_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const PRODUCT_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const TRIAL_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";



const FormData = require("form-data");
const path = require("path");


const rbacContract = new web3.eth.Contract(rbacAbi, RBAC_ADDRESS);
const productContract = new web3.eth.Contract(productAbi, PRODUCT_ADDRESS);
const trialContract = new web3.eth.Contract(trialAbi, TRIAL_ADDRESS);


function safeJSON(obj) {
    return JSON.parse(
        JSON.stringify(obj, (key, value) =>
            typeof value === "bigint" ? value.toString() : value
        )
    );
}

app.post("/api/v1/registerUser", async (req, res) => {
  try {
      const { name, address, wallet_address } = req.body;
      console.log("Received Data:", req.body);

    //   // Check if the user is already registered
    //   const existingUser = await rbacContract.methods.getUser(wallet_address).call();
    //   if (existingUser[0] !== "") { // Assuming first field is name, check if it exists
    //       return res.status(400).json({ error: "User already registered" });
    //   }

      const nonce = await web3.eth.getTransactionCount(wallet_address);

      const txn = rbacContract.methods.registerUser(name, address).send({
          from: wallet_address,
          gas: 2000000,
          gasPrice: web3.utils.toWei('10', 'gwei'),
          nonce: nonce
      });

      console.log(txn);

      res.json({ message: "User registered" });
  } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ detail: error.message });
  }
});

// Get User Role
app.get("/api/v1/role/:user_address", async (req, res) => {
  try {
      const userAddress = req.params.user_address;
      const role = await rbacContract.methods.getUserRole(userAddress).call();
      res.json({ user: userAddress, role });
  } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ detail: error.message });
  }
});

// Login
app.post("/api/v1/login", async (req, res) => {
    try {
        console.log("Received Data:", req.body);
        const { user_address } = req.body;
        // if (!user_address) return res.status(400).json({ detail: "user_address is required" });
  
        // const login = await rbacContract.methods.getUser(user_address).call();
        // console.log("User Details:", login);
  
        // // Convert BigInt to String
        // const formattedLogin = Object.fromEntries(
        //   Object.entries(login).map(([key, value]) =>
        //     typeof value === "bigint" ? value.toString() : value
        //   )
        // );
  
        res.json({ user_address,  success: true });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ detail: error.message });
    }
  });
  

app.post("/api/v1/requestRole", async (req, res) => {
  try {
      const { user, role } = req.body;
      const nonce = await web3.eth.getTransactionCount(user);

      const txnData = rbacContract.methods.requestRole(role).call();


      // Correcting the `to` field
      const tx = {
          from: user,
          to: rbacContract.options.address, // FIXED: Use contract's address
          gas: 2000000,
          gasPrice: web3.utils.toWei("10", "gwei").toString(), // FIXED: Convert BigInt to string
          nonce: Number(nonce), // FIXED: Convert BigInt to a number
          data: txnData
      };

      console.log(tx);

      res.json({ message: "Role requested", transaction: tx });

  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});


app.post("/api/v1/approve-role", async (req, res) => {
  try {
      const { user } = req.body;
      

      const nonce = await web3.eth.getTransactionCount(ACCOUNT_ADDRESS, "latest");
      

      const txnData = rbacContract.methods.approveRole(user).encodeABI();

      const tx = {
          from: ADMIN_WALLET,  // Must be the Admin's address
          to: rbacContract.options.address,  // Contract address
          gas: 2000000,
          gasPrice: web3.utils.toWei("10", "gwei"),
          nonce: nonce,
          data: txnData
      };

      // Sign transaction with the Admin's private key
      const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
      const txReceipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

      res.json({ message: `Role approved for ${user}`, txHash: txReceipt.transactionHash });

  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});


// Get pending role request
app.get("/api/v1/role-request/:user_address", async (req, res) => {
  try {
      const userAddress = req.params.user_address;
      const roleRequest = await rbacContract.methods.roleRequests(userAddress).call();

      res.json({
          user: userAddress,
          requestedRole: roleRequest[0],
          isPending: roleRequest[1]
      });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});


// Fetch users by role
// app.get("/api/v1/getname/:role", async (req, res) => {
//   try {
//       const role = req.params.role.toLowerCase();

//       if (!ROLE_MAPPING.includes(role)) {
//           return res.status(400).json({ error: "Invalid role" });
//       }

//       const roleId = ROLE_MAPPING.indexOf(role);
//       const users = await rbacContract.methods.getUsersByRole(roleId).call();

//       res.json({ role, users });
//   } catch (error) {
//       console.error("Error fetching users by role:", error);
//       res.status(500).json({ error: error.message });
//   }
// });


app.get("/api/v1/getname/company", async (req, res) => {
    try {
        // Dummy data
        const role = "Admin";
        const users = [
            { id: 1, name: "Alice Johnson", role: "Admin", company: "TechCorp" },
            { id: 2, name: "Bob Smith", role: "Employee", company: "TechCorp" },
            { id: 3, name: "Charlie Brown", role: "Manager", company: "TechCorp" }
        ];
  
        res.json({ role, users });
    } catch (error) {
        console.error("Error fetching users by role:", error);
        res.status(500).json({ error: error.message });
    }
});


app.get("/api/v1/getAllRoleRequests", async (req, res) => {
  try {
      const result = await rbacContract.methods.getAllRoleRequests().call();
      console.log("Raw contract response:", result);

      // Ensure BigInt values are converted to strings
      const addresses = result[0].map(addr => addr.toString());
      const roles = result[1].map(role => role.toString()); 

      res.json({ addresses, roles });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});




app.get("/api/v1/pendingRequestsCount", async (req, res) => {
  try {
      const usersCount = await rbacContract.methods.getPendingRequestsCount().call();
      console.debug("Pending requests count:", usersCount);

      res.json({ pendingRequests: usersCount });
  } catch (error) {
      console.error("Error fetching pending requests count:", error);
      res.status(500).json({ error: error.message });
  }
});



const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY;

const upload = multer({ dest: "uploads/" });
async function uploadToPinata(filePath) {
    const fileStream = fs.createReadStream(filePath);
    const formData = new FormData();
    formData.append("file", fileStream);

    const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";

    try {
        const response = await axios.post(url, formData, {
            headers: {
                ...formData.getHeaders(),
                pinata_api_key: process.env.PINATA_API_KEY,
                pinata_secret_api_key: process.env.PINATA_SECRET_API_KEY,
            },
        });

        console.log(`Uploaded ${path.basename(filePath)} to IPFS:`);
        console.log(`🔗 IPFS CID: ${response.data.IpfsHash}`);

        return response.data.IpfsHash;
    } catch (error) {
        console.error(`Error uploading ${path.basename(filePath)}:`, error);
        throw error;
    }
}

// MongoDB connection
mongoose.connect("mongodb+srv://emergency:emergency@prathampshetty99sai.j4iophu.mongodb.net/ipfs-files", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.log("MongoDB Connection Error:", err));


app.post("/api/v1/upload", upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const filePath = req.file.path;
        const ipfsHash = await uploadToPinata(filePath);

        // Save IPFS hash in MongoDB
        const newFile = new File({
            filename: req.file.originalname,
            ipfsHash: ipfsHash
        });

        await newFile.save();

        // Optional: Delete the file after upload
        fs.unlinkSync(filePath);

        res.json({ message: "File uploaded to IPFS", ipfsHash });
    } catch (error) {
        res.status(500).json({ error: "File upload failed", details: error.message });
    }
});


app.get("/api/v1/files", async (req, res) => {
    try {
        const files = await File.find();
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch files", details: error.message });
    }
});






app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
