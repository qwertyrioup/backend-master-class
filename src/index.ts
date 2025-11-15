import { PORT } from "./env";
import { HttpError } from "./lib/error";
import { connectDB } from "./lib/mongoose";
import express, { NextFunction, Request, Response } from "express";

import userRoutes from "./routes/user";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB()




app.use('/api/users', userRoutes);



app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.json({
        success: true,
        message: "Hello World",
    });
});





app.use((err: HttpError, req: Request, res: Response, next: NextFunction) => {
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({
        success: false,
        status,
        message,
    });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})



