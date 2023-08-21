const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
// const ganache = require("ganache-cli")

const compiledBatu = require("./build/BatuFi.json");

// const provider = ganache.provider()
const provider = new HDWalletProvider(
  "remove spread idea habit frown bread code artwork cable cross type nation",
  "https://sepolia.infura.io/v3/f47f46b099464563b22b179b0567ac33"
);
const web3 = new Web3(provider);

const deploy = async () => {
  // Get a list of all accounts
  try {
    const accounts = await web3.eth.getAccounts();
    console.log(accounts)

    console.log("Contract deployed by", accounts[0]);

    // Use one of those accounts to deploy the contract
    const result = await new web3.eth.Contract(compiledBatu.abi)
      .deploy({
        data: compiledBatu.evm.bytecode.object,
        arguments: [accounts[0]],
      })
      .send({ from: accounts[0], gas: "8000000" });

    console.log("contract deployed to", result.options.address);
  } catch (err) {
    console.log(err);
  }
};

deploy();
