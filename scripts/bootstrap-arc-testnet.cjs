require("ts-node").register({
  transpileOnly: true,
  compilerOptions: {
    module: "commonjs",
    moduleResolution: "node"
  }
});

const fs = require("node:fs");
const path = require("node:path");
const hre = require("hardhat");
const { agents, policies } = require("../src/lib/seed-data");
const { policyHashPayload } = require("../src/lib/contract/hash");

const deploymentPath = path.join(process.cwd(), "deployments", "arc-testnet.json");

function riskTierToContract(riskTier) {
  if (riskTier === "low") return 0;
  if (riskTier === "medium") return 1;
  return 2;
}

function usdcToUnits(amount) {
  return hre.ethers.parseUnits(String(amount), 6);
}

async function main() {
  if (!fs.existsSync(deploymentPath)) {
    throw new Error("Missing deployments/arc-testnet.json. Deploy the registry first.");
  }

  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer wallet configured. Set DEPLOYER_PRIVATE_KEY or ARC_TESTNET_PRIVATE_KEY.");
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  if (!deployment.address) {
    throw new Error("Deployment address is missing.");
  }

  const registry = await hre.ethers.getContractAt("ArcAllowanceRegistry", deployment.address);
  const seededRegistry = deployment.seededRegistry ?? {};

  for (const agent of agents) {
    if (seededRegistry[agent.id]?.agentId && seededRegistry[agent.id]?.policyId) {
      console.log(`Skipping ${agent.name}; already mapped to agent ${seededRegistry[agent.id].agentId}, policy ${seededRegistry[agent.id].policyId}`);
      continue;
    }

    const policy = policies.find((item) => item.agentId === agent.id);
    if (!policy) {
      throw new Error(`Missing policy for ${agent.id}`);
    }

    const registerTx = await registry.registerAgent(
      agent.name,
      `arcallowance://agents/${agent.id}`,
      riskTierToContract(agent.riskTier)
    );
    const registerReceipt = await registerTx.wait();
    const registered = registerReceipt?.logs
      ?.map((log) => {
        try {
          return registry.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((event) => event?.name === "AgentRegistered");

    const onchainAgentId = registered?.args.agentId?.toString();
    if (!onchainAgentId) {
      throw new Error(`Could not read AgentRegistered event for ${agent.id}`);
    }

    const createPolicyTx = await registry.createPolicy(
      onchainAgentId,
      hre.ethers.id(policyHashPayload(policy)),
      usdcToUnits(policy.maxPerTransactionUSDC),
      usdcToUnits(policy.dailyLimitUSDC),
      usdcToUnits(policy.monthlyLimitUSDC),
      usdcToUnits(policy.approvalRequiredAboveUSDC)
    );
    const policyReceipt = await createPolicyTx.wait();
    const createdPolicy = policyReceipt?.logs
      ?.map((log) => {
        try {
          return registry.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((event) => event?.name === "PolicyCreated");

    const onchainPolicyId = createdPolicy?.args.policyId?.toString();
    if (!onchainPolicyId) {
      throw new Error(`Could not read PolicyCreated event for ${agent.id}`);
    }

    seededRegistry[agent.id] = {
      agentId: onchainAgentId,
      policyId: onchainPolicyId
    };

    console.log(`Mapped ${agent.name}: agent ${onchainAgentId}, policy ${onchainPolicyId}`);
  }

  fs.writeFileSync(deploymentPath, `${JSON.stringify({ ...deployment, seededRegistry }, null, 2)}\n`);
  console.log(`Updated ${deploymentPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
