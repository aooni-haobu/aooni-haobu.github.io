//=============================================================================
// main.js
//=============================================================================

function initAppsflyerSdk() {
    var onSuccess = function(result) {
        // handle result
        console.log(result);
    };
    
    var onError = function(err) {
        // handle error
        console.error(err);
    }
    var options = {
        devKey:  'F8ydoNyPBGdiPziSyaFZe9',
        appId: '1370307108',
        isDebug: true,
        onInstallConversionDataListener: true
    };
    window.plugins.appsFlyer.initSdk(options, onSuccess, onError);
}

document.addEventListener("deviceready", function() {
    initAppsflyerSdk();
}, false);

PluginManager.setup($plugins);

window.onload = function() {
    SceneManager.run(Scene_Boot);
};
