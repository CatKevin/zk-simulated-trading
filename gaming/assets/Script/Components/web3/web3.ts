const { ccclass, property } = cc._decorator;
const Web3 = require("web3/dist/web3.min.js");
const https = require("follow-redirects").https;
const fs = require("fs");
const qs = require("querystring");

import NodeData from "./../../data/NodeData";

const bearer_token = "sindri_api_token";
const circuit_id = "your circuit id";
const proof_input = 'your proof input';

@ccclass
export default class Web3Class extends cc.Component {
  public currentAccount = null;

  async onLoad() {
    await this.InitWeb3();
  }

  async InitWeb3() {
    // TODO
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
  async createProof() {
    const onError = (error) => {
      console.log(error);
    };
    let my = this;
    await this.createProofForCircuit(
      bearer_token,
      circuit_id,
      proof_input,
      async (res) => {
        console.log('res', res);
        const resp = await my.onListenProofCreate(res['proof_id'], onError)
        console.log('resp', resp)
      },
      onError
    );
  }

  // listen to the creation of proof and get the response
  async onListenProofCreate(proof_id: String, onError?: Function) {
    let response;
    while (true) {
      this.getSindriProofDetail(
        bearer_token,
        proof_id,
        (res) => {
          response = res;
        },
        onError
      );
      if ( response != null && (response['status'] === "Ready" || response['status'] === "Failed")) {
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
    return response;
  
  }

  // create proof on Sindri
  // note: The game engine does not support NodeJS, so I used this native writing method.
  async createProofForCircuit(
    bearer_token: String,
    circuit_id: String,
    proof_input: String, // eg. proof_input: '{"X": 52, "Y": 52}'
    onOK?: Function,
    onError?: Function
  ) {
    let options = {
      method: "POST",
      hostname: "sindri.app",
      path: "/api/v1/circuit/" + circuit_id + "/prove",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: "Bearer " + bearer_token,
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
    bearer_token: String,
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
        Authorization: "Bearer " + bearer_token,
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
}
