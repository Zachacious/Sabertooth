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
    if (isArrayBufferView(obj) || 'length' in obj) {
      if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
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
  if (isArrayBufferView(string) || string instanceof ArrayBuffer) {
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
  if (numberIsNaN(byteOffset)) {
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
    if (numberIsNaN(parsed)) return i
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
  str = str.trim().replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
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

// Node 0.10 supports `ArrayBuffer` but lacks `ArrayBuffer.isView`
function isArrayBufferView (obj) {
  return (typeof ArrayBuffer.isView === 'function') && ArrayBuffer.isView(obj)
}

function numberIsNaN (obj) {
  return obj !== obj // eslint-disable-line no-self-compare
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
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

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

describe('ST', function () {
    it('should exist as a global object', function () {
        expect(ST).to.be.an('object');
    });
    require('./spec');
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\index.js","/test")

},{"./spec":13,"_process":4,"buffer":2}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('App', function () {
    var app = new ST.App();

    it('should create a pixi canvas on the page', function () {
        expect(document.body.contains(app.renderer.view)).to.be.true;
    });

    it('should have a valid theme', function () {
        expect(app.theme).to.be.an.instanceof(ST.Theme);
    });

    it('should have a valid root widget', function () {
        expect(app.root).to.be.an.instanceof(ST.Widgets.BaseWidget);
    });

    it('should resize the root widget to match the window', function () {
        window.resizeBy(300, 200);
        expect(app.root.width).to.equal(window.innerWidth);
        expect(app.root.height).to.equal(window.innerHeight);
    });

    describe('#name', function () {
        it('should change the page title', function () {
            app.name = 'SaberTooth Test';
            expect(document.title).to.equal('SaberTooth Test');
        });
    });

    describe('#autoResize', function () {
        it('should add a listener to resize event if set to true and ' + 'one doesnt already exist', function () {
            app.autoResize = true;
            var listeners = app.listeners('resize');
            expect(listeners.indexOf(app.resizeToWindow)).to.not.equal(-1);
        });

        it('should not add more than one listener', function () {
            app.autoResize = true;
            var listeners = app.listeners('resize');
            expect(listeners.length).to.equal(1);
        });

        it('should remove the listener from resize if set to false', function () {
            app.autoResize = false;
            var listeners = app.listeners('resize');
            expect(listeners.indexOf(app.resizeToWindow)).to.equal(-1);
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
            var rectGraphic = ST.GraphicsGen.rectangleGraphic(80, 100, 0x000000);

            expect(rectGraphic).to.be.an.instanceof(PIXI.Graphics);
            expect(rectGraphic.width).to.equal(80);
            expect(rectGraphic.height).to.equal(100);
        });
    });

    describe('#rectangleTexture()', function () {
        it('should return a PIXI.Texture with a' + ' width of 100 and a height of 80', function () {
            var rectTex = ST.GraphicsGen.rectangleTexture(100, 80, 0x000000);

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
    var pad = new ST.Padding();
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
    var p = new ST.Point();
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

describe('Settings', function () {
    it('should have a global instance', function () {
        expect(ST.settings).to.not.be.unidentified;
    });

    describe('#add()', function () {
        it('should add the given object as a property of itself', function () {
            var obj = {
                truck: {
                    size: 'big',
                    weight: 'heavy'
                }
            };
            console.log(ST.settings);
            ST.settings.add('vehicles', obj);

            expect(ST.settings.vehicles.truck.size).to.equal('big');
            expect(ST.settings.vehicles.truck.weight).to.equal('heavy');
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\Settings-spec.js","/test\\spec")

},{"_process":4,"buffer":2}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('Size', function () {
    var s = new ST.Size();
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

},{"_process":4,"buffer":2}],12:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('Theme', function () {
    // let greyToadTheme = require('../../themes/greyToadTheme');
    // let change one style because this theme is the same as the defaults
    greyToadTheme.background = 0xffffff;
    greyToadTheme.widgets.button.hover = 0xff00ff;
    var theme = new ST.Theme(greyToadTheme);
    var defTheme = new ST.Theme();

    it('should load the given styles when created', function () {
        expect(theme.background).to.equal(0xffffff);
        expect(theme.colors.button.hover).to.equal(0xff00ff);
        // not gonna check each one. This should be enough
    });

    it('should load the default styles if no style is given', function () {
        expect(defTheme.background).to.equal(ST.Theme.defaults.background);
        expect(defTheme.colors.button.hover).to.equal(ST.Theme.defaults.widgets.button.hover);
        // not gonna check each one. This should be enough
    });

    describe('#colors', function () {
        it('should equal the widgets portion of the styles', function () {
            expect(theme.colors).to.deep.equal(greyToadTheme.widgets);
        });
    });

    describe('#fontStyles', function () {
        it('should equal the text portion of the styles', function () {
            expect(theme.fontStyles).to.deep.equal(greyToadTheme.text);
        });
    });

    describe('#frames', function () {
        it('should contain rects in the structure of the widgets' + ' portion of the styles', function () {
            // textures becomes an alias for frames therefor
            // see #textures

            // try a few of them
            // expect(theme.frames.button.enabled).to.be.an
            //     .instanceof(PIXI.Rectangle);
            // expect(theme.frames.panel.hover).to.be.an
            //     .instanceof(PIXI.Rectangle);
            // expect(theme.frames.slider.button.enabled).to.be.an
            //     .instanceof(PIXI.Rectangle);
        });
    });

    describe('#baseTexture', function () {
        it('should be a PIXI.BaseTexture', function () {
            expect(theme.baseTexture).to.be.an.instanceof(PIXI.BaseTexture);
        });
    });

    describe('#textures', function () {
        it('should contain textures in the structure of the widgets' + ' portion of the styles', function () {
            // try a few of them
            expect(theme.textures.button.enabled).to.be.an.instanceof(PIXI.Texture);
            expect(theme.textures.panel.hover).to.be.an.instanceof(PIXI.Texture);
            expect(theme.textures.slider.button.enabled).to.be.an.instanceof(PIXI.Texture);
        });
    });

    describe('#background', function () {
        it('should equal the color given in the style', function () {
            expect(theme.background).to.equal(0xffffff);
        });
    });

    describe('#getClipGraphic() (STATIC)', function () {
        it('should return the global clipGraphic', function () {
            expect(ST.Theme.getClipGraphic()).to.be.an.instanceof(PIXI.Graphics);
        });
    });

    describe('#registerDefaultWidgetStyle() (STATIC)', function () {
        it('should add the given style to theme.defaults(global)', function () {
            var style = {
                knob: {
                    enabled: 0x000000,
                    disabled: 0xffffff
                }
            };

            ST.Theme.registerDefaultWidgetStyle('pane', style);

            expect(ST.Theme.defaults.widgets.pane.knob.enabled).to.equal(0x000000);

            expect(ST.Theme.defaults.widgets.pane.knob.disabled).to.equal(0xffffff);
        });
    });

    describe('#makeGraphicsRecursive()', function () {
        // not needed if frames test above passes
    });

    describe('#makeTexture()', function () {
        // not needed if baseTexture test above passes
    });

    describe('#makeTexturesRecursive()', function () {
        // not needed if textures text above passes
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\Theme-spec.js","/test\\spec")

},{"_process":4,"buffer":2}],13:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

require('./Theme-spec');
require('./Size-spec');
require('./Point-spec');
require('./Padding-spec');
require('./GraphicsGen-spec');
require('./App-spec');
require('./widgets');
require('./layoutSys');
require('./Settings-spec');

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\index.js","/test\\spec")

},{"./App-spec":6,"./GraphicsGen-spec":7,"./Padding-spec":8,"./Point-spec":9,"./Settings-spec":10,"./Size-spec":11,"./Theme-spec":12,"./layoutSys":15,"./widgets":35,"_process":4,"buffer":2}],14:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('Alignment', function () {
    var widget0 = new ST.Widgets.BaseWidget();
    widget0.width = 400;widget0.height = 400;
    var widget1 = new ST.Widgets.BaseWidget(widget0);
    widget1.width = 200;widget1.height = 200;

    describe('#getOffset()', function () {
        it('should return a relative offset base on the given horizontal' + ' and vertical alignment', function () {
            widget0.layout.alignment.hAlign = ST.Alignment.center;
            widget0.layout.alignment.vAlign = ST.Alignment.middle;
            var off = new ST.Point();
            off = widget0.layout.alignment.getOffset(widget0, widget1.width, widget1.height);
            // (widget0.width/2) - (widget1.width/2)
            expect(off.x).to.equal(100);
            expect(off.y).to.equal(100);
        });
    });

    describe('#left', function () {
        it('should return relative position for left alignment', function () {
            var off = ST.Alignment.left(400, widget0);
            expect(off).to.equal(4);
        });
    });

    describe('#center', function () {
        it('should return relative position for center alignment', function () {
            var off = ST.Alignment.center(100, widget0);
            expect(off).to.equal(150);
        });
    });

    describe('#right', function () {
        it('should return relative position for right alignment', function () {
            var off = ST.Alignment.right(100, widget0);
            expect(off).to.equal(300);
        });
    });

    describe('#top', function () {
        it('should return relative position for top alignment', function () {
            var off = ST.Alignment.top(100, widget0);
            expect(off).to.equal(4);
        });
    });

    describe('#middle', function () {
        it('should return relative position for middle alignment', function () {
            var off = ST.Alignment.middle(100, widget0);
            expect(off).to.equal(150);
        });
    });

    describe('#bottom', function () {
        it('should return relative position for bottom alignment', function () {
            var off = ST.Alignment.bottom(100, widget0);
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
            var widget0 = new ST.Widgets.Panel(null, { width: 100, height: 100 });
            var widget1 = new ST.Widgets.Button(widget0, { width: 20, height: 20 });
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
    var w0 = new ST.Widgets.Panel(null, { width: 400, height: 400 });
    w0.layout = new ST.Layouts.BoxLayout(w0, ST.VERTICAL);
    var w1 = new ST.Widgets.Button(w0, { width: 20, height: 20 });
    var w2 = new ST.Widgets.Button(w0, { width: 20, height: 20 }); // eslint-disable-line
    var w3 = new ST.Widgets.Button(w0, { width: 20, height: 20 }); // eslint-disable-line

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
    var w0 = new ST.Widgets.Panel(null, { width: 400, height: 400 });
    var w1 = new ST.Widgets.Button(w0);
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
        var w1 = new ST.Widgets.Panel();

        w1.layout = new ST.Layouts.HBoxLayout(w1);
        expect(w1.layout.orientation).to.equal(ST.HORIZONTAL);
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\layoutSys\\layouts\\HBoxLayout-spec.js","/test\\spec\\layoutSys\\layouts")

},{"_process":4,"buffer":2}],20:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('VBoxLayout', function () {
    it('should construct a BoxLayout with VERTICAL orientation', function () {
        var w1 = new ST.Widgets.Panel();

        w1.layout = new ST.Layouts.VBoxLayout(w1);
        expect(w1.layout.orientation).to.equal(ST.VERTICAL);
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
    var widget = new ST.Widgets.Button();

    describe('#childPolicyFinished()', function () {
        it('should add each childs size to totalChildrenFinishedSize and' + ' substract 1 from totalChildrenFinished', function () {
            widget.hPolicy.totalChildrenFinished = 1;
            widget.hPolicy.totalChildrenFinishedSize = 100;
            widget.hPolicy.childPolicyFinished(400);

            expect(widget.hPolicy.totalChildrenFinished).to.equal(0);
            expect(widget.hPolicy.totalChildrenFinishedSize).to.equal(500);
        });
    });

    describe('#exec()', function () {
        var widget2 = new ST.Widgets.Button(widget);

        it('should add a one time event' + '( register size with childPolicyFinished ) and exec the ' + 'HORIZONTAL size policy for each child ' + 'that is HORIZONTAL and an instanceof ST.Widgets.BaseWidget', function () {
            var spy = sinon.spy(widget2.hPolicy, 'exec');
            expect(widget2.hPolicy.listeners('finished', true)).to.be.false;
            expect(widget2).to.be.an.instanceof(ST.Widgets.BaseWidget);
            expect(widget.hPolicy.orientation).to.equal(ST.HORIZONTAL);
            widget.hPolicy.exec();

            expect(spy.called).to.be.true;
            widget2.hPolicy.exec.restore();
        });

        it('should add a one time event' + '( register size with childPolicyFinished ) and exec the ' + 'VERTICAL size policy for each child ' + 'that is VERTICAL and an instanceof ST.Widgets.BaseWidget', function () {
            var spy = sinon.spy(widget2.vPolicy, 'exec');
            expect(widget2.vPolicy.listeners('finished', true)).to.be.false;
            expect(widget2).to.be.an.instanceof(ST.Widgets.BaseWidget);
            expect(widget.vPolicy.orientation).to.equal(ST.VERTICAL);
            widget.vPolicy.exec();

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
    var widget0 = new ST.Widgets.Button();
    widget0.width = 200;widget0.height = 200;
    var widget1 = new ST.Widgets.Button(widget0);
    widget1.hPolicy = new ST.SizePolicies.ExpandingPolicy(widget1);
    widget1.vPolicy = new ST.SizePolicies.ExpandingPolicy(widget1);
    widget1.width = 100;widget1.height = 100;

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
    var widget = new ST.Widgets.Button();

    describe('#sizeWidgetHorizontal', function () {
        it('should validate the width of the widget', function () {
            var spy = sinon.spy(widget, 'validateWidth');
            widget.hPolicy.sizeWidgetHorizontal();
            expect(spy.called).to.be.true;
            widget.validateWidth.restore();
        });
    });

    describe('#sizeWidgetVertical', function () {
        it('should validate the height of the widget', function () {
            var spy = sinon.spy(widget, 'validateHeight');
            widget.vPolicy.sizeWidgetVertical();
            expect(spy.called).to.be.true;
            widget.validateHeight.restore();
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\layoutSys\\sizePolicies\\FixedPolicy-spec.js","/test\\spec\\layoutSys\\sizePolicies")

},{"_process":4,"buffer":2}],25:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('SharedExpandingPolicy', function () {
    var widget0 = new ST.Widgets.Panel(null, { width: 400, height: 400 });
    widget0.layout = new ST.Layouts.HBoxLayout(widget0);

    var widget1 = new ST.Widgets.Button(widget0);
    widget1.hPolicy = new ST.SizePolicies.SharedExpandingPolicy(widget1);
    widget1.vPolicy = new ST.SizePolicies.SharedExpandingPolicy(widget1, ST.VERTICAL);

    var widget2 = new ST.Widgets.Button(widget0);
    widget2.hPolicy = new ST.SizePolicies.SharedExpandingPolicy(widget2);
    widget2.vPolicy = new ST.SizePolicies.SharedExpandingPolicy(widget2, ST.VERTICAL);

    describe('#parentReadyH', function () {
        it('should size the widgets equal size if all have shared policy', function () {
            widget0.hPolicy.exec();
            expect(widget1.width).to.equal(194);
            expect(widget2.width).to.equal(194);
        });

        it('should handle widgets that arent of shared policy', function () {
            var nullwidget = new ST.Widgets.Panel();
            var widget3 = new ST.Widgets.Button(widget0, { width: 100, height: 100 });
            widget3.hPolicy = new ST.SizePolicies.FixedPolicy(widget3);
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

    describe('#consumeUnusedSpaceH()', function () {
        // TODO
    });

    describe('#consumeUnusedSpaceV()', function () {
        // TODO
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

/*
TODO:
test things that should happen when events are fired.
eg. when padding changes _updateClipGraphic should be called.
 */

describe('BaseWidget', function () {
    var widget0 = new ST.Widgets.Panel();
    var widget1 = new ST.Widgets.Panel(widget0);
    var widget2 = new ST.Widgets.Panel(widget1);

    beforeEach(function () {
        widget1.layout = new ST.Layouts.FixedLayout(widget1);
        widget2.hPolicy = new ST.SizePolicies.FixedPolicy(widget2);
        widget0.hPolicy = new ST.SizePolicies.FixedPolicy(widget0);
        widget1.validate();
        widget0.validate();
        widget2.validate();
    });

    it('should parent one widget to another', function () {
        expect(widget2.parent).to.equal(widget1);
    });

    describe('#beginBypassUpdate()', function () {});

    describe('#endBypassUpdate()', function () {});

    describe('#validateWidth()', function () {
        it('should keep widgets width within min/max', function () {
            widget2.min.width = 10;
            widget2.max.width = 80;
            widget2.width = 100;
            widget2.validateWidth();
            expect(widget2.width).to.equal(80);
            widget2.width = 5;
            widget2.validateWidth();
            expect(widget2.width).to.equal(10);
        });
    });

    describe('#validateHeight()', function () {
        it('should keep widgets height within min/max', function () {
            widget2.min.height = 10;
            widget2.max.height = 80;
            widget2.height = 100;
            widget2.validateHeight();
            expect(widget2.height).to.equal(80);
            widget2.height = 5;
            widget2.validateHeight();
            expect(widget2.height).to.equal(10);
        });
    });

    describe('#update()', function () {});

    describe('#validate()', function () {});

    describe('#invalidate()', function () {});

    describe('#routeInvalidation()', function () {
        it('should invalidate the highest parent', function () {
            widget1.layout = new ST.Layouts.HBoxLayout(widget1);
            widget2.layout = new ST.Layouts.HBoxLayout(widget2);
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

    describe('#renderCanvas()', function () {});

    describe('#renderWebGL()', function () {});

    describe('#setParent()', function () {});

    describe('#addChild', function () {
        it('should set each PIXI.Containers mask to null', function () {
            var pc = new PIXI.Container();
            widget2.addChild(pc);
            expect(pc.mask).to.be.null;
        });

        it('should add its theme to each BaseWidget child added', function () {
            expect(widget2.theme).to.equal(widget1.theme);
        });

        it('should set mask to null if child has updateOnHostChanges = false ' + 'for both size policies', function () {
            // should set to parent
            widget1.layout = new ST.Layouts.VBoxLayout(widget1);
            widget2.hPolicy = new ST.SizePolicies.FixedPolicy(widget2);

            expect(widget2.sizeProxy.mask).to.equal(widget1.clipGraphic);

            widget2.hPolicy = new ST.SizePolicies.ExpandingPolicy(widget2, ST.HORIZONTAL);
            widget2.vPolicy = new ST.SizePolicies.ExpandingPolicy(widget2, ST.VERTICAL);

            expect(widget2.sizeProxy.mask).to.be.null;
        });

        it('should mask children if its layout has updateOnHostChanges = true', function () {
            widget1.layout = new ST.Layouts.FixedLayout(widget1);
            expect(widget2.sizeProxy.mask).to.equal(widget1.clipGraphic);
        });

        // it('should add its clipGraphic to each BaseWidget child addeds'
        //     + ' size proxy', ()=>{
        //     expect(widget2.sizeProxy.mask).to.equal(widget1.clipGraphic);
        // });
    });

    describe('#addChildAt()', function () {
        // same as #addChild
    });

    describe('#onChildrenChange()', function () {});

    describe('#applyPosition()', function () {});

    describe('_updateClipGraphic()', function () {
        it('should set to size of widget - padding', function () {
            widget2.vPolicy = new ST.SizePolicies.FixedPolicy(widget2);
            widget2.max.width = 1000;
            widget2.max.height = 1000;
            widget2.width = 400;
            widget2.height = 400;
            widget1.update(); // should call _updateClipGraphic()
            expect(widget2.clipGraphic.width).to.equal(392);
            expect(widget2.clipGraphic.height).to.equal(392);
        });

        it('should set the pos to the top left padding values', function () {
            expect(widget2.clipGraphic.x).to.equal(4);
            expect(widget2.clipGraphic.y).to.equal(4);
        });

        it('should set renderable to false', function () {
            expect(widget2.clipGraphic.renderable).to.be.false;
        });
    });

    describe('#theme', function () {
        var aThm = new ST.Theme();
        it('should apply the set theme to children recursively', function () {
            widget0.theme = aThm;
            expect(widget1.theme).to.equal(widget0.theme);
            expect(widget2.theme).to.equal(widget1.theme);
        });
    });

    describe('#disabled', function () {
        it('should disable itself and its children when set to false', function () {
            widget0.disabled = true;
            expect(widget0.disabled).to.be.true;
            expect(widget1.disabled).to.be.true;
            expect(widget2.disabled).to.be.true;
        });

        it('should enable itself and its children when set to true', function () {
            widget0.disabled = false;
            expect(widget0.disabled).to.be.false;
            expect(widget1.disabled).to.be.false;
            expect(widget2.disabled).to.be.false;
        });
    });

    describe('#_evaluateMask()', function () {
        it('should mask all children if layout.updateOnHostChanges = true', function () {
            widget0.layout = new ST.Layouts.FixedLayout(widget0);
            expect(widget1.mask).to.equal(widget0.clipGraphic);
        });

        it('should mask child if either policy has updateOnHostChanges true' + ' and the parents layout has updateOnHostChanges false', function () {
            widget0.layout = new ST.Layouts.VBoxLayout(widget0, ST.VERTICAL);
            widget1.hPolicy = new ST.SizePolicies.FixedPolicy(widget1);
            expect(widget1.mask).to.equal(widget0.clipGraphic);
        });

        it('should set mask to null if layout has updateOnHostChanges false ' + 'and childs policies have updateOnHostChanges false', function () {
            widget0.layout = new ST.Layouts.VBoxLayout(widget0, ST.VERTICAL);
            widget1.hPolicy = new ST.SizePolicies.ExpandingPolicy(widget1, ST.HORIZONTAL);
            widget1.vPolicy = new ST.SizePolicies.ExpandingPolicy(widget1, ST.VERTICAL);
            expect(widget1.mask).to.be.null;
        });

        it('should set mask to null if child is not a widget', function () {
            var pc = new PIXI.Container();
            widget0.addChild(pc);
            widget0._evaluateMask();
            expect(pc.mask).to.be.null;
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\widgets\\BaseWidget-spec.js","/test\\spec\\widgets")

},{"_process":4,"buffer":2}],28:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('Button', function () {});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\widgets\\Button-spec.js","/test\\spec\\widgets")

},{"_process":4,"buffer":2}],29:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('Label', function () {
    var label = new ST.Widgets.Label(null, { text: 'test' });

    it('should set text from option if set', function () {
        expect(label.text).to.equal('test');
    });

    describe('#_textObj', function () {
        it('should have a null mask', function () {
            expect(label._textObj.mask).to.equal(null);
        });
    });

    describe('#_clipGraphic', function () {
        it('should be unrenderable', function () {
            expect(label._clipGraphic.renderable).to.equal(false);
        });
    });

    describe('#text', function () {
        it('should update _textObjs text', function () {
            label.text = 'update';
            expect(label._textObj.text).to.equal('update');
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\widgets\\Label-spec.js","/test\\spec\\widgets")

},{"_process":4,"buffer":2}],30:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('Panel', function () {
    var panel = new ST.Widgets.Panel();

    describe('#_bkgObj', function () {
        it('should be a sprite', function () {
            expect(panel._bkgObj).to.be.an.instanceof(PIXI.Sprite);
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\widgets\\Panel-spec.js","/test\\spec\\widgets")

},{"_process":4,"buffer":2}],31:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('SITransform', function () {
    it('should allow a widget to transform its dimensions' + ' independent from its parent', function () {
        var widget0 = new ST.Widgets.Panel();
        widget0.width = 1000;
        var widget1 = new ST.Widgets.Panel();
        widget1.width = 200;
        widget0.addChild(widget1);
        widget0.width = 500;
        expect(widget1.width).to.equal(200);
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\widgets\\SITransform-spec.js","/test\\spec\\widgets")

},{"_process":4,"buffer":2}],32:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

// TODO: Would like to get more test here at some point

describe('Slider', function () {
    var sl = new ST.Widgets.Slider(null, { width: 200, height: 30 });
    sl.update();

    describe('#track', function () {
        it('should be an image widget', function () {
            expect(sl.track).to.be.an.instanceof(ST.Widgets.Image);
        });
    });

    describe('#trackHitRect', function () {
        it('should be a rectangle', function () {
            expect(sl.trackHitRect).to.be.an.instanceof(PIXI.Rectangle);
        });
    });

    describe('#button', function () {
        it('should be an image widget', function () {
            expect(sl.button).to.be.an.instanceof(ST.Widgets.Image);
        });
    });

    describe('#updateTrackHitRect()', function () {
        it('should set the size of the clickable area of the track', function () {
            expect(sl.trackHitRect.x).to.equal(0);
            expect(sl.trackHitRect.y).to.equal(-5);
            expect(sl.trackHitRect.width).to.equal(200);
            expect(sl.trackHitRect.height).to.equal(sl.track.height + 10);
        });
    });

    describe('#value', function () {
        it('should set the buttons pos when set', function () {
            sl.value = 0.5;
            var actual = 90;
            expect(sl.button.x).to.equal(actual);
        });

        it('should return the value from the position', function () {
            var actual = 0.5;
            expect(sl.value).to.equal(actual);
        });
    });

    describe('#orientation', function () {
        sl.orientation = ST.HORIZONTAL;

        it('should set the min and max heights when set', function () {
            expect(sl.min.height).to.equal(sl.button.height);
            expect(sl.min.width).to.equal(sl.button.width * 2);
            expect(sl.max.height).to.equal(sl.button.height);
            expect(sl.max.width).to.equal(10000);
        });

        it('should set the track size', function () {
            expect(sl.track.width).to.equal(sl.width);
            expect(sl.track.height).to.equal(5);
        });

        it('should set alignments', function () {
            expect(sl.layout.alignment.hAlign).to.equal(ST.Alignment.left);
            expect(sl.layout.alignment.vAlign).to.equal(ST.Alignment.middle);
        });

        it('should set the tracks size policies', function () {
            expect(sl.track.hPolicy).to.be.an.instanceof(ST.SizePolicies.ExpandingPolicy);

            expect(sl.track.vPolicy).to.be.an.instanceof(ST.SizePolicies.FixedPolicy);
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\widgets\\Slider-spec.js","/test\\spec\\widgets")

},{"_process":4,"buffer":2}],33:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('StageWidget', function () {
    it('Should have a bounds as big as the user defined size', function () {
        var sw = new ST.Widgets.StageWidget(null, { width: 600, height: 800 });
        var b1 = new ST.Widgets.Button(sw, { width: 900, height: 900 }); //eslint-disable-line
        var b2 = new ST.Widgets.Panel(sw, { width: 100, height: 100, x: 700 }); // eslint-disable-line
        var bounds = sw.getBounds();

        expect(bounds.width).to.equal(600);
        expect(bounds.height).to.equal(800);
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\widgets\\StageWidget-spec.js","/test\\spec\\widgets")

},{"_process":4,"buffer":2}],34:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('TextButton', function () {
    describe('#Text', function () {
        it('should set the text for the contained label', function () {
            var tb = new ST.Widgets.TextButton();
            tb.text = 'meow';
            expect(tb.label.text).to.equal('meow');
        });
    });
});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\widgets\\TextButton-spec.js","/test\\spec\\widgets")

},{"_process":4,"buffer":2}],35:[function(require,module,exports){
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

},{"./BaseWidget-spec":27,"./Button-spec":28,"./Label-spec":29,"./Panel-spec":30,"./SITransform-spec":31,"./Slider-spec":32,"./StageWidget-spec":33,"./TextButton-spec":34,"_process":4,"buffer":2}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsInRlc3RcXHRlc3RcXGluZGV4LmpzIiwidGVzdFxcc3BlY1xcdGVzdFxcc3BlY1xcQXBwLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx0ZXN0XFxzcGVjXFxHcmFwaGljc0dlbi1zcGVjLmpzIiwidGVzdFxcc3BlY1xcdGVzdFxcc3BlY1xcUGFkZGluZy1zcGVjLmpzIiwidGVzdFxcc3BlY1xcdGVzdFxcc3BlY1xcUG9pbnQtc3BlYy5qcyIsInRlc3RcXHNwZWNcXHRlc3RcXHNwZWNcXFNldHRpbmdzLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx0ZXN0XFxzcGVjXFxTaXplLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx0ZXN0XFxzcGVjXFxUaGVtZS1zcGVjLmpzIiwidGVzdFxcc3BlY1xcdGVzdFxcc3BlY1xcaW5kZXguanMiLCJ0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcQWxpZ25tZW50LXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcaW5kZXguanMiLCJ0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXGxheW91dHNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcbGF5b3V0c1xcQmFzZUxheW91dC1zcGVjLmpzIiwidGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxsYXlvdXRzXFx0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXGxheW91dHNcXEJveExheW91dC1zcGVjLmpzIiwidGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxsYXlvdXRzXFx0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXGxheW91dHNcXEZpeGVkTGF5b3V0LXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXGxheW91dHNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcbGF5b3V0c1xcSEJveExheW91dC1zcGVjLmpzIiwidGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxsYXlvdXRzXFx0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXGxheW91dHNcXFZCb3hMYXlvdXQtc3BlYy5qcyIsInRlc3RcXHNwZWNcXGxheW91dFN5c1xcbGF5b3V0c1xcdGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxsYXlvdXRzXFxpbmRleC5qcyIsInRlc3RcXHNwZWNcXGxheW91dFN5c1xcc2l6ZVBvbGljaWVzXFx0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXHNpemVQb2xpY2llc1xcQmFzZVBvbGljeS1zcGVjLmpzIiwidGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxzaXplUG9saWNpZXNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcc2l6ZVBvbGljaWVzXFxFeHBhbmRpbmdQb2xpY3ktc3BlYy5qcyIsInRlc3RcXHNwZWNcXGxheW91dFN5c1xcc2l6ZVBvbGljaWVzXFx0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXHNpemVQb2xpY2llc1xcRml4ZWRQb2xpY3ktc3BlYy5qcyIsInRlc3RcXHNwZWNcXGxheW91dFN5c1xcc2l6ZVBvbGljaWVzXFx0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXHNpemVQb2xpY2llc1xcU2hhcmVkRXhwYW5kaW5nUG9saWN5LXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXHNpemVQb2xpY2llc1xcdGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxzaXplUG9saWNpZXNcXGluZGV4LmpzIiwidGVzdFxcc3BlY1xcd2lkZ2V0c1xcdGVzdFxcc3BlY1xcd2lkZ2V0c1xcQmFzZVdpZGdldC1zcGVjLmpzIiwidGVzdFxcc3BlY1xcd2lkZ2V0c1xcdGVzdFxcc3BlY1xcd2lkZ2V0c1xcQnV0dG9uLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx3aWRnZXRzXFx0ZXN0XFxzcGVjXFx3aWRnZXRzXFxMYWJlbC1zcGVjLmpzIiwidGVzdFxcc3BlY1xcd2lkZ2V0c1xcdGVzdFxcc3BlY1xcd2lkZ2V0c1xcUGFuZWwtc3BlYy5qcyIsInRlc3RcXHNwZWNcXHdpZGdldHNcXHRlc3RcXHNwZWNcXHdpZGdldHNcXFNJVHJhbnNmb3JtLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx3aWRnZXRzXFx0ZXN0XFxzcGVjXFx3aWRnZXRzXFxTbGlkZXItc3BlYy5qcyIsInRlc3RcXHNwZWNcXHdpZGdldHNcXHRlc3RcXHNwZWNcXHdpZGdldHNcXFN0YWdlV2lkZ2V0LXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx3aWRnZXRzXFx0ZXN0XFxzcGVjXFx3aWRnZXRzXFxUZXh0QnV0dG9uLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx3aWRnZXRzXFx0ZXN0XFxzcGVjXFx3aWRnZXRzXFxpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzFxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QSxRQUFRLG1CQUFSO0FBQ0EsUUFBUSxlQUFSIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0J1xuXG5leHBvcnRzLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5leHBvcnRzLnRvQnl0ZUFycmF5ID0gdG9CeXRlQXJyYXlcbmV4cG9ydHMuZnJvbUJ5dGVBcnJheSA9IGZyb21CeXRlQXJyYXlcblxudmFyIGxvb2t1cCA9IFtdXG52YXIgcmV2TG9va3VwID0gW11cbnZhciBBcnIgPSB0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcgPyBVaW50OEFycmF5IDogQXJyYXlcblxudmFyIGNvZGUgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLydcbmZvciAodmFyIGkgPSAwLCBsZW4gPSBjb2RlLmxlbmd0aDsgaSA8IGxlbjsgKytpKSB7XG4gIGxvb2t1cFtpXSA9IGNvZGVbaV1cbiAgcmV2TG9va3VwW2NvZGUuY2hhckNvZGVBdChpKV0gPSBpXG59XG5cbnJldkxvb2t1cFsnLScuY2hhckNvZGVBdCgwKV0gPSA2MlxucmV2TG9va3VwWydfJy5jaGFyQ29kZUF0KDApXSA9IDYzXG5cbmZ1bmN0aW9uIHBsYWNlSG9sZGVyc0NvdW50IChiNjQpIHtcbiAgdmFyIGxlbiA9IGI2NC5sZW5ndGhcbiAgaWYgKGxlbiAlIDQgPiAwKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIHN0cmluZy4gTGVuZ3RoIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA0JylcbiAgfVxuXG4gIC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG4gIC8vIGlmIHRoZXJlIGFyZSB0d28gcGxhY2Vob2xkZXJzLCB0aGFuIHRoZSB0d28gY2hhcmFjdGVycyBiZWZvcmUgaXRcbiAgLy8gcmVwcmVzZW50IG9uZSBieXRlXG4gIC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuICAvLyB0aGlzIGlzIGp1c3QgYSBjaGVhcCBoYWNrIHRvIG5vdCBkbyBpbmRleE9mIHR3aWNlXG4gIHJldHVybiBiNjRbbGVuIC0gMl0gPT09ICc9JyA/IDIgOiBiNjRbbGVuIC0gMV0gPT09ICc9JyA/IDEgOiAwXG59XG5cbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKGI2NCkge1xuICAvLyBiYXNlNjQgaXMgNC8zICsgdXAgdG8gdHdvIGNoYXJhY3RlcnMgb2YgdGhlIG9yaWdpbmFsIGRhdGFcbiAgcmV0dXJuIGI2NC5sZW5ndGggKiAzIC8gNCAtIHBsYWNlSG9sZGVyc0NvdW50KGI2NClcbn1cblxuZnVuY3Rpb24gdG9CeXRlQXJyYXkgKGI2NCkge1xuICB2YXIgaSwgaiwgbCwgdG1wLCBwbGFjZUhvbGRlcnMsIGFyclxuICB2YXIgbGVuID0gYjY0Lmxlbmd0aFxuICBwbGFjZUhvbGRlcnMgPSBwbGFjZUhvbGRlcnNDb3VudChiNjQpXG5cbiAgYXJyID0gbmV3IEFycihsZW4gKiAzIC8gNCAtIHBsYWNlSG9sZGVycylcblxuICAvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG4gIGwgPSBwbGFjZUhvbGRlcnMgPiAwID8gbGVuIC0gNCA6IGxlblxuXG4gIHZhciBMID0gMFxuXG4gIGZvciAoaSA9IDAsIGogPSAwOyBpIDwgbDsgaSArPSA0LCBqICs9IDMpIHtcbiAgICB0bXAgPSAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxOCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgMTIpIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMildIDw8IDYpIHwgcmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAzKV1cbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gMTYpICYgMHhGRlxuICAgIGFycltMKytdID0gKHRtcCA+PiA4KSAmIDB4RkZcbiAgICBhcnJbTCsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIGlmIChwbGFjZUhvbGRlcnMgPT09IDIpIHtcbiAgICB0bXAgPSAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAyKSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA+PiA0KVxuICAgIGFycltMKytdID0gdG1wICYgMHhGRlxuICB9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuICAgIHRtcCA9IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDEwKSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA8PCA0KSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDIpXSA+PiAyKVxuICAgIGFycltMKytdID0gKHRtcCA+PiA4KSAmIDB4RkZcbiAgICBhcnJbTCsrXSA9IHRtcCAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBhcnJcbn1cblxuZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcbiAgcmV0dXJuIGxvb2t1cFtudW0gPj4gMTggJiAweDNGXSArIGxvb2t1cFtudW0gPj4gMTIgJiAweDNGXSArIGxvb2t1cFtudW0gPj4gNiAmIDB4M0ZdICsgbG9va3VwW251bSAmIDB4M0ZdXG59XG5cbmZ1bmN0aW9uIGVuY29kZUNodW5rICh1aW50OCwgc3RhcnQsIGVuZCkge1xuICB2YXIgdG1wXG4gIHZhciBvdXRwdXQgPSBbXVxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkgKz0gMykge1xuICAgIHRtcCA9ICh1aW50OFtpXSA8PCAxNikgKyAodWludDhbaSArIDFdIDw8IDgpICsgKHVpbnQ4W2kgKyAyXSlcbiAgICBvdXRwdXQucHVzaCh0cmlwbGV0VG9CYXNlNjQodG1wKSlcbiAgfVxuICByZXR1cm4gb3V0cHV0LmpvaW4oJycpXG59XG5cbmZ1bmN0aW9uIGZyb21CeXRlQXJyYXkgKHVpbnQ4KSB7XG4gIHZhciB0bXBcbiAgdmFyIGxlbiA9IHVpbnQ4Lmxlbmd0aFxuICB2YXIgZXh0cmFCeXRlcyA9IGxlbiAlIDMgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcbiAgdmFyIG91dHB1dCA9ICcnXG4gIHZhciBwYXJ0cyA9IFtdXG4gIHZhciBtYXhDaHVua0xlbmd0aCA9IDE2MzgzIC8vIG11c3QgYmUgbXVsdGlwbGUgb2YgM1xuXG4gIC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcbiAgZm9yICh2YXIgaSA9IDAsIGxlbjIgPSBsZW4gLSBleHRyYUJ5dGVzOyBpIDwgbGVuMjsgaSArPSBtYXhDaHVua0xlbmd0aCkge1xuICAgIHBhcnRzLnB1c2goZW5jb2RlQ2h1bmsodWludDgsIGksIChpICsgbWF4Q2h1bmtMZW5ndGgpID4gbGVuMiA/IGxlbjIgOiAoaSArIG1heENodW5rTGVuZ3RoKSkpXG4gIH1cblxuICAvLyBwYWQgdGhlIGVuZCB3aXRoIHplcm9zLCBidXQgbWFrZSBzdXJlIHRvIG5vdCBmb3JnZXQgdGhlIGV4dHJhIGJ5dGVzXG4gIGlmIChleHRyYUJ5dGVzID09PSAxKSB7XG4gICAgdG1wID0gdWludDhbbGVuIC0gMV1cbiAgICBvdXRwdXQgKz0gbG9va3VwW3RtcCA+PiAyXVxuICAgIG91dHB1dCArPSBsb29rdXBbKHRtcCA8PCA0KSAmIDB4M0ZdXG4gICAgb3V0cHV0ICs9ICc9PSdcbiAgfSBlbHNlIGlmIChleHRyYUJ5dGVzID09PSAyKSB7XG4gICAgdG1wID0gKHVpbnQ4W2xlbiAtIDJdIDw8IDgpICsgKHVpbnQ4W2xlbiAtIDFdKVxuICAgIG91dHB1dCArPSBsb29rdXBbdG1wID4+IDEwXVxuICAgIG91dHB1dCArPSBsb29rdXBbKHRtcCA+PiA0KSAmIDB4M0ZdXG4gICAgb3V0cHV0ICs9IGxvb2t1cFsodG1wIDw8IDIpICYgMHgzRl1cbiAgICBvdXRwdXQgKz0gJz0nXG4gIH1cblxuICBwYXJ0cy5wdXNoKG91dHB1dClcblxuICByZXR1cm4gcGFydHMuam9pbignJylcbn1cbiIsIi8qIVxuICogVGhlIGJ1ZmZlciBtb2R1bGUgZnJvbSBub2RlLmpzLCBmb3IgdGhlIGJyb3dzZXIuXG4gKlxuICogQGF1dGhvciAgIEZlcm9zcyBBYm91a2hhZGlqZWggPGZlcm9zc0BmZXJvc3Mub3JnPiA8aHR0cDovL2Zlcm9zcy5vcmc+XG4gKiBAbGljZW5zZSAgTUlUXG4gKi9cbi8qIGVzbGludC1kaXNhYmxlIG5vLXByb3RvICovXG5cbid1c2Ugc3RyaWN0J1xuXG52YXIgYmFzZTY0ID0gcmVxdWlyZSgnYmFzZTY0LWpzJylcbnZhciBpZWVlNzU0ID0gcmVxdWlyZSgnaWVlZTc1NCcpXG5cbmV4cG9ydHMuQnVmZmVyID0gQnVmZmVyXG5leHBvcnRzLlNsb3dCdWZmZXIgPSBTbG93QnVmZmVyXG5leHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTID0gNTBcblxudmFyIEtfTUFYX0xFTkdUSCA9IDB4N2ZmZmZmZmZcbmV4cG9ydHMua01heExlbmd0aCA9IEtfTUFYX0xFTkdUSFxuXG4vKipcbiAqIElmIGBCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVGA6XG4gKiAgID09PSB0cnVlICAgIFVzZSBVaW50OEFycmF5IGltcGxlbWVudGF0aW9uIChmYXN0ZXN0KVxuICogICA9PT0gZmFsc2UgICBQcmludCB3YXJuaW5nIGFuZCByZWNvbW1lbmQgdXNpbmcgYGJ1ZmZlcmAgdjQueCB3aGljaCBoYXMgYW4gT2JqZWN0XG4gKiAgICAgICAgICAgICAgIGltcGxlbWVudGF0aW9uIChtb3N0IGNvbXBhdGlibGUsIGV2ZW4gSUU2KVxuICpcbiAqIEJyb3dzZXJzIHRoYXQgc3VwcG9ydCB0eXBlZCBhcnJheXMgYXJlIElFIDEwKywgRmlyZWZveCA0KywgQ2hyb21lIDcrLCBTYWZhcmkgNS4xKyxcbiAqIE9wZXJhIDExLjYrLCBpT1MgNC4yKy5cbiAqXG4gKiBXZSByZXBvcnQgdGhhdCB0aGUgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IHR5cGVkIGFycmF5cyBpZiB0aGUgYXJlIG5vdCBzdWJjbGFzc2FibGVcbiAqIHVzaW5nIF9fcHJvdG9fXy4gRmlyZWZveCA0LTI5IGxhY2tzIHN1cHBvcnQgZm9yIGFkZGluZyBuZXcgcHJvcGVydGllcyB0byBgVWludDhBcnJheWBcbiAqIChTZWU6IGh0dHBzOi8vYnVnemlsbGEubW96aWxsYS5vcmcvc2hvd19idWcuY2dpP2lkPTY5NTQzOCkuIElFIDEwIGxhY2tzIHN1cHBvcnRcbiAqIGZvciBfX3Byb3RvX18gYW5kIGhhcyBhIGJ1Z2d5IHR5cGVkIGFycmF5IGltcGxlbWVudGF0aW9uLlxuICovXG5CdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCA9IHR5cGVkQXJyYXlTdXBwb3J0KClcblxuaWYgKCFCdWZmZXIuVFlQRURfQVJSQVlfU1VQUE9SVCAmJiB0eXBlb2YgY29uc29sZSAhPT0gJ3VuZGVmaW5lZCcgJiZcbiAgICB0eXBlb2YgY29uc29sZS5lcnJvciA9PT0gJ2Z1bmN0aW9uJykge1xuICBjb25zb2xlLmVycm9yKFxuICAgICdUaGlzIGJyb3dzZXIgbGFja3MgdHlwZWQgYXJyYXkgKFVpbnQ4QXJyYXkpIHN1cHBvcnQgd2hpY2ggaXMgcmVxdWlyZWQgYnkgJyArXG4gICAgJ2BidWZmZXJgIHY1LnguIFVzZSBgYnVmZmVyYCB2NC54IGlmIHlvdSByZXF1aXJlIG9sZCBicm93c2VyIHN1cHBvcnQuJ1xuICApXG59XG5cbmZ1bmN0aW9uIHR5cGVkQXJyYXlTdXBwb3J0ICgpIHtcbiAgLy8gQ2FuIHR5cGVkIGFycmF5IGluc3RhbmNlcyBjYW4gYmUgYXVnbWVudGVkP1xuICB0cnkge1xuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheSgxKVxuICAgIGFyci5fX3Byb3RvX18gPSB7X19wcm90b19fOiBVaW50OEFycmF5LnByb3RvdHlwZSwgZm9vOiBmdW5jdGlvbiAoKSB7IHJldHVybiA0MiB9fVxuICAgIHJldHVybiBhcnIuZm9vKCkgPT09IDQyXG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5mdW5jdGlvbiBjcmVhdGVCdWZmZXIgKGxlbmd0aCkge1xuICBpZiAobGVuZ3RoID4gS19NQVhfTEVOR1RIKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0ludmFsaWQgdHlwZWQgYXJyYXkgbGVuZ3RoJylcbiAgfVxuICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZVxuICB2YXIgYnVmID0gbmV3IFVpbnQ4QXJyYXkobGVuZ3RoKVxuICBidWYuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICByZXR1cm4gYnVmXG59XG5cbi8qKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBoYXZlIHRoZWlyXG4gKiBwcm90b3R5cGUgY2hhbmdlZCB0byBgQnVmZmVyLnByb3RvdHlwZWAuIEZ1cnRoZXJtb3JlLCBgQnVmZmVyYCBpcyBhIHN1YmNsYXNzIG9mXG4gKiBgVWludDhBcnJheWAsIHNvIHRoZSByZXR1cm5lZCBpbnN0YW5jZXMgd2lsbCBoYXZlIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBtZXRob2RzXG4gKiBhbmQgdGhlIGBVaW50OEFycmF5YCBtZXRob2RzLiBTcXVhcmUgYnJhY2tldCBub3RhdGlvbiB3b3JrcyBhcyBleHBlY3RlZCAtLSBpdFxuICogcmV0dXJucyBhIHNpbmdsZSBvY3RldC5cbiAqXG4gKiBUaGUgYFVpbnQ4QXJyYXlgIHByb3RvdHlwZSByZW1haW5zIHVubW9kaWZpZWQuXG4gKi9cblxuZnVuY3Rpb24gQnVmZmVyIChhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICAvLyBDb21tb24gY2FzZS5cbiAgaWYgKHR5cGVvZiBhcmcgPT09ICdudW1iZXInKSB7XG4gICAgaWYgKHR5cGVvZiBlbmNvZGluZ09yT2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnSWYgZW5jb2RpbmcgaXMgc3BlY2lmaWVkIHRoZW4gdGhlIGZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcnXG4gICAgICApXG4gICAgfVxuICAgIHJldHVybiBhbGxvY1Vuc2FmZShhcmcpXG4gIH1cbiAgcmV0dXJuIGZyb20oYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG59XG5cbi8vIEZpeCBzdWJhcnJheSgpIGluIEVTMjAxNi4gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9wdWxsLzk3XG5pZiAodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnNwZWNpZXMgJiZcbiAgICBCdWZmZXJbU3ltYm9sLnNwZWNpZXNdID09PSBCdWZmZXIpIHtcbiAgT2JqZWN0LmRlZmluZVByb3BlcnR5KEJ1ZmZlciwgU3ltYm9sLnNwZWNpZXMsIHtcbiAgICB2YWx1ZTogbnVsbCxcbiAgICBjb25maWd1cmFibGU6IHRydWUsXG4gICAgZW51bWVyYWJsZTogZmFsc2UsXG4gICAgd3JpdGFibGU6IGZhbHNlXG4gIH0pXG59XG5cbkJ1ZmZlci5wb29sU2l6ZSA9IDgxOTIgLy8gbm90IHVzZWQgYnkgdGhpcyBpbXBsZW1lbnRhdGlvblxuXG5mdW5jdGlvbiBmcm9tICh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJ2YWx1ZVwiIGFyZ3VtZW50IG11c3Qgbm90IGJlIGEgbnVtYmVyJylcbiAgfVxuXG4gIGlmICh2YWx1ZSBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgcmV0dXJuIGZyb21BcnJheUJ1ZmZlcih2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICByZXR1cm4gZnJvbVN0cmluZyh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldClcbiAgfVxuXG4gIHJldHVybiBmcm9tT2JqZWN0KHZhbHVlKVxufVxuXG4vKipcbiAqIEZ1bmN0aW9uYWxseSBlcXVpdmFsZW50IHRvIEJ1ZmZlcihhcmcsIGVuY29kaW5nKSBidXQgdGhyb3dzIGEgVHlwZUVycm9yXG4gKiBpZiB2YWx1ZSBpcyBhIG51bWJlci5cbiAqIEJ1ZmZlci5mcm9tKHN0clssIGVuY29kaW5nXSlcbiAqIEJ1ZmZlci5mcm9tKGFycmF5KVxuICogQnVmZmVyLmZyb20oYnVmZmVyKVxuICogQnVmZmVyLmZyb20oYXJyYXlCdWZmZXJbLCBieXRlT2Zmc2V0WywgbGVuZ3RoXV0pXG4gKiovXG5CdWZmZXIuZnJvbSA9IGZ1bmN0aW9uICh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBmcm9tKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG59XG5cbi8vIE5vdGU6IENoYW5nZSBwcm90b3R5cGUgKmFmdGVyKiBCdWZmZXIuZnJvbSBpcyBkZWZpbmVkIHRvIHdvcmthcm91bmQgQ2hyb21lIGJ1Zzpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL3B1bGwvMTQ4XG5CdWZmZXIucHJvdG90eXBlLl9fcHJvdG9fXyA9IFVpbnQ4QXJyYXkucHJvdG90eXBlXG5CdWZmZXIuX19wcm90b19fID0gVWludDhBcnJheVxuXG5mdW5jdGlvbiBhc3NlcnRTaXplIChzaXplKSB7XG4gIGlmICh0eXBlb2Ygc2l6ZSAhPT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInNpemVcIiBhcmd1bWVudCBtdXN0IGJlIGEgbnVtYmVyJylcbiAgfSBlbHNlIGlmIChzaXplIDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcInNpemVcIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBuZWdhdGl2ZScpXG4gIH1cbn1cblxuZnVuY3Rpb24gYWxsb2MgKHNpemUsIGZpbGwsIGVuY29kaW5nKSB7XG4gIGFzc2VydFNpemUoc2l6ZSlcbiAgaWYgKHNpemUgPD0gMCkge1xuICAgIHJldHVybiBjcmVhdGVCdWZmZXIoc2l6ZSlcbiAgfVxuICBpZiAoZmlsbCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgLy8gT25seSBwYXkgYXR0ZW50aW9uIHRvIGVuY29kaW5nIGlmIGl0J3MgYSBzdHJpbmcuIFRoaXNcbiAgICAvLyBwcmV2ZW50cyBhY2NpZGVudGFsbHkgc2VuZGluZyBpbiBhIG51bWJlciB0aGF0IHdvdWxkXG4gICAgLy8gYmUgaW50ZXJwcmV0dGVkIGFzIGEgc3RhcnQgb2Zmc2V0LlxuICAgIHJldHVybiB0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnXG4gICAgICA/IGNyZWF0ZUJ1ZmZlcihzaXplKS5maWxsKGZpbGwsIGVuY29kaW5nKVxuICAgICAgOiBjcmVhdGVCdWZmZXIoc2l6ZSkuZmlsbChmaWxsKVxuICB9XG4gIHJldHVybiBjcmVhdGVCdWZmZXIoc2l6ZSlcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiBhbGxvYyhzaXplWywgZmlsbFssIGVuY29kaW5nXV0pXG4gKiovXG5CdWZmZXIuYWxsb2MgPSBmdW5jdGlvbiAoc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGFsbG9jKHNpemUsIGZpbGwsIGVuY29kaW5nKVxufVxuXG5mdW5jdGlvbiBhbGxvY1Vuc2FmZSAoc2l6ZSkge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIHJldHVybiBjcmVhdGVCdWZmZXIoc2l6ZSA8IDAgPyAwIDogY2hlY2tlZChzaXplKSB8IDApXG59XG5cbi8qKlxuICogRXF1aXZhbGVudCB0byBCdWZmZXIobnVtKSwgYnkgZGVmYXVsdCBjcmVhdGVzIGEgbm9uLXplcm8tZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqICovXG5CdWZmZXIuYWxsb2NVbnNhZmUgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUoc2l6ZSlcbn1cbi8qKlxuICogRXF1aXZhbGVudCB0byBTbG93QnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKi9cbkJ1ZmZlci5hbGxvY1Vuc2FmZVNsb3cgPSBmdW5jdGlvbiAoc2l6ZSkge1xuICByZXR1cm4gYWxsb2NVbnNhZmUoc2l6ZSlcbn1cblxuZnVuY3Rpb24gZnJvbVN0cmluZyAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAodHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJyB8fCBlbmNvZGluZyA9PT0gJycpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICB9XG5cbiAgaWYgKCFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImVuY29kaW5nXCIgbXVzdCBiZSBhIHZhbGlkIHN0cmluZyBlbmNvZGluZycpXG4gIH1cblxuICB2YXIgbGVuZ3RoID0gYnl0ZUxlbmd0aChzdHJpbmcsIGVuY29kaW5nKSB8IDBcbiAgdmFyIGJ1ZiA9IGNyZWF0ZUJ1ZmZlcihsZW5ndGgpXG5cbiAgdmFyIGFjdHVhbCA9IGJ1Zi53cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuXG4gIGlmIChhY3R1YWwgIT09IGxlbmd0aCkge1xuICAgIC8vIFdyaXRpbmcgYSBoZXggc3RyaW5nLCBmb3IgZXhhbXBsZSwgdGhhdCBjb250YWlucyBpbnZhbGlkIGNoYXJhY3RlcnMgd2lsbFxuICAgIC8vIGNhdXNlIGV2ZXJ5dGhpbmcgYWZ0ZXIgdGhlIGZpcnN0IGludmFsaWQgY2hhcmFjdGVyIHRvIGJlIGlnbm9yZWQuIChlLmcuXG4gICAgLy8gJ2FieHhjZCcgd2lsbCBiZSB0cmVhdGVkIGFzICdhYicpXG4gICAgYnVmID0gYnVmLnNsaWNlKDAsIGFjdHVhbClcbiAgfVxuXG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5TGlrZSAoYXJyYXkpIHtcbiAgdmFyIGxlbmd0aCA9IGFycmF5Lmxlbmd0aCA8IDAgPyAwIDogY2hlY2tlZChhcnJheS5sZW5ndGgpIHwgMFxuICB2YXIgYnVmID0gY3JlYXRlQnVmZmVyKGxlbmd0aClcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkgKz0gMSkge1xuICAgIGJ1ZltpXSA9IGFycmF5W2ldICYgMjU1XG4gIH1cbiAgcmV0dXJuIGJ1ZlxufVxuXG5mdW5jdGlvbiBmcm9tQXJyYXlCdWZmZXIgKGFycmF5LCBieXRlT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKGJ5dGVPZmZzZXQgPCAwIHx8IGFycmF5LmJ5dGVMZW5ndGggPCBieXRlT2Zmc2V0KSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1xcJ29mZnNldFxcJyBpcyBvdXQgb2YgYm91bmRzJylcbiAgfVxuXG4gIGlmIChhcnJheS5ieXRlTGVuZ3RoIDwgYnl0ZU9mZnNldCArIChsZW5ndGggfHwgMCkpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXFwnbGVuZ3RoXFwnIGlzIG91dCBvZiBib3VuZHMnKVxuICB9XG5cbiAgdmFyIGJ1ZlxuICBpZiAoYnl0ZU9mZnNldCA9PT0gdW5kZWZpbmVkICYmIGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXkpXG4gIH0gZWxzZSBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBidWYgPSBuZXcgVWludDhBcnJheShhcnJheSwgYnl0ZU9mZnNldClcbiAgfSBlbHNlIHtcbiAgICBidWYgPSBuZXcgVWludDhBcnJheShhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKVxuICB9XG5cbiAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2VcbiAgYnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgcmV0dXJuIGJ1ZlxufVxuXG5mdW5jdGlvbiBmcm9tT2JqZWN0IChvYmopIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihvYmopKSB7XG4gICAgdmFyIGxlbiA9IGNoZWNrZWQob2JqLmxlbmd0aCkgfCAwXG4gICAgdmFyIGJ1ZiA9IGNyZWF0ZUJ1ZmZlcihsZW4pXG5cbiAgICBpZiAoYnVmLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIGJ1ZlxuICAgIH1cblxuICAgIG9iai5jb3B5KGJ1ZiwgMCwgMCwgbGVuKVxuICAgIHJldHVybiBidWZcbiAgfVxuXG4gIGlmIChvYmopIHtcbiAgICBpZiAoaXNBcnJheUJ1ZmZlclZpZXcob2JqKSB8fCAnbGVuZ3RoJyBpbiBvYmopIHtcbiAgICAgIGlmICh0eXBlb2Ygb2JqLmxlbmd0aCAhPT0gJ251bWJlcicgfHwgbnVtYmVySXNOYU4ob2JqLmxlbmd0aCkpIHtcbiAgICAgICAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcigwKVxuICAgICAgfVxuICAgICAgcmV0dXJuIGZyb21BcnJheUxpa2Uob2JqKVxuICAgIH1cblxuICAgIGlmIChvYmoudHlwZSA9PT0gJ0J1ZmZlcicgJiYgQXJyYXkuaXNBcnJheShvYmouZGF0YSkpIHtcbiAgICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKG9iai5kYXRhKVxuICAgIH1cbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG11c3QgYmUgYSBzdHJpbmcsIEJ1ZmZlciwgQXJyYXlCdWZmZXIsIEFycmF5LCBvciBhcnJheS1saWtlIG9iamVjdC4nKVxufVxuXG5mdW5jdGlvbiBjaGVja2VkIChsZW5ndGgpIHtcbiAgLy8gTm90ZTogY2Fubm90IHVzZSBgbGVuZ3RoIDwgS19NQVhfTEVOR1RIYCBoZXJlIGJlY2F1c2UgdGhhdCBmYWlscyB3aGVuXG4gIC8vIGxlbmd0aCBpcyBOYU4gKHdoaWNoIGlzIG90aGVyd2lzZSBjb2VyY2VkIHRvIHplcm8uKVxuICBpZiAobGVuZ3RoID49IEtfTUFYX0xFTkdUSCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIGFsbG9jYXRlIEJ1ZmZlciBsYXJnZXIgdGhhbiBtYXhpbXVtICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICdzaXplOiAweCcgKyBLX01BWF9MRU5HVEgudG9TdHJpbmcoMTYpICsgJyBieXRlcycpXG4gIH1cbiAgcmV0dXJuIGxlbmd0aCB8IDBcbn1cblxuZnVuY3Rpb24gU2xvd0J1ZmZlciAobGVuZ3RoKSB7XG4gIGlmICgrbGVuZ3RoICE9IGxlbmd0aCkgeyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIGVxZXFlcVxuICAgIGxlbmd0aCA9IDBcbiAgfVxuICByZXR1cm4gQnVmZmVyLmFsbG9jKCtsZW5ndGgpXG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIGlzQnVmZmVyIChiKSB7XG4gIHJldHVybiBiICE9IG51bGwgJiYgYi5faXNCdWZmZXIgPT09IHRydWVcbn1cblxuQnVmZmVyLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlIChhLCBiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGEpIHx8ICFCdWZmZXIuaXNCdWZmZXIoYikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudHMgbXVzdCBiZSBCdWZmZXJzJylcbiAgfVxuXG4gIGlmIChhID09PSBiKSByZXR1cm4gMFxuXG4gIHZhciB4ID0gYS5sZW5ndGhcbiAgdmFyIHkgPSBiLmxlbmd0aFxuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBNYXRoLm1pbih4LCB5KTsgaSA8IGxlbjsgKytpKSB7XG4gICAgaWYgKGFbaV0gIT09IGJbaV0pIHtcbiAgICAgIHggPSBhW2ldXG4gICAgICB5ID0gYltpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbkJ1ZmZlci5pc0VuY29kaW5nID0gZnVuY3Rpb24gaXNFbmNvZGluZyAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnbGF0aW4xJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiBjb25jYXQgKGxpc3QsIGxlbmd0aCkge1xuICBpZiAoIUFycmF5LmlzQXJyYXkobGlzdCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICB9XG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIEJ1ZmZlci5hbGxvYygwKVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgbGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICBsZW5ndGggKz0gbGlzdFtpXS5sZW5ndGhcbiAgICB9XG4gIH1cblxuICB2YXIgYnVmZmVyID0gQnVmZmVyLmFsbG9jVW5zYWZlKGxlbmd0aClcbiAgdmFyIHBvcyA9IDBcbiAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgYnVmID0gbGlzdFtpXVxuICAgIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gICAgfVxuICAgIGJ1Zi5jb3B5KGJ1ZmZlciwgcG9zKVxuICAgIHBvcyArPSBidWYubGVuZ3RoXG4gIH1cbiAgcmV0dXJuIGJ1ZmZlclxufVxuXG5mdW5jdGlvbiBieXRlTGVuZ3RoIChzdHJpbmcsIGVuY29kaW5nKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIoc3RyaW5nKSkge1xuICAgIHJldHVybiBzdHJpbmcubGVuZ3RoXG4gIH1cbiAgaWYgKGlzQXJyYXlCdWZmZXJWaWV3KHN0cmluZykgfHwgc3RyaW5nIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICByZXR1cm4gc3RyaW5nLmJ5dGVMZW5ndGhcbiAgfVxuICBpZiAodHlwZW9mIHN0cmluZyAhPT0gJ3N0cmluZycpIHtcbiAgICBzdHJpbmcgPSAnJyArIHN0cmluZ1xuICB9XG5cbiAgdmFyIGxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKGxlbiA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBVc2UgYSBmb3IgbG9vcCB0byBhdm9pZCByZWN1cnNpb25cbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGVuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIGNhc2UgdW5kZWZpbmVkOlxuICAgICAgICByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiBsZW4gKiAyXG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gbGVuID4+PiAxXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSByZXR1cm4gdXRmOFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGggLy8gYXNzdW1lIHV0ZjhcbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cbkJ1ZmZlci5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuXG5mdW5jdGlvbiBzbG93VG9TdHJpbmcgKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG5cbiAgLy8gTm8gbmVlZCB0byB2ZXJpZnkgdGhhdCBcInRoaXMubGVuZ3RoIDw9IE1BWF9VSU5UMzJcIiBzaW5jZSBpdCdzIGEgcmVhZC1vbmx5XG4gIC8vIHByb3BlcnR5IG9mIGEgdHlwZWQgYXJyYXkuXG5cbiAgLy8gVGhpcyBiZWhhdmVzIG5laXRoZXIgbGlrZSBTdHJpbmcgbm9yIFVpbnQ4QXJyYXkgaW4gdGhhdCB3ZSBzZXQgc3RhcnQvZW5kXG4gIC8vIHRvIHRoZWlyIHVwcGVyL2xvd2VyIGJvdW5kcyBpZiB0aGUgdmFsdWUgcGFzc2VkIGlzIG91dCBvZiByYW5nZS5cbiAgLy8gdW5kZWZpbmVkIGlzIGhhbmRsZWQgc3BlY2lhbGx5IGFzIHBlciBFQ01BLTI2MiA2dGggRWRpdGlvbixcbiAgLy8gU2VjdGlvbiAxMy4zLjMuNyBSdW50aW1lIFNlbWFudGljczogS2V5ZWRCaW5kaW5nSW5pdGlhbGl6YXRpb24uXG4gIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkIHx8IHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ID0gMFxuICB9XG4gIC8vIFJldHVybiBlYXJseSBpZiBzdGFydCA+IHRoaXMubGVuZ3RoLiBEb25lIGhlcmUgdG8gcHJldmVudCBwb3RlbnRpYWwgdWludDMyXG4gIC8vIGNvZXJjaW9uIGZhaWwgYmVsb3cuXG4gIGlmIChzdGFydCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBpZiAoZW5kID09PSB1bmRlZmluZWQgfHwgZW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICB9XG5cbiAgaWYgKGVuZCA8PSAwKSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICAvLyBGb3JjZSBjb2Vyc2lvbiB0byB1aW50MzIuIFRoaXMgd2lsbCBhbHNvIGNvZXJjZSBmYWxzZXkvTmFOIHZhbHVlcyB0byAwLlxuICBlbmQgPj4+PSAwXG4gIHN0YXJ0ID4+Pj0gMFxuXG4gIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG5cbiAgd2hpbGUgKHRydWUpIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxhdGluMVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdXRmMTZsZVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9IChlbmNvZGluZyArICcnKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG4vLyBUaGlzIHByb3BlcnR5IGlzIHVzZWQgYnkgYEJ1ZmZlci5pc0J1ZmZlcmAgKGFuZCB0aGUgYGlzLWJ1ZmZlcmAgbnBtIHBhY2thZ2UpXG4vLyB0byBkZXRlY3QgYSBCdWZmZXIgaW5zdGFuY2UuIEl0J3Mgbm90IHBvc3NpYmxlIHRvIHVzZSBgaW5zdGFuY2VvZiBCdWZmZXJgXG4vLyByZWxpYWJseSBpbiBhIGJyb3dzZXJpZnkgY29udGV4dCBiZWNhdXNlIHRoZXJlIGNvdWxkIGJlIG11bHRpcGxlIGRpZmZlcmVudFxuLy8gY29waWVzIG9mIHRoZSAnYnVmZmVyJyBwYWNrYWdlIGluIHVzZS4gVGhpcyBtZXRob2Qgd29ya3MgZXZlbiBmb3IgQnVmZmVyXG4vLyBpbnN0YW5jZXMgdGhhdCB3ZXJlIGNyZWF0ZWQgZnJvbSBhbm90aGVyIGNvcHkgb2YgdGhlIGBidWZmZXJgIHBhY2thZ2UuXG4vLyBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL2lzc3Vlcy8xNTRcbkJ1ZmZlci5wcm90b3R5cGUuX2lzQnVmZmVyID0gdHJ1ZVxuXG5mdW5jdGlvbiBzd2FwIChiLCBuLCBtKSB7XG4gIHZhciBpID0gYltuXVxuICBiW25dID0gYlttXVxuICBiW21dID0gaVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXAxNiA9IGZ1bmN0aW9uIHN3YXAxNiAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgMiAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMTYtYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gMikge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDEpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMzIgPSBmdW5jdGlvbiBzd2FwMzIgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDQgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDMyLWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDQpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyAzKVxuICAgIHN3YXAodGhpcywgaSArIDEsIGkgKyAyKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDY0ID0gZnVuY3Rpb24gc3dhcDY0ICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSA4ICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiA2NC1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSA4KSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgNylcbiAgICBzd2FwKHRoaXMsIGkgKyAxLCBpICsgNilcbiAgICBzd2FwKHRoaXMsIGkgKyAyLCBpICsgNSlcbiAgICBzd2FwKHRoaXMsIGkgKyAzLCBpICsgNClcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gdG9TdHJpbmcgKCkge1xuICB2YXIgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbmd0aCA9PT0gMCkgcmV0dXJuICcnXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIDAsIGxlbmd0aClcbiAgcmV0dXJuIHNsb3dUb1N0cmluZy5hcHBseSh0aGlzLCBhcmd1bWVudHMpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24gZXF1YWxzIChiKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGIpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgaWYgKHRoaXMgPT09IGIpIHJldHVybiB0cnVlXG4gIHJldHVybiBCdWZmZXIuY29tcGFyZSh0aGlzLCBiKSA9PT0gMFxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluc3BlY3QgPSBmdW5jdGlvbiBpbnNwZWN0ICgpIHtcbiAgdmFyIHN0ciA9ICcnXG4gIHZhciBtYXggPSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTXG4gIGlmICh0aGlzLmxlbmd0aCA+IDApIHtcbiAgICBzdHIgPSB0aGlzLnRvU3RyaW5nKCdoZXgnLCAwLCBtYXgpLm1hdGNoKC8uezJ9L2cpLmpvaW4oJyAnKVxuICAgIGlmICh0aGlzLmxlbmd0aCA+IG1heCkgc3RyICs9ICcgLi4uICdcbiAgfVxuICByZXR1cm4gJzxCdWZmZXIgJyArIHN0ciArICc+J1xufVxuXG5CdWZmZXIucHJvdG90eXBlLmNvbXBhcmUgPSBmdW5jdGlvbiBjb21wYXJlICh0YXJnZXQsIHN0YXJ0LCBlbmQsIHRoaXNTdGFydCwgdGhpc0VuZCkge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcih0YXJnZXQpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIH1cblxuICBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHN0YXJ0ID0gMFxuICB9XG4gIGlmIChlbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuZCA9IHRhcmdldCA/IHRhcmdldC5sZW5ndGggOiAwXG4gIH1cbiAgaWYgKHRoaXNTdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc1N0YXJ0ID0gMFxuICB9XG4gIGlmICh0aGlzRW5kID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzRW5kID0gdGhpcy5sZW5ndGhcbiAgfVxuXG4gIGlmIChzdGFydCA8IDAgfHwgZW5kID4gdGFyZ2V0Lmxlbmd0aCB8fCB0aGlzU3RhcnQgPCAwIHx8IHRoaXNFbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdvdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKHRoaXNTdGFydCA+PSB0aGlzRW5kICYmIHN0YXJ0ID49IGVuZCkge1xuICAgIHJldHVybiAwXG4gIH1cbiAgaWYgKHRoaXNTdGFydCA+PSB0aGlzRW5kKSB7XG4gICAgcmV0dXJuIC0xXG4gIH1cbiAgaWYgKHN0YXJ0ID49IGVuZCkge1xuICAgIHJldHVybiAxXG4gIH1cblxuICBzdGFydCA+Pj49IDBcbiAgZW5kID4+Pj0gMFxuICB0aGlzU3RhcnQgPj4+PSAwXG4gIHRoaXNFbmQgPj4+PSAwXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCkgcmV0dXJuIDBcblxuICB2YXIgeCA9IHRoaXNFbmQgLSB0aGlzU3RhcnRcbiAgdmFyIHkgPSBlbmQgLSBzdGFydFxuICB2YXIgbGVuID0gTWF0aC5taW4oeCwgeSlcblxuICB2YXIgdGhpc0NvcHkgPSB0aGlzLnNsaWNlKHRoaXNTdGFydCwgdGhpc0VuZClcbiAgdmFyIHRhcmdldENvcHkgPSB0YXJnZXQuc2xpY2Uoc3RhcnQsIGVuZClcblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgaWYgKHRoaXNDb3B5W2ldICE9PSB0YXJnZXRDb3B5W2ldKSB7XG4gICAgICB4ID0gdGhpc0NvcHlbaV1cbiAgICAgIHkgPSB0YXJnZXRDb3B5W2ldXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuLy8gRmluZHMgZWl0aGVyIHRoZSBmaXJzdCBpbmRleCBvZiBgdmFsYCBpbiBgYnVmZmVyYCBhdCBvZmZzZXQgPj0gYGJ5dGVPZmZzZXRgLFxuLy8gT1IgdGhlIGxhc3QgaW5kZXggb2YgYHZhbGAgaW4gYGJ1ZmZlcmAgYXQgb2Zmc2V0IDw9IGBieXRlT2Zmc2V0YC5cbi8vXG4vLyBBcmd1bWVudHM6XG4vLyAtIGJ1ZmZlciAtIGEgQnVmZmVyIHRvIHNlYXJjaFxuLy8gLSB2YWwgLSBhIHN0cmluZywgQnVmZmVyLCBvciBudW1iZXJcbi8vIC0gYnl0ZU9mZnNldCAtIGFuIGluZGV4IGludG8gYGJ1ZmZlcmA7IHdpbGwgYmUgY2xhbXBlZCB0byBhbiBpbnQzMlxuLy8gLSBlbmNvZGluZyAtIGFuIG9wdGlvbmFsIGVuY29kaW5nLCByZWxldmFudCBpcyB2YWwgaXMgYSBzdHJpbmdcbi8vIC0gZGlyIC0gdHJ1ZSBmb3IgaW5kZXhPZiwgZmFsc2UgZm9yIGxhc3RJbmRleE9mXG5mdW5jdGlvbiBiaWRpcmVjdGlvbmFsSW5kZXhPZiAoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpIHtcbiAgLy8gRW1wdHkgYnVmZmVyIG1lYW5zIG5vIG1hdGNoXG4gIGlmIChidWZmZXIubGVuZ3RoID09PSAwKSByZXR1cm4gLTFcblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldFxuICBpZiAodHlwZW9mIGJ5dGVPZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBieXRlT2Zmc2V0XG4gICAgYnl0ZU9mZnNldCA9IDBcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0ID4gMHg3ZmZmZmZmZikge1xuICAgIGJ5dGVPZmZzZXQgPSAweDdmZmZmZmZmXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA8IC0weDgwMDAwMDAwKSB7XG4gICAgYnl0ZU9mZnNldCA9IC0weDgwMDAwMDAwXG4gIH1cbiAgYnl0ZU9mZnNldCA9ICtieXRlT2Zmc2V0ICAvLyBDb2VyY2UgdG8gTnVtYmVyLlxuICBpZiAobnVtYmVySXNOYU4oYnl0ZU9mZnNldCkpIHtcbiAgICAvLyBieXRlT2Zmc2V0OiBpdCBpdCdzIHVuZGVmaW5lZCwgbnVsbCwgTmFOLCBcImZvb1wiLCBldGMsIHNlYXJjaCB3aG9sZSBidWZmZXJcbiAgICBieXRlT2Zmc2V0ID0gZGlyID8gMCA6IChidWZmZXIubGVuZ3RoIC0gMSlcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSBieXRlT2Zmc2V0OiBuZWdhdGl2ZSBvZmZzZXRzIHN0YXJ0IGZyb20gdGhlIGVuZCBvZiB0aGUgYnVmZmVyXG4gIGlmIChieXRlT2Zmc2V0IDwgMCkgYnl0ZU9mZnNldCA9IGJ1ZmZlci5sZW5ndGggKyBieXRlT2Zmc2V0XG4gIGlmIChieXRlT2Zmc2V0ID49IGJ1ZmZlci5sZW5ndGgpIHtcbiAgICBpZiAoZGlyKSByZXR1cm4gLTFcbiAgICBlbHNlIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoIC0gMVxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAwKSB7XG4gICAgaWYgKGRpcikgYnl0ZU9mZnNldCA9IDBcbiAgICBlbHNlIHJldHVybiAtMVxuICB9XG5cbiAgLy8gTm9ybWFsaXplIHZhbFxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWwgPSBCdWZmZXIuZnJvbSh2YWwsIGVuY29kaW5nKVxuICB9XG5cbiAgLy8gRmluYWxseSwgc2VhcmNoIGVpdGhlciBpbmRleE9mIChpZiBkaXIgaXMgdHJ1ZSkgb3IgbGFzdEluZGV4T2ZcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcih2YWwpKSB7XG4gICAgLy8gU3BlY2lhbCBjYXNlOiBsb29raW5nIGZvciBlbXB0eSBzdHJpbmcvYnVmZmVyIGFsd2F5cyBmYWlsc1xuICAgIGlmICh2YWwubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gLTFcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5SW5kZXhPZihidWZmZXIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcilcbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHZhbCA9IHZhbCAmIDB4RkYgLy8gU2VhcmNoIGZvciBhIGJ5dGUgdmFsdWUgWzAtMjU1XVxuICAgIGlmICh0eXBlb2YgVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgaWYgKGRpcikge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5wcm90b3R5cGUuaW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmxhc3RJbmRleE9mLmNhbGwoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCBbIHZhbCBdLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcigndmFsIG11c3QgYmUgc3RyaW5nLCBudW1iZXIgb3IgQnVmZmVyJylcbn1cblxuZnVuY3Rpb24gYXJyYXlJbmRleE9mIChhcnIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcikge1xuICB2YXIgaW5kZXhTaXplID0gMVxuICB2YXIgYXJyTGVuZ3RoID0gYXJyLmxlbmd0aFxuICB2YXIgdmFsTGVuZ3RoID0gdmFsLmxlbmd0aFxuXG4gIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jb2RpbmcgPSBTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICBpZiAoZW5jb2RpbmcgPT09ICd1Y3MyJyB8fCBlbmNvZGluZyA9PT0gJ3Vjcy0yJyB8fFxuICAgICAgICBlbmNvZGluZyA9PT0gJ3V0ZjE2bGUnIHx8IGVuY29kaW5nID09PSAndXRmLTE2bGUnKSB7XG4gICAgICBpZiAoYXJyLmxlbmd0aCA8IDIgfHwgdmFsLmxlbmd0aCA8IDIpIHtcbiAgICAgICAgcmV0dXJuIC0xXG4gICAgICB9XG4gICAgICBpbmRleFNpemUgPSAyXG4gICAgICBhcnJMZW5ndGggLz0gMlxuICAgICAgdmFsTGVuZ3RoIC89IDJcbiAgICAgIGJ5dGVPZmZzZXQgLz0gMlxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlYWQgKGJ1ZiwgaSkge1xuICAgIGlmIChpbmRleFNpemUgPT09IDEpIHtcbiAgICAgIHJldHVybiBidWZbaV1cbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGJ1Zi5yZWFkVUludDE2QkUoaSAqIGluZGV4U2l6ZSlcbiAgICB9XG4gIH1cblxuICB2YXIgaVxuICBpZiAoZGlyKSB7XG4gICAgdmFyIGZvdW5kSW5kZXggPSAtMVxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPCBhcnJMZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHJlYWQoYXJyLCBpKSA9PT0gcmVhZCh2YWwsIGZvdW5kSW5kZXggPT09IC0xID8gMCA6IGkgLSBmb3VuZEluZGV4KSkge1xuICAgICAgICBpZiAoZm91bmRJbmRleCA9PT0gLTEpIGZvdW5kSW5kZXggPSBpXG4gICAgICAgIGlmIChpIC0gZm91bmRJbmRleCArIDEgPT09IHZhbExlbmd0aCkgcmV0dXJuIGZvdW5kSW5kZXggKiBpbmRleFNpemVcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ICE9PSAtMSkgaSAtPSBpIC0gZm91bmRJbmRleFxuICAgICAgICBmb3VuZEluZGV4ID0gLTFcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgaWYgKGJ5dGVPZmZzZXQgKyB2YWxMZW5ndGggPiBhcnJMZW5ndGgpIGJ5dGVPZmZzZXQgPSBhcnJMZW5ndGggLSB2YWxMZW5ndGhcbiAgICBmb3IgKGkgPSBieXRlT2Zmc2V0OyBpID49IDA7IGktLSkge1xuICAgICAgdmFyIGZvdW5kID0gdHJ1ZVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB2YWxMZW5ndGg7IGorKykge1xuICAgICAgICBpZiAocmVhZChhcnIsIGkgKyBqKSAhPT0gcmVhZCh2YWwsIGopKSB7XG4gICAgICAgICAgZm91bmQgPSBmYWxzZVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChmb3VuZCkgcmV0dXJuIGlcbiAgICB9XG4gIH1cblxuICByZXR1cm4gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmNsdWRlcyA9IGZ1bmN0aW9uIGluY2x1ZGVzICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiB0aGlzLmluZGV4T2YodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykgIT09IC0xXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5kZXhPZiA9IGZ1bmN0aW9uIGluZGV4T2YgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGJpZGlyZWN0aW9uYWxJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIHRydWUpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUubGFzdEluZGV4T2YgPSBmdW5jdGlvbiBsYXN0SW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZmFsc2UpXG59XG5cbmZ1bmN0aW9uIGhleFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgb2Zmc2V0ID0gTnVtYmVyKG9mZnNldCkgfHwgMFxuICB2YXIgcmVtYWluaW5nID0gYnVmLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG5cbiAgLy8gbXVzdCBiZSBhbiBldmVuIG51bWJlciBvZiBkaWdpdHNcbiAgdmFyIHN0ckxlbiA9IHN0cmluZy5sZW5ndGhcbiAgaWYgKHN0ckxlbiAlIDIgIT09IDApIHRocm93IG5ldyBUeXBlRXJyb3IoJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIHZhciBwYXJzZWQgPSBwYXJzZUludChzdHJpbmcuc3Vic3RyKGkgKiAyLCAyKSwgMTYpXG4gICAgaWYgKG51bWJlcklzTmFOKHBhcnNlZCkpIHJldHVybiBpXG4gICAgYnVmW29mZnNldCArIGldID0gcGFyc2VkXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gdXRmOFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGFzY2lpVG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBsYXRpbjFXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBhc2NpaVdyaXRlKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihiYXNlNjRUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIHVjczJXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjE2bGVUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGUgPSBmdW5jdGlvbiB3cml0ZSAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpIHtcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZylcbiAgaWYgKG9mZnNldCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgZW5jb2RpbmcpXG4gIH0gZWxzZSBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgJiYgdHlwZW9mIG9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9IG9mZnNldFxuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBvZmZzZXRbLCBsZW5ndGhdWywgZW5jb2RpbmddKVxuICB9IGVsc2UgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgICBpZiAoaXNGaW5pdGUobGVuZ3RoKSkge1xuICAgICAgbGVuZ3RoID0gbGVuZ3RoID4+PiAwXG4gICAgICBpZiAoZW5jb2RpbmcgPT09IHVuZGVmaW5lZCkgZW5jb2RpbmcgPSAndXRmOCdcbiAgICB9IGVsc2Uge1xuICAgICAgZW5jb2RpbmcgPSBsZW5ndGhcbiAgICAgIGxlbmd0aCA9IHVuZGVmaW5lZFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAnQnVmZmVyLndyaXRlKHN0cmluZywgZW5jb2RpbmcsIG9mZnNldFssIGxlbmd0aF0pIGlzIG5vIGxvbmdlciBzdXBwb3J0ZWQnXG4gICAgKVxuICB9XG5cbiAgdmFyIHJlbWFpbmluZyA9IHRoaXMubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCB8fCBsZW5ndGggPiByZW1haW5pbmcpIGxlbmd0aCA9IHJlbWFpbmluZ1xuXG4gIGlmICgoc3RyaW5nLmxlbmd0aCA+IDAgJiYgKGxlbmd0aCA8IDAgfHwgb2Zmc2V0IDwgMCkpIHx8IG9mZnNldCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gd3JpdGUgb3V0c2lkZSBidWZmZXIgYm91bmRzJylcbiAgfVxuXG4gIGlmICghZW5jb2RpbmcpIGVuY29kaW5nID0gJ3V0ZjgnXG5cbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcbiAgZm9yICg7Oykge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBoZXhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICAgIHJldHVybiBhc2NpaVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGF0aW4xV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgLy8gV2FybmluZzogbWF4TGVuZ3RoIG5vdCB0YWtlbiBpbnRvIGFjY291bnQgaW4gYmFzZTY0V3JpdGVcbiAgICAgICAgcmV0dXJuIGJhc2U2NFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1Y3MyV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKCcnICsgZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9KU09OID0gZnVuY3Rpb24gdG9KU09OICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG5mdW5jdGlvbiBiYXNlNjRTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGlmIChzdGFydCA9PT0gMCAmJiBlbmQgPT09IGJ1Zi5sZW5ndGgpIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmKVxuICB9IGVsc2Uge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYuc2xpY2Uoc3RhcnQsIGVuZCkpXG4gIH1cbn1cblxuZnVuY3Rpb24gdXRmOFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuICB2YXIgcmVzID0gW11cblxuICB2YXIgaSA9IHN0YXJ0XG4gIHdoaWxlIChpIDwgZW5kKSB7XG4gICAgdmFyIGZpcnN0Qnl0ZSA9IGJ1ZltpXVxuICAgIHZhciBjb2RlUG9pbnQgPSBudWxsXG4gICAgdmFyIGJ5dGVzUGVyU2VxdWVuY2UgPSAoZmlyc3RCeXRlID4gMHhFRikgPyA0XG4gICAgICA6IChmaXJzdEJ5dGUgPiAweERGKSA/IDNcbiAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4QkYpID8gMlxuICAgICAgOiAxXG5cbiAgICBpZiAoaSArIGJ5dGVzUGVyU2VxdWVuY2UgPD0gZW5kKSB7XG4gICAgICB2YXIgc2Vjb25kQnl0ZSwgdGhpcmRCeXRlLCBmb3VydGhCeXRlLCB0ZW1wQ29kZVBvaW50XG5cbiAgICAgIHN3aXRjaCAoYnl0ZXNQZXJTZXF1ZW5jZSkge1xuICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgaWYgKGZpcnN0Qnl0ZSA8IDB4ODApIHtcbiAgICAgICAgICAgIGNvZGVQb2ludCA9IGZpcnN0Qnl0ZVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDI6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweDFGKSA8PCAweDYgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0YpIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICB0aGlyZEJ5dGUgPSBidWZbaSArIDJdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHhDIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweDYgfCAodGhpcmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3RkYgJiYgKHRlbXBDb2RlUG9pbnQgPCAweEQ4MDAgfHwgdGVtcENvZGVQb2ludCA+IDB4REZGRikpIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBicmVha1xuICAgICAgICBjYXNlIDQ6XG4gICAgICAgICAgc2Vjb25kQnl0ZSA9IGJ1ZltpICsgMV1cbiAgICAgICAgICB0aGlyZEJ5dGUgPSBidWZbaSArIDJdXG4gICAgICAgICAgZm91cnRoQnl0ZSA9IGJ1ZltpICsgM11cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKGZvdXJ0aEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4MTIgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4QyB8ICh0aGlyZEJ5dGUgJiAweDNGKSA8PCAweDYgfCAoZm91cnRoQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4RkZGRiAmJiB0ZW1wQ29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgICAgICAgICAgY29kZVBvaW50ID0gdGVtcENvZGVQb2ludFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY29kZVBvaW50ID09PSBudWxsKSB7XG4gICAgICAvLyB3ZSBkaWQgbm90IGdlbmVyYXRlIGEgdmFsaWQgY29kZVBvaW50IHNvIGluc2VydCBhXG4gICAgICAvLyByZXBsYWNlbWVudCBjaGFyIChVK0ZGRkQpIGFuZCBhZHZhbmNlIG9ubHkgMSBieXRlXG4gICAgICBjb2RlUG9pbnQgPSAweEZGRkRcbiAgICAgIGJ5dGVzUGVyU2VxdWVuY2UgPSAxXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPiAweEZGRkYpIHtcbiAgICAgIC8vIGVuY29kZSB0byB1dGYxNiAoc3Vycm9nYXRlIHBhaXIgZGFuY2UpXG4gICAgICBjb2RlUG9pbnQgLT0gMHgxMDAwMFxuICAgICAgcmVzLnB1c2goY29kZVBvaW50ID4+PiAxMCAmIDB4M0ZGIHwgMHhEODAwKVxuICAgICAgY29kZVBvaW50ID0gMHhEQzAwIHwgY29kZVBvaW50ICYgMHgzRkZcbiAgICB9XG5cbiAgICByZXMucHVzaChjb2RlUG9pbnQpXG4gICAgaSArPSBieXRlc1BlclNlcXVlbmNlXG4gIH1cblxuICByZXR1cm4gZGVjb2RlQ29kZVBvaW50c0FycmF5KHJlcylcbn1cblxuLy8gQmFzZWQgb24gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMjI3NDcyNzIvNjgwNzQyLCB0aGUgYnJvd3NlciB3aXRoXG4vLyB0aGUgbG93ZXN0IGxpbWl0IGlzIENocm9tZSwgd2l0aCAweDEwMDAwIGFyZ3MuXG4vLyBXZSBnbyAxIG1hZ25pdHVkZSBsZXNzLCBmb3Igc2FmZXR5XG52YXIgTUFYX0FSR1VNRU5UU19MRU5HVEggPSAweDEwMDBcblxuZnVuY3Rpb24gZGVjb2RlQ29kZVBvaW50c0FycmF5IChjb2RlUG9pbnRzKSB7XG4gIHZhciBsZW4gPSBjb2RlUG9pbnRzLmxlbmd0aFxuICBpZiAobGVuIDw9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKSB7XG4gICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoU3RyaW5nLCBjb2RlUG9pbnRzKSAvLyBhdm9pZCBleHRyYSBzbGljZSgpXG4gIH1cblxuICAvLyBEZWNvZGUgaW4gY2h1bmtzIHRvIGF2b2lkIFwiY2FsbCBzdGFjayBzaXplIGV4Y2VlZGVkXCIuXG4gIHZhciByZXMgPSAnJ1xuICB2YXIgaSA9IDBcbiAgd2hpbGUgKGkgPCBsZW4pIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShcbiAgICAgIFN0cmluZyxcbiAgICAgIGNvZGVQb2ludHMuc2xpY2UoaSwgaSArPSBNQVhfQVJHVU1FTlRTX0xFTkdUSClcbiAgICApXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSAmIDB4N0YpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBsYXRpbjFTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0pXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBoZXhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG5cbiAgaWYgKCFzdGFydCB8fCBzdGFydCA8IDApIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCB8fCBlbmQgPCAwIHx8IGVuZCA+IGxlbikgZW5kID0gbGVuXG5cbiAgdmFyIG91dCA9ICcnXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgb3V0ICs9IHRvSGV4KGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gb3V0XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciBieXRlcyA9IGJ1Zi5zbGljZShzdGFydCwgZW5kKVxuICB2YXIgcmVzID0gJydcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBieXRlcy5sZW5ndGg7IGkgKz0gMikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ5dGVzW2ldICsgKGJ5dGVzW2kgKyAxXSAqIDI1NikpXG4gIH1cbiAgcmV0dXJuIHJlc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnNsaWNlID0gZnVuY3Rpb24gc2xpY2UgKHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIHN0YXJ0ID0gfn5zdGFydFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IGxlbiA6IH5+ZW5kXG5cbiAgaWYgKHN0YXJ0IDwgMCkge1xuICAgIHN0YXJ0ICs9IGxlblxuICAgIGlmIChzdGFydCA8IDApIHN0YXJ0ID0gMFxuICB9IGVsc2UgaWYgKHN0YXJ0ID4gbGVuKSB7XG4gICAgc3RhcnQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCAwKSB7XG4gICAgZW5kICs9IGxlblxuICAgIGlmIChlbmQgPCAwKSBlbmQgPSAwXG4gIH0gZWxzZSBpZiAoZW5kID4gbGVuKSB7XG4gICAgZW5kID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgdmFyIG5ld0J1ZiA9IHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZClcbiAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2VcbiAgbmV3QnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgcmV0dXJuIG5ld0J1ZlxufVxuXG4vKlxuICogTmVlZCB0byBtYWtlIHN1cmUgdGhhdCBidWZmZXIgaXNuJ3QgdHJ5aW5nIHRvIHdyaXRlIG91dCBvZiBib3VuZHMuXG4gKi9cbmZ1bmN0aW9uIGNoZWNrT2Zmc2V0IChvZmZzZXQsIGV4dCwgbGVuZ3RoKSB7XG4gIGlmICgob2Zmc2V0ICUgMSkgIT09IDAgfHwgb2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ29mZnNldCBpcyBub3QgdWludCcpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBsZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdUcnlpbmcgdG8gYWNjZXNzIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludExFID0gZnVuY3Rpb24gcmVhZFVJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRCRSA9IGZ1bmN0aW9uIHJlYWRVSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuICB9XG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXVxuICB2YXIgbXVsID0gMVxuICB3aGlsZSAoYnl0ZUxlbmd0aCA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdICogbXVsXG4gIH1cblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQ4ID0gZnVuY3Rpb24gcmVhZFVJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkxFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiByZWFkVUludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDgpIHwgdGhpc1tvZmZzZXQgKyAxXVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRVSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKCh0aGlzW29mZnNldF0pIHxcbiAgICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSkgK1xuICAgICAgKHRoaXNbb2Zmc2V0ICsgM10gKiAweDEwMDAwMDApXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkJFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdICogMHgxMDAwMDAwKSArXG4gICAgKCh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgIHRoaXNbb2Zmc2V0ICsgM10pXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludExFID0gZnVuY3Rpb24gcmVhZEludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF1cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRCRSA9IGZ1bmN0aW9uIHJlYWRJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgaSA9IGJ5dGVMZW5ndGhcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgLS1pXVxuICB3aGlsZSAoaSA+IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyAtLWldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50OCA9IGZ1bmN0aW9uIHJlYWRJbnQ4IChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDEsIHRoaXMubGVuZ3RoKVxuICBpZiAoISh0aGlzW29mZnNldF0gJiAweDgwKSkgcmV0dXJuICh0aGlzW29mZnNldF0pXG4gIHJldHVybiAoKDB4ZmYgLSB0aGlzW29mZnNldF0gKyAxKSAqIC0xKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkxFID0gZnVuY3Rpb24gcmVhZEludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiByZWFkSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0ICsgMV0gfCAodGhpc1tvZmZzZXRdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdKSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10gPDwgMjQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiByZWFkSW50MzJCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCAyNCkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDE2KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgOCkgfFxuICAgICh0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gcmVhZEZsb2F0TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdEJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIHJlYWREb3VibGVCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA4LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCA1MiwgOClcbn1cblxuZnVuY3Rpb24gY2hlY2tJbnQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImJ1ZmZlclwiIGFyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXIgaW5zdGFuY2UnKVxuICBpZiAodmFsdWUgPiBtYXggfHwgdmFsdWUgPCBtaW4pIHRocm93IG5ldyBSYW5nZUVycm9yKCdcInZhbHVlXCIgYXJndW1lbnQgaXMgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlVUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbWF4Qnl0ZXMgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCkgLSAxXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbWF4Qnl0ZXMsIDApXG4gIH1cblxuICB2YXIgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIHZhciBtdWwgPSAxXG4gIHRoaXNbb2Zmc2V0ICsgaV0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKC0taSA+PSAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDggPSBmdW5jdGlvbiB3cml0ZVVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHhmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4ZmZmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQzMkJFID0gZnVuY3Rpb24gd3JpdGVVSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4ZmZmZmZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludExFID0gZnVuY3Rpb24gd3JpdGVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCAoOCAqIGJ5dGVMZW5ndGgpIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgdmFyIGkgPSAwXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSAtIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlSW50QkUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIGxpbWl0ID0gTWF0aC5wb3coMiwgKDggKiBieXRlTGVuZ3RoKSAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHN1YiA9IDBcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICBpZiAodmFsdWUgPCAwICYmIHN1YiA9PT0gMCAmJiB0aGlzW29mZnNldCArIGkgKyAxXSAhPT0gMCkge1xuICAgICAgc3ViID0gMVxuICAgIH1cbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50OCA9IGZ1bmN0aW9uIHdyaXRlSW50OCAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4N2YsIC0weDgwKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmYgKyB2YWx1ZSArIDFcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkJFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZmZmZmZmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbmZ1bmN0aW9uIGNoZWNrSUVFRTc1NCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmIChvZmZzZXQgKyBleHQgPiBidWYubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbiAgaWYgKG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5mdW5jdGlvbiB3cml0ZUZsb2F0IChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA0LCAzLjQwMjgyMzQ2NjM4NTI4ODZlKzM4LCAtMy40MDI4MjM0NjYzODUyODg2ZSszOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRCRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiB3cml0ZURvdWJsZSAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgOCwgMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgsIC0xLjc5NzY5MzEzNDg2MjMxNTdFKzMwOClcbiAgfVxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbiAgcmV0dXJuIG9mZnNldCArIDhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlQkUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiBjb3B5ICh0YXJnZXQsIHRhcmdldFN0YXJ0LCBzdGFydCwgZW5kKSB7XG4gIGlmICghc3RhcnQpIHN0YXJ0ID0gMFxuICBpZiAoIWVuZCAmJiBlbmQgIT09IDApIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXRTdGFydCA+PSB0YXJnZXQubGVuZ3RoKSB0YXJnZXRTdGFydCA9IHRhcmdldC5sZW5ndGhcbiAgaWYgKCF0YXJnZXRTdGFydCkgdGFyZ2V0U3RhcnQgPSAwXG4gIGlmIChlbmQgPiAwICYmIGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuIDBcbiAgaWYgKHRhcmdldC5sZW5ndGggPT09IDAgfHwgdGhpcy5sZW5ndGggPT09IDApIHJldHVybiAwXG5cbiAgLy8gRmF0YWwgZXJyb3IgY29uZGl0aW9uc1xuICBpZiAodGFyZ2V0U3RhcnQgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3RhcmdldFN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICB9XG4gIGlmIChzdGFydCA8IDAgfHwgc3RhcnQgPj0gdGhpcy5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgaWYgKGVuZCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0IDwgZW5kIC0gc3RhcnQpIHtcbiAgICBlbmQgPSB0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgKyBzdGFydFxuICB9XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG4gIHZhciBpXG5cbiAgaWYgKHRoaXMgPT09IHRhcmdldCAmJiBzdGFydCA8IHRhcmdldFN0YXJ0ICYmIHRhcmdldFN0YXJ0IDwgZW5kKSB7XG4gICAgLy8gZGVzY2VuZGluZyBjb3B5IGZyb20gZW5kXG4gICAgZm9yIChpID0gbGVuIC0gMTsgaSA+PSAwOyAtLWkpIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0U3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2UgaWYgKGxlbiA8IDEwMDApIHtcbiAgICAvLyBhc2NlbmRpbmcgY29weSBmcm9tIHN0YXJ0XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgKytpKSB7XG4gICAgICB0YXJnZXRbaSArIHRhcmdldFN0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBVaW50OEFycmF5LnByb3RvdHlwZS5zZXQuY2FsbChcbiAgICAgIHRhcmdldCxcbiAgICAgIHRoaXMuc3ViYXJyYXkoc3RhcnQsIHN0YXJ0ICsgbGVuKSxcbiAgICAgIHRhcmdldFN0YXJ0XG4gICAgKVxuICB9XG5cbiAgcmV0dXJuIGxlblxufVxuXG4vLyBVc2FnZTpcbi8vICAgIGJ1ZmZlci5maWxsKG51bWJlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoYnVmZmVyWywgb2Zmc2V0WywgZW5kXV0pXG4vLyAgICBidWZmZXIuZmlsbChzdHJpbmdbLCBvZmZzZXRbLCBlbmRdXVssIGVuY29kaW5nXSlcbkJ1ZmZlci5wcm90b3R5cGUuZmlsbCA9IGZ1bmN0aW9uIGZpbGwgKHZhbCwgc3RhcnQsIGVuZCwgZW5jb2RpbmcpIHtcbiAgLy8gSGFuZGxlIHN0cmluZyBjYXNlczpcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKHR5cGVvZiBzdGFydCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gc3RhcnRcbiAgICAgIHN0YXJ0ID0gMFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBlbmQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IGVuZFxuICAgICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgICB9XG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDEpIHtcbiAgICAgIHZhciBjb2RlID0gdmFsLmNoYXJDb2RlQXQoMClcbiAgICAgIGlmIChjb2RlIDwgMjU2KSB7XG4gICAgICAgIHZhbCA9IGNvZGVcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGVuY29kaW5nICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignZW5jb2RpbmcgbXVzdCBiZSBhIHN0cmluZycpXG4gICAgfVxuICAgIGlmICh0eXBlb2YgZW5jb2RpbmcgPT09ICdzdHJpbmcnICYmICFCdWZmZXIuaXNFbmNvZGluZyhlbmNvZGluZykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAyNTVcbiAgfVxuXG4gIC8vIEludmFsaWQgcmFuZ2VzIGFyZSBub3Qgc2V0IHRvIGEgZGVmYXVsdCwgc28gY2FuIHJhbmdlIGNoZWNrIGVhcmx5LlxuICBpZiAoc3RhcnQgPCAwIHx8IHRoaXMubGVuZ3RoIDwgc3RhcnQgfHwgdGhpcy5sZW5ndGggPCBlbmQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignT3V0IG9mIHJhbmdlIGluZGV4JylcbiAgfVxuXG4gIGlmIChlbmQgPD0gc3RhcnQpIHtcbiAgICByZXR1cm4gdGhpc1xuICB9XG5cbiAgc3RhcnQgPSBzdGFydCA+Pj4gMFxuICBlbmQgPSBlbmQgPT09IHVuZGVmaW5lZCA/IHRoaXMubGVuZ3RoIDogZW5kID4+PiAwXG5cbiAgaWYgKCF2YWwpIHZhbCA9IDBcblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICBmb3IgKGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgICB0aGlzW2ldID0gdmFsXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHZhciBieXRlcyA9IEJ1ZmZlci5pc0J1ZmZlcih2YWwpXG4gICAgICA/IHZhbFxuICAgICAgOiBuZXcgQnVmZmVyKHZhbCwgZW5jb2RpbmcpXG4gICAgdmFyIGxlbiA9IGJ5dGVzLmxlbmd0aFxuICAgIGZvciAoaSA9IDA7IGkgPCBlbmQgLSBzdGFydDsgKytpKSB7XG4gICAgICB0aGlzW2kgKyBzdGFydF0gPSBieXRlc1tpICUgbGVuXVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzXG59XG5cbi8vIEhFTFBFUiBGVU5DVElPTlNcbi8vID09PT09PT09PT09PT09PT1cblxudmFyIElOVkFMSURfQkFTRTY0X1JFID0gL1teKy8wLTlBLVphLXotX10vZ1xuXG5mdW5jdGlvbiBiYXNlNjRjbGVhbiAoc3RyKSB7XG4gIC8vIE5vZGUgc3RyaXBzIG91dCBpbnZhbGlkIGNoYXJhY3RlcnMgbGlrZSBcXG4gYW5kIFxcdCBmcm9tIHRoZSBzdHJpbmcsIGJhc2U2NC1qcyBkb2VzIG5vdFxuICBzdHIgPSBzdHIudHJpbSgpLnJlcGxhY2UoSU5WQUxJRF9CQVNFNjRfUkUsICcnKVxuICAvLyBOb2RlIGNvbnZlcnRzIHN0cmluZ3Mgd2l0aCBsZW5ndGggPCAyIHRvICcnXG4gIGlmIChzdHIubGVuZ3RoIDwgMikgcmV0dXJuICcnXG4gIC8vIE5vZGUgYWxsb3dzIGZvciBub24tcGFkZGVkIGJhc2U2NCBzdHJpbmdzIChtaXNzaW5nIHRyYWlsaW5nID09PSksIGJhc2U2NC1qcyBkb2VzIG5vdFxuICB3aGlsZSAoc3RyLmxlbmd0aCAlIDQgIT09IDApIHtcbiAgICBzdHIgPSBzdHIgKyAnPSdcbiAgfVxuICByZXR1cm4gc3RyXG59XG5cbmZ1bmN0aW9uIHRvSGV4IChuKSB7XG4gIGlmIChuIDwgMTYpIHJldHVybiAnMCcgKyBuLnRvU3RyaW5nKDE2KVxuICByZXR1cm4gbi50b1N0cmluZygxNilcbn1cblxuZnVuY3Rpb24gdXRmOFRvQnl0ZXMgKHN0cmluZywgdW5pdHMpIHtcbiAgdW5pdHMgPSB1bml0cyB8fCBJbmZpbml0eVxuICB2YXIgY29kZVBvaW50XG4gIHZhciBsZW5ndGggPSBzdHJpbmcubGVuZ3RoXG4gIHZhciBsZWFkU3Vycm9nYXRlID0gbnVsbFxuICB2YXIgYnl0ZXMgPSBbXVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBjb2RlUG9pbnQgPSBzdHJpbmcuY2hhckNvZGVBdChpKVxuXG4gICAgLy8gaXMgc3Vycm9nYXRlIGNvbXBvbmVudFxuICAgIGlmIChjb2RlUG9pbnQgPiAweEQ3RkYgJiYgY29kZVBvaW50IDwgMHhFMDAwKSB7XG4gICAgICAvLyBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCFsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAgIC8vIG5vIGxlYWQgeWV0XG4gICAgICAgIGlmIChjb2RlUG9pbnQgPiAweERCRkYpIHtcbiAgICAgICAgICAvLyB1bmV4cGVjdGVkIHRyYWlsXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfSBlbHNlIGlmIChpICsgMSA9PT0gbGVuZ3RoKSB7XG4gICAgICAgICAgLy8gdW5wYWlyZWQgbGVhZFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH1cblxuICAgICAgICAvLyB2YWxpZCBsZWFkXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcblxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyAyIGxlYWRzIGluIGEgcm93XG4gICAgICBpZiAoY29kZVBvaW50IDwgMHhEQzAwKSB7XG4gICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIHZhbGlkIHN1cnJvZ2F0ZSBwYWlyXG4gICAgICBjb2RlUG9pbnQgPSAobGVhZFN1cnJvZ2F0ZSAtIDB4RDgwMCA8PCAxMCB8IGNvZGVQb2ludCAtIDB4REMwMCkgKyAweDEwMDAwXG4gICAgfSBlbHNlIGlmIChsZWFkU3Vycm9nYXRlKSB7XG4gICAgICAvLyB2YWxpZCBibXAgY2hhciwgYnV0IGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICB9XG5cbiAgICBsZWFkU3Vycm9nYXRlID0gbnVsbFxuXG4gICAgLy8gZW5jb2RlIHV0ZjhcbiAgICBpZiAoY29kZVBvaW50IDwgMHg4MCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAxKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKGNvZGVQb2ludClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4ODAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgfCAweEMwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAzKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDIHwgMHhFMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHgxMTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gNCkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4MTIgfCAweEYwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHhDICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGNvZGUgcG9pbnQnKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBieXRlc1xufVxuXG5mdW5jdGlvbiBhc2NpaVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICAvLyBOb2RlJ3MgY29kZSBzZWVtcyB0byBiZSBkb2luZyB0aGlzIGFuZCBub3QgJiAweDdGLi5cbiAgICBieXRlQXJyYXkucHVzaChzdHIuY2hhckNvZGVBdChpKSAmIDB4RkYpXG4gIH1cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiB1dGYxNmxlVG9CeXRlcyAoc3RyLCB1bml0cykge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuXG4gICAgYyA9IHN0ci5jaGFyQ29kZUF0KGkpXG4gICAgaGkgPSBjID4+IDhcbiAgICBsbyA9IGMgJSAyNTZcbiAgICBieXRlQXJyYXkucHVzaChsbylcbiAgICBieXRlQXJyYXkucHVzaChoaSlcbiAgfVxuXG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYmFzZTY0VG9CeXRlcyAoc3RyKSB7XG4gIHJldHVybiBiYXNlNjQudG9CeXRlQXJyYXkoYmFzZTY0Y2xlYW4oc3RyKSlcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKGkgKyBvZmZzZXQgPj0gZHN0Lmxlbmd0aCkgfHwgKGkgPj0gc3JjLmxlbmd0aCkpIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuLy8gTm9kZSAwLjEwIHN1cHBvcnRzIGBBcnJheUJ1ZmZlcmAgYnV0IGxhY2tzIGBBcnJheUJ1ZmZlci5pc1ZpZXdgXG5mdW5jdGlvbiBpc0FycmF5QnVmZmVyVmlldyAob2JqKSB7XG4gIHJldHVybiAodHlwZW9mIEFycmF5QnVmZmVyLmlzVmlldyA9PT0gJ2Z1bmN0aW9uJykgJiYgQXJyYXlCdWZmZXIuaXNWaWV3KG9iailcbn1cblxuZnVuY3Rpb24gbnVtYmVySXNOYU4gKG9iaikge1xuICByZXR1cm4gb2JqICE9PSBvYmogLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1zZWxmLWNvbXBhcmVcbn1cbiIsImV4cG9ydHMucmVhZCA9IGZ1bmN0aW9uIChidWZmZXIsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgbkJpdHMgPSAtN1xuICB2YXIgaSA9IGlzTEUgPyAobkJ5dGVzIC0gMSkgOiAwXG4gIHZhciBkID0gaXNMRSA/IC0xIDogMVxuICB2YXIgcyA9IGJ1ZmZlcltvZmZzZXQgKyBpXVxuXG4gIGkgKz0gZFxuXG4gIGUgPSBzICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIHMgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IGVMZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgZSA9IGUgKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBtID0gZSAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBlID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBtTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IG0gPSBtICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgaWYgKGUgPT09IDApIHtcbiAgICBlID0gMSAtIGVCaWFzXG4gIH0gZWxzZSBpZiAoZSA9PT0gZU1heCkge1xuICAgIHJldHVybiBtID8gTmFOIDogKChzID8gLTEgOiAxKSAqIEluZmluaXR5KVxuICB9IGVsc2Uge1xuICAgIG0gPSBtICsgTWF0aC5wb3coMiwgbUxlbilcbiAgICBlID0gZSAtIGVCaWFzXG4gIH1cbiAgcmV0dXJuIChzID8gLTEgOiAxKSAqIG0gKiBNYXRoLnBvdygyLCBlIC0gbUxlbilcbn1cblxuZXhwb3J0cy53cml0ZSA9IGZ1bmN0aW9uIChidWZmZXIsIHZhbHVlLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbSwgY1xuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIHJ0ID0gKG1MZW4gPT09IDIzID8gTWF0aC5wb3coMiwgLTI0KSAtIE1hdGgucG93KDIsIC03NykgOiAwKVxuICB2YXIgaSA9IGlzTEUgPyAwIDogKG5CeXRlcyAtIDEpXG4gIHZhciBkID0gaXNMRSA/IDEgOiAtMVxuICB2YXIgcyA9IHZhbHVlIDwgMCB8fCAodmFsdWUgPT09IDAgJiYgMSAvIHZhbHVlIDwgMCkgPyAxIDogMFxuXG4gIHZhbHVlID0gTWF0aC5hYnModmFsdWUpXG5cbiAgaWYgKGlzTmFOKHZhbHVlKSB8fCB2YWx1ZSA9PT0gSW5maW5pdHkpIHtcbiAgICBtID0gaXNOYU4odmFsdWUpID8gMSA6IDBcbiAgICBlID0gZU1heFxuICB9IGVsc2Uge1xuICAgIGUgPSBNYXRoLmZsb29yKE1hdGgubG9nKHZhbHVlKSAvIE1hdGguTE4yKVxuICAgIGlmICh2YWx1ZSAqIChjID0gTWF0aC5wb3coMiwgLWUpKSA8IDEpIHtcbiAgICAgIGUtLVxuICAgICAgYyAqPSAyXG4gICAgfVxuICAgIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgdmFsdWUgKz0gcnQgLyBjXG4gICAgfSBlbHNlIHtcbiAgICAgIHZhbHVlICs9IHJ0ICogTWF0aC5wb3coMiwgMSAtIGVCaWFzKVxuICAgIH1cbiAgICBpZiAodmFsdWUgKiBjID49IDIpIHtcbiAgICAgIGUrK1xuICAgICAgYyAvPSAyXG4gICAgfVxuXG4gICAgaWYgKGUgKyBlQmlhcyA+PSBlTWF4KSB7XG4gICAgICBtID0gMFxuICAgICAgZSA9IGVNYXhcbiAgICB9IGVsc2UgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICBtID0gKHZhbHVlICogYyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSBlICsgZUJpYXNcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IHZhbHVlICogTWF0aC5wb3coMiwgZUJpYXMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gMFxuICAgIH1cbiAgfVxuXG4gIGZvciAoOyBtTGVuID49IDg7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IG0gJiAweGZmLCBpICs9IGQsIG0gLz0gMjU2LCBtTGVuIC09IDgpIHt9XG5cbiAgZSA9IChlIDw8IG1MZW4pIHwgbVxuICBlTGVuICs9IG1MZW5cbiAgZm9yICg7IGVMZW4gPiAwOyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBlICYgMHhmZiwgaSArPSBkLCBlIC89IDI1NiwgZUxlbiAtPSA4KSB7fVxuXG4gIGJ1ZmZlcltvZmZzZXQgKyBpIC0gZF0gfD0gcyAqIDEyOFxufVxuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbi8vIGNhY2hlZCBmcm9tIHdoYXRldmVyIGdsb2JhbCBpcyBwcmVzZW50IHNvIHRoYXQgdGVzdCBydW5uZXJzIHRoYXQgc3R1YiBpdFxuLy8gZG9uJ3QgYnJlYWsgdGhpbmdzLiAgQnV0IHdlIG5lZWQgdG8gd3JhcCBpdCBpbiBhIHRyeSBjYXRjaCBpbiBjYXNlIGl0IGlzXG4vLyB3cmFwcGVkIGluIHN0cmljdCBtb2RlIGNvZGUgd2hpY2ggZG9lc24ndCBkZWZpbmUgYW55IGdsb2JhbHMuICBJdCdzIGluc2lkZSBhXG4vLyBmdW5jdGlvbiBiZWNhdXNlIHRyeS9jYXRjaGVzIGRlb3B0aW1pemUgaW4gY2VydGFpbiBlbmdpbmVzLlxuXG52YXIgY2FjaGVkU2V0VGltZW91dDtcbnZhciBjYWNoZWRDbGVhclRpbWVvdXQ7XG5cbmZ1bmN0aW9uIGRlZmF1bHRTZXRUaW1vdXQoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdzZXRUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG5mdW5jdGlvbiBkZWZhdWx0Q2xlYXJUaW1lb3V0ICgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2NsZWFyVGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuKGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIHNldFRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICBpZiAodHlwZW9mIGNsZWFyVGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gZGVmYXVsdENsZWFyVGltZW91dDtcbiAgICB9XG59ICgpKVxuZnVuY3Rpb24gcnVuVGltZW91dChmdW4pIHtcbiAgICBpZiAoY2FjaGVkU2V0VGltZW91dCA9PT0gc2V0VGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgLy8gaWYgc2V0VGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZFNldFRpbWVvdXQgPT09IGRlZmF1bHRTZXRUaW1vdXQgfHwgIWNhY2hlZFNldFRpbWVvdXQpICYmIHNldFRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9IGNhdGNoKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0IHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKG51bGwsIGZ1biwgMCk7XG4gICAgICAgIH0gY2F0Y2goZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvclxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbCh0aGlzLCBmdW4sIDApO1xuICAgICAgICB9XG4gICAgfVxuXG5cbn1cbmZ1bmN0aW9uIHJ1bkNsZWFyVGltZW91dChtYXJrZXIpIHtcbiAgICBpZiAoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgLy8gaWYgY2xlYXJUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkQ2xlYXJUaW1lb3V0ID09PSBkZWZhdWx0Q2xlYXJUaW1lb3V0IHx8ICFjYWNoZWRDbGVhclRpbWVvdXQpICYmIGNsZWFyVGltZW91dCkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIHJldHVybiBjbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfSBjYXRjaCAoZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgIHRydXN0IHRoZSBnbG9iYWwgb2JqZWN0IHdoZW4gY2FsbGVkIG5vcm1hbGx5XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwobnVsbCwgbWFya2VyKTtcbiAgICAgICAgfSBjYXRjaCAoZSl7XG4gICAgICAgICAgICAvLyBzYW1lIGFzIGFib3ZlIGJ1dCB3aGVuIGl0J3MgYSB2ZXJzaW9uIG9mIEkuRS4gdGhhdCBtdXN0IGhhdmUgdGhlIGdsb2JhbCBvYmplY3QgZm9yICd0aGlzJywgaG9wZnVsbHkgb3VyIGNvbnRleHQgY29ycmVjdCBvdGhlcndpc2UgaXQgd2lsbCB0aHJvdyBhIGdsb2JhbCBlcnJvci5cbiAgICAgICAgICAgIC8vIFNvbWUgdmVyc2lvbnMgb2YgSS5FLiBoYXZlIGRpZmZlcmVudCBydWxlcyBmb3IgY2xlYXJUaW1lb3V0IHZzIHNldFRpbWVvdXRcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbCh0aGlzLCBtYXJrZXIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cblxufVxudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcbnZhciBjdXJyZW50UXVldWU7XG52YXIgcXVldWVJbmRleCA9IC0xO1xuXG5mdW5jdGlvbiBjbGVhblVwTmV4dFRpY2soKSB7XG4gICAgaWYgKCFkcmFpbmluZyB8fCAhY3VycmVudFF1ZXVlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBpZiAoY3VycmVudFF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBxdWV1ZSA9IGN1cnJlbnRRdWV1ZS5jb25jYXQocXVldWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICB9XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICBkcmFpblF1ZXVlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciB0aW1lb3V0ID0gcnVuVGltZW91dChjbGVhblVwTmV4dFRpY2spO1xuICAgIGRyYWluaW5nID0gdHJ1ZTtcblxuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB3aGlsZSAoKytxdWV1ZUluZGV4IDwgbGVuKSB7XG4gICAgICAgICAgICBpZiAoY3VycmVudFF1ZXVlKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFF1ZXVlW3F1ZXVlSW5kZXhdLnJ1bigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHF1ZXVlSW5kZXggPSAtMTtcbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBjdXJyZW50UXVldWUgPSBudWxsO1xuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgcnVuQ2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xufVxuXG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHZhciBhcmdzID0gbmV3IEFycmF5KGFyZ3VtZW50cy5sZW5ndGggLSAxKTtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgfVxuICAgIHF1ZXVlLnB1c2gobmV3IEl0ZW0oZnVuLCBhcmdzKSk7XG4gICAgaWYgKHF1ZXVlLmxlbmd0aCA9PT0gMSAmJiAhZHJhaW5pbmcpIHtcbiAgICAgICAgcnVuVGltZW91dChkcmFpblF1ZXVlKTtcbiAgICB9XG59O1xuXG4vLyB2OCBsaWtlcyBwcmVkaWN0aWJsZSBvYmplY3RzXG5mdW5jdGlvbiBJdGVtKGZ1biwgYXJyYXkpIHtcbiAgICB0aGlzLmZ1biA9IGZ1bjtcbiAgICB0aGlzLmFycmF5ID0gYXJyYXk7XG59XG5JdGVtLnByb3RvdHlwZS5ydW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5mdW4uYXBwbHkobnVsbCwgdGhpcy5hcnJheSk7XG59O1xucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5wcmVwZW5kT25jZUxpc3RlbmVyID0gbm9vcDtcblxucHJvY2Vzcy5saXN0ZW5lcnMgPSBmdW5jdGlvbiAobmFtZSkgeyByZXR1cm4gW10gfVxuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xucHJvY2Vzcy51bWFzayA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gMDsgfTtcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdTVCcsICgpPT57XHJcbiAgICBpdCgnc2hvdWxkIGV4aXN0IGFzIGEgZ2xvYmFsIG9iamVjdCcsICgpPT57XHJcbiAgICAgICAgZXhwZWN0KFNUKS50by5iZS5hbignb2JqZWN0Jyk7XHJcbiAgICB9KTtcclxuICAgIHJlcXVpcmUoJy4vc3BlYycpO1xyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ0FwcCcsICgpPT57XHJcbiAgICBsZXQgYXBwID0gbmV3IFNULkFwcCgpO1xyXG5cclxuICAgIGl0KCdzaG91bGQgY3JlYXRlIGEgcGl4aSBjYW52YXMgb24gdGhlIHBhZ2UnLCAoKT0+e1xyXG4gICAgICAgIGV4cGVjdChkb2N1bWVudC5ib2R5LmNvbnRhaW5zKGFwcC5yZW5kZXJlci52aWV3KSkudG8uYmUudHJ1ZTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgaGF2ZSBhIHZhbGlkIHRoZW1lJywgKCk9PntcclxuICAgICAgICBleHBlY3QoYXBwLnRoZW1lKS50by5iZS5hbi5pbnN0YW5jZW9mKFNULlRoZW1lKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgaGF2ZSBhIHZhbGlkIHJvb3Qgd2lkZ2V0JywgKCk9PntcclxuICAgICAgICBleHBlY3QoYXBwLnJvb3QpLnRvLmJlLmFuLmluc3RhbmNlb2YoU1QuV2lkZ2V0cy5CYXNlV2lkZ2V0KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGl0KCdzaG91bGQgcmVzaXplIHRoZSByb290IHdpZGdldCB0byBtYXRjaCB0aGUgd2luZG93JywgKCk9PntcclxuICAgICAgICB3aW5kb3cucmVzaXplQnkoMzAwLCAyMDApO1xyXG4gICAgICAgIGV4cGVjdChhcHAucm9vdC53aWR0aCkudG8uZXF1YWwod2luZG93LmlubmVyV2lkdGgpO1xyXG4gICAgICAgIGV4cGVjdChhcHAucm9vdC5oZWlnaHQpLnRvLmVxdWFsKHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI25hbWUnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgY2hhbmdlIHRoZSBwYWdlIHRpdGxlJywgKCk9PntcclxuICAgICAgICAgICAgYXBwLm5hbWUgPSAnU2FiZXJUb290aCBUZXN0JztcclxuICAgICAgICAgICAgZXhwZWN0KGRvY3VtZW50LnRpdGxlKS50by5lcXVhbCgnU2FiZXJUb290aCBUZXN0Jyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2F1dG9SZXNpemUnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgYWRkIGEgbGlzdGVuZXIgdG8gcmVzaXplIGV2ZW50IGlmIHNldCB0byB0cnVlIGFuZCAnICtcclxuICAgICAgICAgICAgJ29uZSBkb2VzbnQgYWxyZWFkeSBleGlzdCcsICgpPT57XHJcbiAgICAgICAgICAgICAgICBhcHAuYXV0b1Jlc2l6ZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICBsZXQgbGlzdGVuZXJzID0gYXBwLmxpc3RlbmVycygncmVzaXplJyk7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QobGlzdGVuZXJzLmluZGV4T2YoYXBwLnJlc2l6ZVRvV2luZG93KSkudG8ubm90LmVxdWFsKC0xKTtcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgbm90IGFkZCBtb3JlIHRoYW4gb25lIGxpc3RlbmVyJywgKCk9PntcclxuICAgICAgICAgICAgYXBwLmF1dG9SZXNpemUgPSB0cnVlO1xyXG4gICAgICAgICAgICBsZXQgbGlzdGVuZXJzID0gYXBwLmxpc3RlbmVycygncmVzaXplJyk7XHJcbiAgICAgICAgICAgIGV4cGVjdChsaXN0ZW5lcnMubGVuZ3RoKS50by5lcXVhbCgxKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZW1vdmUgdGhlIGxpc3RlbmVyIGZyb20gcmVzaXplIGlmIHNldCB0byBmYWxzZScsICgpPT57XHJcbiAgICAgICAgICAgIGFwcC5hdXRvUmVzaXplID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGxldCBsaXN0ZW5lcnMgPSBhcHAubGlzdGVuZXJzKCdyZXNpemUnKTtcclxuICAgICAgICAgICAgZXhwZWN0KGxpc3RlbmVycy5pbmRleE9mKGFwcC5yZXNpemVUb1dpbmRvdykpLnRvLmVxdWFsKC0xKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ0dyYXBoaWNzR2VuJywgKCk9PntcclxuICAgIGRlc2NyaWJlKCcjcmVjdGFuZ2xlR3JhcGhpYygpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHJldHVybiBhIFBpeGkuR3JhcGhpY3Mgd2l0aCBhICdcclxuICAgICAgICAgICAgKyAnd2lkdGggb2YgODAgYW5kIGEgaGVpZ2h0IG9mIDEwMCcsICgpPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVjdEdyYXBoaWMgPVxyXG4gICAgICAgICAgICAgICAgICAgIFNULkdyYXBoaWNzR2VuLnJlY3RhbmdsZUdyYXBoaWMoODAsIDEwMCwgMHgwMDAwMDApO1xyXG5cclxuICAgICAgICAgICAgICAgIGV4cGVjdChyZWN0R3JhcGhpYykudG8uYmUuYW4uaW5zdGFuY2VvZihQSVhJLkdyYXBoaWNzKTtcclxuICAgICAgICAgICAgICAgIGV4cGVjdChyZWN0R3JhcGhpYy53aWR0aCkudG8uZXF1YWwoODApO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHJlY3RHcmFwaGljLmhlaWdodCkudG8uZXF1YWwoMTAwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3JlY3RhbmdsZVRleHR1cmUoKScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gYSBQSVhJLlRleHR1cmUgd2l0aCBhJ1xyXG4gICAgICAgICAgICArICcgd2lkdGggb2YgMTAwIGFuZCBhIGhlaWdodCBvZiA4MCcsICgpPT57XHJcbiAgICAgICAgICAgICAgICBsZXQgcmVjdFRleCA9XHJcbiAgICAgICAgICAgICAgICAgICAgU1QuR3JhcGhpY3NHZW4ucmVjdGFuZ2xlVGV4dHVyZSgxMDAsIDgwLCAweDAwMDAwMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHJlY3RUZXgpLnRvLmJlLmFuLmluc3RhbmNlb2YoUElYSS5UZXh0dXJlKTtcclxuICAgICAgICAgICAgICAgIGV4cGVjdChyZWN0VGV4LndpZHRoKS50by5lcXVhbCgxMDApO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHJlY3RUZXguaGVpZ2h0KS50by5lcXVhbCg4MCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnUGFkZGluZycsICgpPT57XHJcbiAgICBsZXQgcGFkID0gbmV3IFNULlBhZGRpbmcoKTtcclxuICAgIGl0KCdzaG91bGQgYmUgY3JlYXRlZCB3aXRoIGEgZGVmYXVsdCBvZiAwJywgKCk9PntcclxuICAgICAgICBleHBlY3QocGFkLmxlZnQpLnRvLmVxdWFsKDApO1xyXG4gICAgICAgIGV4cGVjdChwYWQudG9wKS50by5lcXVhbCgwKTtcclxuICAgICAgICBleHBlY3QocGFkLnJpZ2h0KS50by5lcXVhbCgwKTtcclxuICAgICAgICBleHBlY3QocGFkLmJvdHRvbSkudG8uZXF1YWwoMCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3NldCgpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCBlYWNoIHBhZGRpbmcgdG8gdGhlIHZhbHVlcyBvZiAxLDIsMyw0JywgKCk9PntcclxuICAgICAgICAgICAgcGFkLnNldCgxLCAyLCAzLCA0KTtcclxuICAgICAgICAgICAgZXhwZWN0KHBhZC5sZWZ0KS50by5lcXVhbCgyKTtcclxuICAgICAgICAgICAgZXhwZWN0KHBhZC50b3ApLnRvLmVxdWFsKDEpO1xyXG4gICAgICAgICAgICBleHBlY3QocGFkLnJpZ2h0KS50by5lcXVhbCg0KTtcclxuICAgICAgICAgICAgZXhwZWN0KHBhZC5ib3R0b20pLnRvLmVxdWFsKDMpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNzZXRBbGxUbygpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCBhbGwgcGFkZGluZyB2YWx1ZXMgdG8gMTAnLCAoKT0+e1xyXG4gICAgICAgICAgICBwYWQuc2V0QWxsVG8oMTApO1xyXG4gICAgICAgICAgICBleHBlY3QocGFkLmxlZnQpLnRvLmVxdWFsKDEwKTtcclxuICAgICAgICAgICAgZXhwZWN0KHBhZC50b3ApLnRvLmVxdWFsKDEwKTtcclxuICAgICAgICAgICAgZXhwZWN0KHBhZC5yaWdodCkudG8uZXF1YWwoMTApO1xyXG4gICAgICAgICAgICBleHBlY3QocGFkLmJvdHRvbSkudG8uZXF1YWwoMTApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnUG9pbnQnLCAoKT0+e1xyXG4gICAgbGV0IHAgPSBuZXcgU1QuUG9pbnQoKTtcclxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHdpdGggZGVmYXVsdCB4IGFuZCB5IG9mIDAnLCAoKT0+e1xyXG4gICAgICAgIGV4cGVjdChwLngpLnRvLmVxdWFsKDApO1xyXG4gICAgICAgIGV4cGVjdChwLnkpLnRvLmVxdWFsKDApO1xyXG4gICAgfSk7XHJcbiAgICBkZXNjcmliZSgnI3NldCgpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCB4IGFuZCB5IHRvIDIwLCA4MCcsICgpPT57XHJcbiAgICAgICAgICAgIHAuc2V0KDIwLCA4MCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChwLngpLnRvLmVxdWFsKDIwKTtcclxuICAgICAgICAgICAgZXhwZWN0KHAueSkudG8uZXF1YWwoODApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCIndXNlIHN0cmljdCc7XG5cbmRlc2NyaWJlKCdTZXR0aW5ncycsICgpPT57XG4gICAgaXQoJ3Nob3VsZCBoYXZlIGEgZ2xvYmFsIGluc3RhbmNlJywgKCk9PntcbiAgICAgICAgZXhwZWN0KFNULnNldHRpbmdzKS50by5ub3QuYmUudW5pZGVudGlmaWVkO1xuICAgIH0pO1xuXG4gICAgZGVzY3JpYmUoJyNhZGQoKScsICgpPT57XG4gICAgICAgIGl0KCdzaG91bGQgYWRkIHRoZSBnaXZlbiBvYmplY3QgYXMgYSBwcm9wZXJ0eSBvZiBpdHNlbGYnLCAoKT0+e1xuICAgICAgICAgICAgbGV0IG9iaiA9IHtcbiAgICAgICAgICAgICAgICB0cnVjazoge1xuICAgICAgICAgICAgICAgICAgICBzaXplOiAnYmlnJyxcbiAgICAgICAgICAgICAgICAgICAgd2VpZ2h0OiAnaGVhdnknLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc29sZS5sb2coU1Quc2V0dGluZ3MpO1xuICAgICAgICAgICAgU1Quc2V0dGluZ3MuYWRkKCd2ZWhpY2xlcycsIG9iaik7XG5cbiAgICAgICAgICAgIGV4cGVjdChTVC5zZXR0aW5ncy52ZWhpY2xlcy50cnVjay5zaXplKS50by5lcXVhbCgnYmlnJyk7XG4gICAgICAgICAgICBleHBlY3QoU1Quc2V0dGluZ3MudmVoaWNsZXMudHJ1Y2sud2VpZ2h0KS50by5lcXVhbCgnaGVhdnknKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdTaXplJywgKCk9PntcclxuICAgIGxldCBzID0gbmV3IFNULlNpemUoKTtcclxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHdpdGggZGVmYXVsdCBzaXplIG9mIDAnLCAoKT0+e1xyXG4gICAgICAgIGV4cGVjdChzLndpZHRoKS50by5lcXVhbCgwKTtcclxuICAgICAgICBleHBlY3Qocy5oZWlnaHQpLnRvLmVxdWFsKDApO1xyXG4gICAgfSk7XHJcbiAgICBkZXNjcmliZSgnI3NldCgpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCB3aWR0aCBhbmQgaGVpZ2h0IHRvIDIwLCA4MCcsICgpPT57XHJcbiAgICAgICAgICAgIHMuc2V0KDIwLCA4MCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChzLndpZHRoKS50by5lcXVhbCgyMCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChzLmhlaWdodCkudG8uZXF1YWwoODApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnVGhlbWUnLCAoKT0+e1xyXG4gICAgLy8gbGV0IGdyZXlUb2FkVGhlbWUgPSByZXF1aXJlKCcuLi8uLi90aGVtZXMvZ3JleVRvYWRUaGVtZScpO1xyXG4gICAgLy8gbGV0IGNoYW5nZSBvbmUgc3R5bGUgYmVjYXVzZSB0aGlzIHRoZW1lIGlzIHRoZSBzYW1lIGFzIHRoZSBkZWZhdWx0c1xyXG4gICAgZ3JleVRvYWRUaGVtZS5iYWNrZ3JvdW5kID0gMHhmZmZmZmY7XHJcbiAgICBncmV5VG9hZFRoZW1lLndpZGdldHMuYnV0dG9uLmhvdmVyID0gMHhmZjAwZmY7XHJcbiAgICBsZXQgdGhlbWUgPSBuZXcgU1QuVGhlbWUoZ3JleVRvYWRUaGVtZSk7XHJcbiAgICBsZXQgZGVmVGhlbWUgPSBuZXcgU1QuVGhlbWUoKTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIGxvYWQgdGhlIGdpdmVuIHN0eWxlcyB3aGVuIGNyZWF0ZWQnLCAoKT0+e1xyXG4gICAgICAgIGV4cGVjdCh0aGVtZS5iYWNrZ3JvdW5kKS50by5lcXVhbCgweGZmZmZmZik7XHJcbiAgICAgICAgZXhwZWN0KHRoZW1lLmNvbG9ycy5idXR0b24uaG92ZXIpLnRvLmVxdWFsKDB4ZmYwMGZmKTtcclxuICAgICAgICAvLyBub3QgZ29ubmEgY2hlY2sgZWFjaCBvbmUuIFRoaXMgc2hvdWxkIGJlIGVub3VnaFxyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBsb2FkIHRoZSBkZWZhdWx0IHN0eWxlcyBpZiBubyBzdHlsZSBpcyBnaXZlbicsICgpPT57XHJcbiAgICAgICAgZXhwZWN0KGRlZlRoZW1lLmJhY2tncm91bmQpLnRvLmVxdWFsKFNULlRoZW1lLmRlZmF1bHRzLmJhY2tncm91bmQpO1xyXG4gICAgICAgIGV4cGVjdChkZWZUaGVtZS5jb2xvcnMuYnV0dG9uLmhvdmVyKS50by5lcXVhbChTVC5UaGVtZS5kZWZhdWx0c1xyXG4gICAgICAgICAgICAud2lkZ2V0cy5idXR0b24uaG92ZXIpO1xyXG4gICAgICAgIC8vIG5vdCBnb25uYSBjaGVjayBlYWNoIG9uZS4gVGhpcyBzaG91bGQgYmUgZW5vdWdoXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2NvbG9ycycsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBlcXVhbCB0aGUgd2lkZ2V0cyBwb3J0aW9uIG9mIHRoZSBzdHlsZXMnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3QodGhlbWUuY29sb3JzKS50by5kZWVwLmVxdWFsKGdyZXlUb2FkVGhlbWUud2lkZ2V0cyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2ZvbnRTdHlsZXMnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgZXF1YWwgdGhlIHRleHQgcG9ydGlvbiBvZiB0aGUgc3R5bGVzJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHRoZW1lLmZvbnRTdHlsZXMpLnRvLmRlZXAuZXF1YWwoZ3JleVRvYWRUaGVtZS50ZXh0KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjZnJhbWVzJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGNvbnRhaW4gcmVjdHMgaW4gdGhlIHN0cnVjdHVyZSBvZiB0aGUgd2lkZ2V0cycgK1xyXG4gICAgICAgICAgICAnIHBvcnRpb24gb2YgdGhlIHN0eWxlcycsICgpPT57XHJcbiAgICAgICAgICAgICAgICAvLyB0ZXh0dXJlcyBiZWNvbWVzIGFuIGFsaWFzIGZvciBmcmFtZXMgdGhlcmVmb3JcclxuICAgICAgICAgICAgICAgIC8vIHNlZSAjdGV4dHVyZXNcclxuXHJcbiAgICAgICAgICAgICAgICAvLyB0cnkgYSBmZXcgb2YgdGhlbVxyXG4gICAgICAgICAgICAgICAgLy8gZXhwZWN0KHRoZW1lLmZyYW1lcy5idXR0b24uZW5hYmxlZCkudG8uYmUuYW5cclxuICAgICAgICAgICAgICAgIC8vICAgICAuaW5zdGFuY2VvZihQSVhJLlJlY3RhbmdsZSk7XHJcbiAgICAgICAgICAgICAgICAvLyBleHBlY3QodGhlbWUuZnJhbWVzLnBhbmVsLmhvdmVyKS50by5iZS5hblxyXG4gICAgICAgICAgICAgICAgLy8gICAgIC5pbnN0YW5jZW9mKFBJWEkuUmVjdGFuZ2xlKTtcclxuICAgICAgICAgICAgICAgIC8vIGV4cGVjdCh0aGVtZS5mcmFtZXMuc2xpZGVyLmJ1dHRvbi5lbmFibGVkKS50by5iZS5hblxyXG4gICAgICAgICAgICAgICAgLy8gICAgIC5pbnN0YW5jZW9mKFBJWEkuUmVjdGFuZ2xlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2Jhc2VUZXh0dXJlJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGJlIGEgUElYSS5CYXNlVGV4dHVyZScsICgpPT57XHJcbiAgICAgICAgICAgIGV4cGVjdCh0aGVtZS5iYXNlVGV4dHVyZSkudG8uYmUuYW4uaW5zdGFuY2VvZihQSVhJLkJhc2VUZXh0dXJlKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjdGV4dHVyZXMnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgY29udGFpbiB0ZXh0dXJlcyBpbiB0aGUgc3RydWN0dXJlIG9mIHRoZSB3aWRnZXRzJyArXHJcbiAgICAgICAgICAgICcgcG9ydGlvbiBvZiB0aGUgc3R5bGVzJywgKCk9PntcclxuICAgICAgICAgICAgICAgIC8vIHRyeSBhIGZldyBvZiB0aGVtXHJcbiAgICAgICAgICAgICAgICBleHBlY3QodGhlbWUudGV4dHVyZXMuYnV0dG9uLmVuYWJsZWQpLnRvLmJlLmFuXHJcbiAgICAgICAgICAgICAgICAgICAgLmluc3RhbmNlb2YoUElYSS5UZXh0dXJlKTtcclxuICAgICAgICAgICAgICAgIGV4cGVjdCh0aGVtZS50ZXh0dXJlcy5wYW5lbC5ob3ZlcikudG8uYmUuYW5cclxuICAgICAgICAgICAgICAgICAgICAuaW5zdGFuY2VvZihQSVhJLlRleHR1cmUpO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHRoZW1lLnRleHR1cmVzLnNsaWRlci5idXR0b24uZW5hYmxlZCkudG8uYmUuYW5cclxuICAgICAgICAgICAgICAgICAgICAuaW5zdGFuY2VvZihQSVhJLlRleHR1cmUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjYmFja2dyb3VuZCcsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBlcXVhbCB0aGUgY29sb3IgZ2l2ZW4gaW4gdGhlIHN0eWxlJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHRoZW1lLmJhY2tncm91bmQpLnRvLmVxdWFsKDB4ZmZmZmZmKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjZ2V0Q2xpcEdyYXBoaWMoKSAoU1RBVElDKScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gdGhlIGdsb2JhbCBjbGlwR3JhcGhpYycsICgpPT57XHJcbiAgICAgICAgICAgIGV4cGVjdChTVC5UaGVtZS5nZXRDbGlwR3JhcGhpYygpKS50by5iZS5hblxyXG4gICAgICAgICAgICAgICAgLmluc3RhbmNlb2YoUElYSS5HcmFwaGljcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3JlZ2lzdGVyRGVmYXVsdFdpZGdldFN0eWxlKCkgKFNUQVRJQyknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgYWRkIHRoZSBnaXZlbiBzdHlsZSB0byB0aGVtZS5kZWZhdWx0cyhnbG9iYWwpJywgKCk9PntcclxuICAgICAgICAgICAgbGV0IHN0eWxlID0ge1xyXG4gICAgICAgICAgICAgICAga25vYjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IDB4MDAwMDAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiAweGZmZmZmZixcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBTVC5UaGVtZS5yZWdpc3RlckRlZmF1bHRXaWRnZXRTdHlsZSgncGFuZScsIHN0eWxlKTtcclxuXHJcbiAgICAgICAgICAgIGV4cGVjdChTVC5UaGVtZS5kZWZhdWx0cy53aWRnZXRzLnBhbmUua25vYi5lbmFibGVkKVxyXG4gICAgICAgICAgICAgICAgLnRvLmVxdWFsKDB4MDAwMDAwKTtcclxuXHJcbiAgICAgICAgICAgIGV4cGVjdChTVC5UaGVtZS5kZWZhdWx0cy53aWRnZXRzLnBhbmUua25vYi5kaXNhYmxlZClcclxuICAgICAgICAgICAgICAgIC50by5lcXVhbCgweGZmZmZmZik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI21ha2VHcmFwaGljc1JlY3Vyc2l2ZSgpJywgKCk9PntcclxuICAgICAgICAvLyBub3QgbmVlZGVkIGlmIGZyYW1lcyB0ZXN0IGFib3ZlIHBhc3Nlc1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNtYWtlVGV4dHVyZSgpJywgKCk9PntcclxuICAgICAgICAvLyBub3QgbmVlZGVkIGlmIGJhc2VUZXh0dXJlIHRlc3QgYWJvdmUgcGFzc2VzXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI21ha2VUZXh0dXJlc1JlY3Vyc2l2ZSgpJywgKCk9PntcclxuICAgICAgICAvLyBub3QgbmVlZGVkIGlmIHRleHR1cmVzIHRleHQgYWJvdmUgcGFzc2VzXHJcbiAgICB9KTtcclxufSk7XHJcbiIsInJlcXVpcmUoJy4vVGhlbWUtc3BlYycpO1xyXG5yZXF1aXJlKCcuL1NpemUtc3BlYycpO1xyXG5yZXF1aXJlKCcuL1BvaW50LXNwZWMnKTtcclxucmVxdWlyZSgnLi9QYWRkaW5nLXNwZWMnKTtcclxucmVxdWlyZSgnLi9HcmFwaGljc0dlbi1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vQXBwLXNwZWMnKTtcclxucmVxdWlyZSgnLi93aWRnZXRzJyk7XHJcbnJlcXVpcmUoJy4vbGF5b3V0U3lzJyk7XG5yZXF1aXJlKCcuL1NldHRpbmdzLXNwZWMnKTtcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdBbGlnbm1lbnQnLCAoKT0+e1xyXG4gICAgbGV0IHdpZGdldDAgPSBuZXcgU1QuV2lkZ2V0cy5CYXNlV2lkZ2V0KCk7XHJcbiAgICB3aWRnZXQwLndpZHRoID0gNDAwOyB3aWRnZXQwLmhlaWdodCA9IDQwMDtcclxuICAgIGxldCB3aWRnZXQxID0gbmV3IFNULldpZGdldHMuQmFzZVdpZGdldCh3aWRnZXQwKTtcclxuICAgIHdpZGdldDEud2lkdGggPSAyMDA7IHdpZGdldDEuaGVpZ2h0ID0gMjAwO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjZ2V0T2Zmc2V0KCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIGEgcmVsYXRpdmUgb2Zmc2V0IGJhc2Ugb24gdGhlIGdpdmVuIGhvcml6b250YWwnXHJcbiAgICAgICAgICAgICsgJyBhbmQgdmVydGljYWwgYWxpZ25tZW50JywgKCk9PntcclxuICAgICAgICAgICAgICAgIHdpZGdldDAubGF5b3V0LmFsaWdubWVudC5oQWxpZ24gPSBTVC5BbGlnbm1lbnQuY2VudGVyO1xyXG4gICAgICAgICAgICAgICAgd2lkZ2V0MC5sYXlvdXQuYWxpZ25tZW50LnZBbGlnbiA9IFNULkFsaWdubWVudC5taWRkbGU7XHJcbiAgICAgICAgICAgICAgICBsZXQgb2ZmID0gbmV3IFNULlBvaW50KCk7XHJcbiAgICAgICAgICAgICAgICBvZmYgPSB3aWRnZXQwLmxheW91dC5hbGlnbm1lbnQuZ2V0T2Zmc2V0KHdpZGdldDAsXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkZ2V0MS53aWR0aCwgd2lkZ2V0MS5oZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgLy8gKHdpZGdldDAud2lkdGgvMikgLSAod2lkZ2V0MS53aWR0aC8yKVxyXG4gICAgICAgICAgICAgICAgZXhwZWN0KG9mZi54KS50by5lcXVhbCgxMDApO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KG9mZi55KS50by5lcXVhbCgxMDApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjbGVmdCcsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gcmVsYXRpdmUgcG9zaXRpb24gZm9yIGxlZnQgYWxpZ25tZW50JywgKCk9PntcclxuICAgICAgICAgICAgbGV0IG9mZiA9IFNULkFsaWdubWVudC5sZWZ0KDQwMCwgd2lkZ2V0MCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChvZmYpLnRvLmVxdWFsKDQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNjZW50ZXInLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIHJlbGF0aXZlIHBvc2l0aW9uIGZvciBjZW50ZXIgYWxpZ25tZW50JywgKCk9PntcclxuICAgICAgICAgICAgbGV0IG9mZiA9IFNULkFsaWdubWVudC5jZW50ZXIoMTAwLCB3aWRnZXQwKTtcclxuICAgICAgICAgICAgZXhwZWN0KG9mZikudG8uZXF1YWwoMTUwKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjcmlnaHQnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIHJlbGF0aXZlIHBvc2l0aW9uIGZvciByaWdodCBhbGlnbm1lbnQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgb2ZmID0gU1QuQWxpZ25tZW50LnJpZ2h0KDEwMCwgd2lkZ2V0MCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChvZmYpLnRvLmVxdWFsKDMwMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3RvcCcsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gcmVsYXRpdmUgcG9zaXRpb24gZm9yIHRvcCBhbGlnbm1lbnQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgb2ZmID0gU1QuQWxpZ25tZW50LnRvcCgxMDAsIHdpZGdldDApO1xyXG4gICAgICAgICAgICBleHBlY3Qob2ZmKS50by5lcXVhbCg0KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjbWlkZGxlJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHJldHVybiByZWxhdGl2ZSBwb3NpdGlvbiBmb3IgbWlkZGxlIGFsaWdubWVudCcsICgpPT57XHJcbiAgICAgICAgICAgIGxldCBvZmYgPSBTVC5BbGlnbm1lbnQubWlkZGxlKDEwMCwgd2lkZ2V0MCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChvZmYpLnRvLmVxdWFsKDE1MCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2JvdHRvbScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gcmVsYXRpdmUgcG9zaXRpb24gZm9yIGJvdHRvbSBhbGlnbm1lbnQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgb2ZmID0gU1QuQWxpZ25tZW50LmJvdHRvbSgxMDAsIHdpZGdldDApO1xyXG4gICAgICAgICAgICBleHBlY3Qob2ZmKS50by5lcXVhbCgzMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCJyZXF1aXJlKCcuL0FsaWdubWVudC1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vc2l6ZVBvbGljaWVzJyk7XHJcbnJlcXVpcmUoJy4vbGF5b3V0cycpO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnQmFzZUxheW91dCcsICgpPT57XHJcbiAgICBsZXQgd2lkZ2V0MCA9IG5ldyBTVC5XaWRnZXRzLlBhbmVsKG51bGwsIHt3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMH0pO1xyXG4gICAgbGV0IHdpZGdldDEgPSBuZXcgU1QuV2lkZ2V0cy5CdXR0b24od2lkZ2V0MCwge3dpZHRoOiAyMCwgaGVpZ2h0OiAyMH0pO1xyXG4gICAgd2lkZ2V0MS5wb3NpdGlvbi5zZXQoMjAsIDIwKTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2V4ZWMnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBwb3NpdGlvbiBvZiBpdHMgY2hpbGRyZW4gYW5kIGV4ZWMgdGhlaXIgbGF5b3VycycsXHJcbiAgICAgICAgKCk9PntcclxuICAgICAgICAgICAgLy8gcmVhbCBwb3NpdGlvbiBpc250IHNldCB1bnRpbCBsYXlvdXQgZXhlY3V0ZXNcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEudHJhbnNmb3JtLnBvc2l0aW9uLngpLnRvLmVxdWFsKDApO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS50cmFuc2Zvcm0ucG9zaXRpb24ueSkudG8uZXF1YWwoMCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgc3B5ID0gc2lub24uc3B5KHdpZGdldDEubGF5b3V0LCAnZXhlYycpO1xyXG5cclxuICAgICAgICAgICAgd2lkZ2V0MC5sYXlvdXQuZXhlYygpO1xyXG5cclxuICAgICAgICAgICAgZXhwZWN0KHNweS5jYWxsZWQpLnRvLmJlLnRydWU7XHJcblxyXG4gICAgICAgICAgICB3aWRnZXQxLmxheW91dC5leGVjLnJlc3RvcmUoKTtcclxuXHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLnRyYW5zZm9ybS5wb3NpdGlvbi54KS50by5lcXVhbCgyNCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLnRyYW5zZm9ybS5wb3NpdGlvbi55KS50by5lcXVhbCgyNCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdCb3hMYXlvdXQnLCAoKT0+e1xyXG4gICAgbGV0IHcwID0gbmV3IFNULldpZGdldHMuUGFuZWwobnVsbCwge3dpZHRoOiA0MDAsIGhlaWdodDogNDAwfSk7XHJcbiAgICB3MC5sYXlvdXQgPSBuZXcgU1QuTGF5b3V0cy5Cb3hMYXlvdXQodzAsIFNULlZFUlRJQ0FMKTtcclxuICAgIGxldCB3MSA9IG5ldyBTVC5XaWRnZXRzLkJ1dHRvbih3MCwge3dpZHRoOiAyMCwgaGVpZ2h0OiAyMH0pO1xyXG4gICAgbGV0IHcyID0gbmV3IFNULldpZGdldHMuQnV0dG9uKHcwLCB7d2lkdGg6IDIwLCBoZWlnaHQ6IDIwfSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcclxuICAgIGxldCB3MyA9IG5ldyBTVC5XaWRnZXRzLkJ1dHRvbih3MCwge3dpZHRoOiAyMCwgaGVpZ2h0OiAyMH0pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXHJcblxyXG4gICAgZGVzY3JpYmUoJyNpbml0VG90YWxDaGlsZHJlblNpemUoKScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBjYWxjdWxhdGUgdGhlIHRvdGFsIHNpemUgb2YgdGhlIGNoaWxkcmVuJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHcwLmxheW91dC5fdG90YWxDaGlsZHJlbldpZHRoKS50by5lcXVhbCgwKTtcclxuICAgICAgICAgICAgZXhwZWN0KHcwLmxheW91dC5fdG90YWxDaGlsZHJlbkhlaWdodCkudG8uZXF1YWwoMCk7XHJcblxyXG4gICAgICAgICAgICB3MC5sYXlvdXQuaW5pdFRvdGFsQ2hpbGRyZW5TaXplKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBhZGQgdG9nZXRoZXIgKyBzcGFjaW5nXHJcbiAgICAgICAgICAgIGV4cGVjdCh3MC5sYXlvdXQuX3RvdGFsQ2hpbGRyZW5XaWR0aCkudG8uZXF1YWwoNzIpO1xyXG4gICAgICAgICAgICBleHBlY3QodzAubGF5b3V0Ll90b3RhbENoaWxkcmVuSGVpZ2h0KS50by5lcXVhbCg3Mik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2JlZ2luSXRlcmF0aW9uKCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgcHJlcGFyZSB2YXJpYWJsZXMgYmVmb3JlIGl0ZXJhdGlvbicsICgpPT57XHJcbiAgICAgICAgICAgIGxldCB3TGF5b3V0ID0gdzAubGF5b3V0O1xyXG4gICAgICAgICAgICB3TGF5b3V0LmJlZ2luSXRlcmF0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICBleHBlY3Qod0xheW91dC5fdG90YWxDaGlsZHJlbkhlaWdodCkudG8uZXF1YWwoMCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3TGF5b3V0Ll90b3RhbENoaWxkcmVuV2lkdGgpLnRvLmVxdWFsKDApO1xyXG5cclxuICAgICAgICAgICAgZXhwZWN0KHdMYXlvdXQucG9zT2Zmc2V0LngpLnRvLmVxdWFsKDApO1xyXG4gICAgICAgICAgICBleHBlY3Qod0xheW91dC5wb3NPZmZzZXQueSkudG8uZXF1YWwoMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3NldENoaWxkUG9zKCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgY2hpbGQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgd0xheW91dCA9IHcwLmxheW91dDtcclxuICAgICAgICAgICAgd0xheW91dC5zZXRDaGlsZFBvcyh3MSk7XHJcblxyXG4gICAgICAgICAgICBleHBlY3Qod0xheW91dC5fdG90YWxDaGlsZHJlbldpZHRoKS50by5lcXVhbCgyNCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3TGF5b3V0Ll90b3RhbENoaWxkcmVuSGVpZ2h0KS50by5lcXVhbCgyNCk7XHJcblxyXG4gICAgICAgICAgICBleHBlY3QodzEudHJhbnNmb3JtLnBvc2l0aW9uLngpLnRvLmVxdWFsKDQpO1xyXG4gICAgICAgICAgICBleHBlY3QodzEudHJhbnNmb3JtLnBvc2l0aW9uLnkpLnRvLmVxdWFsKDQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnRml4ZWRMYXlvdXQnLCAoKT0+e1xyXG4gICAgbGV0IHcwID0gbmV3IFNULldpZGdldHMuUGFuZWwobnVsbCwge3dpZHRoOiA0MDAsIGhlaWdodDogNDAwfSk7XHJcbiAgICBsZXQgdzEgPSBuZXcgU1QuV2lkZ2V0cy5CdXR0b24odzApO1xyXG4gICAgdzEucG9zaXRpb24uc2V0KDEyLCAxMik7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNzZXRDaGlsZFBvcygpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCB0aGUgY2hpbGRzIHBvc2l0aW9uJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHcxLnRyYW5zZm9ybS5wb3NpdGlvbi54KS50by5lcXVhbCgwKTtcclxuICAgICAgICAgICAgZXhwZWN0KHcxLnRyYW5zZm9ybS5wb3NpdGlvbi55KS50by5lcXVhbCgwKTtcclxuXHJcbiAgICAgICAgICAgIHcwLmxheW91dC5zZXRDaGlsZFBvcyh3MSk7XHJcblxyXG4gICAgICAgICAgICBleHBlY3QodzEudHJhbnNmb3JtLnBvc2l0aW9uLngpLnRvLmVxdWFsKDE2KTtcclxuICAgICAgICAgICAgZXhwZWN0KHcxLnRyYW5zZm9ybS5wb3NpdGlvbi55KS50by5lcXVhbCgxNik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdIQm94TGF5b3V0JywgKCk9PntcclxuICAgIGl0KCdzaG91bGQgY29uc3RydWN0IGEgQm94TGF5b3V0IHdpdGggSE9SSVpPTlRBTCBvcmllbnRhdGlvbicsICgpPT57XHJcbiAgICAgICAgbGV0IHcxID0gbmV3IFNULldpZGdldHMuUGFuZWwoKTtcclxuXHJcbiAgICAgICAgdzEubGF5b3V0ID0gbmV3IFNULkxheW91dHMuSEJveExheW91dCh3MSk7XHJcbiAgICAgICAgZXhwZWN0KHcxLmxheW91dC5vcmllbnRhdGlvbikudG8uZXF1YWwoU1QuSE9SSVpPTlRBTCk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdWQm94TGF5b3V0JywgKCk9PntcclxuICAgIGl0KCdzaG91bGQgY29uc3RydWN0IGEgQm94TGF5b3V0IHdpdGggVkVSVElDQUwgb3JpZW50YXRpb24nLCAoKT0+e1xyXG4gICAgICAgIGxldCB3MSA9IG5ldyBTVC5XaWRnZXRzLlBhbmVsKCk7XHJcblxyXG4gICAgICAgIHcxLmxheW91dCA9IG5ldyBTVC5MYXlvdXRzLlZCb3hMYXlvdXQodzEpO1xyXG4gICAgICAgIGV4cGVjdCh3MS5sYXlvdXQub3JpZW50YXRpb24pLnRvLmVxdWFsKFNULlZFUlRJQ0FMKTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwicmVxdWlyZSgnLi9CYXNlTGF5b3V0LXNwZWMnKTtcclxucmVxdWlyZSgnLi9Cb3hMYXlvdXQtc3BlYycpO1xyXG5yZXF1aXJlKCcuL0ZpeGVkTGF5b3V0LXNwZWMnKTtcclxucmVxdWlyZSgnLi9IQm94TGF5b3V0LXNwZWMnKTtcclxucmVxdWlyZSgnLi9WQm94TGF5b3V0LXNwZWMnKTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ0Jhc2VQb2xpY3knLCAoKT0+e1xyXG4gICAgbGV0IHdpZGdldCA9IG5ldyBTVC5XaWRnZXRzLkJ1dHRvbigpO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjY2hpbGRQb2xpY3lGaW5pc2hlZCgpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGFkZCBlYWNoIGNoaWxkcyBzaXplIHRvIHRvdGFsQ2hpbGRyZW5GaW5pc2hlZFNpemUgYW5kJ1xyXG4gICAgICAgICAgICArICcgc3Vic3RyYWN0IDEgZnJvbSB0b3RhbENoaWxkcmVuRmluaXNoZWQnLCAoKT0+e1xyXG4gICAgICAgICAgICAgICAgd2lkZ2V0LmhQb2xpY3kudG90YWxDaGlsZHJlbkZpbmlzaGVkID0gMTtcclxuICAgICAgICAgICAgICAgIHdpZGdldC5oUG9saWN5LnRvdGFsQ2hpbGRyZW5GaW5pc2hlZFNpemUgPSAxMDA7XHJcbiAgICAgICAgICAgICAgICB3aWRnZXQuaFBvbGljeS5jaGlsZFBvbGljeUZpbmlzaGVkKDQwMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHdpZGdldC5oUG9saWN5LnRvdGFsQ2hpbGRyZW5GaW5pc2hlZCkudG8uZXF1YWwoMCk7XHJcbiAgICAgICAgICAgICAgICBleHBlY3Qod2lkZ2V0LmhQb2xpY3kudG90YWxDaGlsZHJlbkZpbmlzaGVkU2l6ZSkudG8uZXF1YWwoNTAwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2V4ZWMoKScsICgpPT57XHJcbiAgICAgICAgbGV0IHdpZGdldDIgPSBuZXcgU1QuV2lkZ2V0cy5CdXR0b24od2lkZ2V0KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCBhZGQgYSBvbmUgdGltZSBldmVudCdcclxuICAgICAgICArICcoIHJlZ2lzdGVyIHNpemUgd2l0aCBjaGlsZFBvbGljeUZpbmlzaGVkICkgYW5kIGV4ZWMgdGhlICdcclxuICAgICAgICArICdIT1JJWk9OVEFMIHNpemUgcG9saWN5IGZvciBlYWNoIGNoaWxkICdcclxuICAgICAgICArICd0aGF0IGlzIEhPUklaT05UQUwgYW5kIGFuIGluc3RhbmNlb2YgU1QuV2lkZ2V0cy5CYXNlV2lkZ2V0JywgKCk9PntcclxuICAgICAgICAgICAgbGV0IHNweSA9IHNpbm9uLnNweSh3aWRnZXQyLmhQb2xpY3ksICdleGVjJyk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLmhQb2xpY3kubGlzdGVuZXJzKCdmaW5pc2hlZCcsIHRydWUpKS50by5iZS5mYWxzZTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIpLnRvLmJlLmFuLmluc3RhbmNlb2YoU1QuV2lkZ2V0cy5CYXNlV2lkZ2V0KTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldC5oUG9saWN5Lm9yaWVudGF0aW9uKS50by5lcXVhbChTVC5IT1JJWk9OVEFMKTtcclxuICAgICAgICAgICAgd2lkZ2V0LmhQb2xpY3kuZXhlYygpO1xyXG5cclxuICAgICAgICAgICAgZXhwZWN0KHNweS5jYWxsZWQpLnRvLmJlLnRydWU7XHJcbiAgICAgICAgICAgIHdpZGdldDIuaFBvbGljeS5leGVjLnJlc3RvcmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCBhZGQgYSBvbmUgdGltZSBldmVudCdcclxuICAgICAgICArICcoIHJlZ2lzdGVyIHNpemUgd2l0aCBjaGlsZFBvbGljeUZpbmlzaGVkICkgYW5kIGV4ZWMgdGhlICdcclxuICAgICAgICArICdWRVJUSUNBTCBzaXplIHBvbGljeSBmb3IgZWFjaCBjaGlsZCAnXHJcbiAgICAgICAgKyAndGhhdCBpcyBWRVJUSUNBTCBhbmQgYW4gaW5zdGFuY2VvZiBTVC5XaWRnZXRzLkJhc2VXaWRnZXQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgc3B5ID0gc2lub24uc3B5KHdpZGdldDIudlBvbGljeSwgJ2V4ZWMnKTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIudlBvbGljeS5saXN0ZW5lcnMoJ2ZpbmlzaGVkJywgdHJ1ZSkpLnRvLmJlLmZhbHNlO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MikudG8uYmUuYW4uaW5zdGFuY2VvZihTVC5XaWRnZXRzLkJhc2VXaWRnZXQpO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0LnZQb2xpY3kub3JpZW50YXRpb24pLnRvLmVxdWFsKFNULlZFUlRJQ0FMKTtcclxuICAgICAgICAgICAgd2lkZ2V0LnZQb2xpY3kuZXhlYygpO1xyXG5cclxuICAgICAgICAgICAgZXhwZWN0KHNweS5jYWxsZWQpLnRvLmJlLnRydWU7XHJcbiAgICAgICAgICAgIHdpZGdldDIudlBvbGljeS5leGVjLnJlc3RvcmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCBjYWxsIHNpemVXaWRnZXRIb3Jpem9udGFsKCkgaWYgdGhlIHdpZGdldCBpcyBIT1JJWk9OVEFMJyxcclxuICAgICAgICAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgc3B5ID0gc2lub24uc3B5KHdpZGdldC5oUG9saWN5LCAnc2l6ZVdpZGdldEhvcml6b250YWwnKTtcclxuICAgICAgICAgICAgd2lkZ2V0LmhQb2xpY3kuZXhlYygpO1xyXG4gICAgICAgICAgICBleHBlY3Qoc3B5LmNhbGxlZCkudG8uYmUudHJ1ZTtcclxuICAgICAgICAgICAgd2lkZ2V0LmhQb2xpY3kuc2l6ZVdpZGdldEhvcml6b250YWwucmVzdG9yZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIGNhbGwgc2l6ZVdpZGdldFZlcnRpY2FsKCkgaWYgdGhlIHdpZGdldCBpcyBWRVJUSUNBTCcsXHJcbiAgICAgICAgKCk9PntcclxuICAgICAgICAgICAgbGV0IHNweSA9IHNpbm9uLnNweSh3aWRnZXQudlBvbGljeSwgJ3NpemVXaWRnZXRWZXJ0aWNhbCcpO1xyXG4gICAgICAgICAgICB3aWRnZXQudlBvbGljeS5leGVjKCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChzcHkuY2FsbGVkKS50by5iZS50cnVlO1xyXG4gICAgICAgICAgICB3aWRnZXQudlBvbGljeS5zaXplV2lkZ2V0VmVydGljYWwucmVzdG9yZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnRXhwYW5kaW5nUG9saWN5JywgKCk9PntcclxuICAgIGxldCB3aWRnZXQwID0gbmV3IFNULldpZGdldHMuQnV0dG9uKCk7XHJcbiAgICB3aWRnZXQwLndpZHRoID0gMjAwOyB3aWRnZXQwLmhlaWdodCA9IDIwMDtcclxuICAgIGxldCB3aWRnZXQxID0gbmV3IFNULldpZGdldHMuQnV0dG9uKHdpZGdldDApO1xyXG4gICAgd2lkZ2V0MS5oUG9saWN5ID0gbmV3IFNULlNpemVQb2xpY2llcy5FeHBhbmRpbmdQb2xpY3kod2lkZ2V0MSk7XHJcbiAgICB3aWRnZXQxLnZQb2xpY3kgPSBuZXcgU1QuU2l6ZVBvbGljaWVzLkV4cGFuZGluZ1BvbGljeSh3aWRnZXQxKTtcclxuICAgIHdpZGdldDEud2lkdGggPSAxMDA7IHdpZGdldDEuaGVpZ2h0ID0gMTAwO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjcGFyZW50UmVhZHlIJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNpemUgdGhlIHdpZGdldCB0byBtYXRjaCBpdHMgcGFyZW50cyB3aWR0aCAtIHBhZGRpbmcnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS53aWR0aCkudG8uZXF1YWwoMTAwKTtcclxuICAgICAgICAgICAgd2lkZ2V0MS5oUG9saWN5LnBhcmVudFJlYWR5SCgpO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS53aWR0aCkudG8uZXF1YWwoMTkyKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjcGFyZW50UmVhZHlWJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNpemUgdGhlIHdpZGdldCB0byBtYXRjaCBpdHMgcGFyZW50cyBoZWlnaHQgLSBwYWRkaW5nJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEuaGVpZ2h0KS50by5lcXVhbCgxMDApO1xyXG4gICAgICAgICAgICB3aWRnZXQxLnZQb2xpY3kucGFyZW50UmVhZHlWKCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLmhlaWdodCkudG8uZXF1YWwoMTkyKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ0ZpeGVkUG9saWN5JywgKCk9PntcclxuICAgIGxldCB3aWRnZXQgPSBuZXcgU1QuV2lkZ2V0cy5CdXR0b24oKTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3NpemVXaWRnZXRIb3Jpem9udGFsJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHZhbGlkYXRlIHRoZSB3aWR0aCBvZiB0aGUgd2lkZ2V0JywgKCk9PntcclxuICAgICAgICAgICAgbGV0IHNweSA9IHNpbm9uLnNweSh3aWRnZXQsICd2YWxpZGF0ZVdpZHRoJyk7XHJcbiAgICAgICAgICAgIHdpZGdldC5oUG9saWN5LnNpemVXaWRnZXRIb3Jpem9udGFsKCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChzcHkuY2FsbGVkKS50by5iZS50cnVlO1xyXG4gICAgICAgICAgICB3aWRnZXQudmFsaWRhdGVXaWR0aC5yZXN0b3JlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3NpemVXaWRnZXRWZXJ0aWNhbCcsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCB2YWxpZGF0ZSB0aGUgaGVpZ2h0IG9mIHRoZSB3aWRnZXQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgc3B5ID0gc2lub24uc3B5KHdpZGdldCwgJ3ZhbGlkYXRlSGVpZ2h0Jyk7XHJcbiAgICAgICAgICAgIHdpZGdldC52UG9saWN5LnNpemVXaWRnZXRWZXJ0aWNhbCgpO1xyXG4gICAgICAgICAgICBleHBlY3Qoc3B5LmNhbGxlZCkudG8uYmUudHJ1ZTtcclxuICAgICAgICAgICAgd2lkZ2V0LnZhbGlkYXRlSGVpZ2h0LnJlc3RvcmUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ1NoYXJlZEV4cGFuZGluZ1BvbGljeScsICgpPT57XHJcbiAgICBsZXQgd2lkZ2V0MCA9IG5ldyBTVC5XaWRnZXRzLlBhbmVsKG51bGwsIHt3aWR0aDogNDAwLCBoZWlnaHQ6IDQwMH0pO1xyXG4gICAgd2lkZ2V0MC5sYXlvdXQgPSBuZXcgU1QuTGF5b3V0cy5IQm94TGF5b3V0KHdpZGdldDApO1xyXG5cclxuICAgIGxldCB3aWRnZXQxID0gbmV3IFNULldpZGdldHMuQnV0dG9uKHdpZGdldDApO1xyXG4gICAgd2lkZ2V0MS5oUG9saWN5ID0gbmV3IFNULlNpemVQb2xpY2llcy5TaGFyZWRFeHBhbmRpbmdQb2xpY3kod2lkZ2V0MSk7XHJcbiAgICB3aWRnZXQxLnZQb2xpY3lcclxuICAgID0gbmV3IFNULlNpemVQb2xpY2llcy5TaGFyZWRFeHBhbmRpbmdQb2xpY3kod2lkZ2V0MSwgU1QuVkVSVElDQUwpO1xyXG5cclxuICAgIGxldCB3aWRnZXQyID0gbmV3IFNULldpZGdldHMuQnV0dG9uKHdpZGdldDApO1xyXG4gICAgd2lkZ2V0Mi5oUG9saWN5ID0gbmV3IFNULlNpemVQb2xpY2llcy5TaGFyZWRFeHBhbmRpbmdQb2xpY3kod2lkZ2V0Mik7XHJcbiAgICB3aWRnZXQyLnZQb2xpY3lcclxuICAgID0gbmV3IFNULlNpemVQb2xpY2llcy5TaGFyZWRFeHBhbmRpbmdQb2xpY3kod2lkZ2V0MiwgU1QuVkVSVElDQUwpO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjcGFyZW50UmVhZHlIJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNpemUgdGhlIHdpZGdldHMgZXF1YWwgc2l6ZSBpZiBhbGwgaGF2ZSBzaGFyZWQgcG9saWN5JywgKCk9PntcclxuICAgICAgICAgICAgd2lkZ2V0MC5oUG9saWN5LmV4ZWMoKTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEud2lkdGgpLnRvLmVxdWFsKDE5NCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLndpZHRoKS50by5lcXVhbCgxOTQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIGhhbmRsZSB3aWRnZXRzIHRoYXQgYXJlbnQgb2Ygc2hhcmVkIHBvbGljeScsICgpPT57XHJcbiAgICAgICAgICAgIGxldCBudWxsd2lkZ2V0ID0gbmV3IFNULldpZGdldHMuUGFuZWwoKTtcclxuICAgICAgICAgICAgbGV0IHdpZGdldDNcclxuICAgICAgICAgICAgPSBuZXcgU1QuV2lkZ2V0cy5CdXR0b24od2lkZ2V0MCwge3dpZHRoOiAxMDAsIGhlaWdodDogMTAwfSk7XHJcbiAgICAgICAgICAgIHdpZGdldDMuaFBvbGljeSA9IG5ldyBTVC5TaXplUG9saWNpZXMuRml4ZWRQb2xpY3kod2lkZ2V0Myk7XHJcbiAgICAgICAgICAgIHdpZGdldDAuaFBvbGljeS5leGVjKCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLndpZHRoKS50by5lcXVhbCgxNDIpO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0Mi53aWR0aCkudG8uZXF1YWwoMTQyKTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDMud2lkdGgpLnRvLmVxdWFsKDEwMCk7XHJcbiAgICAgICAgICAgIG51bGx3aWRnZXQuYWRkQ2hpbGQod2lkZ2V0Myk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3BhcmVudFJlYWR5VicsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBzaXplIHRoZSB3aWRnZXRzIGVxdWFsIHNpemUgaWYgYWxsIGhhdmUgc2hhcmVkIHBvbGljeScsICgpPT57XHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICBzYW1lIGFzIGFib3ZlIHRlc3QuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIGhhbmRsZSB3aWRnZXRzIHRoYXQgYXJlbnQgb2Ygc2hhcmVkIHBvbGljeScsICgpPT57XHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICBzYW1lIGFzIGFib3ZlIHRlc3QuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNjb25zdW1lVW51c2VkU3BhY2VIKCknLCAoKT0+e1xyXG4gICAgICAgIC8vIFRPRE9cclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjY29uc3VtZVVudXNlZFNwYWNlVigpJywgKCk9PntcclxuICAgICAgICAvLyBUT0RPXHJcbiAgICB9KTtcclxufSk7XHJcbiIsInJlcXVpcmUoJy4vQmFzZVBvbGljeS1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vRXhwYW5kaW5nUG9saWN5LXNwZWMnKTtcclxucmVxdWlyZSgnLi9GaXhlZFBvbGljeS1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vU2hhcmVkRXhwYW5kaW5nUG9saWN5LXNwZWMnKTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLypcclxuVE9ETzpcclxudGVzdCB0aGluZ3MgdGhhdCBzaG91bGQgaGFwcGVuIHdoZW4gZXZlbnRzIGFyZSBmaXJlZC5cclxuZWcuIHdoZW4gcGFkZGluZyBjaGFuZ2VzIF91cGRhdGVDbGlwR3JhcGhpYyBzaG91bGQgYmUgY2FsbGVkLlxyXG4gKi9cclxuXHJcbmRlc2NyaWJlKCdCYXNlV2lkZ2V0JywgKCk9PntcclxuICAgIGxldCB3aWRnZXQwID0gbmV3IFNULldpZGdldHMuUGFuZWwoKTtcbiAgICBsZXQgd2lkZ2V0MSA9IG5ldyBTVC5XaWRnZXRzLlBhbmVsKHdpZGdldDApO1xuICAgIGxldCB3aWRnZXQyID0gbmV3IFNULldpZGdldHMuUGFuZWwod2lkZ2V0MSk7XG5cclxuICAgIGJlZm9yZUVhY2goKCk9PntcclxuICAgICAgICB3aWRnZXQxLmxheW91dFxyXG4gICAgICAgICAgICA9IG5ldyBTVC5MYXlvdXRzLkZpeGVkTGF5b3V0KHdpZGdldDEpO1xyXG4gICAgICAgIHdpZGdldDIuaFBvbGljeVxyXG4gICAgICAgICAgICA9IG5ldyBTVC5TaXplUG9saWNpZXMuRml4ZWRQb2xpY3kod2lkZ2V0Mik7XG4gICAgICAgIHdpZGdldDAuaFBvbGljeVxyXG4gICAgICAgICAgICA9IG5ldyBTVC5TaXplUG9saWNpZXMuRml4ZWRQb2xpY3kod2lkZ2V0MCk7XG4gICAgICAgIHdpZGdldDEudmFsaWRhdGUoKTtcclxuICAgICAgICB3aWRnZXQwLnZhbGlkYXRlKCk7XHJcbiAgICAgICAgd2lkZ2V0Mi52YWxpZGF0ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBwYXJlbnQgb25lIHdpZGdldCB0byBhbm90aGVyJywgKCk9PntcclxuICAgICAgICBleHBlY3Qod2lkZ2V0Mi5wYXJlbnQpLnRvLmVxdWFsKHdpZGdldDEpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNiZWdpbkJ5cGFzc1VwZGF0ZSgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2VuZEJ5cGFzc1VwZGF0ZSgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3ZhbGlkYXRlV2lkdGgoKScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBrZWVwIHdpZGdldHMgd2lkdGggd2l0aGluIG1pbi9tYXgnLCAoKT0+e1xyXG4gICAgICAgICAgICB3aWRnZXQyLm1pbi53aWR0aCA9IDEwO1xyXG4gICAgICAgICAgICB3aWRnZXQyLm1heC53aWR0aCA9IDgwO1xyXG4gICAgICAgICAgICB3aWRnZXQyLndpZHRoID0gMTAwO1xyXG4gICAgICAgICAgICB3aWRnZXQyLnZhbGlkYXRlV2lkdGgoKTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIud2lkdGgpLnRvLmVxdWFsKDgwKTtcclxuICAgICAgICAgICAgd2lkZ2V0Mi53aWR0aCA9IDU7XHJcbiAgICAgICAgICAgIHdpZGdldDIudmFsaWRhdGVXaWR0aCgpO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0Mi53aWR0aCkudG8uZXF1YWwoMTApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyN2YWxpZGF0ZUhlaWdodCgpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGtlZXAgd2lkZ2V0cyBoZWlnaHQgd2l0aGluIG1pbi9tYXgnLCAoKT0+e1xyXG4gICAgICAgICAgICB3aWRnZXQyLm1pbi5oZWlnaHQgPSAxMDtcclxuICAgICAgICAgICAgd2lkZ2V0Mi5tYXguaGVpZ2h0ID0gODA7XHJcbiAgICAgICAgICAgIHdpZGdldDIuaGVpZ2h0ID0gMTAwO1xyXG4gICAgICAgICAgICB3aWRnZXQyLnZhbGlkYXRlSGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLmhlaWdodCkudG8uZXF1YWwoODApO1xyXG4gICAgICAgICAgICB3aWRnZXQyLmhlaWdodCA9IDU7XHJcbiAgICAgICAgICAgIHdpZGdldDIudmFsaWRhdGVIZWlnaHQoKTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIuaGVpZ2h0KS50by5lcXVhbCgxMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3VwZGF0ZSgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3ZhbGlkYXRlKCknLCAoKT0+e1xyXG5cclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjaW52YWxpZGF0ZSgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3JvdXRlSW52YWxpZGF0aW9uKCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgaW52YWxpZGF0ZSB0aGUgaGlnaGVzdCBwYXJlbnQnLCAoKT0+e1xyXG4gICAgICAgICAgICB3aWRnZXQxLmxheW91dFxyXG4gICAgICAgICAgICAgICAgPSBuZXcgU1QuTGF5b3V0cy5IQm94TGF5b3V0KHdpZGdldDEpO1xyXG4gICAgICAgICAgICB3aWRnZXQyLmxheW91dFxuICAgICAgICAgICAgICAgID0gbmV3IFNULkxheW91dHMuSEJveExheW91dCh3aWRnZXQyKTtcclxuICAgICAgICAgICAgICAgIHdpZGdldDIucm91dGVJbnZhbGlkYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQwLnZhbGlkKS50by5iZS5mYWxzZTtcclxuICAgICAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLnZhbGlkKS50by5iZS50cnVlO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIudmFsaWQpLnRvLmJlLnRydWU7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgaW52YWxpZGF0ZSB0aGUgZmlyc3QgcGFyZW50IHdpdGggYSBmaXhlZCBzaXplIHBvbGljeScsICgpPT57XHJcbiAgICAgICAgICAgIHdpZGdldDIucm91dGVJbnZhbGlkYXRpb24oKTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDAudmFsaWQpLnRvLmJlLnRydWU7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLnZhbGlkKS50by5iZS5mYWxzZTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIudmFsaWQpLnRvLmJlLnRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3JlY3Vyc2l2ZVJvdXRlVXBkYXRlKCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgcm91dGUgdXBkYXRlIHRvIGl0c2VsZiBpZiBubyBwYXJlbnQgZXhpc3QnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgdXBkYXRlU3B5ID0gc2lub24uc3B5KHdpZGdldDAsICd1cGRhdGUnKTtcclxuICAgICAgICAgICAgd2lkZ2V0MC5yZWN1cnNpdmVSb3V0ZVVwZGF0ZSgpO1xyXG4gICAgICAgICAgICBleHBlY3QodXBkYXRlU3B5LmNhbGxlZCkudG8uYmUudHJ1ZTtcclxuICAgICAgICAgICAgd2lkZ2V0MC51cGRhdGUucmVzdG9yZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIHJlY3Vyc2l2bGV5IHJ1biB0aGlzIGZ1bmN0aW9uIGlmIHRoZSBwYXJlbnQgaXMgdmFsaWQnLCAoKT0+e1xyXG4gICAgICAgICAgICB3aWRnZXQxLmludmFsaWRhdGUoKTtcclxuICAgICAgICAgICAgbGV0IHNweSA9IHNpbm9uLnNweSh3aWRnZXQxLCAncmVjdXJzaXZlUm91dGVVcGRhdGUnKTtcclxuICAgICAgICAgICAgd2lkZ2V0Mi5yZWN1cnNpdmVSb3V0ZVVwZGF0ZSgpO1xyXG4gICAgICAgICAgICBleHBlY3Qoc3B5LmNhbGxlZCkudG8uYmUudHJ1ZTtcclxuICAgICAgICAgICAgd2lkZ2V0MS5yZWN1cnNpdmVSb3V0ZVVwZGF0ZS5yZXN0b3JlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgcm91dGUgdXBkYXRlIHRvIGl0c2VsZiBpZiBwYXJlbnQgaXMgdmFsaWQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgdXBkYXRlU3B5ID0gc2lub24uc3B5KHdpZGdldDAsICd1cGRhdGUnKTtcclxuICAgICAgICAgICAgd2lkZ2V0MC5yZWN1cnNpdmVSb3V0ZVVwZGF0ZSgpO1xyXG4gICAgICAgICAgICBleHBlY3QodXBkYXRlU3B5LmNhbGxlZCkudG8uYmUudHJ1ZTtcclxuICAgICAgICAgICAgd2lkZ2V0MC51cGRhdGUucmVzdG9yZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNyZW5kZXJDYW52YXMoKScsICgpPT57XHJcblxyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNyZW5kZXJXZWJHTCgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3NldFBhcmVudCgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2FkZENoaWxkJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCBlYWNoIFBJWEkuQ29udGFpbmVycyBtYXNrIHRvIG51bGwnLCAoKT0+e1xuICAgICAgICAgICAgICAgIGxldCBwYyA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xyXG4gICAgICAgICAgICAgICAgd2lkZ2V0Mi5hZGRDaGlsZChwYyk7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QocGMubWFzaykudG8uYmUubnVsbDtcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgYWRkIGl0cyB0aGVtZSB0byBlYWNoIEJhc2VXaWRnZXQgY2hpbGQgYWRkZWQnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0Mi50aGVtZSkudG8uZXF1YWwod2lkZ2V0MS50aGVtZSk7XHJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBzZXQgbWFzayB0byBudWxsIGlmIGNoaWxkIGhhcyB1cGRhdGVPbkhvc3RDaGFuZ2VzID0gZmFsc2UgJ1xuICAgICAgICAgICAgKyAnZm9yIGJvdGggc2l6ZSBwb2xpY2llcycsICgpPT57XG4gICAgICAgICAgICAgICAgLy8gc2hvdWxkIHNldCB0byBwYXJlbnRcbiAgICAgICAgICAgIHdpZGdldDEubGF5b3V0ID0gbmV3IFNULkxheW91dHMuVkJveExheW91dCh3aWRnZXQxKTtcbiAgICAgICAgICAgIHdpZGdldDIuaFBvbGljeVxuICAgICAgICAgICAgPSBuZXcgU1QuU2l6ZVBvbGljaWVzLkZpeGVkUG9saWN5KHdpZGdldDIpO1xuXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0Mi5zaXplUHJveHkubWFzaykudG8uZXF1YWwod2lkZ2V0MS5jbGlwR3JhcGhpYyk7XG5cbiAgICAgICAgICAgIHdpZGdldDIuaFBvbGljeVxuICAgICAgICAgICAgPSBuZXcgU1QuU2l6ZVBvbGljaWVzLkV4cGFuZGluZ1BvbGljeSh3aWRnZXQyLCBTVC5IT1JJWk9OVEFMKTtcbiAgICAgICAgICAgIHdpZGdldDIudlBvbGljeVxuICAgICAgICAgICAgPSBuZXcgU1QuU2l6ZVBvbGljaWVzLkV4cGFuZGluZ1BvbGljeSh3aWRnZXQyLCBTVC5WRVJUSUNBTCk7XG5cbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLnNpemVQcm94eS5tYXNrKS50by5iZS5udWxsO1xuICAgICAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbWFzayBjaGlsZHJlbiBpZiBpdHMgbGF5b3V0IGhhcyB1cGRhdGVPbkhvc3RDaGFuZ2VzID0gdHJ1ZScsXG4gICAgICAgICgpPT57XG4gICAgICAgICAgICB3aWRnZXQxLmxheW91dCA9IG5ldyBTVC5MYXlvdXRzLkZpeGVkTGF5b3V0KHdpZGdldDEpO1xuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIuc2l6ZVByb3h5Lm1hc2spLnRvLmVxdWFsKHdpZGdldDEuY2xpcEdyYXBoaWMpO1xuICAgICAgICB9KTtcblxyXG4gICAgICAgIC8vIGl0KCdzaG91bGQgYWRkIGl0cyBjbGlwR3JhcGhpYyB0byBlYWNoIEJhc2VXaWRnZXQgY2hpbGQgYWRkZWRzJ1xuICAgICAgICAvLyAgICAgKyAnIHNpemUgcHJveHknLCAoKT0+e1xuICAgICAgICAvLyAgICAgZXhwZWN0KHdpZGdldDIuc2l6ZVByb3h5Lm1hc2spLnRvLmVxdWFsKHdpZGdldDEuY2xpcEdyYXBoaWMpO1xuICAgICAgICAvLyB9KTtcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2FkZENoaWxkQXQoKScsICgpPT57XHJcbiAgICAgICAgLy8gc2FtZSBhcyAjYWRkQ2hpbGRcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjb25DaGlsZHJlbkNoYW5nZSgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2FwcGx5UG9zaXRpb24oKScsICgpPT57XHJcblxyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJ191cGRhdGVDbGlwR3JhcGhpYygpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCB0byBzaXplIG9mIHdpZGdldCAtIHBhZGRpbmcnLCAoKT0+e1xuICAgICAgICAgICAgd2lkZ2V0Mi52UG9saWN5XG4gICAgICAgICAgICA9IG5ldyBTVC5TaXplUG9saWNpZXMuRml4ZWRQb2xpY3kod2lkZ2V0Mik7XG4gICAgICAgICAgICB3aWRnZXQyLm1heC53aWR0aCA9IDEwMDA7XHJcbiAgICAgICAgICAgIHdpZGdldDIubWF4LmhlaWdodCA9IDEwMDA7XHJcbiAgICAgICAgICAgIHdpZGdldDIud2lkdGggPSA0MDA7XHJcbiAgICAgICAgICAgIHdpZGdldDIuaGVpZ2h0ID0gNDAwO1xyXG4gICAgICAgICAgICB3aWRnZXQxLnVwZGF0ZSgpOyAvLyBzaG91bGQgY2FsbCBfdXBkYXRlQ2xpcEdyYXBoaWMoKVxyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0Mi5jbGlwR3JhcGhpYy53aWR0aCkudG8uZXF1YWwoMzkyKTtcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLmNsaXBHcmFwaGljLmhlaWdodCkudG8uZXF1YWwoMzkyKTtcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBwb3MgdG8gdGhlIHRvcCBsZWZ0IHBhZGRpbmcgdmFsdWVzJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIuY2xpcEdyYXBoaWMueCkudG8uZXF1YWwoNCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLmNsaXBHcmFwaGljLnkpLnRvLmVxdWFsKDQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIHNldCByZW5kZXJhYmxlIHRvIGZhbHNlJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIuY2xpcEdyYXBoaWMucmVuZGVyYWJsZSkudG8uYmUuZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3RoZW1lJywgKCk9PntcclxuICAgICAgICBsZXQgYVRobSA9IG5ldyBTVC5UaGVtZSgpO1xyXG4gICAgICAgIGl0KCdzaG91bGQgYXBwbHkgdGhlIHNldCB0aGVtZSB0byBjaGlsZHJlbiByZWN1cnNpdmVseScsICgpPT57XHJcbiAgICAgICAgICAgIHdpZGdldDAudGhlbWUgPSBhVGhtO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS50aGVtZSkudG8uZXF1YWwod2lkZ2V0MC50aGVtZSk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLnRoZW1lKS50by5lcXVhbCh3aWRnZXQxLnRoZW1lKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjZGlzYWJsZWQnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgZGlzYWJsZSBpdHNlbGYgYW5kIGl0cyBjaGlsZHJlbiB3aGVuIHNldCB0byBmYWxzZScsICgpPT57XHJcbiAgICAgICAgICAgIHdpZGdldDAuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MC5kaXNhYmxlZCkudG8uYmUudHJ1ZTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEuZGlzYWJsZWQpLnRvLmJlLnRydWU7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLmRpc2FibGVkKS50by5iZS50cnVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIGVuYWJsZSBpdHNlbGYgYW5kIGl0cyBjaGlsZHJlbiB3aGVuIHNldCB0byB0cnVlJywgKCk9PntcclxuICAgICAgICAgICAgd2lkZ2V0MC5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MC5kaXNhYmxlZCkudG8uYmUuZmFsc2U7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLmRpc2FibGVkKS50by5iZS5mYWxzZTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIuZGlzYWJsZWQpLnRvLmJlLmZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnI19ldmFsdWF0ZU1hc2soKScsICgpPT57XG4gICAgICAgIGl0KCdzaG91bGQgbWFzayBhbGwgY2hpbGRyZW4gaWYgbGF5b3V0LnVwZGF0ZU9uSG9zdENoYW5nZXMgPSB0cnVlJyxcbiAgICAgICAgKCk9PntcbiAgICAgICAgICAgIHdpZGdldDAubGF5b3V0ID0gbmV3IFNULkxheW91dHMuRml4ZWRMYXlvdXQod2lkZ2V0MCk7XG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS5tYXNrKS50by5lcXVhbCh3aWRnZXQwLmNsaXBHcmFwaGljKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBtYXNrIGNoaWxkIGlmIGVpdGhlciBwb2xpY3kgaGFzIHVwZGF0ZU9uSG9zdENoYW5nZXMgdHJ1ZSdcbiAgICAgICAgKyAnIGFuZCB0aGUgcGFyZW50cyBsYXlvdXQgaGFzIHVwZGF0ZU9uSG9zdENoYW5nZXMgZmFsc2UnLCAoKT0+e1xuICAgICAgICAgICAgd2lkZ2V0MC5sYXlvdXQgPSBuZXcgU1QuTGF5b3V0cy5WQm94TGF5b3V0KHdpZGdldDAsIFNULlZFUlRJQ0FMKTtcbiAgICAgICAgICAgIHdpZGdldDEuaFBvbGljeSA9IG5ldyBTVC5TaXplUG9saWNpZXMuRml4ZWRQb2xpY3kod2lkZ2V0MSk7XG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS5tYXNrKS50by5lcXVhbCh3aWRnZXQwLmNsaXBHcmFwaGljKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBzZXQgbWFzayB0byBudWxsIGlmIGxheW91dCBoYXMgdXBkYXRlT25Ib3N0Q2hhbmdlcyBmYWxzZSAnXG4gICAgICAgICsgJ2FuZCBjaGlsZHMgcG9saWNpZXMgaGF2ZSB1cGRhdGVPbkhvc3RDaGFuZ2VzIGZhbHNlJywgKCk9PntcbiAgICAgICAgICAgIHdpZGdldDAubGF5b3V0ID0gbmV3IFNULkxheW91dHMuVkJveExheW91dCh3aWRnZXQwLCBTVC5WRVJUSUNBTCk7XG4gICAgICAgICAgICB3aWRnZXQxLmhQb2xpY3lcbiAgICAgICAgICAgID0gbmV3IFNULlNpemVQb2xpY2llcy5FeHBhbmRpbmdQb2xpY3kod2lkZ2V0MSwgU1QuSE9SSVpPTlRBTCk7XG4gICAgICAgICAgICB3aWRnZXQxLnZQb2xpY3lcbiAgICAgICAgICAgID0gbmV3IFNULlNpemVQb2xpY2llcy5FeHBhbmRpbmdQb2xpY3kod2lkZ2V0MSwgU1QuVkVSVElDQUwpO1xuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEubWFzaykudG8uYmUubnVsbDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBzZXQgbWFzayB0byBudWxsIGlmIGNoaWxkIGlzIG5vdCBhIHdpZGdldCcsICgpPT57XG4gICAgICAgICAgICBsZXQgcGMgPSBuZXcgUElYSS5Db250YWluZXIoKTtcbiAgICAgICAgICAgIHdpZGdldDAuYWRkQ2hpbGQocGMpO1xuICAgICAgICAgICAgd2lkZ2V0MC5fZXZhbHVhdGVNYXNrKCk7XG4gICAgICAgICAgICBleHBlY3QocGMubWFzaykudG8uYmUubnVsbDtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ0J1dHRvbicsICgpPT57XHJcblxyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ0xhYmVsJywgKCk9PntcclxuICAgIGxldCBsYWJlbCA9IG5ldyBTVC5XaWRnZXRzLkxhYmVsKG51bGwsIHt0ZXh0OiAndGVzdCd9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIHNldCB0ZXh0IGZyb20gb3B0aW9uIGlmIHNldCcsICgpPT57XHJcbiAgICAgICAgZXhwZWN0KGxhYmVsLnRleHQpLnRvLmVxdWFsKCd0ZXN0Jyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI190ZXh0T2JqJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGhhdmUgYSBudWxsIG1hc2snLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3QobGFiZWwuX3RleHRPYmoubWFzaykudG8uZXF1YWwobnVsbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI19jbGlwR3JhcGhpYycsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBiZSB1bnJlbmRlcmFibGUnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3QobGFiZWwuX2NsaXBHcmFwaGljLnJlbmRlcmFibGUpLnRvLmVxdWFsKGZhbHNlKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjdGV4dCcsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCB1cGRhdGUgX3RleHRPYmpzIHRleHQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsYWJlbC50ZXh0ID0gJ3VwZGF0ZSc7XHJcbiAgICAgICAgICAgIGV4cGVjdChsYWJlbC5fdGV4dE9iai50ZXh0KS50by5lcXVhbCgndXBkYXRlJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdQYW5lbCcsICgpPT57XHJcbiAgICBsZXQgcGFuZWwgPSBuZXcgU1QuV2lkZ2V0cy5QYW5lbCgpO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjX2JrZ09iaicsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBiZSBhIHNwcml0ZScsICgpPT57XHJcbiAgICAgICAgICAgIGV4cGVjdChwYW5lbC5fYmtnT2JqKS50by5iZS5hbi5pbnN0YW5jZW9mKFBJWEkuU3ByaXRlKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ1NJVHJhbnNmb3JtJywgKCk9PntcclxuICAgIGl0KCdzaG91bGQgYWxsb3cgYSB3aWRnZXQgdG8gdHJhbnNmb3JtIGl0cyBkaW1lbnNpb25zJ1xyXG4gICAgICAgICsgJyBpbmRlcGVuZGVudCBmcm9tIGl0cyBwYXJlbnQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgd2lkZ2V0MCA9IG5ldyBTVC5XaWRnZXRzLlBhbmVsKCk7XHJcbiAgICAgICAgICAgIHdpZGdldDAud2lkdGggPSAxMDAwO1xyXG4gICAgICAgICAgICBsZXQgd2lkZ2V0MSA9IG5ldyBTVC5XaWRnZXRzLlBhbmVsKCk7XHJcbiAgICAgICAgICAgIHdpZGdldDEud2lkdGggPSAyMDA7XHJcbiAgICAgICAgICAgIHdpZGdldDAuYWRkQ2hpbGQod2lkZ2V0MSk7XHJcbiAgICAgICAgICAgIHdpZGdldDAud2lkdGggPSA1MDA7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLndpZHRoKS50by5lcXVhbCgyMDApO1xyXG4gICAgICAgIH0pO1xyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy8gVE9ETzogV291bGQgbGlrZSB0byBnZXQgbW9yZSB0ZXN0IGhlcmUgYXQgc29tZSBwb2ludFxyXG5cclxuZGVzY3JpYmUoJ1NsaWRlcicsICgpPT57XHJcbiAgICBsZXQgc2wgPSBuZXcgU1QuV2lkZ2V0cy5TbGlkZXIobnVsbCwge3dpZHRoOiAyMDAsIGhlaWdodDogMzB9KTtcclxuICAgIHNsLnVwZGF0ZSgpO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjdHJhY2snLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgYmUgYW4gaW1hZ2Ugd2lkZ2V0JywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHNsLnRyYWNrKS50by5iZS5hbi5pbnN0YW5jZW9mKFNULldpZGdldHMuSW1hZ2UpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyN0cmFja0hpdFJlY3QnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgYmUgYSByZWN0YW5nbGUnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3Qoc2wudHJhY2tIaXRSZWN0KS50by5iZS5hbi5pbnN0YW5jZW9mKFBJWEkuUmVjdGFuZ2xlKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjYnV0dG9uJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGJlIGFuIGltYWdlIHdpZGdldCcsICgpPT57XHJcbiAgICAgICAgICAgIGV4cGVjdChzbC5idXR0b24pLnRvLmJlLmFuLmluc3RhbmNlb2YoU1QuV2lkZ2V0cy5JbWFnZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3VwZGF0ZVRyYWNrSGl0UmVjdCgpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCB0aGUgc2l6ZSBvZiB0aGUgY2xpY2thYmxlIGFyZWEgb2YgdGhlIHRyYWNrJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHNsLnRyYWNrSGl0UmVjdC54KS50by5lcXVhbCgwKTtcclxuICAgICAgICAgICAgZXhwZWN0KHNsLnRyYWNrSGl0UmVjdC55KS50by5lcXVhbCgtNSk7XHJcbiAgICAgICAgICAgIGV4cGVjdChzbC50cmFja0hpdFJlY3Qud2lkdGgpLnRvLmVxdWFsKDIwMCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChzbC50cmFja0hpdFJlY3QuaGVpZ2h0KS50by5lcXVhbChzbC50cmFjay5oZWlnaHQgKyAxMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3ZhbHVlJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCB0aGUgYnV0dG9ucyBwb3Mgd2hlbiBzZXQnLCAoKT0+e1xyXG4gICAgICAgICAgICBzbC52YWx1ZSA9IDAuNTtcclxuICAgICAgICAgICAgY29uc3QgYWN0dWFsID0gOTA7XHJcbiAgICAgICAgICAgIGV4cGVjdChzbC5idXR0b24ueCkudG8uZXF1YWwoYWN0dWFsKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gdGhlIHZhbHVlIGZyb20gdGhlIHBvc2l0aW9uJywgKCk9PntcclxuICAgICAgICAgICAgY29uc3QgYWN0dWFsID0gMC41O1xyXG4gICAgICAgICAgICBleHBlY3Qoc2wudmFsdWUpLnRvLmVxdWFsKGFjdHVhbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI29yaWVudGF0aW9uJywgKCk9PntcclxuICAgICAgICBzbC5vcmllbnRhdGlvbiA9IFNULkhPUklaT05UQUw7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBtaW4gYW5kIG1heCBoZWlnaHRzIHdoZW4gc2V0JywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHNsLm1pbi5oZWlnaHQpLnRvLmVxdWFsKHNsLmJ1dHRvbi5oZWlnaHQpO1xyXG4gICAgICAgICAgICBleHBlY3Qoc2wubWluLndpZHRoKS50by5lcXVhbChzbC5idXR0b24ud2lkdGgqMik7XHJcbiAgICAgICAgICAgIGV4cGVjdChzbC5tYXguaGVpZ2h0KS50by5lcXVhbChzbC5idXR0b24uaGVpZ2h0KTtcclxuICAgICAgICAgICAgZXhwZWN0KHNsLm1heC53aWR0aCkudG8uZXF1YWwoMTAwMDApO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIHNldCB0aGUgdHJhY2sgc2l6ZScsICgpPT57XHJcbiAgICAgICAgICAgIGV4cGVjdChzbC50cmFjay53aWR0aCkudG8uZXF1YWwoc2wud2lkdGgpO1xyXG4gICAgICAgICAgICBleHBlY3Qoc2wudHJhY2suaGVpZ2h0KS50by5lcXVhbCg1KTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCBzZXQgYWxpZ25tZW50cycsICgpPT57XHJcbiAgICAgICAgICAgIGV4cGVjdChzbC5sYXlvdXQuYWxpZ25tZW50LmhBbGlnbikudG8uZXF1YWwoU1QuQWxpZ25tZW50LmxlZnQpO1xyXG4gICAgICAgICAgICBleHBlY3Qoc2wubGF5b3V0LmFsaWdubWVudC52QWxpZ24pLnRvLmVxdWFsKFNULkFsaWdubWVudC5taWRkbGUpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIHNldCB0aGUgdHJhY2tzIHNpemUgcG9saWNpZXMnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3Qoc2wudHJhY2suaFBvbGljeSkudG8uYmUuYW5cclxuICAgICAgICAgICAgICAgIC5pbnN0YW5jZW9mKFNULlNpemVQb2xpY2llcy5FeHBhbmRpbmdQb2xpY3kpO1xyXG5cclxuICAgICAgICAgICAgZXhwZWN0KHNsLnRyYWNrLnZQb2xpY3kpLnRvLmJlLmFuXHJcbiAgICAgICAgICAgICAgICAuaW5zdGFuY2VvZihTVC5TaXplUG9saWNpZXMuRml4ZWRQb2xpY3kpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnU3RhZ2VXaWRnZXQnLCAoKT0+e1xyXG4gICAgaXQoJ1Nob3VsZCBoYXZlIGEgYm91bmRzIGFzIGJpZyBhcyB0aGUgdXNlciBkZWZpbmVkIHNpemUnLCAoKT0+e1xyXG4gICAgICAgIGxldCBzdyA9IG5ldyBTVC5XaWRnZXRzLlN0YWdlV2lkZ2V0KG51bGwsIHt3aWR0aDogNjAwLCBoZWlnaHQ6IDgwMH0pO1xyXG4gICAgICAgIGxldCBiMSA9IG5ldyBTVC5XaWRnZXRzLkJ1dHRvbihzdywge3dpZHRoOiA5MDAsIGhlaWdodDogOTAwfSk7IC8vZXNsaW50LWRpc2FibGUtbGluZVxyXG4gICAgICAgIGxldCBiMiA9IG5ldyBTVC5XaWRnZXRzLlBhbmVsKHN3LCB7d2lkdGg6IDEwMCwgaGVpZ2h0OiAxMDAsIHg6IDcwMH0pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXHJcbiAgICAgICAgbGV0IGJvdW5kcyA9IHN3LmdldEJvdW5kcygpO1xyXG5cclxuICAgICAgICBleHBlY3QoYm91bmRzLndpZHRoKS50by5lcXVhbCg2MDApO1xyXG4gICAgICAgIGV4cGVjdChib3VuZHMuaGVpZ2h0KS50by5lcXVhbCg4MDApO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnVGV4dEJ1dHRvbicsICgpPT57XHJcbiAgICBkZXNjcmliZSgnI1RleHQnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSB0ZXh0IGZvciB0aGUgY29udGFpbmVkIGxhYmVsJywgKCk9PntcclxuICAgICAgICAgICAgbGV0IHRiID0gbmV3IFNULldpZGdldHMuVGV4dEJ1dHRvbigpO1xyXG4gICAgICAgICAgICB0Yi50ZXh0ID0gJ21lb3cnO1xyXG4gICAgICAgICAgICBleHBlY3QodGIubGFiZWwudGV4dCkudG8uZXF1YWwoJ21lb3cnKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwicmVxdWlyZSgnLi9CYXNlV2lkZ2V0LXNwZWMnKTtcclxucmVxdWlyZSgnLi9CdXR0b24tc3BlYycpO1xyXG5yZXF1aXJlKCcuL0xhYmVsLXNwZWMnKTtcclxucmVxdWlyZSgnLi9QYW5lbC1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vU0lUcmFuc2Zvcm0tc3BlYycpO1xyXG5yZXF1aXJlKCcuL1N0YWdlV2lkZ2V0LXNwZWMnKTtcclxucmVxdWlyZSgnLi9UZXh0QnV0dG9uLXNwZWMnKTtcclxucmVxdWlyZSgnLi9TbGlkZXItc3BlYycpO1xyXG4iXX0=
