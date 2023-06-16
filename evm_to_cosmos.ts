import { Squid } from "@0xsquid/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const addressDydx = "dydx1zqnudqmjrgh9m3ec9yztkrn4ttx7ys64qa96wl";
const privateKey = process.env.PK!;
if (!privateKey)
  throw new Error("No private key provided, pls include in .env file");

(async () => {
  // instantiate the SDK
  const baseUrl = "https://squid-api-git-feat-cosmos-maintestnet-0xsquid.vercel.app";
  const squid = new Squid({
    baseUrl: baseUrl,
  });
  // init the SDK
  await squid.init();
  console.log("Squid inited");
  const chainId = 43113; //avalanche fuji testnet
  const provider = ethers.getDefaultProvider(
    squid.chains.find((c) => c.chainId === chainId)!.rpc
  );
  const signer = new ethers.Wallet(privateKey, provider);
  const toChainId = "dydxprotocol-testnet";
  const params = {
    fromChain: chainId,
    fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    fromAmount: ethers.utils.parseUnits(".05", "18").toString(),
    toChain: toChainId,
    toToken: squid.tokens.find(
      (t) => t.symbol.toLocaleLowerCase() === "usdc" && t.chainId === toChainId
    )!.address,
    toAddress: addressDydx,
    slippage: 3.0,
    enableForecall: false,
    quoteOnly: false,
  };

  console.log("route params", params);
  const { route } = await squid.getRoute(params);
  console.log(route.estimate.route);
  const tx = (await squid.executeRoute({
    signer,
    route,
  })) as ethers.providers.TransactionResponse;
  const txReceipt = await tx.wait();

  await sleep(3); //wait for axelar to index
  let statusResult = false;
  while (!statusResult) {
    console.log("getting tx status")
    try {
      const status = await squid.getStatus({ transactionId: txReceipt.transactionHash })
      console.log(status);
      if (!!status.routeStatus && !!status.routeStatus.find((s) => s.chainName === "dydx" && s.status === "success")) {
        statusResult = true;
        console.log("########### tx success ############")
      }
    } catch (error) {
      //do nothing
      console.log(error)
    }
    await sleep(1);
  }
  //console.log(`https://testnet.axelarscan.io/gmp/${txReceipt.transactionHash}`);
})();

const sleep = async (time: number) => {
  new Promise((r) => setTimeout(r, time * 1000));
}
