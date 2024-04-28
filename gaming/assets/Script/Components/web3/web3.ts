const { ccclass, property } = cc._decorator;
const Web3 = require("web3/dist/web3.min.js");
const https = require("follow-redirects").https;
const fs = require("fs");
const qs = require("querystring");

import NodeData from "./../../data/NodeData";
import { VerifyABI } from "./VerifyABI";
import {
  infuraUri,
  networkParams,
  VERIFY_CONTRACT_ADDRESS,
  BEARER_TOKEN,
  CIRCUIT_ID,
} from "./config.js";

declare global {
  interface Window {
    ethereum?: any;
    web3?: any;
  }
}

const WinEthereum = window.ethereum;
const WinWeb3 = window.web3;

@ccclass
export default class Web3Class extends cc.Component {
  private web3Provider;
  private switchChainFlag = 0;
  private contractsInitFlag = 0;
  private web3;

  private VerifyContract;
  private _lastProof;

  public currentAccount = null;

  async onLoad() {
    await this.InitWeb3();
  }

  async InitWeb3() {
    let my = this;
    let checkMetaMaskFlag = await this.checkMetaMask();
    if (checkMetaMaskFlag) {
      let switchFlag = await this.switch();
      if (switchFlag) {
        let setWeb3ProviderFlag = await this.setWeb3Provider();
        if (setWeb3ProviderFlag) {
          console.log(this.web3Provider);
          this.web3 = await new Web3(this.web3Provider);

          let accounts = await this.web3.eth.getAccounts();
          console.log(accounts);
          if (accounts.length == 0) {
            return;
          }
          this.currentAccount = accounts[0];
          await this.web3.eth.getBalance(accounts[0], (err, wei) => {
            if (!err) {
              let balance = my.web3.utils.fromWei(wei, "ether");
              console.log("balance:", balance);
              console.log("web3Provider:", my.web3Provider);
              console.log("switchChainFlag:", my.switchChainFlag);
              console.log("web3:", my.web3);
              my.initContracts();
              if (my.node.getComponent("Loading")) {
                my.node.getComponent("Loading").showStart();
              }
              // NodeData.getCanvasNode().getComponent("Loading").showStart();
            }
          });
          WinEthereum.on("accountsChanged", function (accounts) {
            if (accounts.length == 0) {
              return;
            }
            console.log(accounts[0]);
            my.currentAccount = accounts[0];
            my.web3.eth.getBalance(accounts[0], (err, wei) => {
              if (!err) {
                let balance = my.web3.utils.fromWei(wei, "ether");
                console.log("balance:", balance);
              }
            });
          });
        } else {
          console.log("setWeb3Provider error");
        }
      } else {
        console.log("switch chain failed");
      }
    } else {
      console.log("checkMetaMask error");
    }
  }

  initContracts() {
    this.VerifyContract = new this.web3.eth.Contract(
      VerifyABI,
      VERIFY_CONTRACT_ADDRESS
    );
    this.contractsInitFlag = 1;
  }

  async verifyProof(totalAssets, onOk?: Function) {
    if (this._lastProof != null) {
      let hexString = totalAssets.toString(16);
      let publicInputs = "0x" + hexString.padStart(64, "0");
      let resp = await this.VerifyContract.methods
        .verify(this._lastProof, [publicInputs])
        .call();
      if(resp) {
        console.log('publicInputs:',[publicInputs])
        console.log("Verify data successful!")
        onOk != null && onOk();
      } else {
        console.log("Verify data failed!")
      }
    } else {
      onOk != null && onOk();
    }
  }

  async StartGame() {
    // TODO
    cc.director.loadScene("game");
  }

  async ExpandCap() {
    // TODO
    NodeData.getGameDataComponent().expandCapcityByETH();
  }

  async getTopPlayerCall() {
    // TODO
  }

  async totalBlockCall() {
    // TODO
  }

  async getRankData() {
    // TODO
    let data = {
      block: "BLOCK:0",
      address: "ADDRESS:0x00000000000001",
      grade: "Grade:99325525",
    };
    return data;
  }

  async postGrade(grade) {
    // TODO
    NodeData.getGameDataComponent().resetAllData();
    NodeData.getLeavePanelComponent().ClosePanel();
  }

