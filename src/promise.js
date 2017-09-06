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
    return new Promise((resolve, reject) => this._thenHandler(resolve, reject, onResolved, onRejected))
  }

  _thenHandler (resolve, reject, onResolved, onRejected) {
    let _rsFn = this._resolveWrapper(resolve, reject, onResolved)
    let _rjFn = this._rejectWrapper(resolve, reject, onRejected)

    switch (this._status) {
      case PENDING:
        this._onResolvedCb.push(_rsFn)
        this._onRejectedCb.push(_rjFn)
        break
      case FULFILLED:
        _rsFn(this._v)
        break
      case REJECTED:
        _rjFn(this._v)
        break
    }
  }

  _resolveWrapper (resolve, reject, onResolved) {
    return (value) => {
      setTimeout(() => {
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
      })
    }
  }
  _rejectWrapper (resolve, reject, onRejected) {
    return (reason) => {
      setTimeout(() => {
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
      })
    }
  }

  // utils
  _isFunction (fn) {
    return fn && typeof fn === 'function'
  }
}
