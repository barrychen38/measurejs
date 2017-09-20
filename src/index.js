var Measure = require('./measure/measure');

(function(root, factory) {

	// CMD ? CMD : AMD ? AMD : root || window
	// typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() : typeof define === 'function' && define.amd ? define(factory) : root.Measure = factory();
	root.Measure = factory();

}(global, Measure));
