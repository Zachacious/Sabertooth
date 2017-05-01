(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict'

exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function placeHoldersCount (b64) {
  var len = b64.length
  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // the number of equal signs (place holders)
  // if there are two placeholders, than the two characters before it
  // represent one byte
  // if there is only one, then the three characters before it represent 2 bytes
  // this is just a cheap hack to not do indexOf twice
  return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0
}

function byteLength (b64) {
  // base64 is 4/3 + up to two characters of the original data
  return b64.length * 3 / 4 - placeHoldersCount(b64)
}

function toByteArray (b64) {
  var i, j, l, tmp, placeHolders, arr
  var len = b64.length
  placeHolders = placeHoldersCount(b64)

  arr = new Arr(len * 3 / 4 - placeHolders)

  // if there are placeholders, only get up to the last complete 4 chars
  l = placeHolders > 0 ? len - 4 : len

  var L = 0

  for (i = 0, j = 0; i < l; i += 4, j += 3) {
    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)]
    arr[L++] = (tmp >> 16) & 0xFF
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  if (placeHolders === 2) {
    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[L++] = tmp & 0xFF
  } else if (placeHolders === 1) {
    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[L++] = (tmp >> 8) & 0xFF
    arr[L++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var output = ''
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    output += lookup[tmp >> 2]
    output += lookup[(tmp << 4) & 0x3F]
    output += '=='
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + (uint8[len - 1])
    output += lookup[tmp >> 10]
    output += lookup[(tmp >> 4) & 0x3F]
    output += lookup[(tmp << 2) & 0x3F]
    output += '='
  }

  parts.push(output)

  return parts.join('')
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules\\base64-js\\index.js","/node_modules\\base64-js")

},{"_process":4,"buffer":2}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */

'use strict'

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

var K_MAX_LENGTH = 0x7fffffff
exports.kMaxLength = K_MAX_LENGTH

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
 *               implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * We report that the browser does not support typed arrays if the are not subclassable
 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
 * for __proto__ and has a buggy typed array implementation.
 */
Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport()

if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' &&
    typeof console.error === 'function') {
  console.error(
    'This browser lacks typed array (Uint8Array) support which is required by ' +
    '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
  )
}

function typedArraySupport () {
  // Can typed array instances can be augmented?
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42
  } catch (e) {
    return false
  }
}

function createBuffer (length) {
  if (length > K_MAX_LENGTH) {
    throw new RangeError('Invalid typed array length')
  }
  // Return an augmented `Uint8Array` instance
  var buf = new Uint8Array(length)
  buf.__proto__ = Buffer.prototype
  return buf
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(arg)
  }
  return from(arg, encodingOrOffset, length)
}

// Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
if (typeof Symbol !== 'undefined' && Symbol.species &&
    Buffer[Symbol.species] === Buffer) {
  Object.defineProperty(Buffer, Symbol.species, {
    value: null,
    configurable: true,
    enumerable: false,
    writable: false
  })
}

Buffer.poolSize = 8192 // not used by this implementation

function from (value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (value instanceof ArrayBuffer) {
    return fromArrayBuffer(value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(value, encodingOrOffset)
  }

  return fromObject(value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(value, encodingOrOffset, length)
}

// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
// https://github.com/feross/buffer/pull/148
Buffer.prototype.__proto__ = Uint8Array.prototype
Buffer.__proto__ = Uint8Array

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(size).fill(fill, encoding)
      : createBuffer(size).fill(fill)
  }
  return createBuffer(size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(size, fill, encoding)
}

function allocUnsafe (size) {
  assertSize(size)
  return createBuffer(size < 0 ? 0 : checked(size) | 0)
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(size)
}

function fromString (string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  var buf = createBuffer(length)

  var actual = buf.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    buf = buf.slice(0, actual)
  }

  return buf
}

function fromArrayLike (array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  var buf = createBuffer(length)
  for (var i = 0; i < length; i += 1) {
    buf[i] = array[i] & 255
  }
  return buf
}

function fromArrayBuffer (array, byteOffset, length) {
  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  var buf
  if (byteOffset === undefined && length === undefined) {
    buf = new Uint8Array(array)
  } else if (length === undefined) {
    buf = new Uint8Array(array, byteOffset)
  } else {
    buf = new Uint8Array(array, byteOffset, length)
  }

  // Return an augmented `Uint8Array` instance
  buf.__proto__ = Buffer.prototype
  return buf
}

function fromObject (obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    var buf = createBuffer(len)

    if (buf.length === 0) {
      return buf
    }

    obj.copy(buf, 0, 0, len)
    return buf
  }

  if (obj) {
    if (ArrayBuffer.isView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(0)
      }
      return fromArrayLike(obj)
    }

    if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
      return fromArrayLike(obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= K_MAX_LENGTH) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return b != null && b._isBuffer === true
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!Array.isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (ArrayBuffer.isView(string) || string instanceof ArrayBuffer) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
// reliably in a browserify context because there could be multiple different
// copies of the 'buffer' package in use. This method works even for Buffer
// instances that were created from another copy of the `buffer` package.
// See: https://github.com/feross/buffer/issues/154
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset >>> 0
    if (isFinite(length)) {
      length = length >>> 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + (bytes[i + 1] * 256))
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf = this.subarray(start, end)
  // Return an augmented `Uint8Array` instance
  newBuf.__proto__ = Buffer.prototype
  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  offset = offset >>> 0
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  byteLength = byteLength >>> 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset + 3] = (value >>> 24)
  this[offset + 2] = (value >>> 16)
  this[offset + 1] = (value >>> 8)
  this[offset] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    var limit = Math.pow(2, (8 * byteLength) - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  this[offset] = (value >>> 8)
  this[offset + 1] = (value & 0xff)
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  this[offset] = (value & 0xff)
  this[offset + 1] = (value >>> 8)
  this[offset + 2] = (value >>> 16)
  this[offset + 3] = (value >>> 24)
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  this[offset] = (value >>> 24)
  this[offset + 1] = (value >>> 16)
  this[offset + 2] = (value >>> 8)
  this[offset + 3] = (value & 0xff)
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  value = +value
  offset = offset >>> 0
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : new Buffer(val, encoding)
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules\\buffer\\index.js","/node_modules\\buffer")

},{"_process":4,"base64-js":1,"buffer":2,"ieee754":3}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules\\ieee754\\index.js","/node_modules\\ieee754")

},{"_process":4,"buffer":2}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/node_modules\\process\\browser.js","/node_modules\\process")

},{"_process":4,"buffer":2}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';
// require('.././dist/UI.js');

