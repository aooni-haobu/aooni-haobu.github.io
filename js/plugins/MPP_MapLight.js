//=============================================================================
// MPP_MapLight.js
//=============================================================================
// Copyright (c) 2018-2020 Mokusei Penguin
// Released under the MIT license
// http://opensource.org/licenses/mit-license.php
//=============================================================================

/*:
 * @plugindesc 【v2.1】マップの明るさを設定できるようにします。
 * @author 木星ペンギン
 *
 * @help プラグインコマンド:
 *   SetCharLight eId r c o a      # キャラクターを中心に灯りを表示 ※1
 *   ShowMapLight lId x y          # 座標(x,y)に灯りを作成
 *   MoveMapLight lId r c o a      # 指定したIDの灯りを移動 ※1
 *   EraseMapLight lId             # 指定したIDの灯りを消去
 *   SetMapDarkness n              # マップの暗さ(0～255で指定 / 高いほど暗くなる)
 *   SetCusCharLight eId ci o a    # キャラクターを中心にカスタム灯りを表示 ※1
 * 
 * ※ プラグインコマンドにて指定する値には変数が使用できます。
 *    v[n] と記述することでn番の変数の値を参照します。
 * 
 * マップのメモ:
 *   <Darkness:n>                  # マップの暗さ(0～255で指定 / 高いほど暗くなる)
 *   <MapLight lId:x,y,r,c,o,a>    # 座標(x,y)を中心に灯りを表示 ※1
 * 
 * イベントの実行内容の注釈:
 *   灯り r c o a                   # このイベントを中心に灯りを表示 ※1
 * 
 * ※1 設定項目の説明
 *   r : 半径(1で1マス分)
 *   c : 色番号(プラグインパラメータで設定 / 0で消去)
 *   o : 不透明度(0～255で指定 / 未設定は255)
 *   a : 明滅の振れ幅(0.0～1.0で指定 / 0で明滅なし / 未設定は0)
 * 
 * ================================================================
 * ▼ プラグインコマンド 詳細
 * --------------------------------
 *  〇 SetCharLight eId r c o a
 *      eId : イベントID(0:このイベント, -1:プレイヤー)
 *      r   : 半径
 *      c   : 色番号
 *      o   : 不透明度
 *      a   : 明滅の振れ幅
 *   
 *   キャラクターを中心に灯りを表示します。
 *   
 * --------------------------------
 *  〇 ShowMapLight lId x y
 *      lId : 灯りID(任意の数値)
 *      x   : X座標
 *      y   : Y座標
 *   
 *   指定した座標(x,y)に灯りを作成および移動を行います。
 *   新規作成の場合、何も表示されない灯りが配置されます。
 *   
 *   作成した灯りはエリアチェンジでリセットされます。
 *   
 * --------------------------------
 *  〇 MoveMapLight lId r c o a
 *      lId : 灯りID(任意の数値)
 *      r   : 半径
 *      c   : 色番号
 *      o   : 不透明度
 *      a   : 明滅の振れ幅
 *   
 *   灯りのパラメータを変更します。
 *   
 * --------------------------------
 *  〇 SetCusCharLight eId ci o a
 *      eId : イベントID(0:このイベント, -1:プレイヤー)
 *      ci  : カスタム灯りの番号
 *      o   : 不透明度
 *      a   : 明滅の振れ幅
 *   
 *   キャラクターを中心にカスタム灯りを表示します。
 *   カスタム灯りはプラグインパラメータの[Custom Lights]にて設定してください。
 *   
 *   この機能を使用する場合、プラグインパラメータの[Darkness Size]の値を
 *   多少上げると、見栄えが良くなります。
 *   
 * 
 * ================================================================
 * ▼ マップのメモ 詳細
 * --------------------------------
 *  〇 <Darkness:n>
 *      n : マップの暗さ(0～255で指定 / 高いほど暗くなる)
 *   
 *   マップの暗さを指定します。
 *   数値が高いほど暗くなります。
 *   
 *   v[n] と記述することでn番の変数の値を参照します。
 *   ただし、参照されるのはマップの切り替えを行ったときのみです。
 * 
 * --------------------------------
 *  〇 <MapLight lId:x,y,r,c,o,a>
 *      lId : 灯りID(任意の数値)
 *      x   : X座標
 *      y   : Y座標
 *      r   : 半径
 *      c   : 色番号
 *      o   : 不透明度
 *      a   : 明滅の振れ幅
 *   
 *   マップに灯りを配置します。
 *   
 * 
 * ================================================================
 * ▼ プラグインパラメータ 詳細
 * --------------------------------
 *  〇 明るさレベルについて
 *   リージョンIDでそのタイルの明るさを設定できます。
 *   レベルが高いほど明るくなります。
 *   
 * --------------------------------
 *  〇 リージョンIDの配列指定
 *   数値を配列で設定する際、
 *   n-m と表記することでnからmまでの数値を指定できます。
 *   (例 : 1-4,8,10-12 => 1,2,3,4,8,10,11,12)
 * 
 * --------------------------------
 *  〇 Custom Lights
 *   キャラクターの向きに合わせて灯り画像を表示します。
 *   灯り画像は img/system フォルダに入れてください。
 *   
 *   画像はキャラクターが下を向いているときに表示されるものを用意してください。
 *   
 *   メモは特に使用しません。
 *   ユーザーがわかりやすくなるように活用してください。
 * 
 * --------------------------------
 *  〇 Plugin Commands / Map Metadata / Event Comments
 *   プラグインコマンドや注釈で使用するコマンドは、
 *   プラグインパラメータから変更できます。
 *   
 *   コマンドを短くしたり日本語にしたりなどして、自分が使いやすいようにしてください。
 *   
 *   プラグインコマンドのみ、変更後もデフォルトのコマンドでも動作します。
 * 
 * 
 * ================================================================
 * ▼ その他
 * --------------------------------
 *  〇 Shazさん制作のプラグイン『ChangeTileSize.js』と併用する場合、
 *    本プラグインが下になるように導入してください。
 * 
 * 
 * ================================
 * 制作 : 木星ペンギン
 * URL : http://woodpenguin.blog.fc2.com/
 * 
 * @param === Basic ===
 * @default 【基本的な設定】
 * 
 * @param Light Colors
 * @type string[]
 * @desc 灯りの色の配列
 * (上から色番号 1,2,3... となります)
 * @default ["255,255,255","192,128,64"]
 * @parent === Basic ===
 * 
 * @param Custom Lights
 * @type struct<CustomLight>[]
 * @desc カスタム灯りの配列
 * (上から色番号 1,2,3... となります)
 * @default ["{\"note\":\"サンプル\",\"File Name\":\"MapLight01\",\"Ox\":\"24\",\"Oy\":\"4\",\"Scale\":\"12.0\",\"Turn Duration\":\"24\"}"]
 * @parent === Basic ===
 * 
 * @param Light Level Enabled
 * @type boolean
 * @desc 明るさレベルの有効/無効
 * @default true
 * @parent === Basic ===
 * 
 * @param Light Level 1 Regions
 * @desc 明るさレベル1のリージョンIDの配列
 * (範囲指定可)
 * @default 1,9,17,25,33,41,49,57
 * @parent Light Level Enabled
 *
 * @param Light Level 2 Regions
 * @desc 明るさレベル2のリージョンIDの配列
 * (範囲指定可)
 * @default 2,10,18,26,34,42,50,58
 * @parent Light Level Enabled
 *
 * @param Light Level 3 Regions
 * @desc 明るさレベル3のリージョンIDの配列
 * (範囲指定可)
 * @default 3,11,19,27,35,43,51,59
 * @parent Light Level Enabled
 *
 * @param Light Level 4 Regions
 * @desc 明るさレベル4のリージョンIDの配列
 * (範囲指定可)
 * @default 4,12,20,28,36,44,52,60
 * @parent Light Level Enabled
 *
 * @param Light Level 5 Regions
 * @desc 明るさレベル5のリージョンIDの配列
 * (範囲指定可)
 * @default 5,13,21,29,37,45,53,61
 * @parent Light Level Enabled
 *
 * @param Light Level 6 Regions
 * @desc 明るさレベル6のリージョンIDの配列
 * (範囲指定可)
 * @default 6,14,22,30,38,46,54,62
 * @parent Light Level Enabled
 *
 * @param Light Level 7 Regions
 * @desc 明るさレベル7のリージョンIDの配列
 * (範囲指定可)
 * @default 7,15,23,31,39,47,55,63
 * @parent Light Level Enabled
 *
 * @param === Advanced ===
 * @default 【細かな設定】
 * 
 * @param Darkness Size
 * @type number
 * @min 1
 * @desc 1タイル当たりの暗さの解像度
 * @default 2
 * @parent === Advanced ===
 *
 *
 * @param === Command ===
 * @default 【コマンド関連】
 * 
 * @param Plugin Commands
 * @type struct<Plugin>
 * @desc プラグインコマンド名
 * @default {"SetCharLight":"SetCharLight","ShowMapLight":"ShowMapLight","MoveMapLight":"MoveMapLight","EraseMapLight":"EraseMapLight","SetMapDarkness":"SetMapDarkness","SetCusCharLight":"SetCusCharLight"}
 * @parent === Command ===
 * 
 * @param Map Metadata
 * @type struct<MapMetadata>
 * @desc マップメモ欄のデータ名
 * @default {"Darkness":"Darkness","MapLight":"MapLight"}
 * @parent === Command ===
 * 
 * @param Event Comments
 * @type struct<EventComments>
 * @desc イベントメモ欄のデータ名
 * @default {"Light":"灯り"}
 * @parent === Command ===
 * 
 *
 *
 */

