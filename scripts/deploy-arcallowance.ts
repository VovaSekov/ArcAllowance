import fs from "node:fs";
import path from "node:path";
import { network } from "hardhat";

const chainId = 5042002;
const networkName = "arc-testnet";
const explorerBaseUrl = "https://testnet.arcscan.app";

async function main() {
  const { ethers } = await network.create();
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer wallet configured. Set DEPLOYER_PRIVATE_KEY for Arc Testnet deployment.");
  }

  const Registry = await ethers.getContractFactory("ArcAllowanceRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const address = await registry.getAddress();
  const deployment = {
    network: networkName,
    chainId,
    contractName: "ArcAllowanceRegistry",
    address,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    explorerUrl: `${explorerBaseUrl}/address/${address}`
  };

  const deploymentsDir = path.join(process.cwd(), "deployments");
  fs.mkdirSync(deploymentsDir, { recursive: true });
  fs.writeFileSync(path.join(deploymentsDir, "arc-testnet.json"), `${JSON.stringify(deployment, null, 2)}\n`);

  console.log(`ArcAllowanceRegistry deployed to ${address}`);
  console.log(`Explorer: ${deployment.explorerUrl}`);
  console.log("Saved deployment info to deployments/arc-testnet.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
