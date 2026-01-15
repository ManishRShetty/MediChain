// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./RBAC.sol";

contract ProductRegistry {
    RBAC public rbac;

    struct Product {
        string productName;
        address company;
        bool exists;
    }

    uint public productCounter;
    mapping(uint => Product) public products;

    event ProductRegistered(uint indexed productId, string productName, address indexed company);

    constructor(address _rbac) {
        rbac = RBAC(_rbac);
    }

    function registerProduct(string memory _productName) external {
        require(rbac.getRole(msg.sender) == RBAC.Role.Company, "Unauthorized: Not a company");

        productCounter++;
        products[productCounter] = Product({
            productName: _productName,
            company: msg.sender,
            exists: true
        });
        emit ProductRegistered(productCounter, _productName, msg.sender);
    }

    function getProduct(uint _productId) external view returns (Product memory) {
        return products[_productId];
    }

    function productExists(uint _productId) external view returns (bool) {
        return products[_productId].exists;
    }

    function getProductCompany(uint _productId) external view returns (address) {
        return products[_productId].company;
    }
}
