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
      url: 'http://localhost:3000/api/tests/nonce',
      data: {
        walletAddress: data.address
      }
    });

    const nonce = nonce_res.data.data;

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    console.log(JSON.stringify(nonce))
    const sign = await Web3Token.sign(async msg => await signer.signMessage(msg), {
      statement: `AxelarNetwork`,
      expire_in: '1 days',
      nonce: nonce,
    });

    const res = await axios({
      method: "post",
      url: 'http://localhost:3000/api/tests/signature',
      data: {
        walletAddress: data.address,
        signature: sign
      }
    });

    console.log(res.data.data)
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
        </Card.Body>
      </Card>
    </div>
  );
}
  
export default App;