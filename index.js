const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;



//middleware
app.use(cors());
app.use(express.json());




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hbgeo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const userCollection = client.db('TaskFlowDB').collection('users');
    const taskCollection = client.db('TaskFlowDB').collection('task');

    // user Post API 
    app.post('/users', async(req, res) => {
        const user = req.body;
        console.log('creating new user', user);

        const query = {email: user.email}
        const existingUser = await userCollection.findOne(query);
        if(existingUser){
            return res.send({message: 'user already exists', insertedId: null})
        }
        const userToBeAdded = {
            ...user,
            createdAt: new Date(),
          };
    
        const result = await userCollection.insertOne(userToBeAdded)
        res.send(result);
      });

      app.post('/task', async(req, res) => {
        const taskData = req.body;
        const result = await taskCollection.insertOne(taskData);
        res.send(result);
      })


    // Task post API 

    app.get('/task', async(req, res) => {
      const email = req.query.email;
    
      let query = {};
      if (email) {
        query = { email: email };
      }

      try {
        const result = await taskCollection.find(query).toArray();
        res.send(result);
      } catch (error) {
        res.status(500).send({ message: 'Error fetching Task List' });
      }
    })

    // Delete API

    app.delete('/task/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    })

    //update API
    
    app.put('/task/:id', async (req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert: true};
      const updateTask = req.body;
      const task = {
        $set: {
          title: updateTask.title,
          description: updateTask.description,
          category: updateTask.category,
        }
      }
      
      const result = await taskCollection.updateOne(filter, task, options);
      res.send(result);
    })

      

    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('server running')
})

app.listen(port, () => {
    console.log(`server rinning ${port}`)
})