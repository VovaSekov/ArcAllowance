import "server-only";

import { ethers } from "ethers";
import { arcAllowanceRegistryAbi } from "@/lib/contract/abi";
import { arcAllowanceRegistry, arcTestnet, getSeededRegistryEntity, isRegistryConfigured } from "@/lib/contract/config";
import { memoHashPayload } from "@/lib/contract/hash";
import { mapSpendStatusToContract, parseUSDC } from "@/lib/contract/client";
import { agents, merchants, policies } from "@/lib/seed-data";
import type { Receipt, SpendInput, SpendRequest } from "@/lib/types";

type AnchorStatus = "approved" | "rejected" | "needs_approval";

export type ArcAnchorResult = {
  requestPatch: Partial<SpendRequest>;
  receipt?: Receipt;
};

function privateKey() {
  return process.env.ARC_TESTNET_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY || "";
}

function getContract() {
  if (!isRegistryConfigured()) {
    throw new Error("ArcAllowanceRegistry is not configured.");
  }

  const key = privateKey();
  if (!/^0x[a-fA-F0-9]{64}$/.test(key)) {
    throw new Error("Server Arc Testnet signer is not configured. Set ARC_TESTNET_PRIVATE_KEY.");
  }

  const provider = new ethers.JsonRpcProvider(process.env.ARC_TESTNET_RPC_URL || arcTestnet.rpcUrl, arcTestnet.chainId);
  const wallet = new ethers.Wallet(key, provider);
  return new ethers.Contract(arcAllowanceRegistry.address, arcAllowanceRegistryAbi, wallet);
}

function findEntities(input: SpendInput) {
  const agent = agents.find((item) => item.id === input.agentId);
  const merchant = merchants.find((item) => item.id === input.merchantId);
  const policy = policies.find((item) => item.agentId === input.agentId);
  const registryEntity = getSeededRegistryEntity(input.agentId);

  if (!agent || !merchant || !policy) {
    throw new Error("Unknown agent, merchant, or policy.");
  }

  if (!registryEntity) {
    throw new Error(`No Arc Testnet registry mapping for ${input.agentId}. Run npm run contracts:bootstrap:arc.`);
  }

  if (!ethers.isAddress(merchant.walletAddress)) {
    throw new Error(`Merchant ${merchant.name} does not have a valid EVM address.`);
  }

  return { agent, merchant, policy, registryEntity };
}

function extractEventArg(receipt: ethers.ContractTransactionReceipt | null, contract: ethers.Contract, eventName: string, argName: string): string {
  const parsed = receipt?.logs
    .map((log) => {
      try {
        return contract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((event) => event?.name === eventName);

  const value = parsed?.args[argName];
  if (!value) {
    throw new Error(`Could not read ${eventName}.${argName} from Arc Testnet receipt.`);
  }

  return value.toString();
}

function createReceipt({
  request,
  memoId,
  txHash,
  recordTxHash,
  decisionTxHash,
  onchainRequestId
}: {
  request: SpendRequest;
  memoId: string;
  txHash: string;
  recordTxHash?: string;
  decisionTxHash?: string;
  onchainRequestId: string;
}): Receipt {
  const agent = agents.find((item) => item.id === request.agentId);
  const merchant = merchants.find((item) => item.id === request.merchantId);
  return {
    id: `receipt_arc_${onchainRequestId}_${Date.now()}`,
    spendRequestId: request.id,
    agentName: agent?.name ?? request.agentId,
    merchantName: merchant?.name ?? request.merchantId,
    amountUSDC: request.amountUSDC,
    memoId,
    txHash,
    settlementMode: "arc_testnet",
    onchainRequestId,
    recordTxHash,
    decisionTxHash,
    createdAt: new Date().toISOString()
  };
}

export async function anchorSpendRequest(request: SpendRequest): Promise<ArcAnchorResult> {
  const status = request.status === "settled" || request.status === "settlement_pending" ? "approved" : request.status;
  if (status !== "approved" && status !== "rejected" && status !== "needs_approval") {
    throw new Error(`Cannot anchor unsupported status: ${request.status}`);
  }

  const input: SpendInput = {
    agentId: request.agentId,
    merchantId: request.merchantId,
    amountUSDC: request.amountUSDC,
    purpose: request.purpose,
    paymentType: request.paymentType
  };
  const { merchant, registryEntity } = findEntities(input);
  const contract = getContract();
  const memoId = request.memoId ?? `ARC-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(16).slice(2, 8).toUpperCase()}`;
  const memoHash = ethers.id(memoHashPayload(input, memoId));

  const recordTx = await contract.recordSpendRequest(
    registryEntity.agentId,
    registryEntity.policyId,
    merchant.walletAddress,
    parseUSDC(String(request.amountUSDC)),
    request.purpose,
    memoHash
  );
  const recordReceipt = await recordTx.wait();
  const onchainRequestId = extractEventArg(recordReceipt, contract, "SpendRequestRecorded", "requestId");

  const decisionTx = await contract.markSpendDecision(onchainRequestId, mapSpendStatusToContract(status));
  const decisionReceipt = await decisionTx.wait();

  const requestPatch: Partial<SpendRequest> = {
    status: status === "approved" ? "settled" : status,
    settlementMode: "arc_testnet",
    memoId,
    txHash: decisionReceipt?.hash ?? recordReceipt?.hash,
    onchainRequestId,
    onchainRecordTxHash: recordReceipt?.hash,
    onchainDecisionTxHash: decisionReceipt?.hash
  };

  const receipt =
    status === "approved"
      ? createReceipt({
          request: { ...request, ...requestPatch },
          memoId,
          txHash: decisionReceipt?.hash ?? recordReceipt?.hash,
          recordTxHash: recordReceipt?.hash,
          decisionTxHash: decisionReceipt?.hash,
          onchainRequestId
        })
      : undefined;

  return { requestPatch, receipt };
}

export async function markAnchoredDecision(request: SpendRequest, status: "approved" | "rejected"): Promise<ArcAnchorResult> {
  if (!request.onchainRequestId) {
    return anchorSpendRequest({ ...request, status });
  }

  const contract = getContract();
  const decisionTx = await contract.markSpendDecision(request.onchainRequestId, mapSpendStatusToContract(status));
  const decisionReceipt = await decisionTx.wait();
  const memoId = request.memoId ?? `ARC-${Date.now().toString(36).toUpperCase()}`;
  const nextStatus = status === "approved" ? "settled" : "rejected";

  const requestPatch: Partial<SpendRequest> = {
    status: nextStatus,
    settlementMode: "arc_testnet",
    memoId,
    txHash: decisionReceipt?.hash,
    onchainDecisionTxHash: decisionReceipt?.hash
  };

  const receipt =
    status === "approved"
      ? createReceipt({
          request: { ...request, ...requestPatch },
          memoId,
          txHash: decisionReceipt?.hash ?? request.txHash ?? "",
          recordTxHash: request.onchainRecordTxHash,
          decisionTxHash: decisionReceipt?.hash,
          onchainRequestId: request.onchainRequestId
        })
      : undefined;

  return { requestPatch, receipt };
}
