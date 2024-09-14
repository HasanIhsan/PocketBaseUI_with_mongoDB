const express = require('express');
const {MongoClient, ObjectId} = require('mongodb');
const cors = require('cors');
const app = express();
const port = 3000;
//const router = express.Router();

require('dotenv').config()


const mongoURI = process.env.CONNECTION_STRING;
const client = new MongoClient(uri, {
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


 
app.listen(port, () => {
  console.log(`Proxy server running at http://localhost:${port}`);
});

