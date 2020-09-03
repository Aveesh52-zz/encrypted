import React, { Component } from 'react';
import './App.css';
import Portis from '@portis/web3';
import Web3 from 'web3'
import Consortium from '../abis/consoritum.json';
import Policy2 from '../abis/policy2.json';

//import SimpleCrypto from "simple-crypto-js"

var AES = require("crypto-js/aes");
var CryptoJS = require("crypto-js");
const bs58 = require('bs58')

const NodeRSA = require('node-rsa');
const key = new NodeRSA({b: 512});

/*
 *  ---> Overview of the whole process 
 *  Assume data is created by the government and stored on the blockchain
 *    string encryptedData (encrypted using public key of the owner)
 *    string ownerAddress
 *    string hashOfPlainData
 *
 *  --> Owner has to send the data to the receiver :
 *  1) Get encrypted data from blockchain
 *  2) Decrypt using his own private key
 *  3) Sign the plain text using the signature function below using his private key
 *  4) Encrypt the plain text using the receiver's public key
 *  5) Send - his own public key, the signature as well as the encrypted data to the receiver
 *
 *  --> On the receiver side :
 *  1) Receive the sender's public key, encrypted data and signature from sender (say from firebase)
 *  2) Decrypt the data using his own private key
 *  3) Get the hash of the plain text data stored on the blockchain
 *  4) Hash the decrypted data using the sha256 library and compare for equality.
 *  5) Break if they do not match, else continue
 *  6) Recover the address from the signature using the public key of the sender using the function below
 *  7) Check if it's the same address as the one he asked for.
 *  8) If it's the same, data is authentic, else its manipulated in some way.
 *
 *  --------> I don't even know why do we even need to sign the data since only the legit owner can decrypt and reencrypt the
 *  data so that the hashes match - :| , but it's there anyways.
 *
 */

var encrypted;
var decrypted;
var account;
var tokenid;


class App extends Component {


  constructor(props) {
    super(props)
    this.state = {
      account: '',
      account1:'',
      portis:'',
      web3:{},
      consortium:{},
      encrypt:'',
      decrypted:'',
      policy2:{}
    };
  
    this.call = this.call.bind(this);
    this.matic = this.matic.bind(this);
    this.approve = this.approve.bind(this);
    this.disapprove = this.disapprove.bind(this);
    this.logout = this.logout.bind(this);
    this.getencrypt = this.getencrypt.bind(this);
    this.public = this.public.bind(this);
    this.createpolicy = this.createpolicy.bind(this);
  }

  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }
  
  async loadBlockchainData() {
  // INIT

  }

  
  async loadWeb3() {

   
    const  goerli = {
      nodeUrl: 'https://rpc.goerli.mudit.blog/', 
      chainId: 5
    };
    const portis = new Portis('a16b70b3-8f7c-49cc-b33f-98db6607f425', goerli);

    await this.setState({
      portis: portis
    })
    console.log(this.state.portis);

  
    const web3 = new Web3(portis.provider);
    await this.setState({ 
        web3: web3 })
    console.log(this.state.web3);
    let acc = await web3.eth.getAccounts(); 
    await this.setState({
      account: acc[0]
    })

 

    console.log(this.state.account);
    const consortium = new web3.eth.Contract(Consortium,"0x58fB8724837c3797AfF1C6C760A90f06f8492420")
    await this.setState({ consortium })
    console.log(this.state.consortium);



    const policy2 = new web3.eth.Contract(Policy2,"0xEA1785cffeac2e7bE9f1818eEAfEf5aC2b281df3")
    await this.setState({ policy2 })
    console.log(this.state.policy2);
  //  var approvals = this.state.consoritum.methods.approvals(this.state.account).call({from: this.state.account});

  }

  async logout(){
    this.state.portis.logout();
  }

  async login(){
    const goerli = {
      nodeUrl: 'https://rpc.goerli.mudit.blog/', 
      chainId: 5
    };
    const portis = new Portis('a16b70b3-8f7c-49cc-b33f-98db6607f425', goerli);
    await this.setState({
      portis: portis
    })
    console.log(this.state.portis);
    const web3 = new Web3(portis.provider);
    await this.setState({ 
        web3: web3 })
    console.log(this.state.web3);
    let acc = await web3.eth.getAccounts(); 
    await this.setState({
      account1: acc[0]
    })

  }

