const express = require('express')
const app = express()

const MongoClient = require('mongodb').MongoClient
const ObjectId = require('mongodb').ObjectId

app.use(express.json())
const PORT = 3001


module.exports = app


const url = 'mongodb://root:password@localhost:27017'
const dbName = 'bankingAPI'

const Client = new MongoClient(url, {useNewUrlParser: true, useUnifiedTopology: true})

let connectToDb = (cb) => {
    Client.connect((err) => {
        let db = Client.db(dbName)
        cb(db)
    })
}


module.exports.connectToDb = connectToDb

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

//adding an account to db
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

//updating balance
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

//getting account by id
app.get('/accounts/:id', (req, res) => {
    const idToGet = ObjectId(req.params.id)

    connectToDb(async (db) => {

        const collection = db.collection('accounts')
        const result = await collection.find({_id: idToGet}).toArray()
        res.json(result)
    })
})

//deposit money into account
app.put('/accounts/:id/deposit', (req, res) => {
    const idToUpdate = ObjectId(req.params.id)
    const deposit = req.body.deposit

    connectToDb(async (db) => {
        const collection = db.collection('accounts')
        const result = await collection.updateOne({_id: idToUpdate}, {$inc: {balance: deposit}})

        if (result.modifiedCount === 1 ) {
            res.send('done')
        } else {
            res.send('fail')
        }
    })
})


//withdraw money from account
app.put('/accounts/:id/withdraw', (req, res) => {
    const idToUpdate = ObjectId(req.params.id)
    const withdraw = req.params.withdraw

    connectToDb(async (db) => {
        const collection = db.collection('accounts')
        const result = await collection.updateOne({_id: idToUpdate}, {$inc: {balance: -withdraw}})

        if (result.modifiedCount === 1 ) {
            res.send('done')
        } else {
            res.send('fail')
        }
    })
})


//balance transfer
app.put('/accounts/:id/transfer', (req, res) => {
    const transferAmount = req.body.amount
    const idToSendAmount = ObjectId(req.params.id)
    const idToReceiveAmount = ObjectId(req.body.id)

    connectToDb(async (db) => {
        const collection = db.collection('accounts')
        const result = await collection.updateOne({_id: idToSendAmount}, {$inc: {balance: -transferAmount}})

         if (result.modifiedCount === 1 ) {
             const secondResult = await collection.updateOne({_id: idToReceiveAmount}, {$inc: {balance: transferAmount}})
             if (secondResult.modifiedCount === 1 ) {
                 res.send('done')
             } else {
                 res.send('fail')
             }
         }
    })
})

//deleting an account
app.delete('/accounts/:id/remove', (req, res) => {
    const accountToRemove = ObjectId(req.params.id)
    connectToDb(async (db) => {
        const collection = db.collection('accounts')
        const result = await collection.deleteOne({_id: accountToRemove})

        if (result.deletedCount === 1 ) {
            res.send('done')
        } else {
            res.send('fail')
        }
    })
})

app.listen(PORT)
