import { CosmosChain, Squid } from "@0xsquid/sdk";
import { SigningStargateClient, DeliverTxResponse } from "@cosmjs/stargate";
import {
  DirectSecp256k1HdWallet,
  OfflineDirectSigner,
} from "@cosmjs/proto-signing";

(async () => {
  const baseUrl = "https://squid-api-git-feat-cosmos-maintestnet-0xsquid.vercel.app";

  const squid = new Squid({
    baseUrl: baseUrl,
  });
  await squid.init();
  console.log("Squid inited");

  const mnemonic =
    "muscle abuse foam practice elite foster glue immune steak thunder afraid soft";


  const chainId = "osmo-test-5";

  const chain = squid.chains.find(
    (c) => c.chainId.toString().toLocaleLowerCase() === chainId
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


  const routeParams = {
    fromChain: chainId,
    fromToken: squid.tokens.find(
      (t) => t.symbol.toLocaleLowerCase() === "osmo" && t.chainId === chainId
    )!.address,
    fromAmount: "555555",
    cosmosSignerAddress: signerAddress,
    toChain: chainId,
    toToken: squid.tokens.find(
      (t) => t.symbol.toLocaleLowerCase() === "usdc" && t.chainId === chainId
    )!.address,
    toAddress: "osmo1zqnudqmjrgh9m3ec9yztkrn4ttx7ys64plcwc6",
    slippage: 3.0,
  };


  console.log("route params: ", routeParams);

  const { route } = await squid.getRoute(routeParams);

  const cosmosTx = (await squid.executeRoute({
    signer: signingClient,
    signerAddress,
    route,
  })) as DeliverTxResponse;

  await sleep(3); //wait for axelar to index
  let statusResult = false;
  while (!statusResult) {
    console.log(`getting tx status for: ${cosmosTx.transactionHash}`)
    try {
      const status = await squid.getStatus({ transactionId: cosmosTx.transactionHash })
      console.log(status);
      if (!!status.routeStatus && !!status.routeStatus.find((s) => s.chainName === "avalanche" && s.status === "success")) {
        statusResult = true;
        console.log("########### tx success ############")
      }
    } catch (error) {
      //do nothing
      console.log(error)
    }
    await sleep(1);
  }

})();

const sleep = async (time: number) => {
  new Promise((r) => setTimeout(r, time * 1000));
}
