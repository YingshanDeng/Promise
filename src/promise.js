'use strict'

// The Promise States constants
const PENDING = 0
const FULFILLED = 1
const REJECTED = 2

export default class Promise {
  // The constructor function
  constructor (executor) {
    if (!this._isFunction(executor)) {
      throw new TypeError('Promise argument error:' + executor.toString())
    }

    this._status = PENDING
    this._v = undefined
    this._onResolvedCb = []
    this._onRejectedCb = []

    executor(this._resolve.bind(this), this._reject.bind(this))
  }

  _resolve (value) {
    setTimeout(() => {
      if (this._status !== PENDING) {
        return
      }

      this._status = FULFILLED
      this._v = value

      let fn
      while ((fn = this._onResolvedCb.shift())) {
        fn.call(this, value)
      }
    })
  }

  _reject (reason) {
    setTimeout(() => {
      if (this._status !== PENDING) {
        return
      }

      this._status = REJECTED
      this._v = reason

      let fn
      while ((fn = this._onRejectedCb.shift())) {
        fn.call(this, reason)
      }
    })
  }

  then (onResolved, onRejected) {
    onResolved = this._isFunction(onResolved) ? onResolved : function (v) { return v }
    onRejected = this._isFunction(onRejected) ? onRejected : function (r) { throw r }

    var promise2 = new Promise((resolve, reject) => {
      switch (this._status) {
        case PENDING:
          this._onResolvedCb.push((value) => {
            try {
              var x = onResolved(value)
              if (x instanceof Promise) {
                x.then(resolve, reject)
              } else {
                resolve(x)
              }
            } catch (e) {
              reject(e)
            }
          })
          this._onRejectedCb.push((reason) => {
            try {
              var x = onRejected(reason)
              if (x instanceof Promise) {
                x.then(resolve, reject)
              } else {
                resolve(x)
              }
            } catch (e) {
              reject(e)
            }
          })
          break
        case FULFILLED:
          setTimeout(() => {
            try {
              var x = onResolved(this._v)
              if (x instanceof Promise) {
                x.then(resolve, reject)
              } else {
                resolve(x)
              }
            } catch (e) {
              reject(e)
            }
          })
          break
        case REJECTED:
          setTimeout(() => {
            try {
              var x = onRejected(this._v)
              if (x instanceof Promise) {
                x.then(resolve, reject)
              } else {
                resolve(x)
              }
            } catch (e) {
              reject(e)
            }
          })
          break
      }
    })
    return promise2
  }

  catch (reason) {
    return this.then(null, reason)
  }

  // Promise.resolve
  static resolve (value) {
    return new Promise((resolve, reject) => { resolve(value) })
  }
  // Promise.reject
  static reject (reason) {
    return new Promise((resolve, reject) => { reject(reason) })
  }
  // Promise.all
  static all (promises) {
    if (!Array.isArray(promises)) {
      throw new TypeError(`${promises} is not array!`)
    }
    return new Promise((resolve, reject) => {
      let _cnt = promises.length
      let _result = []

      function handle (i) {
        return (value) => {
          _result[i] = value
          if (!(--_cnt)) {
            resolve(_result)
          }
        }
      }

      promises.forEach((p, index) => p.then(handle(index), reject))
    })
  }

  // Promise.race
  static race (promises) {
    if (!Array.isArray(promises)) {
      throw new TypeError(`${promises} is not array!`)
    }
    return new Promise((resolve, reject) => {
      promises.forEach(p => p.then(resolve, reject))
    })
  }

  // helper
  _isFunction (fn) {
    return fn && typeof fn === 'function'
  }
}
