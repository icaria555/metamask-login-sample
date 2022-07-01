// Importing modules
import React, { useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import { Button, Card } from "react-bootstrap";
import axios from "axios";
import Web3Token from 'web3-token';

function App() {
  
  // usetstate for storing and retrieving wallet details
  const [data, setdata] = useState({
    address: "",
    Balance: null,
    SignVisible: false
  });

  const [res, setRes] = useState();
  
  // Button handler button for handling a
  // request event for metamask
  const btnhandler = () => {
  
    // Asking if metamask is already present or not
    if (window.ethereum) {
  
      // res[0] for fetching a first wallet
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((res) => accountChangeHandler(res[0]));
    } else {
      alert("install metamask extension!!");
    }
  };
  
  // getbalance function for getting a balance in
  // a right format with help of ethers
  const getbalance = (address) => {
  
    // Requesting balance method
    window.ethereum
      .request({ 
        method: "eth_getBalance", 
        params: [address, "latest"] 
      })
      .then((balance) => {
        // Setting balance
        data.address = address;
        data.Balance = ethers.utils.formatEther(balance)
        data.SignVisible = true;
        setdata(data);
      });
  };
  
  // Function for getting handling all events
  const accountChangeHandler = (account) => {
    // Setting an address data
    setdata({
      address: account,
    });
  
    // Setting a balance
    getbalance(account);
  };

  const signMsg = async () => {
    const nonce_res = await axios({
      method: "post",
      url: 'http://localhost:3002/api/auth/nonce',
      data: {
        walletAddress: data.address,
        addressType: "EVM"
      }
    });

    const nonce = nonce_res.data.data.data;
    console.log(nonce);

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const sign = await Web3Token.sign(async msg => await signer.signMessage(msg), {
      statement: `AxelarNetwork`,
      nonce: nonce,
    });

    const res = await axios({
      method: "post",
      url: 'http://localhost:3002/api/auth/sign',
      data: {
        walletAddress: data.address,
        signature: sign,
        addressType: 'EVM'
      }
    });

    setRes(res.data.data.accessToken);

    alert('attemp signing with recieved access token:' + res.data.data.accessToken);

    const res2 = await axios({
      method: "get",
      url: `http://localhost:3002/api/auth/verify?token=${res.data.data.accessToken}`,
      maxRedirects: 0
    });

    alert('attemp verify the recieved access token:' + res2.data.data);

    console.log('result')
    console.log(res2)
  }
  
  return (
    <div className="App">
      <Card className="text-center">
        <Card.Header>
          <strong>Address: </strong>
          {data.address}
        </Card.Header>
        <Card.Body>
          <Card.Text>
            <strong>Balance: </strong>
            {data.Balance}
          </Card.Text>
          <Button onClick={btnhandler} variant="primary" className="m-4"> 
            Connect to wallet
          </Button>
          <br/>
          {data.SignVisible ? <Button onClick={signMsg}>sign</Button> : ''}
          <br/>
          You Received: {res}
        </Card.Body>
      </Card>
    </div>
  );
}
  
export default App;