
document.addEventListener("DOMContentLoaded", function(event) {

    //https://mighty-everglades-83549.herokuapp.com

    var socket = io('localhost:8000/');
    //const ioClient = socket.connect("http://localhost:8000")

    //ioClient.on("seq-num", (msg) => console.info(msg))

    socket.on('connect', function(){
        console.log("client connected")
    });

    socket.on('event', function(data){
        console.log("got event")
        console.log(data)
    });

    socket.on('disconnect', function(){
        console.log("client disconnected")
    });

});