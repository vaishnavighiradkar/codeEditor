const express = require("express");
const cors = require("cors");
const bodyParser = require('body-parser');
const connectDB = require("./config/db");
const authRoutes=require("./Routes/authRoutes")

const app = express();

require("dotenv").config();

connectDB();

app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  allowedHeaders: 'Content-Type,Authorization',
}));

app.use(express.json({ extended: false }));
app.use(bodyParser.json());

app.use('/auth', authRoutes);
// app.use('/create', routes);
// app.use('/edit', editRoute);
// app.use('/delete', deleteRoute);
// app.use('/view', viewRoute);
// app.use('/viewRoom', viewRoomRoute);
// app.use('/user', userRoute);
// app.use('/filter', filterRoute);
// app.use('/stats', statRoute);

app.get('/keep-alive', (req, res) => {
  res.status(200).send('Server is alive');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});