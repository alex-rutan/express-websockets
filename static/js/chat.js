/** Client-side of groupchat. */

const { text } = require("express");

const urlParts = document.URL.split("/");
const roomName = urlParts[urlParts.length - 1];
const ws = new WebSocket(`ws://localhost:3000/chat/${roomName}`);


const name = prompt("Username?");


/** called when connection opens, sends join info to server. */

ws.onopen = function (evt) {
  console.log("open", evt);

  let data = { type: "join", name: name };
  ws.send(JSON.stringify(data));
};


/** called when msg received from server; displays it. */

ws.onmessage = function (evt) {
  console.log("message", evt);

  let msg = JSON.parse(evt.data);
  console.log(msg);
  let item;

  if (msg.type === "note") {
    item = $(`<li><i>${msg.text}</i></li>`);
  } else if (msg.type === "chat") {
    item = $(`<li><b>${msg.name}: </b>${msg.text}</li>`);
  } else if (msg.type === "get-joke") {
    item = $(`<li><b> What does a bee say to the other bee? Wasabi </b></li>`);
  } else if (msg.type === "get-members") {
    item = $(`<li><b> ${msg.text} </b></li>`);
  } else {
    return console.error(`bad message: ${msg}`);
  }


  $("#messages").append(item);
};


/** called on error; logs it. */

ws.onerror = function (evt) {
  console.error(`err ${evt}`);
};


/** called on connection-closed; logs it. */

ws.onclose = function (evt) {
  console.log("close", evt);
};


/** send message when button pushed. */

$("form").submit(function (evt) {
  evt.preventDefault();

  const textInput = $("#m").val();

  let data;

  if (textInput.startsWith("/priv ")){
    let targetUser = textInput.split(" ")[1];
    let text = textInput.split(" ").slice(2).join(" ")
    data = { 
      type: "private-message", 
      text: text,
      targetUser: targetUser
    }
  }

  if (textInput === "/joke") {
    data = { type: "get-joke" }
  } 
  else if (textInput === "/members") {
    data = { type: "get-members" }
  } else {
    data = { type: "chat", text: textInput };
  }

  ws.send(JSON.stringify(data));

  $("#m").val("");
});

