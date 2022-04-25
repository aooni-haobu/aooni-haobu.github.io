//=============================================================================
// SNH_MessagePosition.js
//=============================================================================
 
/*:
 * @plugindesc Change something.
 * @author SotoNoHito
 *
 * @help OMG! Sory. I can not write a English. Because I am Japanese! 
 *
 * This plugin is released under the MIT License.
 */
 
/*:ja
 * @plugindesc メッセージの開始位置調整プラグイン
 * @author ガバチョ（そとの人）(http://www.star-write-dream.com)
 * @help プラグインコマンドはありません。
 * このプラグインはMITライセンスです。
 *  ----------------------------------------------------------------------------
 *
 * メッセージの開始位置を調整します。
 *
 * ----------------------------------------------------------------------------
 * パラメータ
 * 
 * ■choseiX（初期値:0）
 * メッセージ開始位置の横の調整値
 * 
 * ■choseiY（初期値:0）
 * メッセージ開始位置の縦の調整値
 * 
 * @param choseiX
 * @type number
 * @desc メッセージの横方向の調整値です。プラスで右へ、マイナスで左へ調整します。
 * @default 0
 *
 * @param choseiY
 * @type number
 * @desc メッセージの縦方向の調整値です。プラスで下へ、マイナスで上へ調整します。
 * @default 0
 *
 *
*/

(function() {

    var parameters = PluginManager.parameters('SNH_MessagePosition');
    var choseiX = Number(parameters['choseiX'] || 0);
    var choseiY = Number(parameters['choseiY'] || 0);

    var _Window_Message_newPage = Window_Message.prototype.newPage;
    Window_Message.prototype.newPage = function(textState) {
        _Window_Message_newPage.call(this, textState);
        textState.x += choseiX;
        textState.left += choseiX;
        textState.y += choseiY;
    };
    
})();


