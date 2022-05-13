const { expect } = require("chai");
const { ethers } = require("hardhat");
const { BigNumber } = require("ethers");

let stamp_contract;
let stampost_contract;
let accounts;

before(async () => {
  const STAMP = await ethers.getContractFactory("STAMP");
  const stamp = await STAMP.deploy(BigNumber.from("100000000000000000000"));
  stamp_contract = await stamp.deployed();

  const STAMPOST = await ethers.getContractFactory("Stampost");
  const stampost = await STAMPOST.deploy();
  stampost_contract = await stampost.deployed();

  await stampost_contract.setStampToken(stamp_contract.address);
  await stamp_contract.setStampost(stampost_contract.address);

  accounts = await ethers.getSigners();
});

describe("MAIN TEST", () => {
  describe("STAMP", () => {
    it("Owner has initial balance", async () => {
      const initialBalance = await stamp_contract.balanceOf(
        accounts[0].address
      );
      expect(initialBalance).to.equal("100000000000000000000");
    });
  });

  describe("STAMPOST", () => {
    it("Should set stamp token correct", async () => {
      const stampAddress = await stampost_contract.getStampTokenAddress();
      expect(stampAddress).to.be.equal(stamp_contract.address);
    });

    it("Revert if attached stamps is below the minimal fee", async () => {
      const pubKey = "testPublicKey";
      const tx = stampost_contract.requestPublicKey(
        1337,
        accounts[1].address,
        BigNumber.from("2000000000000000000"),
        pubKey
      );
      await expect(tx).to.be.revertedWith(
        "Attached stamps count is not enough"
      );
    });
  });

  describe("Key request", () => {
    it("Revert if sender doesn't have enough STAMPS", async () => {
      const pubKey = "testPublicKey";
      const tx = stampost_contract
        .connect(accounts[1])
        .requestPublicKey(
          1337,
          accounts[1].address,
          BigNumber.from("3000000000000000000"),
          pubKey
        );
      await expect(tx).to.be.revertedWith(
        "You have not enough stamps in you wallet, buy more on DEX"
      );
    });

    it("Revert if sender requests himself", async () => {
      const pubKey = "testPublicKey";
      const tx = stampost_contract.requestPublicKey(
        1337,
        accounts[0].address,
        BigNumber.from("3000000000000000000"),
        pubKey
      );
      await expect(tx).to.be.revertedWith(
        "You can not send request to youself"
      );
    });

    it("Get empty array of no requests", async () => {
      const requests = await stampost_contract.getRequestsForAddress(
        accounts[1].address
      );
      expect(requests).to.be.an("array");
      expect(requests.length).to.be.equals(0);
    });

    it("Valid request saved", async () => {
      const pubKey = "testPublicKey";
      const tx = await stampost_contract.requestPublicKey(
        1337,
        accounts[1].address,
        BigNumber.from("3000000000000000000"),
        pubKey
      );

      await tx.wait();

      const publicKey = await stampost_contract.getPublicKey(
        accounts[0].address
      );

      expect(publicKey).to.be.equal(pubKey);
    });

    it("Can not send existing request", async () => {
      const pubKey = "testPublicKey";
      const tx2 = stampost_contract.requestPublicKey(
        1337,
        accounts[1].address,
        BigNumber.from("3000000000000000000"),
        pubKey
      );

      await expect(tx2).to.be.revertedWith(
        "You have already requested this address"
      );
    });

    it("Get array of 2 requests", async () => {
      await stamp_contract.transfer(
        accounts[2].address,
        BigNumber.from("3000000000000000000")
      );

      const pubKey = "testPublicKey";

      const tx2 = await stampost_contract
        .connect(accounts[2])
        .requestPublicKey(
          1337,
          accounts[1].address,
          BigNumber.from("3000000000000000000"),
          pubKey
        );

      await tx2.wait();

      const requests = await stampost_contract.getRequestsForAddress(
        accounts[1].address
      );
      expect(requests).to.be.an("array");
      expect(requests.length).to.be.equals(2);
    });
  });

  describe("Accept request", () => {
    it("Revert if request doesn't exist", async () => {
      const pubKey = "recepientPubKey";
      const tx = stampost_contract.acceptPublicKeyRequest(3, pubKey);
      await expect(tx).to.be.revertedWith("Request doesn't exist");
    });

    it("Revert if accepting user is not recepient", async () => {
      const pubKey = "recepientPubKey";
      const tx = stampost_contract.acceptPublicKeyRequest(1, pubKey);
      await expect(tx).to.be.revertedWith("This request is not for you");
    });

    it("Accept request success path", async () => {
      const pubKey = "recepientPubKey";
      const tx = await stampost_contract
        .connect(accounts[1])
        .acceptPublicKeyRequest(1, pubKey);

      const publicKey = await stampost_contract.getPublicKey(
        accounts[1].address
      );

      expect(publicKey).to.be.equal(pubKey);

      const requests = await stampost_contract.getRequestsForAddress(
        accounts[1].address
      );

      expect(requests[0].status).to.be.equal(1);
    });

    it("Revert if already accepted", async () => {
      const pubKey = "recepientPubKey";
      const tx = stampost_contract
        .connect(accounts[1])
        .acceptPublicKeyRequest(1, pubKey);
      await expect(tx).to.be.revertedWith(
        "Request has been already accepted or declined"
      );
    });
  });

  describe("getAcceptedPublicKey", () => {
    it("Returns stored public key", async () => {
      const pubKey = await stampost_contract.getAcceptedPublicKey(
        accounts[0].address
      );
      expect(pubKey).to.be.equal("testPublicKey");
    });
  });

  describe("list outcoming requests", () => {
    it("returns 1 outcoming request of user", async () => {
      const requests = await stampost_contract.getOutcomingRequests();
      expect(requests.length).to.be.equal(1);
    });

    it("returns 2 outcoming requests of user", async () => {
      const pubKey = "testPublicKey";
      await stampost_contract.requestPublicKey(
        1337,
        accounts[2].address,
        BigNumber.from("3000000000000000000"),
        pubKey
      );

      const requests = await stampost_contract.getOutcomingRequests();
      expect(requests.length).to.be.equal(2);
    });
  });

  describe("Send Mail", () => {
    it("Revert if sender has not requested recepient yet", async () => {
      const tx = stampost_contract.sendMail(
        1337,
        accounts[3].address,
        "test",
        BigNumber.from("3000000000000000000")
      );

      await expect(tx).to.be.revertedWith(
        "You have not requested this address yet"
      );
    });

    it("Revert if recepient has not accepted sender yet", async () => {
      const tx = stampost_contract.sendMail(
        1337,
        accounts[2].address,
        "test",
        BigNumber.from("3000000000000000000")
      );

      await expect(tx).to.be.revertedWith(
        "Recepient has not accepted your request yet"
      );
    });

    it("Revert if not enough stamps on sender balance", async () => {
      const tx = stampost_contract.sendMail(
        1337,
        accounts[1].address,
        "test",
        BigNumber.from("300000000000000000000")
      );

      await expect(tx).to.be.revertedWith(
        "You have not enough stamps in you wallet, buy more on DEX"
      );
    });

    it("Send letter success path", async () => {
      await stampost_contract.sendMail(
        1337,
        accounts[1].address,
        "test",
        BigNumber.from("3000000000000000000")
      );
    });
  });

  describe("Mail Boxes", () => {
    describe("Incoming", () => {
      it("Should return zero array if no outcoming letters", async () => {
        const outcoming = await stampost_contract
          .connect(accounts[4])
          .outcomingMail();

        expect(outcoming.length).to.be.equal(0);
      });

      it("Should return outcoming letters by address", async () => {
        const outcoming = await stampost_contract.outcomingMail();
        expect(outcoming.length).to.be.equal(1);

        await stampost_contract.sendMail(
          1337,
          accounts[1].address,
          "test1",
          BigNumber.from("3000000000000000000")
        );

        const outcoming2 = await stampost_contract.outcomingMail();
        expect(outcoming2.length).to.be.equal(2);
      });
    });
    describe("Outcoming", () => {
      it("Should return zero array if no incoming letters", async () => {
        const incoming = await stampost_contract
          .connect(accounts[4])
          .incomingMail();

        expect(incoming.length).to.be.equal(0);
      });

      it("Should return incoming letters by address", async () => {
        const incoming = await stampost_contract
          .connect(accounts[1])
          .incomingMail();

        console.log({ incoming });
        expect(incoming.length).to.be.equal(2);

        await stampost_contract.sendMail(
          1337,
          accounts[1].address,
          "test1",
          BigNumber.from("3000000000000000000")
        );

        const incoming2 = await stampost_contract
          .connect(accounts[1])
          .incomingMail();
        expect(incoming2.length).to.be.equal(3);
      });
    });
  });
});
