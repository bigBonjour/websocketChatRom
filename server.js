//espress node的web框架
//websocket协议架设 http->socket
var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var path = require("path");
app.use("/", express.static(path.join(__dirname, "public")));
http.listen(3000, function() {
	console.log("server running in port 3000");
})
var onlineUsers = {};
var onlineCount = 0;
//服务端接受消息
io.on("connection", function(socket) {
	//在线成员
	function getUsersList() {
		var listUsers = [];
		for(var i in onlineUsers) {
			listUsers.push(onlineUsers[i]);
		}
		console.log("在线成员");
		console.log(listUsers);
	}
	//服务端介绍登录信息
	socket.on("login", function(obj) {
		console.log("新用户上线");
		//将新加入的用户的唯一标识当做socket的名称
		socket.name = obj.userid;
		if(!onlineUsers.hasOwnProperty(obj.userid)) {
			onlineUsers[obj.userid] = obj.username + "__" + obj.userid;
			//在线人数+1
			onlineCount++;
		}
		io.emit("login", {
			onlineUsers: onlineUsers,
			onlineCount: onlineCount,
			user: obj
		})
		getUsersList();
		console.log(obj.username + "加入了聊天室");
	})
	//服务端接送消息
	socket.on("message", function(obj) {
		console.log(obj)
		//转发消息到客户端（广播）
		io.emit("message", obj);
		console.log(obj.username + "说：" + obj.content);
	});
	//用户退出
	socket.on("disconnect", function() {
		if(onlineUsers.hasOwnProperty(socket.name)) {
			//退出用户信息
			var obj = {
				userid: socket.name,
				username: onlineUsers[socket.name]
			}
			//删除
			delete onlineUsers[socket.name];
			onlineCount--;
			//广播用户退出
			io.emit("logout", {
				onlineUsers: onlineUsers,
				onlineCount: onlineCount,
				user: obj
			})
			console.log(obj.username + "退出了聊天室");
		}
	})

	function tick() {
		var now = new Date();
		var nowObj = {
			year: now.getFullYear(),
			month: now.getMonth() + 1,
			day: now.getDate(),
			hour: now.getHours(),
			minute: now.getMinutes(),
			second: now.getSeconds()
		}
		//服务端发送信息
		io.emit("time", nowObj);
	}
	setInterval(tick, 1000);
})