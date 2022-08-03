const sdk = require("@defillama/sdk");
const { default: BigNumber } = require("bignumber.js");
const { stakings } = require("../helper/staking");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");
const abi = require("./abi.json");
const { requery } = require('./../helper/getUsdUniTvl');

const ichi = "0x903bEF1736CDdf2A537176cf3C64579C3867A881";
const ichi_v2 = "0x111111517e4929D3dcbdfa7CCe55d30d4B6BC4d6";
const xIchi = "0x70605a6457B0A8fBf1EEE896911895296eAB467E";
const tokenFactory = "0xD0092632B9Ac5A7856664eeC1abb6E3403a6A36a";
const farmContract = "0x275dFE03bc036257Cd0a713EE819Dbd4529739c8";
const ichiLending = "0xaFf95ac1b0A78Bd8E4f1a2933E373c66CC89C0Ce";

const unilps = [
  // SLP
  "0x9cD028B1287803250B1e226F0180EB725428d069",
  // UNI-V2 lP
  "0xd07D430Db20d2D7E0c4C11759256adBCC355B20C"
]

const poolWithTokens = [
  // BANCOR
  ["0x4a2F0Ca5E03B2cF81AebD936328CF2085037b63B", ["0x903bEF1736CDdf2A537176cf3C64579C3867A881", "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C"]],
  // BANCOR V3
  ["0x36FAbE4cAeF8c190550b6f93c306A5644E7dCef6", ["0x903bEF1736CDdf2A537176cf3C64579C3867A881", "0x1F573D6Fb3F13d689FF844B4cE37794d79a7FF1C"]],
  // ONE INCH
  ["0x1dcE26F543E591c27717e25294AEbbF59AD9f3a5", ["0x903bEF1736CDdf2A537176cf3C64579C3867A881", "0x111111111117dC0aa78b770fA6A738034120C302"]],
  // BALANCER
  ["0x58378f5F8Ca85144ebD8e1E5e2ad95B02D29d2BB", ["0x903bEF1736CDdf2A537176cf3C64579C3867A881", "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"]]
]

const lendingPools = [
  { // Uni - oneUNI || Minting oneToken with Uni
    target: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
    params: ["0x8290D7a64F25e6b5002d98367E8367c1b532b534"]
  },
  { // USDC - oneUNI || Minting oneToken with USDC 
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0x8290D7a64F25e6b5002d98367E8367c1b532b534"]
  },
  { // oneFox
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0x03352D267951E96c6F7235037C5DFD2AB1466232"]
  },
  { // oneFox
    target: "0xc770EEfAd204B5180dF6a14Ee197D99d808ee52d",
    params: ["0x03352D267951E96c6F7235037C5DFD2AB1466232"]
  },
  { // oneFUSE
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0xBbcE03B2E7f53caDCA93251CA4c928aF01Db6404"]
  },
  { // oneFUSE
    target: "0x970B9bB2C0444F5E81e9d0eFb84C8ccdcdcAf84d",
    params: ["0xBbcE03B2E7f53caDCA93251CA4c928aF01Db6404"]
  },
  { // onePERL
    target: "0xeca82185adCE47f39c684352B0439f030f860318",
    params: ["0xD9A24485e71B9148e0Fd51F0162072099DF0dB67"]
  },
  {  // onePERL
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0xD9A24485e71B9148e0Fd51F0162072099DF0dB67"]
  },

  { // oneFIL
    target: "0xD5147bc8e386d91Cc5DBE72099DAC6C9b99276F5",
    params: ["0x6d82017e55b1D24C53c7B33BbB770A86f2ca229D"]
  },
  {  // oneFIL
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0x6d82017e55b1D24C53c7B33BbB770A86f2ca229D"]
  },
  { // one1INCH
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0x853Bb55c1f469902F088A629db8C8803A9BE3857"]
  },
  { // one1INCH
    target: "0x111111111117dC0aa78b770fA6A738034120C302",
    params: ["0x853Bb55c1f469902F088A629db8C8803A9BE3857"]
  },
  { // oneMPH
    target: "0x8888801aF4d980682e47f1A9036e589479e835C5",
    params: ["0xBE3F88E18BE3944FdDa830695228ADBB82fA125F"]
  },
  {  // oneMPH
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0xBE3F88E18BE3944FdDa830695228ADBB82fA125F"]
  },
  { // oneICHI
    target: "0x903bEF1736CDdf2A537176cf3C64579C3867A881",
    params: ["0x4db2c02831c9ac305FF9311Eb661f80f1dF61e07"]
  },
  {  // oneICHI
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0x4db2c02831c9ac305FF9311Eb661f80f1dF61e07"]
  },
  { // oneGIV
    target: "0x900dB999074d9277c5DA2A43F252D74366230DA0",
    params: ["0x17e6BA2519B4d15199B6529dB340910Ae031b1B0"]
  },
  {  // oneGIV - Used DAI not USDC
    target: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    params: ["0x17e6BA2519B4d15199B6529dB340910Ae031b1B0"]
  },
  { // oneOJA
    target: "0x0aA7eFE4945Db24d95cA6E117BBa65Ed326e291A",
    params: ["0xbB9E5DB6F357BB4dF35E8B90B37b8A3F33031D86"]
  },
  {  // oneOJA
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0xbB9E5DB6F357BB4dF35E8B90B37b8A3F33031D86"]
  },
  { // oneWING
    target: "0xDb0f18081b505A7DE20B18ac41856BCB4Ba86A1a",
    params: ["0x5047fc5C9D7c49Ab22e390d13646a6A3a2476eff"]
  },
  {  // oneWING
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0x5047fc5C9D7c49Ab22e390d13646a6A3a2476eff"]
  },
  {  // BootUSD – Takes only USDC 
    target: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    params: ["0x78a3B2f1e7eec1073088ea4a193618743F81cEf8"]
  },
]


