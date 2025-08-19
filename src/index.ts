import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

interface Rectangle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
}

let rectangles: Rectangle[] = [];

io.on("connection", (socket) => {
  console.log("🔗 Client connected:", socket.id);

  //
  // Send existing rectangles when client joins
  socket.emit("init", rectangles);

  socket.on("rectangle:add", (rect: Rectangle) => {
    rectangles.push(rect);
    io.emit("rectangle:added", rect); 
    // here to broadcast to all
  });

  socket.on("rectangle:move", (updated: Rectangle) => {
    rectangles = rectangles.map((r) => (r.id === updated.id ? updated : r));
    socket.broadcast.emit("rectangle:moved", updated); 
    // this is for notify others
  });

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
  });
});

httpServer.listen(4000, () => {
  //
    console.log("🚀 Server running on http://localhost:4000");
  // consoling to tst the server if running or not!!
});
