import { io } from "socket.io-client";

const URL = `${window.location.protocol}//${window.location.host}`;
const socket = io(URL);

socket.onAny((event, ...args) => {
  console.log('event: ', event, 'args: ', args);
});

export default socket;
