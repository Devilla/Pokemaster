import React from "react";

// We'll use ethers to interact with the Ethereum network and our contract
import { ethers } from "ethers";

// We import the contract's artifacts and address here, as we are going to be
// using them with ethers
import TokenArtifact from "../contracts/PokeToken.json";
import contractAddress from "../contracts/token-address.json";

// All the logic of this dapp is contained in the Dapp component.
// These other components are just presentational ones: they don't have any
// logic. They just render HTML.
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { Transfer } from "./Transfer";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
import { NoTokensMessage } from "./NoTokensMessage";
import { Trade } from "./Trade";

import ReactCardFlip from 'react-card-flip';
import { Navbar } from "./NavbarUI";
import backcard from '../img/backcard.png';

// This is the Buidler EVM network id, you might change it in the buidler.config.js
// Here's a list of network ids https://docs.metamask.io/guide/ethereum-provider.html#properties
// to use when deploying to other networks.
//const BUIDLER_EVM_NETWORK_ID = '31337';
const BUIDLER_EVM_NETWORK_ID = '4';

// This is an error code that indicates that the user canceled a transaction
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

// This component is in charge of doing these things:
//   1. It connects to the user's wallet
//   2. Initializes ethers and the Token contract
//   3. Polls the user balance to keep it updated.
//   4. Transfers tokens by sending transactions
//   5. Renders the whole application
//
// Note that (3) and (4) are specific of this sample application, but they show
// you how to keep your Dapp and contract's state in sync,  and how to send a
// transaction.
export class Dapp extends React.Component {
  constructor(props) {
    super(props);

    // We store multiple things in Dapp's state.
    // You don't need to follow this pattern, but it's an useful example.
    this.initialState = {
      // The info of the token (i.e. It's Name and symbol)
      tokenData: undefined,
      // The user's address and balance
      selectedAddress: undefined,
      balance: undefined,
      // The ID about transactions being sent, and any possible error with them
      txBeingSent: undefined,
      transactionError: undefined,
      networkError: undefined,
      pokeToken: undefined,
      isFlipped: false,
      pokeData: undefined,
      moveData: undefined,
      myCards: [],
      currentCard: undefined,
      resolvedAddr:undefined
    };

    this.state = this.initialState;
  }

  callbackFunction = (resolvedAddr) => {
      this.setState({resolvedAddr: resolvedAddr})
      console.log(this.state.selectedAddress, resolvedAddr, this.state.myCards[0].toNumber());
      try {
        this._tradeSpecialItem(this.state.selectedAddress, resolvedAddr, this.state.myCards[0].toNumber());
        this.setState({isFlipped:false});
      } catch (e) {
        console.log(e);
      } finally {

      }
  }

