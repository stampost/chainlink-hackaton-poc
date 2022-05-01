// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import 'hardhat/console.sol';

contract Stampost {


  struct PublicKey {
   string key;
  }

  mapping (address =>  PublicKey) public publicKeys;

  
  function requestPublicKey(
    uint256 _chainId,
    address _recepient,
    uint256 _stamps,
    string calldata _publicKey
  ) public {
    publicKeys[msg.sender].key = _publicKey;
  }

  function getAcceptedPublicKey(address _recepient) public view returns (string memory) {
    string memory key =  publicKeys[_recepient].key;
    console.log(key);
    return key;
  }

}
