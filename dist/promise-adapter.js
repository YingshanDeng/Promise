!function(e,t){if("function"==typeof define&&define.amd)define(["module","exports","./promise.js"],t);else if("undefined"!=typeof exports)t(module,exports,require("./promise.js"));else{var r={exports:{}};t(r,r.exports,e.promise),e.promiseAdapter=r.exports}}(this,function(e,t,r){"use strict";Object.defineProperty(t,"__esModule",{value:!0});var o=function(e){return e&&e.__esModule?e:{default:e}}(r);o.default.deferred=function(){var e={};return e.promise=new o.default(function(t,r){e.resolve=t,e.reject=r}),e},t.default=o.default,e.exports=t.default});