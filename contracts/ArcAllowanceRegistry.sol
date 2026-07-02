// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract ArcAllowanceRegistry {
    enum RiskTier {
        Low,
        Medium,
        High
    }

    enum AgentStatus {
        Active,
        Paused
    }

    enum SpendStatus {
        Pending,
        Approved,
        Rejected,
        NeedsApproval
    }

    struct Agent {
        uint256 id;
        address owner;
        string name;
        string metadataURI;
        RiskTier riskTier;
        AgentStatus status;
        uint256 createdAt;
    }

    struct Policy {
        uint256 id;
        uint256 agentId;
        bytes32 policyHash;
        uint256 maxPerTransactionUSDC;
        uint256 dailyLimitUSDC;
        uint256 monthlyLimitUSDC;
        uint256 approvalRequiredAboveUSDC;
        bool active;
        uint256 createdAt;
    }

    struct SpendRequest {
        uint256 id;
        uint256 agentId;
        uint256 policyId;
        address merchant;
        uint256 amountUSDC;
        string purpose;
        bytes32 memoHash;
        SpendStatus status;
        uint256 createdAt;
    }

    uint256 public nextAgentId = 1;
    uint256 public nextPolicyId = 1;
    uint256 public nextSpendRequestId = 1;

    mapping(uint256 => Agent) public agents;
    mapping(uint256 => Policy) public policies;
    mapping(uint256 => SpendRequest) public spendRequests;
    mapping(uint256 => uint256[]) public agentPolicies;
    mapping(uint256 => uint256[]) public agentSpendRequests;

    event AgentRegistered(
        uint256 indexed agentId,
        address indexed owner,
        string name,
        RiskTier riskTier,
        string metadataURI
    );

    event PolicyCreated(
        uint256 indexed policyId,
        uint256 indexed agentId,
        bytes32 policyHash,
        uint256 maxPerTransactionUSDC,
        uint256 dailyLimitUSDC,
        uint256 monthlyLimitUSDC,
        uint256 approvalRequiredAboveUSDC
    );

    event SpendRequestRecorded(
        uint256 indexed requestId,
        uint256 indexed agentId,
        uint256 indexed policyId,
        address merchant,
        uint256 amountUSDC,
        string purpose,
        bytes32 memoHash
    );

    event SpendDecisionMarked(
        uint256 indexed requestId,
        SpendStatus status,
        bytes32 memoHash
    );

    modifier onlyAgentOwner(uint256 agentId) {
        require(agents[agentId].owner == msg.sender, "Not agent owner");
        _;
    }

    function registerAgent(
        string calldata name,
        string calldata metadataURI,
        RiskTier riskTier
    ) external returns (uint256 agentId) {
        require(bytes(name).length > 0, "Name required");

        agentId = nextAgentId++;

        agents[agentId] = Agent({
            id: agentId,
            owner: msg.sender,
            name: name,
            metadataURI: metadataURI,
            riskTier: riskTier,
            status: AgentStatus.Active,
            createdAt: block.timestamp
        });

        emit AgentRegistered(agentId, msg.sender, name, riskTier, metadataURI);
    }

    function createPolicy(
        uint256 agentId,
        bytes32 policyHash,
        uint256 maxPerTransactionUSDC,
        uint256 dailyLimitUSDC,
        uint256 monthlyLimitUSDC,
        uint256 approvalRequiredAboveUSDC
    ) external onlyAgentOwner(agentId) returns (uint256 policyId) {
        require(policyHash != bytes32(0), "Policy hash required");
        require(maxPerTransactionUSDC > 0, "Max tx required");
        require(dailyLimitUSDC >= maxPerTransactionUSDC, "Daily limit too low");
        require(monthlyLimitUSDC >= dailyLimitUSDC, "Monthly limit too low");

        policyId = nextPolicyId++;

        policies[policyId] = Policy({
            id: policyId,
            agentId: agentId,
            policyHash: policyHash,
            maxPerTransactionUSDC: maxPerTransactionUSDC,
            dailyLimitUSDC: dailyLimitUSDC,
            monthlyLimitUSDC: monthlyLimitUSDC,
            approvalRequiredAboveUSDC: approvalRequiredAboveUSDC,
            active: true,
            createdAt: block.timestamp
        });

        agentPolicies[agentId].push(policyId);

        emit PolicyCreated(
            policyId,
            agentId,
            policyHash,
            maxPerTransactionUSDC,
            dailyLimitUSDC,
            monthlyLimitUSDC,
            approvalRequiredAboveUSDC
        );
    }

    function recordSpendRequest(
        uint256 agentId,
        uint256 policyId,
        address merchant,
        uint256 amountUSDC,
        string calldata purpose,
        bytes32 memoHash
    ) external onlyAgentOwner(agentId) returns (uint256 requestId) {
        require(policies[policyId].agentId == agentId, "Policy mismatch");
        require(policies[policyId].active, "Policy inactive");
        require(merchant != address(0), "Merchant required");
        require(amountUSDC > 0, "Amount required");
        require(bytes(purpose).length > 0, "Purpose required");
        require(memoHash != bytes32(0), "Memo hash required");

        requestId = nextSpendRequestId++;

        spendRequests[requestId] = SpendRequest({
            id: requestId,
            agentId: agentId,
            policyId: policyId,
            merchant: merchant,
            amountUSDC: amountUSDC,
            purpose: purpose,
            memoHash: memoHash,
            status: SpendStatus.Pending,
            createdAt: block.timestamp
        });

        agentSpendRequests[agentId].push(requestId);

        emit SpendRequestRecorded(
            requestId,
            agentId,
            policyId,
            merchant,
            amountUSDC,
            purpose,
            memoHash
        );
    }

    function markSpendDecision(
        uint256 requestId,
        SpendStatus status
    ) external {
        SpendRequest storage request = spendRequests[requestId];
        require(request.id != 0, "Request not found");
        require(agents[request.agentId].owner == msg.sender, "Not agent owner");
        require(status != SpendStatus.Pending, "Use final decision");

        request.status = status;

        emit SpendDecisionMarked(requestId, status, request.memoHash);
    }

    function getAgentPolicies(uint256 agentId) external view returns (uint256[] memory) {
        return agentPolicies[agentId];
    }

    function getAgentSpendRequests(uint256 agentId) external view returns (uint256[] memory) {
        return agentSpendRequests[agentId];
    }
}
