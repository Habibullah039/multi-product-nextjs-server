require('dotenv').config();
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});


async function run() {
    try {
        // Connect to MongoDB
        // await client.connect();
        // console.log("Connected to MongoDB");

        const db = client.db("nextjsProject");
        const collection = db.collection("users");
        const productCollection = db.collection("store");
        const flashSaleCollection = db.collection("flash-sale");


        app.get('/products', async (req, res) => {
            let query = {};
            // if (req.query.priority) {
            //     query.priority = req.query.priority;
            // }
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            res.send(products);
        });

        app.get('/flash-sale', async (req, res) => {
            let query = {};

            const cursor = flashSaleCollection.find(query);
            const sales = await cursor.toArray();
            // res.send({ status: true, data: products });
            res.send(sales);
        });

        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await productCollection.findOne(query);
            res.send(result);
        });

        app.get('/flash-sale/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await flashSaleCollection.findOne(query);
            res.send(result);
        });


        app.post('/product', async (req, res) => {
            const product = req.body;
            const result = await productCollection.insertOne(product);
            res.send(result);
        });



        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const result = await productCollection.deleteOne({ _id: ObjectId(id) });
            // console.log(result);
            res.send(result);
        });





        // User Registration
        app.post("/api/v1/register", async (req, res) => {
            const { username, email, password , number} = req.body;

            // Check if email already exists
            const existingUser = await collection.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: "User already exist!!!",
                });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert user into the database
            await collection.insertOne({
                username,
                email,
                number ,
                password: hashedPassword,
                role: "user",
            });

            res.status(201).json({
                success: true,
                message: "User registered successfully!",
            });
        });

        // User Login
        app.post("/api/v1/login", async (req, res) => {
            const { email, password } = req.body;

            // Find user by email
            const user = await collection.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            // Compare hashed password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({ message: "Invalid email or password" });
            }

            // Generate JWT token
            const token = jwt.sign(
                { email: user.email, role: user.role },
                process.env.JWT_SECRET,
                {
                    expiresIn: process.env.EXPIRES_IN,
                }
            );

            res.json({
                success: true,
                message: "User successfully logged in!",
                accessToken: token,
            });
        });

        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on ${port}`);
        });
    } finally {
    }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
    const serverStatus = {
        message: "Server is running smoothly",
        timestamp: new Date(),
    };
    res.json(serverStatus);
});