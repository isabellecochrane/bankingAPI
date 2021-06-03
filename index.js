const express = require('express')
const MongoClient = require('mongodb').MongoClient
const app = express()
const port = 3000
const ObjectId = require('mongodb').ObjectId

app.use(express.json())

const url = 'mongodb://root:password@localhost:27017'
const dbName = 'bankingAPI'

const Client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true})

let connectToDb = (cb) => {
    Client.connect((err) => {
        let db = Client.db(dbName)
        cb(db)
    })
}

//getting data from the db
app.get('/accounts', (req, res) => {
    connectToDb(async (db) => {
        //we now have access to the db connection, via param
        //here we tell mongo which collection we want to work with
        const collection = db.collection('accounts')
        //here we run a query using await to avoid more callbacks
        const data = await collection.find({}).toArray()
        res.json(data)
    })
})


app.post('/accounts', (req, res) => {
    const dataToSave = {
        name: req.body.name,
        balance: req.body.balance
    }

    connectToDb(async (db) => {
        const collection = db.collection('accounts')
        const result = await collection.insertOne(dataToSave)

        if (result.insertedCount == 1 ) {
            res.send('done')
        } else {
            res.send('fail')
        }
    })
})

app.put('/accounts', (req, res) => {
    const nameToUpdate = req.body.name
    const newBalance = req.body.balance

    connectToDb(async (db) => {
        const collection = db.collection('accounts')
        const result = await collection.updateMany({name: nameToUpdate}, {$set: {balance: newBalance}})


        if (result.modifiedCount === 1 ) {
            res.send('done')
        } else {
            res.send('fail')
        }
    })
})

app.get('/accounts/:id', (req, res) => {
    const idToGet = ObjectId(req.params.id)

    connectToDb(async (db) => {

        const collection = db.collection('accounts')
        const result = await collection.find({_id: idToGet}).toArray()
        res.json(result)
    })
})



app.listen(port)