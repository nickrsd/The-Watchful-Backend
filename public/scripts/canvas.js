
var joystick

var joysticks = {
	dynamic: {
		zone: document.querySelector('.zone.dynamic'),
		color: 'blue',
		multitouch: true
	},
	semi: {
		zone: document.querySelector('.zone.semi'),
		mode: 'semi',
		catchDistance: 150,
		color: 'white'
	},
	static: {
		zone: document.querySelector('.zone.static'),
		mode: 'static',
		position: {
		left: '50%',
		top: '50%'
		},
		color: 'red'
	}
};

function bindJoystick() {
	joystick.on('start end', function(evt, data) {
		console.log(data)
	}).on('move', function(evt, data) {
		console.log(data)
	}).on('dir:up plain:up dir:left plain:left dir:down ' +
			'plain:down dir:right plain:right',
			function(evt, data) {
		console.log(data)
	}).on('pressure', function(evt, data) {
		console.log(data)
	});
}

function createJoystick(evt) {
	var type = typeof evt === 'string' ?
		evt : evt.target.getAttribute('data-type');
	if (joystick) {
		joystick.destroy();
	}

	joystick = nipplejs.create(joysticks[type]);
	bindJoystick();
}

createJoystick('dynamic');
