// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0; 

interface AggregatorV3Interface {
  function latestRoundData()
    external
    view
    returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound);
}

interface IUltraVerifier {
    function getVerificationKeyHash() external pure returns (bytes32);

    function verify(
        bytes calldata _proof,
        bytes32[] calldata _publicInputs
    ) external view returns (bool);
}

contract Game {
    uint public totalPlayer;
    uint public totalBlock;
    
    mapping(uint=>address) public players;
    mapping(uint=>GameBlock) public GameBlocks;
    mapping(bytes32=>address) public tradingVerifierAddressMap;

    AggregatorV3Interface private btcUSDAggregator;
    AggregatorV3Interface private ethUSDAggregator;
    AggregatorV3Interface private linkETHAggregator;
    AggregatorV3Interface private usdtUSDAggregator;

    struct GameBlock{
        uint startTime;
        address payable winner;
        uint topGrade;
        uint startId;
        uint endId;
        mapping(address=>Player) Players;
    }

    struct Player{
      uint playId;
      address playerAddr;
      uint  grade;
      int256 btcPrice;
      int256 ethPrice;
      int256 linkEthPrice;
      int256 usdtPrice;
    }

    constructor (address verifierAddress, bytes32 verificationKeyHash) {
        totalPlayer = 0;
        totalBlock = 0;
        tradingVerifierAddressMap[verificationKeyHash] = verifierAddress;
        btcUSDAggregator = AggregatorV3Interface(0x87dce67002e66C17BC0d723Fe20D736b80CAaFda);
        ethUSDAggregator = AggregatorV3Interface(0x59F1ec1f10bD7eD9B938431086bC1D9e233ECf41);
        linkETHAggregator = AggregatorV3Interface(0xdC97CA0F3521c7F271555175314b812816ed125B);
        usdtUSDAggregator = AggregatorV3Interface(0xb84a700192A78103B2dA2530D99718A2a954cE86);
    }

    function getBtcUsdLatestPrice() public view returns (int) {
        (, int256 price, , , ) = btcUSDAggregator.latestRoundData();
        return price;
    }

    function getEthUsdLatestPrice() public view returns (int) {
        (, int256 price, , , ) = ethUSDAggregator.latestRoundData();
        return price;
    }

    function getLinkEthLatestPrice() public view returns (int) {
        (, int256 price, , , ) = linkETHAggregator.latestRoundData();
        return price;
    }

    function getUsdtUsdLatestPrice() public view returns (int) {
        (, int256 price, , , ) = usdtUSDAggregator.latestRoundData();
        return price;
    }

    // eg. 3000usdt = 1 eth = 10**18
    // current eth price: $3190, if usd = 3190, then you will get 10**18
    function calUsdToEthAmount(uint usd) public view returns(uint) {
        int256 ethPrice = getEthUsdLatestPrice();
        return usd * uint((10**18/ethPrice) * 10**8); // will not overflow, when eth price is under $10**10
    }

    event payEvent(uint time,address sender,uint eventType,uint value);

    // you need to pay 2usd to join game
    function startGame() public payable returns(int256, int256, int256, int256){
        int256 btcPrice = getBtcUsdLatestPrice();
        int256 ethPrice = getEthUsdLatestPrice();
        int256 linkEthPrice = getLinkEthLatestPrice();
        int256 usdtPrice = getUsdtUsdLatestPrice();
        uint ethAmountToPay = calUsdToEthAmount(2); // pay $2
        require(msg.value >= ethAmountToPay,"ETH is not enough!");
        if(address(this).balance>10**18){
            // transfer to winner
            address payable winner = GameBlocks[totalBlock].winner;
            distribution(winner);
            totalBlock = totalBlock + 1;
            GameBlocks[totalBlock].startTime = block.timestamp;
            GameBlocks[totalBlock].startId = totalPlayer;
        }
        GameBlocks[totalBlock].endId = totalPlayer;
        GameBlocks[totalBlock].Players[msg.sender].playId = totalPlayer;
        GameBlocks[totalBlock].Players[msg.sender].playerAddr = msg.sender;
        GameBlocks[totalBlock].Players[msg.sender].btcPrice = btcPrice;
        GameBlocks[totalBlock].Players[msg.sender].ethPrice = ethPrice;
        GameBlocks[totalBlock].Players[msg.sender].linkEthPrice = linkEthPrice;
        GameBlocks[totalBlock].Players[msg.sender].usdtPrice = usdtPrice;

        players[totalPlayer] = msg.sender;
        totalPlayer = totalPlayer + 1;
        // the gaming needs the price to generate market data
        return (btcPrice, ethPrice, linkEthPrice, usdtPrice);
    }

    function getCurrentPlayerDataFeedPrice(address sender) external view returns(int256, int256, int256, int256) {
        Player memory player = GameBlocks[totalBlock].Players[sender];
        return (
            player.btcPrice,
            player.ethPrice,
            player.linkEthPrice,
            player.usdtPrice
        );
    }

    function distribution(address payable winner) internal {
        winner.transfer(10**18);
    }

    // you need to pay $10 to expaned your position's size
    function expand() public payable {
        uint ethAmountToPay = calUsdToEthAmount(10); // pay $10
        require(msg.value >= ethAmountToPay,"ETH is not enough!");
        emit payEvent(block.timestamp,msg.sender,1,msg.value);
    }

    function gameOver(bytes32 verificationKeyHash, bytes calldata proof, uint grade) public {
        bytes32[] memory publicInputs = new bytes32[](1);
        publicInputs[0] = bytes32(grade);
        address tradingVerifierAddress = tradingVerifierAddressMap[verificationKeyHash];
        require(tradingVerifierAddress != address(0),"VerificationKeyHash is invalid!");
        IUltraVerifier tradingVerifier = IUltraVerifier(tradingVerifierAddress);
        bool verify = tradingVerifier.verify(proof, publicInputs);
        require(verify, "Verify failed!");
        GameBlocks[totalBlock].Players[msg.sender].grade = grade;
        if(grade>GameBlocks[totalBlock].topGrade){
            GameBlocks[totalBlock].topGrade = grade;
            GameBlocks[totalBlock].winner = payable(msg.sender);
        }
    }

    function getNow() public view returns(uint){
        return block.timestamp;
    }

    function getTopPlayer() public view returns(address,uint){
        return (GameBlocks[totalBlock].winner,GameBlocks[totalBlock].topGrade);
    }

    /**
    * @notice Generates a random number between 0 - 100
    * @param seed The seed to generate different number if block.timestamp is same
    * for two or more numbers.
    */
    function importSeedFromThird(uint256 seed) public view returns (uint) {
        uint8 randomNumber = uint8(
            uint256(keccak256(abi.encodePacked(block.timestamp, seed))) % 500
        );
        return randomNumber;
    }
}