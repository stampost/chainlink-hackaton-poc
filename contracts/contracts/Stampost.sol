// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import './STAMP.sol';

import 'hardhat/console.sol';

contract Stampost is Ownable {

  address public stamp_token_address;
  uint256 requestMininalFee = 3e18;

  struct PublicKey {
   string key;
   bool isSet;
  }

  enum PublicKeyRequestStatus { PENDING, ACCEPTED, DECLINED }

  struct PublicKeyRequest {
    uint256 timestamp;
    address from;
    address to;
    uint256 stamps;
    PublicKeyRequestStatus status;
  }

  mapping (address =>  PublicKey) public publicKeys;

  uint256 private totalRequests;

  // all requests as array-ish mapping (0,1...totalRequests)
  mapping (uint256 => PublicKeyRequest) private requests;


  mapping (address => uint256) addressTotalRequests;
  mapping (address => uint256) senderTotalRequests;

  // link to request in requests
  mapping (address => mapping (uint256 => uint256)) userRequestById;
  mapping (address => mapping (address => uint256)) userRequestByAddress;

  mapping (address => mapping (uint256 => uint256)) senderRequestById;
  mapping (address => mapping (address => uint256)) senderRequestByAddress;


  // letters

  struct Letter {
    uint256 timestamp;
    address from;
    address to;
    string message;
    uint256 stamps;
    bool opened;
    bool isSet;
  }


  uint256 private totalLetters;

  // all letters as array-ish mapping (0,1...totalLetters)
  mapping (uint256 => Letter) private letters;

  mapping (address => uint256) incomingTotalLetters;
  mapping (address => uint256) outcomingTotalLetters;

  // link to letter in letters
  mapping (address => mapping (uint256 => uint256)) incomingLetterById;
  mapping (address => mapping (uint256 => uint256)) outcomingLetterById;

  constructor() {
    console.log("constructor");
  }

  function setStampToken(address _stamp_token_address) public onlyOwner {
    stamp_token_address = _stamp_token_address;
  }

  function getStampTokenAddress() public view returns (address) {
    return stamp_token_address;
  }
  

  function requestPublicKey(
    uint256 _chainId,
    address _recepient,
    uint256 _stamps,
    string calldata _publicKey
  ) public {
    require(_stamps >= requestMininalFee, "Attached stamps count is not enough");
    uint256 sender_stamp_balance = STAMP(stamp_token_address).balanceOf(msg.sender);
    require(sender_stamp_balance >= _stamps, "You have not enough stamps in you wallet, buy more on DEX");

    require(msg.sender != _recepient, "You can not send request to youself");

    uint256 requestId = userRequestByAddress[_recepient][msg.sender];

    console.log("requestID", requestId);
    require(requestId == 0, "You have already requested this address");

    publicKeys[msg.sender] = PublicKey(_publicKey, true);

    // create request
    PublicKeyRequest memory request = PublicKeyRequest(
      block.timestamp,
      msg.sender,
      _recepient,
      _stamps,
      PublicKeyRequestStatus.PENDING
    );

    saveRequest(_recepient, request);

    // lock tokens
    STAMP(stamp_token_address).lock(msg.sender, _recepient, _stamps);
    
  }

  function saveRequest(address _recepient, PublicKeyRequest memory _request) private {
    totalRequests++;
    requests[totalRequests] = _request;
    addressTotalRequests[_recepient]++;
    senderTotalRequests[msg.sender]++;

    uint256 userTotalRequests = addressTotalRequests[_recepient];
    uint256 senderTotalReqs = senderTotalRequests[msg.sender];

    userRequestById[_recepient][userTotalRequests] = totalRequests;
    userRequestByAddress[_recepient][msg.sender] = totalRequests;

    senderRequestById[msg.sender][senderTotalReqs] = totalRequests;
    senderRequestByAddress[msg.sender][_recepient] = totalRequests;
  }

  function getRequestsForAddress(address _recepient) public view returns (PublicKeyRequest[] memory) {
    uint256 recepientTotalRequests = addressTotalRequests[_recepient];
    console.log("recepientTotalRequests", recepientTotalRequests);
    if (recepientTotalRequests == 0) {
      return new PublicKeyRequest[](0);
    }
    PublicKeyRequest[] memory result = new PublicKeyRequest[](recepientTotalRequests);
    
    for (uint256 i = 0; i < recepientTotalRequests; i++) {
      uint256 requestId = userRequestById[_recepient][i+1];
      console.log("requestId", requestId);
      console.log(requests[requestId].stamps);
      result[i] = requests[requestId];
    }

    console.log("length", result.length);
    return result;
  } 

  function getAcceptedPublicKey(address user) public view returns (string memory) {
    string memory key =  publicKeys[user].key;
    return key;
  }

  function getPublicKey(address user) public view returns (string memory){
    string memory key =  publicKeys[user].key;
    return key;
  }

  function acceptPublicKeyRequest(uint256 requestId, string calldata publicKey) public {
    
    require(requestId <= totalRequests, "Request doesn't exist");

    PublicKeyRequest storage request = requests[requestId];

    require(request.to == msg.sender, "This request is not for you");

    require(request.status == PublicKeyRequestStatus.PENDING, "Request has been already accepted or declined");

    if (!publicKeys[msg.sender].isSet) {
      publicKeys[msg.sender] = PublicKey(publicKey, true);
    }

    request.status = PublicKeyRequestStatus.ACCEPTED;

    STAMP(stamp_token_address).unlock(request.from, msg.sender, request.stamps);

  }

  function getOutcomingRequests() public view returns (PublicKeyRequest[] memory) {
    uint256 senderTotalRequestsCount = senderTotalRequests[msg.sender];
    console.log("senderTotalRequestsCount", senderTotalRequestsCount);

    if (senderTotalRequestsCount == 0) {
      return new PublicKeyRequest[](0);
    }

    PublicKeyRequest[] memory result = new PublicKeyRequest[](senderTotalRequestsCount);
    
    for (uint256 i = 0; i < senderTotalRequestsCount; i++) {
      uint256 requestId = senderRequestById[msg.sender][i+1];
      console.log("requestId", requestId);
      console.log(requests[requestId].stamps);
      result[i] = requests[requestId];
    }

    console.log("length", result.length);
    return result;
  }

    function saveLetter(Letter memory _letter) private {
      address to = _letter.to;

      console.log('letter timestamp', _letter.timestamp);

      totalLetters++;
      letters[totalLetters] = _letter;
      incomingTotalLetters[to]++;
      outcomingTotalLetters[msg.sender]++;

      console.log('totalLetters', totalLetters);
      console.log('incomingTotalLetters[to]', incomingTotalLetters[to]);
      console.log('outcomingTotalLetters[msg.sender]', outcomingTotalLetters[msg.sender]);

      uint256 userTotaIncominglLetters = incomingTotalLetters[to];
      uint256 userTotalOtcomingLetters = outcomingTotalLetters[msg.sender];

      incomingLetterById[to][userTotalOtcomingLetters] = totalLetters;
      outcomingLetterById[msg.sender][userTotaIncominglLetters] = totalLetters;


  }

  function sendMail(uint256 chainId, address _recepient, string calldata _message, uint256 _stamps) public {
    // recepient has approved sender request
    uint256 requestId = senderRequestByAddress[msg.sender][_recepient];


    require(requestId != 0, "You have not requested this address yet");
    require(requests[requestId].status == PublicKeyRequestStatus.ACCEPTED, "Recepient has not accepted your request yet");

    // sender has enough stamps to lock
    uint256 sender_stamp_balance = STAMP(stamp_token_address).balanceOf(msg.sender);
    require(sender_stamp_balance >= _stamps, "You have not enough stamps in you wallet, buy more on DEX");

    // lock stamps

    // console.log("lock stamps");

    // save letter

    Letter memory letter = Letter(
      block.timestamp,
      msg.sender,
      _recepient,
      _message,
      _stamps,
      false,
      true
    );

    saveLetter(letter);

    STAMP(stamp_token_address).lock(msg.sender, _recepient, _stamps);

  }

  function outcomingMail() public view returns (Letter[] memory outcomingLetters) {
    uint256  totalOutcomingLetters = outcomingTotalLetters[msg.sender];
    console.log("totalOutcomingLetters", totalOutcomingLetters);

    if (totalOutcomingLetters == 0) {
      return new Letter[](0);
    }

    Letter[] memory result = new Letter[](totalOutcomingLetters);
    
    for (uint256 i = 0; i < totalOutcomingLetters; i++) {
      uint256 letterId = outcomingLetterById[msg.sender][i+1];
      console.log("letterId", letterId);
      console.log(letters[letterId].timestamp);
      result[i] = letters[letterId];
    }

    console.log("length", result.length);
    return result;
  }

  function incomingMail() public view returns (Letter[] memory incomingLetters) {
    uint256  totalIncomingLetters = incomingTotalLetters[msg.sender];
    console.log("totalIncomingLetters", totalIncomingLetters);

    if (totalIncomingLetters == 0) {
      return new Letter[](0);
    }

    Letter[] memory result = new Letter[](totalIncomingLetters);
    
    for (uint256 i = 0; i < totalIncomingLetters; i++) {
      uint256 letterId = incomingLetterById[msg.sender][i+1];
      console.log("letterId", letterId);
      console.log(letters[letterId].timestamp);
      result[i] = letters[letterId];
    }

    console.log("length", result.length);
    return result;
  }

  function getMail(uint256 letterId) public returns (Letter memory letter) {
    letter = letters[letterId];

    console.log(letter.isSet);

    require(letter.isSet, "No letter with this id");
    require(letter.to == msg.sender, "Not your letter");

    STAMP(stamp_token_address).unlock(letter.from, msg.sender, letter.stamps);
  
  }

}
