const contractAddress = "0xB91F8D7814C965F1d36aE0583a2D97dEF3191829"; // Replace with your deployed contract address
const abi = [
    // Minimal ABI for ERC-20 Transfer and balanceOf
    "function balanceOf(address owner) view returns (uint256)",
    "function transfer(address to, uint256 amount) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)"
];

let provider, signer, contract;

// Add the following lines to verify ethers and WalletConnectProvider are loaded
console.log("Ethers.js loaded:", window.ethers);
console.log("WalletConnectProvider loaded:", window.WalletConnectProvider);

// Function to initialize connection only if ethers and WalletConnectProvider are available
async function connectWallet() {
    if (!window.ethereum) { // Check if MetaMask is installed
        console.error("MetaMask is not installed.");
        alert("MetaMask is not installed. Please install MetaMask and try again.");
        return;
    }

    try {
        // Request account access
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        const account = await signer.getAddress();
        contract = new ethers.Contract(contractAddress, abi, signer);

        console.log(`Connected account: ${account}`);

        // Message to be signed for authentication
        const message = "Authenticate with Manifestation Token Transfer DApp";

        // Prompt user to sign the message
        const signature = await signer.signMessage(message);

        console.log(`Signature received: ${signature}`);

        // Verify the signature to ensure authenticity
        const recoveredAddress = ethers.utils.verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() === account.toLowerCase()) {
            // Signature is valid
            console.log("Signature verification successful.");
            updateBalance();
            listenForTransfers();
            alert("Wallet connected and authenticated successfully!");
            displayVerificationStatus(true, account);
        } else {
            // Signature verification failed
            console.error("Signature verification failed.");
            alert("Authentication failed. Please try again.");
            displayVerificationStatus(false, account);
        }

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length === 0) {
                resetApp();
                alert("Please connect to MetaMask.");
            } else {
                connectWallet();
            }
        });

        // Listen for chain changes
        window.ethereum.on('chainChanged', (chainId) => {
            window.location.reload();
        });

    } catch (error) {
        console.error("Connection or authentication failed:", error.message);
        alert(`Failed to connect or authenticate: ${error.message}`);
    }
}

// Function to get query parameters
function getQueryParams() {
    const params = {};
    window.location.search.substring(1).split("&").forEach(param => {
        const [key, value] = param.split("=");
        if (key) params[key] = decodeURIComponent(value);
    });
    return params;
}

// Function to display verified account and verification status from URL (if any)
function displayVerifiedAccount() {
    const params = getQueryParams();
    if (params.authenticated === "true" && params.account) {
        const verifiedAccount = document.getElementById("verifiedAccount");
        verifiedAccount.textContent = `Authenticated account: ${params.account}`;
    }
    if (params.verified === "true") {
        const verificationStatus = document.getElementById("verificationStatus");
        verificationStatus.textContent = "Account verification: Successful";
    } else if (params.verified === "false") {
        const verificationStatus = document.getElementById("verificationStatus");
        verificationStatus.textContent = "Account verification: Failed";
    }
}

// Function to display verification status without relying on URL parameters
function displayVerificationStatus(isVerified, account) {
    const verifiedAccount = document.getElementById("verifiedAccount");
    const verificationStatus = document.getElementById("verificationStatus");
    if (isVerified) {
        verifiedAccount.textContent = `Authenticated account: ${account}`;
        verificationStatus.textContent = "Account verification: Successful";
    } else {
        verifiedAccount.textContent = `Authenticated account: ${account}`;
        verificationStatus.textContent = "Account verification: Failed";
    }
}

// Function to reset the app on disconnect
function resetApp() {
    document.getElementById("verifiedAccount").textContent = "";
    document.getElementById("verificationStatus").textContent = "";
    document.getElementById("balance").textContent = "0";
    document.getElementById("transferLogs").innerHTML = "";
    alert("Wallet disconnected.");
}

// Call the function on page load
window.onload = displayVerifiedAccount;

async function updateBalance() {
    try {
        const address = await signer.getAddress();
        const balance = await contract.balanceOf(address);
        document.getElementById("balance").textContent = window.ethers.utils.formatUnits(balance, 18);
    } catch (error) {
        
    }
}

async function transferTokens(event) {
    event.preventDefault();
    const recipient = document.getElementById("recipient").value;
    const amount = document.getElementById("amount").value;

    // Input Validation
    if (!window.ethers.utils.isAddress(recipient)) { // Changed to window.ethers.utils
        alert("Invalid recipient address.");
        return;
    }
    if (amount <= 0) {
        alert("Amount must be greater than zero.");
        return;
    }

    try {
        const tx = await contract.transfer(recipient, window.ethers.utils.parseUnits(amount, 18)); // Changed to window.ethers.utils
        console.log("Transaction sent: ", tx.hash); // Added logging
        await tx.wait();
        console.log("Transaction confirmed: ", tx.hash); // Added logging
        alert("Transfer Successful");
        updateBalance();
    } catch (error) {
        console.error("Transfer failed: ", error);
        alert("Transfer failed. Please ensure you have sufficient balance and try again.");
    }
}

function listenForTransfers() {
    contract.on("Transfer", (from, to, value) => {
        const log = document.createElement("li");
        log.classList.add("list-group-item", "d-flex", "justify-content-between", "align-items-center");
        log.innerHTML = `
            <span><strong>From:</strong> ${from}</span>
            <span><strong>To:</strong> ${to}</span>
            <span><strong>Amount:</strong> ${window.ethers.utils.formatUnits(value, 18)} MNF</span> // Changed to window.ethers.utils
        `;
        document.getElementById("transferLogs").prepend(log); // Add to the top
    });
}

// Optional: Add smooth scrolling for better UX
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add the following lines to attach the connectWallet function to the Connect Wallet button
document.getElementById("connectWallet").addEventListener("click", connectWallet);