async function getVaultTvl(balances, vaults, tokenAtIndex, block) {
  let allOneTokens = []
  tokenAtIndex.map(p => {
    allOneTokens.push(p.output.toLowerCase());
  })

  const token0s = (await sdk.api.abi.multiCall({
    calls: vaults.map(p => ({
      target: p
    })),
    abi: abi["token0"],
    block
  })).output;

  const token1s = (await sdk.api.abi.multiCall({
    calls: vaults.map(p => ({
      target: p
    })),
    abi: abi["token1"],
    block
  })).output;

  const totalAmounts = (await sdk.api.abi.multiCall({
    calls: vaults.map(p => ({
      target: p
    })),
    abi: abi["getTotalAmounts"],
    block
  })).output;

  await requery(totalAmounts, 'ethereum', block, abi["getTotalAmounts"]);
  await requery(token0s, 'ethereum', block, abi["token0"]);
  await requery(token1s, 'ethereum', block, abi["token1"]);

  for (let i = 0; i < vaults.length; i++) {
    const tokens = [
      token0s[i].output.toLowerCase(),
      token1s[i].output.toLowerCase()
    ]

    const bals = [
      totalAmounts[i].output[0],
      totalAmounts[i].output[1]
    ]

    for (let j = 0; j < 2; j++) {
      if (allOneTokens.includes(tokens[j])) {
        break;
      }
      sdk.util.sumSingleBalance(balances, tokens[j], bals[j]);
    }
  }
}

async function getOneTokens(block) {
  const tokenCount = (await sdk.api.abi.call({
    target: tokenFactory,
    abi: abi.oneTokenCount,
    block
  })).output;

  const tokenAtIndex = (await sdk.api.abi.multiCall({
    calls: [...Array(tokenCount).keys()].map((i) => ({
      target: tokenFactory,
      params: [i]
    })),
    abi: abi.oneTokenAtIndex,
    block
  })).output;

  return tokenAtIndex
}
async function getTreasuryTvl(balances, tokenAtIndex, block) {

  for (let i = 0; i < tokenAtIndex.length; i++) {
    const asset = tokenAtIndex[i];
    const assetCount = (await sdk.api.abi.call({
      target: asset.output,
      abi: abi["assetCount"],
      block
    })).output;

    const assetAtIndex = (await sdk.api.abi.multiCall({
      calls: Array.from({ length: Number(assetCount) }, (_, k) => ({
        target: asset.output,
        params: k
      })),
      abi: abi["assetAtIndex"],
      block
    })).output;

    const assetBalances = (await sdk.api.abi.multiCall({
      calls: assetAtIndex.map(p => ({
        target: p.output,
        params: p.input.target
      })),
      abi: "erc20:balanceOf",
      block
    })).output;

    assetBalances.forEach(p => {
      const token = p.input.target.toLowerCase();
      const balance = p.output;

      if (token === "0xdb0f18081b505a7de20b18ac41856bcb4ba86a1a") {
        sdk.util.sumSingleBalance(balances, ["wing-finance"], BigNumber(balance).div(1e9).toFixed(0));
        return;
      }

      sdk.util.sumSingleBalance(balances, token, balance);
    })
  }
}

