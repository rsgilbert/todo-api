//library imports
const express = require('express')
const bodyParser = require('body-parser')
const { ObjectId } = require('mongodb')
//local imports
let { mongoose } = require('./db/mongoose')
let { Todo } = require('./models/todo')
let { User } = require('./models/users')

let port = process.env.PORT || 3000

let app = express()
app.use(bodyParser.json())
app.post('/todos', (req, res) => {
    let todo = new Todo({
        text: req.body.text
    })
    todo.save().then((doc)=>res.send(doc),
        (e)=>res.status(400).send(e)
    )
    console.log(req.body)
})
app.post('/users', (req, res) => {
    let user = new User({
        email: req.body.email
    })
    user.save().then((doc) => res.send(doc),
        (e) => res.status(400).send(e)
    )
})
//get
app.get('/todos', (req, res) =>{
    Todo.find().then((todos) => {
        res.send({todos})
    }, (e) => {
        res.status(400).send(e)
    })
})
app.get('/users', (req, res) =>{
    User.find().then((users)=>{
        res.send({users, count: users.length})
    }, (e)=> res.status(400).send(e))
})
app.get('/todos/:id', (req, res) => {
    const id = req.params.id
    if(!ObjectId.isValid(id)) return res.status(400).send() 
    Todo.findById({ _id: id }).then((todo) => {
        todo ? res.send(todo) : res.status(404).send()
    }).catch((e) => res.status(400).send())
})

app.listen(port, ()=> console.log(`Started on port ${port}`))
module.exports = { app }

//400 Bad Request - bad syntax
//404 Not Found - request resource not found
