import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose, { ConnectOptions } from 'mongoose';
import errorHandlerMiddleware from "./middleware/errorHandler";
import router from "./routes";

const corsOptions: cors.CorsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// Load environment variables
dotenv.config();

// Create Express server
const app = express();

// Express configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// CORS configuration
app.use(cors(corsOptions));
app.options("*", cors);


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
} as ConnectOptions).then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log(`MongoDB connection error: ${error}`));

app.use(router);
// Error handling
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 8080;

const start = async () => {
  try {
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}`)
    })
  } catch (error) {
    console.log(error)
  }
}

start()
export default app;
