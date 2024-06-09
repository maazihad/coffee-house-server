require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();

//=====>>>>port
const port = process.env.PORT || 5000;

//=====>>middlewares
app.use(express.json());
app.use(cors());

// const uri = 'mongodb://localhost:27017';
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASS}@cluster0.71pfsan.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //=============================================
    //================Collections==================
    const coffeeCollections = client
      .db('coffeeDB')
      .collection('coffeeCollection');
    const usersDb = client.db('usersDb').collection('usersCollection');
    //================Collections==================
    //=============================================
    app.get('/coffee', async (req, res) => {
      const allCoffee = coffeeCollections.find();
      const result = await allCoffee.toArray();
      res.send(result);
    });

    app.get('/coffee/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollections.findOne(query);
      res.send(result);
    });

    app.post('/coffee', async (req, res) => {
      const newCoffee = req.body;
      console.log('New Coffee from Client', newCoffee);
      const result = await coffeeCollections.insertOne(newCoffee);
      res.send(result);
    });

    app.put('/coffee/:id', async (req, res) => {
      const id = req.params.id;
      const updatedCoffee = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const coffee = {
        // $set: updatedCoffee,
        $set: {
          name: updatedCoffee.name,
          chef: updatedCoffee.chef,
          supplier: updatedCoffee.supplier,
          taste: updatedCoffee.taste,
          category: updatedCoffee.category,
          details: updatedCoffee.details,
          photo: updatedCoffee.photo,
        },
      };
      const result = await coffeeCollections.updateOne(filter, coffee, options);
      res.send(result);
    });

    app.delete('/coffee/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      console.log(id, query);
      const result = await coffeeCollections.deleteOne(query);
      res.send(result);
    });

    //====================================================
    //======================>>>>>>USER<<<<<<<<<<==========
    //====================================================
    app.get('/users', async (req, res) => {
      const cursor = usersDb.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post('/users', async (req, res) => {
      const newUser = req.body;
      console.log(newUser);
      const result = await usersDb.insertOne(newUser);
      res.send(result);
    });

    app.patch('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateUser = {
        $set: {
          lastLoginAt: user.lastLoginAt,
        },
      };
      const result = await usersDb.updateOne(filter, updateUser);
      res.send(result);
    });

    app.delete('/users/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersDb.deleteOne(query);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!',
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('App is running of server....');
});

app.listen(port, () => {
  console.log(`The application is running of port ${port}`);
});
