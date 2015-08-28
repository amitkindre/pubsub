var sub_key = "demo";
var pub_key = "demo";
var channel = "my_channel";

var event = require('events');
var eventEmitter = new event.EventEmitter();

var pubnub = require("pubnub")({
    ssl           : true,  // <- enable TLS Tunneling over TCP
    publish_key   : pub_key,
    subscribe_key : sub_key
});


var reconnectInterval;
var publishInterval;
var status = 0;
var count = 0;

var sub = function(){
	pubnub.subscribe({
		channel		:	channel,
		message		:	function(m){console.log(m);},
	//	timetoken	:	
		connect		:	function(){eventEmitter.emit('connected')},		//start publishing
		disconnect	:	function(){eventEmitter.emit('disconnected')},	//try to reconnect
		reconnect	:	function(){eventEmitter.emit('connected')},		//start publishing
		error		:	function(){eventEmitter.emit('disconnected')}	//try to reconnect
	});
}

var pub = function(){
	pubnub.publish({
		channel		:	channel,
		publish_key	:	pub_key,
		message		:	{"Count" : count},
		callback	:	function(m){console.log(m);count++;},
		error		:	function(){eventEmitter.emit('disconnected')},	//try to reconnect
	});
}

function reconnect(){
		clearInterval(publishInterval);
		if(!status){
			console.log('connecting...');
			reconnectInterval = setInterval(sub,1000);
			status = 1;
		}
		
}

function publish(){
	clearInterval(reconnectInterval);
	if(status){
		status = 0;
		console.log('connected');
		publishInterval = setInterval(pub,1000);
	}
}

eventEmitter.on('disconnected',reconnect);
eventEmitter.on('connected',publish);
eventEmitter.emit('disconnected');

