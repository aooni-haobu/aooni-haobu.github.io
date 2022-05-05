//=============================================================================
// DebugAuto.js
//=============================================================================

/*:
 * @plugindesc F8コンソールを自動で出す(PC版のみ)
 * @author １１１
 *
 * @desc F8コンソールを自動で出す(PC版のみ)
 *
 * @help 
 */
(function() {
	if(Utils.isNwjs()){
		var current_window = require('nw.gui').Window.get();
	    current_window.showDevTools().moveTo(50, 50);
	    current_window.moveTo(800, 50);
	    current_window.focus();
    }
})();
