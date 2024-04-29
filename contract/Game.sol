// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0; 

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
    }

    constructor (address verifierAddress, bytes32 verificationKeyHash) {
        totalPlayer = 0;
        totalBlock = 0;
        tradingVerifierAddressMap[verificationKeyHash] = verifierAddress;
    }

    event payEvent(uint time,address sender,uint eventType,uint value);

    function startGame() public payable {
        require(msg.value >= 5*10**15,"ETH is not enough!");
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
        players[totalPlayer] = msg.sender;
        totalPlayer = totalPlayer + 1;
    }

    function distribution(address payable winner) internal {
        winner.transfer(10**18);
    }

    function expand() public payable {
        require(msg.value >= 10**16,"ETH is not enough!");
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