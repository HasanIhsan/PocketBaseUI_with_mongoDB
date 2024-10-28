const express = require('express');
const {MongoClient, ObjectId,  ServerApiVersion} = require('mongodb');
const cors = require('cors');
const app = express();
const port = 3000;
//const router = express.Router();

const multer = require('multer');
const upload = multer();  //? Initialize multer (with memory storage, or you can customize for disk storage)


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
//TODO: FIX: image upload cause it doesn't work!
app.put('/update-selected-data', upload.any(), async (req, res) => {
    const collectionName = req.query.collectionName;
    const documentId = req.query.id;

    //* Check if both collection name and document ID are provided
    if (!collectionName || !documentId) {
        return res.status(400).json({ error: 'Collection name and document ID are required' });
    }

    try {
        //* Connect to the database if not already connected
        if (!db) await connectToDB();

        //* Check if the collection exists
        const collectionExists = await db.listCollections({ name: collectionName }).hasNext();
        if (!collectionExists) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        //* Get the collection
        const collection = db.collection(collectionName);

        //* Construct updated data
        let updatedData = {};

        //* Iterate over req.body (form fields)
        //TODO: It says that objectId is depricated... but this code works fine 9/23/2024... (so if it breaks i'll fix it then)
        Object.entries(req.body).forEach(([key, value]) => {
            //* Convert to ObjectId if the key contains "id" (you can adjust this to match specific fields)
            if (key.toLowerCase().includes('id') && value.match(/^[0-9a-fA-F]{24}$/)) {
                updatedData[key] = new ObjectId(value); //? Convert to ObjectId
            } else {
                updatedData[key] = value; //? Keep as string or other data types
            }
        });

        //* If there's a file upload, handle the file here
        if (req.files && req.files.length > 0) {
            const file = req.files[0];  //? Assuming a single file upload
            updatedData.file = {
                data: file.buffer.toString('base64'),  //? Convert buffer to base64
                contentType: file.mimetype,
                filename: file.originalname
            };
        }

        //* Perform the update
        const result = await collection.updateOne(
            { _id: new ObjectId(documentId) },  //? Filter by document ID
            { $set: updatedData }  //? Update with new data
        );

        //* If no document was modified, return a 404
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }

        //* Respond with success if the document was updated
        return res.status(200).json({ message: 'Document updated successfully' });

    } catch (error) {
        console.error('Error updating document:', error);
        res.status(500).json({ error: 'Failed to update document' });
    }
});

//! Function to delete data 
//* the input is a array and every id in that array gets deleted! 
//* NOTE: this function does not work with FK's only deletes data from a seleted collection (if a data has a FK that FK will NOT be deleted)
//TODO: FIX DELETE SO IT DELETES FK's
app.delete('/delete-selected-data', async (req, res) => {
    const collectionName = req.query.collectionName;
    const ids = req.body.ids;  // Expecting an array of IDs in the request body

    //* Check if both collection name and IDs array are provided
    if (!collectionName || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'Collection name and an array of IDs are required' });
    }

    try {
        //* Connect to the database if not already connected
        if (!db) await connectToDB();

        //* Check if the collection exists
        const collectionExists = await db.listCollections({ name: collectionName }).hasNext();
        if (!collectionExists) {
            return res.status(404).json({ error: 'Collection not found' });
        }

        //* Get the collection
        const collection = db.collection(collectionName);

        //* Convert each ID in the array to an ObjectId
        const objectIds = ids.map(id => new ObjectId(id));

        //* Delete documents that match any of the IDs in the array
        const result = await collection.deleteMany({ _id: { $in: objectIds } });

        //* Check if any documents were deleted
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'No documents found with the specified IDs' });
        }

        //* Respond with success message and number of documents deleted
        return res.status(200).json({ message: `${result.deletedCount} document(s) deleted successfully` });

    } catch (error) {
        console.error('Error deleting documents:', error);
        res.status(500).json({ error: 'Failed to delete documents' });
    }
});

app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});

