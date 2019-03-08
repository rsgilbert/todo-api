const { ObjectId } = require('mongodb')
const { Todo } = require('./../../models/todo')
const { User } = require('./../../models/users')
const jwt = require('jsonwebtoken')


let todos = [{
    _id: new ObjectId(),
    text: "First todo"
}, {
    _id: new ObjectId(),
    text: "Mondo",
    completed: true,
    completedAt: 32343523
}]


const user_0_id = new ObjectId()
const user_1_id = new ObjectId()
let users = [{ 
    _id: user_0_id,
    email: "mike@mail.com",
    password: "kkk",
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: user_0_id, access: 'auth'}, 'abc').toString()
    }]}, {
        _id: user_1_id,
        email: "bull@cattle.com",
        password: 'ggg',
        tokens: [{
            access: 'auth',
            token: jwt.sign({ _id: user_1_id, access: 'auth' }, 'abc').toString()
        }] },
    { 
        _id: new ObjectId(),
        email: "cat@pets.org",
        password:'ddd',
    }]



const populateTodos = (done) => {
    Todo.deleteMany().then(() => Todo.insertMany(todos))
        .then(() => done())
}
const populateUsers = (done) => {
    User.deleteMany().then(() => {
        let userOne = new User(users[0]).save()
        let userTwo = new User(users[1]).save()
        let userThree = new User(users[2]).save()
        return Promise.all([userOne, userTwo, userThree])
    }).then(()=> done()).catch((e) => done(e))
}

module.exports = { users, todos, populateTodos, populateUsers }
