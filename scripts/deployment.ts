import fs from "fs";
import path from "path";
import crypto from "crypto";
import { Signer, Contract, Provider } from "koilib";
import { TransactionJson } from "koilib/lib/interface";
import abi from "../build/token-abi.json";
import koinosConfig from "../koinos.config.js";

const [inputNetworkName] = process.argv.slice(2);

async function main() {
  const networkName = inputNetworkName || "harbinger";
  const network = koinosConfig.networks[networkName];
  if (!network) throw new Error(`network ${networkName} not found`);
  const provider = new Provider(network.rpcNodes);
  const accountWithFunds = Signer.fromWif(
    network.accounts.manaSharer.privateKey
  );
  const contractAccount = new Signer({
    privateKey: crypto.randomBytes(32).toString("hex"),
  });
  accountWithFunds.provider = provider;
  contractAccount.provider = provider;

  const contract = new Contract({
    signer: contractAccount,
    provider,
    abi,
    bytecode: fs.readFileSync(
      path.join(__dirname, "../build/release/token.wasm")
    ),
    options: {
      payer: accountWithFunds.address,
      beforeSend: async (tx: TransactionJson) => {
        await accountWithFunds.signTransaction(tx);
      },
    },
  });

  const setInfo= await contract.functions.set_info(network.tokenInfo, {
    onlyOperation: true,
  });

  const mintToken = await contract.functions.mint(network.mintInfo, {
    onlyOperation: true,
  });

  const { receipt, transaction } = await contract.deploy({
    abi: JSON.stringify(abi),
    authorizesCallContract: true,
    nextOperations: [setInfo.operation, mintToken.operation],
    rcLimit: "5000000000"
  });

  console.log("Transaction submitted. Receipt: ");
  console.log(receipt);
  const { blockNumber } = await transaction.wait("byBlock", 60000);
  console.log(
    `Contract ${contractAccount.address} uploaded in block number ${blockNumber} (${networkName})`
  );
}

main()
  .then(() => {})
  .catch((error) => console.error(error));
