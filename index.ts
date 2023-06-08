import { Squid } from "@0xsquid/sdk";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

const addressNoble = "noble1zqnudqmjrgh9m3ec9yztkrn4ttx7ys64p87kkx";
const addressDydx = "dydx1zqnudqmjrgh9m3ec9yztkrn4ttx7ys64qa96wl";
const privateKey = process.env.PK!;
if (!privateKey)
  throw new Error("No private key provided, pls include in .env file");

(async () => {
  // instantiate the SDK

  const baseUrl = "https://squid-api-git-feat-cosmos-main-0xsquid.vercel.app";

  const squid = new Squid({
    baseUrl: baseUrl,
  });

  // init the SDK
  await squid.init();
  console.log("Squid inited");

  //const chainId = 43113; //avalanche fuji testnet
  //const chainId = 5; //goerli
  //const chainId = 80001; //polygon mumbai
  const chainId = 43113; //avalanche fuji testnet
  const provider = ethers.getDefaultProvider(
    squid.chains.find((c) => c.chainId === chainId)!.rpc
  );

  const signer = new ethers.Wallet(privateKey, provider);

  //
  // avax:avalanche > ausdc:osmosis
  //
  /*  const toChainId = "osmo-test-5";
  const params = {
    fromChain: chainId,
    fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    fromAmount: ethers.utils.parseUnits(".05", "18").toString(),
    toChain: toChainId,
    toToken: squid.tokens.find(
      (t) => t.symbol.toLocaleLowerCase() === "ausdc" && t.chainId === toChainId
    )!.address,
    toAddress: "osmo1zqnudqmjrgh9m3ec9yztkrn4ttx7ys64plcwc6",
    slippage: 3.0,
    enableForecall: false,
    quoteOnly: false,
  }; */

  // ausdc:avalanche > nusdc:noble
  const toChainId = "grand-1";
  const params = {
    fromChain: chainId,
    fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    fromAmount: ethers.utils.parseUnits(".1", "18").toString(),
    toChain: toChainId,
    toToken: squid.tokens.find(
      (t) => t.symbol.toLocaleLowerCase() === "usdc" && t.chainId === toChainId
    )!.address,
    toAddress: addressNoble,
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
  console.log(txReceipt.transactionHash);
})();

// "axelar-testnet-lisbon-3", //"dydxprotocol-testnet",

// "axelar1zqnudqmjrgh9m3ec9yztkrn4ttx7ys64d2ak9f", //"dydx1zqnudqmjrgh9m3ec9yztkrn4ttx7ys64qa96wl",

/* const usdc_dydx =
    "ibc/39549F06486BACA7494C9ACDD53CDD30AA9E723AB657674DBD388F867B61CA7B"; */

// "dydxprotocol-testnet"
// "osmo-test-5"

// avax:avalanche to nusdc:dydx
/*  const params = {
    fromChain: chainId,
    fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    fromAmount: ethers.utils.parseUnits(".05", "18").toString(),
    toChain: "dydxprotocol-testnet",
    toToken:
      "ibc/39549F06486BACA7494C9ACDD53CDD30AA9E723AB657674DBD388F867B61CA7B",
    toAddress: "dydx1zqnudqmjrgh9m3ec9yztkrn4ttx7ys64qa96wl",
    slippage: 3.0,
    enableForecall: false,
    quoteOnly: false,
  }; */

/* // avax:avalanche > ausdc:axelar
  //
  const params = {
    fromChain: chainId,
    fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    fromAmount: ethers.utils.parseUnits(".05", "18").toString(),
    toChain: "axelar-testnet-lisbon-3",
    toToken: "uausdc",
    toAddress: "axelar1zqnudqmjrgh9m3ec9yztkrn4ttx7ys64d2ak9f",
    slippage: 3.0,
    enableForecall: false,
    quoteOnly: false,
  }; */

/*   //
  // avax:avalanche > nusdc:osmosis
  //
  const params = {
    fromChain: chainId,
    fromToken: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
    fromAmount: ethers.utils.parseUnits(".1", "18").toString(),
    toChain: "osmo-test-5",
    toToken:
      "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4",
    toAddress: "osmo1zqnudqmjrgh9m3ec9yztkrn4ttx7ys64plcwc6",
    slippage: 3.0,
    enableForecall: false,
    quoteOnly: false,
  }; */

//
/* // ausdc:avalanche > nusdc:osmosis
  //
  const params = {
    fromChain: chainId,
    fromToken: "0x57f1c63497aee0be305b8852b354cec793da43bb",
    fromAmount: ethers.utils.parseUnits(".2", "6").toString(),
    toChain: "osmo-test-5",
    toToken:
      "ibc/6F34E1BD664C36CE49ACC28E60D62559A5F96C4F9A6CCE4FC5A67B2852E24CFE",
    toAddress: "osmo1zqnudqmjrgh9m3ec9yztkrn4ttx7ys64plcwc6",
    slippage: 3.0,
    enableForecall: false,
    quoteOnly: false,
  };
 */

// ausdc:avalanche > nusdc:osmosis
//
/* const params = {
    fromChain: chainId,
    fromToken: "0x57f1c63497aee0be305b8852b354cec793da43bb",
    fromAmount: ethers.utils.parseUnits(".2111", "6").toString(),
    toChain: "osmo-test-5",
    toToken:
      "ibc/B3504E092456BA618CC28AC671A71FB08C6CA0FD0BE7C8A5B5A3E2DD933CC9E4",
    toAddress: "osmo1zqnudqmjrgh9m3ec9yztkrn4ttx7ys64plcwc6",
    slippage: 3.0,
    enableForecall: false,
    quoteOnly: false,
  }; */
