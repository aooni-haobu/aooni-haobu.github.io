//=============================================================================
// AooniTokaigi.js
//=============================================================================

/*:
 * @plugindesc 闘会議用
 *
 */

(function() {
    
    //青鬼の速さを変える　どの青鬼かは画像で判定

    var _Game_Event_setupPage = Game_Event.prototype.setupPage;
    Game_Event.prototype.setupPage = function() {
        _Game_Event_setupPage.call(this);
        
        var vId = 0;
        switch (this._characterName) {
        case '!$ao': case '!$ao1':
            vId = 93; break;
        case '!$ao_mika':
            vId = 94; break;
        case '!$ao_takurou':
            vId = 95; break;
        case '!$ao_takesi':
            vId = 96; break;
        }
        if (vId) this._moveSpeed = $gameVariables.value(vId);
    };

})();
