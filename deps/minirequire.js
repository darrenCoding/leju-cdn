//@author LEJU FE
(function(_) {
    var modules = {},
        exports = [],
        exportsrequire = [],
        branchPath = {};
    var ex = {
        define: function(id, deps, factory) {
            if (modules[id]) return false;
            if (arguments.length > 2) {
                modules[id] = {
                    id: id,
                    deps: deps,
                    factory: factory,
                    exports: ''
                };
            } else {
                factory = deps;
                modules[id] = {
                    id: id,
                    factory: factory
                };
                modules[id].exports = factory.call(window) || '';
            }   
        },
        require: function(id, callback) {
            if (Object.prototype.toString.call(id) === '[object Array]') {
                if (id.length > 1) {
                    return makeRequire(id, callback);
                }
                if(id.length==0){
                    callback.call();
                    return true;  
                }
                id = id[0];
                loadScript(id, function(loadmodule) {
                    if (!modules[loadmodule]) return false;
                    if (callback) {
                        var module = build(modules[loadmodule], callback);
                        return module;
                    } else {
                        if (modules[id].factory) {
                            return build(modules[loadmodule]);
                        }
                        return modules[loadmodule].exports;
                    }
                })
            }
        }
    };
    function each(obj, fn) {
        if (obj.length == undefined) {
            for (var i in obj)
                fn.call(obj[i], obj);
        } else {
            for (var i = 0, ol = obj.length; i < ol; i++) {
                if (fn.call(obj[i], obj) === false)
                    break;
            }
        }
    }

    function loadScript(path, callback) {
        var def = path,//.split('/').pop();
        callback = callback || function() {};
        if (def&&def.match('.js')) {
            def = def.split('.js')[0];
        }
        callback.call(window, def)
    }
    function parseDeps(module, callback) {
        var deps = module['deps'],
            arr = deps.slice(0),
            cb = callback || function() {};
        (function recur(singlemodule) {
            loadScript(singlemodule, function(loadmodule) {
                if (loadmodule&&modules[loadmodule]&&modules[loadmodule]['deps']) {
                    parseDeps(modules[loadmodule], function() {
                        modules[loadmodule]['exports'] = modules[loadmodule].factory.call() || '';
                        exports.push(modules[loadmodule]['exports']);
                        arr.length == 0?cb.call():recur(arr.shift());
                    })
                } else arr.length == 0?cb.call():recur(arr.shift());
            })
        })(arr.shift())
        return exports;
    }
    function build(module, callback) {
        if(module){
            var depsList, existMod,
                factory = module['factory'],
                id = module['id'];
            if (module['deps']) {
                depsList = parseDeps(module, function() {
                    var tem = [];
                    for (var i = 0, len = module['deps'].length; i < len; i++) {
                        modules[module['deps'][i]]&&modules[module['deps'][i]]['exports'] ? tem.push(modules[module['deps'][i]]['exports']) : tem;
                    }
                    exportsrequire.push(module['exports'] = factory.apply(module, tem));
                    if (callback) {
                        callback.apply(module, exportsrequire);
                        ex.modules = modules;
                    }
                });
            }else {
                exportsrequire.push(module['exports']);
                if (callback) {
                        callback.apply(module, exportsrequire);
                        ex.modules = modules;
                    }
            }
        }else callback?callback.call():true;
        return exportsrequire;
    }
    function makeRequire(ids, callback) {
        var arr = ids.slice(0),
            fn,
            factory = callback;
        (function recur(singlemodule) {
            loadScript(singlemodule, function(loadmodule) {
                        build(modules[loadmodule], function() {
                            if (arr.length == 0) {
                                if (factory)
                                    factory.apply(window, exportsrequire)
                                return;
                            } else {
                                recur(arr.shift());
                            }
                        })
            })
        })(arr.shift());
    }
    window.exmodules = modules;
    if (typeof module === "object" && typeof require === "function") {
        module.exports.require = ex.require;
        module.exports.define = ex.define;
    } else {
        _.require = ex.require;
        _.define = ex.define;
    }
})(window);