/*~struct~CustomLight:
 * @param note
 * @desc メモ
 * @default 
 * 
 * @param File Name
 * @type file
 * @desc 画像ファイル名
 * @default
 * @require 1
 * @dir img/system/
 * 
 * @param Ox
 * @type number
 * @min -99999
 * @desc 画像の中心位置X
 * @default 0
 * 
 * @param Oy
 * @type number
 * @min -99999
 * @desc 画像の中心位置Y
 * @default 0
 * 
 * @param Scale
 * @type number
 * @decimals 1
 * @desc 画像の倍率
 * @default 1.0
 * 
 * @param Turn Duration
 * @type number
 * @desc 回転にかかる時間
 * @default 10
 * 
 */

/*~struct~Plugin:
 * @param SetCharLight
 * @desc キャラクターを中心に灯りを表示
 * @default SetCharLight
 * 
 * @param ShowMapLight
 * @desc 座標(x,y)を中心に灯りを作成
 * @default ShowMapLight
 * 
 * @param MoveMapLight
 * @desc 指定したIDの灯りを移動
 * @default MoveMapLight
 * 
 * @param EraseMapLight
 * @desc 指定したIDの灯りを消去
 * @default EraseMapLight
 * 
 * @param SetMapDarkness
 * @desc マップ全体の暗さ
 * @default SetMapDarkness
 * 
 * @param SetCusCharLight
 * @desc キャラクターを中心にカスタム灯りを表示
 * @default SetCusCharLight
 * 
 */

