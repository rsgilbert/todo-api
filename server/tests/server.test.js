const expect = require('expect')
const request = require('supertest')
const { ObjectId } = require('mongodb')

const { app } = require('./../server.js')
const { Todo } = require('./../models/todo')
const { User } = require('./../models/users')
const { users, todos, populateTodos, populateUsers } = require('./seed/seed')


//testing get and post
beforeEach(populateTodos)  //beforeEach is a method in Mocha, only run it in testing
beforeEach(populateUsers)

describe('Testing POST', ()=>{
    it('should create a new todo', (done) => {
        let text = 'Test todo'
        request(app)
            .post('/todos')
            .send({ text })
            .expect(200)
            .expect((res) => {
                expect(res.body.text).toBe(text)
            })
            .end((err, res) => {
                if(err) return done(err) 
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(3)
                    expect(todos[2].text).toBe(text)
                    done()
                }).catch((e) => done(e))
            })
    })
    it('should have a valid body', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) =>{
                if (err) return done(err) 
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2)
                    done()
                }).catch((e) => done(e))
            })
    })
    describe('USER', () => {
        it('should have an email', (done) =>{
            request(app)
                .post('/users')
                .send({email: "douglas@uh.muk" })
                .expect(200)
                .end((err, res) =>{
                    if(err){return done(err)}
                    User.find().then((users)=>{
                        expect(users.length).toBe(4)
                        done()
                    }).catch((e) => done(e))
                })
        })
    })

})
describe('Testing GET ', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect((res)=>{
                expect(res.body.todos.length).toBe(2)
            })
            .end(done)
    })
    it('should get all users', (done) => {
        request(app)
            .get('/users')
            .expect(200)
            .expect((res)=> {
                expect(res.body.users.length).toBe(3)
            })
            .end(done)
    })
})
describe('GET /todos/:id', ()=> {
    it('should return todo doc', (done) => {
        request(app)
            .get(`/todos/${ todos[0]._id.toHexString() }`)
            .expect(200)
            .expect((res) => expect(res.body.text).toBe(todos[0].text))
            .end(done)
    })
    it('should return 404', (done) => {
        const testId = new ObjectId().toHexString()
        request(app)
            .get(`/todos/${testId}`)
            .expect(404)
            .expect((res) => expect(res.body.text).toBe())
            .end(done)
    })
    it('should return 404 for non-object ids', (done) => {
        request(app)
            .get('/todos/100')
            .expect(400)
            .expect((res) => expect(res.body).toEqual({}))
            .end(done)
    })
})

describe('DELETE /todos/:id', ()=>{
    it('should remove a todo', (done) => {
        let id = todos[1]._id.toHexString()
        request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect((res) => expect(res.body.result._id).toBe(id))
            .end((err, res) =>{
                if(err) return done(err)
                Todo.findById(id).then((result)=>{
                    expect(result).toEqual(null)
                    done()
                }).catch((e)=>done(e))
                
            })
    })
    it('should return 404 if todo not found', (done) =>{
        let id = new ObjectId()
        request(app)
            .delete(`/todos/${id}`)
            .expect(404)
            .end(done)
    })
    it('should return 404 if todo id is invalid', (done) => {
        request(app)
            .delete(`/todos/23`)
            .expect(404)
            .end(done)
    })
})
describe("PATCH /todos/:id", ()=>{
    it('should update todo', (done) =>{
        const id = todos[0]._id.toHexString()
        let text = 'Patch Test'
        request(app)
            .patch(`/todos/${id}`)
            .send({
                text, completed: true
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(text)
                expect(res.body.todo.completed).toBe(true)
                // expect(res.body.todo.completedAt).toBeA('number')
            })
            .end(done)
    })
    it('should clear completedAt when todo is not completed', (done) =>{
        const id = todos[1]._id.toHexString()
        let text = "Clear completed"
        request(app)
            .patch(`/todos/${id}`)
            .send({
                text,
                completed: false
            })
            .expect(200)
            .expect((res) =>{
                expect(res.body.todo.completedAt).toBe(null)
                expect(res.body.todo.text).toBe(text)
            })
            .end(done)
    })
})
describe('GET /users/me', () =>{
    it('should return user if authenticated', (done) =>{
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((res) =>{
                expect(res.body._id).toBe(users[0]._id.toHexString())
                expect(res.body.email).toBe(users[0].email)
            })
            .end(done)
    })
    it('should return 401 if not authenticated', (done) => {
        request(app)
        .get('/users/me')
        .expect(401)
        .expect((res) => {
            expect(res.body).toEqual({})
        })
        .end(done)
    })
})
describe('POST /users', () => {
    it('should create a user', (done) =>{
        let email = 'test@test.com'
        let password = 'test'
        request(app)
            .post('/users')
            .send({ email, password })
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toExist()
                expect(res.headers['x-auth']).toBeA('string')
                expect(res.body.email).toBe(email)
            })
            .end((err) => {
                if(err) return done(err)
                User.findOne({ email }).then((user) => { 
                    expect(user).toExist()
                    expect(user.password).toNotBe(password)
                    done()
                }).catch((e) => done(e)) //if you dont include catch will use timeout for error

            })

    })
    it('should return validation errors if request is invalid', (done) =>{
        
        request(app)
            .post('/users')
            .send({email: "d", password: 'ddd'})
            .expect(400)
            .end(done)
            

    })
    it('should not create user if email is in use', (done) =>{
        let number_of_users = users.length
        request(app)
            .post('/users')
            .send({ email: users[0].email, password: 'dddd'})
            .expect(400)
            .expect(() => {
                expect(users.length).toBe(number_of_users)
            })
            .end(done)
    })
})
describe('POST /users/login', ()=>{
    it('should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({ 
                email: users[2].email,
                password: users[2].password
            })
            .expect(200)
            .expect((res) =>{
                expect(res.headers['x-auth']).toExist()
            })
            .end((err, res) => {
                if(err) return done(err)
                User.findById(users[2]._id).then((user) => {
                    expect(user.tokens[0]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    })
                    done()
                }).catch((e)=>done(e))
            })
    })
    it('should reject invalid login', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: 'fff',
                password: users[2].password
            })
            .expect(400)
            .expect((res) => {
                expect(res.headers['x-auth']).toNotExist()
            })
            .end((err, res) => {
                if(err) return done(err)
                User.findById(users[2]._id).then((user)=>{
                    expect(user.tokens.length).toBe(0)
                    done()
                }).catch((e)=> done(e))
            })
    })
})






