// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RBAC {
    address[] private registeredUsers;

    enum Role { None, Admin, Company, Doctor, Auditor, Patient }

    struct UserInfo {
        string name;
        string physicalAddress;
        address walletAddress;
        Role role;
        bool isRegistered;
    }

    struct RoleRequest {
        Role requestedRole;
        bool isPending;
    }

    mapping(address => UserInfo) public users;
    mapping(address => RoleRequest) public roleRequests;

    address public immutable deployer;

    event UserRegistered(address indexed user, string name, string physicalAddress, address walletAddress);
    event RoleRequested(address indexed user, Role role);
    event RoleAssigned(address indexed user, Role role);

    modifier onlyRole(Role _role) {
        require(users[msg.sender].role == _role, "Unauthorized: Incorrect Role");
        _;
    }

    modifier onlyDeployer() {
        require(msg.sender == deployer, "Unauthorized: Only Deployer");
        _;
    }

    constructor() {
        deployer = msg.sender;
        users[msg.sender] = UserInfo({
            name: "Admin",
            physicalAddress: "Admin Location",
            walletAddress: msg.sender,
            role: Role.Admin,
            isRegistered: true
        });
        registeredUsers.push(msg.sender);
        emit RoleAssigned(msg.sender, Role.Admin);
    }

    function registerUser(string calldata _name, string calldata _physicalAddress) external {
        require(!users[msg.sender].isRegistered, "User already registered");

        users[msg.sender] = UserInfo({
            name: _name,
            physicalAddress: _physicalAddress,
            walletAddress: msg.sender,
            role: Role.None,
            isRegistered: true
        });

        registeredUsers.push(msg.sender);
        emit UserRegistered(msg.sender, _name, _physicalAddress, msg.sender);
    }

    function requestRole(Role _role) external {
        require(users[msg.sender].isRegistered, "User must be registered first");
        require(_role != Role.None && _role != Role.Admin, "Invalid role request");
        require(!roleRequests[msg.sender].isPending, "Already requested");

        roleRequests[msg.sender] = RoleRequest({requestedRole: _role, isPending: true});
        emit RoleRequested(msg.sender, _role);
    }

    function approveRole(address _user) external onlyRole(Role.Admin) onlyDeployer {
        require(roleRequests[_user].isPending, "No pending request");

        Role assignedRole = roleRequests[_user].requestedRole;
        users[_user].role = assignedRole;
        delete roleRequests[_user];

        emit RoleAssigned(_user, assignedRole);
    }

    function getAllRoleRequests() public view  returns (address[] memory, Role[] memory) {
    uint count = 0;

    for (uint i = 0; i < registeredUsers.length; i++) {
        if (roleRequests[registeredUsers[i]].isPending) {
            count++;
        }
    }

    address[] memory usersWithRequests = new address[](count);
    Role[] memory requestedRoles = new Role[](count);
    uint index = 0;

    for (uint i = 0; i < registeredUsers.length; i++) {
        if (roleRequests[registeredUsers[i]].isPending) {
            usersWithRequests[index] = registeredUsers[i];
            requestedRoles[index] = roleRequests[registeredUsers[i]].requestedRole;
            index++;
        }
    }

    return (usersWithRequests, requestedRoles);
}


    function getRole(address _user) external view returns (Role) {
        return users[_user].role;
    }

    function getUser(address _user) external view returns (
        string memory name,
        string memory physicalAddress,
        address walletAddress,
        Role role,
        bool isRegistered
    ) {
        require(users[_user].isRegistered, "User not found");

        UserInfo memory user = users[_user];
        return (user.name, user.physicalAddress, user.walletAddress, user.role, user.isRegistered);
    }

    function getUsersByRole(Role _role) public view returns (address[] memory) {
        address[] memory tempUsers = new address[](registeredUsers.length);
        uint count = 0;

        for (uint i = 0; i < registeredUsers.length; i++) {
            if (users[registeredUsers[i]].role == _role) {
                tempUsers[count] = registeredUsers[i];
                count++;
            }
        }

        address[] memory filteredUsers = new address[](count);
        for (uint i = 0; i < count; i++) {
            filteredUsers[i] = tempUsers[i];
        }

        return filteredUsers;
    }

    function getCompanies() external view returns (address[] memory) {
        return getUsersByRole(Role.Company);
    }

    function getDoctors() external view returns (address[] memory) {
        return getUsersByRole(Role.Doctor);
    }

    function getPatients() external view returns (address[] memory) {
        return getUsersByRole(Role.Patient);
    }

    function getAuditors() external view returns (address[] memory) {
        return getUsersByRole(Role.Auditor);
    }


    function getPendingRequestsCount() public view returns (uint) {
    uint count = 0;
    for (uint i = 0; i < registeredUsers.length; i++) {
        if (roleRequests[registeredUsers[i]].isPending) {
            count++;
        }
    }
    return count;
}

}
