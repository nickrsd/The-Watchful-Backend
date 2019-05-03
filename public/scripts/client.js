
document.addEventListener("DOMContentLoaded", function(event) {

    //https://mighty-everglades-83549.herokuapp.com

    var socket = io()
    //var socket = io.connect('https://www.thewatchful.net:8000');
    //const ioClient = socket.connect("http://localhost:8000")

    //ioClient.on("seq-num", (msg) => console.info(msg))

    var el = document.getElementById('server-time');

    socket.on('connect', function(){
        alert("client connected")
        console.log("client connected")
    });

    socket.on('event', function(data){
        alert("event")
        console.log("got event")
        console.log(data)
    });

    socket.on('disconnect', function(){
        alert("disconnected")
        console.log("client disconnected")
    });

    socket.on('messages', function(data) {
        alert("received message")
        console.log("received message")
        console.log(data)
    });

    socket.on('time', function(timeString) {
        el.innerHTML = 'Server time: ' + timeString;
    });

});