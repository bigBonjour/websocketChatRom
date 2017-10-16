(function() {
	window.CHAT = {
		msgObj: document.getElementById("message"),
		userid: null,
		username: null,
		socket: null,
		//浏览器滚动条滚到最底部
		scrollBottom: function() {
			window.scrollTo(0, this.msgObj.clientHeight);
		},
		//退出
		logout: function() {
			this.socket.disconnect();
			location.reload();
		},
		//提交信息
		submit: function() {
			var content = document.getElementById("content").value;
			if(content != "") {
				var obj = {
					userid: this.userid,
					username: this.username,
					content: content
				}
				console.log(obj)
				//客户端发送消息到服务端
				this.socket.emit("message", obj);
				document.getElementById("content").value = "";
			}
			return false;
		},
		//回车发送
		enterSubmit: function() {
			document.onkeydown = function() {
				if(event.keyCode == 13) {
					document.getElementById("mjr_send").click();
					return false;
				}
			}

		},
		//用户id的唯一标识
		getUid: function() {
			return new Date().getTime() + Math.floor(Math.random() * 899 + 100);
		},
		//系统信息更新，用户退出时调用
		updateSysMsg: function(o, action) {
			//当前的在线用户列表
			var onlineUsers = o.onlineUsers;
			//当前在线的人数
			var onlineCount = o.onlineCount;
			//新加入的用户的信息
			var user = o.user;
			//更新在线人数
			var userHtml = "";
			var separator = "";
			var onlineCountWr = document.getElementById("onlinecount");
			var onlineusersWr = document.getElementById("onlineusers");
			for(key in onlineUsers) {
				if(onlineUsers.hasOwnProperty(key)) {
					userHtml += separator + onlineUsers[key];
					separator = "、";
				}
			}
			onlineusersWr.innerHTML = "在线用户列表:" + userHtml;
			onlineCountWr.innerHTML = "该聊天室一共有" + onlineCount + "人在线";
			//添加系统消息
			var sysHtml = "";
			sysHtml += '<div class="msg-system">';
			sysHtml += user.username;
			sysHtml += (action == "login") ? "加入了聊天室" : "退出了聊天室";
			sysHtml += "</div>";
			var section = document.createElement("section");
			section.className = "system J-mjrlinkWrap J-cutMsg";
			section.innerHTML = sysHtml;
			this.msgObj.appendChild(section);
			this.scrollBottom();
		},
		usernameSubmit: function() {
			var username = document.getElementById("username").value;
			if(username != "") {
				document.getElementById("username").value = "";
				document.getElementById("loginbox").style.display = "none";
				document.getElementById("chatbox").style.display = "block";
				this.init(username);
			}
			return false;
		},		
		//初始化
		init: function(username) {
			this.userid = this.getUid();
			this.username = username;
			document.getElementById("showusername").innerHTML = this.username;
			this.scrollBottom();
			//连接websocket后端服务器
			this.socket = io.connect();
			//客户端登录
			this.socket.emit('login', {
				userid: this.userid,
				username: this.username
			})
			//客户端监听登录
			this.socket.on("login", function(o) {
				CHAT.updateSysMsg(o, "login");
			});
			//客户端监听退出
			this.socket.on("logout", function(o) {
				CHAT.updateSysMsg(o, "logout");
				
			});
			//监听消息发送
			this.socket.on("message", function(obj) {
				//判断身份时候为自己
				var isme = (obj.userid === CHAT.userid) ? true : false;
				var contentDiv = '<div class="content">' + obj.content + '</div>';
				var usernameDiv = '<div class="name">' + obj.username + '</div>';
				var section = document.createElement("section");
				if(isme) {
					section.className = "user";
					section.innerHTML = usernameDiv + contentDiv;
				} else {
					section.className = "service";
					section.innerHTML = usernameDiv + contentDiv;
				}
				CHAT.msgObj.appendChild(section);
				CHAT.scrollBottom();
			})
			this.enterSubmit();			
			//客户端接受数据
			this.socket.on("time", function(nowObj) {
				var timeStr = "";
				timeStr += nowObj.year + "年";
				timeStr += nowObj.month <= 9 ? ("0" + nowObj.month) : nowObj.month;
				timeStr += "月";
				timeStr += nowObj.day <= 9 ? ("0" + nowObj.day) : nowObj.day;
				timeStr += "日  ";
				timeStr += nowObj.hour <= 9 ? ("0" + nowObj.hour) : nowObj.hour;
				timeStr += "时";
				timeStr += nowObj.minute <= 9 ? ("0" + nowObj.minute) : nowObj.minute;
				timeStr += "分";
				timeStr += nowObj.second <= 9 ? ("0" + nowObj.second) : nowObj.second;
				timeStr += "秒";
				document.getElementById("time").innerHTML = timeStr;
			})

		}
	};
})()