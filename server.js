// Load environment variables from .env file
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const nodemailer = require("nodemailer");
app.use(
  cors({
    origin: "http://localhost:3000", // replace with your frontend application's URL
    credentials: true,
  })
);
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

app.get("/", (req, res) => {
  res.send("lol");
});

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
  const { to, subject, text } = req.body;
  const html = `
    <html>
      <body>
        <h1>${subject}</h1>
        <h4>The garbage fill percentage for <b style="color: red;">${text}</b> is over <b style="color: red;">80%</b>. Please empty the trash.</h4>
        <img style="height:300px; width:300px; border-radius: 12%;" src= "https://raw.githubusercontent.com/ersinev/SmartBin-RenderApi/main/fullGarbage.png"/>
    
      </body>
    </html>
  `;


  // Create a nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: true, // STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });

  // Define the email options
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "Garbage Is Full!",
    html: html,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Nodemailer error:", error);
      res.status(500).json({ error: "Failed to send email", details: error.message });
    } else {
      console.log("Email sent:", info.response);
      res.status(200).json({ message: "Email sent successfully" });
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
