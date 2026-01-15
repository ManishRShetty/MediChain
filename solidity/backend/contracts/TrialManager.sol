// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RBAC.sol";
import "./ProductRegistry.sol";

contract TrialManager {
    RBAC public rbac;
    ProductRegistry public productRegistry;

    struct Trial {
        uint productId;
        string trialName;
        string dataHash;
        bool approved;
        address doctor;
        address patient;
        address company;
    }

    uint public trialCounter;
    mapping(uint => Trial) public trials;

    event TrialSubmitted(uint indexed trialId, address indexed doctor, address indexed patient);
    event TrialApproved(uint indexed trialId, address indexed admin);

    constructor(address _rbac, address _productRegistry) {
        rbac = RBAC(_rbac);
        productRegistry = ProductRegistry(_productRegistry);
    }

    function submitTrial(
        uint _productId,
        address _patient,
        string memory _trialName,
        string memory _dataHash
    ) external {
        require(rbac.getRole(msg.sender) == RBAC.Role.Doctor, "Unauthorized: Not a doctor");
        require(productRegistry.productExists(_productId), "Invalid product ID");
        require(rbac.getRole(_patient) == RBAC.Role.Patient, "Provided address is not a patient");

        trialCounter++;
        address company = productRegistry.getProductCompany(_productId);

        trials[trialCounter] = Trial({
            productId: _productId,
            trialName: _trialName,
            dataHash: _dataHash,
            approved: false,
            doctor: msg.sender,
            patient: _patient,
            company: company
        });
        emit TrialSubmitted(trialCounter, msg.sender, _patient);
    }

    function approveTrial(uint _trialId) external {
        require(rbac.getRole(msg.sender) == RBAC.Role.Admin, "Unauthorized: Not admin");
        require(!trials[_trialId].approved, "Already Approved");
        trials[_trialId].approved = true;
        emit TrialApproved(_trialId, msg.sender);
    }

    function viewTrial(uint _trialId) external view returns (Trial memory) {
        RBAC.Role role = rbac.getRole(msg.sender);
        require(
            role == RBAC.Role.Auditor || 
            role == RBAC.Role.Admin,
            "Unauthorized: View Access Denied"
        );
        return trials[_trialId];
    }

    function viewMyTrials() external view returns (Trial[] memory) {
        require(rbac.getRole(msg.sender) == RBAC.Role.Patient, "Unauthorized: Not a patient");
        uint count = 0;
        for (uint i = 1; i <= trialCounter; i++) {
            if (trials[i].patient == msg.sender) count++;
        }

        Trial[] memory myTrials = new Trial[](count);
        uint index = 0;
        for (uint i = 1; i <= trialCounter; i++) {
            if (trials[i].patient == msg.sender) {
                myTrials[index] = trials[i];
                index++;
            }
        }
        return myTrials;
    }

    function viewDoctorTrials() external view returns (Trial[] memory) {
        require(rbac.getRole(msg.sender) == RBAC.Role.Doctor, "Unauthorized: Not a doctor");
        uint count = 0;
        for (uint i = 1; i <= trialCounter; i++) {
            if (trials[i].doctor == msg.sender) count++;
        }

        Trial[] memory doctorTrials = new Trial[](count);
        uint index = 0;
        for (uint i = 1; i <= trialCounter; i++) {
            if (trials[i].doctor == msg.sender) {
                doctorTrials[index] = trials[i];
                index++;
            }
        }
        return doctorTrials;
    }

    function viewCompanyTrials() external view returns (Trial[] memory) {
        require(rbac.getRole(msg.sender) == RBAC.Role.Company, "Unauthorized: Not a company");
        uint count = 0;
        for (uint i = 1; i <= trialCounter; i++) {
            if (trials[i].company == msg.sender) count++;
        }

        Trial[] memory companyTrials = new Trial[](count);
        uint index = 0;
        for (uint i = 1; i <= trialCounter; i++) {
            if (trials[i].company == msg.sender) {
                companyTrials[index] = trials[i];
                index++;
            }
        }
        return companyTrials;
    }
}
