//===========================================================================
// Pon_StepSpeed.js
// ---------------------------------------------------------------------------
// Copyright (c) 2018 Ponpokoneruson
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ---------------------------------------------------------------------------
// 連絡先 ponpokonerusontanuki@gmail.com
//===========================================================================

/*:
 * @plugindesc 足踏みアニメの速度の変更を可能にします。
 * @author ぽんぽこねるそん
 *
 * @help
 * <使い方>
 *
 * 下記のプラグインコマンドか移動ルートの設定のスクリプトで実行してください。
 *
 * またイベントのメモ欄に<StepSpeed:n>と記述すると
 * そのイベントの足踏み速度の初期値がnになります。
 *
 * <プラグインコマンド>
 * StepSpeed chara_id speed
 *   chara_idのキャラクターの足踏みアニメ速度をspeedにします。
 * StepSpeedReset chara_id
 *   chara_idのキャラクターの足踏みアニメ速度を初期化します。
 *
 * <chara_id対応表>
 *   -1:プレイヤー
 *    0:このイベント(実行しているイベント)
 *   1~:イベントID
 *
 * speedは大きいほど足踏みアニメの速度が上がります。
 * (移動速度の影響を受けます)
 *
 * ex.プレイヤーの足踏みアニメの速度を5にする場合
 * StepSpeed -1 5
 * ex.イベントID3番のイベントの足踏みアニメの速度を-8にする場合
 * StepSpeed 3 -8
 * ex.このイベントの足踏みアニメの速度を初期化する場合
 * StepSpeedReset 0
 *
 * <移動ルートの設定>
 * this._stepSpeed = n;
 *   足踏み速度をnにします。
 *
 * this.initStepSpeed();
     足踏み速度を初期化します。
 *
 *
 * 足踏み速度はプレイヤーは保存されますが
 * イベントはマップを切り替えるたびに初期化されます。
 *
 * イベントの足踏み速度はページが変わっても引き継がれます。
 *
 * @param Player Step Anime
 * @type boolean
 * @on 許可
 * @off 不許可
 * @desc プレイヤーの足踏みアニメの許可状態の初期値です。
 * 許可 - 足踏みする     不許可 - 足踏みしない
 * @default false
 *
 * @param Player Default Step Speed
 * @desc プレイヤーの足踏みアニメの初期値です。
 * デフォルト: 0
 * @default 0
 *
 * Var 1.01 19/02/05        イベントに初期値を設定できるように
 */

var Liquidize = Liquidize || {};
Liquidize.Pon_StepSpeed = {};
Liquidize.Pon_StepSpeed.Parameters = PluginManager.parameters('Pon_StepSpeed');
Liquidize.Pon_StepSpeed.PlayerStepAnime = JSON.parse(Liquidize.Pon_StepSpeed.Parameters["Player Step Anime"]);
Liquidize.Pon_StepSpeed.PlayerDefaultStepSpeed = Number(Liquidize.Pon_StepSpeed.Parameters["Player Default Step Speed"]) || 0;

(function() {

    //===========================================================================
    // プラグインコマンドの追加
    //===========================================================================
    var _Game_Interpreter_pluginCommand =
            Game_Interpreter.prototype.pluginCommand;
    Game_Interpreter.prototype.pluginCommand = function(command, args) {
        _Game_Interpreter_pluginCommand.call(this, command, args);
        if (command === 'StepSpeed') {
            if (!this.character(args[0])) {return};
            this.character(args[0])._stepSpeed = Number(args[1]);
        }
        if (command === 'StepSpeedReset') {
            if (!this.character(args[0])) {return};
            this.character(args[0]).initStepSpeed();
        }
    };
    //===========================================================================
    // 足踏みアニメパラメータの追加
    //===========================================================================
    var _pon_initMembers = Game_CharacterBase.prototype.initMembers;
    Game_CharacterBase.prototype.initMembers = function() {
    _pon_initMembers.call(this);
    this._defaultStepSpeed = 0;
    this._stepSpeed = 0;
    };
    //===========================================================================
    // 足踏みアニメ速度初期化メソッド
    //===========================================================================
    Game_CharacterBase.prototype.initStepSpeed = function() {
        this._stepSpeed = this._defaultStepSpeed;
    };
    //===========================================================================
    // 足踏みアニメウェイトの変更
    //===========================================================================
    var _pon_animationWait = Game_CharacterBase.prototype.animationWait;
    Game_CharacterBase.prototype.animationWait = function() {
    return _pon_animationWait.call(this) - this._stepSpeed;

    };
    //===========================================================================
    // プレイヤー初期値の設定
    //===========================================================================
    var _pon_PlayerinitMembers = Game_Player.prototype.initMembers;
    Game_Player.prototype.initMembers = function() {
        _pon_PlayerinitMembers.call(this)
        this._stepAnime = Liquidize.Pon_StepSpeed.PlayerStepAnime;
        this._defaultStepSpeed = Liquidize.Pon_StepSpeed.PlayerDefaultStepSpeed;
        this.initStepSpeed();
        console.log(this._stepSpeed);
    };
    //===========================================================================
    // フォロワーとプレイヤーの足踏み速度の同期
    //===========================================================================
    var _pon_update = Game_Follower.prototype.update;
    Game_Follower.prototype.update = function() {
    _pon_update.call(this);
    this._stepSpeed = $gamePlayer._stepSpeed;
    };
    //===========================================================================
    // イベントの足踏み速度の初期値設定
    //===========================================================================
    var _ponGame_Eventinitialize = Game_Event.prototype.initialize
    Game_Event.prototype.initialize = function(mapId, eventId) {
        _ponGame_Eventinitialize.call(this, mapId, eventId)
        this._defaultStepSpeed = Number(this.event().meta.StepSpeed || 0);
        this._stepSpeed = this._defaultStepSpeed;
    };
})();
