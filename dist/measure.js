(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
var Measure = require('./measure/measure');

(function(root, factory) {

	// CMD ? CMD : AMD ? AMD : root || window
	// typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : root.Measure = factory();
	root.Measure = factory();

}(global, Measure));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./measure/measure":2}],2:[function(require,module,exports){
// require('../util/raf')();
var EventEmitter = require('../util/event')();
var editionMap = require('../util/map');

module.exports = function() {

	function Measure(options) {
		if (document.getElementById(options.target)) {
			this.target = document.getElementById(options.target);
		} else {
			throw new Error('target is required.');
		}

		if (typeof options.src !== 'undefined') {
			this.src = options.src;
		} else {
			throw new Error('src is required.');
		}

		if (typeof options.edition !== 'undefined') {
			this.edition = options.edition;
		} else {
			throw new Error('edition is required.');
		}

		if (typeof options.haveNavbar !== 'undefined') {
			this.haveNavbar = options.haveNavbar;
		} else {
			throw new Error('haveNavbar is required.');
		}

		this.resolution = {};
		this.unit = options.unit ? options.unit : 'px';
		this.lineColor = options.lineColor ? options.lineColor : '#DD4B39';
		this.enableKeyControl = options.enableKeyControl ? options.enableKeyControl : false;
		this.events = new EventEmitter();
	}

	Measure.prototype = (function() {

		var _head = document.getElementsByTagName('head')[0];
		// Canvas context
		var _cxt;
		var _image;
		var _lineColor;
		// Move step
		var _moveStep = 1;
		// Define the data rectangle size
		var _dataOffsetWidth = 250;
		var _dataOffsetHeight = 90;
		// Define the edge off the rectangle
		var _edgeLeft = 12;
		var _edgeTop = 12;
		var _multiple;
		// Contain 'x' and 'y'
		var _pointPosition = {};
		var _drawPosition = {};

		var _navbarHeight;
		var _width;
		var _height;
		var _minWidth = 0;
		var _minHeight;
		var _unit;

		var _isMeasuring = false;

		// Core Action
		function measure() {
			// Prevent add many events
			// Only init once
			if (_isMeasuring) {
				throw new Error('You already in measuring. Please use method measure() once.');
			}
			_isMeasuring = true;

			var self = this;

			self.resolution = editionMap[_lowerEditionCase(self.edition)];
			self.canvas = _initDraw(self.src, self.resolution);
			self.target.appendChild(self.canvas);

			_lineColor = self.lineColor;
			_width = self.resolution.width;
			_height = self.resolution.height;
			_unit = self.unit;
			_navbarHeight = _getNavbarHeight(self.haveNavbar);
			_minHeight = _navbarHeight;
			_multiple = _defineMultiple(self.unit);
			// Set default value
			_pointPosition.x = 0;
			_pointPosition.y = _minHeight;

			// Enable key control to measure
			if (self.enableKeyControl) {
				_addEvent(document.body, 'keydown', _keyPressDraw);
				_addEvent(document.body, 'keyup', function() {
					self.events.trigger('measure', Math.floor(_pointPosition.x / _multiple), Math.floor((_pointPosition.y - _navbarHeight) / _multiple));
				});
			}

			// Add touch event to measure
			_addEvent(self.canvas, 'touchstart', _touchDraw);
			_addEvent(self.canvas, 'touchend', function() {
				self.events.trigger('measure', Math.floor(_pointPosition.x / _multiple), Math.floor((_pointPosition.y - _navbarHeight) / _multiple));
			});

		}

		function _checkPosition(drawPosition) {

			var endX = _width - (2 * _edgeLeft + _dataOffsetWidth),
				endY = _height - (2 * _edgeTop + _dataOffsetHeight);

			var adjustPosX,
				adjustPosY;

			// Touch close the right but not the bottom
			if (drawPosition.x > endX && drawPosition.y <= endY) {
				adjustPosX = drawPosition.x - _edgeLeft - _dataOffsetWidth;
				adjustPosY = drawPosition.y + _edgeTop;
			}
			// Touch close the bottom but not the right
			if (drawPosition.y > endY && drawPosition.x <= endX) {
				adjustPosX = drawPosition.x + _edgeLeft;
				adjustPosY = drawPosition.y - _edgeTop - _dataOffsetHeight;
			}
			// Touch both close to the right and bottom
			if (drawPosition.x > endX && drawPosition.y > endY) {
				adjustPosX = drawPosition.x - _edgeLeft - _dataOffsetWidth;
				adjustPosY = drawPosition.y - _edgeTop - _dataOffsetHeight;
			}
			// Touch both not close to the right and bottom
			if (drawPosition.x <= endX && drawPosition.y <= endY) {
				adjustPosX = drawPosition.x + _edgeLeft;
				adjustPosY = drawPosition.y + _edgeTop;
			}

			// Control close to the right
			if (adjustPosX + _edgeLeft + _dataOffsetWidth >= _width) {
				adjustPosX = _width - _edgeLeft - _dataOffsetWidth;
			}
			// Control close to the left
			if (adjustPosX <= _edgeLeft) {
				adjustPosX = _edgeLeft;
			}
			// Control close to the bottom
			if (adjustPosY + _edgeTop + _dataOffsetHeight >= _height) {
				adjustPosY = _height - _edgeLeft - _dataOffsetHeight;
			}
			// Control close to the top
			if (adjustPosY <= _navbarHeight + _edgeTop) {
				adjustPosY = _navbarHeight + _edgeTop;
			}

			return {
				x: adjustPosX,
				y: adjustPosY
			};
		}

		/**
		 * When trigger the 'touchstart' event
		 * Should draw the cross lines and data rectangle both
		 */
		function _touchDraw(event) {
			var touchPoint = event.touches[0];
			_pointPosition.x = touchPoint.pageX;
			_pointPosition.y = touchPoint.pageY;

			if (_pointPosition.y <= _navbarHeight) {
				_pointPosition.y = _navbarHeight;
			}

			_drawPosition = _checkPosition(_pointPosition);

			_drawLinesAndRectangle();
		}

		/**
		 * When trigger the 'keydown' event
		 * Should draw the cross lines and data rectangle both
		 * Enabled by option 'enableKeyControl'
		 *
		 * key.top    = 38
		 * key.left   = 37
		 * key.bottom = 40
		 * key.right  = 39
		 *
		 * key.w      = 87
		 * key.a      = 65
		 * key.s      = 83
		 * key.d      = 68
		 */
		function _keyPressDraw(event) {
			var keyCode = event.keyCode;

			switch (keyCode) {
				case 38:
				case 87:
					_moveUp();
					break;
				case 37:
				case 65:
					_moveLeft();
					break;
				case 40:
				case 83:
					_moveDown();
					break;
				case 39:
				case 68:
					_moveRight();
					break;
				default:
					break;
			}

			_drawPosition = _checkPosition(_pointPosition);

			_drawLinesAndRectangle();
		}

		function _moveLeft() {
			_pointPosition.x -= _moveStep;
			if (_pointPosition.x <= _minWidth) {
				_pointPosition.x = _minWidth;
			}
		}

		function _moveUp() {
			_pointPosition.y -= _moveStep;
			if (_pointPosition.y <= _minHeight) {
				_pointPosition.y = _minHeight;
			}
		}

		function _moveRight() {
			_pointPosition.x += _moveStep;
			if (_pointPosition.x >= _width) {
				_pointPosition.x = _width;
			}
		}

		function _moveDown() {
			_pointPosition.y += _moveStep;
			if (_pointPosition.y >= _height) {
				_pointPosition.y = _height;
			}
		}

		function _drawLinesAndRectangle() {

			var rectLeft = _drawPosition.x;
			var rectTop = _drawPosition.y;

			var lineLeft = _pointPosition.x;
			var lineTop = _pointPosition.y;

			_cxt.clearRect(0, 0, _width, _height);
			_cxt.drawImage(_image, 0, 0);

			_cxt.strokeStyle = _lineColor;
			_cxt.lineWidth = 1;
			_cxt.beginPath();
			_cxt.moveTo(0, lineTop);
			_cxt.lineTo(_width, lineTop);
			_cxt.moveTo(lineLeft, 0);
			_cxt.lineTo(lineLeft, _height);
			_cxt.stroke();

			_cxt.strokeStyle = '#000000';
			_cxt.fillStyle = '#F1F1F1';
			_cxt.strokeRect(rectLeft, rectTop, _dataOffsetWidth, _dataOffsetHeight);
			_cxt.fillRect(rectLeft + 1, rectTop + 1, _dataOffsetWidth - 2, _dataOffsetHeight - 2);

			_cxt.font = '26px Menlo, Consolas';
			_cxt.fillStyle = '#6C76E1';
			_cxt.textBaseline = 'top';
			_cxt.fillText('left: ' + Math.floor(lineLeft / _multiple) + _unit + ';', rectLeft + 10, rectTop + 12);
			_cxt.fillText('top:  ' + Math.floor((lineTop - _navbarHeight) / _multiple) + _unit + ';', rectLeft + 10, rectTop + 48);
		}

		function _addEvent(el, type, fn) {
			el.addEventListener(type, fn, false);
		}

		function _getNavbarHeight(haveNavbar) {
			return haveNavbar ? 128 : 0;
		}

		function _lowerEditionCase(name) {
			return name.toLowerCase();
		}

		function _initDraw(src, resolution) {
			var style = document.createElement('style');
			style.innerHTML = 'html,body{width:100%;height:100%;margin:0;padding:0;overflow:hidden;}';
			_head.appendChild(style);

			var viewport = document.createElement('meta');
			viewport.name = 'viewport';
			viewport.content = 'width=' + resolution.width + ',target-densitydpi=device-dpi,maximum-scale=1,user-scalable=no';
			_head.appendChild(viewport);

			var canvas;

			canvas = document.createElement('canvas');
			canvas.width = resolution.width;
			canvas.height = resolution.height;

			canvas.style.width = resolution.width + 'px';
			canvas.style.height = resolution.height + 'px';
			canvas.style.display = 'block';

			_cxt = canvas.getContext('2d');

			_image = new Image();
			_image.onload = function() {
				var width = this.width;
				var height = this.height;
				_cxt.drawImage(_image, 0, 0);

				if (width !== resolution.width && height !== resolution.height) {
					throw new Error('You\'d better use the same image as your iPhone resolution.');
				}
			}
			_image.src = src;

			return canvas;
		}

		/**
		 * Calculate the position to use 'px' or 'rem'
		 */
		function _defineMultiple(unit) {
			var multiple;

			switch (unit) {
				case 'px':
					multiple = 1;
					break;
				case 'rem':
					multiple = 100;
					break;
				default:
					break;
			}

			return multiple;
		}

		return {
			measure: measure
		}

	}());

	return Measure;

}

},{"../util/event":3,"../util/map":4}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
var edition5 = {
	width: 640,
	height: 1136
};
var edition6 = {
	width: 750,
	height: 1334
};

module.exports = {
	'5': edition5,
	'5s': edition5,
	'se': edition5,
	'6': edition6,
	'6s': edition6,
	'7': edition6,
	'8': edition6
};

},{}]},{},[1]);
