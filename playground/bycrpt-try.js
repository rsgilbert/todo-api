const bcrypt = require('bcryptjs')

let pass = 'doughnut'

bcrypt.genSalt(5, (err, salt) => { //2 is the number of rounds
    bcrypt.hash(pass, salt, (err, hash) => {
        console.log(`Salt is: ${salt}\n password is ${pass}\n hashedPassword is ${hash}`)
    })
})

let hash_pass1 = '$2a$14$NUFZHv56VVitwyYEfLfLRux9856/som.QTpK06BeD4PA2qOX8jH6y'
let hash_pass2 = '$2a$15$XMzPplAw5EdHNLsJoqRan.9mz5o8ULpa3NUOEPhlb0.aLbGhBJRUa'

bcrypt.compare(pass, hash_pass1, (err, res) => console.log(res))
bcrypt.compare(pass, hash_pass2, (err, res) => console.log(res))