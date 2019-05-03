CanvasGamepad.setup(
	{
		canvas:"controller",
		start:{name:"start", key:"b"},
		select:{name:"select", key:"v"},
		trace:true,
		debug:true,
		hint:true,
		buttons:[
			{name:"a", "key":"s"},
			{name:"b", "key":"a"},
			{name:"x", "key":"w"},
			{name:"y", "key":"q"}
		]      
	}
);
multikey.setup(CanvasGamepad.events, "qwasbv", true);

setInterval(
    function()
    {
        var map = CanvasGamepad.observe();
        console.log(new Date() + ":" + JSON.stringify(map));
        console.log("send to IP");
    }
    ,1000
);