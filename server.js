const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/smartbin', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch(err => {
    console.error("Error connecting to MongoDB:", err);
});

// Mongoose model for our weights
const Weight = mongoose.model('Weight', new mongoose.Schema({
    weight: Number,
    temp:Number,
    pres:Number,
    humd:Number,
    timestamp: Date
}));

// Middleware to parse JSON requests
app.use(bodyParser.json());

// Route to add weight
app.post('/add-weight', async (req, res) => {
    const weightData = {
        weight: req.body.weight,
        temp: req.body.temp,
        pres: req.body.pres,
        humd: req.body.humd,

        timestamp: new Date() // Automatically set the timestamp to the current time
    };

    const newWeight = new Weight(weightData);
    
    try {
        const savedData = await newWeight.save();
        res.status(200).send(savedData);
    } catch (err) {
        res.status(500).send(err);
    }
});



// Route to fetch all weight data
app.get('/fetch-weights', (req, res) => {
    Weight.find({})
        .then(data => {
            res.status(200).send(data);
        })
        .catch(err => {
            res.status(500).send(err);
        });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
