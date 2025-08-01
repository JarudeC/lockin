// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/EventRSVP.sol";

/**
 * @title Deploy Script for EventRSVP Contract
 * @dev Foundry deployment script for EventRSVP contract
 */
contract DeployEventRSVP is Script {
    EventRSVP public eventRSVP;

    function setUp() public {}

    function run() public {
        // Get deployment configuration from environment variables
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying EventRSVP contract...");
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance);

        // Start broadcasting transactions
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the EventRSVP contract
        eventRSVP = new EventRSVP();

        // Stop broadcasting
        vm.stopBroadcast();

        // Log deployment information
        console.log("EventRSVP deployed to:", address(eventRSVP));
        console.log("Owner:", eventRSVP.owner());
        console.log("Contract deployed successfully!");

        // Save deployment information to a file
        _saveDeploymentInfo();
    }

    /**
     * @dev Deploy to specific network with custom configuration
     */
    function deployToNetwork() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        string memory rpcUrl = vm.envString("RPC_URL");
        uint256 chainId = vm.envUint("CHAIN_ID");
        
        console.log("Deploying to network with Chain ID:", chainId);
        console.log("RPC URL:", rpcUrl);

        vm.createSelectFork(rpcUrl);
        
        address deployer = vm.addr(deployerPrivateKey);
        console.log("Deployer:", deployer);
        console.log("Balance:", deployer.balance);

        require(deployer.balance > 0.01 ether, "Insufficient balance for deployment");

        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy with constructor parameters if needed
        eventRSVP = new EventRSVP();
        
        vm.stopBroadcast();

        console.log("Contract deployed at:", address(eventRSVP));
        
        _verifyDeployment();
    }

    /**
     * @dev Deploy to local Anvil network for testing
     */
    function deployLocal() public {
        console.log("Deploying to local Anvil network...");
        
        // Use default Anvil account
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deployer address:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        eventRSVP = new EventRSVP();
        
        vm.stopBroadcast();
        
        console.log("EventRSVP deployed locally at:", address(eventRSVP));
        
        // Create a test event for demonstration
        _createTestEvent();
    }

    /**
     * @dev Verify the deployment by checking basic contract functions
     */
    function _verifyDeployment() internal view {
        console.log("Verifying deployment...");
        
        // Check if contract is deployed
        require(address(eventRSVP).code.length > 0, "Contract not deployed");
        
        // Check owner
        address owner = eventRSVP.owner();
        console.log("Contract owner:", owner);
        
        // Check event counter
        uint256 eventCount = eventRSVP.getEventCount();
        console.log("Initial event count:", eventCount);
        
        console.log("Deployment verification successful!");
    }

    /**
     * @dev Create a test event for local development
     */
    function _createTestEvent() internal {
        console.log("Creating test event...");
        
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Create a test event (1 day from now)
        uint256 eventTimestamp = block.timestamp + 1 days;
        
        eventRSVP.createEvent(
            "Test Blockchain Meetup",
            "A test event for demonstrating the EventRSVP contract functionality",
            eventTimestamp,
            "Virtual Event",
            50, // max attendees
            0.01 ether // deposit amount
        );
        
        vm.stopBroadcast();
        
        console.log("Test event created successfully!");
        console.log("Event timestamp:", eventTimestamp);
    }

    /**
     * @dev Save deployment information to environment-specific file
     */
    function _saveDeploymentInfo() internal {
        console.log("Saving deployment information...");
        
        string memory deploymentInfo = string(
            abi.encodePacked(
                "EventRSVP Contract Deployment\n",
                "============================\n",
                "Contract Address: ", vm.toString(address(eventRSVP)), "\n",
                "Owner: ", vm.toString(eventRSVP.owner()), "\n",
                "Block Number: ", vm.toString(block.number), "\n",
                "Block Timestamp: ", vm.toString(block.timestamp), "\n",
                "Chain ID: ", vm.toString(block.chainid), "\n"
            )
        );
        
        // Log to console
        console.log(deploymentInfo);
        
        // In a real deployment, you might want to write this to a file
        // vm.writeFile("deployments/latest.txt", deploymentInfo);
    }

    /**
     * @dev Upgrade deployment script for future contract upgrades
     */
    function upgrade() public {
        console.log("Upgrade functionality placeholder");
        console.log("This would be used for proxy-based upgrades in the future");
        
        // Placeholder for upgrade logic
        // Would involve proxy contracts for upgradeability
    }

    /**
     * @dev Post-deployment setup (add organizers, configure settings)
     */
    function postDeploymentSetup() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address contractAddress = vm.envAddress("CONTRACT_ADDRESS");
        
        console.log("Running post-deployment setup...");
        console.log("Contract address:", contractAddress);
        
        EventRSVP deployedContract = EventRSVP(payable(contractAddress));
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Add additional organizers if specified
        try vm.envAddress("ADDITIONAL_ORGANIZER") returns (address additionalOrganizer) {
            console.log("Adding organizer:", additionalOrganizer);
            deployedContract.addOrganizer(additionalOrganizer);
        } catch {
            console.log("No additional organizer specified");
        }
        
        vm.stopBroadcast();
        
        console.log("Post-deployment setup completed!");
    }
}