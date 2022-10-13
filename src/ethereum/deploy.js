const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
// const ganache = require("ganache-cli")

const compiledBatu = require("./build/BatuFi.json");

// const provider = ganache.provider()
const provider = new HDWalletProvider(
  "capital domain approve brief neglect mobile seat ethics tuition fiber creek inside",
  "https://rinkeby.infura.io/v3/bc262ab82c064a8881f0f2fb2ff78728"
  // 'https://goerli.infura.io/v3/bc262ab82c064a8881f0f2fb2ff78728'
);
const web3 = new Web3(provider);

const deploy = async () => {
  // Get a list of all accounts
  try {
    const accounts = await web3.eth.getAccounts();

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
