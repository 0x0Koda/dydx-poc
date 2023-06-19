import { CosmosChain, Squid } from "@0xsquid/sdk";
import { SigningStargateClient, DeliverTxResponse } from "@cosmjs/stargate";
import {
  DirectSecp256k1HdWallet,
  OfflineDirectSigner,
} from "@cosmjs/proto-signing";
import dotenv from "dotenv";
dotenv.config();

const mnemonic = process.env.MNEMONIC!;
if (!mnemonic)
  throw new Error("No private key provided, pls include in .env file");

(async () => {
  const baseUrl =
    "https://squid-api-git-feat-cosmos-maintestnet-0xsquid.vercel.app";

  const squid = new Squid({
    baseUrl: baseUrl,
  });
  await squid.init();
  console.log("Squid inited");

  const fromChainId = "grand-1";

  const chain = squid.chains.find(
    (c) => c.chainId.toString().toLocaleLowerCase() === fromChainId
  ) as CosmosChain;

  const getSignerFromMnemonic = async (): Promise<OfflineDirectSigner> => {
    return DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: chain.bech32Config.bech32PrefixAccAddr,
    });
  };
  const signer: OfflineDirectSigner = await getSignerFromMnemonic();
  const signingClient = await SigningStargateClient.connectWithSigner(
    chain.rpc,
    signer
  );

  const signerAddress = (await signer.getAccounts())[0].address;
  console.log(signerAddress);
  console.log("balances: ", await signingClient.getAllBalances(signerAddress));

  const toChainId = "osmo-test-5";
  const routeParams = {
    fromChain: fromChainId,
    fromToken: squid.tokens.find(
      (t) =>
        t.symbol.toLocaleLowerCase() === "usdc" && t.chainId === fromChainId
    )!.address,
    fromAmount: "555555",
    cosmosSignerAddress: signerAddress,
    toChain: toChainId,
    toToken: squid.tokens.find(
      (t) => t.symbol.toLocaleLowerCase() === "usdc" && t.chainId === toChainId
    )!.address,
    toAddress: "osmo1zqnudqmjrgh9m3ec9yztkrn4ttx7ys64plcwc6",
    slippage: 3.0,
  };

  console.log("route params: ", routeParams);

  /*   const { route } = await squid.getRoute(routeParams);

  const cosmosTx = (await squid.executeRoute({
    signer: signingClient,
    signerAddress,
    route,
  })) as DeliverTxResponse; */

  //const txHash = cosmosTx.transactionHash;
  const txHash =
    "E0CD89D7E8D02046A36F2453991CD29F25C6BCB54CC89521288E50E0BDE4D761";

  await sleep(5); //wait for axelar to index
  let statusResult = false;
  while (!statusResult) {
    console.log(`getting tx status for: ${txHash}`);
    try {
      const status = (await squid.getStatus({
        transactionId: txHash,
        fromChainId: fromChainId,
      })) as any;
      console.log(status);
      if (!!status.routeStatus) {
        if (
          !!status.routeStatus.find(
            (s) => s.chainName === "osmosis-6" && s.status === "success"
          )
        ) {
          statusResult = true;
          console.log("########### tx success ############");
          break;
        }
      }
    } catch (error) {
      console.log("not found yet..");
      await sleep(3);
      console.log(error);
    }
  }
})();

const sleep = async (time: number) => {
  new Promise((r) => setTimeout(r, time * 1000));
};
