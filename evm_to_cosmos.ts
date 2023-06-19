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
  //const baseUrl =
  //  "https://squid-api-git-feat-cosmos-maintestnet-0xsquid.vercel.app";
  const baseUrl = "http://localhost:3000";
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
    evmFallbackAddress: "0xb13CD07B22BC5A69F8500a1Cb3A1b65618d50B22",
  };

  console.log("route params", params);
  const { route } = await squid.getRoute(params);
  console.log(route.estimate.route);
  const tx = (await squid.executeRoute({
    signer,
    route,
  })) as ethers.providers.TransactionResponse;
  const txReceipt = await tx.wait();
  const txHash = txReceipt.transactionHash;
  //const txHash =
  //  "0xa3f446fe845f528fecc62ec6e860d02a9b9a515087d19b84632bcccc6e978bdd";

  await sleep(5); //wait for axelar to index
  let statusResult = false;
  while (!statusResult) {
    console.log(`getting tx status for: ${txHash}`);
    try {
      const status = (await squid.getStatus({
        transactionId: txHash,
      })) as any;
      console.log(status);
      if (!!status.routeStatus) {
        if (
          !!status.routeStatus.find(
            (s) => s.chainId === toChainId && s.status === "success"
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
      //console.log(error);
    }
  }
  //console.log(`https://testnet.axelarscan.io/gmp/${txReceipt.transactionHash}`);
})();

const sleep = async (time: number) => {
  new Promise((r) => setTimeout(r, time * 1000));
};
