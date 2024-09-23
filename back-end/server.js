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

//!Connect to MongoDb
client.connect(err => {
    if(err){
        console.error('Failed to connect to Mongo', err);
        process.exit(1);
    }
    console.info("connect to Mongodb");
});


//!connect to DB
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


//!health check
app.get('/', (req, res) => {
    res.send("App is running... v1.0.0");
    
});


//!get all collections (tables)!
app.get('/get-all-collections', async (req, res) => {

   
    try {

        //* Connect to MongoDB if not already connected
        if (!db) await connectToDB();

        //* Get all Collections (tables)
        const collections = await db.listCollections().toArray();

        //* Send collection data as json
        res.json(collections);

    }catch(error) {
        console.error('Error fetching colections:', error);
        console.info('Error fetching colections:', error);
        res.status(500).json({error: 'failed to get collections', error});
    }
});
 

//! get current seleteced collection data
app.get('/get-collection-data', async (req, res) => {

    const collectionName = req.query.collectionName;

    if (!collectionName) {
        return res.status(400).json({ error: 'Collection name is required' });
    }

    try {

        //* Connect to db
        if(!db) await connectToDB();

        //* Check if collection exists
        const collectionExists = await db.listCollections({ name: collectionName }).hasNext();
        if (!collectionExists) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        //* Get all documents from the selected collection
        const collection = db.collection(collectionName);
        const documents = await collection.find().toArray();

        //* Send the documents as a response
        res.json({ data: documents });

         
    }catch(error) {
        console.error('Error fetching colections:', error);
        console.info('Error fetching colections:', error);
        res.status(500).json({error: 'failed to get collections', error});
    }

});


//! Rouote to get a document info by id
app.get('/get-cdocument-data-by-id', async (req, res) => {
    const collectionName = req.query.collectionName;
    const documentId = req.query.id;

    //* Check if both collection name and document ID are provided
    if (!collectionName || !documentId) {
        return res.status(400).json({ error: 'Collection name and document ID are required' });
    }

    try {
        //* Connect to the database if not already connected
        if (!db) await connectToDB();

        //* Check if collection exists
        const collectionExists = await db.listCollections({ name: collectionName }).hasNext();
        if (!collectionExists) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        //* Get the collection
        const collection = db.collection(collectionName);

        //* Find the document by its ID
        const document = await collection.findOne({ _id: new ObjectId(documentId) });

        //* If document not found, return an error
        if (!document) {
            return res.status(404).json({ error: 'Document not found' });
        }

        //* Return the document as JSON
        res.json({ data: document });

    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({ error: 'Failed to fetch document' });
    }
});

//! Update selected data by id and collectionName
app.put('/update-selected-data', async (req, res) => {
    const collectionName = req.query.collectionName;
    const documentId = req.query.id;

    //* Check if both collection name and document ID are provided
    if (!collectionName || !documentId) {
        return res.status(400).json({ error: 'Collection name and document ID are required' });
    }

    //* Get the data to update from the request body
    const updatedData = req.body;

    try {
        //* Connect to the database if not already connected
        if (!db) await connectToDB();

        //* Check if the collection exists
        const collectionExists = await db.listCollections({ name: collectionName }).hasNext();
        if (!collectionExists) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        //* Remove _id from updatedData to prevent trying to update the immutable field
        delete updatedData._id;

        //* Get the collection
        const collection = db.collection(collectionName);

        //* Perform the update
        const result = await collection.updateOne(
            { _id: new ObjectId(documentId) },  // Filter by document ID
            { $set: updatedData }  // Update with new data
        );

        //* If no document was modified, return a 404
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        //* Respond with success if document was updated
        return res.status(200).json({ message: 'Document updated successfully' });

    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ error: 'Failed to update document' });
    }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});

