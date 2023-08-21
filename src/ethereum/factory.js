import web3 from './web3';
import BatuFi from './build/BatuFi.json';

const instance = new web3.eth.Contract(
    BatuFi.abi,
    '0x714211C198B494260164F28b0b56cc50e46F8949'
);

export default instance;