async function getDepositTvl(balances, tokenAtIndex, block) {
  const tokenBalances = (await sdk.api.abi.multiCall({
    calls: tokenAtIndex.map(p => ({
      target: p.output,
      params: farmContract
    })),
    abi: "erc20:balanceOf",
    block
  })).output;

  tokenBalances.forEach(p => {
      sdk.util.sumSingleBalance(balances, p.input.target, p.output);
  });
}

async function getLendingTvl(balances, block) {

  const ethBalance = (await sdk.api.eth.getBalance({
    target: "0xd2626105690e480dfeb12a64bc94b878df9d35d8",
    block: block,
  })).output;

  sdk.util.sumSingleBalance(
    balances, 
    "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", 
    ethBalance
  )
  
  const balanceOfResults = await sdk.api.abi.multiCall({
    calls: lendingPools,
    abi: 'erc20:balanceOf',
    block
  })
  sdk.util.sumMultiBalanceOf(balances, balanceOfResults, true)
}

async function getVaults(block) {
  const estVaultCount = 30;
  const vaults = (await sdk.api.abi.multiCall({
    block,
    calls: [...Array(estVaultCount).keys()].map((i) => ({
      target: '0x5a40DFaF8C1115196A1CDF529F97122030F26112',
      params: [i],
    })),
    abi: abi.allVaults,
  })).output.filter(v => v.success == true).map(v => v.output);
  return vaults;
}

async function tvl(timestamp, block) {
  let balances = {};

  const vaults = await getVaults(block)
  const ichiTokens = await getOneTokens(block)

  await getTreasuryTvl(balances, ichiTokens, block);
  await getVaultTvl(balances, vaults, ichiTokens, block);
  await getLendingTvl(balances, block);
  await getDepositTvl(balances, ichiTokens, block);

  for (let t of ichiTokens) {
    delete balances[t]
  }
  return balances;
}


async function getPoolTvl(balances, poolWithTokens, block) {
  for (let i = 0; i < poolWithTokens.length; i++) {
    const pool = poolWithTokens[i][0];
    const tokens = poolWithTokens[i][1];
    const poolBalances = (await sdk.api.abi.multiCall({
      calls: tokens.map(p => ({
        target: p,
        params: pool
      })),
      abi: "erc20:balanceOf",
      block
    })).output;
    poolBalances.forEach(p => {
      sdk.util.sumSingleBalance(balances, p.input.target, p.output);
    })
  }
}

async function pool2(timestamp, block) {
  let balances = {};

  const unilpBalance = (await sdk.api.abi.multiCall({
    calls: unilps.map(p => ({
      target: p,
      params: farmContract
    })),
    abi: "erc20:balanceOf",
    block
  })).output;

  let lpPositions = [];
  unilpBalance.forEach(p => {
    lpPositions.push({ token: p.input.target, balance: p.output });
  })

  await unwrapUniswapLPs(balances, lpPositions, block);
  await getPoolTvl(balances, poolWithTokens, block);

  return balances;
}

module.exports = {
  methodology: "Tokens deposited to mint oneTokens, Angel and HODL vaults excluding oneTokens",
  misrepresentedTokens: true,
  ethereum: {
    tvl,
    pool2,
    staking: stakings([xIchi, ichiLending] , ichi_v2)
  }
} // node test.js projects/ichifarm/index.js