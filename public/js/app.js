//socketIO를 front-end에서 back-end와 연결시켜줌
const socket = io();

const welcome = document.getElementById("welcome");
const from = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = "true";

let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function handleRoomSubmit(event){
  event.preventDefault();
  const input = document.querySelector("input");



//대화창에 메세지가 보이도록 만들어줌
function handleMessageSubmit(event){
  event.preventDefault();
  const input = room.querySelector("#msg input");
  const value = input.value;
  socket.emit("new_message", input.value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function handleNicknameSubmit(event){
  event.preventDefault();
  const input = room.querySelector("#name input");
  socket.emit("nickname", input.value);
  input.value = "";
}

//backend에서 실행을 시켜줌, 그리고 backend에서 인자를 전달 받을 수 있다. 또한 함수는 항상 마지막 인자에 넣어준다.
function showRoom(){
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`;
  const msgForm = room.querySelector("#msg");
  const nameForm = room.querySelector("#name");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nameForm.addEventListener("submit", handleNicknameSubmit);
};

  //websocket처럼 string만 전송할 필요 없이 socketIO는 emit을 이용해 객체도 전송할 수 있다.
  // front에 있는 emit에 적은 function을 back에서 제어 할 수 있다.
  //인자를 내가 원하는 만큼 보내줄 수 있다(어떤 type이든 가능), 끝났다는 것을 알려주기 위한 function을 사용할때는 곡 마지막 인자에 넣어주어야 한다.
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

from.addEventListener("submit", handleRoomSubmit);

//채팅방에 누군가 들어왔을 때 알려주는 코드
socket.on("welcome", (user, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${user} arrived!`);
});

//채팅방에 누군가 나갔을때 알려주는 코드
socket.on("bye", (left, newCount) => {
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName} (${newCount})`;
  addMessage(`${left} left ㅠㅠ`);
});

//화면에 내가 보낸 메세지를 표시
socket.on("new_message", addMessage);

//열려있는 방의 목록을 보여줌 닫히면 다시 사라진다.
socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if(rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerText = room;
    roomList.append(li);
  });
});