//=============================================================================
// global_d.js
//=============================================================================

/*:ja
 * @plugindesc グローバルスクリプト記述プラグインd
 * @author
 *
 * @help このプラグインには、プラグインコマンドはありません。
 *
 * MV移植の為のグローバルスクリプト記述プラグインです。
 *
 * @requiredAssets img/system/balloon
 * @requiredAssets img/system/buttonset
 * @requiredAssets img/system/damage
 * @requiredAssets img/system/gameover
 * @requiredAssets img/system/iconset
 * @requiredAssets img/system/loading
 * @requiredAssets img/system/shadow1
 * @requiredAssets img/system/shadow2
 * @requiredAssets img/system/states
 * @requiredAssets img/system/weapons1
 * @requiredAssets img/system/weapons2
 * @requiredAssets img/system/weapons3
 * @requiredAssets img/system/window
 *
 * @requiredAssets img/system/timer
 * @requiredAssets img/system/maishisutemua
 * @requiredAssets img/system/maishisutemub
 * @requiredAssets img/system/maishisutemuc
 * @requiredAssets img/system/shojikinhyoujiyou
 * @requiredAssets img/system/toumei
 * @requiredAssets audio/se/asaseidou
 * @requiredAssets audio/se/ashioto_020
 * @requiredAssets audio/se/ashioto_008
 * @requiredAssets audio/se/ashioto_005
 * @requiredAssets audio/se/houkihikou
 * @requiredAssets audio/se/ashioto_013
 * @requiredAssets audio/se/ashioto_011
 * @requiredAssets audio/se/ashioto_010
 * @requiredAssets audio/se/pikotsu
 * @requiredAssets audio/se/ashioto_003
 * @requiredAssets audio/se/ashioto_019
 * @requiredAssets audio/se/ashioto_014
 * @requiredAssets audio/se/ashioto_009
 * @requiredAssets audio/se/ashioto_006
 * @requiredAssets audio/se/ashioto_007
 * @requiredAssets audio/se/nakigoe
 * @requiredAssets audio/se/chontsu
 * @requiredAssets audio/se/ashioto_018
 * @requiredAssets audio/se/chutsu
 * @requiredAssets audio/se/asaseidou
 * @requiredAssets audio/se/ashioto_022
 * @requiredAssets audio/se/ashioto_012
  */

//タイマー２用
var $gameTimer2		= null;
//キー入力結果受け取り変数番号用
var $inputVarId		= 0;
//入力を許可するキー用(ビットごとに意味を持つ)
var $permitKey		= 0;
//ツクール2003ライクな場所移動した直後にマップイベントの位置交換をするための配列
var $swapEvent		= [];
//マップチップを一時的に交換していた場合、メニュー画面から戻ると初期化される不具合修正用配列
var $swapChip		= [];

//iOS端末判定
var $isIOS = navigator.userAgent.match(/(iPad|iPhone|iPod)/g) ? true : false;

//-----------------------------------------------------------------------------
/**
 * The static class that handles input data from the keyboard and gamepads.
 *
 * @class Input
 */

/**
 * A hash table to convert from a virtual key code to a mapped key name.
 *
 * @static
 * @property keyMapper
 * @type Object
 */

//キー操作をとりあえずゆめにっきと同じにする
Input.keyMapper = {

	13: 'ok',       // enter			○

	16: 'shift',    // shift			△

	17: 'control',  // control			△

	27: 'escape',   // escape			○

	32: 'ok',       // space			○

	33: 'pageup',   // pageup			△

	34: 'pagedown', // pagedown			△

	37: 'left',     // left arrow		○

	38: 'up',       // up arrow			○

	39: 'right',    // right arrow		○

	40: 'down',     // down arrow		○

	45: 'escape',   // insert			○

	88: 'escape',   // X				○

	67: 'escape',   // C				○

	88: 'escape',   // V				○

	66: 'escape',   // B				○

	78: 'escape',   // N				○

	90: 'ok',       // Z				○

	96: 'escape',   // numpad 0			○
	48:	'escape',	// 0

	97:	'one',		// numpad 1			○
	49:	'one',		// 1

	99:	'three',	// numpad 3			○
	51:	'three',	// 3

	101:'five',		// numpad 5			○
	53:	'five',		// 5

	105:'nine',		// numpad 9			○
	57:	'nine',		// 9

	120:'debug'    	// F9				△

};

//-----------------------------------------------------------------------------
// Sprite_Timer2
//
// The sprite for displaying the timer2.

function Sprite_Timer2() {
	this.initialize.apply(this, arguments);
}

Sprite_Timer2.prototype = Object.create(Sprite.prototype);
Sprite_Timer2.prototype.constructor = Sprite_Timer2;

Sprite_Timer2.prototype.initialize = function() {
	Sprite.prototype.initialize.call(this);
	this._seconds = 0;
	this._presentFrame 	= 0;	//現在のフレーム数を保持
	this.createBitmap();
	this.update();
};

Sprite_Timer2.prototype.createBitmap = function() {
//	this.bitmap = new Bitmap(96, 48);
	this.bitmap = new Bitmap(128, 48);
	this.bitmap.fontSize = 32;

	//タイマー用画像の読み込み
	this.timerBitmap = ImageManager.loadSystem('timer');
};

Sprite_Timer2.prototype.update = function() {
	Sprite.prototype.update.call(this);
	this.updateBitmap();
	this.updatePosition();
	this.updateVisibility();
};

//描画の更新
Sprite_Timer2.prototype.updateBitmap = function() {

	//30フレーム毎に描画更新を行う
	if(this._presentFrame !== Math.floor($gameTimer2._frames/30)){
		this._presentFrame = Math.floor($gameTimer2._frames/30);

		if (this._seconds !== $gameTimer2.seconds()) {
			this._seconds = $gameTimer2.seconds();
//			this.redraw();
		}
		this.redraw();

		//最後はこの値が来るのでここでタイマーを終了させる(非表示に)
		if($gameTimer2._frames == 29){
			//表示フラグが立っているならば非表示にするだけ。タイマー自体の更新の停止はフレームが０になった時
			if (!$gameTimer2._show) $gameTimer2._show = false;
		}
	}
};

Sprite_Timer2.prototype.redraw = function() {
	var text = this.timerText();
	var width = this.bitmap.width;
	var height = this.bitmap.height;
	this.bitmap.clear();

	//文字を切り出しながら描画する画像の計算をする
	for(var i=0; i<text.length; i++){
		var tmpStr = text.charAt(i);

		//":"の文字だった場合
		if(tmpStr == ":"){
			//奇数だった場合
			if(this._presentFrame % 2 == 1){
				this.bitmap.blt(this.timerBitmap, 24*10, 0, 24, 48, 24*i, 0, 24, 48);
			}
		}else if(tmpStr == "0" && ( i == 0 || i == 1 || i == 3 )){
			this.bitmap.blt(this.timerBitmap, 0, 0, 24, 48, 24*i, 0, 24, 48);
		//それ以外の場合
		}else{
			//数値に変換
			var tmpNum = parseInt(tmpStr, 10);
			this.bitmap.blt(this.timerBitmap, 24*(tmpNum+1), 0, 24, 48, 24*i, 0, 24, 48);
		}
	}
//	this.bitmap.drawText(text, 0, 0, width, height, 'center');
};

Sprite_Timer2.prototype.timerText = function() {
	var min = Math.floor(this._seconds / 60) % 60;
	var sec = this._seconds % 60;
	return min.padZero(2) + ':' + sec.padZero(2);
};

//タイマーの描画位置
Sprite_Timer2.prototype.updatePosition = function() {
	this.x = Graphics.width - this.bitmap.width;
};

Sprite_Timer2.prototype.updateVisibility = function() {
//	this.visible = $gameTimer2.isWorking();
	//表示/非表示の判別を違うメソッドに変更
	this.visible = $gameTimer2.isShow();
};