  render() {
    // Ethereum wallets inject the window.ethereum object. If it hasn't been
    // injected, we instruct the user to install MetaMask.
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    // The next thing we need to do, is to ask the user to connect their wallet.
    // When the wallet gets connected, we are going to save the users's address
    // in the component's state. So, if it hasn't been saved yet, we have
    // to show the ConnectWallet component.
    //
    // Note that we pass it a callback that is going to be called when the user
    // clicks a button. This callback just calls the _connectWallet method.
    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    // If the token data or the user's balance hasn't loaded yet, we show
    // a loading component.
    if (!this.state.tokenData || !this.state.balance) {
      return <Loading />;
    }

    return (
      <div className="container">
        <Navbar/>
        <div className="row justify-content-md-center d-flex align-items-center">
          <div className="col-md-6 text-center d-inline-flex flex-column align-items-center">
            <ReactCardFlip isFlipped={this.state.isFlipped} flipDirection="horizontal">

                <div className="bg-light pb-2 pt-2 pr-2 pl-2 d-flex rounded card card-with-shadow" style={{height: '375px', width: '250px'}}>
                  <img style={{height: '230px'}} className="card-img-top" src={backcard} alt="Card image cap"/>
                </div>

                <div className="bg-warning pb-2 pt-2 pr-2 pl-2 d-flex rounded card card-with-shadow" style={{height: '375px', width: '250px'}}>
                  <div className="card text-white bg-primary d-flex pr-2 pl-2">
                    <div style={{padding: '0px'}} className="card-header mt-2">
                      <h5><strong>#{this.state.pokeToken} {this.state.pokeData && this.state.pokeData.name}</strong></h5>
                    </div>
                    <div className="card border-light bg-light">
                      <img style={{height: '150px'}} src={this.state.pokeData && this.state.pokeData.image} className="card-img-top" alt="..."/>
                    </div>
                    <div className="card-footer pb-0 pr-2 pl-2" style={{height: '155px'}}>
                      <div style={{height: '108px'}}>
                        <div className="d-flex flex-row">
                          <h5>{this.state.moveData && this.state.moveData.name}</h5>
                        </div>
                        <div className="d-flex flex-row">
                          <p className="card-text"><small>{this.state.moveData && this.state.moveData.description}</small></p>
                        </div>
                      </div>
                      <div className="d-flex flex-row-reverse align-self-end">
                        <h5>{this.state.moveData && this.state.moveData.damage} pts</h5>
                      </div>
                    </div>
                  </div>
                </div>

            </ReactCardFlip>

            <br/>

            <Trade callbackFunction = {this.callbackFunction}/>

            {this.state.resolvedAddr && <p className="btn-success mt-3">Send PokeToken: {this.state.resolvedAddr}</p>}

          </div>
          <div className="col-md-6 text-center d-inline-flex flex-column align-items-center">

            <div className="jumbotron  pt-3 pb-5 mb-0">
              <img className="mb-1" src="https://i.pinimg.com/originals/ad/e4/ae/ade4aee3ca5c50f9b02ab18a58596a24.png" />
              {this.state.balance.eq(0) && (
                <button type="button" className="btn btn-danger btn-lg mt-3" onClick={() => this._awardToken()}>Get you first trading card</button>
              )}
              {this.state.balance.gt(0) && (
                <div>
                  <h5>Select your card:</h5>
                  <select className="form-control"
                  onChange={
                    (event) => {
                      this._getCardData(this.state.myCards.findIndex(card => card.toString() === event.target.value.toString()))
                      this.setState({currentCard:event.target.value.toNumber()})
                  }}
                    value={this.state.currentCard}>
                    {this.state.myCards.map((card,i) => (
                      <option key={i} value={card}>{"Collector Card #" + card.toString()}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  componentWillUnmount() {
    // We poll the user's balance, so we have to stop doing that when Dapp
    // gets unmounted
    this._stopPollingData();

  }

  async _connectWallet() {
    // This method is run when the user clicks the Connect. It connects the
    // dapp to the user's wallet, and initializes it.

    // To connect to the user's wallet, we have to run this method.
    // It returns a promise that will resolve to the user's address.
    const [selectedAddress] = await window.ethereum.enable();

    // Once we have the address, we can initialize the application.

    // First we check the network
    if (!this._checkNetwork()) {
      return;
    }

    this._initialize(selectedAddress);

    // We reinitialize it whenever the user changes their account.
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      this._stopPollingData();
      // `accountsChanged` event can be triggered with an undefined newAddress.
      // This happens when the user removes the Dapp from the "Connected
      // list of sites allowed access to your addresses" (Metamask > Settings > Connections)
      // To avoid errors, we reset the dapp state
      if (newAddress === undefined) {
        return this._resetState();
      }

      this._initialize(newAddress);
    });

    // We reset the dapp state if the network is changed
    window.ethereum.on("networkChanged", ([networkId]) => {
      this._stopPollingData();
      this._resetState();
    });
  }

  _initialize(userAddress) {
    // This method initializes the dapp

    // We first store the user's address in the component's state
    this.setState({
      selectedAddress: userAddress,
    });

    // Then, we initialize ethers, fetch the token's data, and start polling
    // for the user's balance.

    // Fetching the token data and the user's balance are specific to this
    // sample project, but you can reuse the same initialization pattern.
    this._intializeEthers();
    this._getTokenData();
    this._startPollingData();
  }

  async _intializeEthers() {
    // We first initialize ethers by creating a provider using window.ethereum
    this._provider = new ethers.providers.Web3Provider(window.ethereum);

    // When, we initialize the contract using that provider and the token's
    // artifact. You can do this same thing with your contracts.
    this._token = new ethers.Contract(
      contractAddress.address,
      TokenArtifact.abi,
      this._provider.getSigner(0)
    );
  }

  // The next to methods are needed to start and stop polling data. While
  // the data being polled here is specific to this example, you can use this
  // pattern to read any data from your contracts.
  //
  // Note that if you don't need it to update in near real time, you probably
  // don't need to poll it. If that's the case, you can just fetch it when you
  // initialize the app, as we do with the token data.
  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._updateBalance(), 10000);

    // We run it once immediately so we don't have to wait for it
    this._updateBalance();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  // The next two methods just read from the contract and store the results
  // in the component state.
  async _getTokenData() {
    const name = await this._token.name();
    const symbol = await this._token.symbol();

    this.setState({ tokenData: { name, symbol } });
  }

  async _getCardData(index) {
    if(this.state.balance > 0) {
      this.setState({ isFlipped: false });
      const cors_prefix = "https://cors-anywhere.herokuapp.com/";
      const pokeToken = await this._token.tokenOfOwnerByIndex(this.state.selectedAddress, index);
      this.setState({ pokeToken: pokeToken.toString() });
      const pokeURL = await this._token.tokenURI(pokeToken);
      const pokeGetData = await fetch( cors_prefix + pokeURL, {
        method: "GET",
        headers: {
          "access-control-allow-origin" : "*",
          "Content-type": "application/json; charset=UTF-8"
        }});
      const pokeData = await pokeGetData.json();
      this.setState({ pokeData });
      const moveURL = "https://cryptopokes.herokuapp.com/api/move/" + pokeToken;
      const move = await fetch(cors_prefix + moveURL, {
        method: "GET",
        headers: {
          "access-control-allow-origin" : "*",
          "Content-type": "application/json; charset=UTF-8"
        }});
      const moveData = await move.json();
      this.setState({ moveData });
      this.setState({ isFlipped: true });
    }
  }

  async _updateBalance() {
    const balance = await this._token.balanceOf(this.state.selectedAddress);
    this.setState({ balance });
    const cards = [];
    for ( var i = 0; i < balance; i++){
      var card = await this._token.tokenOfOwnerByIndex(this.state.selectedAddress, i);
      cards.push(card);
    }
    if(cards.length > 0 && !this.state.pokeData) {
      this._getCardData(0);
    }
    this.setState({ myCards: cards });
  }

  // This method sends an ethereum transaction to transfer tokens.
  // While this action is specific to this application, it illustrates how to
  // send a transaction.
  async _transferTokens(to, amount) {
    // Sending a transaction is a complex operation:
    //   - The user can reject it
    //   - It can fail before reaching the ethereum network (i.e. if the user
    //     doesn't have ETH for paying for the tx's gas)
    //   - It has to be mined, so it isn't immediately confirmed.
    //     Note that some testing networks, like Buidler EVM, do mine
    //     transactions immediately, but your dapp should be prepared for
    //     other networks.
    //   - It can fail once mined.
    //
    // This method handles all of those things, so keep reading to learn how to
    // do it.

    try {
      // If a transaction fails, we save that error in the component's state.
      // We only save one such error, so before sending a second transaction, we
      // clear it.
      this._dismissTransactionError();

      // We send the transaction, and save its hash in the Dapp's state. This
      // way we can indicate that we are waiting for it to be mined.
      const tx = await this._token.transfer(to, amount);
      this.setState({ txBeingSent: tx.hash });

      // We use .wait() to wait for the transaction to be mined. This method
      // returns the transaction's receipt.
      const receipt = await tx.wait();

      // The receipt, contains a status flag, which is 0 to indicate an error.
      if (receipt.status === 0) {
        // We can't know the exact error that make the transaction fail once it
        // was mined, so we throw this generic one.
        throw new Error("Transaction failed");
      }

      // If we got here, the transaction was successful, so you may want to
      // update your state. Here, we update the user's balance.
      await this._updateBalance();
    } catch (error) {
      // We check the error code to see if this error was produced because the
      // user rejected a tx. If that's the case, we do nothing.
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }

      // Other errors are logged and stored in the Dapp's state. This is used to
      // show them to the user, and for debugging.
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      // If we leave the try/catch, we aren't sending a tx anymore, so we clear
      // this part of the state.
      this.setState({ txBeingSent: undefined });
    }
  }

  // This method just clears part of the state.
  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  // This method just clears part of the state.
  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  // This is an utility method that turns an RPC error into a human readable
  // message.
  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }

    return error.message;
  }

  // This method resets the state
  _resetState() {
    this.setState(this.initialState);
  }

  // This method checks if Metamask selected network is Localhost:8545
  _checkNetwork() {
    if (window.ethereum.networkVersion === BUIDLER_EVM_NETWORK_ID) {
      return true;
    }

    this.setState({
      networkError: 'Please connect Metamask to Goerli'
    });

    return false;
  }

  async _awardToken() {
    this._token.awardItem(this.state.selectedAddress);
    /*
    const cors_prefix = "https://cors-anywhere.herokuapp.com/";
    this._token.awardItem(this.state.selectedAddress);
    const pokeToken = await this._token.tokenOfOwnerByIndex(this.state.selectedAddress,0);
    this.setState({ pokeToken: pokeToken.toString() });
    const pokeURL = await this._token.tokenURI(pokeToken);
    const pokeGetData = await fetch(cors_prefix + pokeURL);
    const pokeData = await pokeGetData.json();
    this.setState({ pokeData });
    const moveURL = "https://cryptopokes.herokuapp.com/api/move/" + pokeToken;
    const move = await fetch(cors_prefix + moveURL);
    const moveData = await move.json();
    this.setState({ moveData });
    this.setState(prevState => ({ isFlipped: !prevState.isFlipped }));
    */
  }
  async _tradeSpecialItem(selectedAddress, resolvedAddr, currentCard) {
    this._token.tradeSpecialItem(selectedAddress, resolvedAddr, currentCard);
  }
}
