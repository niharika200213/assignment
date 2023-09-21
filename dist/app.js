"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const notFound_1 = __importDefault(require("./errors/notFound"));
const mongoose_1 = __importDefault(require("mongoose"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const v1_1 = __importDefault(require("./routes/v1"));
const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
};
// Load environment variables
dotenv_1.default.config();
// Create Express server
const app = (0, express_1.default)();
// Express configuration
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true, limit: "5mb" }));
// CORS configuration
app.use((0, cors_1.default)(corsOptions));
app.options("*", cors_1.default);
mongoose_1.default.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.log(`MongoDB connection error: ${error}`));
app.use(v1_1.default);
// Error handling
app.use(notFound_1.default);
app.use(errorHandler_1.default);
const port = process.env.PORT || 3000;
const start = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        app.listen(port, () => {
            console.log(`Server is connected to redis and is listening on port ${port}`);
        });
    }
    catch (error) {
        console.log(error);
    }
});
start();
exports.default = app;
//# sourceMappingURL=app.js.map