//=============================================================================
// global_b.js
//=============================================================================

/*:ja
 * @plugindesc グローバルスクリプト記述プラグインb
 * @author
 *
 * @help このプラグインには、プラグインコマンドはありません。
 *
 * MV移植の為のグローバルスクリプト記述プラグインです。
 *
 */

//-----------------------------------------------------------------------------
//画面マスサイズ定数
var $ResolutionMapW	= 20;
var $ResolutionMapH	= 15;

//-----------------------------------------------------------------------------
//画面切り替え演出指定
var $screenMoveType = [19,19];

//遠景サイズ
var $parallaxW	= 0;
var $parallaxH	= 0;


//-----------------------------------------------------------------------------
(function() {

	//-----------------------------------------------------------------------------
	/*
	 * 画面切り替え演出の追加（MVはフェードイン・アウトしか無い為）
	 * ・2003の「画面切り替え方式の変更」の代替としてスクリプト追加。
	 * ・2003の「画面の消去」「画面の表示」の代替としてスクリプト追加。
	 * ・「ズーム,瞬間,消去しない」演出はMVの機能流用で実装。
	 * ・「ブロック,ブラインド,モザイク,ラスター」演出はMVに無いので追加作成。
	 */
	//-----------------------------------------------------------------------------
	// スクリプト：画面切り替え方式の変更
	//-----------------------------------------------------------------------------
	Game_Interpreter.prototype.screenMoveChange = function(des, no) {
		//console.log("-- screenMoveChange -- ="+des+","+no);
		$screenMoveType[des] = no;
		return true;
	};
	//-----------------------------------------------------------------------------
	// スクリプト：画面の消去
	//-----------------------------------------------------------------------------
	Game_Interpreter.prototype.screenErasure = function(no) {
		//console.log("-- screenErasure -- ="+no+" speed="+this.fadeSpeed());
		if (!$gameMessage.isBusy()) {
			var spd = this.fadeSpeed();
			switch(no) {
			case  2:			//上からランダムブロック
				$gameScreen.startCover(2, true, spd*2);
				this.wait(spd*2);
				break;
			case  3:			//下からランダムブロック
				$gameScreen.startCover(3, true, spd*2);
				this.wait(spd*2);
				break;
			case  4:			//ブラインド
				$gameScreen.startCover(4, true, spd);
				this.wait(spd);
				break;
			case 16:			//ズーム
				$gameScreen.startZoomEx(1.0, 32.0, spd);
				$gameScreen.startFadeOut(spd);
				this.wait(spd);
				break;
			case 17:			//モザイク
				$gameScreen.startCover(17, true, spd*2);
				this.wait(spd*2);
				break;
			case 18:			//ラスター
				$gameScreen.startCover(18, true, spd*2);
				this.wait(spd*2);
				break;
			case 19:			//瞬間消去
				$gameScreen.finishFade();
				break;
			case 20:			//消去しない（≒何も演出しない）
				break;
			default:			//デフォルト：フェード
				$gameScreen.startFadeOut(spd);
				this.wait(spd);
				break;
			}
		}
		return true;
	};
	//-----------------------------------------------------------------------------
	// スクリプト：画面の表示
	//-----------------------------------------------------------------------------
	Game_Interpreter.prototype.screenDisplay = function(no) {
		//console.log("-- screenDisplay -- ="+no+" speed="+this.fadeSpeed());
		if (!$gameMessage.isBusy()) {
			var spd = this.fadeSpeed();
			$gameScreen.clearCover();
			$gameScreen.clearZoom();
			switch(no) {
			case  2:			//上からランダムブロック
				$gameScreen.clearFade();
				$gameScreen.startCover(2, false, spd*2);
				this.wait(spd*2);
				break;
			case  3:			//下からランダムブロック
				$gameScreen.clearFade();
				$gameScreen.startCover(3, false, spd*2);
				this.wait(spd*2);
				break;
			case  4:			//ブラインド
				$gameScreen.clearFade();
				$gameScreen.startCover(4, false, spd);
				this.wait(spd);
				break;
			case 16:			//ズーム
				$gameScreen.startZoomEx(32.0, 1.0, spd);
				$gameScreen.startFadeIn(spd);
				this.wait(spd);
				break;
			case 17:			//モザイク
				$gameScreen.clearFade();
				$gameScreen.startCover(17, false, spd*2);
				this.wait(spd*2);
				break;
			case 18:			//ラスター
				$gameScreen.clearFade();
				$gameScreen.startCover(18, false, spd*2);
				this.wait(spd*2);
				break;
			case 19:			//瞬間表示
				$gameScreen.clearFade();
				break;
			default:			//デフォルト：フェード
				$gameScreen.finishFade();
				$gameScreen.startFadeIn(spd);
				this.wait(spd);
				break;
			}
		}
		return true;
	};

	//-----------------------------------------------------------------------------
	//	シーンマップ：開始を継承
	//-----------------------------------------------------------------------------
	var _Scene_Map_start = Scene_Map.prototype.start;
	Scene_Map.prototype.start = function() {
		_Scene_Map_start.call(this);

		//特殊画面切り替え専用スプライト追加作成
		this._coverSprite = new Sprite_Cover();
		this.addChild(this._coverSprite);
	};
	//-----------------------------------------------------------------------------
	//	シーンマップ：フェードアウト処理をオーバーロード
	//-----------------------------------------------------------------------------
	Scene_Map.prototype.fadeOutForTransfer = function() {
		//console.log("-- fadeOutForTransfer -- no="+$screenMoveType[0]+" speed="+this.fadeSpeed());
		if ($screenMoveType[0] < 0) {
			//MVの元の動作
			var fadeType = $gamePlayer.fadeType();
			switch (fadeType) {
			case 0: case 1:
				this.startFadeOut(this.fadeSpeed(), fadeType === 1);
				break;
			}
		} else {
			//2003対応追加動作
			var spd = this.fadeSpeed();
			switch($screenMoveType[0]) {
			case  2:			//上からランダムブロック
				$gameScreen.startCover(2, true, spd*2);
				break;
			case  3:			//下からランダムブロック
				$gameScreen.startCover(3, true, spd*2);
				break;
			case  4:			//ブラインド
				$gameScreen.startCover(4, true, spd);
				break;
			case 16:			//ズーム
				$gameScreen.startZoomEx(1.0, 32.0, spd);
				this.startFadeOut(spd, false);
				break;
			case 17:			//モザイク
				$gameScreen.startCover(17, true, spd*2);
				break;
			case 18:			//ラスター
				$gameScreen.startCover(18, true, spd*2);
				break;
			case 19:			//瞬間消去
				this.finishFade();
				break;
			case 20:			//消去しない（≒何も演出しない）
				break;
			default:			//デフォルト：フェード
				this.startFadeOut(spd, false);
				break;
			}
		}
	};
	//-----------------------------------------------------------------------------
	//	シーンマップ：フェードイン処理をオーバーロード
	//-----------------------------------------------------------------------------
	Scene_Map.prototype.fadeInForTransfer = function() {
		//console.log("-- fadeInForTransfer -- no="+$screenMoveType[1]+" speed="+this.fadeSpeed());
		if ($screenMoveType[1] < 0) {
			//MVの元の動作
			var fadeType = $gamePlayer.fadeType();
			switch (fadeType) {
			case 0: case 1:
				this.startFadeIn(this.fadeSpeed(), fadeType === 1);
				break;
			}
		} else {
			//2003対応追加動作
			var spd = this.fadeSpeed();
			$gameScreen.clearZoom();
			switch($screenMoveType[1]) {
			case  2:			//上からランダムブロック
				$gameScreen.startCover(2, false, spd*2);
				break;
			case  3:			//下からランダムブロック
				$gameScreen.startCover(3, false, spd*2);
				break;
			case  4:			//ブラインド
				$gameScreen.startCover(4, false, spd);
				break;
			case 16:			//ズーム
				$gameScreen.startZoomEx(32.0, 1.0, spd);
				this.startFadeIn(spd, false);
				break;
			case 17:			//モザイク
				$gameScreen.startCover(17, false, spd*2);
				break;
			case 18:			//ラスター
				$gameScreen.startCover(18, false, spd*2);
				break;
			case 19:			//瞬間表示
				this.clearFade();
				break;
			default:			//デフォルト：フェード
				this.startFadeIn(spd, false);
				break;
			}
		}
	};
	//-----------------------------------------------------------------------------
	//	シーンマップ：Busy状態をオーバーロード
	//-----------------------------------------------------------------------------
	Scene_Map.prototype.isBusy = function() {
		return ((this._messageWindow && this._messageWindow.isClosing()) ||
				this._waitCount > 0 || this._encounterEffectDuration > 0 ||
				$gameScreen.isCover() ||		//「特殊画面切り替え中？」を追加
				Scene_Base.prototype.isBusy.call(this));
	};
	//-----------------------------------------------------------------------------
	//	シーンマップ：追加
	//-----------------------------------------------------------------------------
	//フェードクリア
	Scene_Map.prototype.clearFade = function() {
		this.createFadeSprite(false);
		this._fadeSign = 0;
		this._fadeDuration = 0;
		this._fadeSprite.opacity = 0;
	};
	//フェード即終了（画面を黒で覆う）
	Scene_Map.prototype.finishFade = function() {
		this.createFadeSprite(false);
		this._fadeSign = 0;
		this._fadeDuration = 0;
		this._fadeSprite.opacity = 255;
	};

	//-----------------------------------------------------------------------------
	//	ゲームスクリーン：初期化を継承
	//-----------------------------------------------------------------------------
	var _Game_Screen_clear = Game_Screen.prototype.clear;
	Game_Screen.prototype.clear = function() {
		_Game_Screen_clear.call(this);

		//「特殊画面切り替え」初期化
		this.clearCover();
	};
	//-----------------------------------------------------------------------------
	//	ゲームスクリーン：アップデートを継承
	//-----------------------------------------------------------------------------
	var _Game_Screen_update = Game_Screen.prototype.update;
	Game_Screen.prototype.update = function() {
		_Game_Screen_update.call(this);

		//「特殊画面切り替え」処理
		if (this._coverNo > 0) {			//起動中？
			if (!this._coverEnd) {
				this._coverDuration--;			//カウントダウン
				if (this._coverDuration <= 0) {		//終了時
					this._coverDuration = 0;
					if (this._coverSign) {				//アウト系
						this._coverEnd = true;				//最後の状態で停止
					} else {							//イン系
						this.clearCover();					//消滅
					}
				}
			}
		}
	};
	//-----------------------------------------------------------------------------
	//	ゲームスクリーン：外部から呼び出し用追加
	//-----------------------------------------------------------------------------
	//特殊画面切り替え初期化
	Game_Screen.prototype.clearCover = function() {
		this._coverNo = 0;
		this._coverFirst = false;
		this._coverSign = true;
		this._coverDuration = 0;
		this._coverMax = 0;
		this._coverEnd = false;
	};
	//即フェードアウト状態にする
	Game_Screen.prototype.finishFade = function() {
		this._brightness = 0;
		this._fadeOutDuration = 0;
		this._fadeInDuration = 0;
	};
	//ズーム処理開始
	Game_Screen.prototype.startZoomEx = function(staZoom, endZoom, speed) {
		var dx = ($gamePlayer.x - $gameMap.displayX() + 0.5) * $gameMap.tileWidth();
		var dy = ($gamePlayer.y - $gameMap.displayY() + 0.5) * $gameMap.tileHeight();
		this.setZoom(dx, dy, staZoom);
		this.startZoom(dx, dy, endZoom, speed);
	};
	//特殊画面切り替え開始
	Game_Screen.prototype.startCover = function(no, sign, duration) {
		this._coverNo = no;
		this._coverFirst = true;
		this._coverSign = sign;
		this._coverDuration = duration;
		this._coverMax = duration;
		this._coverEnd = false;
	};
	//-----------------------------------------------------------------------------
	//	ゲームスクリーン：外部から参照用追加
	//-----------------------------------------------------------------------------
	//特殊画面切り替え番号（０だと停止中）
	Game_Screen.prototype.coverNo = function() {
		return this._coverNo;
	};
	//特殊画面切り替え最初確認（一度呼ぶとフラグが落ち最初ではなくなる）
	Game_Screen.prototype.isCoverFirst = function() {
		var flag = this._coverFirst;
		this._coverFirst = false;
		return flag;
	};
	//特殊画面切り替え状態カウンタ
	Game_Screen.prototype.coverCount = function() {
		if (this._coverSign) {
			return (this._coverMax - this._coverDuration) / this._coverMax;
		} else {
			return this._coverDuration / this._coverMax;
		}
	};
	//特殊画面切り替え中？
	Game_Screen.prototype.isCover = function() {
		return (this._coverNo > 0 && this._coverDuration > 0);
	};

	//-----------------------------------------------------------------------------
	//	特殊画面切り替え専用スプライト
	//-----------------------------------------------------------------------------
	//Spriteを継承して新規作成
	function Sprite_Cover() {
		this.initialize.apply(this, arguments);
	}
	Sprite_Cover.prototype = Object.create(Sprite.prototype);
	Sprite_Cover.prototype.constructor = Sprite_Cover;
	//初期化
	Sprite_Cover.prototype.initialize = function() {
		Sprite.prototype.initialize.call(this);
		//console.log("-- Sprite_Cover.initialize -- ");
		$gameScreen.clearCover();
		var w = Graphics.width;
		var h = Graphics.height;
		this.buff = new Array(16);
		this.bitmap = new Bitmap(w, h);
		this.shuffle = new Array(80*60);
	};
	//アップデート処理
	Sprite_Cover.prototype.update = function() {
		Sprite.prototype.update.call(this);

		var w = Graphics.width;
		var h = Graphics.height;

		this.bitmap.clear();

		var coverNo = $gameScreen.coverNo();
		if (coverNo > 0) {
			var coverCount = $gameScreen.coverCount();
			switch(coverNo) {
			//-----------------------------------------------------------------------------
			//	ランダムブロック
			//-----------------------------------------------------------------------------
			case  2:			//上からランダムブロック
			case  3:			//下からランダムブロック
				{
					if ($gameScreen.isCoverFirst()) {			//最初のフレームのみ処理
						var num = 80 * 60;
						var nlist = new Array(num);					//ブロック用のランダム番号リストを作成
						for (var i=0; i<num; i++) nlist[i] = coverNo==2? i:num-1-i;		//(「下から」だとリストを反転)
						for (var i=0; i<80*60; i++,num--) {
							var rate = (8 + Math.floor(i/80)) / 60;				//ランダムで取り出すリスト範囲を限定（基点８行で段々行数を増やす）
							if (rate > 1.0) rate = 1.0;
							var rnd = 1.0 - Math.sin( Math.random()*(0.5*Math.PI) );	//0側が濃く、1.0側が薄い乱数

							rnd = Math.floor(num * rate * rnd);					//取り出し位置確定
							if (rnd >= num) rnd--;
							this.shuffle[i] = nlist[rnd];						//リストから番号取得（その後、取得値以降のリストを前にズラす）
							for (var j=rnd; j<num-1; j++) nlist[j] = nlist[j+1];
						}
					}

					var time = Math.floor(80.0 * 60.0 * coverCount);
					//console.log("-- block -- time="+time);

					for (var i=0; i<time; i++) {				//ランダムリストにそってブロック状に黒で塗る
						var no = this.shuffle[i];
						var sx = Math.floor(no % 80) * 12;
						var sy = Math.floor(no / 80) * 12;
						this.bitmap.fillRect(sx, sy, 12, 12, "black");
					}
				}
				break;
			//-----------------------------------------------------------------------------
			//	ブラインド
			//-----------------------------------------------------------------------------
			case  4:
				{
					var time = parseInt(24.0 * coverCount);
					for (var sy=0; sy<h; sy+=24) {
						this.bitmap.fillRect(0, sy, w, time, "black");
					}
				}
				break;
			//-----------------------------------------------------------------------------
			//	モザイク
			//-----------------------------------------------------------------------------
			case 17:
				{
					var wq = w / 4;
					var hq = h / 4;
					if ($gameScreen.isCoverFirst()) {			//最初のフレームのみ処理
						for (var i=0; i<16; i++) {					//全モザイクフレーム分、画像を事前生成
							this.buff[i] = new Bitmap(wq, hq);			//容量削減の為、作成画像は１６分の１サイズ
							if (i == 0) {
								var snap = SceneManager.snap();			//最初のフレームはスナップショット（の１６分の１画像）
								this.buff[0].blt(snap, 0, 0, w, h, 0, 0, wq, hq);
							} else {
								var srcImageData = this.buff[0]._context.getImageData(0, 0, wq, hq);
								var desImageData = this.buff[i]._context.getImageData(0, 0, wq, hq);
								var srcP = srcImageData.data;			//スナップショット＝「元データ」
								var desP = desImageData.data;			//各フレーム画像　＝「先データ」
								for (var sy=0; sy<hq; sy++) {			//「元データ」全ドットを「先データ」にモザイク状に配置。
									for (var sx=0; sx<wq; sx++) {
										var j = (sy * 4 * wq) + (sx * 4);
										var my = sy - (sy % (i+1));
										var ms = sx - (sx % (i+1));
										var k = (my * 4 * wq) + (ms * 4);
										desP[j  ] = srcP[k  ];
										desP[j+1] = srcP[k+1];
										desP[j+2] = srcP[k+2];
										desP[j+3] = srcP[k+3];
									}
								}
								this.buff[i]._context.putImageData(desImageData, 0, 0);
								this.buff[i]._setDirty();				//「先データ」配置を反映。
							}
						}
					}
					var time = parseInt(16.0 * coverCount);		//事前作成したモザイク画像をフレーム毎に転送
					if (time <=  0) time =  0;
					if (time >= 15) time = 15;
					//console.log("-- cover 17 -- time="+time+" q="+wq+","+hq+" buff="+this.buff[time].width+","+this.buff[time].height);
					this.bitmap.blt(this.buff[time], 0, 0, wq, hq, 0, 0, w, h);

				}
				break;
			//-----------------------------------------------------------------------------
			//	ラスター
			//-----------------------------------------------------------------------------
			case 18:
				{
					var wq = w / 4;
					var hq = h / 4;
					if ($gameScreen.isCoverFirst()) {			//最初のフレームのみ処理
						for (var i=0; i<16; i++) {					//全ラスターフレーム分、画像を事前生成
							this.buff[i] = new Bitmap(wq, hq);			//容量削減の為、作成画像は１６分の１サイズ
							if (i == 0) {
								var snap = SceneManager.snap();			//最初のフレームはスナップショット（の１６分の１画像）
								this.buff[0].blt(snap, 0, 0, w, h, 0, 0, wq, hq);
							} else {
								var rasW = i * 2.0;// * 5.0;
								var rasX = new Array(24);
								for (var j = 0; j < 24; j++) {
									var ms = Math.sin((j+i*2.0) * (2.0*Math.PI) / 24.0);
									//rasX[j] = parseInt(ms * rasW);
									rasX[j] = Math.round(ms * rasW);
								}
								var srcImageData = this.buff[0]._context.getImageData(0, 0, wq, hq);
								var desImageData = this.buff[i]._context.getImageData(0, 0, wq, hq);
								var srcP = srcImageData.data;			//スナップショット＝「元データ」
								var desP = desImageData.data;			//各フレーム画像　＝「先データ」
								for (var sy=0; sy<hq; sy++) {			//「元データ」全ドットを「先データ」にラスター状に配置。
									for (var sx=0; sx<wq; sx++) {
										var rx = parseInt(rasX[sy % 24] + sx);
											if (rx >= 0 && rx < wq) {
											var j = (sy * 4 * wq) + (rx * 4);
											var k = (sy * 4 * wq) + (sx * 4);
											desP[j  ] = srcP[k  ];
											desP[j+1] = srcP[k+1];
											desP[j+2] = srcP[k+2];
											desP[j+3] = srcP[k+3];
										}
									}
								}
								this.buff[i]._context.putImageData(desImageData, 0, 0);
								this.buff[i]._setDirty();				//「先データ」配置を反映。

							}
						}
					}
					var time = parseInt(16.0 * coverCount);		//事前作成したラスター画像をフレーム毎に転送
					if (time <=  0) time =  0;
					if (time >= 15) time = 15;
					//console.log("-- cover 18 -- time="+time+" q="+wq+","+hq+" buff="+this.buff[time].width+","+this.buff[time].height);
					this.bitmap.blt(this.buff[time], 0, 0, wq, hq, 0, 0, w, h);

				}
				break;
			}
		} else {
			for (var i=0; i<16; i++) this.buff[i] = null;
		}
	};

	//-----------------------------------------------------------------------------
	/*
	 * ピクチャー表示＆移動コマンドに、
	 *「RGBS変化」「回転描画」「波形描画」「マップ連動」を追加。
	 * ・MVには本来無いパラメータも渡されるので、それを使う処理を追加。
	 * ・「RGBA変化」「回転描画」はMVにも別命令として存在するので、その機能を起動。
	 * ・「波形描画」はMVに無いので、別途機能追加して、それらを呼び出し。
	 * ・「マップ連動」はMVに無いので、別途機能追加して、それらを呼び出し。
	 */
	//-----------------------------------------------------------------------------
	// Show Pictureのオーバーロード
	//-----------------------------------------------------------------------------
	Game_Interpreter.prototype.command231 = function() {
		var x, y;
		if (this._params[3] === 0) {  // Direct designation
			x = this._params[4];
			y = this._params[5];
		} else {  // Designation with variables
			x = $gameVariables.value(this._params[4]);
			y = $gameVariables.value(this._params[5]);
		}
		$gameScreen.showPicture(this._params[0], this._params[1], this._params[2],
			x, y, this._params[6], this._params[7], this._params[8], this._params[9]);

		//R,G,B,Sパラメータを取得して変化機能起動。
		// params[10,11,12,13] = R,G,B,A
		if (this._params[10] != 100 || this._params[11] != 100 || this._params[12] != 100 || this._params[13] != 100) {
			var rgb = [	 (this._params[10] - 100) * 240 / 100,
						 (this._params[11] - 100) * 240 / 100,
						 (this._params[12] - 100) * 240 / 100,
						-(this._params[13] - 100) * 255 / 100 ];
			$gameScreen.tintPicture(this._params[0], rgb, 0);
		}
		//特殊動作番号＝回転描画の場合、回転機能起動。
		// params[14] = 特殊動作番号
		//       [15] = 速度
		if (this._params[14] == 1) {
			$gameScreen.rotatePicture(this._params[0], this._params[15]);
		}
		//特殊動作番号＝波形描画の場合、機能追加した処理に渡す。
		// params[14] = 特殊動作番号
		//       [15] = 強度
		if (this._params[14] == 2) {
			$gameScreen.rasterPicture(this._params[0], this._params[15]);
		}
		//表示位置をマップスクロールに連動させる。
		// params[16] = 連動フラグ
		if (this._params[16] != 0) {
			$gameScreen.onMapSyncPicture(this._params[0]);
		}

		return true;
	};
	//-----------------------------------------------------------------------------
	// Move Pictureのオーバーロード
	//-----------------------------------------------------------------------------
	Game_Interpreter.prototype.command232 = function() {
		var x, y;
		if (this._params[3] === 0) {  // Direct designation
			x = this._params[4];
			y = this._params[5];
		} else {  // Designation with variables
			x = $gameVariables.value(this._params[4]);
			y = $gameVariables.value(this._params[5]);
		}
		$gameScreen.movePicture(this._params[0], this._params[2], x, y, this._params[6],
			this._params[7], this._params[8], this._params[9], this._params[10]);
		if (this._params[11]) {
			this.wait(this._params[10]);
		}

		//R,G,B,Sパラメータを取得して変化機能起動。
		// params[12,13,14,15] = R,G,B,A
		if (this._params[12] != 100 || this._params[13] != 100 || this._params[14] != 100 || this._params[15] != 100) {
			var rgb = [	 (this._params[12] - 100) * 240 / 100,
						 (this._params[13] - 100) * 240 / 100,
						 (this._params[14] - 100) * 240 / 100,
						-(this._params[15] - 100) * 255 / 100 ];
			$gameScreen.tintPicture(this._params[0], rgb, this._params[10]);
		}

		//特殊動作番号＝回転描画の場合、回転機能起動。
		// params[16] = 特殊動作番号
		//       [17] = 速度
		var pic = $gameScreen.picture(this._params[0]);
		if (pic) {

			if (this._params[16] == 1) {
				if (pic.rotationSpeed() > 0 || pic.raster() > 0) {	//元々、動作中でなければ動きださない（2003仕様）
					$gameScreen.rotatePicture(this._params[0], this._params[17]);
				}
			//特殊動作番号＝波形描画の場合、機能追加した処理に渡す。
			// params[16] = 特殊動作番号
			//       [17] = 強度
			} else if (this._params[16] == 2) {
				if (pic.rotationSpeed() > 0 || pic.raster() > 0) {	//元々、動作中でなければ動きださない（2003仕様）
					$gameScreen.rasterPicture(this._params[0], this._params[17]);
				}
			//動作無いの場合は停止。
			} else {
				$gameScreen.rotatePicture(this._params[0], 0);
				$gameScreen.rasterPicture(this._params[0], 0);
			}

		}

		return true;
	};

	//-----------------------------------------------------------------------------
	/*
	 * スクリーン処理に「波形描画」処理を追加実装。
	 * ・イベントコマンドから起動を呼び出せるように、命令を追加。
	 * ・マップ連動用の命令を追加。
	 */
	//-----------------------------------------------------------------------------
	//	波形用に追加
	//-----------------------------------------------------------------------------
	Game_Screen.prototype.rasterPicture = function(pictureId, power) {
		var picture = this.picture(pictureId);
		if (picture) {
			picture.setRaster(power);			//波形強度を渡す（０だとＯＦＦの意味）
		}
	};
	//-----------------------------------------------------------------------------
	//	マップ連動用に追加
	//-----------------------------------------------------------------------------
	Game_Screen.prototype.onMapSyncPicture = function(pictureId) {
		var picture = this.picture(pictureId);
		if (picture) {
			picture.onMapSync();				//マップ連動起動
		}
	};

	//-----------------------------------------------------------------------------
	/*
	 * ピクチャー管理に「波形描画」処理を追加実装。
	 * ・波形用のパラメータを追加。
	 * ・回転処理の速度を2003風に。
	 * ・マップ連動用のパラメータ及び処理を追加。
	 */
	//-----------------------------------------------------------------------------
	//	座標取得をオーバーロード
	//-----------------------------------------------------------------------------
	Game_Picture.prototype.x = function() {
		return this._x + this._mapSyncOX;		//マップ連動用オフセットを追加
	};
	Game_Picture.prototype.y = function() {
		return this._y + this._mapSyncOY;		//マップ連動用オフセットを追加
	};
	//-----------------------------------------------------------------------------
	//	移動設定をオーバーロード
	//-----------------------------------------------------------------------------
	Game_Picture.prototype.move = function(origin, x, y, scaleX, scaleY,
										   opacity, blendMode, duration) {
		this._origin = origin;
		this._targetX = x;
		this._targetY = y;
		this._targetScaleX = scaleX;
		this._targetScaleY = scaleY;
		this._targetOpacity = opacity;
		this._blendMode = blendMode;
		this._duration = duration;
		//マップ連動用に追記
		if (this._mapSyncF) {
			this._x += this._mapSyncDX - $gameMap.displayX() * $gameMap.tileWidth();	//（下記連動基準座標を変える前に、現在の座標をそれに合わせて修正）
			this._y += this._mapSyncDY - $gameMap.displayY() * $gameMap.tileHeight();
			this._mapSyncDX = $gameMap.displayX() * $gameMap.tileWidth();				//マップ連動用の基準座標を改めて、現状を設定。
			this._mapSyncDY = $gameMap.displayY() * $gameMap.tileHeight();
		}
	};
	//-----------------------------------------------------------------------------
	//	回転初期化をオーバーロード
	//-----------------------------------------------------------------------------
	Game_Picture.prototype.initRotation = function() {
		this._angle = 0;
		this._rotationSpeed = 0;
		this._raster = 0;			//波形用変数
		this._mapSyncF = false;		//マップ連動
		this._mapSyncOX = 0;
		this._mapSyncOY = 0;
	};
	//-----------------------------------------------------------------------------
	//	回転動作をオーバーロード
	//-----------------------------------------------------------------------------
	Game_Picture.prototype.rotate = function(speed) {
		this._rotationSpeed = speed;
		if (speed == 0) this._angle = 0;	//０の場合は角度もクリアする（2003仕様）
	};
	//-----------------------------------------------------------------------------
	//	イベントコマンド用に追加：回転速度の取得（コマンドから参照したいので）
	//-----------------------------------------------------------------------------
	Game_Picture.prototype.rotationSpeed = function() {
		return this._rotationSpeed;
	};
	//-----------------------------------------------------------------------------
	//	波形用に追加：波形強度の設定＆取得
	//-----------------------------------------------------------------------------
	Game_Picture.prototype.setRaster = function(power) {
		this._raster = power;
	};
	Game_Picture.prototype.raster = function() {
		return this._raster;
	};
	//-----------------------------------------------------------------------------
	//	マップ連動用に追加：マップ連動の設定
	//-----------------------------------------------------------------------------
	Game_Picture.prototype.onMapSync = function() {
		this._mapSyncF = true;
		this._mapSyncDX = $gameMap.displayX() * $gameMap.tileWidth();
		this._mapSyncDY = $gameMap.displayY() * $gameMap.tileHeight();
	};
	//-----------------------------------------------------------------------------
	//	マップ連動用に追加：マップ連動フラグのチェック
	//-----------------------------------------------------------------------------
	Game_Picture.prototype.isMapSync = function() {
		return this._mapSyncF;
	};
	//-----------------------------------------------------------------------------
	//	回転処理をオーバーロード
	//-----------------------------------------------------------------------------
	Game_Picture.prototype.updateRotation = function() {
		//1.3.0
		//if (this._rotationSpeed > 0) {
		if (this._rotationSpeed !== 0) {
		//-----
			//this._angle += this._rotationSpeed / 2;
			this._angle += this._rotationSpeed * 1.45;		//回転速度を2003風に。
		}
		//マップ連動の処理追加
		if (this._mapSyncF) {
			this._mapSyncOX = this._mapSyncDX - $gameMap.displayX() * $gameMap.tileWidth();
			this._mapSyncOY = this._mapSyncDY - $gameMap.displayY() * $gameMap.tileHeight();
		} else {
			this._mapSyncOX = 0;
			this._mapSyncOY = 0;
		}
	};

	//-----------------------------------------------------------------------------
	/*
	 * ピクチャースプライトに「波形描画」処理を追加実装。
	 * ・波形用のパラメータを追加、updateにパラメータ処理を追加。
	 * ・リフレッシュをオーバーロードして、波形描画を挟み込む。
	 * ・MVには波形描画は無いので、Canvasを使って自前で実装。
	 */
	//-----------------------------------------------------------------------------
	//	初期化をオーバーロード
	//-----------------------------------------------------------------------------
	Sprite_Picture.prototype.initialize = function(pictureId) {
		Sprite.prototype.initialize.call(this);
		this._pictureId = pictureId;
		this._pictureName = '';
		this._isPicture = true;		//1.3.0
		this.raster = 0;			//波形用に追加
		this.timer = 0;				//波形用に追加
		this.update();
	};
	//-----------------------------------------------------------------------------
	//	アップデート(その他)処理をオーバーロード
	//-----------------------------------------------------------------------------
	Sprite_Picture.prototype.updateOther = function() {
		var picture = this.picture();
		this.opacity = picture.opacity();
		this.blendMode = picture.blendMode();
		this.rotation = picture.angle() * Math.PI / 180;
		this.raster = picture.raster();
		if (this.raster > 0) {		//波形用に追加
			this.timer++;				//起動中はタイムカウント
			this._refresh();			//マイフレーム、リフレッシュする。
		}
	};
	//-----------------------------------------------------------------------------
	//	リフレッシュ処理をオーバーロード
	//-----------------------------------------------------------------------------
	//元来「Sprite」のメンバー。Pictureのみ用としてオーバーロード
	Sprite_Picture.prototype._refresh = function() {
		var frameX = Math.floor(this._frame.x);
		var frameY = Math.floor(this._frame.y);
		var frameW = Math.floor(this._frame.width);
		var frameH = Math.floor(this._frame.height);
		var bitmapW = this._bitmap ? this._bitmap.width : 0;
		var bitmapH = this._bitmap ? this._bitmap.height : 0;
		var realX = frameX.clamp(0, bitmapW);
		var realY = frameY.clamp(0, bitmapH);
		var realW = (frameW - realX + frameX).clamp(0, bitmapW - realX);
		var realH = (frameH - realY + frameY).clamp(0, bitmapH - realY);

		this._realFrame.x = realX;
		this._realFrame.y = realY;
		this._realFrame.width = realW;
		this._realFrame.height = realH;
		this._offset = this._offset || {};
		this._offset.x = realX - frameX;
		this._offset.y = realY - frameY;

		if (realW > 0 && realH > 0) {
			if (this._needsTint()) {
				this._createTinter(realW, realH);
				this._executeTint(realX, realY, realW, realH);
				if (this.raster > 0) {								//波形描画を追加
					this._executeRaster(realX, realY, realW, realH);	//Tintが生成したテクスチャに更に波形処理を施す。
				}
				this._tintTexture.update();
				this.texture.baseTexture = this._tintTexture;
				this.texture.frame = new Rectangle(0, 0, realW, realH);
			} else {
				if (this._bitmap) {
					if (this.raster > 0) {									//波形描画を追加
						this._createTinter(realW, realH);
						this._executeRasterBefore(realX, realY, realW, realH);	//まず、素の画像をTintテクスチャとして設定
						this._executeRaster(realX, realY, realW, realH);		//波形処理
						this._tintTexture.update();
						this.texture.baseTexture = this._tintTexture;
					} else {
						this.texture.baseTexture = this._bitmap.baseTexture;
					}
					//this.texture.baseTexture = this._bitmap.baseTexture;
				}
				this.texture.frame = this._realFrame;
			}
		} else if (this._bitmap) {
			this.texture.frame = Rectangle.emptyRectangle;
		} else {
			//TODO: remove this
			this.texture.baseTexture.width = Math.max(this.texture.baseTexture.width, this._frame.x + this._frame.width);
			this.texture.baseTexture.height = Math.max(this.texture.baseTexture.height, this._frame.y + this._frame.height);
			this.texture.frame = this._frame;
		}
	};
	//-----------------------------------------------------------------------------
	//	波形用に追加：素の画像をTintテクスチャとして設定
	//-----------------------------------------------------------------------------
	Sprite_Picture.prototype._executeRasterBefore = function(x, y, w, h) {
		var context = this._context;
		context.globalCompositeOperation = 'copy';
		context.drawImage(this._bitmap.canvas, x, y, w, h, 0, 0, w, h);
	};
	//-----------------------------------------------------------------------------
	//	波形用に追加：「波形変形」処理（自前実装）
	//-----------------------------------------------------------------------------
	Sprite_Picture.prototype._executeRaster = function(x, y, w, h) {
		//タイマーと強度から、波形用のＸオフセット値を「１波」分、生成する。
		var tim  = this.timer * 3;		//タイマーより波位置
		var rasW = this.raster * 12;	//強度より波幅
		var rasX = new Array(96);
		for (var i = 0; i < 96; i++) {
			var ms = Math.sin((i+tim) * (2.0*Math.PI) / 96.0);
			//rasX[i] = parseInt(ms * rasW);
			rasX[i] = Math.round(ms * rasW);
		}

		//元画像より「生成元」をメモリー上に確保。
		var context = this._context;
		var imageData = context.getImageData(0, 0, w, h);
		var desP = imageData.data;				//ドット単位に取得
		var srcP = new Array(desP.length);
		for (var i = 0; i < desP.length; i++) srcP[i] = desP[i];

		//元画像をクリア
		context.clearRect(0, 0, w, h);
		imageData = context.getImageData(0, 0, w, h);
		desP = imageData.data;					//クリアしたので、もう一度取得。

		//波画像を生成
		var rate = w / (w + rasW*2);			//波型により左右にハミでていまわに様に画像全体を縮める縮小値。
		var w2 = w / 2;
		for (var yi = 0; yi < h; yi++) {
			for (var xi = 0; xi < w; xi++) {		//生成したＸオフセット値と縮小値を元に座標計算
				var rx = parseInt( ((rasX[yi % 96] + xi) - w2) * rate + w2 );
				var si = (yi * 4 * w) + (xi * 4);
				var di = (yi * 4 * w) + (rx * 4);
				desP[di  ] = srcP[si  ];			//１ドットづつ「生成元」から「元画像」へ上書き
				desP[di+1] = srcP[si+1];
				desP[di+2] = srcP[si+2];
				desP[di+3] = srcP[si+3];
			}
		}
		context.putImageData(imageData, 0, 0);	//書き換えたイメージを設定。
	};

	//-----------------------------------------------------------------------------
	/*
	 * 遠景対応
	 * ・遠景画像サイズが必要なのでグローバル変素に取得（及び変数初期化を追加）
	 * ・自動スクロール速度の計算式を、2003風に。
	 * ・ループしない場合のマップ連動スクロールを、2003風に。
	 */
	//-----------------------------------------------------------------------------
	//	遠景作成処理をオーバーロード
	//-----------------------------------------------------------------------------
	Spriteset_Map.prototype.createParallax = function() {
		this._parallax = new TilingSprite();
		this._parallax.move(0, 0, Graphics.width, Graphics.height);
		this._baseSprite.addChild(this._parallax);
		$parallaxW = 0;		//サイズ変数初期化
		$parallaxH = 0;
	};
	//-----------------------------------------------------------------------------
	//	遠景画像設定を処理をオーバーロード
	//-----------------------------------------------------------------------------
	Spriteset_Map.prototype.updateParallax = function() {
		if (this._parallaxName !== $gameMap.parallaxName()) {
			this._parallaxName = $gameMap.parallaxName();
			//1.3.0
			//this._parallax.bitmap = ImageManager.loadParallax(this._parallaxName);
			if (this._parallax.bitmap && Graphics.isWebGL() != true) {
				this._canvasReAddParallax();
			} else {
				this._parallax.bitmap = ImageManager.loadParallax(this._parallaxName);
			}
			//-----
		}
		if (this._parallax.bitmap) {
			this._parallax.origin.x = $gameMap.parallaxOx();
			this._parallax.origin.y = $gameMap.parallaxOy();
			$parallaxW = this._parallax.bitmap.width;		//画像サイズ取得
			$parallaxH = this._parallax.bitmap.height;
		} else {
			$parallaxW = 0;									//（画像がない場合は０）
			$parallaxH = 0;
		}
	};

	//-----------------------------------------------------------------------------
	//	遠景自動スクロール処理をオーバーロード
	//-----------------------------------------------------------------------------
	//式：スピード = (1/6) x 2^parallaxSx
	Game_Map.prototype.updateParallax = function() {
		if (this._parallaxLoopX && this._parallaxSx != 0) {
			if (this._parallaxSx > 0) {		//「指数」がマイナス値はダメなので「式」自体を二つ用意。
				this._parallaxX += (Math.pow(2, this._parallaxSx) / 6) / this.tileWidth() / 2;
			} else {
				this._parallaxX -= (Math.pow(2,-this._parallaxSx) / 6) / this.tileWidth() / 2;
			}
		}
		if (this._parallaxLoopY && this._parallaxSy != 0) {
			if (this._parallaxSy > 0) {
				this._parallaxY += (Math.pow(2, this._parallaxSy) / 6) / this.tileHeight() / 2;
			} else {
				this._parallaxY -= (Math.pow(2,-this._parallaxSy) / 6) / this.tileHeight() / 2;
			}
		}
	};
	//-----------------------------------------------------------------------------
	//	遠景マップ連動スクロール処理をオーバーロード
	//-----------------------------------------------------------------------------
	//式：座標 = parallaxX * チップサイズ * (遠景画像サイズ - 画面サイズ) / ( (マップチップサイズ - 画面チップサイズ) * チップサイズ )
	//         = parallaxX * (遠景画像サイズ - 画面サイズ) / (マップチップサイズ - 画面チップサイズ）
	Game_Map.prototype.parallaxOx = function() {
		if (this._parallaxZero) {
			return this._parallaxX * this.tileWidth();
		} else if (this._parallaxLoopX) {
			return this._parallaxX * this.tileWidth() / 2;
		} else {
			if ($parallaxW > 0 && !this._parallaxLoopY) {	//画像があって縦もループしない場合
				var mapW = $dataMap.width - $ResolutionMapW;
				if (mapW > 0) {
					return this._parallaxX * ($parallaxW - $ResolutionMapW * this.tileWidth()) / mapW;
				}
			}
			return 0;
		}
	};
	Game_Map.prototype.parallaxOy = function() {
		if (this._parallaxZero) {
			return this._parallaxY * this.tileHeight();
		} else if (this._parallaxLoopY) {
			return this._parallaxY * this.tileHeight() / 2;
		} else {
			if ($parallaxH > 0 && !this._parallaxLoopX) {	//画像があって横もループしない場合
				var mapH = $dataMap.height - $ResolutionMapH;
				if (mapH > 0) {
					return this._parallaxY * ($parallaxH - $ResolutionMapH * this.tileHeight()) / mapH;
				}
			}
			return 0;
		}
	};

})();
