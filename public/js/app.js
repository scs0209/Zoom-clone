const messageList = document.querySelector("ul");
const messageForm = document.querySelector("form");
// backend로 메세지를 보내고 받을 수 있다.
//app.js의 socket은 서버로의 연결을 뜻함
const socket = new WebSocket(`ws://${window.location.host}`);//backend 연결


socket.addEventListener("open", () => {
  console.log("Connected to Server");
});

socket.addEventListener("message", (message) => {
  console.log("New message: ", message.data);
});

//오프라인이 됐을 때 사용하는 listener
socket.addEventListener("close", () => {
  console.log("Disconnected from Server");
});


function handleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  //backend로 보내고 메세지를 보냄
  socket.send(input.value);
  input.value = "";
}

messageForm.addEventListener("submit", handleSubmit);