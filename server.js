import http from "http";
import SocketIO from "socket.io";
import express from "express";
import { copyFileSync } from "fs";


const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
//public폴더를 유저에게 공개해주는 코드
app.use("/public", express.static(__dirname + "/public"));
//홈페이지로 이동시 사용될 템플릿을 런데해주는 코드
app.get("/", (_, res) => res.render("home"));
//url에 어떤 것을 치던지 위의 코드의 url로 돌아감
app.get("/*", (_, res) => res.redirect("/"))


const handleListen = () => console.log(`Listening on http://localhost:3000`);

//http와 ws서버 둘 다 연결시켜줌, 그러나 꼭 이렇게 해 줄 필요없이 필요한건 하나만 연결시켜주어도 된다.
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

wsServer.on("connection", (socket) => {
  socket["nickname"] = "익명";
  socket.onAny((event) => {
    console.log(`Socket Event:${event}`);
  });
  //websocket처럼 message만 넣어주는 것이 아닌 room등 다른 event들을 넣어줄 수 있다.
  //front의 emit의 event와 back의 event 이름음 동일해야 한다!!
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname);
  });
  //누군가 나갔을 때 채팅방에서 알려줌
  socket.on("disconnecting", () => {
    socket.rooms.forEach(room => socket.to(room).emit("bye", socket.nickname));  
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });
  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});


//가짜 데이터베이스를 만들어줌
//누군가 우리 서버에 연결하면, 그 connection을 여기에 넣는다.
// const sockets = [];

// //frontend로 메세지를 보내고 받을 수 있다.
// //server.js의 socket은 연결된 브라우저를 뜻한다.
// const wss = new WebSocket.Server({server});
// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nickname"] = "Anon";
//   console.log("Connected to Browser");
//   socket.on("close", () => console.log("Disconnected from the Browser"));
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg.toString());
//     switch (message.type) {
//       case "new_message":
//         sockets.forEach((aSocket) => 
//           aSocket.send(`${socket.nickname}: ${message.payload}`));
//           break;
//         //nickname을 socket안에 저장
//       case "nickname":
//         socket["nickname"] = message.payload;
//         break;
//     }
//   });
// });



httpServer.listen(3000, handleListen);