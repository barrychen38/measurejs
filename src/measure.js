(function(root, factory) {

  // CMD ? CMD : AMD ? AMD : root || window
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : root.Measure = factory();

})(window, function() {

  /**
   * Deifne the RAF and CAF
   */
  // window.RAF = window.requestAnimationFrame ||
  //              window.webkitRequestAnimationFrame ||
  //              function(callback) {
  //                return window.setTimeout(callback, 1000 / 60);
  //              };

  // window.CAF = window.cancelAnimationFrame ||
  //              window.webkitCancelAnimationFrame ||
  //              window.webkitCancelRequestAnimationFrame ||
  //              window.clearTimeout;

  /**
   * Event Emitter Class
   *
   * // - on
   * // - off
   * // - trigger
   */
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

  /**
   * Measure Class
   */
  var edition5 = {
    width: 640,
    height: 1136
  };

  var edition6 = {
    width: 750,
    height: 1334
  };

  var editionMap = {
    '5': edition5,
    '5s': edition5,
    'se': edition5,
    '6': edition6,
    '6s': edition6,
    '7': edition6,
    '8': edition6
  };

  function Measure(options) {
    EventEmitter.call(this);

    // Check the four required options
    this.target = document.getElementById(options.target);
    if (!this.target) {
      throw new Error('target is required.');
    }

    this.src = options.src;
    if (!this.src) {
      throw new Error('src is required.');
    }

    this.edition = options.edition;
    if (!this.edition) {
      throw new Error('edition is required.');
    }

    this.haveNavbar = options.haveNavbar;
    if (!this.haveNavbar) {
      throw new Error('haveNavbar is required.');
    }

    this.resolution = {};

    // Set the dafault options
    this.unit = options.unit ? options.unit : 'px';
    this.lineColor = options.lineColor ? options.lineColor : '#DD4B39';
    this.enableKeyControl = options.enableKeyControl ? options.enableKeyControl : false;
  }

  // Inherit EventEmitter class
  Measure.prototype = new EventEmitter();
  Measure.prototype.constructor = Measure;

  Measure.prototype.measure = (function() {
    var head = document.getElementsByTagName('head')[0];

    // Canvas context
    var ctx;
    var image;
    var lineColor;

    // Move step
    var moveStep = 1;

    // Define the data rectangle size
    var dataOffsetWidth = 250;
    var dataOffsetHeight = 90;

    // Define the edge off the rectangle
    var edgeLeft = 12;
    var edgeTop = 12;
    var multiple;

    // Contain `x` and `y`
    var pointPosition = {};
    var drawPosition = {};

    var navbarHeight;
    var width;
    var height;
    var minWidth = 0;
    var minHeight;
    var unit;

    // Add a flag to prevent measure more than once
    var isMeasuring = false;

    function measure() {

      // Prevent add many events
      // Only init once
      if (isMeasuring) {
        throw new Error('You already in measuring. Please use method measure() once.');
      }
      isMeasuring = true;

      var self = this;

      self.resolution = editionMap[_lowerEditionCase(self.edition)];
      self.canvas = _initDraw(self.src, self.resolution);
      self.target.appendChild(self.canvas);

      lineColor = self.lineColor;
      width = self.resolution.width;
      height = self.resolution.height;
      unit = self.unit;
      navbarHeight = _getNavbarHeight(self.haveNavbar);
      minHeight = navbarHeight;
      multiple = _defineMultiple(self.unit);
      // Set default value
      pointPosition.x = 0;
      pointPosition.y = minHeight;

      // Enable key control to measure
      if (self.enableKeyControl) {
        _addEvent(document.body, 'keydown', _keyPressDraw);
        _addEvent(document.body, 'keyup', function() {
          self.trigger(
            'measure',
            Math.floor(pointPosition.x / multiple),
            Math.floor((pointPosition.y - navbarHeight) / multiple)
          );
        });
      }

      // Add touch event to measure
      _addEvent(self.canvas, 'touchstart', _touchDraw);
      _addEvent(self.canvas, 'touchend', function() {
        self.trigger(
          'measure',
          Math.floor(pointPosition.x / multiple),
          Math.floor((pointPosition.y - navbarHeight) / multiple)
        );
      });
    }

    function _checkPosition(drawPosition) {
      var endX = width - (2 * edgeLeft + dataOffsetWidth);
      var endY = height - (2 * edgeTop + dataOffsetHeight);

      var adjustPosX;
      var adjustPosY;

      // Touch close the right but not the bottom
      if (drawPosition.x > endX && drawPosition.y <= endY) {
        adjustPosX = drawPosition.x - edgeLeft - dataOffsetWidth;
        adjustPosY = drawPosition.y + edgeTop;
      }
      // Touch close the bottom but not the right
      if (drawPosition.y > endY && drawPosition.x <= endX) {
        adjustPosX = drawPosition.x + edgeLeft;
        adjustPosY = drawPosition.y - edgeTop - dataOffsetHeight;
      }
      // Touch both close to the right and bottom
      if (drawPosition.x > endX && drawPosition.y > endY) {
        adjustPosX = drawPosition.x - edgeLeft - dataOffsetWidth;
        adjustPosY = drawPosition.y - edgeTop - dataOffsetHeight;
      }
      // Touch both not close to the right and bottom
      if (drawPosition.x <= endX && drawPosition.y <= endY) {
        adjustPosX = drawPosition.x + edgeLeft;
        adjustPosY = drawPosition.y + edgeTop;
      }

      // Control close to the right
      if (adjustPosX + edgeLeft + dataOffsetWidth >= width) {
        adjustPosX = width - edgeLeft - dataOffsetWidth;
      }
      // Control close to the left
      if (adjustPosX <= edgeLeft) {
        adjustPosX = edgeLeft;
      }
      // Control close to the bottom
      if (adjustPosY + edgeTop + dataOffsetHeight >= height) {
        adjustPosY = height - edgeLeft - dataOffsetHeight;
      }
      // Control close to the top
      if (adjustPosY <= navbarHeight + edgeTop) {
        adjustPosY = navbarHeight + edgeTop;
      }

      return {
        x: adjustPosX,
        y: adjustPosY
      };
    }

    /**
     * When trigger the `touchstart` event
     * Should draw the cross lines and data rectangle both
     */
    function _touchDraw(event) {
      var touchPoint = event.touches[0];
      pointPosition.x = touchPoint.pageX;
      pointPosition.y = touchPoint.pageY;

      if (pointPosition.y <= navbarHeight) {
        pointPosition.y = navbarHeight;
      }

      drawPosition = _checkPosition(pointPosition);

      _drawLinesAndRectangle();
    }

    /**
     * When trigger the `keydown` event
     * Should draw the cross lines and data rectangle both
     * Enabled by option `enableKeyControl`
     *
     * // - key.top    = 38
     * // - key.left   = 37
     * // - key.bottom = 40
     * // - key.right  = 39
     *
     * // - key.w      = 87
     * // - key.a      = 65
     * // - key.s      = 83
     * // - key.d      = 68
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

      drawPosition = _checkPosition(pointPosition);

      _drawLinesAndRectangle();
    }

    function _moveLeft() {
      pointPosition.x -= moveStep;
      if (pointPosition.x <= minWidth) {
        pointPosition.x = minWidth;
      }
    }

    function _moveUp() {
      pointPosition.y -= moveStep;
      if (pointPosition.y <= minHeight) {
        pointPosition.y = minHeight;
      }
    }

    function _moveRight() {
      pointPosition.x += moveStep;
      if (pointPosition.x >= width) {
        pointPosition.x = width;
      }
    }

    function _moveDown() {
      pointPosition.y += moveStep;
      if (pointPosition.y >= height) {
        pointPosition.y = height;
      }
    }

    function _drawLinesAndRectangle() {
      var rectLeft = drawPosition.x;
      var rectTop = drawPosition.y;

      var lineLeft = pointPosition.x;
      var lineTop = pointPosition.y;

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(image, 0, 0);

      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, lineTop);
      ctx.lineTo(width, lineTop);
      ctx.moveTo(lineLeft, 0);
      ctx.lineTo(lineLeft, height);
      ctx.stroke();

      ctx.strokeStyle = '#000000';
      ctx.fillStyle = '#F1F1F1';
      ctx.strokeRect(rectLeft, rectTop, dataOffsetWidth, dataOffsetHeight);
      ctx.fillRect(rectLeft + 1, rectTop + 1, dataOffsetWidth - 2, dataOffsetHeight - 2);

      ctx.font = '26px Menlo, Consolas';
      ctx.fillStyle = '#6C76E1';
      ctx.textBaseline = 'top';
      ctx.fillText('left: ' + Math.floor(lineLeft / multiple) + unit + ';', rectLeft + 10, rectTop + 12);
      ctx.fillText('top:  ' + Math.floor((lineTop - navbarHeight) / multiple) + unit + ';', rectLeft + 10, rectTop + 48);
    }

    function _initDraw(src, resolution) {
      var style = document.createElement('style');
      style.innerHTML = 'html,body{width:100%;height:100%;margin:0;padding:0;overflow:hidden;}';
      head.appendChild(style);

      var viewport = document.createElement('meta');
      viewport.name = 'viewport';
      viewport.content = 'width=' + resolution.width + ',target-densitydpi=device-dpi,maximum-scale=1,user-scalable=no';
      head.appendChild(viewport);

      var canvas;

      canvas = document.createElement('canvas');
      canvas.width = resolution.width;
      canvas.height = resolution.height;

      canvas.style.width = resolution.width + 'px';
      canvas.style.height = resolution.height + 'px';
      canvas.style.display = 'block';

      ctx = canvas.getContext('2d');

      image = new Image();
      image.onload = function() {
        var _width = this.width;
        var _height = this.height;

        ctx.drawImage(image, 0, 0);
        this = null

        if (_width !== resolution.width && _height !== resolution.height) {
          throw new Error('You\'d better use the same image as your iPhone resolution.');
        }
      }
      image.src = src;

      return canvas;
    }

    /**
     * Calculate the position to use `px` or `rem`
     */
    function _defineMultiple(unit) {
      var _multiple;

      switch (unit) {
        case 'px':
          _multiple = 1;
          break;
        case 'rem':
          _multiple = 100;
          break;
        default:
          break;
      }

      return _multiple;
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

    return measure;
  })();

  return Measure;
});
