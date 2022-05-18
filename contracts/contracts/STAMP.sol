// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import "@openzeppelin/contracts/access/Ownable.sol";

import "hardhat/console.sol";

contract STAMP is IERC20, Ownable {
    using SafeMath for uint256;

    string public constant name = "Stampost Token";
    string public constant symbol = "STAMP";
    uint8 public constant decimals = 18;
    address public stampost;

    mapping(address => uint256) balances;
    mapping(address => mapping (address => uint256)) allowed;
    mapping(address => mapping (address => uint256)) public locked;
    mapping(address => mapping (address => uint256)) waiting;

    uint256 totalSupply_;

    constructor(uint256 total) {
        totalSupply_ = total;
        balances[msg.sender] = totalSupply_;
    }

    function setStampost(address _stampost) public onlyOwner {
        stampost = _stampost;
    }

    function lock(address from, address to, uint256 numTokens) onlyStampost public {
        require(numTokens <= balances[from], "Not enough balance to lock");

        balances[from] = balances[from].sub(numTokens);
        locked[from][to] = locked[from][to].add(numTokens);
        waiting[to][from] = waiting[to][from].add(numTokens);
    }

    function unlock(address from, address to, uint256 numTokens) onlyStampost public {
        require(numTokens <= locked[from][to], "Not enough locked to unlock");

        balances[to] = balances[to].add(numTokens);
        locked[from][to] = locked[from][to].sub(numTokens);
        waiting[to][from] = waiting[to][from].sub(numTokens);
    }



    function totalSupply() public override view returns (uint256) {
        return totalSupply_;
    }

    function balanceOf(address tokenOwner) public override view returns (uint256) {
        return balances[tokenOwner];
    }

    function transfer(address receiver, uint256 numTokens) public override returns (bool) {
        require(numTokens <= balances[msg.sender]);
        balances[msg.sender] = balances[msg.sender].sub(numTokens);
        balances[receiver] = balances[receiver].add(numTokens);
        emit Transfer(msg.sender, receiver, numTokens);
        return true;
    }

    function approve(address delegate, uint256 numTokens) public override returns (bool) {
        allowed[msg.sender][delegate] = numTokens;
        emit Approval(msg.sender, delegate, numTokens);
        return true;
    }

    function allowance(address owner, address delegate) public override view returns (uint) {
        return allowed[owner][delegate];
    }

    function transferFrom(address owner, address buyer, uint256 numTokens) public override returns (bool) {
        require(numTokens <= balances[owner]);
        require(numTokens <= allowed[owner][msg.sender]);

        balances[owner] = balances[owner].sub(numTokens);
        allowed[owner][msg.sender] = allowed[owner][msg.sender].sub(numTokens);
        balances[buyer] = balances[buyer].add(numTokens);
        emit Transfer(owner, buyer, numTokens);
        return true;
    }

    modifier onlyStampost () {
        require(msg.sender == stampost);
        _;
    }
}

library SafeMath {
    function sub(uint256 a, uint256 b) internal pure returns (uint256) {
      assert(b <= a);
      return a - b;
    }

    function add(uint256 a, uint256 b) internal pure returns (uint256) {
      uint256 c = a + b;
      assert(c >= a);
      return c;
    }
}