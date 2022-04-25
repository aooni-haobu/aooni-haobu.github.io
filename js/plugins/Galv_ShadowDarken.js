//-----------------------------------------------------------------------------
//  Galv's Shadow Darken
//-----------------------------------------------------------------------------
//  For: RPGMAKER MV
//  Galv_ShadowDarken.js
//-----------------------------------------------------------------------------
//  2017-05-09 - Version 1.2 - fixed flashing issue while in shadow
//  2017-05-08 - Version 1.1 - fixed jumping in/out of shadow
//  2017-04-13 - Version 1.0 - release
//-----------------------------------------------------------------------------
// Terms can be found at:
// galvs-scripts.com
//-----------------------------------------------------------------------------

var Imported = Imported || {};
Imported.Galv_ShadowDarken = true;

var Galv = Galv || {};                  // Galv's main object
Galv.SDARK = Galv.SDARK || {};          // Galv's stuff


//-----------------------------------------------------------------------------
/*:
 * @plugindesc (v.1.0) Map characters darken when in shadow regions
 * 
 * @author Galv - galvs-scripts.com
 *
 * @param Dark Amount
 * @desc How dark to make characters when entering shadow area (0-255)
 * @default 130
 *
 * @param Shadow Regions
 * @desc List of regions IDs that will be in shadow
 * @default 237,238
 *
 * @help
 *   Galv's Shadow Darken
 * ----------------------------------------------------------------------------
 * This plugin makes map events/player darker/lighter if they are standing in
 * a designated shadow region. Shadow regions are designated in the plugin
 * settings.
 * This is not designed to work with other lighting plugins.
 * 
 *
 * Future update ideas:
 * - Ability to specify additional region id's in map comments
 * - Ability to use terrain tags?
 * - Ability to specify events to not use shadow
 */



//-----------------------------------------------------------------------------
//  CODE STUFFS
//-----------------------------------------------------------------------------

(function() {

Galv.SDARK.dark = Number(PluginManager.parameters('Galv_ShadowDarken')["Dark Amount"]);

var txt = PluginManager.parameters('Galv_ShadowDarken')["Shadow Regions"].split(',');
Galv.SDARK.regions = [];
for (var i = 0; i < txt.length; i++) {
	Galv.SDARK.regions.push(Number(txt[i]));
}


//-----------------------------------------------------------------------------
//  GAME CHARACTERBASE
//-----------------------------------------------------------------------------

Galv.SDARK.Game_CharacterBase_initMembers = Game_CharacterBase.prototype.initMembers;
Game_CharacterBase.prototype.initMembers = function() {
	Galv.SDARK.Game_CharacterBase_initMembers.call(this);
	this._isInShadow = false;
};

Galv.SDARK.Game_CharacterBase_locate = Game_CharacterBase.prototype.locate;
Game_CharacterBase.prototype.locate = function(x, y) {
	Galv.SDARK.Game_CharacterBase_locate.call(this,x,y);
	this.checkShadow();
};

Game_CharacterBase.prototype.enterShadow = function() {
	this._isInShadow = true;
};

Game_CharacterBase.prototype.leaveShadow = function() {
	this._isInShadow = false;
};

Galv.SDARK.Game_CharacterBase_moveStraight = Game_CharacterBase.prototype.moveStraight;
Game_CharacterBase.prototype.moveStraight = function(d) {
    Galv.SDARK.Game_CharacterBase_moveStraight.call(this,d);
	if (this.isMovementSucceeded()) this.checkShadow();
};

Galv.SDARK.Game_CharacterBase_moveDiagonally = Game_CharacterBase.prototype.moveDiagonally;
Game_CharacterBase.prototype.moveDiagonally = function(horz,vert) {
    Galv.SDARK.Game_CharacterBase_moveDiagonally.call(this,horz,vert);
	if (this.isMovementSucceeded()) this.checkShadow();
};

Galv.SDARK.Game_CharacterBase_straighten = Game_CharacterBase.prototype.straighten;
Game_CharacterBase.prototype.straighten = function() {
	Galv.SDARK.Game_CharacterBase_straighten.call(this);
	this.checkShadow();
};

Game_CharacterBase.prototype.checkShadow = function() {
	this._isInShadow = Galv.SDARK.regions.contains(this.regionId());
};


//-----------------------------------------------------------------------------
//  SPRITE CHARACTER
//-----------------------------------------------------------------------------

Galv.SDARK.Sprite_Character_setCharacter = Sprite_Character.prototype.setCharacter;
Sprite_Character.prototype.setCharacter = function(character) {
    Galv.SDARK.Sprite_Character_setCharacter.call(this,character);
	if (this._character._isInShadow) this._blendColor[3] = Galv.SDARK.dark;
};

Sprite_Character.prototype.updateShadowBlend = function(speed) {
	var blend = this.getBlendColor();
	blend[3] += speed; // speed shadow happens
	
	if (blend[3] <= 0) {
		blend[3] = 0;
	} else if (blend[3] > Galv.SDARK.dark) {
		blend[3] = Galv.SDARK.dark;
	}
	this.setBlendColor(blend);
};


Galv.SDARK.Sprite_Character_update = Sprite_Character.prototype.update;
Sprite_Character.prototype.update = function() {
	Galv.SDARK.Sprite_Character_update.call(this);
	this.updateShadowDarken();
};

Sprite_Character.prototype.updateShadowDarken = function() {
	if (this._character._isInShadow) {
		if (this._blendColor[3] != Galv.SDARK.dark) {
			this.updateShadowBlend(15 - (10 - this._character._moveSpeed));
		}
	} else {
		if (this._blendColor[3] != 0) {
			this.updateShadowBlend(-(15 - (10 - this._character._moveSpeed)));
		}
	}
	
};






/*
Sprite.prototype.setBlendColor = function(color) {
    if (!(color instanceof Array)) {
        throw new Error('Argument must be an array');
    }
    if (!this._blendColor.equals(color)) {
        this._blendColor = color.clone();
		console.log(this._blendColor);
        this._refresh();
    }
};
*/


})();