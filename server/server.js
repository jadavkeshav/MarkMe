const express = require('express');
const dotenv = require('dotenv');
const connectDB = require('./config/db.js');
const cors = require("cors");


const app = express();

dotenv.config();
app.use(express.json());
app.use(cors());

connectDB();

app.get('/', (req, res)=>{
    res.json({message: "Hello World"})
})

app.use('/api/user', require("./routes/userRoutes.js"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

  