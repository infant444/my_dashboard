import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import cookieParser from "cookie-parser";
import AuthRouter from "./routes/auth.routes";
import BlogRouter from "./routes/blog.routes";
import EnquiryRouter from "./routes/enquiry.routes";
import feedbackRouter from "./routes/feedback.routes";
import projectRouter from "./routes/project.routes";
import UserRouter from "./routes/user.routes";
import DashboardRouter from "./routes/dashboard.routes";
import { errorHandler } from './middleware/error.middleware';

process.setMaxListeners(15);

const app=express();
// const server = http.createServer(app);
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials:true,
    origin:["http://localhost:5173"]
}));

// Attach WebSocket server
// const wss = new WebSocketServer({ server });

// wss.on("connection", (ws: WebSocket) => {
//   console.log("Client connected");

//   ws.on("message", (data: WebSocket.RawData) => {
//     if (typeof data === "string") {
//       const msg = JSON.parse(data);
//       console.log("Control:", msg);
//     } else {
//       console.log("Audio chunk size:", data);
//     }
//   });

//   ws.on("close", () => {
//     console.log("Client disconnected");
//   });
// });
app.get("/",(req,res)=>{
    res.status(200).json({
        message:"Hello Welcome to my site ,I will sure to you will enjoy in out site because the lot of events is add to the site and get great experience and get afford able price to get on it" 
    })
})

app.use("/api/auth",AuthRouter);
app.use("/api/blog",BlogRouter);
app.use("/api/enquiry",EnquiryRouter);
app.use("/api/feedback",feedbackRouter);
app.use("/api/project",projectRouter);
app.use("/api/user",UserRouter);
app.use("/api/dashboard",DashboardRouter);
app.use(errorHandler);
const port=process.env.PORT || 5000;
app.listen(port,()=>{
    console.log("serve on http://localhost:"+port)
})
// server.listen(port,()=>{
//     console.log("serve on http://localhost:"+port);
    
// })