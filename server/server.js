require('./config/config')
//library imports
const express = require('express')
const bodyParser = require('body-parser')
const { ObjectId } = require('mongodb')
const _ = require('lodash')
const bcrypt = require('bcryptjs')
//local imports
let { mongoose } = require('./db/mongoose')
let { Todo } = require('./models/todo')
let { User } = require('./models/users')
let { authenticate } = require('./middleware/authenticate')

let port = process.env.PORT 

let app = express()
app.use(bodyParser.json())


//posts
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
    let body = _.pick(req.body, ['email', 'password'])
    let user = new User(body)
    user.save().then(()=>user.generateAuthToken()) 
        .then((token) => res.header('x-auth', token).send(user))
        .catch((e)=>res.status(400).send())
})
app.post('/users/login', (req, res)=> {
    let body = _.pick(req.body, ['email', 'password'])
    User.findByCredentials(body.email, body.password).then((user)=>{
        user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user)
        })
    }).catch((e) => {
        res.status(400).send()
    })
}) 
//get
app.get('/todos', (req, res) =>{
    Todo.find().then((todos) => {
        res.send({todos})
    }, (e) => {
        res.status(400).send(e)
    })
})
app.get('/todos/:id', (req, res) => {
    const id = req.params.id
    if(!ObjectId.isValid(id)) return res.status(400).send() 
    Todo.findById({ _id: id }).then((todo) => {
        todo ? res.send(todo) : res.status(404).send()
    }).catch((e) => res.status(400).send())
})
app.get('/users', (req, res) => {
    User.find().then((users) => {
        res.send({ users, count: users.length })
    }, (e) => res.status(400).send(e))
})
app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user) 
}) 
//delete
app.delete('/todos/:id', (req, res) => {
    const id = req.params.id
    if(!ObjectId.isValid(id)) return res.status(404).send()
    Todo.findByIdAndRemove(id).then((result)=>{
        result ? res.send({ result }) : res.status(404).send()
    }).catch((e)=>res.status(400).send())
})
// delete /logout
app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
        res.status(200).send()
    }, () => {
        res.status(400).send()
    })
})
//updating
app.patch('/todos/:id', (req, res)=>{
    const id = req.params.id
    let body = _.pick(req.body, ['text', 'completed'])
    if (!ObjectId.isValid(id)) return res.status(404).send()
    if(_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime()
    } else {
        body.completed = false
        body.completedAt = null
    } 
    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo)=>{
        if(!todo) return res.status(404).send()
        res.send({ todo })
    }).catch((e) => res.status(400).send())
})



app.listen(port, ()=> console.log(`Started on port ${port}`))
module.exports = { app }

//400 Bad Request - bad syntax
//404 Not Found - request resource not found
//401 Unauthorised - Improper authentication

//website: https://rocky-refuge-65073.herokuapp.com/