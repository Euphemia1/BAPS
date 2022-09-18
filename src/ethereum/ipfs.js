// import ipfsClient from "ipfs-http-client";
import IPFS from "ipfs-api";

const projectId = "2EFfbDVterU2Sbbp9Auds6mxpGk";
const projectSecret = "c9a3cec809e6b681d58578c485c90360";
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");

// const ipfs = ipfsClient.create({
//     host: 'ipfs.infura.io',
//     port: 5001,
//     protocol: 'https',
//     headers: {
//         authorization: auth
//     }
// })

const ipfs = new IPFS({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

export default ipfs;

// export default ipfs;