(function() {

	var windowBackColor = '#ffffff';			//メニュー画面等のウィンドウの背景色
	var windowBackAlpha = 1.0;					//メニュー画面等のウィンドウの背景色の透過度


//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																ImageManagerクラス																					//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	// 画像ファイル、強制小文字読み込み(システム画像のために用意)
	ImageManager.loadBitmap = function(folder, filename, hue, smooth) {
		filename = filename.toLowerCase();
		if (filename) {
			var path = folder + encodeURIComponent(filename) + '.png';
			var bitmap = this.loadNormalBitmap(path, hue || 0);
			bitmap.smooth = smooth;
			return bitmap;
		} else {
			return this.loadEmptyBitmap();
		}
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//															AudioManagerクラス																						//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	AudioManager.playSe = function(se) {
		if (se.name && se.name != "(OFF)" && se.name != "ashiotosuru-suru") {
			this._seBuffers = this._seBuffers.filter(function(audio) {
				return audio.isPlaying();
			});
			var buffer = this.createBuffer('se', se.name);
			this.updateSeParameters(buffer, se);
			buffer.play(false);
			this._seBuffers.push(buffer);
		} else if (se.name == "ashiotosuru-suru") {
			//足音が鳴らないところの場合他のSEが停止される問題回避
		} else {
			//名前が(なし)or(OFF)だった場合SEを止める(ツクール2003ライク)
			this.stopSe();
		}
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Weatherクラス																						//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	Weather.prototype.update = function() {
		//灰色被せ画像の更新をしない(opacity:0)
//		this._updateDimmer();
		this._updateAllSprites();
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																DataManagerクラス																					//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	var _DataManager_createGameObjects = DataManager.createGameObjects;
	DataManager.createGameObjects = function() {
		_DataManager_createGameObjects.call(this);

		$gameTimer2 = new Game_Timer();				//タイマー２追加
	};

	var _DataManager_makeSaveContents = DataManager.makeSaveContents;
	DataManager.makeSaveContents = function() {
		contents = _DataManager_makeSaveContents.call(this);

		contents.timer2 = $gameTimer2;				//タイマー２追加

		return contents;
	};

	var _DataManager_extractSaveContents = DataManager.extractSaveContents;
	DataManager.extractSaveContents = function(contents) {
		_DataManager_extractSaveContents.call(this, contents);

		$gameTimer2 = contents.timer2;				//タイマー２追加
	};

	//セーブファイルの最大数を返す
	DataManager.maxSavefiles = function() {
//		return 20;
		//セーブファイル数を15に変更
		return 15;
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Window_Messageクラス																				//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	Window_Message.prototype.initialize = function() {
		//メッセージウィンドウはすべて透明なので無理やり合わせる(文字のサイズは違う)
		var width = this.windowWidth() - 220;
		var height = this.windowHeight() + 50;
		var x = (Graphics.boxWidth - width) / 2;
		Window_Base.prototype.initialize.call(this, x, 0, width, height);
		this.openness = 0;
		this.initMembers();
		this.createSubWindows();
		this.updatePlacement();
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Game_Systemクラス																					//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	//スクロール固定/解除の実装
	var _Game_System_initialize = Game_System.prototype.initialize;
	Game_System.prototype.initialize = function() {
		_Game_System_initialize.call(this);

		//スクロール許可フラグ
		this._scrollEnabled = true;
	};

	Game_System.prototype.isScroll = function() {
		return this._scrollEnabled;
	};

	Game_System.prototype.setScroll = function(enabled) {
		this._scrollEnabled = enabled;
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Game_Eventクラス																					//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	var _Game_Event_initMembers = Game_Event.prototype.initMembers;
	Game_Event.prototype.initMembers = function() {
		_Game_Event_initMembers.call(this);

		//移動タイプ用の変数追加
		this._roundTrip = 2;			//下
	};

	var _Game_Event_clearPageSettings = Game_Event.prototype.clearPageSettings;
	Game_Event.prototype.clearPageSettings = function() {
		_Game_Event_clearPageSettings.call(this);

		//不透明度を初期化
		this.setOpacity(255);

		//移動タイプ用変数を初期化
		this._roundTrip = 2;			//下
	};

	var _Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
	Game_Event.prototype.setupPageSettings = function() {
		_Game_Event_setupPageSettings.call(this);

		//グラフィック半透明フラグのチェック
		if (this.page().image.translucent !== undefined && this.page().image.translucent) {
			this.setOpacity(128);
		}

		//移動タイプが「上下往復」または「左右往復」の初期の向きを見て移動する方向を決定する
		var dir = this.direction();
		//上下往復
		if (this._moveType === 4) {
			//向きが下ではない
			if (dir !== 2) {
				//向きが上
				if (dir === 8) {
					this._roundTrip = 8;
				//向きが左右
				} else {
					this._roundTrip = 2;
				}
			} else {
				this._roundTrip = 2;
			}
		//左右往復
		} else if (this._moveType === 5) {
			//向きが右ではない
			if (dir !== 6) {
				//向きが左
				if (dir === 4) {
					this._roundTrip = 4;
				//向きが上下
				} else {
					this._roundTrip = 6;
				}
			} else {
				this._roundTrip = 6;
			}
		}
	};

	var _Game_Event_page = Game_Event.prototype.page;
	Game_Event.prototype.page = function(pageId) {
		if(pageId == null){
			//本来のメソッドを呼び出す
			return _Game_Event_page.call(this);
		}

		return this.event().pages[pageId];
	};

	//行動頻度をツクール2003ライクにする
	Game_Event.prototype.stopCountThreshold = function() {
		return Math.pow(2, 8 - this.moveFrequency());
	};

	//イベントの自律移動更新
	Game_Event.prototype.updateSelfMovement = function() {
//		if (!this._locked && this.isNearTheScreen() &&
//				this.checkStop(this.stopCountThreshold())) {
		if (!this._locked && this.isNearTheScreen() &&
				this.checkStop(this.stopCountThreshold()) && !$gameMap.isEventRunning()) {
			switch (this._moveType) {
			case 1:
				this.moveTypeRandom();
				break;
			case 2:
				this.moveTypeTowardPlayer();
				break;
			case 3:
				this.moveTypeCustom();
				break;
			//往復(拡張)
			case 4: case 5:
				this.moveTypeStraightRoundTrip();
				break;
			//主人公から逃げる(拡張)
			case 6:
				this.moveTypeAwayFromPlayer();
				break;
			}
		}
	};

	//移動タイプ「往復」
	Game_Event.prototype.moveTypeStraightRoundTrip = function() {
		this.setMovementSuccess(this.canPass(this._x, this._y, this._roundTrip));
		if (this.isMovementSucceeded()) {
			this.setDirection(this._roundTrip);
			this._x = $gameMap.roundXWithDirection(this._x, this._roundTrip);
			this._y = $gameMap.roundYWithDirection(this._y, this._roundTrip);
			this._realX = $gameMap.xWithDirection(this._x, this.reverseDir(this._roundTrip));
			this._realY = $gameMap.yWithDirection(this._y, this.reverseDir(this._roundTrip));
			this.increaseSteps();
		} else {
			//進行不可なら方向転換して再度進めるか判定する
			this._roundTrip = this.reverseDir(this._roundTrip);
			this.moveStraight(this._roundTrip);
		}
	};
	//移動タイプ「主人公から逃げる」(カスタムルートで代用しているので必要はないが一応)
	Game_Event.prototype.moveTypeAwayFromPlayer = function() {
		if (this.isNearThePlayer()) {
			switch (Math.randomInt(6)) {
			case 0: case 1: case 2: case 3:
				this.moveAwayFromPlayer();
				break;
			case 4:
				this.moveRandom();
				break;
			case 5:
				this.moveForward();
				break;
			}
		} else {
			this.moveRandom();
		}
	};

	//出現条件
	Game_Event.prototype.meetsConditions = function(page) {
		var c = page.conditions;
		if (c.switch1Valid) {
			if (!$gameSwitches.value(c.switch1Id)) {
				return false;
			}
		}
		if (c.switch2Valid) {
			if (!$gameSwitches.value(c.switch2Id)) {
				return false;
			}
		}

		//変数判定を拡張
		if (c.variableValid) {
			//条件演算子判定
			switch (c.compareOperator) {
				//同値
				case 0:
					if ($gameVariables.value(c.variableId) != c.variableValue) {
						return false;
					}
					break;
				//以上
				case 1:
					if ($gameVariables.value(c.variableId) < c.variableValue) {
						return false;
					}
					break;
				//以下
				case 2:
					if ($gameVariables.value(c.variableId) > c.variableValue) {
						return false;
					}
					break;
				//より大きい
				case 3:
					if ($gameVariables.value(c.variableId) <= c.variableValue) {
						return false;
					}
					break;
				//より小さい
				case 4:
					if ($gameVariables.value(c.variableId) >= c.variableValue) {
						return false;
					}
					break;
				//以外
				case 5:
					if ($gameVariables.value(c.variableId) == c.variableValue) {
						return false;
					}
					break;
				//不明
				default:
					//元の条件判定を行う
					if ($gameVariables.value(c.variableId) < c.variableValue) {
						return false;
					}
					break;
			}
		}
		if (c.selfSwitchValid) {
			var key = [this._mapId, this._eventId, c.selfSwitchCh];
			if ($gameSelfSwitches.value(key) !== true) {
				return false;
			}
		}
		if (c.itemValid) {
			var item = $dataItems[c.itemId];
			if (!$gameParty.hasItem(item)) {
				return false;
			}
		}
		if (c.actorValid) {
			var actor = $gameActors.actor(c.actorId);
			if (!$gameParty.members().contains(actor)) {
				return false;
			}
		}

		//タイマー判定拡張
		if (c.timer) {
			if ($gameTimer._frames > c.timerSec * 60) {
//			if ($gameTimer.seconds() > c.timerSec) {
				return false;
			}
		}

		//タイマー２判定拡張
		if (c.timer2) {
			if ($gameTimer2._frames > c.timer2Sec * 60) {
//			if ($gameTimer2.seconds() > c.timer2Sec) {
				return false;
			}
		}

		return true;
	};

	//ロックされているかどうかを調べる
	Game_Event.prototype.isLocked = function() {
		return this._locked;
	};

	Game_Event.prototype.lock = function() {
		if (!this._locked) {
			//向き固定フラグを立てる
			this._dirLocked = true;
			//ツクール2003はコマンドがすぐ終わるイベントに関してはプレイヤーの方を振り向かないのでその処理
//			this._prelockDirection = this.direction();
//			this.turnTowardPlayer();
			this._locked = true;
		}
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Game_Mapクラス																						//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	var _Game_Map_initialize = Game_Map.prototype.initialize;
	Game_Map.prototype.initialize = function() {
		_Game_Map_initialize.call(this);

		//スクロール位置を元に戻す用
		this._scrBackDirection 	= 2;
		this._scrBackRest 		= 0;
	};

	//通行可能かチェック
	Game_Map.prototype.checkPassage = function(x, y, bit) {
		var flags = this.tilesetFlags();
		var tiles = this.allTiles(x, y);
		for (var i = 0; i < tiles.length; i++) {
			if (this.regionId(x,y) == 255)
				return true;			// [o] Passable ツクール2003と見た目同じにするため独自にリージョンIDが255のタイルについては通行可とする(最優先)

			var flag = flags[tiles[i]];
			if ((flag & 0x10) !== 0)
				if( i == tiles.length - 1){
//					return true;		// ツクール2003では下層チップにも☆を付けられたがツクールMVでは無理なのでツクール2003ライクにする(ここでtrueの判断をすると4方向の処理がおざなりになる)
				}else{
					continue;			// [*] No effect on passage
				}
			if ((flag & bit) === 0)   	// [o] Passable
				return true;
			if ((flag & bit) === bit) 	// [x] Impassable
				return false;
		}
		return false;
	};

	var _Game_Map_update = Game_Map.prototype.update;
	Game_Map.prototype.update = function(sceneActive) {
		_Game_Map_update.call(this, sceneActive);

		//イベント位置交換バッファに蓄積されていた場合(マップ移動後のイベントの位置交換のため)
		for (var i=0 ; i<$swapEvent.length ; i++) {
			this.swapEvent($swapEvent[i]);
		}
		//蓄積クリア
		$swapEvent = [];
	};

	//イベントのセットアップ後に蓄積されたイベントの位置交換を行う
	Game_Map.prototype.swapEvent = function(params) {
		var character = this.event(params[0]);
		if (character) {
			if (params[1] === 0) {  // Direct designation
				character.locate(params[2], params[3]);
			} else if (params[1] === 1) {  // Designation with variables
				var x = $gameVariables.value(params[2]);
				var y = $gameVariables.value(params[3]);
				character.locate(x, y);
			} else {  // Exchange with another event
				var character2 = this.event(params[2]);
				if (character2) {
					character.swap(character2);
				}
			}
			if (params[4] > 0) {
				character.setDirection(params[4]);
			}
		}
		return true;
	};

	Game_Map.prototype.updateInterpreter = function() {
		for (;;) {
			this._interpreter.update();
			if (this._interpreter.isRunning()) {
				//マップイベントだった場合、このタイミングでプレイヤーの方を向かせる
				var id = this._interpreter.eventId();
				if (id > 0) {
					//この時点ですでに次のタイミングでイベントが終了する場合でなければ(且つ向きロックフラグが定義及び立っていたら)
					if (this._events[id] && this._interpreter.currentCommand().code !== 0 && this._events[id]._dirLocked) {

						this._events[id]._prelockDirection = this._events[id].direction();
						this._events[id].turnTowardPlayer();

						//向き固定フラグを伏せる(一度の使用のみ)
						this._events[id]._dirLocked = false;
					}
				}
				return;
			}
			if (this._interpreter.eventId() > 0) {
				this.unlockEvent(this._interpreter.eventId());
				this._interpreter.clear();
			}
			if (!this.setupStartingEvent()) {
				return;
			}
		}
	};

	var _Game_Map_startScroll = Game_Map.prototype.startScroll;
	Game_Map.prototype.startScroll = function(direction, distance, speed) {
		_Game_Map_startScroll.call(this, direction, distance, speed);

		//スクロールバック用の値を準備
		switch(direction){
			//下
			case 2:
				this._scrBackDirection = 8;
				break;
			//左
			case 4:
				this._scrBackDirection = 6;
				break;
			//右
			case 6:
				this._scrBackDirection = 4;
				break;
			//上
			case 8:
				this._scrBackDirection = 2;
				break;
			//予期せぬ値
			default:
				this._scrBackDirection = 2;
				break;
		}
		this._scrBackRest = distance;
	};

	//スクロール位置を元に戻す
	Game_Map.prototype.startScrBack = function(speed) {
		this._scrollDirection 	= this._scrBackDirection;
		this._scrollRest 		= this._scrBackRest;
		this._scrollSpeed 		= speed;
	};

	//マップの設定
	var _Game_Map_setup = Game_Map.prototype.setup;
	Game_Map.prototype.setup = function(mapId) {
		_Game_Map_setup.call(this, mapId);

		//表示されているピクチャーを全て解放する(ツクール2003は別マップに移動するとピクチャーが削除される仕様らしいので)
		$gameScreen.eraseAllPicture();

		//ここで正解なのか分からないが画面のシェイクとフラッシュも終了しておく
		$gameScreen.repeatShake(false);
		$gameScreen.repeatFlash(false);

		//メニューが開けなくなる不具合を修正する(倉庫周りのマップのみ)
		if (this._mapId == 160 || this._mapId == 161 || this._mapId == 162) {
			//雪だるまがOFF
			if (!$gameSwitches.value(80)) {
				//椅子で移動中がOFF
				if (!$gameSwitches.value(154)) {
					//メニュー禁止をOFFにする
					$gameSystem.enableMenu();
				}
			}
		}
	};

	//自動実行されるコモンイベントを稼働させる
	Game_Map.prototype.setupAutorunCommonEvent = function() {
		for (var i = 0; i < $dataCommonEvents.length; i++) {
			var event = $dataCommonEvents[i];
//			if (event && event.trigger === 1 && $gameSwitches.value(event.switchId)) {
			if (event && event.trigger === 1) {

				//エディター上で作成したコモンイベントはプロパティをもっていないため従来と同じ処理
				if (event.switchFlag === undefined) {
					if ($gameSwitches.value(event.switchId)) {

						this._interpreter.setup(event.list);
						return true;
					}
				} else {
					//スイッチフラグが立っている
					if (event.switchFlag === true) {
						//スイッチ番号のフラグを見る
						if ($gameSwitches.value(event.switchId)) {

							this._interpreter.setup(event.list);
							return true;
						}
					//スイッチフラグが立っていない
					} else {
						//スイッチは使用しないのでコモンイベントをすぐさま実行に移す
						this._interpreter.setup(event.list);
						return true;
					}
				}
//				this._interpreter.setup(event.list);
//				return true;
			}
		}
		return false;
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Game_Screenクラス																					//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	Game_Screen.prototype.eraseAllPicture = function() {
		//戦闘中とか無視して全ピクチャーを削除する(ゆめにっきに戦闘はないので)
		for (var i=0 ; i<this._pictures.length ; i++) {
			this._pictures[i] = null;
		}
	};

	Game_Screen.prototype.updateFlash = function() {
		if (this._flashDuration > 0) {
			var d = this._flashDuration;
			this._flashColor[3] *= (d - 1) / d;
			this._flashDuration--;

			//フラッシュが終了した且つ繰り返しフラグが立っている場合
			if (this._flashRepeat && this._flashDuration === 0) {
				this._flashDuration = this._flashRepeatDuration;
				this._flashColor[3] = this._flashRepeatPower;
			}
		}
	};

	var _Game_Screen_clearFlash = Game_Screen.prototype.clearFlash;
	Game_Screen.prototype.clearFlash = function() {
		_Game_Screen_clearFlash.call(this);

		//繰り返しフラグと繰り返し用のフラッシュ記憶用のプロパティ追加
		this._flashRepeat 			= false;
		this._flashRepeatDuration 	= 0;
		this._flashRepeatPower 		= 0;
	};

	Game_Screen.prototype.repeatFlash = function(fRepeat) {
		this._flashRepeat = fRepeat;

		if (fRepeat) {
			//繰り返すために設定されたフラッシュ時間を記憶
			this._flashRepeatDuration 	= this._flashDuration;
			this._flashRepeatPower 		= this._flashColor[3];
		}
	}

	Game_Screen.prototype.updateShake = function() {
		if (this._shakeDuration > 0 || this._shake !== 0) {
			var delta = (this._shakePower * this._shakeSpeed * this._shakeDirection) / 10;
			if (this._shakeDuration <= 1 && this._shake * (this._shake + delta) < 0) {
				this._shake = 0;
			} else {
				this._shake += delta;
			}
			if (this._shake > this._shakePower * 2) {
				this._shakeDirection = -1;
			}
			if (this._shake < - this._shakePower * 2) {
				this._shakeDirection = 1;
			}

			//繰り返しフラグが立っている場合は更新しない
			if (!this._shakeRepeat) this._shakeDuration--;
//			this._shakeDuration--;
		}
	};

	var _Game_Screen_clearShake = Game_Screen.prototype.clearShake;
	Game_Screen.prototype.clearShake = function() {
		_Game_Screen_clearShake.call(this);

		//繰り返しフラグ
		this._shakeRepeat = false;
	};

	//シェイクを繰り返すかどうかのフラグを操作する
	Game_Screen.prototype.repeatShake = function(fRepeat) {
		this._shakeRepeat = fRepeat;
	}

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Game_CharacterBaseクラス																			//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	Game_CharacterBase.prototype.refreshBushDepth = function() {
		//ツクール2003にはタイルとキャラクターの重なりを綺麗に表現するために6ドットずらしたりする機能がないので
		//ファイルに"!"をつけて防いでいるために起こる問題回避
//		if (this.isNormalPriority() && !this.isObjectCharacter() &&
//				this.isOnBush() && !this.isJumping()) {
		if (this.isNormalPriority() && this.isOnBush() && !this.isJumping()) {
			if (!this.isMoving()) {
//				this._bushDepth = 12;
				//キャラクターの3分の1半透明
				this._bushDepth = 24;
			}
		} else {
			this._bushDepth = 0;
		}
	};

	//キャラクターのフラッシュ機能を実装
	var _Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
	Game_CharacterBase.prototype.initMembers = function() {
		_Game_CharacterBase_initMembers.call(this);

		this._flashColor 		= [];		//フラッシュの色
		this._flashDuration 	= 0;		//フラッシュ時間(フレーム単位)

		this._movePastFrequency	= 1;		//変更前の移動頻度保持用(移動ルートの設定拡張用)
		this._exFlag			= false;	//setMoveFrequencyEx()メソッド通過チェックフラグ
	};

	var _Game_CharacterBase_update = Game_CharacterBase.prototype.update;
	Game_CharacterBase.prototype.update = function() {
		_Game_CharacterBase_update.call(this);

		//フラッシュの更新
		this.updateFlash();
	};

	Game_CharacterBase.prototype.startFlash = function(flashColor, flashDuration) {
		this._flashColor 	= flashColor.clone();
		this._flashDuration = flashDuration;
	};

	Game_CharacterBase.prototype.isFlash = function() {
		return this._flashDuration > 0;
	};

	Game_CharacterBase.prototype.updateFlash = function() {
		if (this.isFlash()) {
			this._flashColor[3] = this._flashColor[3] * (this._flashDuration - 1) / this._flashDuration;
			this._flashDuration--;
		}
	};

	//前の移動頻度を保持して移動頻度を設定する(移動ルートの設定で頻度を変更された場合その分だけ変更する必要が本来はあるが、頻度を変更しているのがエンディング前だけなので無視)
	Game_CharacterBase.prototype.setMoveFrequencyEx = function(moveFrequency) {
		//Exを呼び出されたことを示すフラグを立てる
		this._exFlag = true;
		//今の設定を保持
		this._movePastFrequency = this._moveFrequency;
		//移動頻度設定
		this._moveFrequency 	= moveFrequency;
	};

	//移動速度
	Game_CharacterBase.prototype.distancePerFrame = function() {
		//微妙に違うけど仕方ない
//	    return Math.pow(2, this.realMoveSpeed()) / 256;
		return Math.pow(2, this.realMoveSpeed()) / 128;
	};

	//移動時のアニメーション速度
	Game_CharacterBase.prototype.animationWait = function() {
		//微妙に違うけど仕方ない
//	    return (9 - this.realMoveSpeed()) * 3;
		return Math.round((9 - this.realMoveSpeed()) * 1.8);
	};

	Game_CharacterBase.prototype.moveStraightJump = function(d) {
		this.setMovementSuccess(this.canPass(this._x, this._y, d));
		if (this.isMovementSucceeded()) {
			this.setDirection(d);
		} else {
			this.setDirection(d);
		}
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Game_Characterクラス																				//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	//定数マクロ的なのを用意
	Game_Character.JUMP_END            = 50;		//ジャンプ終了

	Game_Character.prototype.processMoveCommand = function(command) {
		var gc = Game_Character;
		var params = command.parameters;
		var dirFix = this.isDirectionFixed();		//向きの固定フラグを取得しておく
		switch (command.code) {
		case gc.ROUTE_END:
			this.processRouteEnd();

			//Ex通過フラグが立っていれば
			if (this._exFlag) {
				//移動頻度を元に戻す
				this._moveFrequency = this._movePastFrequency;
				//フラグを伏せる
				this._exFlag = false;
			}
			break;
		case gc.ROUTE_MOVE_DOWN:
			this.moveStraight(2);
			break;
		case gc.ROUTE_MOVE_LEFT:
			this.moveStraight(4);
			break;
		case gc.ROUTE_MOVE_RIGHT:
			this.moveStraight(6);
			break;
		case gc.ROUTE_MOVE_UP:
			this.moveStraight(8);
			break;
		case gc.ROUTE_MOVE_LOWER_L:
			this.moveDiagonally(4, 2);
			break;
		case gc.ROUTE_MOVE_LOWER_R:
			this.moveDiagonally(6, 2);
			break;
		case gc.ROUTE_MOVE_UPPER_L:
			this.moveDiagonally(4, 8);
			break;
		case gc.ROUTE_MOVE_UPPER_R:
			this.moveDiagonally(6, 8);
			break;
		case gc.ROUTE_MOVE_RANDOM:
			this.moveRandom();
			break;
		case gc.ROUTE_MOVE_TOWARD:
			this.moveTowardPlayer();
			break;
		case gc.ROUTE_MOVE_AWAY:
			this.moveAwayFromPlayer();
			break;
		case gc.ROUTE_MOVE_FORWARD:
			this.moveForward();
			break;
		case gc.ROUTE_MOVE_BACKWARD:
			this.moveBackward();
			break;
		case gc.ROUTE_JUMP:
			//現在のルートの参照番号を取得
			var index = this._moveRouteIndex;

			var fEnd= 0;		//ループから抜けるためのフラグ
			var x 	= 0;
			var y 	= 0;
			//ジャンプ終了が設置されているかどうか処理を進める
			while (true) {
				//次のルートのコマンドを参照するためにインクリメント
				index++;

				var tmpCommand = this._moveRoute.list[index];

				//次のルートのコマンドの内容によって処理を分ける
				switch (tmpCommand.code) {
				//下に移動
				case gc.ROUTE_MOVE_DOWN:
					this.moveStraightJump(2);

					if (this.isMovementSucceeded()) y++;

					break;
				//左に移動
				case gc.ROUTE_MOVE_LEFT:
					this.moveStraightJump(4);

					if (this.isMovementSucceeded()) x--;

					break;
				//右に移動
				case gc.ROUTE_MOVE_RIGHT:
					this.moveStraightJump(6);

					if (this.isMovementSucceeded()) x++;

					break;
				//上に移動
				case gc.ROUTE_MOVE_UP:
					this.moveStraightJump(8);

					if (this.isMovementSucceeded()) y--;

					break;
				//以下はゆめにっきでは使用していないため処理を作成しない
				//左下に移動
				case gc.ROUTE_MOVE_LOWER_L:
					break;
				//右下に移動
				case gc.ROUTE_MOVE_LOWER_R:
					break;
				//左上に移動
				case gc.ROUTE_MOVE_UPPER_L:
					break;
				//右上に移動
				case gc.ROUTE_MOVE_UPPER_R:
					break;
				//ランダムに移動
				case gc.ROUTE_MOVE_RANDOM:
					break;
				//プレイヤーに近付く
				case gc.ROUTE_MOVE_TOWARD:
					break;
				//プレイヤーから遠ざかる
				case gc.ROUTE_MOVE_AWAY:
					break;
				//一歩前進
				case gc.ROUTE_MOVE_FORWARD:
					break;
				//一歩後退
				case gc.ROUTE_MOVE_BACKWARD:
					break;
				//ジャンプ終了
				case gc.JUMP_END:
					fEnd = 1;

					//移動ルート参照番号もズラす
					this._moveRouteIndex = index;

					break;
				//移動ルートの設定の終端
				case gc.ROUTE_END:
					fEnd = 2;

					//ジャンプ終了がなかった場合はジャンプせずにそのまま進める

					break;
				}

				//「ジャンプ終了が存在」または「終端まで到達」した場合ループから抜ける
				if (fEnd) break;
			}

			//ジャンプ終了が存在した場合はジャンプをする
			if (fEnd !== 2) this.jump(x, y);

//			this.jump(params[0], params[1]);
			break;
		case gc.ROUTE_WAIT:
			this._waitCount = params[0] - 1;
			break;
		//〇方向を向く系はツクール2003では向きを固定していたとしても無視される仕様みたいなのでそちらの対応(開始)
		case gc.ROUTE_TURN_DOWN:
			this.setDirectionFix(false);
			this.setDirection(2);
			this.setDirectionFix(dirFix);
			break;
		case gc.ROUTE_TURN_LEFT:
			this.setDirectionFix(false);
			this.setDirection(4);
			this.setDirectionFix(dirFix);
			break;
		case gc.ROUTE_TURN_RIGHT:
			this.setDirectionFix(false);
			this.setDirection(6);
			this.setDirectionFix(dirFix);
			break;
		case gc.ROUTE_TURN_UP:
			this.setDirectionFix(false);
			this.setDirection(8);
			this.setDirectionFix(dirFix);
			break;
		case gc.ROUTE_TURN_90D_R:
			this.setDirectionFix(false);
			this.turnRight90();
			this.setDirectionFix(dirFix);
			break;
		case gc.ROUTE_TURN_90D_L:
			this.setDirectionFix(false);
			this.turnLeft90();
			this.setDirectionFix(dirFix);
			break;
		case gc.ROUTE_TURN_180D:
			this.setDirectionFix(false);
			this.turn180();
			this.setDirectionFix(dirFix);
			break;
		case gc.ROUTE_TURN_90D_R_L:
			this.setDirectionFix(false);
			this.turnRightOrLeft90();
			this.setDirectionFix(dirFix);
			break;
		case gc.ROUTE_TURN_RANDOM:
			this.setDirectionFix(false);
			this.turnRandom();
			this.setDirectionFix(dirFix);
			break;
		case gc.ROUTE_TURN_TOWARD:
			this.setDirectionFix(false);
			this.turnTowardPlayer();
			this.setDirectionFix(dirFix);
			break;
		case gc.ROUTE_TURN_AWAY:
			this.setDirectionFix(false);
			this.turnAwayFromPlayer();
			this.setDirectionFix(dirFix);
			break;
		//〇方向を向く系はツクール2003では向きを固定していたとしても無視される仕様みたいなのでそちらの対応(終了)
		case gc.ROUTE_SWITCH_ON:
			$gameSwitches.setValue(params[0], true);
			break;
		case gc.ROUTE_SWITCH_OFF:
			$gameSwitches.setValue(params[0], false);
			break;
		case gc.ROUTE_CHANGE_SPEED:
			this.setMoveSpeed(params[0]);
			break;
		case gc.ROUTE_CHANGE_FREQ:
			this.setMoveFrequency(params[0]);
			break;
		case gc.ROUTE_WALK_ANIME_ON:
			this.setWalkAnime(true);
			break;
		case gc.ROUTE_WALK_ANIME_OFF:
			this.setWalkAnime(false);
			break;
		case gc.ROUTE_STEP_ANIME_ON:
			this.setStepAnime(true);
			break;
		case gc.ROUTE_STEP_ANIME_OFF:
			this.setStepAnime(false);
			break;
		case gc.ROUTE_DIR_FIX_ON:
			this.setDirectionFix(true);
			break;
		case gc.ROUTE_DIR_FIX_OFF:
			this.setDirectionFix(false);
			break;
		case gc.ROUTE_THROUGH_ON:
			this.setThrough(true);
			break;
		case gc.ROUTE_THROUGH_OFF:
			this.setThrough(false);
			break;
		case gc.ROUTE_TRANSPARENT_ON:
			this.setTransparent(true);
			break;
		case gc.ROUTE_TRANSPARENT_OFF:
			this.setTransparent(false);
			break;
		case gc.ROUTE_CHANGE_IMAGE:
			this.setImage(params[0], params[1]);
			break;
		case gc.ROUTE_CHANGE_OPACITY:
			this.setOpacity(params[0]);
			break;
		case gc.ROUTE_CHANGE_BLEND_MODE:
			this.setBlendMode(params[0]);
			break;
		case gc.ROUTE_PLAY_SE:
			AudioManager.playSe(params[0]);
			break;
		case gc.ROUTE_SCRIPT:
			eval(params[0]);
			break;
		}
	};

	Game_Character.prototype.forceMoveRoute = function(moveRoute) {
		if (!this._originalMoveRoute) {
			this.memorizeMoveRoute();
		}

		//イベントコマンドの「移動ルートの設定」で設定する移動ルートの合間合間にウェイトを仕込む(moveRouteのコピーを作成して)
		moveRoute = this.insertWait(moveRoute);

		this._moveRoute = moveRoute;
		this._moveRouteIndex = 0;
		this._moveRouteForcing = true;
		this._waitCount = 0;
	};

	//移動ルートの内容をコピーする
	Game_Character.prototype.copyRoute = function(moveRoute) {

		var retRoute		= {};

		var gc				= Game_Character;

		//移動コマンドリスト
		retRoute.list		= [];
		for (var i=0 ; i<moveRoute.list.length ; i++) {

			var ret1 = {};

			ret1.code = moveRoute.list[i].code;

			if (moveRoute.list[i].code !== gc.ROUTE_END) {

				ret1.indent = moveRoute.list[i].indent;

				if (moveRoute.list[i].parameters !== undefined) {

					var ret2 = [];

					for (var j=0 ; j<moveRoute.list[i].parameters.length ; j++) {

						ret2[j] = moveRoute.list[i].parameters[j];
					}

					ret1.parameters = ret2;
				}
			}

			retRoute.list[i] = ret1;
		}
		//繰り返しフラグ
		retRoute.repeat		= moveRoute.repeat;
		//移動できない場合は飛ばすフラグ
		retRoute.skippable	= moveRoute.skippable;
		//完了までウェイトフラグ
		retRoute.wait		= moveRoute.wait;

		return retRoute;
	};

	//移動コマンドの合間にウェイトを仕込む
	Game_Character.prototype.insertWait = function(moveRoute) {

		//ウェイトを仕込む必要のある移動ルートコマンド配列
		var waitCheck 	= [1,2,3,4,5,6,7,8,9,10,11,12,13,16,17,18,19,20,21,22,23,24,25,26,50];

		var gc			= Game_Character;

		//キャラクターの移動頻度の設定からウェイトコマンドを作成する
		var wait 		= {};
		wait.code 		= 15;
		wait.parameters = [Game_Event.prototype.stopCountThreshold.call(this)];
		wait.indent 	= null;

		//moveRouteのコピーを作成する
		var retRoute	= this.copyRoute(moveRoute);

		//戻り値用
		var retList		= [];
		var retIndex	= 0;

		for (var i=0 ; i<retRoute.list.length ; i++) {

			retList[retIndex] = retRoute.list[i];
			retIndex++;

			if (waitCheck.indexOf(retRoute.list[i].code) >= 0) {
				retList[retIndex] = wait;
				retIndex++;
			}
		}

		retRoute.list = retList;

		//ウェイトコマンドを挿入した新しい移動ルートを返す
		return retRoute;
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Game_Playerクラス																					//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	Game_Player.prototype.update = function(sceneActive) {

		var lastScrolledX = this.scrolledX();
		var lastScrolledY = this.scrolledY();
		var wasMoving = this.isMoving();
		this.updateDashing();
		if (sceneActive) {
			this.moveByInput();
		}

		Game_Character.prototype.update.call(this);

		//スクロールの許可をチェック
		if ($gameSystem.isScroll()) {
			this.updateScroll(lastScrolledX, lastScrolledY);
		}
		this.updateVehicle();
		if (!this.isMoving()) {
			this.updateNonmoving(wasMoving);
		}
		this._followers.update();

		//▽以下足音処理
		if(!this._prevpattern){
			this._prevpattern = this.pattern();
		}

//		if(this._prevpattern != this.pattern() && !this.isInVehicle()){
		//ジャンプ中は足音を鳴らさないようにする
		if(this._prevpattern != this.pattern() && !this.isInVehicle() && !this.isJumping()){
			var tID = $gameMap.terrainTag(this._x, this._y);
			//音を鳴らす必要のない地形だった場合は無視
			if(tID != 0){
				if(this.pattern() != 1){
					var seObj = {"name":"ashiotosuru-suru","volume":90,"pitch":100 + (10 * this.pattern()),"pan":0};
					//地形タグによって音を鳴らす
					//ツクール2003は上層チップに対して地形タグが設定できなかったのでツクールMVでは上層チップに0を設定している(音を鳴らす必要がないタイルは0)
					switch(tID){
						//基本
						case 1:
							//モノ07のマップだけタイルセットのコンバートの都合上音を変える
							if ($gameMap.mapId() === 101) {
								seObj.name 	= "asaseidou";
								seObj.volume= 30;
								seObj.pitch = 100 + (10 * this.pattern());
								seObj.pan 	= 0;
							} else {
								seObj.name 	= "ashioto_020";
								seObj.volume= 40;
								seObj.pitch = 80 + (10 * this.pattern());
								seObj.pan 	= 0;
							}
							break;
						//水の上
						case 2:
							seObj.name 	= "ashioto_008";
							seObj.volume= 40;
							seObj.pitch = 100 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//ネオン
						case 3:
							seObj.name 	= "ashioto_005";
							seObj.volume= 60;
							seObj.pitch = 100 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//ほうき用
						case 4:
							seObj.name 	= "houkihikou";
							seObj.volume= 50;
							seObj.pitch = 100  + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//顔マット１
						case 5:
							seObj.name 	= "ashioto_013";
							seObj.volume= 50;
							seObj.pitch = 70 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//顔マット２
						case 6:
							seObj.name 	= "ashioto_013";
							seObj.volume= 50;
							seObj.pitch = 100 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//パネル１
						case 7:
							seObj.name 	= "ashioto_011";
							seObj.volume= 30;
							seObj.pitch = 100 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//パネル２
						case 8:
							seObj.name 	= "ashioto_010";
							seObj.volume= 50;
							seObj.pitch = 80 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//ブロック１
						case 9:
							seObj.name 	= "pikotsu";
							seObj.volume= 40;
							seObj.pitch = 130 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//足音無音
						case 10:
							break;
						//絨毯
						case 11:
							seObj.name 	= "ashioto_003";
							seObj.volume= 70;
							seObj.pitch = 100 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//生き物１
						case 12:
							seObj.name 	= "ashioto_019";
							seObj.volume= 40;
							seObj.pitch = 100 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//生き物２
						case 13:
							seObj.name 	= "ashioto_014";
							seObj.volume= 30;
							seObj.pitch = 100 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//生き物３
						case 14:
							seObj.name 	= "ashioto_009";
							seObj.volume= 50;
							seObj.pitch = 100 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//生き物４
						case 15:
							seObj.name 	= "ashioto_006";
							seObj.volume= 70;
							seObj.pitch = 50 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//生き物５
						case 16:
							seObj.name 	= "ashioto_007";
							seObj.volume= 40;
							seObj.pitch = 100 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//生き物６
						case 17:
							seObj.name 	= "nakigoe";
							seObj.volume= 50;
							seObj.pitch = 150 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//生き物７
						case 18:
							seObj.name 	= "chontsu";
							seObj.volume= 50;
							seObj.pitch = 50 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//動物１
						case 19:
							seObj.name 	= "ashioto_018";
							seObj.volume= 50;
							seObj.pitch = 100 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//動物２
						case 20:
							seObj.name 	= "chutsu";
							seObj.volume= 50;
							seObj.pitch = 60 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//浅瀬
						case 21:
							seObj.name 	= "asaseidou";
							seObj.volume= 30;
							seObj.pitch = 100 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//お面床
						case 22:
							seObj.name 	= "ashioto_022";
							seObj.volume= 40;
							seObj.pitch = 100 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						//空中床
						case 23:
							seObj.name 	= "ashioto_012";
							seObj.volume= 30;
							seObj.pitch = 150 + (10 * this.pattern());
							seObj.pan 	= 0;
							break;
						case 24:
							break;
						case 25:
							break;
						case 26:
							break;
						case 27:
							break;
						case 28:
							break;
						case 29:
							break;
						case 30:
							break;
					}
					AudioManager.playSe(seObj);
				}
			}
		}

		this._prevpattern = this.pattern();
	};

	//プレイヤーのダッシュ更新
	Game_Player.prototype.updateDashing = function() {
		if (this.isMoving()) {
			return;
		}
		if (this.canMove() && !this.isInVehicle() && !$gameMap.isDashDisabled()) {
			this._dashing = this.isDashButtonPressed() || $gameTemp.isDestinationValid();
			this._dashing = false;
		} else {
			this._dashing = false;
		}
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Game_CommonEventクラス																				//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	//並列実行されるコモンイベントのアクティブチェック
	Game_CommonEvent.prototype.isActive = function() {
		var event = this.event();
		//並列実行でスイッチ番号が0番だった場合、それはスイッチ関係なしに自動的に開始されるコモンイベント(ツクールMVは自動or並列のコモンイベントだと、絶対にスイッチが必要になるがツクール2003はスイッチの有無もパラメーターとしてあるので)
//		return event.trigger === 2 && $gameSwitches.value(event.switchId);
		if (event.trigger === 2) {

			//エディター上で作成したコモンイベントはプロパティをもっていないため従来と同じ処理
			if (event.switchFlag === undefined) {
				if ($gameSwitches.value(event.switchId)) {
					return true;
				}
			} else {
				//スイッチフラグが立っている
				if (event.switchFlag === true) {
					//スイッチ番号のフラグを見る
					if ($gameSwitches.value(event.switchId)) {
						return true;
					}
				//スイッチフラグが立っていない
				} else {
					return true;
				}
			}
		}

		return false;
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Game_Interpreterクラス																				//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	var _Game_Interpreter_clear = Game_Interpreter.prototype.clear;
	Game_Interpreter.prototype.clear = function() {
		_Game_Interpreter_clear.call(this);

		//プロパティ追加
		this._bufMove 	= [];		//移動ルートの設定蓄積用
		this._fWait0	= false;
	};

	Game_Interpreter.prototype.setup = function(list, eventId) {
		this.clear();
		this._mapId = $gameMap.mapId();
		this._eventId = eventId || 0;

		//ここで画像読み込み待ち用のコモンイベントを仕込む

		//listのコピーを作成する
		var copyList = JsonEx.parse(JsonEx.stringify(list));

		//ファミゲーのみ処理が重くなるのでjson直接編集(と思ったけどほぼ変わらない？)
//		if (this._mapId !== 155){
			for (var i = 0; i < copyList.length; i++){
				//とりあえずピクチャー表示コマンドのみ検知
				if (copyList[i].code === 231){
					//挿入するコマンドを作成する
					var command = {};
					command.code 		= 117;					//コモンイベント呼び出し
					command.indent 		= copyList[i].indent;	//インデントは同じ
					command.parameters 	= [384];				//画像読み込み待ち

					//挿入
					//最後尾だった場合(spliceで挿入できるか分からないので)
					if (i === copyList.length - 1){
						copyList.push(command);
					//それ以外
					}else{
						copyList.splice(i + 1, 0, command);
					}
				}
			}
//		}

		//this._list = list;
		this._list = copyList;
	};

	Game_Interpreter.prototype.updateWaitCount = function() {
		if (this._waitCount > 0) {
			this._waitCount--;
			return true;
		}

		return false;
	};

	//システムウィンドウの切り替え
	Game_Interpreter.prototype.winskinChange = function(skinName) {
		//デフォルトは「マイシステムa」にしておく(後々ローマ字小文字??)
		//応急処理
		if (skinName == "マイシステムa") {
			skinName = "maishisutemua";
		} else if (skinName == "マイシステムb") {
			skinName = "maishisutemub";
		} else if (skinName == "マイシステムc") {
			skinName = "maishisutemuc";
		} else if (skinName == "所持金表示用") {
			skinName = "shojikinhyoujiyou";
		} else if (skinName == "透明") {
			skinName = "toumei";
		}
		var skin = String(skinName || 'maishisutemua');

		//新しいプロパティを追加
		$gameSystem._winskinName = skin;

		//ウィンドウスキンを読み込み＆読み込み待ち
		ImageManager.loadSystem(skin);
		this.setWaitMode('image');
	};

	Game_Interpreter.prototype.terminate = function() {

		//移動ルートが蓄積されていた場合
		if (this._bufMove.length) {
			//実行する(ウェイトなし)
			this.moveRun(0);
		}

		//こっち宇宙船の布団がおかしくなる
//		this.moveRun(0);

		this._list = null;
		this._comments = '';
	};

	//マップのスクロール(改良) ツクール2003ライクな挙動を再現(ツクール2003はスクロールで同期する中心がズレるがさすがにそこまで再現はできていない)
	Game_Interpreter.prototype.mapScroll = function(direction, distance, speed, wait) {
		if (!$gameParty.inBattle()) {
			//マップスクロール中にマップスクロールのイベントが呼び出された場合
			if ($gameMap.isScrolling()) {
				//現在のスクロールが終わるまで次のイベント(スクロール)には進めないようになる
				this.setWaitMode('scroll');

				//蓄積された移動ルートの設定を実行する
				this.moveRun(0);

				return false;
			}

			//スクロール完了までウェイトフラグチェック
			if(wait){
				this.setWaitMode('scroll');

				//蓄積された移動ルートの設定を実行する
				this.moveRun(0);
			}

			//スクロール開始
			$gameMap.startScroll(direction, distance, speed);
		}
		return true;
	};

	//スクロール位置を元に戻す機能の実装
	Game_Interpreter.prototype.mapScrBack = function(speed, wait) {
		if (!$gameParty.inBattle()) {
			//マップスクロール中にマップスクロールのイベントが呼び出された場合
			if ($gameMap.isScrolling()) {
				//現在のスクロールが終わるまで次のイベント(スクロール)には進めないようになる
				this.setWaitMode('scroll');

				//蓄積された移動ルートの設定を実行する
				this.moveRun(0);

				return false;
			}

			//スクロール完了までウェイトフラグチェック
			if(wait){
				this.setWaitMode('scroll');

				//蓄積された移動ルートの設定を実行する
				this.moveRun(0);
			}

			//スクロールバック開始
			$gameMap.startScrBack(speed);
		}
		return true;
	};

	//キャラクターのフラッシュ
	Game_Interpreter.prototype.characterFlash = function(charId, color, duration, wait) {

		//対象のキャラクターのデータを取得
		character = this.character(charId);
		if(character){
			//フラッシュの設定
			character.startFlash(color, duration);
			//フラッシュ完了ウェイトフラグをチェック
			if(wait){
				//ウェイトの設定
				this.wait(duration);

				//蓄積された移動ルートの設定を実行する
				this.moveRun(0);
			}
		}
		return true;
	};

	//マップチップを置換する(そのマップにいる間だけ)
	Game_Interpreter.prototype.replaceMapChip = function(layer, srcId, dstId) {

		//現在のマップデータの取得
		var data	= $dataMap.data;
		var size	= $dataMap.width * $dataMap.height;

		//下層or上層で検索の場所を変える
		//下層
		if(layer == 0){
			for(var i=(size*0); i<(size*1)-1; i++){
				//置換元のIDがあれば
				if(data[i] == srcId){
					//置換先のIDで上書き
					data[i] = dstId;
				}
			}
		//上層
		}else if(layer == 1){
			for(var i=(size*2); i<(size*3)-1; i++){
				//置換元のIDがあれば
				if(data[i] == srcId){
					//置換先のIDで上書き
					data[i] = dstId;
				}
			}
		}

		//マップデータの更新(参照しているので必要なし)
//		$dataMap.data = data;

		//更新データの保持
		$swapChip = data.clone();

		return true;
	};

	//マップイベントを呼び出す
	Game_Interpreter.prototype.callMapEvent = function(eventId, pageId) {

		//エラーチェック(両方とも0の場合は現在のイベントorページになるので-1でチェックする)
		if(eventId < 0 || pageId < 0){
			return;
		}

		//イベントの取得
		var event = $gameMap.event(( eventId == 0 ? this._eventId : eventId ));
		//エラーチェック
		if(event == null){
			return;
		}
		//ページの取得
		var page = pageId == 0 ? event.page() : event.page(pageId-1);
		//エラーチェック
		if(page == null){
			return;
		}

//		this.setupChild(page.list, (this.isOnCurrentMap() ? eventId : 0 ));
		this.setupChild(page.list, (this.isOnCurrentMap() ? event._eventId : 0 ));

		return true;
	};

	Game_Interpreter.prototype.gameDataOperand = function(type, param1, param2) {
		switch (type) {
		case 0:  // Item
			return $gameParty.numItems($dataItems[param1]);
		case 1:  // Weapon
			return $gameParty.numItems($dataWeapons[param1]);
		case 2:  // Armor
			return $gameParty.numItems($dataArmors[param1]);
		case 3:  // Actor
			var actor = $gameActors.actor(param1);
			if (actor) {
				switch (param2) {
				case 0:  // Level
					return actor.level;
				case 1:  // EXP
					return actor.currentExp();
				case 2:  // HP
					return actor.hp;
				case 3:  // MP
					return actor.mp;
				default:    // Parameter
					if (param2 >= 4 && param2 <= 11) {
						return actor.param(param2 - 4);
					}
				}
			}
			break;
		case 4:  // Enemy
			var enemy = $gameTroop.members()[param1];
			if (enemy) {
				switch (param2) {
				case 0:  // HP
					return enemy.hp;
				case 1:  // MP
					return enemy.mp;
				default:    // Parameter
					if (param2 >= 2 && param2 <= 9) {
						return enemy.param(param2 - 2);
					}
				}
			}
			break;
		case 5:  // Character
			var character = this.character(param1);
			if (character) {
				switch (param2) {
				case 0:  // Map X
					return character.x;
				case 1:  // Map Y
					return character.y;
				case 2:  // Direction
					return character.direction();
				case 3:  // Screen X
					return character.screenX();
				case 4:  // Screen Y
					return character.screenY();
				}
			}
			break;
		case 6:  // Party
			actor = $gameParty.members()[param1];
			return actor ? actor.actorId() : 0;
		case 7:  // Other
			switch (param1) {
			case 0:  // Map ID
				return $gameMap.mapId();
			case 1:  // Party Members
				return $gameParty.size();
			case 2:  // Gold
				return $gameParty.gold();
			case 3:  // Steps
				return $gameParty.steps();
			case 4:  // Play Time
				return $gameSystem.playtime();
			case 5:  // Timer
				//タイマー１orタイマー２(拡張:param2を使用する)ゆめにっきでは使用されていないしツクール2003の仕様と合っているのか未検証
				//タイマー１
				if (param2 === 0) {
					return $gameTimer.seconds();
				//タイマー２
				} else if (param2 === 1) {
					return $gameTimer2.seconds();
				}
//				return $gameTimer.seconds();
			case 6:  // Save Count
				return $gameSystem.saveCount();
			case 7:  // Battle Count
				return $gameSystem.battleCount();
			case 8:  // Win Count
				return $gameSystem.winCount();
			case 9:  // Escape Count
				return $gameSystem.escapeCount();
			}
			break;
		}
		return 0;
	};

	// Show Text
	Game_Interpreter.prototype.command101 = function() {
		if (!$gameMessage.isBusy()) {
			$gameMessage.setFaceImage(this._params[0], this._params[1]);
			$gameMessage.setBackground(this._params[2]);
			$gameMessage.setPositionType(this._params[3]);
			while (this.nextEventCode() === 401) {  // Text data

				//蓄積された移動ルートの設定を実行する
				this.moveRun(0);

				this._index++;
				$gameMessage.add(this.currentCommand().parameters[0]);
			}
			switch (this.nextEventCode()) {
			case 102:  // Show Choices
				this._index++;
				this.setupChoices(this.currentCommand().parameters);
				break;
			case 103:  // Input Number
				this._index++;
				this.setupNumInput(this.currentCommand().parameters);
				break;
			case 104:  // Select Item
				this._index++;
				this.setupItemChoice(this.currentCommand().parameters);
				break;
			}
			this._index++;
			this.setWaitMode('message');
		}
		return false;
	};

	// Conditional Branch
	Game_Interpreter.prototype.command111 = function() {
		var result = false;
		switch (this._params[0]) {
		case 0:  // Switch
			result = ($gameSwitches.value(this._params[1]) === (this._params[2] === 0));
			break;
		case 1:  // Variable
			var value1 = $gameVariables.value(this._params[1]);
			var value2;
			if (this._params[2] === 0) {
				value2 = this._params[3];
			} else {
				value2 = $gameVariables.value(this._params[3]);
			}
			switch (this._params[4]) {
			case 0:  // Equal to
				result = (value1 === value2);
				break;
			case 1:  // Greater than or Equal to
				result = (value1 >= value2);
				break;
			case 2:  // Less than or Equal to
				result = (value1 <= value2);
				break;
			case 3:  // Greater than
				result = (value1 > value2);
				break;
			case 4:  // Less than
				result = (value1 < value2);
				break;
			case 5:  // Not Equal to
				result = (value1 !== value2);
				break;
			}
			break;
		case 2:  // Self Switch
			if (this._eventId > 0) {
				var key = [this._mapId, this._eventId, this._params[1]];
				result = ($gameSelfSwitches.value(key) === (this._params[2] === 0));
			}
			break;
		case 3:  // Timer
			//タイマー1orタイマー２(拡張:パラメーター[3]を使用する)
			//タイマー１
			if ( this._params[3] === undefined || this._params[3] === 0){
				if ($gameTimer.isWorking()) {
					if (this._params[2] === 0) {
//						result = ($gameTimer.seconds() >= this._params[1]);
						result = ($gameTimer._frames >= this._params[1] * 60);
					} else {
//						result = ($gameTimer.seconds() <= this._params[1]);
						result = ($gameTimer._frames <= this._params[1] * 60);
					}
				}
			//タイマー２
			} else if (this._params[3] === 1){
				if ($gameTimer2.isWorking()) {
					if (this._params[2] === 0) {
//						result = ($gameTimer2.seconds() >= this._params[1]);
						result = ($gameTimer2._frames >= this._params[1] * 60);
					} else {
//						result = ($gameTimer2.seconds() <= this._params[1]);
						result = ($gameTimer2._frames <= this._params[1] * 60);
					}
				}
			}
			break;
		case 4:  // Actor
			var actor = $gameActors.actor(this._params[1]);
			if (actor) {
				var n = this._params[3];
				switch (this._params[2]) {
				case 0:  // In the Party
					result = $gameParty.members().contains(actor);
					break;
				case 1:  // Name
					result = (actor.name() === n);
					break;
				case 2:  // Class
					result = actor.isClass($dataClasses[n]);
					break;
				case 3:  // Skill
					result = actor.isLearnedSkill(n);
					break;
				case 4:  // Weapon
					result = actor.hasWeapon($dataWeapons[n]);
					break;
				case 5:  // Armor
					result = actor.hasArmor($dataArmors[n]);
					break;
				case 6:  // State
					result = actor.isStateAffected(n);
					break;
				}
			}
			break;
		case 5:  // Enemy
			var enemy = $gameTroop.members()[this._params[1]];
			if (enemy) {
				switch (this._params[2]) {
				case 0:  // Appeared
					result = enemy.isAlive();
					break;
				case 1:  // State
					result = enemy.isStateAffected(this._params[3]);
					break;
				}
			}
			break;
		case 6:  // Character
			var character = this.character(this._params[1]);
			if (character) {
				result = (character.direction() === this._params[2]);
			}
			break;
		case 7:  // Gold
			switch (this._params[2]) {
			case 0:  // Greater than or equal to
				result = ($gameParty.gold() >= this._params[1]);
				break;
			case 1:  // Less than or equal to
				result = ($gameParty.gold() <= this._params[1]);
				break;
			case 2:  // Less than
				result = ($gameParty.gold() < this._params[1]);
				break;
			}
			break;
		case 8:  // Item
			result = $gameParty.hasItem($dataItems[this._params[1]]);

			//「持っていない」が条件だった場合
			if ( this._params[2] !== undefined && this._params[2] === 1 ) {
				//結果を反転させる
				result = !result;
			}
			break;
		case 9:  // Weapon
			result = $gameParty.hasItem($dataWeapons[this._params[1]], this._params[2]);
			break;
		case 10:  // Armor
			result = $gameParty.hasItem($dataArmors[this._params[1]], this._params[2]);
			break;
		case 11:  // Button
			result = Input.isPressed(this._params[1]);
			break;
		case 12:  // Script
			result = !!eval(this._params[1]);
			break;
		case 13:  // Vehicle
			result = ($gamePlayer.vehicle() === $gameMap.vehicle(this._params[1]));
			break;
		}
		this._branch[this._indent] = result;
		if (this._branch[this._indent] === false) {
			this.skipBranch();
		}
		return true;
	};

	// Common Event
	Game_Interpreter.prototype.command117 = function() {
		var commonEvent = $dataCommonEvents[this._params[0]];
		if (commonEvent) {
			var eventId = this.isOnCurrentMap() ? this._eventId : 0;
			this.setupChild(commonEvent.list, eventId, this._params[0]);
		}
		return true;
	};

	//コモンイベント番号も渡せるように拡張
	var _Game_Interpreter_setupChild = Game_Interpreter.prototype.setupChild;
	Game_Interpreter.prototype.setupChild = function(list, eventId, commonEventId) {
		this._childInterpreter = new Game_Interpreter(this._depth + 1);
		this._childInterpreter.setup(list, eventId);

		//コモンイベント番号チェック
		if (commonEventId !== undefined && (commonEventId === 380 || commonEventId === 381)) {
			//プロパティ追加
			this._childInterpreter._inputVarId 	= $inputVarId;		//キー入力結果受け取り変数番号
			this._childInterpreter._permitKey 	= $permitKey;		//入力を許可するキー管理
		}

		//自律移動関係のためにコモンイベント番号チェック
		if (commonEventId === 380 || commonEventId === 382) {

			//蓄積された移動ルートの設定を実行する
			this.moveRun(0);
		}
	};

	// Control Switches
	Game_Interpreter.prototype.command121 = function() {
		for (var i = this._params[0]; i <= this._params[1]; i++) {
			//反転する場合の処理を拡張
			$gameSwitches.setValue(i, this._params[2] === 2 ? !$gameSwitches.value(i) : this._params[2] === 0);
		}
		return true;
	};

	// Control Variables(command122)を改造(引数を渡せるようにしておく)
	Game_Interpreter.prototype.ctrlVar = function(param) {
		var value = 0;
		switch (params[3]) {  // Operand
		case 0:  // Constant
			value = params[4];
			break;
		case 1:  // Variable
			value = $gameVariables.value(params[4]);
			break;
		case 2:  // Random
			value = params[4] + Math.randomInt(params[5] - params[4] + 1);
			break;
		case 3:  // Game Data
			value = this.gameDataOperand(params[4], params[5], params[6]);
			break;
		case 4:  // Script
			value = eval(params[4]);
			break;
		}
		for (var i = params[0]; i <= params[1]; i++) {
			this.operateVariable(i, params[2], value);
		}
		return true;
	};

	// Control Timer(このイベントコマンドは使用ダメ)
	Game_Interpreter.prototype.command124 = function() {
		//タイマー１orタイマー２(拡張:_params[2]を使用する)
		//タイマー１
		if (this._params[2] === undefined || this._params[2] === 0) {
			if (this._params[0] === 0) {  // Start
				$gameTimer.start(this._params[1] * 60);
			} else {  // Stop
				$gameTimer.stop();
			}
		//タイマー２
		} else if (this._params[2] === 1) {
			if (this._params[0] === 0) {  // Start
				$gameTimer2.start(this._params[1] * 60);
			} else {  // Stop
				$gameTimer2.stop();
			}
		}
		return true;
	};

	// Set Event Location
	Game_Interpreter.prototype.command203 = function() {
		var character = this.character(this._params[0]);
		if (character) {
			if (this._params[1] === 0) {  // Direct designation
				character.locate(this._params[2], this._params[3]);
			} else if (this._params[1] === 1) {  // Designation with variables
				var x = $gameVariables.value(this._params[2]);
				var y = $gameVariables.value(this._params[3]);
				character.locate(x, y);
			} else {  // Exchange with another event
				var character2 = this.character(this._params[2]);
				if (character2) {
					character.swap(character2);
				}
			}
			if (this._params[4] > 0) {
				character.setDirection(this._params[4]);
			}
		} else {
			//指定イベントが「このイベント」だった場合
			if (this._params[0] === 0) {
				this._params[0] = this._eventId;
			}
			//処理内容がイベントの位置交換且つ指定イベントが「このイベント」だった場合
			if (this._params[1] === 2 && this._params[2] === 0) {
				this._params[2] = this._eventId;
			}
			//パラメーターを確保(マップ移動後に一括で交換するため)
			$swapEvent.push(this._params);
		}
		return true;
	};

	// Set Movement Route
	Game_Interpreter.prototype.command205 = function() {
		//大きな改良
		//ツクール2003ライクにするために移動ルートの設定時には移動せずに全実行のイベントを待つようにする
		//今回の移動ルートの設定の内容を蓄積
		this._bufMove.push(this._params);

		return true;
	};

	//移動ルートの全実行(param...0:ウェイトなし 1:ウェイトあり)
	Game_Interpreter.prototype.moveRun = function(param) {
		$gameMap.refreshIfNeeded();

		//蓄積した全ての移動ルートに対して処理を行う
		for (var i=0 ; i<this._bufMove.length ; i++) {
			this._character = this.character(this._bufMove[i][0]);

			if (this._character) {
				this._character.forceMoveRoute(this._bufMove[i][1]);

				//ウェイトあり且つ蓄積した最後の移動ルートの場合(最後にしなかったら途中途中で移動ルートが止まってしまうため)
				if (param && i == this._bufMove.length - 1) {
					this.setWaitMode('route');
				}
			}
		}

		//蓄積されていなくともウェイトありで渡された場合
		if (this._bufMove.length === 0) {
			if (param === 1) {
				if (this._character) {
					this.setWaitMode('route');

					//自律移動は…
				}
			}
		}

		//蓄積した移動ルートの設定をクリアする
		this._bufMove = [];

		return true;
	};

	//移動ルートの全解除
	Game_Interpreter.prototype.moveCancel = function() {

		if (!$gameParty.inBattle()) {

			//プレイヤー
			if ($gamePlayer._moveRouteForcing) {
				$gamePlayer._moveRouteForcing = false;
				$gamePlayer.restoreMoveRoute();
			}

			//マップイベント
			if (this.isOnCurrentMap()) {
				for (var i=0 ; i<$gameMap._events.length ; i++) {
					if ($gameMap._events[i] && $gameMap._events[i]._moveRouteForcing) {
						$gameMap._events[i]._moveRouteForcing = false;
						$gameMap._events[i].restoreMoveRoute();
					}
				}
			}
		}

		//蓄積した移動ルートの設定をクリアする
		this._bufMove = [];

		return true;
	};

	// Show Animation
	Game_Interpreter.prototype.command212 = function() {
		this._character = this.character(this._params[0]);
		if (this._character) {
			this._character.requestAnimation(this._params[1]);
			if (this._params[2]) {
				this.setWaitMode('animation');

				//蓄積された移動ルートの設定を実行する
				this.moveRun(0);
			}
		}
		return true;
	};

	// Tint Screen
	Game_Interpreter.prototype.command223 = function() {
/*
		//コンバートした値では少し暗すぎたりするのでここで調整(最小/中間/最大の値はそのまま)
		var rgba = this._params[0].clone();
		//R
		if (rgba[0] !== 0 || rgba[0] !== 100 || rgba[0] !== 255) {
			//コンバート前の数値に戻して再度計算
			rgba[0] = Math.round((rgba[0] + 255) / 2.55);
			rgba[0] = Math.round((rgba[0] - 100) * 2.40);
		}
		//G
		if (rgba[1] !== 0 || rgba[1] !== 100 || rgba[1] !== 255) {
			rgba[1] = Math.round((rgba[1] + 255) / 2.55);
			rgba[1] = Math.round((rgba[1] - 100) * 2.40);
		}
		//B
		if (rgba[2] !== 0 || rgba[2] !== 100 || rgba[2] !== 255) {
			rgba[2] = Math.round((rgba[2] + 255) / 2.55);
			rgba[2] = Math.round((rgba[2] - 100) * 2.40);
		}
		$gameScreen.startTint(rgba, this._params[1]);
*/
		//MV上ではグレーとなっているグレースケールフィルター値を0とする(ios上での表示がおかしくなる為)
		if($isIOS){
			//iOS系端末のみグレースケールフィルター値を0に。
			this._params[0][3] = 0;
		}else{
		}

		$gameScreen.startTint(this._params[0], this._params[1]);
		if (this._params[2]) {
			this.wait(this._params[1]);

			//蓄積された移動ルートの設定を実行する
			this.moveRun(0);
		}
		return true;
	};

	// Flash Screen
	Game_Interpreter.prototype.command224 = function() {

		var tmpDuration = 10;

		//操作内容によって処理を分ける
		//単発フラッシュ(今まで通りの処理内容)
		if (this._params[3] === 0 || this._params[3] === undefined) {
			//1フレームのフラッシュだと全く光らないので+10しておく
			$gameScreen.startFlash(this._params[0], this._params[1] + tmpDuration);
			if (this._params[2]) {
				this.wait(this._params[1]);

				//蓄積された移動ルートの設定を実行する
				this.moveRun(0);
			}
		//繰り返しフラッシュ開始
		} else if (this._params[3] === 1) {
			$gameScreen.startFlash(this._params[0], this._params[1] + tmpDuration);
			//繰り返しフラグを立てる
			$gameScreen.repeatFlash(true);
		//繰り返しフラッシュ終了
		} else {
			//繰り返しフラグを伏せる
			$gameScreen.repeatFlash(false);
		}

		return true;
	};

	// Shake Screen
	Game_Interpreter.prototype.command225 = function() {

		//操作内容によって処理を分ける
		//単発シェイク(今まで通りの処理内容)
		if (this._params[4] === 0 || this._params[4] === undefined) {
			$gameScreen.startShake(this._params[0], this._params[1], this._params[2]);
			if (this._params[3]) {
				this.wait(this._params[2]);

				//蓄積された移動ルートの設定を実行する
				this.moveRun(0);
			}
		//繰り返しシェイク開始
		} else if (this._params[4] === 1) {
			$gameScreen.startShake(this._params[0], this._params[1], 1);

			//繰り返しフラグを立てる
			$gameScreen.repeatShake(true);
		//繰り返しシェイク終了
		} else {
			//繰り返しフラグを伏せる
			$gameScreen.repeatShake(false);
		}

		return true;
	};

	// Wait
	Game_Interpreter.prototype.command230 = function() {
		this.wait(this._params[0]);

		//蓄積された移動ルートの設定を実行する
		this.moveRun(0);

		return true;
	};

	// Move Picture
	var _Game_Interpreter_command232 = Game_Interpreter.prototype.command232;
	Game_Interpreter.prototype.command232 = function() {
		_Game_Interpreter_command232.call(this);

		if (this._params[11]) {

			//蓄積された移動ルートの設定を実行する
			this.moveRun(0);
		}

		return true;
	};

	// Change Actor Images
	Game_Interpreter.prototype.command322 = function() {
		var actor = $gameActors.actor(this._params[0]);
		if (actor) {
			//"ないよ"が入っていた場合は処理をしないように拡張
			if (this._params[1] != "ないよ") actor.setCharacterImage(this._params[1], this._params[2]);
			if (this._params[3] != "ないよ") actor.setFaceImage(this._params[3], this._params[4]);
			if (this._params[5] != "ないよ") actor.setBattlerImage(this._params[5]);
		}
		$gamePlayer.refresh();
		return true;
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																SceneManagerクラス																					//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	SceneManager.initGraphics = function() {
		var type = this.preferableRendererType();
		Graphics.initialize(this._screenWidth, this._screenHeight, type);
		Graphics.boxWidth = this._boxWidth;
		Graphics.boxHeight = this._boxHeight;
//		Graphics.setLoadingImage('img/system/Loading.png');
		Graphics.setLoadingImage('img/system/loading.png');
		if (Utils.isOptionValid('showfps')) {
			Graphics.showFps();
		}
		if (type === 'webgl') {
			this.checkWebGL();
		}
	};

	SceneManager.snapForBackground = function() {
		this._backgroundBitmap = this.snap();
//	    this._backgroundBitmap.blur();
		//ウィンドウ背景が透明に設定されているならば塗りつぶす必要はなし
		if(windowBackAlpha > 0){
			//ぼかさずに現在のウィンドウスキンに設定されている色で塗りつぶす
			this._backgroundBitmap.fillAll(windowBackColor);
		}else{
			//一応ぼかしておく
			this._backgroundBitmap.blur();
		}
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Scene_Mapクラス																					//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	var _Scene_Map_updateMain = Scene_Map.prototype.updateMain;
	Scene_Map.prototype.updateMain = function() {
		_Scene_Map_updateMain.call(this);

		var active = this.isActive();
		$gameTimer2.update(active);					//タイマー２追加
	};

	Scene_Map.prototype.onMapLoaded = function() {
		if (this._transfer) {
			$gamePlayer.performTransfer();
		}

		//現状のマップから移動しない場合(おそらくメニューから戻ってきた場合)
		if (!this._transfer) {
			//配列の要素数が1以上あるならそれはチップ交換をした証拠なので
			if ($swapChip.length > 0) {
				//チップ交換後のマップデータで上書き
				$dataMap.data = $swapChip.clone();
			}
		} else {
			//初期化
			$swapChip = [];
		}
		//createDisplayObjects()が呼ばれてしまうとタイル用のデータが設定されてしまうので先に

		this.createDisplayObjects();
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Scene_Battleクラス																					//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	var _Scene_Battle_update = Scene_Battle.prototype.update;
	Scene_Battle.prototype.update = function() {
		_Scene_Battle_update.call(this);

		var active = this.isActive();
		$gameTimer2.update(active);					//タイマー２追加
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Spriteset_Baseクラス																				//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	var _Spriteset_Base_createTimer = Spriteset_Base.prototype.createTimer;
	Spriteset_Base.prototype.createTimer = function() {
		_Spriteset_Base_createTimer.call(this);

		this._timer2Sprite = new Sprite_Timer2();	//タイマー２追加
		this.addChild(this._timer2Sprite);
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Sprite_Animationクラス																				//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	Sprite_Animation.prototype.setupRate = function() {
//	    this._rate = 4;
		//アニメーションレートを変更する
		this._rate = 2;
	};

	Sprite_Animation.prototype.processTimingData = function(timing) {
		var duration = timing.flashDuration * this._rate;
		//1フレームのフラッシュだと全く光らないので+10しておく
		var tmpDuration = 10;
		switch (timing.flashScope) {
		case 1:
			this.startFlash(timing.flashColor, duration + tmpDuration);
			break;
		case 2:
			this.startScreenFlash(timing.flashColor, duration + tmpDuration);
			break;
		case 3:
			this.startHiding(duration + tmpDuration);
			break;
		}
		if (!this._duplicated && timing.se) {
			AudioManager.playSe(timing.se);
		}
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Game_Timerクラス																					//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	//ツクール2003ライクな動きをするように書き換える

	var _Game_Timer_initialize = Game_Timer.prototype.initialize;
	Game_Timer.prototype.initialize = function() {
		_Game_Timer_initialize.call(this);

		this._show = false;					//追加(表示/非表示)
	};

	//ツクール2003での「作動開始」
	Game_Timer.prototype.start = function(show) {
		//ここではカウントを設定しないように変更
//		this._frames = count;
		this._working 	= true;
		this._show 		= show;				//表示/非表示
	};

	//ツクール2003での「作動停止」
	Game_Timer.prototype.stop = function() {
		this._working 	= false;
		this._show 		= false;			//非表示にする
	};

	//ツクール2003での「値の設定」
	Game_Timer.prototype.set = function(count) {
		this._frames = count;
	};

	//表示/非表示フラグを返す
	Game_Timer.prototype.isShow = function() {
		return this._show
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Tilemapクラス																						//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	//更新
	Tilemap.prototype.update = function() {
		this.animationCount++;
		//1.3.0
		//this.animationFrame = Math.floor(this.animationCount / 30);
		this.animationFrame = Math.floor(this.animationCount / 6);
		//-----
		this.children.forEach(function(child) {
			if (child.update) {
				child.update();
			}
		});
		//1.3.0
		for (var i=0; i<this.bitmaps.length;i++) {
			if (this.bitmaps[i]) {
				this.bitmaps[i].touch();
			}
		}
		//-----
	};

	//タイル描画
	Tilemap.prototype._paintTiles = function(startX, startY, x, y) {
		var tableEdgeVirtualId = 10000;
		var mx = startX + x;
		var my = startY + y;
		var dx = (mx * this._tileWidth).mod(this._layerWidth);
		var dy = (my * this._tileHeight).mod(this._layerHeight);
		var lx = dx / this._tileWidth;
		var ly = dy / this._tileHeight;
		var tileId0 = this._readMapData(mx, my, 0);
		var tileId1 = this._readMapData(mx, my, 1);
		var tileId2 = this._readMapData(mx, my, 2);
		var tileId3 = this._readMapData(mx, my, 3);
		var shadowBits = this._readMapData(mx, my, 4);
		var upperTileId1 = this._readMapData(mx, my - 1, 1);
		var lowerTiles = [];
		var upperTiles = [];

		if (this._isHigherTile(tileId0)) {
			upperTiles.push(tileId0);
		} else {
			lowerTiles.push(tileId0);
		}
		if (this._isHigherTile(tileId1)) {
			upperTiles.push(tileId1);
		} else {
			lowerTiles.push(tileId1);
		}

		lowerTiles.push(-shadowBits);

		if (this._isTableTile(upperTileId1) && !this._isTableTile(tileId1)) {
			if (!Tilemap.isShadowingTile(tileId0)) {
				lowerTiles.push(tableEdgeVirtualId + upperTileId1);
			}
		}

		if (this._isOverpassPosition(mx, my)) {
			upperTiles.push(tileId2);
			upperTiles.push(tileId3);
		} else {
			if (this._isHigherTile(tileId2)) {
				upperTiles.push(tileId2);
			} else {
				lowerTiles.push(tileId2);
			}
			if (this._isHigherTile(tileId3)) {
				upperTiles.push(tileId3);
			} else {
				lowerTiles.push(tileId3);
			}
		}

/*
		//1.3.0
		//"-my"しているとアニメーションがズレてしまうので
//		var count = 1000 + this.animationCount - my;
		var count = 1000 + this.animationCount;
//	    var frameUpdated = (count % 30 === 0);
		var frameUpdated = (count % 6 === 0);					//タイル描画の更新頻度をあげる
//	    this._animationFrame = Math.floor(count / 30);
		this._animationFrame = Math.floor(count / 6);
		//-----
*/

		var lastLowerTiles = this._readLastTiles(0, lx, ly);
		if (!lowerTiles.equals(lastLowerTiles) ||
				//1.3.0
				//(Tilemap.isTileA1(tileId0) && frameUpdated)) {
				(Tilemap.isTileA1(tileId0) && this._frameUpdated)) {
				//-----
			this._lowerBitmap.clearRect(dx, dy, this._tileWidth, this._tileHeight);
			for (var i = 0; i < lowerTiles.length; i++) {
				var lowerTileId = lowerTiles[i];
				if (lowerTileId < 0) {
					this._drawShadow(this._lowerBitmap, shadowBits, dx, dy);
				} else if (lowerTileId >= tableEdgeVirtualId) {
					this._drawTableEdge(this._lowerBitmap, upperTileId1, dx, dy);
				} else {
					this._drawTile(this._lowerBitmap, lowerTileId, dx, dy);
				}
			}
			this._writeLastTiles(0, lx, ly, lowerTiles);
		}

		var lastUpperTiles = this._readLastTiles(1, lx, ly);
		if (!upperTiles.equals(lastUpperTiles)) {
			this._upperBitmap.clearRect(dx, dy, this._tileWidth, this._tileHeight);
			for (var j = 0; j < upperTiles.length; j++) {
				this._drawTile(this._upperBitmap, upperTiles[j], dx, dy);
			}
			this._writeLastTiles(1, lx, ly, upperTiles);
		}
	};

	//通常タイル描画
	Tilemap.prototype._drawNormalTile = function(bitmap, tileId, dx, dy) {
		var setNumber = 0;

		if (Tilemap.isTileA5(tileId)) {
			setNumber = 4;
		} else {
			setNumber = 5 + Math.floor(tileId / 256);
		}

		var w = this._tileWidth;
		var h = this._tileHeight;
		var sx = (Math.floor(tileId / 128) % 2 * 8 + tileId % 8) * w;
		var sy = (Math.floor(tileId % 256 / 8) % 16) * h;

		var source = this.bitmaps[setNumber];
		if (source) {
			//1.3.0
			//bitmap.blt(source, sx, sy, w, h, dx, dy, w, h);
			bitmap.bltImage(source, sx, sy, w, h, dx, dy, w, h);
			//-----
		}
	};

	//オートタイル描画
	Tilemap.prototype._drawAutotile = function(bitmap, tileId, dx, dy) {
		var autotileTable = Tilemap.FLOOR_AUTOTILE_TABLE;
		var kind = Tilemap.getAutotileKind(tileId);
		var shape = Tilemap.getAutotileShape(tileId);
		var tx = kind % 8;
		var ty = Math.floor(kind / 8);
		var bx = 0;
		var by = 0;
		var setNumber = 0;
		var isTable = false;

		if (Tilemap.isTileA1(tileId)) {
			//var waterSurfaceIndex = [0, 1, 2, 1][this._animationFrame % 4];
			//1.3.0
			//var waterSurfaceIndex = [0, 1, 2, 1][Math.floor(this._animationFrame / 4) % 4];
			var waterSurfaceIndex = [0, 1, 2, 1][Math.floor(this.animationFrame / 4) % 4];	//滝タイルに合わせた更新スピードなので通常のオートタイルだと速すぎるための処理
			//-----
			setNumber = 0;
			if (kind === 0) {
				bx = waterSurfaceIndex * 2;
				by = 0;
			} else if (kind === 1) {
				bx = waterSurfaceIndex * 2;
				by = 3;
			} else if (kind === 2) {
				bx = 6;
				by = 0;
			} else if (kind === 3) {
				bx = 6;
				by = 3;
			} else {
				bx = Math.floor(tx / 4) * 8;
				by = ty * 6 + Math.floor(tx / 2) % 2 * 3;
				if (kind % 2 === 0) {
					bx += waterSurfaceIndex * 2;
				}
				//滝タイル(アニメーション用タイル)
				else {
					bx += 6;
					autotileTable = Tilemap.WATERFALL_AUTOTILE_TABLE;
					//by += this._animationFrame % 3;
					//1.3.0
					//by += this._animationFrame % 4;
					by += this.animationFrame % 4;			//アニメーションパターン数を増やす
					//-----
				}
			}
		} else if (Tilemap.isTileA2(tileId)) {
			setNumber = 1;
			bx = tx * 2;
			by = (ty - 2) * 3;
			isTable = this._isTableTile(tileId);
		} else if (Tilemap.isTileA3(tileId)) {
			setNumber = 2;
			bx = tx * 2;
			by = (ty - 6) * 2;
			autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
		} else if (Tilemap.isTileA4(tileId)) {
			setNumber = 3;
			bx = tx * 2;
			by = Math.floor((ty - 10) * 2.5 + (ty % 2 === 1 ? 0.5 : 0));
			if (ty % 2 === 1) {
				autotileTable = Tilemap.WALL_AUTOTILE_TABLE;
			}
		}

		var table = autotileTable[shape];
		var source = this.bitmaps[setNumber];

		if (table && source) {
			var w1 = this._tileWidth / 2;
			var h1 = this._tileHeight / 2;
			for (var i = 0; i < 4; i++) {
				var qsx = table[i][0];
				var qsy = table[i][1];
				var sx1 = (bx * 2 + qsx) * w1;
				var sy1 = (by * 2 + qsy) * h1;
				var dx1 = dx + (i % 2) * w1;
				var dy1 = dy + Math.floor(i / 2) * h1;
				if (isTable && (qsy === 1 || qsy === 5)) {
					var qsx2 = qsx;
					var qsy2 = 3;
					if (qsy === 1) {
						qsx2 = [0,3,2,1][qsx];
					}
					var sx2 = (bx * 2 + qsx2) * w1;
					var sy2 = (by * 2 + qsy2) * h1;
					//1.3.0
					//bitmap.blt(source, sx2, sy2, w1, h1, dx1, dy1, w1, h1);
					bitmap.bltImage(source, sx2, sy2, w1, h1, dx1, dy1, w1, h1);
					dy1 += h1/2;
					//bitmap.blt(source, sx1, sy1, w1, h1/2, dx1, dy1, w1, h1/2);
					bitmap.bltImage(source, sx1, sy1, w1, h1/2, dx1, dy1, w1, h1/2);
				} else {
					//bitmap.blt(source, sx1, sy1, w1, h1, dx1, dy1, w1, h1);
					bitmap.bltImage(source, sx1, sy1, w1, h1, dx1, dy1, w1, h1);
					//-----
				}
			}
		}
	};


//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//														ShaderTilemapクラス																						//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

//1.3.0
	ShaderTilemap.prototype._hackRenderer = function(renderer) {
		//var af = this.animationFrame % 4;
		var af = Math.floor(this.animationFrame / 4) % 4;
		if (af==3) af = 1;
		renderer.plugins.tilemap.tileAnim[0] = af * this._tileWidth;
		//renderer.plugins.tilemap.tileAnim[1] = (this.animationFrame % 3) * this._tileHeight;
		renderer.plugins.tilemap.tileAnim[1] = (this.animationFrame % 4) * this._tileHeight;
		return renderer;
	};
//-----

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Bitmapクラス																						//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	//Bitmapクラス初期化
	var _Bitmap_initialize = Bitmap.prototype.initialize;
	Bitmap.prototype.initialize = function(width, height) {
		_Bitmap_initialize.call(this, width, height);

		this.textColor2 		= '#ffffff';		//グラデーション文字の終了色

		this.textAlpha 			= 1.0;				//文字の透過度

		this.textShadowColor 	= '#ffffff';		//文字の影色
		this.textShadowAlpha 	= 1.0;				//文字の影の透過度
	};

	//テキスト描画
	Bitmap.prototype.drawText = function(text, x, y, maxWidth, lineHeight, align) {
		// Note: Firefox has a bug with textBaseline: Bug 737852
		//       So we use 'alphabetic' here.
		if (text !== undefined) {
			var tx = x;
			var ty = y + lineHeight - (lineHeight - this.fontSize * 0.7) / 2;
			var context = this._context;
			var alpha = context.globalAlpha;
			maxWidth = maxWidth || 0xffffffff;
			if (align === 'center') {
				tx += maxWidth / 2;
			}
			if (align === 'right') {
				tx += maxWidth;
			}
			context.save();
			context.font = this._makeFontNameText();
			context.textAlign = align;
			context.textBaseline = 'alphabetic';
			//文字の影の透過度の設定
			context.globalAlpha = this.textShadowAlpha;
			this._drawTextOutline(text, tx, ty, maxWidth);
			//文字の透過度の設定
			context.globalAlpha = this.textAlpha;
			this._drawTextBody(text, tx, ty, maxWidth);
			//透過度の設定を元に戻す
			context.globalAlpha = alpha;
			context.restore();
			this._setDirty();
		}
	};

	//文字の輪郭の描画
	Bitmap.prototype._drawTextOutline = function(text, tx, ty, maxWidth) {

		var context = this._context;
		//輪郭は描画しない
//	    context.strokeStyle = this.outlineColor;
//	    context.lineWidth = this.outlineWidth;
//	    context.lineJoin = 'round';

		//文字に影を付加
		context.shadowColor = this.textShadowColor;
		context.shadowOffsetX = 1;
		context.shadowOffsetY = 1;
		context.strokeText(text, tx, ty, maxWidth);
	};

	//文字の中身を描画
	Bitmap.prototype._drawTextBody = function(text, tx, ty, maxWidth) {
		var context = this._context;

		//グラデーションスタイルの指定
		var grad = context.createLinearGradient(tx, ty-this.fontSize/2, tx, ty);
		grad.addColorStop(0, this.textColor);
		grad.addColorStop(1, this.textColor2);
		context.fillStyle = grad;

		context.fillText(text, tx, ty, maxWidth);
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Scene_Bootクラス																					//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	//初期のSystemWindowImage読み込み
	Scene_Boot.prototype.loadSystemWindowImage = function() {
		//ImageManager.loadSystem('Window');
		//初期ウィンドウスキン
		ImageManager.loadSystem('maishisutemua');
	};
	/*
	//初期の読み込み
	var _Scene_Boot_loadSystemImages = Scene_Boot.prototype.loadSystemImages;
	Scene_Boot.prototype.loadSystemImages = function() {
		_Scene_Boot_loadSystemImages.call(this);

		//初期ウィンドウスキン
		ImageManager.loadSystem('maishisutemua');
	};
	*/

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Window_Baseクラス																					//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	Window_Base.prototype.loadWindowskin = function() {
		//デフォルトは「マイシステムa」
		this._winskinName = $gameSystem._winskinName || 'maishisutemua';

		//読み込み
		this.windowskin = ImageManager.loadSystem(this._winskinName);

		//ウィンドウの背景色をこのタイミングで取得しておく
		windowBackColor = this.windowBackColor();
	};

	var _Window_Base_update = Window_Base.prototype.update;
	Window_Base.prototype.update = function() {
		_Window_Base_update.call(this);

		//システムに登録されているのと違うのであれば読み込み
		if ($gameSystem._winskinName) {
			if (this._winskinName !== $gameSystem._winskinName) {
				this.loadWindowskin();
			}
		}
	};

	//ウィンドウの透過度の設定
	Window_Base.prototype.standardBackOpacity = function() {
//		return 192;
		//ウィンドウ透過なし
		return 255;
	};

	//文字色の変更
	var _Window_Base_changeTextColor = Window_Base.prototype.changeTextColor;
	Window_Base.prototype.changeTextColor = function(color) {
		_Window_Base_changeTextColor.call(this, color);

		//影の色とかその他諸々の取得もしておく(もっと適した記述場所がある気がする)
		this.contents.textShadowColor = this.textShadowColor();
	};

	//ウィンドウスキンから文字色の取得
	Window_Base.prototype.textColor = function(n) {
		var px = 96 + (n % 8) * 12 + 6;
		var py = 144 + Math.floor(n / 8) * 12 + 6;

		//ここで一緒に文字等の透過度を取得しておく(もっと適した記述場所がある気がする)
		if(n == 14){
			//ウィンドウの背景色の透過度
			windowBackAlpha 				= this.windowskin.getAlphaPixel(px, py);
		}else if(n == 15){
			//文字の影色の透過度
			this.contents.textShadowAlpha 	= this.windowskin.getAlphaPixel(px, py);
		}else{
			//文字色の透過度
			this.contents.textAlpha 		= this.windowskin.getAlphaPixel(px, py);
			//グラデーションの終了色も取得
			this.contents.textColor2		= this.windowskin.getPixel(px+1,py+1);
		}

		return this.windowskin.getPixel(px, py);
	};

	//ウィンドウスキンから文字の影の色の取得
	Window_Base.prototype.textShadowColor = function() {
		return this.textColor(15);
	};

	//ウィンドウスキンからメニュー画面等の背景色の取得
	Window_Base.prototype.windowBackColor = function() {
		return this.textColor(14);
	};

	//アクターのHPの描画
	Window_Base.prototype.drawActorHp = function(actor, x, y, width) {
		width = width || 186;
		var color1 = this.hpGaugeColor1();
		var color2 = this.hpGaugeColor2();
		//ゲージの描画なし
//	    this.drawGauge(x, y, width, actor.hpRate(), color1, color2);
		this.changeTextColor(this.systemColor());
		this.drawText(TextManager.hpA, x, y, 44);
		this.drawCurrentAndMax(actor.hp, actor.mhp, x, y, width,
							   this.hpColor(actor), this.normalColor());
	};

	//アクターのMPの描画
	Window_Base.prototype.drawActorMp = function(actor, x, y, width) {
		width = width || 186;
		var color1 = this.mpGaugeColor1();
		var color2 = this.mpGaugeColor2();
		//ゲージの描画なし
//	    this.drawGauge(x, y, width, actor.mpRate(), color1, color2);
		this.changeTextColor(this.systemColor());
		this.drawText(TextManager.mpA, x, y, 44);
		this.drawCurrentAndMax(actor.mp, actor.mmp, x, y, width,
							   this.mpColor(actor), this.normalColor());
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Windowクラス																						//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	//ウィンドウスキン関連
	//全てのパーツを一括で生成
	var _Window__createAllParts = Window.prototype._createAllParts;
	Window.prototype._createAllParts = function() {
		_Window__createAllParts.call(this);

		this._windowCursorSprite.blinking = 0;		//切り替え用
	};

	//ウィンドウフレーム
	Window.prototype._refreshFrame = function() {
		var w = this._width;
		var h = this._height;
		var m = 24;
		var bitmap = new Bitmap(w, h);

		this._windowFrameSprite.bitmap = bitmap;
		this._windowFrameSprite.setFrame(0, 0, w, h);

		if (w > 0 && h > 0 && this._windowskin) {
			var skin = this._windowskin;
			var p = 96;
			var q = 96;
//			bitmap.blt(skin, p+m, 0+0, p-m*2, m, m, 0, w-m*2, m);		//上ライン
//			bitmap.blt(skin, p+m, 0+q-m, p-m*2, m, m, h-m, w-m*2, m);	//下ライン
//			bitmap.blt(skin, p+0, 0+m, m, p-m*2, 0, m, m, h-m*2);		//左ライン
//			bitmap.blt(skin, p+q-m, 0+m, m, p-m*2, w-m, m, m, h-m*2);	//右ライン
			//---横---
			//横に配置できる分だけ並べる
			var i=0;
			for(i=0; i<Math.floor((w-m*2)/(m*2)); i++){
				bitmap.blt(skin, p+m, 0+0, p-m*2, m, m+(m*2)*i, 0, m*2, m);
				bitmap.blt(skin, p+m, 0+q-m, p-m*2, m, m+(m*2)*i, h-m, m*2, m);
			}
			//キッチリ入りきらなかった場合の処理
			var rem = (w-m*2)%(m*2);
			//実際に余りが出ていれば
			if(rem != 0){
				bitmap.blt(skin, p+m, 0+0, rem, m, m+(m*2)*i, 0, rem, m);
				bitmap.blt(skin, p+m, 0+q-m, rem, m, m+(m*2)*i, h-m, rem, m);
			}

			//---縦---
			for(i=0; i<Math.floor((h-m*2)/(m*2)); i++){
				bitmap.blt(skin, p+0, 0+m, m, p-m*2, 0, m+(m*2)*i, m, m*2);
				bitmap.blt(skin, p+q-m, 0+m, m, p-m*2, w-m, m+(m*2)*i, m, m*2);
			}
			//キッチリ入りきらなかった場合の処理
			rem = (h-m*2)%(m*2);
			//実際に余りが出ていれば
			if(rem != 0){
				bitmap.blt(skin, p+0, 0+m, m, rem, 0, m+(m*2)*i, m, rem);
				bitmap.blt(skin, p+q-m, 0+m, m, rem, w-m, m+(m*2)*i, m, rem);
			}

			bitmap.blt(skin, p+0, 0+0, m, m, 0, 0, m, m);				//左上
			bitmap.blt(skin, p+q-m, 0+0, m, m, w-m, 0, m, m);			//右上
			bitmap.blt(skin, p+0, 0+q-m, m, m, 0, h-m, m, m);			//左下
			bitmap.blt(skin, p+q-m, 0+q-m, m, m, w-m, h-m, m, m);		//右下
		}
	};

	//コマンドカーソル
	Window.prototype._refreshCursor = function() {
		var pad = this._padding;
		var x = this._cursorRect.x + pad - this.origin.x;
		var y = this._cursorRect.y + pad - this.origin.y;
		var w = this._cursorRect.width;
		var h = this._cursorRect.height;
		var m = 12;
		var x2 = Math.max(x, pad);
		var y2 = Math.max(y, pad);
		var ox = x - x2;
		var oy = y - y2;
		var w2 = Math.min(w, this._width - pad - x2);
		var h2 = Math.min(h, this._height - pad - y2);
		var bitmap = new Bitmap(w2, h2);

		var cng = this._windowCursorSprite.blinking;

		this._windowCursorSprite.bitmap = bitmap;
		this._windowCursorSprite.setFrame(0, 0, w2, h2);
		this._windowCursorSprite.move(x2, y2);

		if (w > 0 && h > 0 && this._windowskin) {
			var skin = this._windowskin;
			var p = 96;
			var q = 48;
//			bitmap.blt(skin, p+m, p+m, q-m*2, q-m*2, ox+m, oy+m, w-m*2, h-m*2);	//中心
//			bitmap.blt(skin, p+m, p+0, q-m*2, m, ox+m, oy+0, w-m*2, m);			//上ライン
//			bitmap.blt(skin, p+m, p+q-m, q-m*2, m, ox+m, oy+h-m, w-m*2, m);		//下ライン
//			bitmap.blt(skin, p+0, p+m, m, q-m*2, ox+0, oy+m, m, h-m*2);			//左ライン
//			bitmap.blt(skin, p+q-m, p+m, m, q-m*2, ox+w-m, oy+m, m, h-m*2);		//右ライン
			//---横---
			//横に配置できる分だけ並べる
			var i=0;
			for(i=0; i<Math.floor((w-m*2)/(m*2)); i++){
				bitmap.blt(skin, p+q*cng+m, p, q-m*2, m, ox+m+(m*2)*i, oy, m*2, m);
				bitmap.blt(skin, p+q*cng+m, p+q-m, q-m*2, m, ox+m+(m*2)*i, oy+h-m, m*2, m);
			}
			//キッチリ入りきらなかった場合の処理
			var rem = (w-m*2)%(m*2);
			//実際に余りが出ていれば
			if(rem != 0){
				bitmap.blt(skin, p+q*cng+m, p, rem, m, ox+m+(m*2)*i, oy, rem, m);
				bitmap.blt(skin, p+q*cng+m, p+q-m, rem, m, ox+m+(m*2)*i, oy+h-m, rem, m);
			}

			//---縦---
			//縦に配置できる分だけ並べる
			var i=0;
			for(i=0; i<Math.floor((h-m*2)/(m*2)); i++){
				bitmap.blt(skin, p+q*cng+0, p+m, m, q-m*2, ox+0, oy+m+(m*2)*i, m, m*2);
				bitmap.blt(skin, p+q*cng+q-m, p+m, m, q-m*2, ox+w-m, oy+m+(m*2)*i, m, m*2);
			}
			//キッチリ入りきらなかった場合の処理
			var rem = (h-m*2)%(m*2);
			//実際に余りが出ていれば
			if(rem != 0){
				bitmap.blt(skin, p+q*cng+0, p+m, m, rem, ox+0, oy+m+(m*2)*i, m, rem);
				bitmap.blt(skin, p+q*cng+q-m, p+m, m, rem, ox+w-m, oy+m+(m*2)*i, m, rem);
			}

			bitmap.blt(skin, p+q*cng+m, p+m, q-m*2, q-m*2, ox+m, oy+m, w-m*2, h-m*2);	//中心
			bitmap.blt(skin, p+q*cng+0, p+0, m, m, ox+0, oy+0, m, m);
			bitmap.blt(skin, p+q*cng+q-m, p+0, m, m, ox+w-m, oy+0, m, m);
			bitmap.blt(skin, p+q*cng+0, p+q-m, m, m, ox+0, oy+h-m, m, m);
			bitmap.blt(skin, p+q*cng+q-m, p+q-m, m, m, ox+w-m, oy+h-m, m, m);
		}
	};
	Window.prototype._updateCursor = function() {
		var blinkCount = this._animationCount % 20;
		if (this.active) {
			if (blinkCount < 10) {
				if(this._windowCursorSprite.blinking == 1){
					this._windowCursorSprite.blinking = 0;
					this._refreshCursor();
				}
			} else {
				if(this._windowCursorSprite.blinking == 0){
					this._windowCursorSprite.blinking = 1;
					this._refreshCursor();
				}
			}
		}
		this._windowCursorSprite.alpha	= 1;
		this._windowCursorSprite.visible= this.isOpen();
	};

	//ウィンドウカーソル
	Window.prototype._refreshArrows = function() {
		var w = this._width;
		var h = this._height;
		var p = 48;
		var q = p/2;
		var sx = 24;
		var sy = 24;
		this._downArrowSprite.bitmap = this._windowskin;
		this._downArrowSprite.anchor.x = 0.5;
		this._downArrowSprite.anchor.y = 0.5;

		this._downArrowSprite.setFrame(96+sx, 0+sy+q, p, q);
		this._downArrowSprite.move(w/2, h-q);

		this._upArrowSprite.bitmap = this._windowskin;
		this._upArrowSprite.anchor.x = 0.5;
		this._upArrowSprite.anchor.y = 0.5;

		this._upArrowSprite.setFrame(96+sx, 0+sy, p, q);
		this._upArrowSprite.move(w/2, q);
	};
	Window.prototype._updateArrows = function() {
		var blinkCount = this._animationCount % 40;
		if(blinkCount < 20){
			this._downArrowSprite.visible	= this.isOpen() && this.downArrowVisible;
			this._upArrowSprite.visible 	= this.isOpen() && this.upArrowVisible;
		}else{
			this._downArrowSprite.visible 	= false;
			this._upArrowSprite.visible 	= false;
		}
	};

	//ポーズサイン
	Window.prototype._refreshPauseSign = function() {
		var sx = 24;
		var sy = 24;
		var p = 48;
		var q = p/2;
		this._windowPauseSignSprite.bitmap = this._windowskin;
		this._windowPauseSignSprite.anchor.x = 0.5;
		this._windowPauseSignSprite.anchor.y = 1;
		this._windowPauseSignSprite.move(this._width / 2, this._height);
		this._windowPauseSignSprite.setFrame(96+sx, 0+sy+q, p, q);
		this._windowPauseSignSprite.alpha = 255;
	};
	Window.prototype._updatePauseSign = function() {
		var sprite = this._windowPauseSignSprite;
		var sx = 24;
		var sy = 24;
		var p = 48;
		var q = p/2;

		if(!this.pause){
			sprite.alpha = 0;
		}else{
			sprite.alpha = 1;
		}
		sprite.setFrame(96+sx, 0+sy+q, p, q);

		var blinkCount = this._animationCount % 40;
		if(blinkCount < 20){
			sprite.visible	= this.isOpen()
		}else{
			sprite.visible 	= false;
		}
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Sprite_Characterクラス																				//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	//キャラクターのフラッシュ機能を実装
	var _Sprite_Character_update = Sprite_Character.prototype.update;
	Sprite_Character.prototype.update = function() {
		_Sprite_Character_update.call(this);

		//フラッシュの更新
		this.updateFlash();
	};
	Sprite_Character.prototype.updateFlash = function() {
		if (this._character.isFlash()) {
			this.setBlendColor(this._character._flashColor);
		}
	};

//＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿/＿//
//																Sprite_Timerクラス																					//
//￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣/￣///

	Sprite_Timer.prototype.initialize = function() {
		Sprite.prototype.initialize.call(this);
		this._seconds = 0;
		this._presentFrame 	= 0;	//現在のフレーム数を保持
		this.createBitmap();
		this.update();
	};

	Sprite_Timer.prototype.createBitmap = function() {
//		this.bitmap = new Bitmap(96, 48);
		this.bitmap = new Bitmap(128, 48);
		this.bitmap.fontSize = 32;

		//タイマー用画像の読み込み
		this.timerBitmap = ImageManager.loadSystem('timer');
	};

	//描画の更新
	Sprite_Timer.prototype.updateBitmap = function() {

		//30フレーム毎に描画更新を行う
		if(this._presentFrame !== Math.floor($gameTimer._frames/30)){
			this._presentFrame = Math.floor($gameTimer._frames/30);

			if (this._seconds !== $gameTimer.seconds()) {
				this._seconds = $gameTimer.seconds();
//				this.redraw();
			}
			this.redraw();

			//最後はこの値が来るのでここでタイマーを終了させる(非表示に)
			if($gameTimer._frames == 29){
//				$gameTimer.stop();

				//表示フラグが立っているならば非表示にするだけ。タイマー自体の更新の停止はフレームが０になった時
				if (!$gameTimer._show) $gameTimer._show = false;
			}
		}
	};

	Sprite_Timer.prototype.redraw = function() {
		var text = this.timerText();
		var width = this.bitmap.width;
		var height = this.bitmap.height;
		this.bitmap.clear();

		//文字を切り出しながら描画する画像の計算をする
		for(var i=0; i<text.length; i++){
			var tmpStr = text.charAt(i);

			//":"の文字だった場合
			if(tmpStr == ":"){
				//奇数だった場合
				if(this._presentFrame % 2 == 1){
					this.bitmap.blt(this.timerBitmap, 24*10, 0, 24, 48, 24*i, 0, 24, 48);
				}
			}else if(tmpStr == "0" && ( i == 0 || i == 1 || i == 3 )){
				this.bitmap.blt(this.timerBitmap, 0, 0, 24, 48, 24*i, 0, 24, 48);
			//それ以外の場合
			}else{
				//数値に変換
				var tmpNum = parseInt(tmpStr, 10);
				this.bitmap.blt(this.timerBitmap, 24*(tmpNum+1), 0, 24, 48, 24*i, 0, 24, 48);
			}
		}
//		this.bitmap.drawText(text, 0, 0, width, height, 'center');
	};

	//タイマーの描画位置
	Sprite_Timer.prototype.updatePosition = function() {
//		this.x = Graphics.width - this.bitmap.width;
		//画面左上に固定
		this.x = 0;
		this.y = 0;
	};

	Sprite_Timer.prototype.updateVisibility = function() {
//		this.visible = $gameTimer.isWorking();
		//表示/非表示の判別を違うメソッドに変更
		this.visible = $gameTimer.isShow();
	};

})();