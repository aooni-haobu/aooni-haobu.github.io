//=============================================================================
// ib.js
//=============================================================================



//文字サイズ デフォ28.1024なら25、潰れるが仕方なし
Window_Base.prototype.standardFontSize = function() {
    return 28;
};



//行間
Window_Base.prototype.lineHeight = function() {
    return 37;
};

//オプションウインドウ幅でかく
Window_Options.prototype.windowWidth = function() {
	return 400; 
};



//文文間
Window_Base.prototype.calcTextHeight = function(textState, all) {
    var lastFontSize = this.contents.fontSize;
    var textHeight = 2;
    var lines = textState.text.slice(textState.index).split('\n');
    var maxLines = all ? lines.length : 1;

    for (var i = 0; i < maxLines; i++) {
        var maxFontSize = this.contents.fontSize;
        var regExp = /\x1b[\{\}]/g;
        for (;;) {
            var array = regExp.exec(lines[i]);
            if (array) {
                if (array[0] === '\x1b{') {
                    this.makeFontBigger();
                }
                if (array[0] === '\x1b}') {
                    this.makeFontSmaller();
                }
                if (maxFontSize < this.contents.fontSize) {
                    maxFontSize = this.contents.fontSize;
                }
            } else {
                break;
            }
        }
		//↓ここ
        textHeight += maxFontSize +14
		;
    }

    this.contents.fontSize = lastFontSize;
    return textHeight;
};

//選択肢文上下中央寄
//https://tm.lucky-duet.com/viewtopic.php?t=6214
Window_ChoiceList.prototype.drawItem = function(index) {
    var rect = this.itemRectForText(index);
    this.drawTextEx(this.commandName(index), rect.x, rect.y - 3);
};


//テキスト表示開始場所 高さ 33がちょうどよい？
Window_Base.prototype.lineHeight = function() {
    return 40;
///	Window_Base.prototype.lineHeight = function() {
//    return 36;
};


//ウインドウ表示位置
//Window_MenuStatus.prototype.numVisibleRows = function() {
//    return 1;
//};




//キー
//(function () {
//   Input.keyMapper[50] = '2';
//   Input.keyMapper[65] = 'A';
//   Input.keyMapper[68] = 'D';
//   Input.keyMapper[83] = 'S';
//  Input.keyMapper[69] = 'E';
//   })();



//歩行速度デフォ
Game_CharacterBase.prototype.distancePerFrame = function() {
    return Math.pow(2, this.realMoveSpeed()) / 170;
};

//ファイル名左に
Window_SavefileList.prototype.drawFileId = function(id, x, y) {
    this.drawText(TextManager.file + ' ' + id, x-10, y, 180);
};


//ヘルプウインドウ
(function() {
    'use strict';

    var _Scene_File_create = Scene_File.prototype.create;
    Scene_File.prototype.create = function() {
        _Scene_File_create.apply(this, arguments);
        this.remakeHelpWindow();
    };

    Scene_File.prototype.remakeHelpWindow = function() {
        var x = 155;
        var y = 3;
        var width = 980;
        var height = 75;
        this._helpWindow.move(x, y, width, height);
        // ウィンドウのサイズを変更した後、再描画したい場合は以下を有効にしてください。
        //this._helpWindow.createContents();
        //this._helpWindow.refresh();
        // 既存のウィンドウと位置が被る場合は以下を有効にしてください。
        //this._windowLayer.removeChild(this._helpWindow);
        //this._windowLayer.addChild(this._helpWindow);
    };
})();


//ヘルプウインドウ 翻訳用
Scene_File.prototype.createHelpWindow = function() {
    this._helpWindow = new Window_Help(1);
    this._helpWindow.setText(this.helpWindowText());
    this.addWindow(this._helpWindow);
	//////////////////////////////////////////////////////////////////////////////////////////////↓追加?翻訳用
//	$gameVariables.setValue(x, ConfigManager._language);
};



//セーブファイル系
Scene_File.prototype.createListWindow = function() {
	
    var x = 155;//→にずらす
    var y = this._helpWindow.height;
//    var width = Graphics.boxWidth;
	    var width = Graphics.boxWidth - 300; //幅縮めた
    var height = Graphics.boxHeight - y;
    this._listWindow = new Window_SavefileList(x, y, width, height);
    this._listWindow.setHandler('ok',     this.onSavefileOk.bind(this));
    this._listWindow.setHandler('cancel', this.popScene.bind(this));
    this._listWindow.select(this.firstSavefileIndex());
    this._listWindow.setTopRow(this.firstSavefileIndex() - 2);
    this._listWindow.setMode(this.mode());
    this._listWindow.refresh();
    this.addWindow(this._listWindow);
};


