(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var DB_NAME = 'channels-db';
var DB_VERSION = 1;
var STORE_REGISTRIES = "registries";
var MODE_READWRITE = "readwrite";
var MODE_READ = "readonly";
var ClientDb = (function () {
    function ClientDb() {
    }
    ClientDb.prototype.open = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        if (_this.db) {
                            resolve();
                            return;
                        }
                        var request = indexedDB.open(DB_NAME, DB_VERSION);
                        request.onerror = function (event) {
                            console.error("Failed to load DB: ", event);
                            reject(new Error("Error loading database: " + event));
                        };
                        request.onsuccess = function (event) {
                            _this.db = request.result;
                            resolve();
                        };
                        request.onupgradeneeded = function (event) {
                            var db = event.target.result;
                            if (!event.oldVersion) {
                                var store = db.createObjectStore(STORE_REGISTRIES, { keyPath: "services.registrationUrl" });
                                store.createIndex("providerUrl", "services.providerUrl", { unique: true });
                            }
                        };
                    })];
            });
        });
    };
    ClientDb.prototype.getStore = function (name, mode) {
        var tx = this.db.transaction(name, mode);
        return tx.objectStore(name);
    };
    ClientDb.prototype.saveRegistry = function (registry) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var store = _this.getStore(STORE_REGISTRIES, MODE_READWRITE);
                        try {
                            var request = store.add(registry);
                            request.onerror = function (event) {
                                reject(new Error("Error loading database: " + event));
                            };
                            request.onsuccess = function (event) {
                                resolve();
                            };
                        }
                        catch (ex) {
                            reject(ex);
                        }
                    })];
            });
        });
    };
    ClientDb.prototype.getRegistry = function (registerUrl, providerUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var store = _this.getStore(STORE_REGISTRIES, MODE_READ);
                        var request;
                        if (registerUrl) {
                            request = store.get(registerUrl);
                        }
                        else if (providerUrl) {
                            var index = store.index('providerUrl');
                            request = index.get(providerUrl);
                        }
                        else {
                            resolve(null);
                            return;
                        }
                        request.onerror = function (event) {
                            console.error("Failed to load registry from DB: ", event);
                            reject(new Error("Failed to load registry: " + event));
                        };
                        request.onsuccess = function (event) {
                            resolve(request.result);
                        };
                    })];
            });
        });
    };
    return ClientDb;
}());
exports.ClientDb = ClientDb;

},{}],2:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var rest_1 = require("./rest");
var utils_1 = require("./utils");
var db_1 = require("./db");
var ChannelsClientImpl = (function () {
    function ChannelsClientImpl() {
        this.db = new db_1.ClientDb();
    }
    ChannelsClientImpl.prototype.ensureDb = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.db.open()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ChannelsClientImpl.prototype.register = function (serverUrl, identity) {
        return __awaiter(this, void 0, void 0, function () {
            var cached, braidInfo, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureDb()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.getRegistry(null, serverUrl)];
                    case 2:
                        cached = _a.sent();
                        if (cached) {
                            return [2 /*return*/, cached];
                        }
                        return [4 /*yield*/, rest_1.Rest.get(serverUrl)];
                    case 3:
                        braidInfo = _a.sent();
                        if (!(braidInfo && braidInfo.services.registrationUrl)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.getRegistry(braidInfo.services.registrationUrl, identity)];
                    case 4:
                        response = _a.sent();
                        return [4 /*yield*/, this.db.saveRegistry(response)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, response];
                    case 6: throw new Error("Failed to fetch Braid server info.");
                }
            });
        });
    };
    ChannelsClientImpl.prototype.getRegistry = function (registryUrl, identity) {
        return __awaiter(this, void 0, void 0, function () {
            var cached, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureDb()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.getRegistry(registryUrl)];
                    case 2:
                        cached = _a.sent();
                        if (cached) {
                            return [2 /*return*/, cached];
                        }
                        return [4 /*yield*/, rest_1.Rest.post(registryUrl, {
                                identity: identity || {}
                            })];
                    case 3:
                        response = _a.sent();
                        if (!response) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.db.saveRegistry(response)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, response];
                    case 5: throw new Error("Failed to register with server at " + registryUrl);
                }
            });
        });
    };
    ChannelsClientImpl.prototype.createChannel = function (registryUrl, request) {
        if (request === void 0) { request = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var registry, headers;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.ensureDb()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.getRegistry(registryUrl)];
                    case 2:
                        registry = _a.sent();
                        if (!registry) {
                            throw new Error("Failed to create channel: Provider is not registered");
                        }
                        headers = { Authorization: utils_1.Utils.createAuth(registry) };
                        return [4 /*yield*/, rest_1.Rest.post(registry.services.createChannelUrl, request, headers)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ChannelsClientImpl.prototype.connectToChannel = function (channelCodeUrl) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, null];
            });
        });
    };
    return ChannelsClientImpl;
}());

},{"./db":1,"./rest":3,"./utils":4}],3:[function(require,module,exports){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var Rest = (function () {
    function Rest() {
    }
    Rest.get = function (url, headers) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var req = new XMLHttpRequest();
                        req.withCredentials = true;
                        req.open("GET", url);
                        if (headers) {
                            for (var key in headers) {
                                req.setRequestHeader(key, headers[key]);
                            }
                        }
                        req.onload = function (event) {
                            var status = req.status;
                            if (status === 0 || status >= 400) {
                                if (req.responseText) {
                                    Rest.onError(reject, status, req.responseText);
                                }
                                else {
                                    Rest.onError(reject, status, 'Request failed with code: ' + status);
                                }
                            }
                            else {
                                if (req.responseText) {
                                    var result = JSON.parse(req.responseText);
                                    resolve(result);
                                }
                                else {
                                    resolve(null);
                                }
                            }
                        };
                        req.onerror = function (err) {
                            Rest.onError(reject, 0, "There was a network error: " + err.message);
                        };
                        req.send();
                    })];
            });
        });
    };
    Rest.post = function (url, object, headers) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var req = new XMLHttpRequest();
                        req.withCredentials = true;
                        req.open("POST", url);
                        if (headers) {
                            for (var key in headers) {
                                req.setRequestHeader(key, headers[key]);
                            }
                        }
                        req.setRequestHeader("Content-Type", 'application/json');
                        req.onload = function (event) {
                            var status = req.status;
                            if (status === 0 || status >= 400) {
                                if (req.responseText) {
                                    Rest.onError(reject, status, req.responseText);
                                }
                                else {
                                    Rest.onError(reject, status, 'Request failed with code: ' + status);
                                }
                            }
                            else {
                                if (req.responseText) {
                                    var result = JSON.parse(req.responseText);
                                    resolve(result);
                                }
                                else {
                                    resolve(null);
                                }
                            }
                        };
                        req.onerror = function (err) {
                            Rest.onError(reject, 0, "There was a network error: " + err.message);
                        };
                        if (object) {
                            req.send(JSON.stringify(object));
                        }
                        else {
                            req.send();
                        }
                    })];
            });
        });
    };
    Rest.onError = function (reject, code, message) {
        reject({
            status: code,
            message: message
        });
    };
    return Rest;
}());
exports.Rest = Rest;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Utils = (function () {
    function Utils() {
    }
    Utils.createAuth = function (registry) {
        var user = registry.id;
        var pswd = registry.token;
        return 'Basic ' + Utils.base64([user, pswd].join(':'));
    };
    Utils.base64 = function (input) {
        return btoa(input);
    };
    return Utils;
}());
exports.Utils = Utils;

},{}]},{},[2]);
