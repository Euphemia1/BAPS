// import ipfsClient from "ipfs-http-client";
import IPFS from "ipfs-api";

const projectId = "2UIZMWmPzQ6AiKfmzePxDfGM0U8";
const projectSecret = "78f5e328c7bb8aed7ab4ffface404949";
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