async matic(){
 
  const myPrivateEthereumNode = { 
    nodeUrl: 'https://rpc-mumbai.matic.today',
    chainId: 80001,
  };
  const portis = new Portis('a16b70b3-8f7c-49cc-b33f-98db6607f425', myPrivateEthereumNode);
  await this.setState({
    portis: portis
  })
  console.log(this.state.portis);
  const web3 = new Web3(portis.provider);
  await this.setState({ 
      web3: web3 })
  console.log(this.state.web3);
  let acc = await web3.eth.getAccounts();
  await this.setState({
    account: acc[0]
  })

  }
   // console.log(this.state.message);

    // const signedMessage = await web3.currentProvider.send("eth_signTypedData", [
    //   this.state.message,
    //   accounts[0]
    // ]);
 
    // console.log(signedMessage);
 
    // const recovered = EthSigUtil.recoverTypedSignatureLegacy({
    //   data: this.state.message,
    //   sig: signedMessage
    // });

    // console.log(recovered):


    async public(){
      (async () => {
        const ethxpub = await this.state.portis.getExtendedPublicKey(
          "m/44'/60'/0'/0/0",
          "Ethereum"
        );  
        console.log("ethxpub", ethxpub);
        var address = ethxpub.result;
        const bytes = bs58.decode(address);
        console.log(bytes.toString('hex').slice(90,156))
      })();

      const text = "{'tokenid': '12345','dob': '30-02-1999','aadhar': 'verified','pancard': 'verified'}"
      encrypted = key.encrypt(text, 'base64');
      console.log('encrypted: ', encrypted);
      decrypted = key.decrypt(encrypted, 'utf8'); 
      console.log('decrypted: ', decrypted);
    }

    async call(){

      // var myString   = "blablabla Card game bla";
      // var myPassword = "myPassword";
      
      // // PROCESS
      // var encrypted = CryptoJS.AES.encrypt(myString, myPassword);
      // console.log(encrypted);
     

    console.log(this.state.consortium);
    var og = "Hello"
    var chiperText = "asjsbaduqjs"
    await this.state.consortium.methods.setencrypted(encrypted)
    .send({from: this.state.account})
    .on('transactionHash', (hash) => {
      console.log(hash);     
    })
      // var decrypted = CryptoJS.AES.decrypt(encrypted, myPassword);
      // console.log(decrypted);


      // var decrypted1 = decrypted.toString(CryptoJS.enc.Utf8);
      // console.log(decrypted1);
      // this.setState({decrypted1})
    //  var Getecryptedevent = await this.state.consortium.Getecrypted();
    //   Getecryptedevent.watch(function (err, result) {
    //     if (err) {
    //       console.log(err);
    //     } 
    //     console.log("Counter " + result.args.encrypted_data + " was incremented by address: ");
        
    //   }); 
    }
  
async getencrypt(){
  let encryptedd = await this.state.consortium.methods.getencrypted()
  .call({from: this.state.account});
  this.setState({encrypt:encryptedd});
  console.log(encryptedd);
  this.setState({decrypted:decrypted});
localStorage.setItem("account",this.state.account);
localStorage.setItem("policydata",this.state.decrypted);
}

//  if(approvals){
   
//    this.state.web3.eth.sendTransaction(
//      {from:this.state.web3.eth.accounts[0],
//      to:"#",  
//      value:"1000000000000000000", 
//      data: this.state.decipherText  
//          }, function(err, transactionHash) {
//    if (!err)
//      console.log(transactionHash + "success"); 
//  });
 
// }


async approve(){

   account = localStorage.getItem("account");
  var policydata = localStorage.getItem("policydata");
  var policydata = JSON.stringify(policydata);
  var policydata = JSON.parse(policydata);
  console.log(policydata[0]); 
  var pos = policydata.indexOf("dob");
  //tokenid = parseInt(policydata.tokenid);
  tokenid = parseInt(policydata.slice(pos-8,pos-3));
  console.log(tokenid);

  await this.loadWeb3();  
 await setTimeout(function(){ alert("Hello"); }, 30000);
  console.log(this.state.account);
  await this.state.consortium.methods.approve(account)
  .send({from: this.state.account, gas:500000, gasPrice:10000000000})
  .on('transactionHash', (hash) => {
    console.log(hash);
  })



  
  
}
async disapprove(){
  this.state.consortium.methods.disapprove(this.state.account)
  .send({from: this.state.account1, gas:500000, gasPrice:10000000000})
  .on('transactionHash', (hash) => {
    console.log(hash);
  })
}

async createpolicy(){
  let approved = await this.state.consortium.methods.approvals(account)
  .call({from: this.state.account});
  console.log(approved);
  if(approved){
   console.log(tokenid);
   console.log(account);
    this.state.policy2.methods.createPolicy(
      "asas", "smartlife" ,account,tokenid)
    .send({from:account, gas:500000, gasPrice:10000000000})
    .then ((receipt) => {
      console.log(receipt);
      localStorage.setItem('hash',receipt.transactionHash);

    })
    
  } 
}

render() {
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            target="_blank"
            rel="noopener noreferrer"
          >
          
          </a>
        </nav>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                
                <h1>Hey</h1>
                <button onClick={this.call}>Encrypt</button>
                <button onClick={this.getencrypt}>getencrypt</button>
                <button onClick={this.approve}>approve</button>
                <button onClick={this.public}>Public</button>
                <button onClick={this.disapprove}>disapprove</button>
                <button onClick={this.logout}>logout</button>
                <button onClick={this.createpolicy}>createpolicy</button>
                <h5>{this.state.encrypt}</h5>
                <h5>{this.state.decrypted}</h5>

            <a href={`https://mumbai-explorer.matic.today/tx/${localStorage.getItem('hash')}/token_transfers`} target="_blank">Hash</a><br></br>
              
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  } 
 
} 

export default App;