/*~struct~MapMetadata:
 * @param Darkness
 * @desc マップの暗さ
 * @default Darkness
 * 
 * @param MapLight
 * @desc 座標(x,y)を中心に灯りを表示
 * @default MapLight
 * 
 */

/*~struct~EventComments:
 * @param Light
 * @desc このイベントを中心に灯りを表示
 * @default 灯り
 */

(function() {
    'use strict';

const Params = {};

{
    
    let parameters = PluginManager.parameters('MPP_MapLight');
    
    let convertParam = function(param) {
        var result = [];
        if (param) {
            var data = param.split(',');
            for (var i = 0; i < data.length; i++) {
                if (/(\d+)\s*-\s*(\d+)/.test(data[i])) {
                    for (var n = Number(RegExp.$1); n <= Number(RegExp.$2); n++) {
                        result.push(n);
                    }
                } else {
                    result.push(Number(data[i]));
                }
            }
        }
        return result;
    };
    function reviverParse(key, value) {
        try {
            return JSON.parse(value);
        } catch (e) {
            return value;
        }
    }

    //=== Basic ===
    Params.LightColors = JSON.parse(parameters['Light Colors']);
    Params.CustomLights = JSON.parse(parameters['Custom Lights'], reviverParse);
    Params.LightLevelEnabled = eval(parameters['Light Level Enabled'] || "true");
    Params.LightRegions = [];
    Params.LightRegions[1] = convertParam(parameters['Light Level 1 Regions']);
    Params.LightRegions[2] = convertParam(parameters['Light Level 2 Regions']);
    Params.LightRegions[3] = convertParam(parameters['Light Level 3 Regions']);
    Params.LightRegions[4] = convertParam(parameters['Light Level 4 Regions']);
    Params.LightRegions[5] = convertParam(parameters['Light Level 5 Regions']);
    Params.LightRegions[6] = convertParam(parameters['Light Level 6 Regions']);
    Params.LightRegions[7] = convertParam(parameters['Light Level 7 Regions']);
    
    //=== Advanced ===
    Params.DarknessSize = Number(parameters['Darkness Size'] || 2);
    
    //=== Command ===
    Params.PluginCommands = JSON.parse(parameters['Plugin Commands']);
    Params.MapMetadata = JSON.parse(parameters['Map Metadata']);
    Params.EventComments = JSON.parse(parameters['Event Comments']);
    
    
    Params.contains = {};
    Params.contains['ChangeTileSize'] = $plugins.some(function(plugin) {
        return (plugin.name === 'ChangeTileSize' && plugin.status);
    });

}

const Alias = {};

//-----------------------------------------------------------------------------
// Tilemap

//4529
Alias.Tilemap_initialize = Tilemap.prototype.initialize;
Tilemap.prototype.initialize = function() {
    Alias.Tilemap_initialize.apply(this, arguments);
    if (Params.contains['ChangeTileSize']) this._createLayers();
};

//4734
Alias.Tilemap_updateTransform = Tilemap.prototype.updateTransform;
Tilemap.prototype.updateTransform = function() {
    var ox = Math.floor(this.origin.x);
    var oy = Math.floor(this.origin.y);
    var startX = Math.floor((ox - this._margin) / this._tileWidth);
    var startY = Math.floor((oy - this._margin) / this._tileHeight);
    var needUpdate = this.needDarknessRepaint(startX, startY);
    if (needUpdate) {
        this.moveDarkness(startX * this._tileWidth - ox, startY * this._tileHeight - oy);
    }
    Alias.Tilemap_updateTransform.apply(this, arguments);
    if (needUpdate) {
        this._updateDarkness(startX, startY);
        this._darknessStarted = true;
    }
};

Tilemap.prototype.needDarknessRepaint = function(startX, startY) {
    return (this._needsRepaint ||
            this._lastStartX !== startX || this._lastStartY !== startY ||
            !this._darknessStarted || Graphics.frameCount % 2 === 0);
};

Tilemap.prototype.moveDarkness = function(x, y) {
    this._darknessLayer.x = x;
    this._darknessLayer.y = y;
    this._darknessLayer.opacity = $gameMap.darknessOpacity;
};

//4757
Alias.Tilemap__createLayers = Tilemap.prototype._createLayers;
Tilemap.prototype._createLayers = function() {
    Alias.Tilemap__createLayers.apply(this, arguments);
    this._createDarknessLayer();
};

Tilemap.prototype._createDarknessLayer = function() {
    var width = this._width;
    var height = this._height;
    var margin = this._margin;
    var size = Params.DarknessSize;
    var tileCols = Math.ceil(width / this._tileWidth) + 1;
    var tileRows = Math.ceil(height / this._tileHeight) + 1;
    var layerWidth = tileCols * size;
    var layerHeight = tileRows * size;
    if (this._darknessBitmap) {
        this._darknessBitmap.resize(tileCols, tileRows);
    } else {
        this._darknessBitmap = new Bitmap(tileCols, tileRows);
    }
    var bitmap;
    if (this._darknessLayer) {
        bitmap = this._darknessLayer.bitmap;
        bitmap.resize(layerWidth, layerHeight);
        this._darknessLayer.bitmap = null;
    } else {
        this._darknessLayer = new Sprite();
        this._darknessLayer.z = 9;
        this._darknessLayer.opacity = 0;
        this._darknessLayer.blendMode = 2;
        this.addChild(this._darknessLayer);
        bitmap = new Bitmap(layerWidth, layerHeight);
        bitmap.smooth = true;
        bitmap.context.globalCompositeOperation = 'lighter';
    }
    this._darknessLayer.bitmap = bitmap;
    this._darknessLayer.move(-margin, -margin);
    this._darknessLayer.scale.x = this._tileWidth / size;
    this._darknessLayer.scale.y = this._tileHeight / size;
};

Tilemap.prototype._updateDarkness = function(startX, startY) {
    if (this._darknessLayer.opacity > 0) {
        this._darknessLayer.bitmap.clear();
        var w = this._darknessBitmap.width;
        var h = this._darknessBitmap.height;
        var dw = w * Params.DarknessSize;
        var dh = h * Params.DarknessSize;
        this._darknessLayer.bitmap.blt(this._darknessBitmap, 0, 0, w, h, 0, 0, dw, dh);
        var sx = startX - $gameMap.displayX();
        var sy = startY - $gameMap.displayY();
        var mapLights = $gameMap.allMapLights();
        for (var i = 0; i < mapLights.length; i++) {
            var light = mapLights[i];
            if (light.isValid()) {
                var dx = light.scrolledX() - sx + 0.5;
                var dy = light.scrolledY() - sy + 0.4;
                var alpha = light.opacity / 255;
                if (light.customIndex > 0) {
                    var custom = Params.CustomLights[light.customIndex - 1];
                    var angle = light.angle;
                    if (custom) this._drawCustomLidht(dx, dy, custom, angle, alpha);
                } else {
                    var rgb = Params.LightColors[light.colorIndex - 1];
                    var r = light.radius;
                    if (rgb) this._drawMapLidht(dx, dy, rgb, r, alpha);
                }
            }
        }
    }
};

Tilemap.prototype._drawCustomLidht = function(tx, ty, custom, angle, alpha) {
    var source = ImageManager.loadSystem(custom["File Name"]);
    if (source && source.isReady()) {
        var size = Params.DarknessSize;
        tx *= size;
        ty *= size;
        var bitmap = this._darknessLayer.bitmap;
        var context = bitmap.context;
        var rate = size * custom["Scale"];
        var sw = source.width;
        var sh = source.height;
        var dx = -custom["Ox"] * rate / this._tileWidth;
        var dy = -custom["Oy"] * rate / this._tileHeight;
        var dw = sw * rate / this._tileWidth;
        var dh = sh * rate / this._tileHeight;
        context.save();
        context.translate(tx, ty);
        context.rotate(angle * Math.PI / 180);
        context.globalAlpha = alpha;
        bitmap.blt(source, 0, 0, sw, sh, dx, dy, dw, dh);
        context.restore();
    }
};

Tilemap.prototype._drawMapLidht = function(dx, dy, rgb, r, alpha) {
    var size = Params.DarknessSize;
    dx *= size;
    dy *= size;
    r *= size;
    var bitmap = this._darknessLayer.bitmap;
    var context = bitmap.context;
    var grad = context.createRadialGradient(dx, dy, 0, dx, dy, r);
    grad.addColorStop(0, 'rgba(%1,1)'.format(rgb));
    grad.addColorStop(1, 'rgba(%1,0)'.format(rgb));
    context.globalAlpha = alpha;
    bitmap.drawCircle(dx, dy, r, grad);
    context.globalAlpha = 1;
};

//4842
Alias.Tilemap__paintAllTiles = Tilemap.prototype._paintAllTiles;
Tilemap.prototype._paintAllTiles = function(startX, startY) {
    Alias.Tilemap__paintAllTiles.apply(this, arguments);
    this._paintAllDarkness(startX, startY);
};

Tilemap.prototype._paintAllDarkness = function(startX, startY) {
    this._darknessBitmap.clear();
    var tileCols = this._darknessBitmap.width;
    var tileRows = this._darknessBitmap.height;
    var context = this._darknessBitmap.context;
    context.save();
    context.fillStyle = 'black';
    if (Params.LightLevelEnabled) {
        for (var y = 0; y < tileRows; y++) {
            for (var x = 0; x < tileCols; x++) {
                this._paintDarkness(startX, startY, x, y);
            }
        }
    } else {
        context.fillRect(0, 0, tileCols, tileRows) ;
    }
    context.restore();
    this._darknessBitmap._setDirty();
};

Tilemap.prototype._paintDarkness = function(startX, startY, x, y) {
    var regionId = this._readMapData(startX + x, startY + y, 5);
    var level = 0;
    for (var i = 1; i <= 7; i++) {
        if (Params.LightRegions[i].contains(regionId)) {
            level = i;
            break;
        }
    }
    var context = this._darknessBitmap.context;
    context.globalAlpha = 1 - level / 7;
    context.fillRect(x, y, 1, 1);
};

//-----------------------------------------------------------------------------
// ShaderTilemap

//5560
Alias.ShaderTilemap_updateTransform = ShaderTilemap.prototype.updateTransform;
ShaderTilemap.prototype.updateTransform = function() {
    if (this.roundPixels) {
        var ox = Math.floor(this.origin.x);
        var oy = Math.floor(this.origin.y);
    } else {
        var ox = this.origin.x;
        var oy = this.origin.y;
    }
    var startX = Math.floor((ox - this._margin) / this._tileWidth);
    var startY = Math.floor((oy - this._margin) / this._tileHeight);
    var needDarknessRepaint = this.needDarknessRepaint(startX, startY);
    if (needDarknessRepaint) {
        this.moveDarkness(startX * this._tileWidth - ox, startY * this._tileHeight - oy);
    }
    Alias.ShaderTilemap_updateTransform.apply(this, arguments);
    if (needDarknessRepaint) {
        this._updateDarkness(startX, startY);
        this._darknessStarted = true;
    }
};

//5586
Alias.ShaderTilemap__createLayers = ShaderTilemap.prototype._createLayers;
ShaderTilemap.prototype._createLayers = function() {
    Alias.ShaderTilemap__createLayers.apply(this, arguments);
    this._createDarknessLayer();
};

//5636
Alias.ShaderTilemap__paintAllTiles = ShaderTilemap.prototype._paintAllTiles;
ShaderTilemap.prototype._paintAllTiles = function(startX, startY) {
    Alias.ShaderTilemap__paintAllTiles.apply(this, arguments);
    this._paintAllDarkness(startX, startY);
};

//-----------------------------------------------------------------------------
// MppGame_MapLight

function MppGame_MapLight() {
    this.initialize.apply(this, arguments);
}

window.MppGame_MapLight = MppGame_MapLight;

MppGame_MapLight.prototype.initialize = function(subject) {
    this._subject = subject;
    this._x = 0;
    this._y = 0;
    this.colorIndex = 0;
    this.radius = 0;
    this.customIndex = 0;
    this.opacity = 0;
    this._targetRadius = 0;
    this._baseOpacity = 0;
    this._targetOpacity = 0;
    this._amplitude = 0;
    this._duration = 0;
    
    this.angle = 0;
    this._subjectDirection = 0;
    this._angleDuration = 0;
};

MppGame_MapLight.prototype.isValid = function() {
    return ((this.colorIndex > 0 && this.radius > 0) || this.customIndex > 0) &&
            this.opacity > 0;
};

MppGame_MapLight.prototype.setPos = function(x, y) {
    this._x = x;
    this._y = y;
};

MppGame_MapLight.prototype.move = function(r, c, o, a) {
    this._targetRadius = r;
    this.colorIndex = c;
    this.customIndex = 0;
    this._baseOpacity = o;
    this._targetOpacity = o;
    this._amplitude = a;
    this._duration = 16;
    this._subjectDirection = 0;
    this._angleDuration = 0;
};

MppGame_MapLight.prototype.custom = function(ci, o, a) {
    this.colorIndex = 0;
    this.customIndex = ci;
    this._baseOpacity = o;
    this._targetOpacity = o;
    this._amplitude = a;
    this._duration = 16;
    this.angle = this.directionAngle();
    this._subjectDirection = this._subject ? this._subject.direction() : 0;
    this._angleDuration = 0;
};

MppGame_MapLight.prototype.skip = function() {
    this.radius = this._targetRadius;
    this.opacity = this._targetOpacity;
    if (this._targetOpacity > 0 && this._amplitude > 0) {
        var o = this._baseOpacity;
        this._targetOpacity = o - Math.randomInt(o * this._amplitude);
        this._duration = 8;
    } else {
        this._duration = 0;
    }
};

MppGame_MapLight.prototype.update = function() {
    this.updateMove();
    this.updatePos();
    this.updateAngle();
};

MppGame_MapLight.prototype.updateMove = function() {
    if (this._duration > 0) {
        var d = --this._duration;
        this.radius = (this.radius * d + this._targetRadius) / (d + 1);
        this.opacity = (this.opacity * d + this._targetOpacity) / (d + 1);
        if (d === 0 && this._targetOpacity > 0 && this._amplitude > 0) {
            var o = this._baseOpacity;
            this._targetOpacity = o - Math.randomInt(o * this._amplitude);
            this._duration = 8;
        }
    }
};

MppGame_MapLight.prototype.updatePos = function() {
    if (this._subject) {
        this._x = this._subject._realX;
        this._y = this._subject._realY;
    }
};

MppGame_MapLight.prototype.updateAngle = function() {
    if (this.customIndex > 0 && this._subject) {
        if (this._subjectDirection !== this._subject.direction()) {
            this._subjectDirection = this._subject.direction();
            var custom = Params.CustomLights[this.customIndex - 1];
            this._angleDuration = custom ? custom["Turn Duration"] || 0 : 0;
            if (this._angleDuration === 0)
                this.angle = this.directionAngle();
        }
        if (this._angleDuration > 0) {
            var d = this._angleDuration;
            this.angle += (this.targetAngle() - this.angle) * d / tri(d);
            this.angle = (this.angle + 360) % 360;
            this._angleDuration--;
        }
    }
};
const tri = function(n) {
    return n * (n + 1) / 2;
};

MppGame_MapLight.prototype.targetAngle = function() {
    var result = this.directionAngle();
    var sa = this.angle - result;
    if (Math.abs(sa) > Math.abs(sa - 360)) result += 360;
    if (Math.abs(sa) > Math.abs(sa + 360)) result -= 360;
    return result;
};

MppGame_MapLight.prototype.directionAngle = function() {
    if (this._subject) {
        switch (this._subject.direction()) {
            case 2: return 0;
            case 4: return 90;
            case 6: return 270;
            case 8: return 180;
        }
    }
    return 0;
};

MppGame_MapLight.prototype.scrolledX = function() {
    return $gameMap.adjustX(this._x);
};

MppGame_MapLight.prototype.scrolledY = function() {
    return $gameMap.adjustY(this._y);
};


//-----------------------------------------------------------------------------
// Game_Map

//37
Alias.GaMa_setup = Game_Map.prototype.setup;
Game_Map.prototype.setup = function(mapId) {
    Alias.GaMa_setup.apply(this, arguments);
    this.darknessOpacity = 0;
    this._mapLights = {};
    var darkness = Params.MapMetadata.Darkness || "Darkness";
    var mapLight = Params.MapMetadata.MapLight || "MapLight";
    for (var name in $dataMap.meta) {
        if (name === darkness) {
            var param = $dataMap.meta[name];
            if (/v\[(\d+)\]/.test(param)) {
                this.darknessOpacity = $gameVariables.value(Number(RegExp.$1));
            } else {
                this.darknessOpacity = Number(param || 0);
            }
            this.darknessOpacity = this.darknessOpacity.clamp(0, 255);
        } else if (name.indexOf(mapLight) === 0 && /\s(\d+)/.test(name)) {
            var id = Number(RegExp.$1);
            var data = $dataMap.meta[name].split(",").map(Number);
            if (data[4] === undefined) data[4] = 255;
            data[5] = data[5] || 0;
            this.showMapLight(id, data[0], data[1]);
            this.moveMapLight(id, data[2], data[3], data[4], data[5]);
        }
    }
    var allMapLights = this.allMapLights();
    for (var i = 0; i < allMapLights.length; i++) {
        allMapLights[i].skip();
    }
};

Game_Map.prototype.allMapLights = function() {
    var list = [];
    for (var id in this._mapLights) {
        list.push(this._mapLights[id]);
    }
    var events = this.events();
    events.push($gamePlayer);
    for (var i = 0; i < events.length; i++) {
        if (events[i].mapLight) list.push(events[i].mapLight);
    }
    return list;
};

Game_Map.prototype.showMapLight = function(id, x, y) {
    if (!this._mapLights[id]) this._mapLights[id] = new MppGame_MapLight();
    this._mapLights[id].setPos(x, y);
};

Game_Map.prototype.moveMapLight = function(id, r, c, o, a) {
    if (!this._mapLights[id]) this._mapLights[id] = new MppGame_MapLight();
    this._mapLights[id].move(r, c, o, a);
};

Game_Map.prototype.eraseMapLight = function(id) {
    delete this._mapLights[id];
};

//623
Alias.GaMa_update = Game_Map.prototype.update;
Game_Map.prototype.update = function(sceneActive) {
    Alias.GaMa_update.apply(this, arguments);
    var mapLights = this._mapLights;
    for (var id in mapLights) {
        mapLights[id].update();
    }
};


//-----------------------------------------------------------------------------
// Game_CharacterBase

//283
Alias.GaChBa_update = Game_CharacterBase.prototype.update;
Game_CharacterBase.prototype.update = function() {
    Alias.GaChBa_update.apply(this, arguments);
    if (this.mapLight) this.mapLight.update();
};

Game_CharacterBase.prototype.moveLight = function(r, c, o, a) {
    if (!this.mapLight) {
        this.mapLight = new MppGame_MapLight(this);
    }
    this.mapLight.move(r, c, o, a);
};

Game_CharacterBase.prototype.customLight = function(ci, o, a) {
    if (!this.mapLight) {
        this.mapLight = new MppGame_MapLight(this);
    }
    this.mapLight.custom(ci, o, a);
};

//-----------------------------------------------------------------------------
// Game_Event

//248
Alias.GaEv_clearPageSettings = Game_Event.prototype.clearPageSettings;
Game_Event.prototype.clearPageSettings = function() {
    Alias.GaEv_clearPageSettings.apply(this, arguments);
    this.mapLight = null;
};

//256
Alias.GaEv_setupPageSettings = Game_Event.prototype.setupPageSettings;
Game_Event.prototype.setupPageSettings = function() {
    Alias.GaEv_setupPageSettings.apply(this, arguments);
    this.setup_MapLight();
};

Game_Event.prototype.setup_MapLight = function() {
    this.mapLight = null;
    var list = this.list();
    for (var i = 0; i < list.length; i++) {
        switch (list[i].code) {
            case 108:
            case 408:
                var comment = list[i].parameters[0];
                if (comment.indexOf(Params.EventComments.Light) === 0) {
                    var ary = comment.split(" ");
                    var r = Number(ary[1] || 0);
                    var c = Number(ary[2] || 0);
                    var o = Number(ary[3] || 255);
                    var a = Number(ary[4] || 0);
                    this.moveLight(r, c, o, a);
                }
                break;
        }
    }
};

//-----------------------------------------------------------------------------
// Game_Interpreter

//1739
Alias.GaIn_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
    Alias.GaIn_pluginCommand.apply(this, arguments);
    var args2 = this.mppPluginCommandArgs3(args);
    switch (command) {
        case Params.PluginCommands.SetCharLight:
        case 'SetCharLight':
            var character = this.character(args2[0]);
            if (character) {
                var r = args2[1];
                var c = args2[2];
                var o = args2.length >= 4 ? args2[3] : 255;
                var a = args2[4] || 0;
                character.moveLight(r, c, o, a);
            }
            break;
        case Params.PluginCommands.ShowMapLight:
        case 'ShowMapLight':
            var id = args2[0];
            var x = args2[1];
            var y = args2[2];
            $gameMap.showMapLight(id, x, y);
            break;
        case Params.PluginCommands.MoveMapLight:
        case 'MoveMapLight':
            var id = args2[0];
            var r = args2[1];
            var c = args2[2];
            var o = args2.length >= 4 ? args2[3] : 255;
            var a = args2[4] || 0;
            $gameMap.moveMapLight(id, r, c, o, a);
            break;
        case Params.PluginCommands.EraseMapLight:
        case 'EraseMapLight':
            var id = args2[0];
            $gameMap.eraseMapLight(id);
            break;
        case Params.PluginCommands.SetMapDarkness:
        case 'SetMapDarkness':
            $gameMap.darknessOpacity = args2[0].clamp(0, 255);
            break;
        case Params.PluginCommands.SetCusCharLight:
        case 'SetCusCharLight':
            var character = this.character(args2[0]);
            if (character) {
                var ci = args2[1];
                var o = args2.length >= 3 ? args2[2] : 255;
                var a = args2[3] || 0;
                character.customLight(ci, o, a);
            }
            break;
    }
    return true;
};

Game_Interpreter.prototype.mppPluginCommandArgs3 = function(args) {
    return args.map(arg => {
        if (/^\d+$/.test(arg)) {
            return Number(arg);
        } else if (/^v\[(\d+)\]$/.test(arg)) {
            return $gameVariables.value(Number(RegExp.$1));
        } else {
            return arg;
        }
    });
};








})();
