// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import 'hardhat/console.sol';

contract Stampost {

  
  function getMessageHash(
    uint256 _landId,
    uint256 _avatarId,
    uint256 _missionId
  ) public pure returns (bytes32) {
    return keccak256(abi.encodePacked(_landId, _avatarId, _missionId));
  }

  function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
    return keccak256(abi.encodePacked('\x19Ethereum Signed Message:\n32', _messageHash));
  }

  function verify(
    address _signer,
    uint256 _landId,
    uint256 _avatarId,
    uint256 _missionId,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public view returns (bool) {
    bytes32 messageHash = getMessageHash(_landId, _avatarId, _missionId);
    bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);
    return recoverSigner(ethSignedMessageHash, v, r, s) == _signer;
  }

  function recoverSigner(
    bytes32 _ethSignedMessageHash,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public view returns (address) {
    address signer = ecrecover(_ethSignedMessageHash, v, r, s);

    console.log('signer address', signer);

    return signer;
  }
}
