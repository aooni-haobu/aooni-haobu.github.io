//=============================================================================
// global_c.js
//=============================================================================

/*:ja
 * @plugindesc グローバルスクリプト記述プラグインc
 * @author
 *
 * @help このプラグインには、プラグインコマンドはありません。
 *
 * MV移植の為のグローバルスクリプト記述プラグインです。
 *
 */

(function() {


	//=======================================================================
	// rpg_managers.js
	//=======================================================================

	//-----------------------------------------------------------------------
	// DataManager
	//-----------------------------------------------------------------------

	//セーブファイル情報生成
	DataManager.makeSavefileInfo = function() {
    	var info = {};
    	info.globalId   = this._globalId;
    	info.title      = $dataSystem.gameTitle;
    	info.characters = $gameParty.charactersForSavefile();
    	info.faces      = $gameParty.facesForSavefile();
    	info.playtime   = $gameSystem.playtimeText();
    	info.timestamp  = Date.now();
    	info.actor 		= $gameActors.actor(1); // プレイヤー情報追加保存

    	return info;
	};

	//=======================================================================
	// rpg_windows.js
	//=======================================================================

	//-----------------------------------------------------------------------
	// Window_MenuCommand
	//-----------------------------------------------------------------------

	//コマンドメニューリスト生成
	Window_MenuCommand.prototype.makeCommandList = function() {
	    this.addMainCommands();
	    this.addFormationCommand();
	    this.addOriginalCommands();
	    //this.addOptionsCommand(); //オプション非表示
	    this.addSaveCommand();
	    this.addGameEndCommand();
	};

	//-----------------------------------------------------------------------
	// Window_SavefileList
	//-----------------------------------------------------------------------

	//1画面内ファイル表示数取得
	Window_SavefileList.prototype.maxVisibleItems = function() {
	//    return 5;
	    return 3;
	};

	//セーブデータ情報表示
	Window_SavefileList.prototype.drawContents = function(info, rect, valid) {
	    var bottom = rect.y + rect.height;
	    if (rect.width >= 420) {
	        //タイトル非表示
	        //this.drawGameTitle(info, rect.x + 192, rect.y, rect.width - 192);
	        if (valid) {
	            //キャラクター非表示
	            //this.drawPartyCharacters(info, rect.x + 220, bottom - 4);
				//プレイヤー情報表示
				this.drawText(info.actor._name, rect.x + 0, rect.y + 70, 100);
				this.changeTextColor(this.systemColor());
				this.drawText(TextManager.levelA, rect.x + 0, rect.y + 120, 48);
			    this.resetTextColor();
			    this.drawText(info.actor._level, rect.x + 70, rect.y + 120, 48);
				this.changeTextColor(this.systemColor());
				this.drawText(TextManager.hpA, rect.x + 120, rect.y + 120, 48);
			    this.resetTextColor();
			    this.drawText(info.actor._hp, rect.x + 190, rect.y + 120, 48);
				//顔グラフィック表示
	            if (info.characters) {
	            	//console.log("info.actor : " + Object.keys(info.actor));
	            	for (var i = 0; i < info.characters.length; i++) {
	            		var data = info.faces[i];
						this.drawFace(data[0], data[1], rect.x + 240 + i*(144+18), rect.y + 28);
	            	}
	            }
	        }
	    }
	    //プレイタイム非表示
	    /*var lineHeight = this.lineHeight();
	    var y2 = bottom - lineHeight;
	    if (y2 >= lineHeight) {
	        this.drawPlaytime(info, rect.x, y2, rect.width);
	    }*/
	};


	//-----------------------------------------------------------------------
	// Window_TitleCommand
	//-----------------------------------------------------------------------

	//コマンドタイトルメニューリスト生成
	Window_TitleCommand.prototype.makeCommandList = function() {
	    this.addCommand(TextManager.newGame,   'newGame');
	    this.addCommand(TextManager.continue_, 'continue', this.isContinueEnabled());
	    this.addCommand("Quit",   'gameend');
	};

	//-----------------------------------------------------------------------
	// Window_GameEnd
	//-----------------------------------------------------------------------
	
	//ウィンドウ座標設定
	Window_GameEnd.prototype.updatePlacement = function() {
	    this.x = (Graphics.boxWidth - this.width) / 2;
	    this.y = (Graphics.boxHeight - this.height) / 2 + 70;
	};
	
	//ウィンドウ幅情報取得
	Window_GameEnd.prototype.windowWidth = function() {
	    return 150;
	};

	//-----------------------------------------------------------------------
	// Window_GameEndSub : 新規
	// ゲーム終了画面用メッセージ表示ウィンドウ
	//-----------------------------------------------------------------------

	function Window_GameEndSub() {
	    this.initialize.apply(this, arguments);
	}

	Window_GameEndSub.prototype = Object.create(Window_Base.prototype);
	Window_GameEndSub.prototype.constructor = Window_GameEndSub;

	Window_GameEndSub.prototype.initialize = function(numLines,x,y) {
	    var width = Graphics.boxWidth /3;
	    var height = this.fittingHeight(numLines || 2);
	    Window_Base.prototype.initialize.call(this, x, y, width, height);
	    this._text = '';
	};

	Window_GameEndSub.prototype.setText = function(text) {
	    if (this._text !== text) {
	        this._text = text;
	        this.refresh();
	    }
	};

	Window_GameEndSub.prototype.clear = function() {
	    this.setText('');
	};

	Window_GameEndSub.prototype.refresh = function() {
	    this.contents.clear();
	    this.drawTextEx(this._text, this.textPadding(), 0);
	};


	//=======================================================================
	// rpg_scenes.js
	//=======================================================================

	//-----------------------------------------------------------------------
	// Scene_Title
	//-----------------------------------------------------------------------

	//メニューウィンドウ生成
	Scene_Title.prototype.createCommandWindow = function() {
	    this._commandWindow = new Window_TitleCommand();
		this._commandWindow.setHandler('newGame',  this.commandNewGame.bind(this));
	    this._commandWindow.setHandler('continue', this.commandContinue.bind(this));
	    this._commandWindow.setHandler('gameend',  this.commandShotDown.bind(this));
	    this.addWindow(this._commandWindow);
	    
	};

	// ゲーム終了処理 : 新規
	Scene_Title.prototype.commandShotDown = function() {
	    this._commandWindow.close();
	    this.fadeOutAll();
	    SceneManager.exit();
	};

	//-----------------------------------------------------------------------
	// Scene_GameEnd
	//-----------------------------------------------------------------------

	//生成
	Scene_GameEnd.prototype.create = function() {
	    Scene_MenuBase.prototype.create.call(this);
	    this.createCommandWindow();
	    this.createSubWindow();
	};

	//終了
	Scene_GameEnd.prototype.stop = function() {
	    Scene_MenuBase.prototype.stop.call(this);
	    this._commandWindow.close();
	    this._subWindow.close();
	};

	//メッセージウィンドウ生成 : 新規
	Scene_GameEnd.prototype.createSubWindow = function() {
		var pos_x = (Graphics.boxWidth - Graphics.boxWidth/3) /2;
	    this._subWindow = new Window_GameEndSub(1,pos_x,230);
	    this._subWindow.setText("Do you want to quit?");
	    this.addWindow(this._subWindow);
	};


	//-----------------------------------------------------------------------
	// Scene_Item
	//-----------------------------------------------------------------------

	//生成
	Scene_Item.prototype.create = function() {
	    Scene_ItemBase.prototype.create.call(this);
	    this.createHelpWindow();
	    //アイテムカテゴリ非表示
	    //this.createCategoryWindow();
	    this.createItemWindow();
	    this.createActorWindow();
	    
	    //項目【エフェクト】強制選択
	    this.onCategoryOk();

	};

	//アイテムリストウィンドウ生成
	Scene_Item.prototype.createItemWindow = function() {
	    //アイテムウィンドウ表示位置調整
	    //var wy = this._categoryWindow.y + this._categoryWindow.height;
	    var wy =  this._helpWindow.height;
	    var wh = Graphics.boxHeight - wy;
	    this._itemWindow = new Window_ItemList(0, wy, Graphics.boxWidth, wh);
	    this._itemWindow.setHelpWindow(this._helpWindow);
	    this._itemWindow.setHandler('ok',     this.onItemOk.bind(this));
	    //キャンセルボタン押下時、カテゴリを飛ばし、メニュー画面へ
	    //this._itemWindow.setHandler('cancel', this.onItemCancel.bind(this));
	    this._itemWindow.setHandler('cancel', this.popScene.bind(this));

	    this.addWindow(this._itemWindow);
	    
	    //カテゴリ設定調整
	    //this._categoryWindow.setItemWindow(this._itemWindow);
	    this.update();
	    this._itemWindow.setCategory('item');
	};

	//ヘルプウィンドウ生成
	Scene_Item.prototype.createHelpWindow = function() {
    	this._helpWindow = new Window_Help(1); //アイテム画面ヘルプウィンドウを1行に。
    	this.addWindow(this._helpWindow);
	};


	//=======================================================================
	// rpg_objects.js
	//=======================================================================

	//-----------------------------------------------------------------------
	// Game_CharacterBase
	//-----------------------------------------------------------------------

	//メンバー初期化
	var _Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
	Game_CharacterBase.prototype.initMembers = function() {
	    _Game_CharacterBase_initMembers.call(this);

	    //4枚アニメフラグ
	    this._fourAnim = false;
	};

	//-----------------------------------------------------------------------
	// Game_Character
	//-----------------------------------------------------------------------

	Game_Character.prototype.fourAnimOn		= function(){};
	Game_Character.prototype.fourAnimOff	= function(){};

	//-----------------------------------------------------------------------
	// Game_Event
	//-----------------------------------------------------------------------

	//メンバー初期化
	var _Game_Event_initMembers = Game_Event.prototype.initMembers;
	Game_Event.prototype.initMembers = function() {
	    _Game_Event_initMembers.call(this);
	    
	    this._originalFourAnim	= false;
		this._fourAnim			= false;
		this._fourAnimDirection	= 2;
		this._fourAnimCount		= 0;
	};

	//ページ設定
	var _Game_Event_setupPageSettings = Game_Event.prototype.setupPageSettings;
	Game_Event.prototype.setupPageSettings = function() {
	    _Game_Event_setupPageSettings.call(this);

	    this.resetFourAnim();
		this.resetFourAnimDirection();
		this._fourAnimCount = 0;

	    this.setupFourAnime();
	};

	//更新
	var _Game_Event_update = Game_Event.prototype.update;
	Game_Event.prototype.update = function() {
	    _Game_Event_update.call(this);
	    
	    this.updateFourAnim();
	};

	//4枚アニメフラグ初期化 : 新規
	Game_Event.prototype.setupFourAnime = function() {
		var page = this.page();
		if(page !== undefined){
			//console.log("page : " + Object.keys(page));
			if(page.fourAnime !== undefined){ //フラグを持っている場合のみ
		    	if(page.fourAnime){
		    		//console.log("fourAnime ON");
		    		this._originalFourAnim = true;
		    		this.setFourAnim(true);
				}
		    }
		}
	};

	//4枚アニメフラグ更新 : 新規
	Game_Event.prototype.updateFourAnim = function() {
		if( this.hasFourAnim() ){
			++this._fourAnimCount;
			if( this._fourAnimCount >= this.fourAnimWait() ){
				this.updateFourAnimDirection();
				this._fourAnimCount = 0;
			}
		}else if( !this.isOriginalFourAnimDirection() ){
			this.resetFourAnimDirection();
			this._fourAnimCount = 0;
		}
	};

	//ウェイト時間取得 : 新規
	Game_Event.prototype.fourAnimWait = function() {
		return Math.max( ( 24 - this.realMoveSpeed() * 4 ), 1 );
	};

	//向きパターン更新 : 新規
	Game_Event.prototype.updateFourAnimDirection = function() {
		switch( this.fourAnimDirection() ){
		case 2:
			this.setFourAnimDirection( 4 );
			break;
		case 4:
			this.setFourAnimDirection( 8 );
			break;
		case 6:
			this.setFourAnimDirection( 2 );
			break;
		case 8:
			this.setFourAnimDirection( 6 );
			break;
		}
	};

	//4枚アニメフラグ取得 : 新規
	Game_Event.prototype.hasFourAnim = function(){
		return this._fourAnim;
	};

	//4枚アニメフラグ設定 : 新規
	Game_Event.prototype.setFourAnim = function(fourAnim){
		this._fourAnim = fourAnim;
	};

	//4枚アニメフラグ初期化 : 新規
	Game_Event.prototype.resetFourAnim = function(){
		this.setFourAnim(false);
	};

	//向きパターン取得 : 新規
	Game_Event.prototype.fourAnimDirection = function(){
		return this._fourAnimDirection;
	};

	//向きパターン設定 : 新規
	Game_Event.prototype.setFourAnimDirection = function(fourAnimDirection){
		this._fourAnimDirection = fourAnimDirection;
	};

	//向きパターンが初期値か : 新規
	Game_Event.prototype.isOriginalFourAnimDirection = function(fourAnimDirection){
		return ( this._fourAnimDirection === this._originalDirection );
	};

	//向きパターン初期化 : 新規
	Game_Event.prototype.resetFourAnimDirection = function(){
		this.setFourAnimDirection(this._originalDirection);
	};

	//4枚アニメ ON : 新規
	Game_Event.prototype.fourAnimOn = function(){
		this.setFourAnim(true);
	};

	//4枚アニメ OFF : 新規
	Game_Event.prototype.fourAnimOff = function(){
		this.setFourAnim(false);
	};


	//=======================================================================
	// rpg_sprites.js
	//=======================================================================

	//-----------------------------------------------------------------------
	// Sprite_Character
	//-----------------------------------------------------------------------

	//歩行グラフィックのアニメーションパターン取得
	var _Sprite_Character_characterPatternX = Sprite_Character.prototype.characterPatternX;
	Sprite_Character.prototype.characterPatternX = function() {
		if( this._character._eventId !== undefined ) {
			if( this._character.hasFourAnim( ) )
				return this._character._originalPattern;
		}

		return _Sprite_Character_characterPatternX.call( this );
	};

	//歩行グラフィックの向きパターン取得
	var _Sprite_Character_characterPatternY = Sprite_Character.prototype.characterPatternY;
	Sprite_Character.prototype.characterPatternY = function() {
		if( this._character._eventId !== undefined ) {
			if( this._character.hasFourAnim( ) )
				return ( ( this._character.fourAnimDirection() - 2 ) / 2 );
		}

		return _Sprite_Character_characterPatternY.call( this );
	};


})();

