// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract Batu {
    struct User {
        string firstName;
        string lastName;
        uint256 maxAmount;
        string role;
        address id;
        uint256 number;
    }
    struct Notification {
        string title;
        string message;
        string docHash;
        string status;
    }
    struct Transaction {
        string id;
        string docHash;
        string url;
        string comment;
        uint256 number;
        string status;
        address creator;
        uint256 amount;
    }
    struct Approval {
        string docHash;
        address[] approvalList;
    }
    address public creator;
    address public transaction;
    mapping(address => User) public userMap;
    uint256 userCount;
    uint256 transactionCount;
    Transaction[] public transactionList;
    Notification[] public notificationList;
    User[] public userList;
    mapping(string => Transaction) public transactionMap;
    mapping(string => Notification) public notificationMap;
    mapping(string => Approval) public approvalMap;

    constructor(address owner) {
        creator = owner;
        createUser("Owner", owner, "Admin", "-", 100000000);
    }
    
    modifier creatorOnly() {
        require(msg.sender == creator);
        _;
    }
    
    modifier memberOnly() {
        require(msg.sender == userMap[msg.sender].id);
        _;
    }

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }
    
    function authMember() public view memberOnly returns (bool) {
        return true;
    }
    
    function authCreator() public view creatorOnly returns (bool) {
        return true;
    }
    
    function createUser(string memory _role, address _id, string memory _firstName, string memory _lastName, uint256 _maxAmount) public {
        User storage u = userMap[_id];
        u.firstName = _firstName;
        u.lastName = _lastName;
        u.maxAmount = _maxAmount;
        u.role = _role;
        u.id = _id;
        u.number = userCount++;
        userList.push(u);
    }
    
    function deleteUser(uint256 number) public {
        delete userList[number];
    }
    
    function createTransaction(string memory _id, string memory _hash, string memory _url, string memory _comment, 
    string memory _status, uint256 _amount) public memberOnly {
        Transaction storage t = transactionMap[_hash];
        t.id = _id;
        t.docHash = _hash;
        t.url = _url;
        t.comment = _comment;
        t.number = transactionCount++;
        t.status = _status;
        t.creator = msg.sender;
        t.amount = _amount;
        Approval storage a = approvalMap[_hash];
        a.docHash = _hash;
        a.approvalList.push(msg.sender);
        transactionList.push(t);

        Notification storage n = notificationMap[_hash];
        n.title = "Transaction Created";
        n.message = string(abi.encodePacked("Transaction with transaction hash ", _hash, " ", " is created"));
        n.docHash = _hash;
        n.status = "create";
        notificationList.push(n);
    }

    function calcLowerAuth() public view returns (uint) {
        User storage u = userMap[msg.sender];
         uint lowerAuthorities = 0;

        // get all the members
        for(uint i=0; i<userList.length; i++) {
            User storage m = userMap[userList[i].id];
            // only check lower authorities
            if (m.maxAmount < u.maxAmount) {
                lowerAuthorities = lowerAuthorities + 1;
            }
        }

        return lowerAuthorities;
    }

    
    function approveTransaction(string memory _hash) public returns(uint) {
        // Transaction storage t = transactionMap[_hash];
        Approval storage a = approvalMap[_hash];
        Transaction storage t = transactionMap[_hash];

        // get the person object who is trying to approve
        User storage u = userMap[msg.sender];
        uint lowerAuthorities = 0;

        // get all the members
        for(uint i=0; i<userList.length; i++) {
            User storage m = userMap[userList[i].id];
            // only check lower authorities
            if (m.maxAmount < u.maxAmount) {
                lowerAuthorities = lowerAuthorities + 1;
            }
        }

        // check if all the lower authorities have approved the transaction
        if(a.approvalList.length == lowerAuthorities && compareStrings(t.status, "Pending")) {
            a.approvalList.push(msg.sender);
            Notification storage n = notificationMap[_hash];
            n.title = "Approval Received";
            n.message = string(abi.encodePacked("Transaction with transaction hash ", _hash, " ", " got an approval from the authority"));
            n.docHash = _hash;
            n.status = "pending";
            notificationList.push(n);

            //check the final approval
            if(u.maxAmount >= t.amount) {
                t.status = "Approved";

                Notification storage n1 = notificationMap[_hash];
                n1.title = "Transaction Approved";
                n1.message = string(abi.encodePacked("Transaction with transaction hash ", _hash, " ", " is approved by all the authorities"));
                n1.docHash = _hash;
                n1.status = "approved";
                notificationList.push(n1);
            }
            return 1;
        }else {
            return 0;
        }
    }
    
    function listApprovals(string memory _hash) public view returns(Approval memory) {
        Approval storage a = approvalMap[_hash];
        return a;
    }
    
    function listTransaction() public view returns(Transaction [] memory) {
        return transactionList;
    }

    function listNotification() public view returns(Notification [] memory) {
        return notificationList;
    }
    
    function listUsers() public view returns(User [] memory) {
        return userList;
    }
    
}
