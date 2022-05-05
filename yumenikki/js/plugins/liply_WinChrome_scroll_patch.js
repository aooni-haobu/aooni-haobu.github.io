/*:
 * @plugindesc Windows Chrome scroll patch
 * @author liply
 *
 * @help There is rendering problem on 2016/4/6 Windows Chrome.
 * MV Core creates large canvas garbage. This patch fix it.
 * 
 * This plugin is released under the MIT License.
 */

(function(){
Tilemap.prototype._createLayers = function() {
    var width = this._width;
    var height = this._height;
    var margin = this._margin;
    var tileCols = Math.ceil(width / this._tileWidth) + 1;
    var tileRows = Math.ceil(height / this._tileHeight) + 1;
    var layerWidth = tileCols * this._tileWidth;
    var layerHeight = tileRows * this._tileHeight;
    
    if(!this._lowerBitmap || (this._lowerBitmap.width !== layerWidth || this._lowerBitmap.height !== layerHeight)){
        if( Tilemap._lowerBitmapCache && 
            layerWidth === Tilemap._lowerBitmapCache.width && 
            layerHeight === Tilemap._lowerBitmapCache.height){
            
            this._lowerBitmap = Tilemap._lowerBitmapCache;
            this._upperBitmap = Tilemap._upperBitmapCache;
        }else{
            this._lowerBitmap = new Bitmap(layerWidth, layerHeight);
            this._upperBitmap = new Bitmap(layerWidth, layerHeight);
        }
        Tilemap._lowerBitmapCache = this._lowerBitmap;
        Tilemap._upperBitmapCache = this._upperBitmap;
    }
    this._layerWidth = layerWidth;
    this._layerHeight = layerHeight;

    /*
     * Z coordinate:
     *
     * 0 : Lower tiles
     * 1 : Lower characters
     * 3 : Normal characters
     * 4 : Upper tiles
     * 5 : Upper characters
     * 6 : Airship shadow
     * 7 : Balloon
     * 8 : Animation
     * 9 : Destination
     */

    this._lowerLayer = new Sprite();
    this._lowerLayer.move(-margin, -margin, width, height);
    this._lowerLayer.z = 0;

    this._upperLayer = new Sprite();
    this._upperLayer.move(-margin, -margin, width, height);
    this._upperLayer.z = 4;

    for (var i = 0; i < 4; i++) {
        this._lowerLayer.addChild(new Sprite(this._lowerBitmap));
        this._upperLayer.addChild(new Sprite(this._upperBitmap));
    }

    this.addChild(this._lowerLayer);
    this.addChild(this._upperLayer);
};
})();