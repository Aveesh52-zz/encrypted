pragma solidity ^0.6.0;

contract consoritum {
  
 
   string public encrypted_data;

   mapping(address => bool) public approvals;

  
  
  modifier onlyVendor2() {
    require(msg.sender == 0x0C3388508dB0CA289B49B45422E56479bCD5ddf9);
    _;
  }

  function setencrypted(string memory _encrypted_data) public {
    encrypted_data = _encrypted_data;

  }
  
  function getencrypted() view public returns(string memory) {
      return encrypted_data;
  }
  
   


  function approve(address user) public returns (bool){
    approvals[user] = true;
  }

   function disapprove(address user) public returns (bool){
    approvals[user] = false;
  }

}