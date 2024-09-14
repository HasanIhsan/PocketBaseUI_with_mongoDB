const express = require('express');
const {MongoClient, ObjectId,  ServerApiVersion} = require('mongodb');
const cors = require('cors');
const app = express();
const port = 3000;
//const router = express.Router();

require('dotenv').config()

let db;

const mongoURI = process.env.CONNECTION_STRING;
const client = new MongoClient(mongoURI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

//*Connect to MongoDb
client.connect(err => {
    if(err){
        console.error('Failed to connect to Mongo', err);
        process.exit(1);
    }
    console.info("connect to Mongodb");
});


//*connect to DB
//TODO: modify this so the Db is connecting to can be changed!
//TODO: currently it is hardcoded to connect to NLIC_DATABASE
async function connectToDB() {
    if (!db) {
      try {
        await client.connect();
        db = client.db('NLIC_DATABASE');

        console.info('Connected to MongoDB');
      } catch (err) {
        console.error('Failed to connect to MongoDB', err);
        throw new Error('Database connection failed');
      }
    }
  }


//*health check
app.get('/', (req, res) => {
    res.send("App is running... v1.0.0");
    
});


//*get all collections (tables)!
app.get('/get-all-collections', async (req, res) => {

   
    try {

        //? Connect to MongoDB if not already connected
        if (!db) await connectToDB();

        //? Get all Collections (tables)
        const collections = await db.listCollections().toArray();

        //? Send collection data as json
        res.json(collections);

    }catch(error) {
        console.error('Error fetching colections:', error);
        console.info('Error fetching colections:', error);
        res.status(500).json({error: 'failed to get collections', error});
    }
});
 

//* get current seleteced collection data
app.get('/get-collection-data', async (req, res) => {

    const collectionName = req.query.collectionName;

    if (!collectionName) {
        return res.status(400).json({ error: 'Collection name is required' });
    }

    try {

        //? Connect to db
        if(!db) await connectToDB();

        //? Check if collection exists
        const collectionExists = await db.listCollections({ name: collectionName }).hasNext();
        if (!collectionExists) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        //? Get all documents from the selected collection
        const collection = db.collection(collectionName);
        const documents = await collection.find().toArray();

        //? Send the documents as a response
        res.json({ data: documents });

         
    }catch(error) {
        console.error('Error fetching colections:', error);
        console.info('Error fetching colections:', error);
        res.status(500).json({error: 'failed to get collections', error});
    }

});



app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});

