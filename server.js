import http from "http";
import WebSocket from "ws";
import express from "express";

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
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

//가짜 데이터베이스를 만들어줌
//누군가 우리 서버에 연결하면, 그 connection을 여기에 넣는다.
const sockets = [];

//frontend로 메세지를 보내고 받을 수 있다.
//server.js의 socket은 연결된 브라우저를 뜻한다.
wss.on("connection", (socket) => {
  sockets.push(socket);
  console.log("Connected to Browser");
  socket.on("close", () => console.log("Disconnected from the Browser"));
  socket.on("message", (message) => {
    sockets.forEach((aSocket) => aSocket.send(message.toString()));
  });
});

server.listen(3000, handleListen);