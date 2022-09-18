import web3 from './web3'
import Batu from './build/Batu.json'

export default (address) => {
    return new web3.eth.Contract(
        Batu.abi,
        address
    )
}