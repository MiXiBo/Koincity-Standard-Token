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
  const contractAccount = Signer.fromWif(
    network.accounts.tokenContract.privateKey
  );
  accountWithFunds.provider = provider;
  contractAccount.provider = provider;

  const contract = new Contract({
    id: contractAccount.address,
    signer: contractAccount,
    provider,
    abi,
    options: {
      payer: accountWithFunds.address,
      beforeSend: async (tx: TransactionJson) => {
        await accountWithFunds.signTransaction(tx);
      },
    },
  });

  const params = {
    to: contractAccount.address,
    value: "123456789",
  };

  const { receipt, transaction } = await contract.functions.mint(params, {
    rcLimit: "5000000000",
  });
  console.log("Transaction submitted. Receipt: ");
  console.log(receipt);
  const { blockNumber } = await transaction.wait("byBlock", 60000);
  console.log(
    `New coins minted in contract ${contractAccount.address} (block number ${blockNumber} - ${networkName})`
  );
  console.log(params);
}

main()
  .then(() => {})
  .catch((error) => console.error(error));
