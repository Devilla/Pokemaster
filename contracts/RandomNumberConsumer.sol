pragma solidity ^0.6.8;

import "@chainlink/contracts/src/v0.6/VRFConsumerBase.sol";
import "./PokeToken.sol";

/** This example code is designed to quickly deploy an example contract using Remix.
 *  If you have never used Remix, try our example walkthrough: https://docs.chain.link/docs/example-walkthrough
 *  You will need testnet ETH and LINK.
 *     - goerli ETH faucet: https://faucet.goerli.network/
 *     - goerli LINK faucet: https://goerli.chain.link/
 */

contract RandomNumberConsumer is VRFConsumerBase {

    bytes32 internal keyHash;
    uint256 internal fee;

    uint256 public randomResult;

    uint256 public cardId;
    mapping(uint256 => uint256) public specialCards;
    PokeToken tokenContract;

    /**
     * Constructor inherits VRFConsumerBase
     *
     * Network: Rinkeby
     * Chainlink VRF Coordinator address: 0x6168499c0cFfCaCD319c818142124B7A15E857ab
     * LINK token address:                0x01BE23585060835E02B77ef475b0Cc51aA1e0709
     * Key Hash: 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc
     */
    constructor(PokeToken addr)
        VRFConsumerBase(
            0x6168499c0cFfCaCD319c818142124B7A15E857ab, // VRF Coordinator
            0x01BE23585060835E02B77ef475b0Cc51aA1e0709  // LINK Token
        ) public
    {
        tokenContract = addr;
        keyHash = 0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc;
        fee = 0.1 * 10 ** 18; // 0.1 LINK
    }

    /**
     * Requests randomness from a user-provided seed
     */
    function getRandomNumber(uint256 userProvidedSeed, uint256 specialCard) public returns (bytes32 requestId) {
        require(LINK.balanceOf(address(this)) > fee, "Not enough LINK - fill contract with faucet");
        cardId = specialCard;
        return requestRandomness(keyHash, fee, userProvidedSeed);
    }

    /**
     * Callback function used by VRF Coordinator
     */
    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        require(tokenContract.totalSupply() > 0, "Not enough players");
        uint256 winnerIndex = randomness.mod(tokenContract.totalSupply());
        specialCards[cardId] = winnerIndex;
        randomResult = randomness;
        tokenContract.awardSpecialItem( specialCards[cardId], cardId);
    }

    /**
   * Send reward to the winers
   */
  function mintAwardToken() public payable {
    tokenContract.awardSpecialItem( specialCards[cardId], cardId);
  }
}