  // create proof using Nori to create proof on Sindri server and get proof from Sindri
  async createProof(proof_input: String, onOK?: Function) {
    const onError = (error) => {
      console.log(error);
    };
    let my = this;
    await this.createProofForCircuit(
      BEARER_TOKEN,
      CIRCUIT_ID,
      proof_input,
      async (res) => {
        console.log("res", res);
        const resp = await my.onListenProofCreate(res["proof_id"], onError);
        console.log("resp", resp);
        if (resp != null) {
          my._lastProof = "0x" + resp["proof"]["proof"];
          console.log(my._lastProof);
        }
        onOK();
      },
      onError
    );
  }

  // listen to the creation of proof and get the response
  async onListenProofCreate(proof_id: String, onError?: Function) {
    let response;
    while (true) {
      this.getSindriProofDetail(
        BEARER_TOKEN,
        proof_id,
        (res) => {
          response = res;
        },
        onError
      );
      if (
        response != null &&
        (response["status"] === "Ready" || response["status"] === "Failed")
      ) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return response;
  }

  // create proof on Sindri
  // note: The game engine does not support NodeJS, so I used this native writing method.
  async createProofForCircuit(
    BEARER_TOKEN: String,
    CIRCUIT_ID: String,
    proof_input: String, // eg. proof_input: '{"X": 52, "Y": 52}'
    onOK?: Function,
    onError?: Function
  ) {
    let options = {
      method: "POST",
      hostname: "sindri.app",
      path: "/api/v1/circuit/" + CIRCUIT_ID + "/prove",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: "Bearer " + BEARER_TOKEN,
      },
      maxRedirects: 20,
    };

    const req = https.request(options, (res) => {
      let chunks = [];

      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", (chunk) => {
        let body = Buffer.concat(chunks);
        onOK(JSON.parse(body.toString()));
      });

      res.on("error", (error) => {
        onError(error);
      });
    });

    let postData = qs.stringify({
      proof_input: proof_input,
    });

    req.write(postData);

    req.end();
  }

  // get proof from Sindri
  // note: The game engine does not support NodeJS, so I used this native writing method.
  async getSindriProofDetail(
    BEARER_TOKEN: String,
    proof_id: String,
    onOK?: Function,
    onError?: Function
  ) {
    let options = {
      method: "GET",
      hostname: "sindri.app",
      path: "/api/v1/proof/" + proof_id + "/detail",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + BEARER_TOKEN,
      },
      maxRedirects: 20,
    };

    const req = https.request(options, (res) => {
      let chunks = [];

      res.on("data", (chunk) => {
        chunks.push(chunk);
      });

      res.on("end", () => {
        let body = Buffer.concat(chunks);
        onOK(JSON.parse(body.toString()));
      });

      res.on("error", (error) => {
        onError(error);
      });
    });

    req.end();
  }

  // metamask

  async checkMetaMask() {
    if (WinEthereum) {
      if (typeof WinEthereum !== "undefined") {
        console.log("MetaMask is installed!");
        return true;
      } else {
        console.log("MetaMask is not installed!");
        return false;
      }
    } else {
      return false;
    }
  }

  async setWeb3Provider() {
    if (WinEthereum) {
      this.web3Provider = WinEthereum;
      try {
        await WinEthereum.enable();
      } catch (error) {
        console.error("User denied account access");
        return false;
      }
    } else if (WinWeb3) {
      this.web3Provider = WinWeb3.currentProvider;
    } else {
      this.web3Provider = new Web3.providers.HttpProvider(infuraUri);
    }
    return true;
  }

  async switch() {
    console.log(WinEthereum.chainId);
    if (WinEthereum.chainId == 0x8274f) {
      return true;
    }
    return await this.switchChain(networkParams);
  }

  async switchChain(data) {
    try {
      let { chainId } = data;
      await WinEthereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      });
      return true;
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      console.log(switchError);
      if (switchError.code === 4902) {
        return await this.addChain(data);
      }
      return false;
      // handle other "switch" errors
    }
  }

  async addChain(data) {
    try {
      await WinEthereum.request({
        method: "wallet_addEthereumChain",
        params: [data],
      });
      return true;
    } catch (addError) {
      console.log(addError);
      return false;
      // handle "add" error
    }
  }
}
