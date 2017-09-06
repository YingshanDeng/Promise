'use strict'

import Promise from './promise.js'

Promise.deferred = function () {
  var dfd = {}
  dfd.promise = new Promise(function (resolve, reject) {
    dfd.resolve = resolve
    dfd.reject = reject
  })
  return dfd
}
export default Promise
