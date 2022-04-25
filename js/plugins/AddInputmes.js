//=============================================================================
// AddInputmes.js
//=============================================================================

/*:ja
 * @plugindesc ver1.00 キノコでもセリフ送りできるようになります。
 * @author まっつＵＰ
 *
 * @help
 * 
 * RPGで笑顔を・・・
 * 
 * このヘルプとパラメータの説明をよくお読みになってからお使いください。
 * 
 * イベントコマンド「文章の表示」による実行内容の
 * セリフ送りに方向キーが使えるようになります。
 * 
 * このプラグインを利用する場合は
 * readmeなどに「まっつＵＰ」の名を入れてください。
 * また、素材のみの販売はダメです。
 * 上記以外の規約等はございません。
 * もちろんツクールMVで使用する前提です。
 * 何か不具合ありましたら気軽にどうぞ。
 *  
 * 免責事項：
 * このプラグインを利用したことによるいかなる損害も制作者は一切の責任を負いません。
 * 
 */
 
 (function () {
    
//var parameters = PluginManager.parameters('AddInputmes');

Window_Message.prototype.isTriggered = function() {
    return (Input.isRepeated('ok') || Input.isRepeated('cancel') ||
            Input.isTriggered('down') || TouchInput.isRepeated());
};
 
})();
