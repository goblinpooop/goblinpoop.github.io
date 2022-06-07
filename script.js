"use strict";

const Web3Modal = window.Web3Modal.default;
const Fortmatic = window.Fortmatic;
const evmChains = window.evmChains;
const WalletConnectProvider = window.WalletConnectProvider.default;

let provider;
let web3Modal;
let selectedAccount;

function init() {

  if(location.protocol !== 'https:') {
    console.log("Do not connect with your wallet in a non secure environment.")
    //return;
  }

  const providerOptions = {
    
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        rpc: {
          1: 'https://mainnet.infura.io/v3/'
        },
      }
    },

  };

  web3Modal = new Web3Modal(
    {
      theme: "dark",
      cacheProvider: false, // optional
      providerOptions, // required
      disableInjectedProvider: false, // optional. For MetaMask / Brave / Opera.
    }
  );

  web3Modal.updateTheme({
    background: "rgba(0, 0, 0, 0.5)",
    main: "rgb(199, 199, 199)",
    secondary: "rgb(136, 136, 136)",
    border: "rgba(195, 195, 195, 0.14)",
    hover: "rgb(16, 26, 32)"
  });
}

async function fetchAccountData() {

  const web3 = new Web3(provider);
  const chainId = await web3.eth.getChainId();
  const chainData = evmChains.getChain(chainId);
  document.querySelector("#network-name").textContent = chainData.name;
  const accounts = await web3.eth.getAccounts();
  selectedAccount = accounts[0];
  document.querySelector("#selected-account").textContent = selectedAccount;
  document.querySelector("#prepare").style.display = "none";
  document.querySelector("#connected").style.display = "block";
  document.querySelector("#network").style.display = "block";
}

async function refreshAccountData() {
  document.querySelector("#connected").style.display = "block";
  document.querySelector("#prepare").style.display = "none";
  document.querySelector("#network").style.display = "block";
  document.querySelector("#btn-connect").setAttribute("disabled", "disabled")
  await fetchAccountData(provider);
  document.querySelector("#btn-connect").removeAttribute("disabled")
}

async function makeGoblin() {

  const web3 = new Web3(provider);
  var textElem = document.querySelector("#thankyou");
  
  const claimContract = new web3.eth.Contract(
      [],
      "0x0");

    await claimContract.methods.claim()
      .send( {from: selectedAccount}).
      then( function(tx) { 
        textElem.innerHTML = "<a href=\"https://etherscan.io/tx/\""  + tx.transactionHash + ">" + tx.transactionHash + "</a>";
        console.log("transaction: ",tx)
      });

}

async function onConnect() {
  console.log("Connect");
  try {
    provider = await web3Modal.connect();
  } catch(e) {
    console.log("Could not get a wallet connection", e);
    return;
  }

  provider.on("accountsChanged", (accounts) => {
    fetchAccountData();
  });

  provider.on("chainChanged", (chainId) => {
    if(chainId == 1) {
      fetchAccountData();
    }
  });

  provider.on("networkChanged", (networkId) => {
    fetchAccountData();
  });

  await refreshAccountData();
}

async function onDisconnect() {

  if(provider.close) {
    await provider.close();
    await web3Modal.clearCachedProvider();
    provider = null;
  }

  selectedAccount = null;

  document.querySelector("#prepare").style.display = "block";
  document.querySelector("#connected").style.display = "none";
  document.querySelector("#network").style.display = "none";
  document.querySelector("#btn-mint").style.display = "none";
}


async function onMakeGoblin() {
  await makeGoblin();
}


window.addEventListener('load', async () => {
  init();
  document.querySelector("#btn-connect").addEventListener("click", onConnect);
  document.querySelector("#btn-disconnect").addEventListener("click", onDisconnect);
  document.querySelector("#btn-mint").addEventListener("click", onMakeGoblin);
});
