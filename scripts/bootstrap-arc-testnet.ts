import fs from "node:fs";
import path from "node:path";
import hre from "hardhat";
import type { EventLog, Log } from "ethers";
import { agents, policies } from "../src/lib/seed-data";
import { policyHashPayload } from "../src/lib/contract/hash";

type Deployment = {
  network: string;
  chainId: number;
  contractName: string;
  address: string;
  deployer: string;
  deployedAt: string;
  explorerUrl: string;
  seededRegistry?: Record<string, { agentId: string; policyId: string }>;
};

const deploymentPath = path.join(process.cwd(), "deployments", "arc-testnet.json");
type ContractLog = EventLog | Log;

function riskTierToContract(riskTier: string): 0 | 1 | 2 {
  if (riskTier === "low") return 0;
  if (riskTier === "medium") return 1;
  return 2;
}

function usdcToUnits(amount: number): bigint {
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

  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8")) as Deployment;
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

    const metadataURI = `arcallowance://agents/${agent.id}`;
    const registerTx = await registry.registerAgent(agent.name, metadataURI, riskTierToContract(agent.riskTier));
    const registerReceipt = await registerTx.wait();
    const registered = (registerReceipt?.logs as readonly ContractLog[] | undefined)
      ?.map((log: ContractLog) => {
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

    const policyHash = hre.ethers.id(policyHashPayload(policy));
    const createPolicyTx = await registry.createPolicy(
      onchainAgentId,
      policyHash,
      usdcToUnits(policy.maxPerTransactionUSDC),
      usdcToUnits(policy.dailyLimitUSDC),
      usdcToUnits(policy.monthlyLimitUSDC),
      usdcToUnits(policy.approvalRequiredAboveUSDC)
    );
    const policyReceipt = await createPolicyTx.wait();
    const createdPolicy = (policyReceipt?.logs as readonly ContractLog[] | undefined)
      ?.map((log: ContractLog) => {
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

  const nextDeployment: Deployment = {
    ...deployment,
    seededRegistry
  };

  fs.writeFileSync(deploymentPath, `${JSON.stringify(nextDeployment, null, 2)}\n`);
  console.log(`Updated ${deploymentPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
