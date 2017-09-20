module.exports = function() {

	function EventEmitter() {
		this.events = {};
	}

	EventEmitter.prototype.on = function(type, callback) {
		if (!this.events[type]) {
			this.events[type] = [callback];
			return;
		}
		this.events[type].push(callback);
	}

	EventEmitter.prototype.off = function(type, callback) {
		var _events = this.events[type];
		if (!_events) {
			return;
		}
		var _len = _events.length;
		for (var i = 0; i < _len; i++) {
			if (_events[i] === callback) {
				_events[i] = null;
			}
		}
	}

	EventEmitter.prototype.trigger = function(type) {
		var self = this;
		var _events = this.events[type];
		if (!_events) {
			return;
		}
		var _len = _events.length;
		for (var i = 0; i < _len; i++) {
			if (_events[i]) {
				_events[i].apply(self, [].slice.call(arguments, 1));
			}
		}
	}

	return EventEmitter;

}
