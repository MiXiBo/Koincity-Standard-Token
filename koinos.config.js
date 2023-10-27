const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

module.exports = {
  class: "Token",
  proto: ["./proto/token.proto"],
  files: ["./Token.ts"],
  sourceDir: "./assembly",
  buildDir: "./build",
  koinosProtoDir: "../../node_modules/koinos-precompiler-as/koinos-proto",
  networks: {
    harbinger: {
      rpcNodes: [
        "https://harbinger-api.koinos.io",
        "https://testnet.koinosblocks.com",
      ],
      accounts: {
        manaSharer: {
          privateKey: process.env.HARBINGER_MANA_SHARER_PRIVATE_KEY,
        },
      },
      tokenInfo: {
        name: process.env.HARBINGER_TOKEN_NAME,
        symbol: process.env.HARBINGER_TOKEN_SYMBOL,
        /*decimals: Number(process.env.HARBINGER_TOKEN_DECIMALS),*/
      },
      mintInfo: {
        to: process.env.HARBINGER_TOKEN_RECEIVER,
        value: process.env.HARBINGER_TOKEN_SUPPLY,
      },
    },
    mainnet: {
      rpcNodes: ["https://api.koinos.io", "https://api.koinosblocks.com"],
      accounts: {
        manaSharer: {
          privateKey: process.env.MAINNET_MANA_SHARER_PRIVATE_KEY,
        },
      },
      tokenInfo: {
        name: process.env.MAINNET_TOKEN_NAME,
        symbol: process.env.MAINNET_TOKEN_SYMBOL,
        decimals: Number(process.env.MAINNET_TOKEN_DECIMALS),
      },
      mintInfo: {
        to: process.env.MAINNET_TOKEN_RECEIVER,
        value: process.env.HARBINGER_TOKEN_SUPPLY,
      },
    },
  },
};
