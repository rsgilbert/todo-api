const {SHA256 } = require('crypto-js')
const jwt = require('jsonwebtoken')

//jwt.sign
//jwt.verify

// let message = 'I am number 2'
// let hash = SHA256(message).toString()
// console.log('Message is: ', message)
// console.log(`Hash: ${hash}, length is ${hash.length}`)

// let data = {
//     id: 4
// }

// let token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + "d").toString()
// }

// let resultHash = SHA256(JSON.stringify(token.data) + "d").toString()

// if(resultHash === token.hash) console.log("Data not changed")
// else console.log('data changed')

//jwt
let data = { id: 10 }
let token = jwt.sign(data, '123abc')
// console.log(token)
// console.log(token.length)
let decodedData = jwt.verify(token, '123abc')
console.log(decodedData)