module.exports = function() {

	global.requestAnimationFrame =
		global.requestAnimationFrame ||
		global.webkitRequestAnimationFrame ||
		global.mozRequestAnimationFrame ||
		global.msRequestAnimationFrame ||
		global.oRequestAnimationFrame ||
		function(callback) {
			return global.setTimeout(callback, 1000 / 60);
		};

	global.cancelAnimationFrame =
		global.cancelAnimationFrame ||
		global.webkitCancelAnimationFrame || global.webkitCancelRequestAnimationFrame ||
		global.mozCancelAnimationFrame || global.mozCancelRequestAnimationFrame ||
		global.msCancelAnimationFrame || global.msCancelRequestAnimationFrame ||
		global.oCancelAnimationFrame || global.oCancelRequestAnimationFrame ||
		global.clearTimeout;

}
