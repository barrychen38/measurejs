/*
 * measure.js v1.0.0
 * 
 * https://github.com/Chen38/measurejs
 * 
 * convenient to measure unit like rem or px
 * 
 * enjoy it
 */

(function() {

	var root = this;
	
	var Measure = function(argus) {
		
		this._obj = document.querySelector(argus.target);
		this._width = argus.size;
		this._way = argus.way;
		this._isNavbar = argus.isNavbar;
		this._unit = argus.unit;
		this._radius = 2;
		this._left = 10;
		this._top = 10;
		this._color = '#FF5555';
		
		this._isNavbar ? this._navBarHeight = 128 : this._navBarHeight = 0;
		
		switch (this._unit) {
			case 'px':
				this._isHundred = 1;
				break;
			case 'rem':
				this._isHundred = 100;
				break;
			default:
				break;
		}

	}, p = Measure.prototype;

	var measrueShowData = document.createElement('div');
	measrueShowData.classList.add('data');
	measrueShowData.innerHTML = '<p><span class="p">top</span>: <span class="top"></span><br><span class="p">left</span>: <span class="left"></span></p>';

	document.body.appendChild(measrueShowData);

	var data = document.querySelector('.data'),
		top = document.querySelector('.top'),
		left = document.querySelector('.left');
	
	var dataOffsetWidth = data.offsetWidth,
		dataOffsetHeight = data.offsetHeight;
	
	// window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
	
	p.whichPhone = function() {
		
		var w = this._width;
		
		var viewport = document.createElement('meta');
		viewport.name = 'viewport';
		
		switch (w) {
			case 640:
				viewport.content = 'width=' + w + ',target-densitydpi=device-dpi,maximum-scale=1,user-scalable=no';
				this._iPhone = 5;
				this._height = 1136;
				break;
			case 750:
				viewport.content = 'width=' + w + ',target-densitydpi=device-dpi,maximum-scale=1,user-scalable=no';
				this._iPhone = 6;
				this._height = 1334;
				break;
			default:
				break;
		}
		
		document.getElementsByTagName('head')[0].appendChild(viewport);
		
	};
	
	p.createCanvas = function() {

		// confirm which phone to set canvas size
		this.whichPhone();
		
		var o = this._obj;
		this._canvas = document.createElement('canvas');
		this._canvas.width = this._width;
		this._canvas.height = this._height;
		this._canvas.style.width = this._width + 'px';
		this._canvas.style.height = this._height + 'px';
		this._canvas.id = 'measure';
		o.appendChild(this._canvas);
		
		// save image dom then return
		this._image = o.childNodes[1];
		o.childNodes[1].style.display = 'none';
		
	};
	
	p.checkPosition = function(sx, sy, px, py) {
		
		var endX = this._width - (2 * this._left + dataOffsetWidth),
			endY = this._height - (2 * this._top + dataOffsetHeight);
			
		var adjustPosX,
			adjustPosY;
		
		// touch end the right but not the bottom
		if (sx > endX && sy <= endY) {
			
			adjustPosX = sx - this._left - dataOffsetWidth;
			adjustPosY = py;
			
		}
		// touch end the bottom but not the right
		if (sy > endY && sx <= endX) {
			
			adjustPosX = px;
			adjustPosY = sy - this._top - dataOffsetHeight;
			
		}
		// touch both close to the right and bottom
		if (sx > endX && sy > endY) {
			
			adjustPosX = sx - this._left - dataOffsetWidth;
			adjustPosY = sy - this._top - dataOffsetHeight;
			
		}
		// touch both not close to the right and bottom
		if (sx <= endX && sy <= endY) {
			
			adjustPosX = px;
			adjustPosY = py;
			
		}
		// control close to the right
		if (adjustPosX + this._left + dataOffsetWidth >= this._width) {
			adjustPosX = this._width - this._left - dataOffsetWidth;
		}
		// control close to the left
		if (adjustPosX <= this._left) {
			adjustPosX = this._left;
		}
		// control close to the bottom
		if (adjustPosY + this._top + dataOffsetHeight >= this._height) {
			adjustPosY = this._height - this._left - dataOffsetHeight;
		}
		// control close to the top
		if (adjustPosY <= this._navBarHeight + this._top) {
			adjustPosY = this._navBarHeight + this._top;
		}
		
		return {
			x: adjustPosX,
			y: adjustPosY
		};
		
	};
	
	p.setStyle = function(obj, data) {
		obj.style.transform       =
		obj.style.webkitTransform = 'translate('+ data.x + 'px,' + data.y + 'px)';
	};
	
	p.keyControl = function(ctx, x, y) {
		
		/**
		 * keyCode
		 * 
		 * @left   => 37
		 * @top    => 38
		 * @right  => 39
		 * @bottom => 40
		 * 
		 * @w      => 87
		 * @a      => 65
		 * @s      => 83
		 * @d      => 68
		 */
		
		var s = this;

		var stepMove = 1,
			maxWidth = s._width,
			maxHeight = s._height,
			minWidth = 0,
			minHeight = 128;
		
		var controlX = x,
			controlY = y;

		var controlPosX = controlX + s._left,
			controlPosY = controlY + s._top,
			controlDataX = Math.round(controlX) / s._isHundred,
			controlDataY = Math.round(controlY - s._navBarHeight) / s._isHundred;
		
		var controlAdjustDataPos,
			isReapeating = false;
		
		var control = {
			moveLeft: function() {
				controlX -= stepMove;
				if (controlX <= minWidth) {
					controlX = minWidth;
				}
				controlPosX = controlX + s._left;
				controlAdjustDataPos = checkPosAndDraw(controlX, controlY);
				controlDataX = Math.round(controlAdjustDataPos.x) / s._isHundred;
			},
			moveUp: function() {
				controlY -= stepMove;
				if (controlY <= minHeight) {
					controlY = minHeight;
				}
				controlPosY = controlY + s._top;
				controlAdjustDataPos = checkPosAndDraw(controlX, controlY);
				controlDataY = Math.round(controlAdjustDataPos.y - s._navBarHeight) / s._isHundred;
			},
			moveRight: function() {
				controlX += stepMove;
				if (controlX >= maxWidth) {
					controlX = maxWidth;
				}
				controlPosX = controlX + s._left;
				controlAdjustDataPos = checkPosAndDraw(controlX, controlY);
				controlDataX = Math.round(controlAdjustDataPos.x) / s._isHundred;
			},
			moveDown: function() {
				controlY += stepMove;
				if (controlY >= maxHeight) {
					controlY = maxHeight;
				}
				controlPosY = controlY + s._top;
				controlAdjustDataPos = checkPosAndDraw(controlX, controlY);
				controlDataY = Math.round(controlAdjustDataPos.y - s._navBarHeight) / s._isHundred;
			}
		};
		
		document.body.onkeydown = function(event) {
			
			var keyCode = event.keyCode;
			// console.log(keyCode);
			
			switch (keyCode) {
				case 37:
				case 65:
					control.moveLeft();
					break;
				case 38:
				case 87:
					control.moveUp();
					break;
				case 39:
				case 68:
					control.moveRight();
					break;
				case 40:
				case 83:
					control.moveDown();
					break;
				default:
					break;
			}
			
			var controlAdjustPos = s.checkPosition(controlX, controlY, controlPosX, controlPosY);
			
			left.innerHTML = controlDataX + s._unit;
			
			if (x >= 0 && y >= s._navBarHeight) {
				
				top.innerHTML = controlDataY + s._unit;
				
				s.setStyle(data, controlAdjustPos);
				
			} else {
				
				top.innerHTML = 0 + s._unit;
				
				data.style.transform       =
				data.style.webkitTransform = 'translate(' + controlAdjustPos.x + 'px,' + (s._navBarHeight + s._top) + 'px)';
			}
			
		};
		
		document.body.onkeyup = function() {
			if (!isReapeating) {
				console.info(data.innerText);
			}
		};
		
		function checkPosAndDraw(x, y) {
			
			if (x >= maxWidth) {
				x = maxWidth;
			}
			if (x <= minWidth) {
				x = minWidth;
			}
			if (y <= minHeight) {
				y = minHeight;
			}
			if (y >= maxHeight) {
				y = maxHeight;
			}
			
			ctx.save();
			ctx.clearRect(0, 0, s._width, s._height);
			ctx.drawImage(s._image, 0, 0);
			ctx.beginPath();
			ctx.arc(x, y, s._radius, 0, 2 * Math.PI);
			ctx.fill();
			ctx.restore();
			
			return {
				x: x,
				y: y
			};
			
		}
		
	};
	
	p.measure = function() {
		
		var s = this;
		
		// draw image
		s.createCanvas();
		var ctx = s._canvas.getContext('2d');
		s._image.onload = function() {
			ctx.drawImage(s._image, 0, 0);
		};
		ctx.fillStyle = s._color;
		
		// measure
		s._canvas.addEventListener('touchstart', function(event) {
			// console.log(event);
			
			var x = event.touches[0].pageX,
				y = event.touches[0].pageY;
			// console.log('origin position: x:' + x + ' y:' + y);
			
			s.keyControl(ctx, x, y);
			
			ctx.clearRect(0, 0, s._width, s._height);
			ctx.drawImage(s._image, 0, 0);
			ctx.beginPath();
			
			var dataX = Math.round(x) / s._isHundred,
				dataY = Math.round(y - s._navBarHeight) / s._isHundred;
			// console.log('dataX: ' + dataX + ' dataY: ' + dataY);
			
			left.innerHTML = dataX + s._unit;
			
			var posX = s._left + x,
				posY = s._top + y;
			
			var adjustPos = s.checkPosition(x, y, posX, posY);
			
			if (x >= 0 && y >= s._navBarHeight) {
				
				ctx.arc(x, y, s._radius, 0, 2 * Math.PI);
				
				top.innerHTML = dataY + s._unit;
				
				s.setStyle(data, adjustPos);
				
			} else {
				
				top.innerHTML = 0 + s._unit;
				
				ctx.arc(x, s._navBarHeight, s._radius, 0, 2 * Math.PI);
				
				data.style.transform       =
				data.style.webkitTransform = 'translate(' + adjustPos.x + 'px,' + (s._navBarHeight + s._top) + 'px)';
			}
			
			data.style.opacity = 1;
			
			ctx.fill();
			
			console.info(data.innerText);
			
		}, false);
		
	};

	root.Measure = Measure;
	
})();