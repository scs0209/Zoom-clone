const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nick");
// backend로 메세지를 보내고 받을 수 있다.
//app.js의 socket은 서버로의 연결을 뜻함
const socket = new WebSocket(`ws://${window.location.host}`);//backend 연결


function makeMessage(type, payload){
  const msg = {type, payload};
  // JSON.stringify는 object를 string으로 변경해서 보냄
  return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
  console.log("Connected to Server");
});

socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

//오프라인이 됐을 때 사용하는 listener
socket.addEventListener("close", () => {
  console.log("Disconnected from Server");
});


function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  //backend로 보내고 메세지를 보냄
  socket.send(makeMessage("new_message", input.value));
  input.value = "";
}

function handleNickSubmit(event) {
  event.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);