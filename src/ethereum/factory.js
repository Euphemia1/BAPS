import web3 from './web3';
import BatuFi from './build/BatuFi.json';

const instance = new web3.eth.Contract(
    BatuFi.abi,
    '0x64d2B39c463307f5913E2BB02D9172f00A8185B5'
);

export default instance;