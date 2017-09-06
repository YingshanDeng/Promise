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
    if (this._status !== PENDING) {
      return
    }

    this._status = FULFILLED
    this._v = value

    setTimeout(() => {
      let fn
      while ((fn = this._onResolvedCb.shift())) {
        fn.call(this, value)
      }
    })
  }

  _reject (reason) {
    if (this._status !== PENDING) {
      return
    }

    this._status = REJECTED
    this._v = reason

    setTimeout(() => {
      let fn
      while ((fn = this._onRejectedCb.shift())) {
        fn.call(this, reason)
      }
    })
  }

  then (onResolved, onRejected) {
    let promise2 = new Promise((resolve, reject) => {
      let _rsFn = this._resolveWrapper(resolve, reject, onResolved, promise2)
      let _rjFn = this._rejectWrapper(resolve, reject, onRejected, promise2)

      switch (this._status) {
        case PENDING:
          this._onResolvedCb.push(_rsFn)
          this._onRejectedCb.push(_rjFn)
          break
        case FULFILLED:
          setTimeout(_rsFn.bind(this, this._v))
          break
        case REJECTED:
          setTimeout(_rjFn.bind(this, this._v))
          break
      }
    })
    return promise2
  }

  _resolveWrapper (resolve, reject, onResolved, promise2) {
    return (value) => {
      if (!this._isFunction(onResolved)) {
        return resolve(value)
      }

      try {
        let x = onResolved(value)
        if (this._isFunction(x)) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      } catch (e) {
        reject(e)
      }
    }
  }
  _rejectWrapper (resolve, reject, onRejected, promise2) {
    return (reason) => {
      if (!this._isFunction(onRejected)) {
        return reject(reason)
      }

      try {
        let x = onRejected(reason)
        if (this._isFunction(x)) {
          x.then(resolve, reject)
        } else {
          resolve(x)
        }
      } catch (e) {
        reject(e)
      }
    }
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
