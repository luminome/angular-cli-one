
const { MongoClient, ServerApiVersion } = require('mongodb');
const fs = require('fs');

const credentials = '/Users/sac/Sites/library/mongo/X509-cert-7010500130319648579.pem' //'<path_to_certificate>'

const client = new MongoClient('mongodb+srv://cluster0.n4fxvug.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority', {
  sslKey: credentials,
  sslCert: credentials,
  serverApi: ServerApiVersion.v1
});

async function run() {
  try {
    await client.connect();
    const database = client.db("testDB");
    const collection = database.collection("testCol");
    const docCount = await collection.countDocuments({});
    console.log('docCount', docCount);
    // perform actions using client
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);
console.log('what');
