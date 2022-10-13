// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

contract BatuFi {
    struct Role {
        uint256 number;
        string role;
        string name;
        uint256 maxAmount;
        uint256 minAmount;
    }
    struct User {
        string name;
        string role;
        address id;
        uint256 number;
        uint256 approveCount;
        uint256 declineCount;
        uint256 slipCount;
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
        string currentApprovalRole;
        string uptoApprovalRole;
        uint256 timestamp;  
    }
    struct Approval {
        string docHash;
        User[] approvalList;
    }
    address public creator;
    address public transaction;
    uint256 userCount;
    uint256 transactionCount;
    uint256 roleCount;
    uint256 day = 86400;
    Transaction[] public transactionList;
    Notification[] public notificationList;
    Role[] public roleList;
    address[] public userList;
    mapping(string => Role) public roleMap;
    mapping(address => User) public userMap;
    mapping(string => Transaction) public transactionMap;
    mapping(string => Notification) public notificationMap;
    mapping(string => Approval) public approvalMap;

    // roles LA, HOD, FO, REG, VC, CC
    // tx status PENDING, APPROVED, DECLINED, EXPIRED
    // validating return 0, 1, 2
    // 0: if tx expired
    // 1: if tx window is open
    // 2: if tx is transfered to higher authority

    constructor(address owner) {
        creator = owner;
        createUser("Owner", owner, "Admin");
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
    
    // function to create the member
    function createUser(string memory _role, address _id, string memory _name) public {
        User storage u = userMap[_id];
        u.role = _role;
        u.id = _id;
        u.name = _name;
        u.number = userCount++;
        userList.push(_id);
    }
    
    // function to create the role that will be assigned to each member
    function createRole(string memory _role, string memory _name, uint256 _maxAmount, uint256 _minAmount) public {
        Role storage r = roleMap[_role];
        r.number = roleCount++;
        r.role = _role;
        r.name = _name;
        r.maxAmount = _maxAmount;
        r.minAmount = _minAmount;
        roleList.push(r);
    }

    // validate the tx for time window of members / validators
    function validateTxDuration(string memory _docHash) public returns(uint) {
        Transaction storage t = transactionMap[_docHash];
        uint256 timestamp = t.timestamp;
        string memory uptoApproval = t.uptoApprovalRole;
        string memory currentApproval = t.currentApprovalRole;
        // check for if time window is completed for current role
        bool isWindowOpen = isTimeWindowOverForRole(currentApproval, timestamp);

        if(!isWindowOpen) {
            // time window is closed

            if(compareStrings(currentApproval, uptoApproval)) {
                // if current approval and upto approval are same then just cancel the transaction
                // cancel the tx
                if(!compareStrings(t.status, "EXPIRED")) {
                    t.status = "EXPIRED";
                    for (uint i=0; i<userList.length; i++) {
                        User storage u = userMap[userList[i]];
                        if(compareStrings(u.role, currentApproval)) {
                            u.slipCount = u.slipCount+1;
                        }
                    }
                    // send notificatio that tx is expired
                    Notification storage n0 = notificationMap[_docHash];
                    n0.title = "Transaction Expired";
                    n0.message = string(abi.encodePacked("Transaction with transaction hash ", _docHash, " is expired"));
                    n0.docHash = _docHash;
                    n0.status = "EXPIRED";
                    notificationList.push(n0);
                }
                return 0;
            }else {
                // transfer tx to next authority role
                t.currentApprovalRole = getNextRole(currentApproval);
                for (uint i=0; i<userList.length; i++) {
                    User storage u = userMap[userList[i]];
                    if(compareStrings(u.role, currentApproval)) {
                        u.slipCount = u.slipCount+1;
                    }
                }
                Role storage r = roleMap[currentApproval];

                // send notification that window is expired for current authority;
                Notification storage n2 = notificationMap[_docHash];
                n2.title = "Transaction Transferred";
                n2.message = string(abi.encodePacked("Transaction with transaction hash ", _docHash, " is expired for ", r.name, " and has been transferred to the higher authority"));
                n2.docHash = _docHash;
                n2.status = "PENDING";
                notificationList.push(n2);

                return 2;
            }   
        }

        return 1;
    }
    
    // function to delete the user
    function deleteUser(uint256 number) public {
        delete userList[number];
    }


    function getUptoApprovalRole(uint256 _amount) internal pure returns(string memory) {
        if(_amount <= 5000 ) {
            // tx upto HOD
            return "HOD";
        }else if (_amount > 5000 && _amount <= 10000 ) {
            // tx upto FO'
            return "FO";
        }else if (_amount > 10000 && _amount <= 75000) {
            // tx upto REG
            return "REG";
        }else if (_amount > 75000 && _amount <= 300000) {
            // tx upto VC
            return "VC";
        }else {
            // tx upto CC
            return "CC";
        }
    }
    
    function getNextRole(string memory _currentRole) internal pure returns (string memory) {
        if(compareStrings(_currentRole, "HOD")) {
            return "FO";
        }else if (compareStrings(_currentRole, "FO")) {
            return "REG";
        }else if (compareStrings(_currentRole, "REG")) {
            return "VC";
        }else {
            return "CC";
        }
    }

    function isTimeWindowOverForRole(string memory _role, uint256 _createdTime) internal view returns (bool) {
        uint256 currentTimestamp = block.timestamp;
        // check window for HOD
        if(compareStrings(_role, "HOD") && ((_createdTime + day) > currentTimestamp)) {
            // after 1 day the time window will be closed
            return true;
        }else if(compareStrings(_role, "FO") && ((_createdTime + 3*day) > currentTimestamp)) {
              // after 3 day the time window will be closed
            return true;
        }else if(compareStrings(_role, "REG") && ((_createdTime + 5*day) > currentTimestamp)) {
            // after 5 day the time window will be closed
            return true;
        }else if(compareStrings(_role, "VC") && ((_createdTime + 7*day) > currentTimestamp)) {
            // after 7 day the time window will be closed
            return true;
        }else if(compareStrings(_role, "CC") && ((_createdTime + 10*day) > currentTimestamp)) {
            // after 10 day the time window will be closed
            return true;
        }
        else {
            return false;
        }
    }
    
    // function to create the transaction/procurrement
    function createTransaction(string memory _id, string memory _hash, string memory _url, string memory _comment, uint256 _amount) public memberOnly {
        // create transaction object and store the values
        Transaction storage t = transactionMap[_hash];
        t.id = _id;
        t.docHash = _hash;
        t.url = _url;
        t.comment = _comment;
        t.number = transactionCount++;
        t.status = "PENDING";
        t.creator = msg.sender;
        t.amount = _amount;
        t.currentApprovalRole = "HOD";

        // calculate currentRole and uptoRole from _amount
        string memory uptoRole = getUptoApprovalRole(_amount);
        t.uptoApprovalRole = uptoRole;

        // default approval push LA
        Approval storage a = approvalMap[_hash];
        a.docHash = _hash;
        User storage u = userMap[msg.sender];
        a.approvalList.push(u);

        t.timestamp = block.timestamp;
        // push transaction in the list
        transactionList.push(t);

        // create notification object and store the values
        Notification storage n = notificationMap[_hash];
        n.title = "Transaction Created";
        n.message = string(abi.encodePacked("Transaction with transaction hash ", _hash, " ", " is created"));
        n.docHash = _hash;
        n.status = "create";
        // push notification in the list
        notificationList.push(n);
    }

    // function to approve the transaction
    function approveTransaction(string memory _hash) public returns(uint) {
        Transaction storage t = transactionMap[_hash];
        string storage currentApproval = t.currentApprovalRole;
        string storage uptoApproval = t.uptoApprovalRole;
        uint validationCode = validateTxDuration(_hash);

        if(validationCode == 1) {
            // validation code is 1 then tx window is still open for current authority
            // start approval process

            Approval storage a = approvalMap[_hash];
            User storage u = userMap[msg.sender];
            a.approvalList.push(u);

            // increase approval user count
            u.approveCount = u.approveCount+1;

            Notification storage n1 = notificationMap[_hash];
            if(compareStrings(currentApproval, uptoApproval)) {
                // if uptoApproval and currentApproval are same then the tx will be completed
                // change the tx status to completed
                t.status = "APPROVED";

                n1.title = "Transaction Completed";
                n1.message = string(abi.encodePacked("Transaction with transaction hash ", _hash, " is completed and approved by all the authorities"));
                n1.docHash = _hash;
                n1.status = "APPROVED";
                notificationList.push(n1);
            }else {
                // else tx will be transferred to higher authority for next approval
                Role storage r = roleMap[currentApproval];
                string storage approvalName = r.name;
                t.currentApprovalRole = getNextRole(currentApproval);

                n1.title = "Transaction Approved";
                n1.message = string(abi.encodePacked("Transaction with transaction hash ", _hash, " is approved by ", approvalName));
                n1.docHash = _hash;
                n1.status = "APPROVED";
                notificationList.push(n1);
            }
            return validationCode;
        }else {
            return validationCode;
        }
    }

    function declineTransaction(string memory _hash) public returns(uint) {
        User storage u = userMap[msg.sender];
        // increase approval user count
        u.declineCount = u.declineCount+1;
        Transaction storage t = transactionMap[_hash];
        t.status = "DECLINED";
        return 1;
    }
    
    function listApprovals(string memory _hash) public view returns(Approval memory) {
        Approval storage a = approvalMap[_hash];
        return a;
    }
    
    function listTransaction() public view returns(Transaction[] memory) {
        return transactionList;
    }

    function listNotification() public view returns(Notification[] memory) {
        return notificationList;
    }
    
    function listUsers() public view returns(address[] memory) {
        return userList;
    }
    
    function listRoles() public view returns(Role[] memory) {
        return roleList;
    }
    
}
