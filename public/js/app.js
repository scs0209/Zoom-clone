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


//backend에서 실행을 시켜줌, 그리고 backend에서 인자를 전달 받을 수 있다. 또한 함수는 항상 마지막 인자에 넣어준다.
function showRoom(){
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `Room ${roomName}`
};

  //websocket처럼 string만 전송할 필요 없이 socketIO는 emit을 이용해 객체도 전송할 수 있다.
  // front에 있는 emit에 적은 function을 back에서 제어 할 수 있다.
  //인자를 내가 원하는 만큼 보내줄 수 있다(어떤 type이든 가능), 끝났다는 것을 알려주기 위한 function을 사용할때는 곡 마지막 인자에 넣어주어야 한다.
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

from.addEventListener("submit", handleRoomSubmit);


socket.on("welcome", () => {addMessage("someone joined");})