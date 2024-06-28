// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract USDT is ERC20 {    
    constructor() ERC20("USDT", "USDT") {}

    function give(uint256 amount) public  {
      _mint(msg.sender, amount * 10**uint(decimals()));
    }
}