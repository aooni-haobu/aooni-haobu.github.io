/*:
 * @plugindesc Scene Cache System
 * @author liply(support at liply.net)
 *
 * @param WebGL
 * @desc Force WebGL (1 for on, 0 for off)
 * @default 0
 *
 * @param Report Memory
 * @default 0
 *
 * @help
 * Fixes MV cache system
 *
 */

(function () {
    var cacheStack = [{}];
    var parameters = PluginManager.parameters('liply_SceneCache');
    var webGL = parseInt(parameters['WebGL']);
    var reportMemoryParam = parseInt(parameters['Report Memory']);

    var SceneManager_preferableRendererType = SceneManager.preferableRendererType;
    SceneManager.preferableRendererType = function () {
        if (webGL)
            return 'webgl';
        else
            return SceneManager_preferableRendererType.apply(this, arguments);
    };

    function reportMemory() {
        if(reportMemoryParam) {
            var top = cacheStack[cacheStack.length - 1];
            var memory = 0;
            for (var key in top) {
                if (top.hasOwnProperty(key)) {
                    var bitmap = top[key];
                    memory += bitmap.width * bitmap.height * 4;
                }
            }

            console.log(Math.floor(memory / (1024 * 1024)) + 'MB');
        }
    }

    function pushCacheStack() {
        var element = {};
        var top = cacheStack[cacheStack.length - 1];
        for (var key in top) {
            if(top.hasOwnProperty(key))
                element[key] = top[key];
        }

        ImageManager._cache = element;
        cacheStack.push(element);
        reportMemory();
    }

    function clearCacheStackTop() {
        var element = {};
        var top = cacheStack[cacheStack.length - 2];
        for (var key in top) {
            if(top.hasOwnProperty(key))
                element[key] = top[key];
        }
        cacheStack[cacheStack.length - 1] = element;
        ImageManager._cache = element;
        reportMemory();
    }

    function popCacheStack() {
        cacheStack.pop();
        ImageManager._cache = cacheStack[cacheStack.length - 1];
        reportMemory();
    }

    var SceneManager_goto = SceneManager.goto;
    SceneManager.goto = function () {
        if (SceneManager._scene instanceof Scene_Boot) {
            pushCacheStack();
        } else {
            clearCacheStackTop();
        }
        SceneManager_goto.apply(this, arguments);
    };

    var SceneManager_push = SceneManager.push;
    SceneManager.push = function () {
        pushCacheStack();
        SceneManager_push.apply(this, arguments);
    };

    var SceneManager_pop = SceneManager.pop;
    SceneManager.pop = function () {
        popCacheStack();
        SceneManager_pop.apply(this, arguments);
    };

    // var Game_Interpreter_prototype_terminate = Game_Interpreter.prototype.terminate;
    // Game_Interpreter.prototype.terminate = function () {
    //     Game_Interpreter_prototype_terminate.apply(this, arguments);
    //     clearCacheStackTop();
    // };
})();
