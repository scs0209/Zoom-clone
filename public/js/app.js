
//socketIO를 front-end에서 back-end와 연결시켜줌
const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");

call.hidden = true;

// stream받기 : stream은 비디오와 오디오가 결합된 것
let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;//누군가 getMedia함수를 불렀을 대와 똑같이 stream을 공유하기 위한 변수


//async는 비동기로 받는 것
async function getCameras() {
  try{
    // 장치 리스트 가져오기
    const devices = await navigator.mediaDevices.enumerateDevices();
    //videoinput만 가져오기
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach(camera => {
      const option = document.createElement("option");
      //카메라의 고유 값은 value에 넣기
      option.value = camera.deviceId;
      //사용자가 선택할 때는 label을 보고 선택할 수 있게 만들기
      option.innerText = camera.label;
      if(currentCamera.label === camera.label){
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
  } catch(e){
    console.log(e);
  }
}

async function getMedia(deviceId){
    // deviceId가 없을 때 실행됨
  const initialConstraints = {
    audio: true,
    //카메라가 전후면에 달려있을 경우 전면 카메라의 정보를 받음(후면의 경우 "environment")
    video: { facingMode: "user"},
  };
  //deviceId가 있을 때 실행
  const cameraConstraints = {
    audio: true,
    //exact를 스면 받아온 deviceId가 아니면 출력하지 않는다.
    video: { deviceId: { exact: deviceId }},
  }
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId? cameraConstraints : initialConstraints
    );
    myFace.srcObject = myStream;
    if(!deviceId){//처음 딱 1번만 실행! 우리가 맨 처츰 getMedia할 때만 실행
      await getCameras();
    }
  } catch(e) {
    console.log(e);
  }
}




function handleMuteClick(){
  myStream
    .getAudioTracks()
    .forEach(track => (track.enabled = !track.enabled));
  if(!muted){
    muteBtn.innerHTML = "Unmute";
    muted = true;
  } else {
    muteBtn.innerHTML = "Mute";
    muted = false;
  }
}

function handleCameraClick(){
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if(cameraOff){
    cameraBtn.innerText = "Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Camera On";
    cameraOff = true;
  }
}

async function handleCameraChange(){
  await getMedia(camerasSelect.value);
  if(myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender =  myPeerConnection
    .getSenders()
    .find(sender => sender.track.kind === "video");
  videoSender.replaceTrack(videoTrack);
  }
}


muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);



// Welcome Form(join) a room)
const welcome = document.getElementById("welcome");
const welcomerForm = welcome.querySelector("form");

async function initCall() {
  welcome.hidden = true;
  call.hidden = false;
  await getMedia();
  makeConnection();
}


async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomerForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  //방에 참가 했을 때 나중에 쓸 수 있도록 방 이름을 변수에 저장
  roomName = input.value;
  input.value = "";
}


welcomerForm.addEventListener("submit", handleWelcomeSubmit);


//Socket Code

//offer를 보냄
socket.on("welcome", async() => {
  //다른 사용자를 초대하기 위한 초대장(내가 누구인지 알려주는 내용이 들어있음)
  const offer = await myPeerConnection.createOffer();
  //myPeerConnection에 내 초대장의 위치 정보를 연결해 주는 과정
  myPeerConnection.setLocalDescription(offer);
  console.log("sent the offer");
  socket.emit("offer", offer, roomName);
});


//offer를 받음
socket.on("offer", async(offer) => {
  console.log("received the offer");
  //다른 브라우저의 위치를 myPeerConnection에 연결해 주는 과정
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  //현재 브라우저에서 생성한 answer를 현재 브라우저의 myPeerConnection의 LocalDescription으로 등록
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
  console.log("sent the answer");
});

socket.on("answer", (answer) => {
  console.log("received the answer");
  myPeerConnection.setRemoteDescription(answer);
});
//offer를 주고받는 코드는 서로 다른 브라우저에서 작동하고 있는 것이다.

socket.on("ice", (ice) => {
  console.log("received candidate");
  myPeerConnection.addIceCandidate(ice);
});

//RTC Code
function makeConnection(){
  //peerConnection을 각각의 브라우저에 생성
  myPeerConnection = new RTCPeerConnection({
    iceServers: [{
      urls: [
      "stun:stun.l.google.com:19302",
      "stun:stun1.l.google.com:19302",
      "stun:stun2.l.google.com:19302",
      "stun:stun3.l.google.com:19302",
      "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  //영상과 음성 트랙을 myPeerConnection에 추가해줌 -> per-to-peer 연결!!
  myStream
  .getTracks()
  .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data){
  console.log("sent the candidate");
  socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
  const peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.stream;
}