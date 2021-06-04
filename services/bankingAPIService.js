const getAccounts = async (db) => {
    const collection = db.collection('accounts')
    const result = await collection.find({}).toArray()
    return result
}