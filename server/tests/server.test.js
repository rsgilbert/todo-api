const expect = require('expect')
const request = require('supertest')
const { ObjectId } = require('mongodb')

const { app } = require('./../server.js')
const { Todo } = require('./../models/todo')
const { User } = require('./../models/users')

const todos = [{
    _id: new ObjectId(),
    text: "First todo"
}, {
    _id: new ObjectId(),
    text: "Second todo"
}]


const users = [{ email: "mike@mail.com" }, { email: "bull@cattle.com" }, { email: "cat@pets.org" }]

//testing get and post
beforeEach((done) => {  //beforeEach is a method in Mocha, only run it in testing
    Todo.deleteMany().then(()=> Todo.insertMany(todos))
        .then(() => done())
})
beforeEach((done) => {
    User.deleteMany().then(()=> User.insertMany(users)).then(()=> done())
})
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





