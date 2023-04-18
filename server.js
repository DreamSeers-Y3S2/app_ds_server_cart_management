const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const app = express();
const cartRoutes = require("./routes/cartRoutes");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
connectDB();
app.use(express.json());
app.use("*", cors());

app.get("/", (req, res) => {
  res.send("Cart API is Running");
});

app.use("/cart", cartRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5003;
app.listen(PORT, console.log(`Cart Server Started on port ${PORT}..`));
