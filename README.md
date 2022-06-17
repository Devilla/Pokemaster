# PokeMaster

This repository contains a project of a Pokémon Trading Card Game using ERC 721 Non-Fungible Tokens. A special token is rewarded to a lucky user using on-chain verifiable random functions.

The dapp was created using a [sample project from buidler](http://buidler.dev/tutorial/hackathon-boilerplate-project.html). The NFTs were created following [this guide](https://docs.opensea.io/docs/getting-started). The random number generator used to mint the special tokens was created using [this Chainlink VRF tutorial](https://docs.chain.link/docs/get-a-random-number).

## Quick start

The first things you need to do are cloning this repository and installing its
dependencies:

```sh
git clone https://github.com/devilla/Pokemaster.git
cd Pokemaster
npm install
```

Before deploying your contract you have to set the credentials in your .env file

Then, on a new terminal, go to the repository's root folder and run this to
deploy PokeToken contract:

```sh
npx buidler run scripts/deploy_PokeToken.js --network goerli
```

Finally, we can run the frontend with:

```sh
cd frontend
npm install
npm start
```

Open [http://localhost:3000/](http://localhost:3000/) to see your Dapp. You will
need to have [Metamask](http://metamask.io) installed and listening to
`the Goerli network`.

## What’s Included?

Your environment will have everything you need to build a Dapp powered by Buidler and React.

- [Buidler](https://buidler.dev/): An Ethereum development task runner and testing network.
- [Chainlink](https://docs.chain.link/docs): A library to interact with a descentralized oracle network.
- [OpenZeppelin](https://docs.openzeppelin.com/openzeppelin/): A library of secure smart contracts.
- [Mocha](https://mochajs.org/): A JavaScript test runner.
- [Chai](https://www.chaijs.com/): A JavaScript assertion library.
- [ethers.js](https://docs.ethers.io/ethers.js/html/): A JavaScript library for interacting with Ethereum.
- [Waffle](https://github.com/EthWorks/Waffle/): To have Ethereum-specific Chai assertions/mathers.
- [A sample frontend/Dapp](./frontend): A Dapp which uses [Create React App](https://github.com/facebook/create-react-app).

## Troubleshooting

- `Invalid nonce` errors: if you are seeing this error on the `buidler node`
  console, try resetting your Metamask account. This will reset the account's
  transaction history and also the nonce. Open Metamask, click on your account
  followed by `Settings > Advanced > Reset Account`.
