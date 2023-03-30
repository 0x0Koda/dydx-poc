import { Squid } from "@0xsquid/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const privateKey = process.env.PK!;
if (!privateKey)
  throw new Error("No private key provided, pls include in .env file");

(async () => {
  // instantiate the SDK

  const squid = new Squid({
    baseUrl: "https://squid-2gwsw7ij1-0xsquid.vercel.app", // for testnet use "https://testnet.api.0xsquid.com"
  });

  // init the SDK
  await squid.init();
  console.log("Squid inited");

  // use the RPC provider of the "from" chain

  const chainId = 43113; //avalanche
  const provider = ethers.getDefaultProvider(
    squid.chains.find((c) => c.chainId === chainId)!.rpc
  );

  const signer = new ethers.Wallet(privateKey, provider);

  const params = {
    fromChain: chainId,
    fromToken: squid.tokens.find(
      (t) => t.symbol === "AVAX" && t.chainId === chainId
    ).address,
    fromAmount: ethers.utils.parseUnits("0.1", "18").toString(),
    toChain: "axelar-testnet-lisbon-3",
    toToken: "uosmo",
    toAddress: "axelar1zqnudqmjrgh9m3ec9yztkrn4ttx7ys64d2ak9f",
    slippage: 3.0,
    enableForecall: false,
    quoteOnly: false,
  };

  const { route } = await squid.getRoute(params);

  const tx = await squid.executeRoute({
    signer,
    route,
  });

  const txReceipt = await tx.wait();

  console.log(txReceipt.transactionHash);
})();
