// Load environment variables from .env file
require("dotenv").config();


const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const nodemailer = require("nodemailer");
app.use(cors());
const PORT = process.env.PORT || 3005;

// MongoDB connectio
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Mongoose model for our weights
const Weight = mongoose.model(
  "Weight",
  new mongoose.Schema({
    deviceId: String,
    weight: Number,
    timestamp: Date,
  })
);

// Middleware to parse JSON requests
app.use(bodyParser.json());

app.get('/',(req,res)=>{
    res.send("lol")
})

// Route to add weight for a specific device
app.post("/add-weight/:deviceId", async (req, res) => {
  const weightData = {
    deviceId: req.params.deviceId,
    weight: req.body.weight,
    timestamp: new Date(),
  };

  const newWeight = new Weight(weightData);

  try {
    const savedData = await newWeight.save();
    res.status(200).send(savedData);
  } catch (err) {
    res.status(500).send(err);
  }
});

// Route to fetch all weight data for a specific device
app.get("/fetch-weights/:deviceId", (req, res) => {
  Weight.find({ deviceId: req.params.deviceId })
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// Route to fetch all weight data (regardless of device)
app.get("/fetch-all-weights", (req, res) => {
  Weight.find({})
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

// Delete a specific record based on its _id
app.delete("/delete-weight/:id", async (req, res) => {
  try {
    const result = await Weight.findByIdAndDelete(req.params.id);
    if (result) {
      res.status(200).send({ message: "Weight deleted successfully." });
    } else {
      res.status(404).send({ message: "Weight not found." });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

// Delete all records for a specific deviceId
app.delete("/delete-weights/:deviceId", async (req, res) => {
  try {
    const result = await Weight.deleteMany({ deviceId: req.params.deviceId });
    res
      .status(200)
      .send({ message: `${result.deletedCount} weights deleted.` });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Delete all records
app.delete("/delete-all-weights", async (req, res) => {
  try {
    const result = await Weight.deleteMany({});
    res
      .status(200)
      .send({ message: `${result.deletedCount} weights deleted.` });
  } catch (err) {
    res.status(500).send(err);
  }
});

// Send Email Route


app.post("/send-email", async (req, res) => {
  const { to, subject,text } = req.body;
  const html = `
    <html>
      <body>
        <h1>Garbage Fill Warning</h1>
        <img src= "./fullGarbage.png">
        <p>${subject}</p>
      </body>
    </html>
  `;

  // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
      user: "itgaragesmartbin@hotmail.com",
      pass: "smart123456*",
    },
  });

  // Define the email options
  const mailOptions = {
    from: "itgaragesmartbin@hotmail.com",
    to: to,
    subject: subject,
    html: html,
   
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Nodemailer error:", error);
      res.status(500).json({ error: "Failed to send email" }); // Sending JSON
    } else {
      console.log("Email sent:", info.response);
      res.status(200).json({ message: "Email sent successfully" }); // Sending JSON
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