describe('UI', function () {
    it('should exist as a global object', function () {
        expect(UI).to.be.an('object');
    });
    require('./spec');
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\index.js","/test")

},{"./spec":13,"_process":4,"buffer":2}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('App', function () {
    var app = new UI.App();

    it('should create a pixi canvas on the page', function () {
        expect(document.body.contains(app.renderer.view)).to.be.true;
    });

    it('should have a valid theme', function () {
        expect(app.theme).to.be.an.instanceof(UI.Theme);
    });

    it('should have a valid root widget', function () {
        expect(app.root).not.to.equal(undefined);
        expect(app.root).not.to.equal(null);
    });

    it('should resize the root widget to match the window', function () {
        window.resizeBy(300, 200);
        expect(app.root.width).to.equal(window.innerWidth);
        expect(app.root.height).to.equal(window.innerHeight);
    });

    describe('#name', function () {
        it('should change the page title', function () {
            app.name = 'GoodApp!';
            expect(document.title).to.equal('GoodApp!');
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\App-spec.js","/test\\spec")

},{"_process":4,"buffer":2}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('GraphicsGen', function () {
    describe('#rectangleGraphic()', function () {
        it('should return a Pixi.Graphics with a ' + 'width of 80 and a height of 100', function () {
            var rectGraphic = UI.GraphicsGen.rectangleGraphic(80, 100, 0x000000);

            expect(rectGraphic).to.be.an.instanceof(PIXI.Graphics);
            expect(rectGraphic.width).to.equal(80);
            expect(rectGraphic.height).to.equal(100);
        });
    });

    describe('#rectangleTexture()', function () {
        it('should return a PIXI.Texture with a' + ' width of 100 and a height of 80', function () {
            var rectTex = UI.GraphicsGen.rectangleTexture(100, 80, 0x000000);

            expect(rectTex).to.be.an.instanceof(PIXI.Texture);
            expect(rectTex.width).to.equal(100);
            expect(rectTex.height).to.equal(80);
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\GraphicsGen-spec.js","/test\\spec")

},{"_process":4,"buffer":2}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('Padding', function () {
    var pad = new UI.Padding();
    it('should be created with a default of 0', function () {
        expect(pad.left).to.equal(0);
        expect(pad.top).to.equal(0);
        expect(pad.right).to.equal(0);
        expect(pad.bottom).to.equal(0);
    });

    describe('#set()', function () {
        it('should set each padding to the values of 1,2,3,4', function () {
            pad.set(1, 2, 3, 4);
            expect(pad.left).to.equal(2);
            expect(pad.top).to.equal(1);
            expect(pad.right).to.equal(4);
            expect(pad.bottom).to.equal(3);
        });
    });

    describe('#setAllTo()', function () {
        it('should set all padding values to 10', function () {
            pad.setAllTo(10);
            expect(pad.left).to.equal(10);
            expect(pad.top).to.equal(10);
            expect(pad.right).to.equal(10);
            expect(pad.bottom).to.equal(10);
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\Padding-spec.js","/test\\spec")

},{"_process":4,"buffer":2}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('Point', function () {
    var p = new UI.Point();
    it('should create with default x and y of 0', function () {
        expect(p.x).to.equal(0);
        expect(p.y).to.equal(0);
    });
    describe('#set()', function () {
        it('should set x and y to 20, 80', function () {
            p.set(20, 80);
            expect(p.x).to.equal(20);
            expect(p.y).to.equal(80);
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\Point-spec.js","/test\\spec")

},{"_process":4,"buffer":2}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('Size', function () {
    var s = new UI.Size();
    it('should create with default size of 0', function () {
        expect(s.width).to.equal(0);
        expect(s.height).to.equal(0);
    });
    describe('#set()', function () {
        it('should set width and height to 20, 80', function () {
            s.set(20, 80);
            expect(s.width).to.equal(20);
            expect(s.height).to.equal(80);
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\Size-spec.js","/test\\spec")

},{"_process":4,"buffer":2}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\Theme-spec.js","/test\\spec")

},{"_process":4,"buffer":2}],12:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('UIGraphics', function () {
    var uig = new UI.UIGraphics();
    var thm = new UI.Theme();
    describe('#makeGraphicsFromTheme()', function () {
        it('should pass a valid theme param', function () {
            expect(function () {
                uig.makeGraphicsFromTheme(thm);
            }).to.not.throw(Error);
        });

        it('should throw a TypeError if invalid theme passed', function () {
            expect(function () {
                uig.makeGraphicsFromTheme('invalid theme');
            }).to.throw(TypeError);
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\UIGraphics-spec.js","/test\\spec")

},{"_process":4,"buffer":2}],13:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

require('./UIGraphics-spec');
require('./Theme-spec');
require('./Size-spec');
require('./Point-spec');
require('./Padding-spec');
require('./options-spec');
require('./GraphicsGen-spec');
require('./App-spec');
require('./widgets');
require('./layoutSys');

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\index.js","/test\\spec")

},{"./App-spec":6,"./GraphicsGen-spec":7,"./Padding-spec":8,"./Point-spec":9,"./Size-spec":10,"./Theme-spec":11,"./UIGraphics-spec":12,"./layoutSys":15,"./options-spec":27,"./widgets":36,"_process":4,"buffer":2}],14:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('Alignment', function () {
    var widget0 = new UI.Widgets.BaseWidget();
    widget0.width = 400;widget0.height = 400;
    var widget1 = new UI.Widgets.BaseWidget(widget0);
    widget1.width = 200;widget1.height = 200;

    describe('#getOffset()', function () {
        it('should return a relative offset base on the given horizontal' + ' and vertical alignment', function () {
            widget0.layout.alignment.hAlign = UI.Alignment.center;
            widget0.layout.alignment.vAlign = UI.Alignment.middle;
            var off = new UI.Point();
            off = widget0.layout.alignment.getOffset(widget0, widget1.width, widget1.height);
            // (widget0.width/2) - (widget1.width/2)
            expect(off.x).to.equal(100);
            expect(off.y).to.equal(100);
        });
    });

    describe('#left', function () {
        it('should return relative position for left alignment', function () {
            var off = UI.Alignment.left(400, widget0);
            expect(off).to.equal(4);
        });
    });

    describe('#center', function () {
        it('should return relative position for center alignment', function () {
            var off = UI.Alignment.center(100, widget0);
            expect(off).to.equal(150);
        });
    });

    describe('#right', function () {
        it('should return relative position for right alignment', function () {
            var off = UI.Alignment.right(100, widget0);
            expect(off).to.equal(300);
        });
    });

    describe('#top', function () {
        it('should return relative position for top alignment', function () {
            var off = UI.Alignment.top(100, widget0);
            expect(off).to.equal(4);
        });
    });

    describe('#middle', function () {
        it('should return relative position for middle alignment', function () {
            var off = UI.Alignment.middle(100, widget0);
            expect(off).to.equal(150);
        });
    });

    describe('#bottom', function () {
        it('should return relative position for bottom alignment', function () {
            var off = UI.Alignment.bottom(100, widget0);
            expect(off).to.equal(300);
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\layoutSys\\Alignment-spec.js","/test\\spec\\layoutSys")

},{"_process":4,"buffer":2}],15:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

require('./Alignment-spec');
require('./sizePolicies');
require('./layouts');

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\layoutSys\\index.js","/test\\spec\\layoutSys")

},{"./Alignment-spec":14,"./layouts":21,"./sizePolicies":26,"_process":4,"buffer":2}],16:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('BaseLayout', function () {
    var widget0 = new UI.Widgets.Panel(null, { width: 100, height: 100 });
    var widget1 = new UI.Widgets.Button(widget0, { width: 20, height: 20 });
    widget1.position.set(20, 20);

    describe('#exec', function () {
        it('should set the position of its children and exec their layours', function () {
            // real position isnt set until layout executes
            expect(widget1.transform.position.x).to.equal(0);
            expect(widget1.transform.position.y).to.equal(0);

            var spy = sinon.spy(widget1.layout, 'exec');

            widget0.layout.exec();

            expect(spy.called).to.be.true;

            widget1.layout.exec.restore();

            expect(widget1.transform.position.x).to.equal(24);
            expect(widget1.transform.position.y).to.equal(24);
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\layoutSys\\layouts\\BaseLayout-spec.js","/test\\spec\\layoutSys\\layouts")

},{"_process":4,"buffer":2}],17:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('BoxLayout', function () {
    var w0 = new UI.Widgets.Panel(null, { width: 400, height: 400 });
    w0.layout = new UI.Layouts.BoxLayout(w0, UI.VERTICAL);
    var w1 = new UI.Widgets.Button(w0, { width: 20, height: 20 });
    var w2 = new UI.Widgets.Button(w0, { width: 20, height: 20 });
    var w3 = new UI.Widgets.Button(w0, { width: 20, height: 20 });

    describe('#initTotalChildrenSize()', function () {
        it('should calculate the total size of the children', function () {
            expect(w0.layout._totalChildrenWidth).to.equal(0);
            expect(w0.layout._totalChildrenHeight).to.equal(0);

            w0.layout.initTotalChildrenSize();

            // add together + spacing
            expect(w0.layout._totalChildrenWidth).to.equal(72);
            expect(w0.layout._totalChildrenHeight).to.equal(72);
        });
    });

    describe('#beginIteration()', function () {
        it('should prepare variables before iteration', function () {
            var wLayout = w0.layout;
            wLayout.beginIteration();

            expect(wLayout._totalChildrenHeight).to.equal(0);
            expect(wLayout._totalChildrenWidth).to.equal(0);

            expect(wLayout.posOffset.x).to.equal(0);
            expect(wLayout.posOffset.y).to.equal(0);
        });
    });

    describe('#setChildPos()', function () {
        it('should set the position of the child', function () {
            var wLayout = w0.layout;
            wLayout.setChildPos(w1);

            expect(wLayout._totalChildrenWidth).to.equal(24);
            expect(wLayout._totalChildrenHeight).to.equal(24);

            expect(w1.transform.position.x).to.equal(4);
            expect(w1.transform.position.y).to.equal(4);
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\layoutSys\\layouts\\BoxLayout-spec.js","/test\\spec\\layoutSys\\layouts")

},{"_process":4,"buffer":2}],18:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('FixedLayout', function () {
    var w0 = new UI.Widgets.Panel(null, { width: 400, height: 400 });
    var w1 = new UI.Widgets.Button(w0);
    w1.position.set(12, 12);

    describe('#setChildPos()', function () {
        it('should set the childs position', function () {
            expect(w1.transform.position.x).to.equal(0);
            expect(w1.transform.position.y).to.equal(0);

            w0.layout.setChildPos(w1);

            expect(w1.transform.position.x).to.equal(16);
            expect(w1.transform.position.y).to.equal(16);
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\layoutSys\\layouts\\FixedLayout-spec.js","/test\\spec\\layoutSys\\layouts")

},{"_process":4,"buffer":2}],19:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('HBoxLayout', function () {
    it('should construct a BoxLayout with HORIZONTAL orientation', function () {
        var w1 = new UI.Widgets.Panel();

        w1.layout = new UI.Layouts.HBoxLayout(w1);
        expect(w1.layout.orientation).to.equal(UI.HORIZONTAL);
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\layoutSys\\layouts\\HBoxLayout-spec.js","/test\\spec\\layoutSys\\layouts")

},{"_process":4,"buffer":2}],20:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('VBoxLayout', function () {
    it('should construct a BoxLayout with VERTICAL orientation', function () {
        var w1 = new UI.Widgets.Panel();

        w1.layout = new UI.Layouts.VBoxLayout(w1);
        expect(w1.layout.orientation).to.equal(UI.VERTICAL);
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\layoutSys\\layouts\\VBoxLayout-spec.js","/test\\spec\\layoutSys\\layouts")

},{"_process":4,"buffer":2}],21:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

require('./BaseLayout-spec');
require('./BoxLayout-spec');
require('./FixedLayout-spec');
require('./HBoxLayout-spec');
require('./VBoxLayout-spec');

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\layoutSys\\layouts\\index.js","/test\\spec\\layoutSys\\layouts")

},{"./BaseLayout-spec":16,"./BoxLayout-spec":17,"./FixedLayout-spec":18,"./HBoxLayout-spec":19,"./VBoxLayout-spec":20,"_process":4,"buffer":2}],22:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('BasePolicy', function () {
    var widget = new UI.Widgets.Button();

    describe('#setWidgetWidth()', function () {
        it('should set a widgets sizeProxys width', function () {
            widget.hPolicy.setWidgetWidth(widget, 100);
            expect(widget.sizeProxy._width).to.equal(100);
        });
    });

    describe('#setWidgetHeight()', function () {
        it('should set a widgets sizeProxys height', function () {
            widget.hPolicy.setWidgetHeight(widget, 100);
            expect(widget.sizeProxy._height).to.equal(100);
        });
    });

    describe('#validateWidth()', function () {
        it('should keep widgets width within min/max', function () {
            widget.min.width = 10;
            widget.max.width = 80;
            widget.width = 100;
            widget.hPolicy.validateWidth();
            expect(widget.width).to.equal(80);
            widget.width = 5;
            widget.hPolicy.validateWidth();
            expect(widget.width).to.equal(10);
        });
    });

    describe('#validateHeight()', function () {
        it('should keep widgets height within min/max', function () {
            widget.min.height = 10;
            widget.max.height = 80;
            widget.height = 100;
            widget.hPolicy.validateHeight();
            expect(widget.height).to.equal(80);
            widget.height = 5;
            widget.hPolicy.validateHeight();
            expect(widget.height).to.equal(10);
        });
    });

    describe('#childPolicyFinished()', function () {
        it('should add each childs size to totalChildrenFinishedSize and' + ' substract 1 from totalChildrenFinished', function () {
            widget.hPolicy.totalChildrenFinished = 1;
            widget.hPolicy.totalChildrenFinishedSize = 100;
            widget.hPolicy.childPolicyFinished(400);

            expect(widget.hPolicy.totalChildrenFinished).to.equal(0);
            expect(widget.hPolicy.totalChildrenFinishedSize).to.equal(500);

            // test if spacing is included
            // widget.layout = new UI.Layouts.HBoxLayout(widget);
            // widget.hPolicy.totalChildrenFinishedSize = 100;
            // widget.hPolicy.childPolicyFinished(400);
            //
            // expect(widget.hPolicy.totalChildrenFinishedSize).to.equal(504);
        });
    });

    describe('#exec()', function () {
        var widget2 = new UI.Widgets.Button(widget);

        it('should add a one time event' + '( register size with childPolicyFinished ) and exec the ' + 'HORIZONTAL size policy for each child ' + 'that is HORIZONTAL and an instanceof UI.Widgets.BaseWidget', function () {
            var spy = sinon.spy(widget2.hPolicy, 'exec');
            expect(widget2.hPolicy.listeners('finished', true)).to.be.false;
            expect(widget2).to.be.an.instanceof(UI.Widgets.BaseWidget);
            expect(widget.hPolicy.orientation).to.equal(UI.HORIZONTAL);
            widget.hPolicy.exec();
            // below wont work because the one time listener executes before
            // the above method is finished.
            // expect(widget2.hPolicy.listeners('finished', true)).to.be.true;
            expect(spy.called).to.be.true;
            widget2.hPolicy.exec.restore();
        });

        it('should add a one time event' + '( register size with childPolicyFinished ) and exec the ' + 'VERTICAL size policy for each child ' + 'that is VERTICAL and an instanceof UI.Widgets.BaseWidget', function () {
            var spy = sinon.spy(widget2.vPolicy, 'exec');
            expect(widget2.vPolicy.listeners('finished', true)).to.be.false;
            expect(widget2).to.be.an.instanceof(UI.Widgets.BaseWidget);
            expect(widget.vPolicy.orientation).to.equal(UI.VERTICAL);
            widget.vPolicy.exec();
            // below wont work because the one time listener executes before
            // the above method is finished.
            // expect(widget2.hPolicy.listeners('finished', true)).to.be.true;
            expect(spy.called).to.be.true;
            widget2.vPolicy.exec.restore();
        });

        it('should call sizeWidgetHorizontal() if the widget is HORIZONTAL', function () {
            var spy = sinon.spy(widget.hPolicy, 'sizeWidgetHorizontal');
            widget.hPolicy.exec();
            expect(spy.called).to.be.true;
            widget.hPolicy.sizeWidgetHorizontal.restore();
        });

        it('should call sizeWidgetVertical() if the widget is VERTICAL', function () {
            var spy = sinon.spy(widget.vPolicy, 'sizeWidgetVertical');
            widget.vPolicy.exec();
            expect(spy.called).to.be.true;
            widget.vPolicy.sizeWidgetVertical.restore();
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\layoutSys\\sizePolicies\\BasePolicy-spec.js","/test\\spec\\layoutSys\\sizePolicies")

},{"_process":4,"buffer":2}],23:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('ExpandingPolicy', function () {
    var widget0 = new UI.Widgets.Button();
    widget0.width = 200;widget0.height = 200;
    var widget1 = new UI.Widgets.Button(widget0);
    widget1.hPolicy = new UI.SizePolicies.ExpandingPolicy(widget1);
    widget1.vPolicy = new UI.SizePolicies.ExpandingPolicy(widget1);
    widget1.width = 100;widget1.height = 100;
    // describe('sizeWidgetHorizontal', ()=>{
    //     it('should add (this.parentReadyH) listener'
    //         + ' to its parent if one exist', ()=>{
    //         expect(widget0.hPolicy.listeners('finished', true)).to.be.false;
    //         widget1.hPolicy.sizeWidgetHorizontal();
    //         expect(widget0.hPolicy.listeners('finished', true)).to.be.true;
    //     });

    describe('#parentReadyH', function () {
        it('should size the widget to match its parents width - padding', function () {
            expect(widget1.width).to.equal(100);
            widget1.hPolicy.parentReadyH();
            expect(widget1.width).to.equal(192);
        });
    });

    describe('#parentReadyV', function () {
        it('should size the widget to match its parents height - padding', function () {
            expect(widget1.height).to.equal(100);
            widget1.vPolicy.parentReadyV();
            expect(widget1.height).to.equal(192);
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\layoutSys\\sizePolicies\\ExpandingPolicy-spec.js","/test\\spec\\layoutSys\\sizePolicies")

},{"_process":4,"buffer":2}],24:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('FixedPolicy', function () {
    var widget = new UI.Widgets.Button();

    describe('#sizeWidgetHorizontal', function () {
        it('should validate the width of the widget', function () {
            var spy = sinon.spy(widget.hPolicy, 'validateWidth');
            widget.hPolicy.sizeWidgetHorizontal();
            expect(spy.called).to.be.true;
            widget.hPolicy.validateWidth.restore();
        });
    });

    describe('#sizeWidgetVertical', function () {
        it('should validate the height of the widget', function () {
            var spy = sinon.spy(widget.vPolicy, 'validateHeight');
            widget.vPolicy.sizeWidgetVertical();
            expect(spy.called).to.be.true;
            widget.vPolicy.validateHeight.restore();
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\layoutSys\\sizePolicies\\FixedPolicy-spec.js","/test\\spec\\layoutSys\\sizePolicies")

},{"_process":4,"buffer":2}],25:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('SharedExpandingPolicy', function () {
    var widget0 = new UI.Widgets.Panel(null, { width: 400, height: 400 });
    widget0.layout = new UI.Layouts.HBoxLayout(widget0);

    var widget1 = new UI.Widgets.Button(widget0);
    widget1.hPolicy = new UI.SizePolicies.SharedExpandingPolicy(widget1);
    widget1.vPolicy = new UI.SizePolicies.SharedExpandingPolicy(widget1, UI.VERTICAL);

    var widget2 = new UI.Widgets.Button(widget0);
    widget2.hPolicy = new UI.SizePolicies.SharedExpandingPolicy(widget2);
    widget2.vPolicy = new UI.SizePolicies.SharedExpandingPolicy(widget2, UI.VERTICAL);

    describe('#parentReadyH', function () {
        it('should size the widgets equal size if all have shared policy', function () {
            widget0.hPolicy.exec();
            expect(widget1.width).to.equal(194);
            expect(widget2.width).to.equal(194);
        });

        it('should handle widgets that arent of shared policy', function () {
            var nullwidget = new UI.Widgets.Panel();
            var widget3 = new UI.Widgets.Button(widget0, { width: 100, height: 100 });
            widget3.hPolicy = new UI.SizePolicies.FixedPolicy(widget3);
            widget0.hPolicy.exec();
            expect(widget1.width).to.equal(142);
            expect(widget2.width).to.equal(142);
            expect(widget3.width).to.equal(100);
            nullwidget.addChild(widget3);
        });
    });

    describe('#parentReadyV', function () {
        it('should size the widgets equal size if all have shared policy', function () {
            /*
                same as above test.
             */
        });

        it('should handle widgets that arent of shared policy', function () {
            /*
                same as above test.
             */
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\layoutSys\\sizePolicies\\SharedExpandingPolicy-spec.js","/test\\spec\\layoutSys\\sizePolicies")

},{"_process":4,"buffer":2}],26:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

require('./BasePolicy-spec');
require('./ExpandingPolicy-spec');
require('./FixedPolicy-spec');
require('./SharedExpandingPolicy-spec');

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\layoutSys\\sizePolicies\\index.js","/test\\spec\\layoutSys\\sizePolicies")

},{"./BasePolicy-spec":22,"./ExpandingPolicy-spec":23,"./FixedPolicy-spec":24,"./SharedExpandingPolicy-spec":25,"_process":4,"buffer":2}],27:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('setOptions()', function () {
        it('should compare user set options object with' + ' default options and combine the values', function () {
                var defaults = {
                        name: 'blackhawk',
                        age: 28,
                        desc: 'crazy'
                };

                var user = {
                        age: 50,
                        desc: 'lazy'
                };

                user = UI.setOptions(user, defaults);

                expect(user.name).to.equal('blackhawk');
                expect(user.age).to.equal(50);
                expect(user.desc).to.equal('lazy');
        });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\options-spec.js","/test\\spec")

},{"_process":4,"buffer":2}],28:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

/*
TODO:
test things that should happen when events are fired.
eg. when padding changes _updateClipGraphic should be called.
 */

describe('BaseWidget', function () {
    var widget0 = new UI.Widgets.BaseWidget();
    var widget1 = new UI.Widgets.BaseWidget(widget0);
    var widget2 = new UI.Widgets.BaseWidget(widget1);

    beforeEach(function () {
        widget1.layout = new UI.Layouts.FixedLayout(widget1);
        widget2.hPolicy = new UI.Layouts.FixedLayout(widget2);
        widget0.hPolicy = new UI.Layouts.FixedLayout(widget0);
        widget1.validate();
        widget0.validate();
        widget2.validate();
    });

    it('should parent one widget to another', function () {
        expect(widget2.parent).to.equal(widget1);
    });

    describe('#routeInvalidation()', function () {
        it('should invalidate the highest parent', function () {
            widget1.layout = new UI.Layouts.HBoxLayout(widget1);
            widget2.hPolicy = new UI.Layouts.HBoxLayout(widget2);
            widget2.routeInvalidation();
            expect(widget0.valid).to.be.false;
            expect(widget1.valid).to.be.true;
            expect(widget2.valid).to.be.true;
        });

        it('should invalidate the first parent with a fixed size policy', function () {
            widget2.routeInvalidation();
            expect(widget0.valid).to.be.true;
            expect(widget1.valid).to.be.false;
            expect(widget2.valid).to.be.true;
        });
    });

    describe('#recursiveRouteUpdate()', function () {
        it('should route update to itself if no parent exist', function () {
            var updateSpy = sinon.spy(widget0, 'update');
            widget0.recursiveRouteUpdate();
            expect(updateSpy.called).to.be.true;
            widget0.update.restore();
        });

        it('should recursivley run this function if the parent is valid', function () {
            widget1.invalidate();
            var spy = sinon.spy(widget1, 'recursiveRouteUpdate');
            widget2.recursiveRouteUpdate();
            expect(spy.called).to.be.true;
            widget1.recursiveRouteUpdate.restore();
        });

        it('should route update to itself if parent is valid', function () {
            var updateSpy = sinon.spy(widget0, 'update');
            widget0.recursiveRouteUpdate();
            expect(updateSpy.called).to.be.true;
            widget0.update.restore();
        });
    });

    describe('#addChild', function () {
        it('should add its clipGraphic to each PIXI.Container ' + 'child added', function () {
            var pc = new PIXI.Container();
            widget2.addChild(pc);
            expect(pc.mask).to.equal(widget2.clipGraphic);
        });

        it('should add its theme to each BaseWidget child added', function () {
            expect(widget2.theme).to.equal(widget1.theme);
        });

        it('should add its clipGraphic to each BaseWidget child addeds' + ' size proxy', function () {
            expect(widget2.sizeProxy.mask).to.equal(widget1.clipGraphic);
        });
    });

    describe('#theme', function () {
        var aThm = new UI.Theme();
        it('should apply the set theme to children recursively', function () {
            widget0.theme = aThm;
            expect(widget1.theme).to.equal(widget0.theme);
            expect(widget2.theme).to.equal(widget1.theme);
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\widgets\\BaseWidget-spec.js","/test\\spec\\widgets")

},{"_process":4,"buffer":2}],29:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

// Button is basically just an interactive panel.
// Not much to test yet

describe('Button', function () {});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\widgets\\Button-spec.js","/test\\spec\\widgets")

},{"_process":4,"buffer":2}],30:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('Label', function () {});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\widgets\\Label-spec.js","/test\\spec\\widgets")

},{"_process":4,"buffer":2}],31:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('Panel', function () {
    // not much to test yet
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\widgets\\Panel-spec.js","/test\\spec\\widgets")

},{"_process":4,"buffer":2}],32:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('SITransform', function () {
    it('should allow a widget to transform its dimensions' + ' independent from its parent', function () {
        var widget0 = new UI.Widgets.Panel();
        widget0.width = 1000;
        var widget1 = new UI.Widgets.Panel();
        widget1.width = 200;
        widget0.addChild(widget1);
        widget0.width = 500;
        expect(widget1.width).to.equal(200);
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\widgets\\SITransform-spec.js","/test\\spec\\widgets")

},{"_process":4,"buffer":2}],33:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('Slider', function () {});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\widgets\\Slider-spec.js","/test\\spec\\widgets")

},{"_process":4,"buffer":2}],34:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('StageWidget', function () {});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\widgets\\StageWidget-spec.js","/test\\spec\\widgets")

},{"_process":4,"buffer":2}],35:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('TextButton', function () {
    describe('#Text', function () {
        it('should set the text for the contained label', function () {
            var tb = new UI.Widgets.TextButton();
            tb.text = 'meow';
            expect(tb.label.text).to.equal('meow');
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\widgets\\TextButton-spec.js","/test\\spec\\widgets")

},{"_process":4,"buffer":2}],36:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

require('./BaseWidget-spec');
require('./Button-spec');
require('./Label-spec');
require('./Panel-spec');
require('./SITransform-spec');
require('./StageWidget-spec');
require('./TextButton-spec');
require('./Slider-spec');

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\widgets\\index.js","/test\\spec\\widgets")

},{"./BaseWidget-spec":28,"./Button-spec":29,"./Label-spec":30,"./Panel-spec":31,"./SITransform-spec":32,"./Slider-spec":33,"./StageWidget-spec":34,"./TextButton-spec":35,"_process":4,"buffer":2}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsInRlc3RcXHRlc3RcXGluZGV4LmpzIiwidGVzdFxcc3BlY1xcdGVzdFxcc3BlY1xcQXBwLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx0ZXN0XFxzcGVjXFxHcmFwaGljc0dlbi1zcGVjLmpzIiwidGVzdFxcc3BlY1xcdGVzdFxcc3BlY1xcUGFkZGluZy1zcGVjLmpzIiwidGVzdFxcc3BlY1xcdGVzdFxcc3BlY1xcUG9pbnQtc3BlYy5qcyIsInRlc3RcXHNwZWNcXHRlc3RcXHNwZWNcXFNpemUtc3BlYy5qcyIsInRlc3RcXHNwZWNcXHRlc3RcXHNwZWNcXFRoZW1lLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx0ZXN0XFxzcGVjXFxVSUdyYXBoaWNzLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx0ZXN0XFxzcGVjXFxpbmRleC5qcyIsInRlc3RcXHNwZWNcXGxheW91dFN5c1xcdGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxBbGlnbm1lbnQtc3BlYy5qcyIsInRlc3RcXHNwZWNcXGxheW91dFN5c1xcdGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxpbmRleC5qcyIsInRlc3RcXHNwZWNcXGxheW91dFN5c1xcbGF5b3V0c1xcdGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxsYXlvdXRzXFxCYXNlTGF5b3V0LXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXGxheW91dHNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcbGF5b3V0c1xcQm94TGF5b3V0LXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXGxheW91dHNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcbGF5b3V0c1xcRml4ZWRMYXlvdXQtc3BlYy5qcyIsInRlc3RcXHNwZWNcXGxheW91dFN5c1xcbGF5b3V0c1xcdGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxsYXlvdXRzXFxIQm94TGF5b3V0LXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXGxheW91dHNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcbGF5b3V0c1xcVkJveExheW91dC1zcGVjLmpzIiwidGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxsYXlvdXRzXFx0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXGxheW91dHNcXGluZGV4LmpzIiwidGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxzaXplUG9saWNpZXNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcc2l6ZVBvbGljaWVzXFxCYXNlUG9saWN5LXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXHNpemVQb2xpY2llc1xcdGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxzaXplUG9saWNpZXNcXEV4cGFuZGluZ1BvbGljeS1zcGVjLmpzIiwidGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxzaXplUG9saWNpZXNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcc2l6ZVBvbGljaWVzXFxGaXhlZFBvbGljeS1zcGVjLmpzIiwidGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxzaXplUG9saWNpZXNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcc2l6ZVBvbGljaWVzXFxTaGFyZWRFeHBhbmRpbmdQb2xpY3ktc3BlYy5qcyIsInRlc3RcXHNwZWNcXGxheW91dFN5c1xcc2l6ZVBvbGljaWVzXFx0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXHNpemVQb2xpY2llc1xcaW5kZXguanMiLCJ0ZXN0XFxzcGVjXFx0ZXN0XFxzcGVjXFxvcHRpb25zLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx3aWRnZXRzXFx0ZXN0XFxzcGVjXFx3aWRnZXRzXFxCYXNlV2lkZ2V0LXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx3aWRnZXRzXFx0ZXN0XFxzcGVjXFx3aWRnZXRzXFxCdXR0b24tc3BlYy5qcyIsInRlc3RcXHNwZWNcXHdpZGdldHNcXHRlc3RcXHNwZWNcXHdpZGdldHNcXExhYmVsLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx3aWRnZXRzXFx0ZXN0XFxzcGVjXFx3aWRnZXRzXFxQYW5lbC1zcGVjLmpzIiwidGVzdFxcc3BlY1xcd2lkZ2V0c1xcdGVzdFxcc3BlY1xcd2lkZ2V0c1xcU0lUcmFuc2Zvcm0tc3BlYy5qcyIsInRlc3RcXHNwZWNcXHdpZGdldHNcXHRlc3RcXHNwZWNcXHdpZGdldHNcXFNsaWRlci1zcGVjLmpzIiwidGVzdFxcc3BlY1xcd2lkZ2V0c1xcdGVzdFxcc3BlY1xcd2lkZ2V0c1xcU3RhZ2VXaWRnZXQtc3BlYy5qcyIsInRlc3RcXHNwZWNcXHdpZGdldHNcXHRlc3RcXHNwZWNcXHdpZGdldHNcXFRleHRCdXR0b24tc3BlYy5qcyIsInRlc3RcXHNwZWNcXHdpZGdldHNcXHRlc3RcXHNwZWNcXHdpZGdldHNcXGluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDMXFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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S0FBUixHQUFnQixHQUFoQjtBQUNBLGdCQUFRLFFBQVIsQ0FBaUIsT0FBakI7QUFDQSxnQkFBUSxLQUFSLEdBQWdCLEdBQWhCO0FBQ0EsZUFBTyxRQUFRLEtBQWYsRUFBc0IsRUFBdEIsQ0FBeUIsS0FBekIsQ0FBK0IsR0FBL0I7QUFDSCxLQVRMO0FBVUgsQ0FYRDs7Ozs7O0FDRkE7O0FBRUEsU0FBUyxRQUFULEVBQW1CLFlBQUksQ0FFdEIsQ0FGRDs7Ozs7O0FDRkE7O0FBRUEsU0FBUyxhQUFULEVBQXdCLFlBQUksQ0FFM0IsQ0FGRDs7Ozs7O0FDRkE7O0FBRUEsU0FBUyxZQUFULEVBQXVCLFlBQUk7QUFDdkIsYUFBUyxPQUFULEVBQWtCLFlBQUk7QUFDbEIsV0FBRyw2Q0FBSCxFQUFrRCxZQUFJO0FBQ2xELGdCQUFJLEtBQUssSUFBSSxHQUFHLE9BQUgsQ0FBVyxVQUFmLEVBQVQ7QUFDQSxlQUFHLElBQUgsR0FBVSxNQUFWO0FBQ0EsbUJBQU8sR0FBRyxLQUFILENBQVMsSUFBaEIsRUFBc0IsRUFBdEIsQ0FBeUIsS0FBekIsQ0FBK0IsTUFBL0I7QUFDSCxTQUpEO0FBS0gsS0FORDtBQU9ILENBUkQ7Ozs7Ozs7O0FDRkEsUUFBUSxtQkFBUjtBQUNBLFFBQVEsZUFBUjtBQUNBLFFBQVEsY0FBUjtBQUNBLFFBQVEsY0FBUjtBQUNBLFFBQVEsb0JBQVI7QUFDQSxRQUFRLG9CQUFSO0FBQ0EsUUFBUSxtQkFBUjtBQUNBLFFBQVEsZUFBUiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCdcblxuZXhwb3J0cy5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuZXhwb3J0cy50b0J5dGVBcnJheSA9IHRvQnl0ZUFycmF5XG5leHBvcnRzLmZyb21CeXRlQXJyYXkgPSBmcm9tQnl0ZUFycmF5XG5cbnZhciBsb29rdXAgPSBbXVxudmFyIHJldkxvb2t1cCA9IFtdXG52YXIgQXJyID0gdHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnID8gVWludDhBcnJheSA6IEFycmF5XG5cbnZhciBjb2RlID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nXG5mb3IgKHZhciBpID0gMCwgbGVuID0gY29kZS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICBsb29rdXBbaV0gPSBjb2RlW2ldXG4gIHJldkxvb2t1cFtjb2RlLmNoYXJDb2RlQXQoaSldID0gaVxufVxuXG5yZXZMb29rdXBbJy0nLmNoYXJDb2RlQXQoMCldID0gNjJcbnJldkxvb2t1cFsnXycuY2hhckNvZGVBdCgwKV0gPSA2M1xuXG5mdW5jdGlvbiBwbGFjZUhvbGRlcnNDb3VudCAoYjY0KSB7XG4gIHZhciBsZW4gPSBiNjQubGVuZ3RoXG4gIGlmIChsZW4gJSA0ID4gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG4gIH1cblxuICAvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxuICAvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG4gIC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuICAvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcbiAgLy8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuICByZXR1cm4gYjY0W2xlbiAtIDJdID09PSAnPScgPyAyIDogYjY0W2xlbiAtIDFdID09PSAnPScgPyAxIDogMFxufVxuXG5mdW5jdGlvbiBieXRlTGVuZ3RoIChiNjQpIHtcbiAgLy8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG4gIHJldHVybiBiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnNDb3VudChiNjQpXG59XG5cbmZ1bmN0aW9uIHRvQnl0ZUFycmF5IChiNjQpIHtcbiAgdmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcbiAgdmFyIGxlbiA9IGI2NC5sZW5ndGhcbiAgcGxhY2VIb2xkZXJzID0gcGxhY2VIb2xkZXJzQ291bnQoYjY0KVxuXG4gIGFyciA9IG5ldyBBcnIobGVuICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cbiAgLy8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuICBsID0gcGxhY2VIb2xkZXJzID4gMCA/IGxlbiAtIDQgOiBsZW5cblxuICB2YXIgTCA9IDBcblxuICBmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG4gICAgdG1wID0gKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMTgpIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDEyKSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDIpXSA8PCA2KSB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMyldXG4gICAgYXJyW0wrK10gPSAodG1wID4+IDE2KSAmIDB4RkZcbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW0wrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICBpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG4gICAgdG1wID0gKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMikgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPj4gNClcbiAgICBhcnJbTCsrXSA9IHRtcCAmIDB4RkZcbiAgfSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcbiAgICB0bXAgPSAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxMCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgNCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPj4gMilcbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW0wrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICByZXR1cm4gYXJyXG59XG5cbmZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG4gIHJldHVybiBsb29rdXBbbnVtID4+IDE4ICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDEyICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDYgJiAweDNGXSArIGxvb2t1cFtudW0gJiAweDNGXVxufVxuXG5mdW5jdGlvbiBlbmNvZGVDaHVuayAodWludDgsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHRtcFxuICB2YXIgb3V0cHV0ID0gW11cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpICs9IDMpIHtcbiAgICB0bXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG4gICAgb3V0cHV0LnB1c2godHJpcGxldFRvQmFzZTY0KHRtcCkpXG4gIH1cbiAgcmV0dXJuIG91dHB1dC5qb2luKCcnKVxufVxuXG5mdW5jdGlvbiBmcm9tQnl0ZUFycmF5ICh1aW50OCkge1xuICB2YXIgdG1wXG4gIHZhciBsZW4gPSB1aW50OC5sZW5ndGhcbiAgdmFyIGV4dHJhQnl0ZXMgPSBsZW4gJSAzIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG4gIHZhciBvdXRwdXQgPSAnJ1xuICB2YXIgcGFydHMgPSBbXVxuICB2YXIgbWF4Q2h1bmtMZW5ndGggPSAxNjM4MyAvLyBtdXN0IGJlIG11bHRpcGxlIG9mIDNcblxuICAvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG4gIGZvciAodmFyIGkgPSAwLCBsZW4yID0gbGVuIC0gZXh0cmFCeXRlczsgaSA8IGxlbjI7IGkgKz0gbWF4Q2h1bmtMZW5ndGgpIHtcbiAgICBwYXJ0cy5wdXNoKGVuY29kZUNodW5rKHVpbnQ4LCBpLCAoaSArIG1heENodW5rTGVuZ3RoKSA+IGxlbjIgPyBsZW4yIDogKGkgKyBtYXhDaHVua0xlbmd0aCkpKVxuICB9XG5cbiAgLy8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuICBpZiAoZXh0cmFCeXRlcyA9PT0gMSkge1xuICAgIHRtcCA9IHVpbnQ4W2xlbiAtIDFdXG4gICAgb3V0cHV0ICs9IGxvb2t1cFt0bXAgPj4gMl1cbiAgICBvdXRwdXQgKz0gbG9va3VwWyh0bXAgPDwgNCkgJiAweDNGXVxuICAgIG91dHB1dCArPSAnPT0nXG4gIH0gZWxzZSBpZiAoZXh0cmFCeXRlcyA9PT0gMikge1xuICAgIHRtcCA9ICh1aW50OFtsZW4gLSAyXSA8PCA4KSArICh1aW50OFtsZW4gLSAxXSlcbiAgICBvdXRwdXQgKz0gbG9va3VwW3RtcCA+PiAxMF1cbiAgICBvdXRwdXQgKz0gbG9va3VwWyh0bXAgPj4gNCkgJiAweDNGXVxuICAgIG91dHB1dCArPSBsb29rdXBbKHRtcCA8PCAyKSAmIDB4M0ZdXG4gICAgb3V0cHV0ICs9ICc9J1xuICB9XG5cbiAgcGFydHMucHVzaChvdXRwdXQpXG5cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJycpXG59XG4iLCIvKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuXG4ndXNlIHN0cmljdCdcblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gU2xvd0J1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5cbnZhciBLX01BWF9MRU5HVEggPSAweDdmZmZmZmZmXG5leHBvcnRzLmtNYXhMZW5ndGggPSBLX01BWF9MRU5HVEhcblxuLyoqXG4gKiBJZiBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgUHJpbnQgd2FybmluZyBhbmQgcmVjb21tZW5kIHVzaW5nIGBidWZmZXJgIHY0Lnggd2hpY2ggaGFzIGFuIE9iamVjdFxuICogICAgICAgICAgICAgICBpbXBsZW1lbnRhdGlvbiAobW9zdCBjb21wYXRpYmxlLCBldmVuIElFNilcbiAqXG4gKiBCcm93c2VycyB0aGF0IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssIENocm9tZSA3KywgU2FmYXJpIDUuMSssXG4gKiBPcGVyYSAxMS42KywgaU9TIDQuMisuXG4gKlxuICogV2UgcmVwb3J0IHRoYXQgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB0eXBlZCBhcnJheXMgaWYgdGhlIGFyZSBub3Qgc3ViY2xhc3NhYmxlXG4gKiB1c2luZyBfX3Byb3RvX18uIEZpcmVmb3ggNC0yOSBsYWNrcyBzdXBwb3J0IGZvciBhZGRpbmcgbmV3IHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgXG4gKiAoU2VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzgpLiBJRSAxMCBsYWNrcyBzdXBwb3J0XG4gKiBmb3IgX19wcm90b19fIGFuZCBoYXMgYSBidWdneSB0eXBlZCBhcnJheSBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSB0eXBlZEFycmF5U3VwcG9ydCgpXG5cbmlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiYgdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGNvbnNvbGUuZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgY29uc29sZS5lcnJvcihcbiAgICAnVGhpcyBicm93c2VyIGxhY2tzIHR5cGVkIGFycmF5IChVaW50OEFycmF5KSBzdXBwb3J0IHdoaWNoIGlzIHJlcXVpcmVkIGJ5ICcgK1xuICAgICdgYnVmZmVyYCB2NS54LiBVc2UgYGJ1ZmZlcmAgdjQueCBpZiB5b3UgcmVxdWlyZSBvbGQgYnJvd3NlciBzdXBwb3J0LidcbiAgKVxufVxuXG5mdW5jdGlvbiB0eXBlZEFycmF5U3VwcG9ydCAoKSB7XG4gIC8vIENhbiB0eXBlZCBhcnJheSBpbnN0YW5jZXMgY2FuIGJlIGF1Z21lbnRlZD9cbiAgdHJ5IHtcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoMSlcbiAgICBhcnIuX19wcm90b19fID0ge19fcHJvdG9fXzogVWludDhBcnJheS5wcm90b3R5cGUsIGZvbzogZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfX1cbiAgICByZXR1cm4gYXJyLmZvbygpID09PSA0MlxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQnVmZmVyIChsZW5ndGgpIHtcbiAgaWYgKGxlbmd0aCA+IEtfTUFYX0xFTkdUSCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHR5cGVkIGFycmF5IGxlbmd0aCcpXG4gIH1cbiAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2VcbiAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGxlbmd0aClcbiAgYnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgcmV0dXJuIGJ1ZlxufVxuXG4vKipcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgaGF2ZSB0aGVpclxuICogcHJvdG90eXBlIGNoYW5nZWQgdG8gYEJ1ZmZlci5wcm90b3R5cGVgLiBGdXJ0aGVybW9yZSwgYEJ1ZmZlcmAgaXMgYSBzdWJjbGFzcyBvZlxuICogYFVpbnQ4QXJyYXlgLCBzbyB0aGUgcmV0dXJuZWQgaW5zdGFuY2VzIHdpbGwgaGF2ZSBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgbWV0aG9kc1xuICogYW5kIHRoZSBgVWludDhBcnJheWAgbWV0aG9kcy4gU3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXRcbiAqIHJldHVybnMgYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogVGhlIGBVaW50OEFycmF5YCBwcm90b3R5cGUgcmVtYWlucyB1bm1vZGlmaWVkLlxuICovXG5cbmZ1bmN0aW9uIEJ1ZmZlciAoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgLy8gQ29tbW9uIGNhc2UuXG4gIGlmICh0eXBlb2YgYXJnID09PSAnbnVtYmVyJykge1xuICAgIGlmICh0eXBlb2YgZW5jb2RpbmdPck9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ0lmIGVuY29kaW5nIGlzIHNwZWNpZmllZCB0aGVuIHRoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nJ1xuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gYWxsb2NVbnNhZmUoYXJnKVxuICB9XG4gIHJldHVybiBmcm9tKGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG4vLyBGaXggc3ViYXJyYXkoKSBpbiBFUzIwMTYuIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvcHVsbC85N1xuaWYgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC5zcGVjaWVzICYmXG4gICAgQnVmZmVyW1N5bWJvbC5zcGVjaWVzXSA9PT0gQnVmZmVyKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIsIFN5bWJvbC5zcGVjaWVzLCB7XG4gICAgdmFsdWU6IG51bGwsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIHdyaXRhYmxlOiBmYWxzZVxuICB9KVxufVxuXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyIC8vIG5vdCB1c2VkIGJ5IHRoaXMgaW1wbGVtZW50YXRpb25cblxuZnVuY3Rpb24gZnJvbSAodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1widmFsdWVcIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBhIG51bWJlcicpXG4gIH1cblxuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgIHJldHVybiBmcm9tQXJyYXlCdWZmZXIodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZyb21TdHJpbmcodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQpXG4gIH1cblxuICByZXR1cm4gZnJvbU9iamVjdCh2YWx1ZSlcbn1cblxuLyoqXG4gKiBGdW5jdGlvbmFsbHkgZXF1aXZhbGVudCB0byBCdWZmZXIoYXJnLCBlbmNvZGluZykgYnV0IHRocm93cyBhIFR5cGVFcnJvclxuICogaWYgdmFsdWUgaXMgYSBudW1iZXIuXG4gKiBCdWZmZXIuZnJvbShzdHJbLCBlbmNvZGluZ10pXG4gKiBCdWZmZXIuZnJvbShhcnJheSlcbiAqIEJ1ZmZlci5mcm9tKGJ1ZmZlcilcbiAqIEJ1ZmZlci5mcm9tKGFycmF5QnVmZmVyWywgYnl0ZU9mZnNldFssIGxlbmd0aF1dKVxuICoqL1xuQnVmZmVyLmZyb20gPSBmdW5jdGlvbiAodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gZnJvbSh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG4vLyBOb3RlOiBDaGFuZ2UgcHJvdG90eXBlICphZnRlciogQnVmZmVyLmZyb20gaXMgZGVmaW5lZCB0byB3b3JrYXJvdW5kIENocm9tZSBidWc6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9wdWxsLzE0OFxuQnVmZmVyLnByb3RvdHlwZS5fX3Byb3RvX18gPSBVaW50OEFycmF5LnByb3RvdHlwZVxuQnVmZmVyLl9fcHJvdG9fXyA9IFVpbnQ4QXJyYXlcblxuZnVuY3Rpb24gYXNzZXJ0U2l6ZSAoc2l6ZSkge1xuICBpZiAodHlwZW9mIHNpemUgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJzaXplXCIgYXJndW1lbnQgbXVzdCBiZSBhIG51bWJlcicpXG4gIH0gZWxzZSBpZiAoc2l6ZSA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJzaXplXCIgYXJndW1lbnQgbXVzdCBub3QgYmUgbmVnYXRpdmUnKVxuICB9XG59XG5cbmZ1bmN0aW9uIGFsbG9jIChzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIGlmIChzaXplIDw9IDApIHtcbiAgICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUpXG4gIH1cbiAgaWYgKGZpbGwgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE9ubHkgcGF5IGF0dGVudGlvbiB0byBlbmNvZGluZyBpZiBpdCdzIGEgc3RyaW5nLiBUaGlzXG4gICAgLy8gcHJldmVudHMgYWNjaWRlbnRhbGx5IHNlbmRpbmcgaW4gYSBudW1iZXIgdGhhdCB3b3VsZFxuICAgIC8vIGJlIGludGVycHJldHRlZCBhcyBhIHN0YXJ0IG9mZnNldC5cbiAgICByZXR1cm4gdHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJ1xuICAgICAgPyBjcmVhdGVCdWZmZXIoc2l6ZSkuZmlsbChmaWxsLCBlbmNvZGluZylcbiAgICAgIDogY3JlYXRlQnVmZmVyKHNpemUpLmZpbGwoZmlsbClcbiAgfVxuICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUpXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBmaWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICogYWxsb2Moc2l6ZVssIGZpbGxbLCBlbmNvZGluZ11dKVxuICoqL1xuQnVmZmVyLmFsbG9jID0gZnVuY3Rpb24gKHNpemUsIGZpbGwsIGVuY29kaW5nKSB7XG4gIHJldHVybiBhbGxvYyhzaXplLCBmaWxsLCBlbmNvZGluZylcbn1cblxuZnVuY3Rpb24gYWxsb2NVbnNhZmUgKHNpemUpIHtcbiAgYXNzZXJ0U2l6ZShzaXplKVxuICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUgPCAwID8gMCA6IGNoZWNrZWQoc2l6ZSkgfCAwKVxufVxuXG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gQnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiAqL1xuQnVmZmVyLmFsbG9jVW5zYWZlID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKHNpemUpXG59XG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gU2xvd0J1ZmZlcihudW0pLCBieSBkZWZhdWx0IGNyZWF0ZXMgYSBub24temVyby1maWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICovXG5CdWZmZXIuYWxsb2NVbnNhZmVTbG93ID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKHNpemUpXG59XG5cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycgfHwgZW5jb2RpbmcgPT09ICcnKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgfVxuXG4gIGlmICghQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJlbmNvZGluZ1wiIG11c3QgYmUgYSB2YWxpZCBzdHJpbmcgZW5jb2RpbmcnKVxuICB9XG5cbiAgdmFyIGxlbmd0aCA9IGJ5dGVMZW5ndGgoc3RyaW5nLCBlbmNvZGluZykgfCAwXG4gIHZhciBidWYgPSBjcmVhdGVCdWZmZXIobGVuZ3RoKVxuXG4gIHZhciBhY3R1YWwgPSBidWYud3JpdGUoc3RyaW5nLCBlbmNvZGluZylcblxuICBpZiAoYWN0dWFsICE9PSBsZW5ndGgpIHtcbiAgICAvLyBXcml0aW5nIGEgaGV4IHN0cmluZywgZm9yIGV4YW1wbGUsIHRoYXQgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzIHdpbGxcbiAgICAvLyBjYXVzZSBldmVyeXRoaW5nIGFmdGVyIHRoZSBmaXJzdCBpbnZhbGlkIGNoYXJhY3RlciB0byBiZSBpZ25vcmVkLiAoZS5nLlxuICAgIC8vICdhYnh4Y2QnIHdpbGwgYmUgdHJlYXRlZCBhcyAnYWInKVxuICAgIGJ1ZiA9IGJ1Zi5zbGljZSgwLCBhY3R1YWwpXG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUxpa2UgKGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGggPCAwID8gMCA6IGNoZWNrZWQoYXJyYXkubGVuZ3RoKSB8IDBcbiAgdmFyIGJ1ZiA9IGNyZWF0ZUJ1ZmZlcihsZW5ndGgpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICBidWZbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5QnVmZmVyIChhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmIChieXRlT2Zmc2V0IDwgMCB8fCBhcnJheS5ieXRlTGVuZ3RoIDwgYnl0ZU9mZnNldCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcXCdvZmZzZXRcXCcgaXMgb3V0IG9mIGJvdW5kcycpXG4gIH1cblxuICBpZiAoYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQgKyAobGVuZ3RoIHx8IDApKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1xcJ2xlbmd0aFxcJyBpcyBvdXQgb2YgYm91bmRzJylcbiAgfVxuXG4gIHZhciBidWZcbiAgaWYgKGJ5dGVPZmZzZXQgPT09IHVuZGVmaW5lZCAmJiBsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5KVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQpXG4gIH0gZWxzZSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIGJ1Zi5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbU9iamVjdCAob2JqKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIob2JqKSkge1xuICAgIHZhciBsZW4gPSBjaGVja2VkKG9iai5sZW5ndGgpIHwgMFxuICAgIHZhciBidWYgPSBjcmVhdGVCdWZmZXIobGVuKVxuXG4gICAgaWYgKGJ1Zi5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBidWZcbiAgICB9XG5cbiAgICBvYmouY29weShidWYsIDAsIDAsIGxlbilcbiAgICByZXR1cm4gYnVmXG4gIH1cblxuICBpZiAob2JqKSB7XG4gICAgaWYgKEFycmF5QnVmZmVyLmlzVmlldyhvYmopIHx8ICdsZW5ndGgnIGluIG9iaikge1xuICAgICAgaWYgKHR5cGVvZiBvYmoubGVuZ3RoICE9PSAnbnVtYmVyJyB8fCBpc25hbihvYmoubGVuZ3RoKSkge1xuICAgICAgICByZXR1cm4gY3JlYXRlQnVmZmVyKDApXG4gICAgICB9XG4gICAgICByZXR1cm4gZnJvbUFycmF5TGlrZShvYmopXG4gICAgfVxuXG4gICAgaWYgKG9iai50eXBlID09PSAnQnVmZmVyJyAmJiBBcnJheS5pc0FycmF5KG9iai5kYXRhKSkge1xuICAgICAgcmV0dXJuIGZyb21BcnJheUxpa2Uob2JqLmRhdGEpXG4gICAgfVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksIG9yIGFycmF5LWxpa2Ugb2JqZWN0LicpXG59XG5cbmZ1bmN0aW9uIGNoZWNrZWQgKGxlbmd0aCkge1xuICAvLyBOb3RlOiBjYW5ub3QgdXNlIGBsZW5ndGggPCBLX01BWF9MRU5HVEhgIGhlcmUgYmVjYXVzZSB0aGF0IGZhaWxzIHdoZW5cbiAgLy8gbGVuZ3RoIGlzIE5hTiAod2hpY2ggaXMgb3RoZXJ3aXNlIGNvZXJjZWQgdG8gemVyby4pXG4gIGlmIChsZW5ndGggPj0gS19NQVhfTEVOR1RIKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gYWxsb2NhdGUgQnVmZmVyIGxhcmdlciB0aGFuIG1heGltdW0gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3NpemU6IDB4JyArIEtfTUFYX0xFTkdUSC50b1N0cmluZygxNikgKyAnIGJ5dGVzJylcbiAgfVxuICByZXR1cm4gbGVuZ3RoIHwgMFxufVxuXG5mdW5jdGlvbiBTbG93QnVmZmVyIChsZW5ndGgpIHtcbiAgaWYgKCtsZW5ndGggIT0gbGVuZ3RoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZXFlcWVxXG4gICAgbGVuZ3RoID0gMFxuICB9XG4gIHJldHVybiBCdWZmZXIuYWxsb2MoK2xlbmd0aClcbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gaXNCdWZmZXIgKGIpIHtcbiAgcmV0dXJuIGIgIT0gbnVsbCAmJiBiLl9pc0J1ZmZlciA9PT0gdHJ1ZVxufVxuXG5CdWZmZXIuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKGEsIGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYSkgfHwgIUJ1ZmZlci5pc0J1ZmZlcihiKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyBtdXN0IGJlIEJ1ZmZlcnMnKVxuICB9XG5cbiAgaWYgKGEgPT09IGIpIHJldHVybiAwXG5cbiAgdmFyIHggPSBhLmxlbmd0aFxuICB2YXIgeSA9IGIubGVuZ3RoXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IE1hdGgubWluKHgsIHkpOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAoYVtpXSAhPT0gYltpXSkge1xuICAgICAgeCA9IGFbaV1cbiAgICAgIHkgPSBiW2ldXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiBpc0VuY29kaW5nIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdsYXRpbjEnOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIGNvbmNhdCAobGlzdCwgbGVuZ3RoKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShsaXN0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gIH1cblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gQnVmZmVyLmFsbG9jKDApXG4gIH1cblxuICB2YXIgaVxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBsZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgIGxlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWZmZXIgPSBCdWZmZXIuYWxsb2NVbnNhZmUobGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgIHZhciBidWYgPSBsaXN0W2ldXG4gICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0XCIgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzJylcbiAgICB9XG4gICAgYnVmLmNvcHkoYnVmZmVyLCBwb3MpXG4gICAgcG9zICs9IGJ1Zi5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmZmVyXG59XG5cbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdHJpbmcpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5sZW5ndGhcbiAgfVxuICBpZiAoQXJyYXlCdWZmZXIuaXNWaWV3KHN0cmluZykgfHwgc3RyaW5nIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICByZXR1cm4gc3RyaW5nLmJ5dGVMZW5ndGhcbiAgfVxuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICBzdHJpbmcgPSAnJyArIHN0cmluZ1xuICB9XG5cbiAgdmFyIGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKGxlbiA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBVc2UgYSBmb3IgbG9vcCB0byBhdm9pZCByZWN1cnNpb25cbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGVuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiBsZW4gKiAyXG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gbGVuID4+PiAxXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGggLy8gYXNzdW1lIHV0ZjhcbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuXG5mdW5jdGlvbiBzbG93VG9TdHJpbmcgKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG5cbiAgLy8gTm8gbmVlZCB0byB2ZXJpZnkgdGhhdCBcInRoaXMubGVuZ3RoIDw9IE1BWF9VSU5UMzJcIiBzaW5jZSBpdCdzIGEgcmVhZC1vbmx5XG4gIC8vIHByb3BlcnR5IG9mIGEgdHlwZWQgYXJyYXkuXG5cbiAgLy8gVGhpcyBiZWhhdmVzIG5laXRoZXIgbGlrZSBTdHJpbmcgbm9yIFVpbnQ4QXJyYXkgaW4gdGhhdCB3ZSBzZXQgc3RhcnQvZW5kXG4gIC8vIHRvIHRoZWlyIHVwcGVyL2xvd2VyIGJvdW5kcyBpZiB0aGUgdmFsdWUgcGFzc2VkIGlzIG91dCBvZiByYW5nZS5cbiAgLy8gdW5kZWZpbmVkIGlzIGhhbmRsZWQgc3BlY2lhbGx5IGFzIHBlciBFQ01BLTI2MiA2dGggRWRpdGlvbixcbiAgLy8gU2VjdGlvbiAxMy4zLjMuNyBSdW50aW1lIFNlbWFudGljczogS2V5ZWRCaW5kaW5nSW5pdGlhbGl6YXRpb24uXG4gIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkIHx8IHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ID0gMFxuICB9XG4gIC8vIFJldHVybiBlYXJseSBpZiBzdGFydCA+IHRoaXMubGVuZ3RoLiBEb25lIGhlcmUgdG8gcHJldmVudCBwb3RlbnRpYWwgdWludDMyXG4gIC8vIGNvZXJjaW9uIGZhaWwgYmVsb3cuXG4gIGlmIChzdGFydCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBpZiAoZW5kID09PSB1bmRlZmluZWQgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICB9XG5cbiAgaWYgKGVuZCA8PSAwKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICAvLyBGb3JjZSBjb2Vyc2lvbiB0byB1aW50MzIuIFRoaXMgd2lsbCBhbHNvIGNvZXJjZSBmYWxzZXkvTmFOIHZhbHVlcyB0byAwLlxuICBlbmQgPj4+PSAwXG4gIHN0YXJ0ID4+Pj0gMFxuXG4gIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxhdGluMVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdXRmMTZsZVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9IChlbmNvZGluZyArICcnKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG4vLyBUaGlzIHByb3BlcnR5IGlzIHVzZWQgYnkgYEJ1ZmZlci5pc0J1ZmZlcmAgKGFuZCB0aGUgYGlzLWJ1ZmZlcmAgbnBtIHBhY2thZ2UpXG4vLyB0byBkZXRlY3QgYSBCdWZmZXIgaW5zdGFuY2UuIEl0J3Mgbm90IHBvc3NpYmxlIHRvIHVzZSBgaW5zdGFuY2VvZiBCdWZmZXJgXG4vLyByZWxpYWJseSBpbiBhIGJyb3dzZXJpZnkgY29udGV4dCBiZWNhdXNlIHRoZXJlIGNvdWxkIGJlIG11bHRpcGxlIGRpZmZlcmVudFxuLy8gY29waWVzIG9mIHRoZSAnYnVmZmVyJyBwYWNrYWdlIGluIHVzZS4gVGhpcyBtZXRob2Qgd29ya3MgZXZlbiBmb3IgQnVmZmVyXG4vLyBpbnN0YW5jZXMgdGhhdCB3ZXJlIGNyZWF0ZWQgZnJvbSBhbm90aGVyIGNvcHkgb2YgdGhlIGBidWZmZXJgIHBhY2thZ2UuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL2lzc3Vlcy8xNTRcbkJ1ZmZlci5wcm90b3R5cGUuX2lzQnVmZmVyID0gdHJ1ZVxuXG5mdW5jdGlvbiBzd2FwIChiLCBuLCBtKSB7XG4gIHZhciBpID0gYltuXVxuICBiW25dID0gYlttXVxuICBiW21dID0gaVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXAxNiA9IGZ1bmN0aW9uIHN3YXAxNiAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgMiAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMTYtYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gMikge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDEpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMzIgPSBmdW5jdGlvbiBzd2FwMzIgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDQgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDMyLWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDQpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyAzKVxuICAgIHN3YXAodGhpcywgaSArIDEsIGkgKyAyKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDY0ID0gZnVuY3Rpb24gc3dhcDY0ICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSA4ICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA2NC1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSA4KSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgNylcbiAgICBzd2FwKHRoaXMsIGkgKyAxLCBpICsgNilcbiAgICBzd2FwKHRoaXMsIGkgKyAyLCBpICsgNSlcbiAgICBzd2FwKHRoaXMsIGkgKyAzLCBpICsgNClcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcgKCkge1xuICB2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIDAsIGxlbmd0aClcbiAgcmV0dXJuIHNsb3dUb1N0cmluZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiB0cnVlXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiBpbnNwZWN0ICgpIHtcbiAgdmFyIHN0ciA9ICcnXG4gIHZhciBtYXggPSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTXG4gIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICBzdHIgPSB0aGlzLnRvU3RyaW5nKCdoZXgnLCAwLCBtYXgpLm1hdGNoKC8uezJ9L2cpLmpvaW4oJyAnKVxuICAgIGlmICh0aGlzLmxlbmd0aCA+IG1heCkgc3RyICs9ICcgLi4uICdcbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIHN0ciArICc+J1xufVxuXG5CdWZmZXIucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlICh0YXJnZXQsIHN0YXJ0LCBlbmQsIHRoaXNTdGFydCwgdGhpc0VuZCkge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0YXJnZXQpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIH1cblxuICBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHN0YXJ0ID0gMFxuICB9XG4gIGlmIChlbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuZCA9IHRhcmdldCA/IHRhcmdldC5sZW5ndGggOiAwXG4gIH1cbiAgaWYgKHRoaXNTdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc1N0YXJ0ID0gMFxuICB9XG4gIGlmICh0aGlzRW5kID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzRW5kID0gdGhpcy5sZW5ndGhcbiAgfVxuXG4gIGlmIChzdGFydCA8IDAgfHwgZW5kID4gdGFyZ2V0Lmxlbmd0aCB8fCB0aGlzU3RhcnQgPCAwIHx8IHRoaXNFbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdvdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKHRoaXNTdGFydCA+PSB0aGlzRW5kICYmIHN0YXJ0ID49IGVuZCkge1xuICAgIHJldHVybiAwXG4gIH1cbiAgaWYgKHRoaXNTdGFydCA+PSB0aGlzRW5kKSB7XG4gICAgcmV0dXJuIC0xXG4gIH1cbiAgaWYgKHN0YXJ0ID49IGVuZCkge1xuICAgIHJldHVybiAxXG4gIH1cblxuICBzdGFydCA+Pj49IDBcbiAgZW5kID4+Pj0gMFxuICB0aGlzU3RhcnQgPj4+PSAwXG4gIHRoaXNFbmQgPj4+PSAwXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCkgcmV0dXJuIDBcblxuICB2YXIgeCA9IHRoaXNFbmQgLSB0aGlzU3RhcnRcbiAgdmFyIHkgPSBlbmQgLSBzdGFydFxuICB2YXIgbGVuID0gTWF0aC5taW4oeCwgeSlcblxuICB2YXIgdGhpc0NvcHkgPSB0aGlzLnNsaWNlKHRoaXNTdGFydCwgdGhpc0VuZClcbiAgdmFyIHRhcmdldENvcHkgPSB0YXJnZXQuc2xpY2Uoc3RhcnQsIGVuZClcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgaWYgKHRoaXNDb3B5W2ldICE9PSB0YXJnZXRDb3B5W2ldKSB7XG4gICAgICB4ID0gdGhpc0NvcHlbaV1cbiAgICAgIHkgPSB0YXJnZXRDb3B5W2ldXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuLy8gRmluZHMgZWl0aGVyIHRoZSBmaXJzdCBpbmRleCBvZiBgdmFsYCBpbiBgYnVmZmVyYCBhdCBvZmZzZXQgPj0gYGJ5dGVPZmZzZXRgLFxuLy8gT1IgdGhlIGxhc3QgaW5kZXggb2YgYHZhbGAgaW4gYGJ1ZmZlcmAgYXQgb2Zmc2V0IDw9IGBieXRlT2Zmc2V0YC5cbi8vXG4vLyBBcmd1bWVudHM6XG4vLyAtIGJ1ZmZlciAtIGEgQnVmZmVyIHRvIHNlYXJjaFxuLy8gLSB2YWwgLSBhIHN0cmluZywgQnVmZmVyLCBvciBudW1iZXJcbi8vIC0gYnl0ZU9mZnNldCAtIGFuIGluZGV4IGludG8gYGJ1ZmZlcmA7IHdpbGwgYmUgY2xhbXBlZCB0byBhbiBpbnQzMlxuLy8gLSBlbmNvZGluZyAtIGFuIG9wdGlvbmFsIGVuY29kaW5nLCByZWxldmFudCBpcyB2YWwgaXMgYSBzdHJpbmdcbi8vIC0gZGlyIC0gdHJ1ZSBmb3IgaW5kZXhPZiwgZmFsc2UgZm9yIGxhc3RJbmRleE9mXG5mdW5jdGlvbiBiaWRpcmVjdGlvbmFsSW5kZXhPZiAoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpIHtcbiAgLy8gRW1wdHkgYnVmZmVyIG1lYW5zIG5vIG1hdGNoXG4gIGlmIChidWZmZXIubGVuZ3RoID09PSAwKSByZXR1cm4gLTFcblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldFxuICBpZiAodHlwZW9mIGJ5dGVPZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBieXRlT2Zmc2V0XG4gICAgYnl0ZU9mZnNldCA9IDBcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0ID4gMHg3ZmZmZmZmZikge1xuICAgIGJ5dGVPZmZzZXQgPSAweDdmZmZmZmZmXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA8IC0weDgwMDAwMDAwKSB7XG4gICAgYnl0ZU9mZnNldCA9IC0weDgwMDAwMDAwXG4gIH1cbiAgYnl0ZU9mZnNldCA9ICtieXRlT2Zmc2V0ICAvLyBDb2VyY2UgdG8gTnVtYmVyLlxuICBpZiAoaXNOYU4oYnl0ZU9mZnNldCkpIHtcbiAgICAvLyBieXRlT2Zmc2V0OiBpdCBpdCdzIHVuZGVmaW5lZCwgbnVsbCwgTmFOLCBcImZvb1wiLCBldGMsIHNlYXJjaCB3aG9sZSBidWZmZXJcbiAgICBieXRlT2Zmc2V0ID0gZGlyID8gMCA6IChidWZmZXIubGVuZ3RoIC0gMSlcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSBieXRlT2Zmc2V0OiBuZWdhdGl2ZSBvZmZzZXRzIHN0YXJ0IGZyb20gdGhlIGVuZCBvZiB0aGUgYnVmZmVyXG4gIGlmIChieXRlT2Zmc2V0IDwgMCkgYnl0ZU9mZnNldCA9IGJ1ZmZlci5sZW5ndGggKyBieXRlT2Zmc2V0XG4gIGlmIChieXRlT2Zmc2V0ID49IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICBpZiAoZGlyKSByZXR1cm4gLTFcbiAgICBlbHNlIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoIC0gMVxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAwKSB7XG4gICAgaWYgKGRpcikgYnl0ZU9mZnNldCA9IDBcbiAgICBlbHNlIHJldHVybiAtMVxuICB9XG5cbiAgLy8gTm9ybWFsaXplIHZhbFxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWwgPSBCdWZmZXIuZnJvbSh2YWwsIGVuY29kaW5nKVxuICB9XG5cbiAgLy8gRmluYWxseSwgc2VhcmNoIGVpdGhlciBpbmRleE9mIChpZiBkaXIgaXMgdHJ1ZSkgb3IgbGFzdEluZGV4T2ZcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcih2YWwpKSB7XG4gICAgLy8gU3BlY2lhbCBjYXNlOiBsb29raW5nIGZvciBlbXB0eSBzdHJpbmcvYnVmZmVyIGFsd2F5cyBmYWlsc1xuICAgIGlmICh2YWwubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gLTFcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5SW5kZXhPZihidWZmZXIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcilcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHZhbCA9IHZhbCAmIDB4RkYgLy8gU2VhcmNoIGZvciBhIGJ5dGUgdmFsdWUgWzAtMjU1XVxuICAgIGlmICh0eXBlb2YgVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKGRpcikge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmxhc3RJbmRleE9mLmNhbGwoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCBbIHZhbCBdLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmFsIG11c3QgYmUgc3RyaW5nLCBudW1iZXIgb3IgQnVmZmVyJylcbn1cblxuZnVuY3Rpb24gYXJyYXlJbmRleE9mIChhcnIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcikge1xuICB2YXIgaW5kZXhTaXplID0gMVxuICB2YXIgYXJyTGVuZ3RoID0gYXJyLmxlbmd0aFxuICB2YXIgdmFsTGVuZ3RoID0gdmFsLmxlbmd0aFxuXG4gIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICBpZiAoZW5jb2RpbmcgPT09ICd1Y3MyJyB8fCBlbmNvZGluZyA9PT0gJ3Vjcy0yJyB8fFxuICAgICAgICBlbmNvZGluZyA9PT0gJ3V0ZjE2bGUnIHx8IGVuY29kaW5nID09PSAndXRmLTE2bGUnKSB7XG4gICAgICBpZiAoYXJyLmxlbmd0aCA8IDIgfHwgdmFsLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICB9XG4gICAgICBpbmRleFNpemUgPSAyXG4gICAgICBhcnJMZW5ndGggLz0gMlxuICAgICAgdmFsTGVuZ3RoIC89IDJcbiAgICAgIGJ5dGVPZmZzZXQgLz0gMlxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWQgKGJ1ZiwgaSkge1xuICAgIGlmIChpbmRleFNpemUgPT09IDEpIHtcbiAgICAgIHJldHVybiBidWZbaV1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGJ1Zi5yZWFkVUludDE2QkUoaSAqIGluZGV4U2l6ZSlcbiAgICB9XG4gIH1cblxuICB2YXIgaVxuICBpZiAoZGlyKSB7XG4gICAgdmFyIGZvdW5kSW5kZXggPSAtMVxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPCBhcnJMZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHJlYWQoYXJyLCBpKSA9PT0gcmVhZCh2YWwsIGZvdW5kSW5kZXggPT09IC0xID8gMCA6IGkgLSBmb3VuZEluZGV4KSkge1xuICAgICAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIGZvdW5kSW5kZXggPSBpXG4gICAgICAgIGlmIChpIC0gZm91bmRJbmRleCArIDEgPT09IHZhbExlbmd0aCkgcmV0dXJuIGZvdW5kSW5kZXggKiBpbmRleFNpemVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ICE9PSAtMSkgaSAtPSBpIC0gZm91bmRJbmRleFxuICAgICAgICBmb3VuZEluZGV4ID0gLTFcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGJ5dGVPZmZzZXQgKyB2YWxMZW5ndGggPiBhcnJMZW5ndGgpIGJ5dGVPZmZzZXQgPSBhcnJMZW5ndGggLSB2YWxMZW5ndGhcbiAgICBmb3IgKGkgPSBieXRlT2Zmc2V0OyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIGZvdW5kID0gdHJ1ZVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWxMZW5ndGg7IGorKykge1xuICAgICAgICBpZiAocmVhZChhcnIsIGkgKyBqKSAhPT0gcmVhZCh2YWwsIGopKSB7XG4gICAgICAgICAgZm91bmQgPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmNsdWRlcyA9IGZ1bmN0aW9uIGluY2x1ZGVzICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiB0aGlzLmluZGV4T2YodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykgIT09IC0xXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uIGluZGV4T2YgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGJpZGlyZWN0aW9uYWxJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIHRydWUpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUubGFzdEluZGV4T2YgPSBmdW5jdGlvbiBsYXN0SW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIGhleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKHN0ckxlbiAlIDIgIT09IDApIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIHZhciBwYXJzZWQgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgaWYgKGlzTmFOKHBhcnNlZCkpIHJldHVybiBpXG4gICAgYnVmW29mZnNldCArIGldID0gcGFyc2VkXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBsYXRpbjFXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBhc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIHVjczJXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiB3cml0ZSAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZylcbiAgaWYgKG9mZnNldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIG9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBvZmZzZXRbLCBsZW5ndGhdWywgZW5jb2RpbmddKVxuICB9IGVsc2UgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgICBpZiAoaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgbGVuZ3RoID0gbGVuZ3RoID4+PiAwXG4gICAgICBpZiAoZW5jb2RpbmcgPT09IHVuZGVmaW5lZCkgZW5jb2RpbmcgPSAndXRmOCdcbiAgICB9IGVsc2Uge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnQnVmZmVyLndyaXRlKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldFssIGxlbmd0aF0pIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQnXG4gICAgKVxuICB9XG5cbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCB8fCBsZW5ndGggPiByZW1haW5pbmcpIGxlbmd0aCA9IHJlbWFpbmluZ1xuXG4gIGlmICgoc3RyaW5nLmxlbmd0aCA+IDAgJiYgKGxlbmd0aCA8IDAgfHwgb2Zmc2V0IDwgMCkpIHx8IG9mZnNldCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gd3JpdGUgb3V0c2lkZSBidWZmZXIgYm91bmRzJylcbiAgfVxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG5cbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBoZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICAgIHJldHVybiBhc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGF0aW4xV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgLy8gV2FybmluZzogbWF4TGVuZ3RoIG5vdCB0YWtlbiBpbnRvIGFjY291bnQgaW4gYmFzZTY0V3JpdGVcbiAgICAgICAgcmV0dXJuIGJhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1Y3MyV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKCcnICsgZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gdG9KU09OICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG5mdW5jdGlvbiBiYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuICB2YXIgcmVzID0gW11cblxuICB2YXIgaSA9IHN0YXJ0XG4gIHdoaWxlIChpIDwgZW5kKSB7XG4gICAgdmFyIGZpcnN0Qnl0ZSA9IGJ1ZltpXVxuICAgIHZhciBjb2RlUG9pbnQgPSBudWxsXG4gICAgdmFyIGJ5dGVzUGVyU2VxdWVuY2UgPSAoZmlyc3RCeXRlID4gMHhFRikgPyA0XG4gICAgICA6IChmaXJzdEJ5dGUgPiAweERGKSA/IDNcbiAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4QkYpID8gMlxuICAgICAgOiAxXG5cbiAgICBpZiAoaSArIGJ5dGVzUGVyU2VxdWVuY2UgPD0gZW5kKSB7XG4gICAgICB2YXIgc2Vjb25kQnl0ZSwgdGhpcmRCeXRlLCBmb3VydGhCeXRlLCB0ZW1wQ29kZVBvaW50XG5cbiAgICAgIHN3aXRjaCAoYnl0ZXNQZXJTZXF1ZW5jZSkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgaWYgKGZpcnN0Qnl0ZSA8IDB4ODApIHtcbiAgICAgICAgICAgIGNvZGVQb2ludCA9IGZpcnN0Qnl0ZVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweDFGKSA8PCAweDYgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0YpIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICB0aGlyZEJ5dGUgPSBidWZbaSArIDJdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHhDIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweDYgfCAodGhpcmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3RkYgJiYgKHRlbXBDb2RlUG9pbnQgPCAweEQ4MDAgfHwgdGVtcENvZGVQb2ludCA+IDB4REZGRikpIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICB0aGlyZEJ5dGUgPSBidWZbaSArIDJdXG4gICAgICAgICAgZm91cnRoQnl0ZSA9IGJ1ZltpICsgM11cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKGZvdXJ0aEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4MTIgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4QyB8ICh0aGlyZEJ5dGUgJiAweDNGKSA8PCAweDYgfCAoZm91cnRoQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4RkZGRiAmJiB0ZW1wQ29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29kZVBvaW50ID09PSBudWxsKSB7XG4gICAgICAvLyB3ZSBkaWQgbm90IGdlbmVyYXRlIGEgdmFsaWQgY29kZVBvaW50IHNvIGluc2VydCBhXG4gICAgICAvLyByZXBsYWNlbWVudCBjaGFyIChVK0ZGRkQpIGFuZCBhZHZhbmNlIG9ubHkgMSBieXRlXG4gICAgICBjb2RlUG9pbnQgPSAweEZGRkRcbiAgICAgIGJ5dGVzUGVyU2VxdWVuY2UgPSAxXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPiAweEZGRkYpIHtcbiAgICAgIC8vIGVuY29kZSB0byB1dGYxNiAoc3Vycm9nYXRlIHBhaXIgZGFuY2UpXG4gICAgICBjb2RlUG9pbnQgLT0gMHgxMDAwMFxuICAgICAgcmVzLnB1c2goY29kZVBvaW50ID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKVxuICAgICAgY29kZVBvaW50ID0gMHhEQzAwIHwgY29kZVBvaW50ICYgMHgzRkZcbiAgICB9XG5cbiAgICByZXMucHVzaChjb2RlUG9pbnQpXG4gICAgaSArPSBieXRlc1BlclNlcXVlbmNlXG4gIH1cblxuICByZXR1cm4gZGVjb2RlQ29kZVBvaW50c0FycmF5KHJlcylcbn1cblxuLy8gQmFzZWQgb24gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjI3NDcyNzIvNjgwNzQyLCB0aGUgYnJvd3NlciB3aXRoXG4vLyB0aGUgbG93ZXN0IGxpbWl0IGlzIENocm9tZSwgd2l0aCAweDEwMDAwIGFyZ3MuXG4vLyBXZSBnbyAxIG1hZ25pdHVkZSBsZXNzLCBmb3Igc2FmZXR5XG52YXIgTUFYX0FSR1VNRU5UU19MRU5HVEggPSAweDEwMDBcblxuZnVuY3Rpb24gZGVjb2RlQ29kZVBvaW50c0FycmF5IChjb2RlUG9pbnRzKSB7XG4gIHZhciBsZW4gPSBjb2RlUG9pbnRzLmxlbmd0aFxuICBpZiAobGVuIDw9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoU3RyaW5nLCBjb2RlUG9pbnRzKSAvLyBhdm9pZCBleHRyYSBzbGljZSgpXG4gIH1cblxuICAvLyBEZWNvZGUgaW4gY2h1bmtzIHRvIGF2b2lkIFwiY2FsbCBzdGFjayBzaXplIGV4Y2VlZGVkXCIuXG4gIHZhciByZXMgPSAnJ1xuICB2YXIgaSA9IDBcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShcbiAgICAgIFN0cmluZyxcbiAgICAgIGNvZGVQb2ludHMuc2xpY2UoaSwgaSArPSBNQVhfQVJHVU1FTlRTX0xFTkdUSClcbiAgICApXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSAmIDB4N0YpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBsYXRpbjFTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBoZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICB2YXIgcmVzID0gJydcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgKGJ5dGVzW2kgKyAxXSAqIDI1NikpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gc2xpY2UgKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gfn5zdGFydFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IH5+ZW5kXG5cbiAgaWYgKHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ICs9IGxlblxuICAgIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gMFxuICB9IGVsc2UgaWYgKHN0YXJ0ID4gbGVuKSB7XG4gICAgc3RhcnQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCAwKSB7XG4gICAgZW5kICs9IGxlblxuICAgIGlmIChlbmQgPCAwKSBlbmQgPSAwXG4gIH0gZWxzZSBpZiAoZW5kID4gbGVuKSB7XG4gICAgZW5kID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgdmFyIG5ld0J1ZiA9IHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZClcbiAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2VcbiAgbmV3QnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgcmV0dXJuIG5ld0J1ZlxufVxuXG4vKlxuICogTmVlZCB0byBtYWtlIHN1cmUgdGhhdCBidWZmZXIgaXNuJ3QgdHJ5aW5nIHRvIHdyaXRlIG91dCBvZiBib3VuZHMuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrT2Zmc2V0IChvZmZzZXQsIGV4dCwgbGVuZ3RoKSB7XG4gIGlmICgob2Zmc2V0ICUgMSkgIT09IDAgfHwgb2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ29mZnNldCBpcyBub3QgdWludCcpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBsZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdUcnlpbmcgdG8gYWNjZXNzIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludExFID0gZnVuY3Rpb24gcmVhZFVJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRCRSA9IGZ1bmN0aW9uIHJlYWRVSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuICB9XG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXVxuICB2YXIgbXVsID0gMVxuICB3aGlsZSAoYnl0ZUxlbmd0aCA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gcmVhZFVJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiByZWFkVUludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDgpIHwgdGhpc1tvZmZzZXQgKyAxXVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRVSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKCh0aGlzW29mZnNldF0pIHxcbiAgICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSkgK1xuICAgICAgKHRoaXNbb2Zmc2V0ICsgM10gKiAweDEwMDAwMDApXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdICogMHgxMDAwMDAwKSArXG4gICAgKCh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgIHRoaXNbb2Zmc2V0ICsgM10pXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludExFID0gZnVuY3Rpb24gcmVhZEludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF1cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRCRSA9IGZ1bmN0aW9uIHJlYWRJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgaSA9IGJ5dGVMZW5ndGhcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1pXVxuICB3aGlsZSAoaSA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIHJlYWRJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICBpZiAoISh0aGlzW29mZnNldF0gJiAweDgwKSkgcmV0dXJuICh0aGlzW29mZnNldF0pXG4gIHJldHVybiAoKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gcmVhZEludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiByZWFkSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgMV0gfCAodGhpc1tvZmZzZXRdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdKSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10gPDwgMjQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiByZWFkSW50MzJCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCAyNCkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gcmVhZEZsb2F0TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdEJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCA1MiwgOClcbn1cblxuZnVuY3Rpb24gY2hlY2tJbnQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImJ1ZmZlclwiIGFyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXIgaW5zdGFuY2UnKVxuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHRocm93IG5ldyBSYW5nZUVycm9yKCdcInZhbHVlXCIgYXJndW1lbnQgaXMgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlVUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbWF4Qnl0ZXMgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCkgLSAxXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbWF4Qnl0ZXMsIDApXG4gIH1cblxuICB2YXIgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIHZhciBtdWwgPSAxXG4gIHRoaXNbb2Zmc2V0ICsgaV0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKC0taSA+PSAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiB3cml0ZVVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludExFID0gZnVuY3Rpb24gd3JpdGVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCAoOCAqIGJ5dGVMZW5ndGgpIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgdmFyIGkgPSAwXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSAtIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlSW50QkUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIGxpbWl0ID0gTWF0aC5wb3coMiwgKDggKiBieXRlTGVuZ3RoKSAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHN1YiA9IDBcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICBpZiAodmFsdWUgPCAwICYmIHN1YiA9PT0gMCAmJiB0aGlzW29mZnNldCArIGkgKyAxXSAhPT0gMCkge1xuICAgICAgc3ViID0gMVxuICAgIH1cbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uIHdyaXRlSW50OCAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4N2YsIC0weDgwKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmYgKyB2YWx1ZSArIDFcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmZmZmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbmZ1bmN0aW9uIGNoZWNrSUVFRTc1NCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbiAgaWYgKG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5mdW5jdGlvbiB3cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA0LCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiB3cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgOCwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbiAgcmV0dXJuIG9mZnNldCArIDhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiBjb3B5ICh0YXJnZXQsIHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXRTdGFydCA+PSB0YXJnZXQubGVuZ3RoKSB0YXJnZXRTdGFydCA9IHRhcmdldC5sZW5ndGhcbiAgaWYgKCF0YXJnZXRTdGFydCkgdGFyZ2V0U3RhcnQgPSAwXG4gIGlmIChlbmQgPiAwICYmIGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuIDBcbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgdGhpcy5sZW5ndGggPT09IDApIHJldHVybiAwXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBpZiAodGFyZ2V0U3RhcnQgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICB9XG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgaWYgKGVuZCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0IDwgZW5kIC0gc3RhcnQpIHtcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgKyBzdGFydFxuICB9XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG4gIHZhciBpXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCAmJiBzdGFydCA8IHRhcmdldFN0YXJ0ICYmIHRhcmdldFN0YXJ0IDwgZW5kKSB7XG4gICAgLy8gZGVzY2VuZGluZyBjb3B5IGZyb20gZW5kXG4gICAgZm9yIChpID0gbGVuIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0U3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2UgaWYgKGxlbiA8IDEwMDApIHtcbiAgICAvLyBhc2NlbmRpbmcgY29weSBmcm9tIHN0YXJ0XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICB0YXJnZXRbaSArIHRhcmdldFN0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBVaW50OEFycmF5LnByb3RvdHlwZS5zZXQuY2FsbChcbiAgICAgIHRhcmdldCxcbiAgICAgIHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSxcbiAgICAgIHRhcmdldFN0YXJ0XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIGxlblxufVxuXG4vLyBVc2FnZTpcbi8vICAgIGJ1ZmZlci5maWxsKG51bWJlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoYnVmZmVyWywgb2Zmc2V0WywgZW5kXV0pXG4vLyAgICBidWZmZXIuZmlsbChzdHJpbmdbLCBvZmZzZXRbLCBlbmRdXVssIGVuY29kaW5nXSlcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uIGZpbGwgKHZhbCwgc3RhcnQsIGVuZCwgZW5jb2RpbmcpIHtcbiAgLy8gSGFuZGxlIHN0cmluZyBjYXNlczpcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKHR5cGVvZiBzdGFydCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gc3RhcnRcbiAgICAgIHN0YXJ0ID0gMFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbmQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IGVuZFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9XG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDEpIHtcbiAgICAgIHZhciBjb2RlID0gdmFsLmNoYXJDb2RlQXQoMClcbiAgICAgIGlmIChjb2RlIDwgMjU2KSB7XG4gICAgICAgIHZhbCA9IGNvZGVcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZW5jb2RpbmcgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnICYmICFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAyNTVcbiAgfVxuXG4gIC8vIEludmFsaWQgcmFuZ2VzIGFyZSBub3Qgc2V0IHRvIGEgZGVmYXVsdCwgc28gY2FuIHJhbmdlIGNoZWNrIGVhcmx5LlxuICBpZiAoc3RhcnQgPCAwIHx8IHRoaXMubGVuZ3RoIDwgc3RhcnQgfHwgdGhpcy5sZW5ndGggPCBlbmQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignT3V0IG9mIHJhbmdlIGluZGV4JylcbiAgfVxuXG4gIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc3RhcnQgPSBzdGFydCA+Pj4gMFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IHRoaXMubGVuZ3RoIDogZW5kID4+PiAwXG5cbiAgaWYgKCF2YWwpIHZhbCA9IDBcblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgICB0aGlzW2ldID0gdmFsXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhciBieXRlcyA9IEJ1ZmZlci5pc0J1ZmZlcih2YWwpXG4gICAgICA/IHZhbFxuICAgICAgOiBuZXcgQnVmZmVyKHZhbCwgZW5jb2RpbmcpXG4gICAgdmFyIGxlbiA9IGJ5dGVzLmxlbmd0aFxuICAgIGZvciAoaSA9IDA7IGkgPCBlbmQgLSBzdGFydDsgKytpKSB7XG4gICAgICB0aGlzW2kgKyBzdGFydF0gPSBieXRlc1tpICUgbGVuXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzXG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxudmFyIElOVkFMSURfQkFTRTY0X1JFID0gL1teKy8wLTlBLVphLXotX10vZ1xuXG5mdW5jdGlvbiBiYXNlNjRjbGVhbiAoc3RyKSB7XG4gIC8vIE5vZGUgc3RyaXBzIG91dCBpbnZhbGlkIGNoYXJhY3RlcnMgbGlrZSBcXG4gYW5kIFxcdCBmcm9tIHRoZSBzdHJpbmcsIGJhc2U2NC1qcyBkb2VzIG5vdFxuICBzdHIgPSBzdHJpbmd0cmltKHN0cikucmVwbGFjZShJTlZBTElEX0JBU0U2NF9SRSwgJycpXG4gIC8vIE5vZGUgY29udmVydHMgc3RyaW5ncyB3aXRoIGxlbmd0aCA8IDIgdG8gJydcbiAgaWYgKHN0ci5sZW5ndGggPCAyKSByZXR1cm4gJydcbiAgLy8gTm9kZSBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgYmFzZTY0IHN0cmluZ3MgKG1pc3NpbmcgdHJhaWxpbmcgPT09KSwgYmFzZTY0LWpzIGRvZXMgbm90XG4gIHdoaWxlIChzdHIubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgIHN0ciA9IHN0ciArICc9J1xuICB9XG4gIHJldHVybiBzdHJcbn1cblxuZnVuY3Rpb24gc3RyaW5ndHJpbSAoc3RyKSB7XG4gIGlmIChzdHIudHJpbSkgcmV0dXJuIHN0ci50cmltKClcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eXFxzK3xcXHMrJC9nLCAnJylcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyaW5nLCB1bml0cykge1xuICB1bml0cyA9IHVuaXRzIHx8IEluZmluaXR5XG4gIHZhciBjb2RlUG9pbnRcbiAgdmFyIGxlbmd0aCA9IHN0cmluZy5sZW5ndGhcbiAgdmFyIGxlYWRTdXJyb2dhdGUgPSBudWxsXG4gIHZhciBieXRlcyA9IFtdXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvZGVQb2ludCA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG5cbiAgICAvLyBpcyBzdXJyb2dhdGUgY29tcG9uZW50XG4gICAgaWYgKGNvZGVQb2ludCA+IDB4RDdGRiAmJiBjb2RlUG9pbnQgPCAweEUwMDApIHtcbiAgICAgIC8vIGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoIWxlYWRTdXJyb2dhdGUpIHtcbiAgICAgICAgLy8gbm8gbGVhZCB5ZXRcbiAgICAgICAgaWYgKGNvZGVQb2ludCA+IDB4REJGRikge1xuICAgICAgICAgIC8vIHVuZXhwZWN0ZWQgdHJhaWxcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2UgaWYgKGkgKyAxID09PSBsZW5ndGgpIHtcbiAgICAgICAgICAvLyB1bnBhaXJlZCBsZWFkXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHZhbGlkIGxlYWRcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIDIgbGVhZHMgaW4gYSByb3dcbiAgICAgIGlmIChjb2RlUG9pbnQgPCAweERDMDApIHtcbiAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gdmFsaWQgc3Vycm9nYXRlIHBhaXJcbiAgICAgIGNvZGVQb2ludCA9IChsZWFkU3Vycm9nYXRlIC0gMHhEODAwIDw8IDEwIHwgY29kZVBvaW50IC0gMHhEQzAwKSArIDB4MTAwMDBcbiAgICB9IGVsc2UgaWYgKGxlYWRTdXJyb2dhdGUpIHtcbiAgICAgIC8vIHZhbGlkIGJtcCBjaGFyLCBidXQgbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgIH1cblxuICAgIGxlYWRTdXJyb2dhdGUgPSBudWxsXG5cbiAgICAvLyBlbmNvZGUgdXRmOFxuICAgIGlmIChjb2RlUG9pbnQgPCAweDgwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDEpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goY29kZVBvaW50KVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHg4MDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiB8IDB4QzAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDMpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgfCAweEUwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSA0KSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHgxMiB8IDB4RjAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29kZSBwb2ludCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIsIHVuaXRzKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG5cbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShiYXNlNjRjbGVhbihzdHIpKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSkgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiBpc25hbiAodmFsKSB7XG4gIHJldHVybiB2YWwgIT09IHZhbCAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxufVxuIiwiZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBuQml0cyA9IC03XG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcbiAgdmFyIGQgPSBpc0xFID8gLTEgOiAxXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcbiAgdmFyIGQgPSBpc0xFID8gMSA6IC0xXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiJ3VzZSBzdHJpY3QnO1xuLy8gcmVxdWlyZSgnLi4vLi9kaXN0L1VJLmpzJyk7XG5cbmRlc2NyaWJlKCdVSScsICgpPT57XG4gICAgaXQoJ3Nob3VsZCBleGlzdCBhcyBhIGdsb2JhbCBvYmplY3QnLCAoKT0+e1xuICAgICAgICBleHBlY3QoVUkpLnRvLmJlLmFuKCdvYmplY3QnKTtcbiAgICB9KTtcbiAgICByZXF1aXJlKCcuL3NwZWMnKTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5kZXNjcmliZSgnQXBwJywgKCk9PntcbiAgICBsZXQgYXBwID0gbmV3IFVJLkFwcCgpO1xuXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgYSBwaXhpIGNhbnZhcyBvbiB0aGUgcGFnZScsICgpPT57XG4gICAgICAgIGV4cGVjdChkb2N1bWVudC5ib2R5LmNvbnRhaW5zKGFwcC5yZW5kZXJlci52aWV3KSkudG8uYmUudHJ1ZTtcbiAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgaGF2ZSBhIHZhbGlkIHRoZW1lJywgKCk9PntcbiAgICAgICAgZXhwZWN0KGFwcC50aGVtZSkudG8uYmUuYW4uaW5zdGFuY2VvZihVSS5UaGVtZSk7XG4gICAgfSk7XG5cbiAgICBpdCgnc2hvdWxkIGhhdmUgYSB2YWxpZCByb290IHdpZGdldCcsICgpPT57XG4gICAgICAgIGV4cGVjdChhcHAucm9vdCkubm90LnRvLmVxdWFsKHVuZGVmaW5lZCk7XG4gICAgICAgIGV4cGVjdChhcHAucm9vdCkubm90LnRvLmVxdWFsKG51bGwpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCByZXNpemUgdGhlIHJvb3Qgd2lkZ2V0IHRvIG1hdGNoIHRoZSB3aW5kb3cnLCAoKT0+e1xuICAgICAgICB3aW5kb3cucmVzaXplQnkoMzAwLCAyMDApO1xuICAgICAgICBleHBlY3QoYXBwLnJvb3Qud2lkdGgpLnRvLmVxdWFsKHdpbmRvdy5pbm5lcldpZHRoKTtcbiAgICAgICAgZXhwZWN0KGFwcC5yb290LmhlaWdodCkudG8uZXF1YWwod2luZG93LmlubmVySGVpZ2h0KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCcjbmFtZScsICgpPT57XG4gICAgICAgIGl0KCdzaG91bGQgY2hhbmdlIHRoZSBwYWdlIHRpdGxlJywgKCk9PntcbiAgICAgICAgICAgIGFwcC5uYW1lID0gJ0dvb2RBcHAhJztcbiAgICAgICAgICAgIGV4cGVjdChkb2N1bWVudC50aXRsZSkudG8uZXF1YWwoJ0dvb2RBcHAhJyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmRlc2NyaWJlKCdHcmFwaGljc0dlbicsICgpPT57XG4gICAgZGVzY3JpYmUoJyNyZWN0YW5nbGVHcmFwaGljKCknLCAoKT0+e1xuICAgICAgICBpdCgnc2hvdWxkIHJldHVybiBhIFBpeGkuR3JhcGhpY3Mgd2l0aCBhICdcbiAgICAgICAgICAgICsgJ3dpZHRoIG9mIDgwIGFuZCBhIGhlaWdodCBvZiAxMDAnLCAoKT0+e1xuICAgICAgICAgICAgICAgIGxldCByZWN0R3JhcGhpYyA9XG4gICAgICAgICAgICAgICAgICAgIFVJLkdyYXBoaWNzR2VuLnJlY3RhbmdsZUdyYXBoaWMoODAsIDEwMCwgMHgwMDAwMDApO1xuXG4gICAgICAgICAgICAgICAgZXhwZWN0KHJlY3RHcmFwaGljKS50by5iZS5hbi5pbnN0YW5jZW9mKFBJWEkuR3JhcGhpY3MpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChyZWN0R3JhcGhpYy53aWR0aCkudG8uZXF1YWwoODApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChyZWN0R3JhcGhpYy5oZWlnaHQpLnRvLmVxdWFsKDEwMCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCcjcmVjdGFuZ2xlVGV4dHVyZSgpJywgKCk9PntcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gYSBQSVhJLlRleHR1cmUgd2l0aCBhJ1xuICAgICAgICAgICAgKyAnIHdpZHRoIG9mIDEwMCBhbmQgYSBoZWlnaHQgb2YgODAnLCAoKT0+e1xuICAgICAgICAgICAgICAgIGxldCByZWN0VGV4ID1cbiAgICAgICAgICAgICAgICAgICAgVUkuR3JhcGhpY3NHZW4ucmVjdGFuZ2xlVGV4dHVyZSgxMDAsIDgwLCAweDAwMDAwMCk7XG5cbiAgICAgICAgICAgICAgICBleHBlY3QocmVjdFRleCkudG8uYmUuYW4uaW5zdGFuY2VvZihQSVhJLlRleHR1cmUpO1xuICAgICAgICAgICAgICAgIGV4cGVjdChyZWN0VGV4LndpZHRoKS50by5lcXVhbCgxMDApO1xuICAgICAgICAgICAgICAgIGV4cGVjdChyZWN0VGV4LmhlaWdodCkudG8uZXF1YWwoODApO1xuICAgICAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZGVzY3JpYmUoJ1BhZGRpbmcnLCAoKT0+e1xuICAgIGxldCBwYWQgPSBuZXcgVUkuUGFkZGluZygpO1xuICAgIGl0KCdzaG91bGQgYmUgY3JlYXRlZCB3aXRoIGEgZGVmYXVsdCBvZiAwJywgKCk9PntcbiAgICAgICAgZXhwZWN0KHBhZC5sZWZ0KS50by5lcXVhbCgwKTtcbiAgICAgICAgZXhwZWN0KHBhZC50b3ApLnRvLmVxdWFsKDApO1xuICAgICAgICBleHBlY3QocGFkLnJpZ2h0KS50by5lcXVhbCgwKTtcbiAgICAgICAgZXhwZWN0KHBhZC5ib3R0b20pLnRvLmVxdWFsKDApO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJyNzZXQoKScsICgpPT57XG4gICAgICAgIGl0KCdzaG91bGQgc2V0IGVhY2ggcGFkZGluZyB0byB0aGUgdmFsdWVzIG9mIDEsMiwzLDQnLCAoKT0+e1xuICAgICAgICAgICAgcGFkLnNldCgxLCAyLCAzLCA0KTtcbiAgICAgICAgICAgIGV4cGVjdChwYWQubGVmdCkudG8uZXF1YWwoMik7XG4gICAgICAgICAgICBleHBlY3QocGFkLnRvcCkudG8uZXF1YWwoMSk7XG4gICAgICAgICAgICBleHBlY3QocGFkLnJpZ2h0KS50by5lcXVhbCg0KTtcbiAgICAgICAgICAgIGV4cGVjdChwYWQuYm90dG9tKS50by5lcXVhbCgzKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnI3NldEFsbFRvKCknLCAoKT0+e1xuICAgICAgICBpdCgnc2hvdWxkIHNldCBhbGwgcGFkZGluZyB2YWx1ZXMgdG8gMTAnLCAoKT0+e1xuICAgICAgICAgICAgcGFkLnNldEFsbFRvKDEwKTtcbiAgICAgICAgICAgIGV4cGVjdChwYWQubGVmdCkudG8uZXF1YWwoMTApO1xuICAgICAgICAgICAgZXhwZWN0KHBhZC50b3ApLnRvLmVxdWFsKDEwKTtcbiAgICAgICAgICAgIGV4cGVjdChwYWQucmlnaHQpLnRvLmVxdWFsKDEwKTtcbiAgICAgICAgICAgIGV4cGVjdChwYWQuYm90dG9tKS50by5lcXVhbCgxMCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmRlc2NyaWJlKCdQb2ludCcsICgpPT57XG4gICAgbGV0IHAgPSBuZXcgVUkuUG9pbnQoKTtcbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSB3aXRoIGRlZmF1bHQgeCBhbmQgeSBvZiAwJywgKCk9PntcbiAgICAgICAgZXhwZWN0KHAueCkudG8uZXF1YWwoMCk7XG4gICAgICAgIGV4cGVjdChwLnkpLnRvLmVxdWFsKDApO1xuICAgIH0pO1xuICAgIGRlc2NyaWJlKCcjc2V0KCknLCAoKT0+e1xuICAgICAgICBpdCgnc2hvdWxkIHNldCB4IGFuZCB5IHRvIDIwLCA4MCcsICgpPT57XG4gICAgICAgICAgICBwLnNldCgyMCwgODApO1xuICAgICAgICAgICAgZXhwZWN0KHAueCkudG8uZXF1YWwoMjApO1xuICAgICAgICAgICAgZXhwZWN0KHAueSkudG8uZXF1YWwoODApO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5kZXNjcmliZSgnU2l6ZScsICgpPT57XG4gICAgbGV0IHMgPSBuZXcgVUkuU2l6ZSgpO1xuICAgIGl0KCdzaG91bGQgY3JlYXRlIHdpdGggZGVmYXVsdCBzaXplIG9mIDAnLCAoKT0+e1xuICAgICAgICBleHBlY3Qocy53aWR0aCkudG8uZXF1YWwoMCk7XG4gICAgICAgIGV4cGVjdChzLmhlaWdodCkudG8uZXF1YWwoMCk7XG4gICAgfSk7XG4gICAgZGVzY3JpYmUoJyNzZXQoKScsICgpPT57XG4gICAgICAgIGl0KCdzaG91bGQgc2V0IHdpZHRoIGFuZCBoZWlnaHQgdG8gMjAsIDgwJywgKCk9PntcbiAgICAgICAgICAgIHMuc2V0KDIwLCA4MCk7XG4gICAgICAgICAgICBleHBlY3Qocy53aWR0aCkudG8uZXF1YWwoMjApO1xuICAgICAgICAgICAgZXhwZWN0KHMuaGVpZ2h0KS50by5lcXVhbCg4MCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG4iLCIndXNlIHN0cmljdCc7XG5cbmRlc2NyaWJlKCdVSUdyYXBoaWNzJywgKCk9PiB7XG4gICAgbGV0IHVpZyA9IG5ldyBVSS5VSUdyYXBoaWNzKCk7XG4gICAgbGV0IHRobSA9IG5ldyBVSS5UaGVtZSgpO1xuICAgIGRlc2NyaWJlKCcjbWFrZUdyYXBoaWNzRnJvbVRoZW1lKCknLCAoKT0+IHtcbiAgICAgICAgaXQoJ3Nob3VsZCBwYXNzIGEgdmFsaWQgdGhlbWUgcGFyYW0nLCAoKT0+e1xuICAgICAgICAgICAgZXhwZWN0KCgpPT57XG4gICAgICAgICAgICAgICAgdWlnLm1ha2VHcmFwaGljc0Zyb21UaGVtZSh0aG0pO1xuICAgICAgICAgICAgfSkudG8ubm90LnRocm93KEVycm9yKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCB0aHJvdyBhIFR5cGVFcnJvciBpZiBpbnZhbGlkIHRoZW1lIHBhc3NlZCcsICgpPT57XG4gICAgICAgICAgICBleHBlY3QoKCk9PntcbiAgICAgICAgICAgICAgICB1aWcubWFrZUdyYXBoaWNzRnJvbVRoZW1lKCdpbnZhbGlkIHRoZW1lJyk7XG4gICAgICAgICAgICB9KS50by50aHJvdyhUeXBlRXJyb3IpO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuIiwicmVxdWlyZSgnLi9VSUdyYXBoaWNzLXNwZWMnKTtcbnJlcXVpcmUoJy4vVGhlbWUtc3BlYycpO1xucmVxdWlyZSgnLi9TaXplLXNwZWMnKTtcbnJlcXVpcmUoJy4vUG9pbnQtc3BlYycpO1xucmVxdWlyZSgnLi9QYWRkaW5nLXNwZWMnKTtcbnJlcXVpcmUoJy4vb3B0aW9ucy1zcGVjJyk7XG5yZXF1aXJlKCcuL0dyYXBoaWNzR2VuLXNwZWMnKTtcbnJlcXVpcmUoJy4vQXBwLXNwZWMnKTtcbnJlcXVpcmUoJy4vd2lkZ2V0cycpO1xucmVxdWlyZSgnLi9sYXlvdXRTeXMnKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZGVzY3JpYmUoJ0FsaWdubWVudCcsICgpPT57XG4gICAgbGV0IHdpZGdldDAgPSBuZXcgVUkuV2lkZ2V0cy5CYXNlV2lkZ2V0KCk7XG4gICAgd2lkZ2V0MC53aWR0aCA9IDQwMDsgd2lkZ2V0MC5oZWlnaHQgPSA0MDA7XG4gICAgbGV0IHdpZGdldDEgPSBuZXcgVUkuV2lkZ2V0cy5CYXNlV2lkZ2V0KHdpZGdldDApO1xuICAgIHdpZGdldDEud2lkdGggPSAyMDA7IHdpZGdldDEuaGVpZ2h0ID0gMjAwO1xuXG4gICAgZGVzY3JpYmUoJyNnZXRPZmZzZXQoKScsICgpPT57XG4gICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIGEgcmVsYXRpdmUgb2Zmc2V0IGJhc2Ugb24gdGhlIGdpdmVuIGhvcml6b250YWwnXG4gICAgICAgICAgICArICcgYW5kIHZlcnRpY2FsIGFsaWdubWVudCcsICgpPT57XG4gICAgICAgICAgICAgICAgd2lkZ2V0MC5sYXlvdXQuYWxpZ25tZW50LmhBbGlnbiA9IFVJLkFsaWdubWVudC5jZW50ZXI7XG4gICAgICAgICAgICAgICAgd2lkZ2V0MC5sYXlvdXQuYWxpZ25tZW50LnZBbGlnbiA9IFVJLkFsaWdubWVudC5taWRkbGU7XG4gICAgICAgICAgICAgICAgbGV0IG9mZiA9IG5ldyBVSS5Qb2ludCgpO1xuICAgICAgICAgICAgICAgIG9mZiA9IHdpZGdldDAubGF5b3V0LmFsaWdubWVudC5nZXRPZmZzZXQod2lkZ2V0MCxcbiAgICAgICAgICAgICAgICAgICAgd2lkZ2V0MS53aWR0aCwgd2lkZ2V0MS5oZWlnaHQpO1xuICAgICAgICAgICAgICAgIC8vICh3aWRnZXQwLndpZHRoLzIpIC0gKHdpZGdldDEud2lkdGgvMilcbiAgICAgICAgICAgICAgICBleHBlY3Qob2ZmLngpLnRvLmVxdWFsKDEwMCk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KG9mZi55KS50by5lcXVhbCgxMDApO1xuICAgICAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnI2xlZnQnLCAoKT0+e1xuICAgICAgICBpdCgnc2hvdWxkIHJldHVybiByZWxhdGl2ZSBwb3NpdGlvbiBmb3IgbGVmdCBhbGlnbm1lbnQnLCAoKT0+e1xuICAgICAgICAgICAgbGV0IG9mZiA9IFVJLkFsaWdubWVudC5sZWZ0KDQwMCwgd2lkZ2V0MCk7XG4gICAgICAgICAgICBleHBlY3Qob2ZmKS50by5lcXVhbCg0KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnI2NlbnRlcicsICgpPT57XG4gICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIHJlbGF0aXZlIHBvc2l0aW9uIGZvciBjZW50ZXIgYWxpZ25tZW50JywgKCk9PntcbiAgICAgICAgICAgIGxldCBvZmYgPSBVSS5BbGlnbm1lbnQuY2VudGVyKDEwMCwgd2lkZ2V0MCk7XG4gICAgICAgICAgICBleHBlY3Qob2ZmKS50by5lcXVhbCgxNTApO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCcjcmlnaHQnLCAoKT0+e1xuICAgICAgICBpdCgnc2hvdWxkIHJldHVybiByZWxhdGl2ZSBwb3NpdGlvbiBmb3IgcmlnaHQgYWxpZ25tZW50JywgKCk9PntcbiAgICAgICAgICAgIGxldCBvZmYgPSBVSS5BbGlnbm1lbnQucmlnaHQoMTAwLCB3aWRnZXQwKTtcbiAgICAgICAgICAgIGV4cGVjdChvZmYpLnRvLmVxdWFsKDMwMCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJyN0b3AnLCAoKT0+e1xuICAgICAgICBpdCgnc2hvdWxkIHJldHVybiByZWxhdGl2ZSBwb3NpdGlvbiBmb3IgdG9wIGFsaWdubWVudCcsICgpPT57XG4gICAgICAgICAgICBsZXQgb2ZmID0gVUkuQWxpZ25tZW50LnRvcCgxMDAsIHdpZGdldDApO1xuICAgICAgICAgICAgZXhwZWN0KG9mZikudG8uZXF1YWwoNCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJyNtaWRkbGUnLCAoKT0+e1xuICAgICAgICBpdCgnc2hvdWxkIHJldHVybiByZWxhdGl2ZSBwb3NpdGlvbiBmb3IgbWlkZGxlIGFsaWdubWVudCcsICgpPT57XG4gICAgICAgICAgICBsZXQgb2ZmID0gVUkuQWxpZ25tZW50Lm1pZGRsZSgxMDAsIHdpZGdldDApO1xuICAgICAgICAgICAgZXhwZWN0KG9mZikudG8uZXF1YWwoMTUwKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnI2JvdHRvbScsICgpPT57XG4gICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIHJlbGF0aXZlIHBvc2l0aW9uIGZvciBib3R0b20gYWxpZ25tZW50JywgKCk9PntcbiAgICAgICAgICAgIGxldCBvZmYgPSBVSS5BbGlnbm1lbnQuYm90dG9tKDEwMCwgd2lkZ2V0MCk7XG4gICAgICAgICAgICBleHBlY3Qob2ZmKS50by5lcXVhbCgzMDApO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuIiwicmVxdWlyZSgnLi9BbGlnbm1lbnQtc3BlYycpO1xucmVxdWlyZSgnLi9zaXplUG9saWNpZXMnKTtcbnJlcXVpcmUoJy4vbGF5b3V0cycpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5kZXNjcmliZSgnQmFzZUxheW91dCcsICgpPT57XG4gICAgbGV0IHdpZGdldDAgPSBuZXcgVUkuV2lkZ2V0cy5QYW5lbChudWxsLCB7d2lkdGg6IDEwMCwgaGVpZ2h0OiAxMDB9KTtcbiAgICBsZXQgd2lkZ2V0MSA9IG5ldyBVSS5XaWRnZXRzLkJ1dHRvbih3aWRnZXQwLCB7d2lkdGg6IDIwLCBoZWlnaHQ6IDIwfSk7XG4gICAgd2lkZ2V0MS5wb3NpdGlvbi5zZXQoMjAsIDIwKTtcblxuICAgIGRlc2NyaWJlKCcjZXhlYycsICgpPT57XG4gICAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBwb3NpdGlvbiBvZiBpdHMgY2hpbGRyZW4gYW5kIGV4ZWMgdGhlaXIgbGF5b3VycycsXG4gICAgICAgICgpPT57XG4gICAgICAgICAgICAvLyByZWFsIHBvc2l0aW9uIGlzbnQgc2V0IHVudGlsIGxheW91dCBleGVjdXRlc1xuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEudHJhbnNmb3JtLnBvc2l0aW9uLngpLnRvLmVxdWFsKDApO1xuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEudHJhbnNmb3JtLnBvc2l0aW9uLnkpLnRvLmVxdWFsKDApO1xuXG4gICAgICAgICAgICBsZXQgc3B5ID0gc2lub24uc3B5KHdpZGdldDEubGF5b3V0LCAnZXhlYycpO1xuXG4gICAgICAgICAgICB3aWRnZXQwLmxheW91dC5leGVjKCk7XG5cbiAgICAgICAgICAgIGV4cGVjdChzcHkuY2FsbGVkKS50by5iZS50cnVlO1xuXG4gICAgICAgICAgICB3aWRnZXQxLmxheW91dC5leGVjLnJlc3RvcmUoKTtcblxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEudHJhbnNmb3JtLnBvc2l0aW9uLngpLnRvLmVxdWFsKDI0KTtcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLnRyYW5zZm9ybS5wb3NpdGlvbi55KS50by5lcXVhbCgyNCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmRlc2NyaWJlKCdCb3hMYXlvdXQnLCAoKT0+e1xuICAgIGxldCB3MCA9IG5ldyBVSS5XaWRnZXRzLlBhbmVsKG51bGwsIHt3aWR0aDogNDAwLCBoZWlnaHQ6IDQwMH0pO1xuICAgIHcwLmxheW91dCA9IG5ldyBVSS5MYXlvdXRzLkJveExheW91dCh3MCwgVUkuVkVSVElDQUwpO1xuICAgIGxldCB3MSA9IG5ldyBVSS5XaWRnZXRzLkJ1dHRvbih3MCwge3dpZHRoOiAyMCwgaGVpZ2h0OiAyMH0pO1xuICAgIGxldCB3MiA9IG5ldyBVSS5XaWRnZXRzLkJ1dHRvbih3MCwge3dpZHRoOiAyMCwgaGVpZ2h0OiAyMH0pO1xuICAgIGxldCB3MyA9IG5ldyBVSS5XaWRnZXRzLkJ1dHRvbih3MCwge3dpZHRoOiAyMCwgaGVpZ2h0OiAyMH0pO1xuXG4gICAgZGVzY3JpYmUoJyNpbml0VG90YWxDaGlsZHJlblNpemUoKScsICgpPT57XG4gICAgICAgIGl0KCdzaG91bGQgY2FsY3VsYXRlIHRoZSB0b3RhbCBzaXplIG9mIHRoZSBjaGlsZHJlbicsICgpPT57XG4gICAgICAgICAgICBleHBlY3QodzAubGF5b3V0Ll90b3RhbENoaWxkcmVuV2lkdGgpLnRvLmVxdWFsKDApO1xuICAgICAgICAgICAgZXhwZWN0KHcwLmxheW91dC5fdG90YWxDaGlsZHJlbkhlaWdodCkudG8uZXF1YWwoMCk7XG5cbiAgICAgICAgICAgIHcwLmxheW91dC5pbml0VG90YWxDaGlsZHJlblNpemUoKTtcblxuICAgICAgICAgICAgLy8gYWRkIHRvZ2V0aGVyICsgc3BhY2luZ1xuICAgICAgICAgICAgZXhwZWN0KHcwLmxheW91dC5fdG90YWxDaGlsZHJlbldpZHRoKS50by5lcXVhbCg3Mik7XG4gICAgICAgICAgICBleHBlY3QodzAubGF5b3V0Ll90b3RhbENoaWxkcmVuSGVpZ2h0KS50by5lcXVhbCg3Mik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJyNiZWdpbkl0ZXJhdGlvbigpJywgKCk9PntcbiAgICAgICAgaXQoJ3Nob3VsZCBwcmVwYXJlIHZhcmlhYmxlcyBiZWZvcmUgaXRlcmF0aW9uJywgKCk9PntcbiAgICAgICAgICAgIGxldCB3TGF5b3V0ID0gdzAubGF5b3V0O1xuICAgICAgICAgICAgd0xheW91dC5iZWdpbkl0ZXJhdGlvbigpO1xuXG4gICAgICAgICAgICBleHBlY3Qod0xheW91dC5fdG90YWxDaGlsZHJlbkhlaWdodCkudG8uZXF1YWwoMCk7XG4gICAgICAgICAgICBleHBlY3Qod0xheW91dC5fdG90YWxDaGlsZHJlbldpZHRoKS50by5lcXVhbCgwKTtcblxuICAgICAgICAgICAgZXhwZWN0KHdMYXlvdXQucG9zT2Zmc2V0LngpLnRvLmVxdWFsKDApO1xuICAgICAgICAgICAgZXhwZWN0KHdMYXlvdXQucG9zT2Zmc2V0LnkpLnRvLmVxdWFsKDApO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCcjc2V0Q2hpbGRQb3MoKScsICgpPT57XG4gICAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgY2hpbGQnLCAoKT0+e1xuICAgICAgICAgICAgbGV0IHdMYXlvdXQgPSB3MC5sYXlvdXQ7XG4gICAgICAgICAgICB3TGF5b3V0LnNldENoaWxkUG9zKHcxKTtcblxuICAgICAgICAgICAgZXhwZWN0KHdMYXlvdXQuX3RvdGFsQ2hpbGRyZW5XaWR0aCkudG8uZXF1YWwoMjQpO1xuICAgICAgICAgICAgZXhwZWN0KHdMYXlvdXQuX3RvdGFsQ2hpbGRyZW5IZWlnaHQpLnRvLmVxdWFsKDI0KTtcblxuICAgICAgICAgICAgZXhwZWN0KHcxLnRyYW5zZm9ybS5wb3NpdGlvbi54KS50by5lcXVhbCg0KTtcbiAgICAgICAgICAgIGV4cGVjdCh3MS50cmFuc2Zvcm0ucG9zaXRpb24ueSkudG8uZXF1YWwoNCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmRlc2NyaWJlKCdGaXhlZExheW91dCcsICgpPT57XG4gICAgbGV0IHcwID0gbmV3IFVJLldpZGdldHMuUGFuZWwobnVsbCwge3dpZHRoOiA0MDAsIGhlaWdodDogNDAwfSk7XG4gICAgbGV0IHcxID0gbmV3IFVJLldpZGdldHMuQnV0dG9uKHcwKTtcbiAgICB3MS5wb3NpdGlvbi5zZXQoMTIsIDEyKTtcblxuICAgIGRlc2NyaWJlKCcjc2V0Q2hpbGRQb3MoKScsICgpPT57XG4gICAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBjaGlsZHMgcG9zaXRpb24nLCAoKT0+e1xuICAgICAgICAgICAgZXhwZWN0KHcxLnRyYW5zZm9ybS5wb3NpdGlvbi54KS50by5lcXVhbCgwKTtcbiAgICAgICAgICAgIGV4cGVjdCh3MS50cmFuc2Zvcm0ucG9zaXRpb24ueSkudG8uZXF1YWwoMCk7XG5cbiAgICAgICAgICAgIHcwLmxheW91dC5zZXRDaGlsZFBvcyh3MSk7XG5cbiAgICAgICAgICAgIGV4cGVjdCh3MS50cmFuc2Zvcm0ucG9zaXRpb24ueCkudG8uZXF1YWwoMTYpO1xuICAgICAgICAgICAgZXhwZWN0KHcxLnRyYW5zZm9ybS5wb3NpdGlvbi55KS50by5lcXVhbCgxNik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmRlc2NyaWJlKCdIQm94TGF5b3V0JywgKCk9PntcbiAgICBpdCgnc2hvdWxkIGNvbnN0cnVjdCBhIEJveExheW91dCB3aXRoIEhPUklaT05UQUwgb3JpZW50YXRpb24nLCAoKT0+e1xuICAgICAgICBsZXQgdzEgPSBuZXcgVUkuV2lkZ2V0cy5QYW5lbCgpO1xuXG4gICAgICAgIHcxLmxheW91dCA9IG5ldyBVSS5MYXlvdXRzLkhCb3hMYXlvdXQodzEpO1xuICAgICAgICBleHBlY3QodzEubGF5b3V0Lm9yaWVudGF0aW9uKS50by5lcXVhbChVSS5IT1JJWk9OVEFMKTtcbiAgICB9KTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5kZXNjcmliZSgnVkJveExheW91dCcsICgpPT57XG4gICAgaXQoJ3Nob3VsZCBjb25zdHJ1Y3QgYSBCb3hMYXlvdXQgd2l0aCBWRVJUSUNBTCBvcmllbnRhdGlvbicsICgpPT57XG4gICAgICAgIGxldCB3MSA9IG5ldyBVSS5XaWRnZXRzLlBhbmVsKCk7XG5cbiAgICAgICAgdzEubGF5b3V0ID0gbmV3IFVJLkxheW91dHMuVkJveExheW91dCh3MSk7XG4gICAgICAgIGV4cGVjdCh3MS5sYXlvdXQub3JpZW50YXRpb24pLnRvLmVxdWFsKFVJLlZFUlRJQ0FMKTtcbiAgICB9KTtcbn0pO1xuIiwicmVxdWlyZSgnLi9CYXNlTGF5b3V0LXNwZWMnKTtcbnJlcXVpcmUoJy4vQm94TGF5b3V0LXNwZWMnKTtcbnJlcXVpcmUoJy4vRml4ZWRMYXlvdXQtc3BlYycpO1xucmVxdWlyZSgnLi9IQm94TGF5b3V0LXNwZWMnKTtcbnJlcXVpcmUoJy4vVkJveExheW91dC1zcGVjJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmRlc2NyaWJlKCdCYXNlUG9saWN5JywgKCk9PntcbiAgICBsZXQgd2lkZ2V0ID0gbmV3IFVJLldpZGdldHMuQnV0dG9uKCk7XG5cbiAgICBkZXNjcmliZSgnI3NldFdpZGdldFdpZHRoKCknLCAoKT0+e1xuICAgICAgICBpdCgnc2hvdWxkIHNldCBhIHdpZGdldHMgc2l6ZVByb3h5cyB3aWR0aCcsICgpPT57XG4gICAgICAgICAgICB3aWRnZXQuaFBvbGljeS5zZXRXaWRnZXRXaWR0aCh3aWRnZXQsIDEwMCk7XG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0LnNpemVQcm94eS5fd2lkdGgpLnRvLmVxdWFsKDEwMCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJyNzZXRXaWRnZXRIZWlnaHQoKScsICgpPT57XG4gICAgICAgIGl0KCdzaG91bGQgc2V0IGEgd2lkZ2V0cyBzaXplUHJveHlzIGhlaWdodCcsICgpPT57XG4gICAgICAgICAgICB3aWRnZXQuaFBvbGljeS5zZXRXaWRnZXRIZWlnaHQod2lkZ2V0LCAxMDApO1xuICAgICAgICAgICAgZXhwZWN0KHdpZGdldC5zaXplUHJveHkuX2hlaWdodCkudG8uZXF1YWwoMTAwKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnI3ZhbGlkYXRlV2lkdGgoKScsICgpPT57XG4gICAgICAgIGl0KCdzaG91bGQga2VlcCB3aWRnZXRzIHdpZHRoIHdpdGhpbiBtaW4vbWF4JywgKCk9PntcbiAgICAgICAgICAgIHdpZGdldC5taW4ud2lkdGggPSAxMDtcbiAgICAgICAgICAgIHdpZGdldC5tYXgud2lkdGggPSA4MDtcbiAgICAgICAgICAgIHdpZGdldC53aWR0aCA9IDEwMDtcbiAgICAgICAgICAgIHdpZGdldC5oUG9saWN5LnZhbGlkYXRlV2lkdGgoKTtcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQud2lkdGgpLnRvLmVxdWFsKDgwKTtcbiAgICAgICAgICAgIHdpZGdldC53aWR0aCA9IDU7XG4gICAgICAgICAgICB3aWRnZXQuaFBvbGljeS52YWxpZGF0ZVdpZHRoKCk7XG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0LndpZHRoKS50by5lcXVhbCgxMCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJyN2YWxpZGF0ZUhlaWdodCgpJywgKCk9PntcbiAgICAgICAgaXQoJ3Nob3VsZCBrZWVwIHdpZGdldHMgaGVpZ2h0IHdpdGhpbiBtaW4vbWF4JywgKCk9PntcbiAgICAgICAgICAgIHdpZGdldC5taW4uaGVpZ2h0ID0gMTA7XG4gICAgICAgICAgICB3aWRnZXQubWF4LmhlaWdodCA9IDgwO1xuICAgICAgICAgICAgd2lkZ2V0LmhlaWdodCA9IDEwMDtcbiAgICAgICAgICAgIHdpZGdldC5oUG9saWN5LnZhbGlkYXRlSGVpZ2h0KCk7XG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0LmhlaWdodCkudG8uZXF1YWwoODApO1xuICAgICAgICAgICAgd2lkZ2V0LmhlaWdodCA9IDU7XG4gICAgICAgICAgICB3aWRnZXQuaFBvbGljeS52YWxpZGF0ZUhlaWdodCgpO1xuICAgICAgICAgICAgZXhwZWN0KHdpZGdldC5oZWlnaHQpLnRvLmVxdWFsKDEwKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnI2NoaWxkUG9saWN5RmluaXNoZWQoKScsICgpPT57XG4gICAgICAgIGl0KCdzaG91bGQgYWRkIGVhY2ggY2hpbGRzIHNpemUgdG8gdG90YWxDaGlsZHJlbkZpbmlzaGVkU2l6ZSBhbmQnXG4gICAgICAgICAgICArICcgc3Vic3RyYWN0IDEgZnJvbSB0b3RhbENoaWxkcmVuRmluaXNoZWQnLCAoKT0+e1xuICAgICAgICAgICAgICAgIHdpZGdldC5oUG9saWN5LnRvdGFsQ2hpbGRyZW5GaW5pc2hlZCA9IDE7XG4gICAgICAgICAgICAgICAgd2lkZ2V0LmhQb2xpY3kudG90YWxDaGlsZHJlbkZpbmlzaGVkU2l6ZSA9IDEwMDtcbiAgICAgICAgICAgICAgICB3aWRnZXQuaFBvbGljeS5jaGlsZFBvbGljeUZpbmlzaGVkKDQwMCk7XG5cbiAgICAgICAgICAgICAgICBleHBlY3Qod2lkZ2V0LmhQb2xpY3kudG90YWxDaGlsZHJlbkZpbmlzaGVkKS50by5lcXVhbCgwKTtcbiAgICAgICAgICAgICAgICBleHBlY3Qod2lkZ2V0LmhQb2xpY3kudG90YWxDaGlsZHJlbkZpbmlzaGVkU2l6ZSkudG8uZXF1YWwoNTAwKTtcblxuICAgICAgICAgICAgICAgIC8vIHRlc3QgaWYgc3BhY2luZyBpcyBpbmNsdWRlZFxuICAgICAgICAgICAgICAgIC8vIHdpZGdldC5sYXlvdXQgPSBuZXcgVUkuTGF5b3V0cy5IQm94TGF5b3V0KHdpZGdldCk7XG4gICAgICAgICAgICAgICAgLy8gd2lkZ2V0LmhQb2xpY3kudG90YWxDaGlsZHJlbkZpbmlzaGVkU2l6ZSA9IDEwMDtcbiAgICAgICAgICAgICAgICAvLyB3aWRnZXQuaFBvbGljeS5jaGlsZFBvbGljeUZpbmlzaGVkKDQwMCk7XG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAvLyBleHBlY3Qod2lkZ2V0LmhQb2xpY3kudG90YWxDaGlsZHJlbkZpbmlzaGVkU2l6ZSkudG8uZXF1YWwoNTA0KTtcbiAgICAgICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJyNleGVjKCknLCAoKT0+e1xuICAgICAgICBsZXQgd2lkZ2V0MiA9IG5ldyBVSS5XaWRnZXRzLkJ1dHRvbih3aWRnZXQpO1xuXG4gICAgICAgIGl0KCdzaG91bGQgYWRkIGEgb25lIHRpbWUgZXZlbnQnXG4gICAgICAgICsgJyggcmVnaXN0ZXIgc2l6ZSB3aXRoIGNoaWxkUG9saWN5RmluaXNoZWQgKSBhbmQgZXhlYyB0aGUgJ1xuICAgICAgICArICdIT1JJWk9OVEFMIHNpemUgcG9saWN5IGZvciBlYWNoIGNoaWxkICdcbiAgICAgICAgKyAndGhhdCBpcyBIT1JJWk9OVEFMIGFuZCBhbiBpbnN0YW5jZW9mIFVJLldpZGdldHMuQmFzZVdpZGdldCcsICgpPT57XG4gICAgICAgICAgICBsZXQgc3B5ID0gc2lub24uc3B5KHdpZGdldDIuaFBvbGljeSwgJ2V4ZWMnKTtcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLmhQb2xpY3kubGlzdGVuZXJzKCdmaW5pc2hlZCcsIHRydWUpKS50by5iZS5mYWxzZTtcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyKS50by5iZS5hbi5pbnN0YW5jZW9mKFVJLldpZGdldHMuQmFzZVdpZGdldCk7XG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0LmhQb2xpY3kub3JpZW50YXRpb24pLnRvLmVxdWFsKFVJLkhPUklaT05UQUwpO1xuICAgICAgICAgICAgd2lkZ2V0LmhQb2xpY3kuZXhlYygpO1xuICAgICAgICAgICAgLy8gYmVsb3cgd29udCB3b3JrIGJlY2F1c2UgdGhlIG9uZSB0aW1lIGxpc3RlbmVyIGV4ZWN1dGVzIGJlZm9yZVxuICAgICAgICAgICAgLy8gdGhlIGFib3ZlIG1ldGhvZCBpcyBmaW5pc2hlZC5cbiAgICAgICAgICAgIC8vIGV4cGVjdCh3aWRnZXQyLmhQb2xpY3kubGlzdGVuZXJzKCdmaW5pc2hlZCcsIHRydWUpKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHNweS5jYWxsZWQpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICB3aWRnZXQyLmhQb2xpY3kuZXhlYy5yZXN0b3JlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgYWRkIGEgb25lIHRpbWUgZXZlbnQnXG4gICAgICAgICsgJyggcmVnaXN0ZXIgc2l6ZSB3aXRoIGNoaWxkUG9saWN5RmluaXNoZWQgKSBhbmQgZXhlYyB0aGUgJ1xuICAgICAgICArICdWRVJUSUNBTCBzaXplIHBvbGljeSBmb3IgZWFjaCBjaGlsZCAnXG4gICAgICAgICsgJ3RoYXQgaXMgVkVSVElDQUwgYW5kIGFuIGluc3RhbmNlb2YgVUkuV2lkZ2V0cy5CYXNlV2lkZ2V0JywgKCk9PntcbiAgICAgICAgICAgIGxldCBzcHkgPSBzaW5vbi5zcHkod2lkZ2V0Mi52UG9saWN5LCAnZXhlYycpO1xuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIudlBvbGljeS5saXN0ZW5lcnMoJ2ZpbmlzaGVkJywgdHJ1ZSkpLnRvLmJlLmZhbHNlO1xuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIpLnRvLmJlLmFuLmluc3RhbmNlb2YoVUkuV2lkZ2V0cy5CYXNlV2lkZ2V0KTtcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQudlBvbGljeS5vcmllbnRhdGlvbikudG8uZXF1YWwoVUkuVkVSVElDQUwpO1xuICAgICAgICAgICAgd2lkZ2V0LnZQb2xpY3kuZXhlYygpO1xuICAgICAgICAgICAgLy8gYmVsb3cgd29udCB3b3JrIGJlY2F1c2UgdGhlIG9uZSB0aW1lIGxpc3RlbmVyIGV4ZWN1dGVzIGJlZm9yZVxuICAgICAgICAgICAgLy8gdGhlIGFib3ZlIG1ldGhvZCBpcyBmaW5pc2hlZC5cbiAgICAgICAgICAgIC8vIGV4cGVjdCh3aWRnZXQyLmhQb2xpY3kubGlzdGVuZXJzKCdmaW5pc2hlZCcsIHRydWUpKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHNweS5jYWxsZWQpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICB3aWRnZXQyLnZQb2xpY3kuZXhlYy5yZXN0b3JlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGl0KCdzaG91bGQgY2FsbCBzaXplV2lkZ2V0SG9yaXpvbnRhbCgpIGlmIHRoZSB3aWRnZXQgaXMgSE9SSVpPTlRBTCcsXG4gICAgICAgICgpPT57XG4gICAgICAgICAgICBsZXQgc3B5ID0gc2lub24uc3B5KHdpZGdldC5oUG9saWN5LCAnc2l6ZVdpZGdldEhvcml6b250YWwnKTtcbiAgICAgICAgICAgIHdpZGdldC5oUG9saWN5LmV4ZWMoKTtcbiAgICAgICAgICAgIGV4cGVjdChzcHkuY2FsbGVkKS50by5iZS50cnVlO1xuICAgICAgICAgICAgd2lkZ2V0LmhQb2xpY3kuc2l6ZVdpZGdldEhvcml6b250YWwucmVzdG9yZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIGNhbGwgc2l6ZVdpZGdldFZlcnRpY2FsKCkgaWYgdGhlIHdpZGdldCBpcyBWRVJUSUNBTCcsXG4gICAgICAgICgpPT57XG4gICAgICAgICAgICBsZXQgc3B5ID0gc2lub24uc3B5KHdpZGdldC52UG9saWN5LCAnc2l6ZVdpZGdldFZlcnRpY2FsJyk7XG4gICAgICAgICAgICB3aWRnZXQudlBvbGljeS5leGVjKCk7XG4gICAgICAgICAgICBleHBlY3Qoc3B5LmNhbGxlZCkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgIHdpZGdldC52UG9saWN5LnNpemVXaWRnZXRWZXJ0aWNhbC5yZXN0b3JlKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmRlc2NyaWJlKCdFeHBhbmRpbmdQb2xpY3knLCAoKT0+e1xuICAgIGxldCB3aWRnZXQwID0gbmV3IFVJLldpZGdldHMuQnV0dG9uKCk7XG4gICAgd2lkZ2V0MC53aWR0aCA9IDIwMDsgd2lkZ2V0MC5oZWlnaHQgPSAyMDA7XG4gICAgbGV0IHdpZGdldDEgPSBuZXcgVUkuV2lkZ2V0cy5CdXR0b24od2lkZ2V0MCk7XG4gICAgd2lkZ2V0MS5oUG9saWN5ID0gbmV3IFVJLlNpemVQb2xpY2llcy5FeHBhbmRpbmdQb2xpY3kod2lkZ2V0MSk7XG4gICAgd2lkZ2V0MS52UG9saWN5ID0gbmV3IFVJLlNpemVQb2xpY2llcy5FeHBhbmRpbmdQb2xpY3kod2lkZ2V0MSk7XG4gICAgd2lkZ2V0MS53aWR0aCA9IDEwMDsgd2lkZ2V0MS5oZWlnaHQgPSAxMDA7XG4gICAgLy8gZGVzY3JpYmUoJ3NpemVXaWRnZXRIb3Jpem9udGFsJywgKCk9PntcbiAgICAvLyAgICAgaXQoJ3Nob3VsZCBhZGQgKHRoaXMucGFyZW50UmVhZHlIKSBsaXN0ZW5lcidcbiAgICAvLyAgICAgICAgICsgJyB0byBpdHMgcGFyZW50IGlmIG9uZSBleGlzdCcsICgpPT57XG4gICAgLy8gICAgICAgICBleHBlY3Qod2lkZ2V0MC5oUG9saWN5Lmxpc3RlbmVycygnZmluaXNoZWQnLCB0cnVlKSkudG8uYmUuZmFsc2U7XG4gICAgLy8gICAgICAgICB3aWRnZXQxLmhQb2xpY3kuc2l6ZVdpZGdldEhvcml6b250YWwoKTtcbiAgICAvLyAgICAgICAgIGV4cGVjdCh3aWRnZXQwLmhQb2xpY3kubGlzdGVuZXJzKCdmaW5pc2hlZCcsIHRydWUpKS50by5iZS50cnVlO1xuICAgIC8vICAgICB9KTtcblxuICAgIGRlc2NyaWJlKCcjcGFyZW50UmVhZHlIJywgKCk9PntcbiAgICAgICAgaXQoJ3Nob3VsZCBzaXplIHRoZSB3aWRnZXQgdG8gbWF0Y2ggaXRzIHBhcmVudHMgd2lkdGggLSBwYWRkaW5nJywgKCk9PntcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLndpZHRoKS50by5lcXVhbCgxMDApO1xuICAgICAgICAgICAgd2lkZ2V0MS5oUG9saWN5LnBhcmVudFJlYWR5SCgpO1xuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEud2lkdGgpLnRvLmVxdWFsKDE5Mik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJyNwYXJlbnRSZWFkeVYnLCAoKT0+e1xuICAgICAgICBpdCgnc2hvdWxkIHNpemUgdGhlIHdpZGdldCB0byBtYXRjaCBpdHMgcGFyZW50cyBoZWlnaHQgLSBwYWRkaW5nJywgKCk9PntcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLmhlaWdodCkudG8uZXF1YWwoMTAwKTtcbiAgICAgICAgICAgIHdpZGdldDEudlBvbGljeS5wYXJlbnRSZWFkeVYoKTtcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLmhlaWdodCkudG8uZXF1YWwoMTkyKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZGVzY3JpYmUoJ0ZpeGVkUG9saWN5JywgKCk9PntcbiAgICBsZXQgd2lkZ2V0ID0gbmV3IFVJLldpZGdldHMuQnV0dG9uKCk7XG5cbiAgICBkZXNjcmliZSgnI3NpemVXaWRnZXRIb3Jpem9udGFsJywgKCk9PntcbiAgICAgICAgaXQoJ3Nob3VsZCB2YWxpZGF0ZSB0aGUgd2lkdGggb2YgdGhlIHdpZGdldCcsICgpPT57XG4gICAgICAgICAgICBsZXQgc3B5ID0gc2lub24uc3B5KHdpZGdldC5oUG9saWN5LCAndmFsaWRhdGVXaWR0aCcpO1xuICAgICAgICAgICAgd2lkZ2V0LmhQb2xpY3kuc2l6ZVdpZGdldEhvcml6b250YWwoKTtcbiAgICAgICAgICAgIGV4cGVjdChzcHkuY2FsbGVkKS50by5iZS50cnVlO1xuICAgICAgICAgICAgd2lkZ2V0LmhQb2xpY3kudmFsaWRhdGVXaWR0aC5yZXN0b3JlKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJyNzaXplV2lkZ2V0VmVydGljYWwnLCAoKT0+e1xuICAgICAgICBpdCgnc2hvdWxkIHZhbGlkYXRlIHRoZSBoZWlnaHQgb2YgdGhlIHdpZGdldCcsICgpPT57XG4gICAgICAgICAgICBsZXQgc3B5ID0gc2lub24uc3B5KHdpZGdldC52UG9saWN5LCAndmFsaWRhdGVIZWlnaHQnKTtcbiAgICAgICAgICAgIHdpZGdldC52UG9saWN5LnNpemVXaWRnZXRWZXJ0aWNhbCgpO1xuICAgICAgICAgICAgZXhwZWN0KHNweS5jYWxsZWQpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICB3aWRnZXQudlBvbGljeS52YWxpZGF0ZUhlaWdodC5yZXN0b3JlKCk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmRlc2NyaWJlKCdTaGFyZWRFeHBhbmRpbmdQb2xpY3knLCAoKT0+e1xuICAgIGxldCB3aWRnZXQwID0gbmV3IFVJLldpZGdldHMuUGFuZWwobnVsbCwge3dpZHRoOiA0MDAsIGhlaWdodDogNDAwfSk7XG4gICAgd2lkZ2V0MC5sYXlvdXQgPSBuZXcgVUkuTGF5b3V0cy5IQm94TGF5b3V0KHdpZGdldDApO1xuXG4gICAgbGV0IHdpZGdldDEgPSBuZXcgVUkuV2lkZ2V0cy5CdXR0b24od2lkZ2V0MCk7XG4gICAgd2lkZ2V0MS5oUG9saWN5ID0gbmV3IFVJLlNpemVQb2xpY2llcy5TaGFyZWRFeHBhbmRpbmdQb2xpY3kod2lkZ2V0MSk7XG4gICAgd2lkZ2V0MS52UG9saWN5XG4gICAgPSBuZXcgVUkuU2l6ZVBvbGljaWVzLlNoYXJlZEV4cGFuZGluZ1BvbGljeSh3aWRnZXQxLCBVSS5WRVJUSUNBTCk7XG5cbiAgICBsZXQgd2lkZ2V0MiA9IG5ldyBVSS5XaWRnZXRzLkJ1dHRvbih3aWRnZXQwKTtcbiAgICB3aWRnZXQyLmhQb2xpY3kgPSBuZXcgVUkuU2l6ZVBvbGljaWVzLlNoYXJlZEV4cGFuZGluZ1BvbGljeSh3aWRnZXQyKTtcbiAgICB3aWRnZXQyLnZQb2xpY3lcbiAgICA9IG5ldyBVSS5TaXplUG9saWNpZXMuU2hhcmVkRXhwYW5kaW5nUG9saWN5KHdpZGdldDIsIFVJLlZFUlRJQ0FMKTtcblxuICAgIGRlc2NyaWJlKCcjcGFyZW50UmVhZHlIJywgKCk9PntcbiAgICAgICAgaXQoJ3Nob3VsZCBzaXplIHRoZSB3aWRnZXRzIGVxdWFsIHNpemUgaWYgYWxsIGhhdmUgc2hhcmVkIHBvbGljeScsICgpPT57XG4gICAgICAgICAgICB3aWRnZXQwLmhQb2xpY3kuZXhlYygpO1xuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEud2lkdGgpLnRvLmVxdWFsKDE5NCk7XG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0Mi53aWR0aCkudG8uZXF1YWwoMTk0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBoYW5kbGUgd2lkZ2V0cyB0aGF0IGFyZW50IG9mIHNoYXJlZCBwb2xpY3knLCAoKT0+e1xuICAgICAgICAgICAgbGV0IG51bGx3aWRnZXQgPSBuZXcgVUkuV2lkZ2V0cy5QYW5lbCgpO1xuICAgICAgICAgICAgbGV0IHdpZGdldDNcbiAgICAgICAgICAgID0gbmV3IFVJLldpZGdldHMuQnV0dG9uKHdpZGdldDAsIHt3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMH0pO1xuICAgICAgICAgICAgd2lkZ2V0My5oUG9saWN5ID0gbmV3IFVJLlNpemVQb2xpY2llcy5GaXhlZFBvbGljeSh3aWRnZXQzKTtcbiAgICAgICAgICAgIHdpZGdldDAuaFBvbGljeS5leGVjKCk7XG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS53aWR0aCkudG8uZXF1YWwoMTQyKTtcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLndpZHRoKS50by5lcXVhbCgxNDIpO1xuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDMud2lkdGgpLnRvLmVxdWFsKDEwMCk7XG4gICAgICAgICAgICBudWxsd2lkZ2V0LmFkZENoaWxkKHdpZGdldDMpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCcjcGFyZW50UmVhZHlWJywgKCk9PntcbiAgICAgICAgaXQoJ3Nob3VsZCBzaXplIHRoZSB3aWRnZXRzIGVxdWFsIHNpemUgaWYgYWxsIGhhdmUgc2hhcmVkIHBvbGljeScsICgpPT57XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIHNhbWUgYXMgYWJvdmUgdGVzdC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIGhhbmRsZSB3aWRnZXRzIHRoYXQgYXJlbnQgb2Ygc2hhcmVkIHBvbGljeScsICgpPT57XG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICAgIHNhbWUgYXMgYWJvdmUgdGVzdC5cbiAgICAgICAgICAgICAqL1xuICAgICAgICB9KTtcbiAgICB9KTtcbn0pO1xuIiwicmVxdWlyZSgnLi9CYXNlUG9saWN5LXNwZWMnKTtcbnJlcXVpcmUoJy4vRXhwYW5kaW5nUG9saWN5LXNwZWMnKTtcbnJlcXVpcmUoJy4vRml4ZWRQb2xpY3ktc3BlYycpO1xucmVxdWlyZSgnLi9TaGFyZWRFeHBhbmRpbmdQb2xpY3ktc3BlYycpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5kZXNjcmliZSgnc2V0T3B0aW9ucygpJywgKCk9PntcbiAgICBpdCgnc2hvdWxkIGNvbXBhcmUgdXNlciBzZXQgb3B0aW9ucyBvYmplY3Qgd2l0aCdcbiAgICAgICAgKyAnIGRlZmF1bHQgb3B0aW9ucyBhbmQgY29tYmluZSB0aGUgdmFsdWVzJywgKCk9PntcbiAgICAgICAgICAgIGxldCBkZWZhdWx0cyA9IHtcbiAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2JsYWNraGF3aycsXG4gICAgICAgICAgICAgICAgICAgIGFnZTogMjgsXG4gICAgICAgICAgICAgICAgICAgIGRlc2M6ICdjcmF6eScsXG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBsZXQgdXNlciA9IHtcbiAgICAgICAgICAgICAgICAgICAgYWdlOiA1MCxcbiAgICAgICAgICAgICAgICAgICAgZGVzYzogJ2xhenknLFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdXNlciA9IFVJLnNldE9wdGlvbnModXNlciwgZGVmYXVsdHMpO1xuXG4gICAgICAgICAgICBleHBlY3QodXNlci5uYW1lKS50by5lcXVhbCgnYmxhY2toYXdrJyk7XG4gICAgICAgICAgICBleHBlY3QodXNlci5hZ2UpLnRvLmVxdWFsKDUwKTtcbiAgICAgICAgICAgIGV4cGVjdCh1c2VyLmRlc2MpLnRvLmVxdWFsKCdsYXp5Jyk7XG4gICAgICAgIH0pO1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8qXG5UT0RPOlxudGVzdCB0aGluZ3MgdGhhdCBzaG91bGQgaGFwcGVuIHdoZW4gZXZlbnRzIGFyZSBmaXJlZC5cbmVnLiB3aGVuIHBhZGRpbmcgY2hhbmdlcyBfdXBkYXRlQ2xpcEdyYXBoaWMgc2hvdWxkIGJlIGNhbGxlZC5cbiAqL1xuXG5kZXNjcmliZSgnQmFzZVdpZGdldCcsICgpPT57XG4gICAgbGV0IHdpZGdldDAgPSBuZXcgVUkuV2lkZ2V0cy5CYXNlV2lkZ2V0KCk7XG4gICAgbGV0IHdpZGdldDEgPSBuZXcgVUkuV2lkZ2V0cy5CYXNlV2lkZ2V0KHdpZGdldDApO1xuICAgIGxldCB3aWRnZXQyID0gbmV3IFVJLldpZGdldHMuQmFzZVdpZGdldCh3aWRnZXQxKTtcblxuICAgIGJlZm9yZUVhY2goKCk9PntcbiAgICAgICAgd2lkZ2V0MS5sYXlvdXRcbiAgICAgICAgICAgID0gbmV3IFVJLkxheW91dHMuRml4ZWRMYXlvdXQod2lkZ2V0MSk7XG4gICAgICAgIHdpZGdldDIuaFBvbGljeVxuICAgICAgICAgICAgPSBuZXcgVUkuTGF5b3V0cy5GaXhlZExheW91dCh3aWRnZXQyKTtcbiAgICAgICAgd2lkZ2V0MC5oUG9saWN5XG4gICAgICAgICAgICA9IG5ldyBVSS5MYXlvdXRzLkZpeGVkTGF5b3V0KHdpZGdldDApO1xuICAgICAgICB3aWRnZXQxLnZhbGlkYXRlKCk7XG4gICAgICAgIHdpZGdldDAudmFsaWRhdGUoKTtcbiAgICAgICAgd2lkZ2V0Mi52YWxpZGF0ZSgpO1xuICAgIH0pO1xuXG4gICAgaXQoJ3Nob3VsZCBwYXJlbnQgb25lIHdpZGdldCB0byBhbm90aGVyJywgKCk9PntcbiAgICAgICAgZXhwZWN0KHdpZGdldDIucGFyZW50KS50by5lcXVhbCh3aWRnZXQxKTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCcjcm91dGVJbnZhbGlkYXRpb24oKScsICgpPT57XG4gICAgICAgIGl0KCdzaG91bGQgaW52YWxpZGF0ZSB0aGUgaGlnaGVzdCBwYXJlbnQnLCAoKT0+e1xuICAgICAgICAgICAgd2lkZ2V0MS5sYXlvdXRcbiAgICAgICAgICAgICAgICA9IG5ldyBVSS5MYXlvdXRzLkhCb3hMYXlvdXQod2lkZ2V0MSk7XG4gICAgICAgICAgICB3aWRnZXQyLmhQb2xpY3lcbiAgICAgICAgICAgICAgICA9IG5ldyBVSS5MYXlvdXRzLkhCb3hMYXlvdXQod2lkZ2V0Mik7XG4gICAgICAgICAgICAgICAgd2lkZ2V0Mi5yb3V0ZUludmFsaWRhdGlvbigpO1xuICAgICAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQwLnZhbGlkKS50by5iZS5mYWxzZTtcbiAgICAgICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS52YWxpZCkudG8uYmUudHJ1ZTtcbiAgICAgICAgICAgICAgICBleHBlY3Qod2lkZ2V0Mi52YWxpZCkudG8uYmUudHJ1ZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBpbnZhbGlkYXRlIHRoZSBmaXJzdCBwYXJlbnQgd2l0aCBhIGZpeGVkIHNpemUgcG9saWN5JywgKCk9PntcbiAgICAgICAgICAgIHdpZGdldDIucm91dGVJbnZhbGlkYXRpb24oKTtcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQwLnZhbGlkKS50by5iZS50cnVlO1xuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEudmFsaWQpLnRvLmJlLmZhbHNlO1xuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIudmFsaWQpLnRvLmJlLnRydWU7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJyNyZWN1cnNpdmVSb3V0ZVVwZGF0ZSgpJywgKCk9PntcbiAgICAgICAgaXQoJ3Nob3VsZCByb3V0ZSB1cGRhdGUgdG8gaXRzZWxmIGlmIG5vIHBhcmVudCBleGlzdCcsICgpPT57XG4gICAgICAgICAgICBsZXQgdXBkYXRlU3B5ID0gc2lub24uc3B5KHdpZGdldDAsICd1cGRhdGUnKTtcbiAgICAgICAgICAgIHdpZGdldDAucmVjdXJzaXZlUm91dGVVcGRhdGUoKTtcbiAgICAgICAgICAgIGV4cGVjdCh1cGRhdGVTcHkuY2FsbGVkKS50by5iZS50cnVlO1xuICAgICAgICAgICAgd2lkZ2V0MC51cGRhdGUucmVzdG9yZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIHJlY3Vyc2l2bGV5IHJ1biB0aGlzIGZ1bmN0aW9uIGlmIHRoZSBwYXJlbnQgaXMgdmFsaWQnLCAoKT0+e1xuICAgICAgICAgICAgd2lkZ2V0MS5pbnZhbGlkYXRlKCk7XG4gICAgICAgICAgICBsZXQgc3B5ID0gc2lub24uc3B5KHdpZGdldDEsICdyZWN1cnNpdmVSb3V0ZVVwZGF0ZScpO1xuICAgICAgICAgICAgd2lkZ2V0Mi5yZWN1cnNpdmVSb3V0ZVVwZGF0ZSgpO1xuICAgICAgICAgICAgZXhwZWN0KHNweS5jYWxsZWQpLnRvLmJlLnRydWU7XG4gICAgICAgICAgICB3aWRnZXQxLnJlY3Vyc2l2ZVJvdXRlVXBkYXRlLnJlc3RvcmUoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCByb3V0ZSB1cGRhdGUgdG8gaXRzZWxmIGlmIHBhcmVudCBpcyB2YWxpZCcsICgpPT57XG4gICAgICAgICAgICBsZXQgdXBkYXRlU3B5ID0gc2lub24uc3B5KHdpZGdldDAsICd1cGRhdGUnKTtcbiAgICAgICAgICAgIHdpZGdldDAucmVjdXJzaXZlUm91dGVVcGRhdGUoKTtcbiAgICAgICAgICAgIGV4cGVjdCh1cGRhdGVTcHkuY2FsbGVkKS50by5iZS50cnVlO1xuICAgICAgICAgICAgd2lkZ2V0MC51cGRhdGUucmVzdG9yZSgpO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCcjYWRkQ2hpbGQnLCAoKT0+e1xuICAgICAgICBpdCgnc2hvdWxkIGFkZCBpdHMgY2xpcEdyYXBoaWMgdG8gZWFjaCBQSVhJLkNvbnRhaW5lciAnXG4gICAgICAgICAgICArICdjaGlsZCBhZGRlZCcsICgpPT57XG4gICAgICAgICAgICAgICAgbGV0IHBjID0gbmV3IFBJWEkuQ29udGFpbmVyKCk7XG4gICAgICAgICAgICAgICAgd2lkZ2V0Mi5hZGRDaGlsZChwYyk7XG4gICAgICAgICAgICAgICAgZXhwZWN0KHBjLm1hc2spLnRvLmVxdWFsKHdpZGdldDIuY2xpcEdyYXBoaWMpO1xuICAgICAgICB9KTtcblxuICAgICAgICBpdCgnc2hvdWxkIGFkZCBpdHMgdGhlbWUgdG8gZWFjaCBCYXNlV2lkZ2V0IGNoaWxkIGFkZGVkJywgKCk9PntcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLnRoZW1lKS50by5lcXVhbCh3aWRnZXQxLnRoZW1lKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBhZGQgaXRzIGNsaXBHcmFwaGljIHRvIGVhY2ggQmFzZVdpZGdldCBjaGlsZCBhZGRlZHMnXG4gICAgICAgICAgICArICcgc2l6ZSBwcm94eScsICgpPT57XG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0Mi5zaXplUHJveHkubWFzaykudG8uZXF1YWwod2lkZ2V0MS5jbGlwR3JhcGhpYyk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJyN0aGVtZScsICgpPT57XG4gICAgICAgIGxldCBhVGhtID0gbmV3IFVJLlRoZW1lKCk7XG4gICAgICAgIGl0KCdzaG91bGQgYXBwbHkgdGhlIHNldCB0aGVtZSB0byBjaGlsZHJlbiByZWN1cnNpdmVseScsICgpPT57XG4gICAgICAgICAgICB3aWRnZXQwLnRoZW1lID0gYVRobTtcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLnRoZW1lKS50by5lcXVhbCh3aWRnZXQwLnRoZW1lKTtcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLnRoZW1lKS50by5lcXVhbCh3aWRnZXQxLnRoZW1lKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gQnV0dG9uIGlzIGJhc2ljYWxseSBqdXN0IGFuIGludGVyYWN0aXZlIHBhbmVsLlxuLy8gTm90IG11Y2ggdG8gdGVzdCB5ZXRcblxuZGVzY3JpYmUoJ0J1dHRvbicsICgpPT57XG5cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5kZXNjcmliZSgnTGFiZWwnLCAoKT0+e1xuXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZGVzY3JpYmUoJ1BhbmVsJywgKCk9PntcbiAgICAvLyBub3QgbXVjaCB0byB0ZXN0IHlldFxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmRlc2NyaWJlKCdTSVRyYW5zZm9ybScsICgpPT57XG4gICAgaXQoJ3Nob3VsZCBhbGxvdyBhIHdpZGdldCB0byB0cmFuc2Zvcm0gaXRzIGRpbWVuc2lvbnMnXG4gICAgICAgICsgJyBpbmRlcGVuZGVudCBmcm9tIGl0cyBwYXJlbnQnLCAoKT0+e1xuICAgICAgICAgICAgbGV0IHdpZGdldDAgPSBuZXcgVUkuV2lkZ2V0cy5QYW5lbCgpO1xuICAgICAgICAgICAgd2lkZ2V0MC53aWR0aCA9IDEwMDA7XG4gICAgICAgICAgICBsZXQgd2lkZ2V0MSA9IG5ldyBVSS5XaWRnZXRzLlBhbmVsKCk7XG4gICAgICAgICAgICB3aWRnZXQxLndpZHRoID0gMjAwO1xuICAgICAgICAgICAgd2lkZ2V0MC5hZGRDaGlsZCh3aWRnZXQxKTtcbiAgICAgICAgICAgIHdpZGdldDAud2lkdGggPSA1MDA7XG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS53aWR0aCkudG8uZXF1YWwoMjAwKTtcbiAgICAgICAgfSk7XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZGVzY3JpYmUoJ1NsaWRlcicsICgpPT57XG5cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5kZXNjcmliZSgnU3RhZ2VXaWRnZXQnLCAoKT0+e1xuXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuZGVzY3JpYmUoJ1RleHRCdXR0b24nLCAoKT0+e1xuICAgIGRlc2NyaWJlKCcjVGV4dCcsICgpPT57XG4gICAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSB0ZXh0IGZvciB0aGUgY29udGFpbmVkIGxhYmVsJywgKCk9PntcbiAgICAgICAgICAgIGxldCB0YiA9IG5ldyBVSS5XaWRnZXRzLlRleHRCdXR0b24oKTtcbiAgICAgICAgICAgIHRiLnRleHQgPSAnbWVvdyc7XG4gICAgICAgICAgICBleHBlY3QodGIubGFiZWwudGV4dCkudG8uZXF1YWwoJ21lb3cnKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcbiIsInJlcXVpcmUoJy4vQmFzZVdpZGdldC1zcGVjJyk7XG5yZXF1aXJlKCcuL0J1dHRvbi1zcGVjJyk7XG5yZXF1aXJlKCcuL0xhYmVsLXNwZWMnKTtcbnJlcXVpcmUoJy4vUGFuZWwtc3BlYycpO1xucmVxdWlyZSgnLi9TSVRyYW5zZm9ybS1zcGVjJyk7XG5yZXF1aXJlKCcuL1N0YWdlV2lkZ2V0LXNwZWMnKTtcbnJlcXVpcmUoJy4vVGV4dEJ1dHRvbi1zcGVjJyk7XG5yZXF1aXJlKCcuL1NsaWRlci1zcGVjJyk7XG4iXX0=
