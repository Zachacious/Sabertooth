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

    describe('#getFocusedWidget', function () {
        it('should return the widget currently in focus', function () {
            widget1.focus();
            expect(ST.Widgets.BaseWidget.getFocusedWidget()).to.equal(widget1);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsInRlc3RcXHRlc3RcXGluZGV4LmpzIiwidGVzdFxcc3BlY1xcdGVzdFxcc3BlY1xcQXBwLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx0ZXN0XFxzcGVjXFxHcmFwaGljc0dlbi1zcGVjLmpzIiwidGVzdFxcc3BlY1xcdGVzdFxcc3BlY1xcUGFkZGluZy1zcGVjLmpzIiwidGVzdFxcc3BlY1xcdGVzdFxcc3BlY1xcUG9pbnQtc3BlYy5qcyIsInRlc3RcXHNwZWNcXHRlc3RcXHNwZWNcXFNldHRpbmdzLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx0ZXN0XFxzcGVjXFxTaXplLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx0ZXN0XFxzcGVjXFxUaGVtZS1zcGVjLmpzIiwidGVzdFxcc3BlY1xcdGVzdFxcc3BlY1xcaW5kZXguanMiLCJ0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcQWxpZ25tZW50LXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcaW5kZXguanMiLCJ0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXGxheW91dHNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcbGF5b3V0c1xcQmFzZUxheW91dC1zcGVjLmpzIiwidGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxsYXlvdXRzXFx0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXGxheW91dHNcXEJveExheW91dC1zcGVjLmpzIiwidGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxsYXlvdXRzXFx0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXGxheW91dHNcXEZpeGVkTGF5b3V0LXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXGxheW91dHNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcbGF5b3V0c1xcSEJveExheW91dC1zcGVjLmpzIiwidGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxsYXlvdXRzXFx0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXGxheW91dHNcXFZCb3hMYXlvdXQtc3BlYy5qcyIsInRlc3RcXHNwZWNcXGxheW91dFN5c1xcbGF5b3V0c1xcdGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxsYXlvdXRzXFxpbmRleC5qcyIsInRlc3RcXHNwZWNcXGxheW91dFN5c1xcc2l6ZVBvbGljaWVzXFx0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXHNpemVQb2xpY2llc1xcQmFzZVBvbGljeS1zcGVjLmpzIiwidGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxzaXplUG9saWNpZXNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcc2l6ZVBvbGljaWVzXFxFeHBhbmRpbmdQb2xpY3ktc3BlYy5qcyIsInRlc3RcXHNwZWNcXGxheW91dFN5c1xcc2l6ZVBvbGljaWVzXFx0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXHNpemVQb2xpY2llc1xcRml4ZWRQb2xpY3ktc3BlYy5qcyIsInRlc3RcXHNwZWNcXGxheW91dFN5c1xcc2l6ZVBvbGljaWVzXFx0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXHNpemVQb2xpY2llc1xcU2hhcmVkRXhwYW5kaW5nUG9saWN5LXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXHNpemVQb2xpY2llc1xcdGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxzaXplUG9saWNpZXNcXGluZGV4LmpzIiwidGVzdFxcc3BlY1xcd2lkZ2V0c1xcdGVzdFxcc3BlY1xcd2lkZ2V0c1xcQmFzZVdpZGdldC1zcGVjLmpzIiwidGVzdFxcc3BlY1xcd2lkZ2V0c1xcdGVzdFxcc3BlY1xcd2lkZ2V0c1xcQnV0dG9uLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx3aWRnZXRzXFx0ZXN0XFxzcGVjXFx3aWRnZXRzXFxMYWJlbC1zcGVjLmpzIiwidGVzdFxcc3BlY1xcd2lkZ2V0c1xcdGVzdFxcc3BlY1xcd2lkZ2V0c1xcUGFuZWwtc3BlYy5qcyIsInRlc3RcXHNwZWNcXHdpZGdldHNcXHRlc3RcXHNwZWNcXHdpZGdldHNcXFNJVHJhbnNmb3JtLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx3aWRnZXRzXFx0ZXN0XFxzcGVjXFx3aWRnZXRzXFxTbGlkZXItc3BlYy5qcyIsInRlc3RcXHNwZWNcXHdpZGdldHNcXHRlc3RcXHNwZWNcXHdpZGdldHNcXFN0YWdlV2lkZ2V0LXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx3aWRnZXRzXFx0ZXN0XFxzcGVjXFx3aWRnZXRzXFxUZXh0QnV0dG9uLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx3aWRnZXRzXFx0ZXN0XFxzcGVjXFx3aWRnZXRzXFxpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNsSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzFxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDcEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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ekIsQ0FBK0IsTUFBL0I7QUFDSCxTQUpEO0FBS0gsS0FORDtBQU9ILENBUkQ7Ozs7Ozs7O0FDRkEsUUFBUSxtQkFBUjtBQUNBLFFBQVEsZUFBUjtBQUNBLFFBQVEsY0FBUjtBQUNBLFFBQVEsY0FBUjtBQUNBLFFBQVEsb0JBQVI7QUFDQSxRQUFRLG9CQUFSO0FBQ0EsUUFBUSxtQkFBUjtBQUNBLFFBQVEsZUFBUiIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCdcblxuZXhwb3J0cy5ieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aFxuZXhwb3J0cy50b0J5dGVBcnJheSA9IHRvQnl0ZUFycmF5XG5leHBvcnRzLmZyb21CeXRlQXJyYXkgPSBmcm9tQnl0ZUFycmF5XG5cbnZhciBsb29rdXAgPSBbXVxudmFyIHJldkxvb2t1cCA9IFtdXG52YXIgQXJyID0gdHlwZW9mIFVpbnQ4QXJyYXkgIT09ICd1bmRlZmluZWQnID8gVWludDhBcnJheSA6IEFycmF5XG5cbnZhciBjb2RlID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky8nXG5mb3IgKHZhciBpID0gMCwgbGVuID0gY29kZS5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICBsb29rdXBbaV0gPSBjb2RlW2ldXG4gIHJldkxvb2t1cFtjb2RlLmNoYXJDb2RlQXQoaSldID0gaVxufVxuXG5yZXZMb29rdXBbJy0nLmNoYXJDb2RlQXQoMCldID0gNjJcbnJldkxvb2t1cFsnXycuY2hhckNvZGVBdCgwKV0gPSA2M1xuXG5mdW5jdGlvbiBwbGFjZUhvbGRlcnNDb3VudCAoYjY0KSB7XG4gIHZhciBsZW4gPSBiNjQubGVuZ3RoXG4gIGlmIChsZW4gJSA0ID4gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBzdHJpbmcuIExlbmd0aCBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNCcpXG4gIH1cblxuICAvLyB0aGUgbnVtYmVyIG9mIGVxdWFsIHNpZ25zIChwbGFjZSBob2xkZXJzKVxuICAvLyBpZiB0aGVyZSBhcmUgdHdvIHBsYWNlaG9sZGVycywgdGhhbiB0aGUgdHdvIGNoYXJhY3RlcnMgYmVmb3JlIGl0XG4gIC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuICAvLyBpZiB0aGVyZSBpcyBvbmx5IG9uZSwgdGhlbiB0aGUgdGhyZWUgY2hhcmFjdGVycyBiZWZvcmUgaXQgcmVwcmVzZW50IDIgYnl0ZXNcbiAgLy8gdGhpcyBpcyBqdXN0IGEgY2hlYXAgaGFjayB0byBub3QgZG8gaW5kZXhPZiB0d2ljZVxuICByZXR1cm4gYjY0W2xlbiAtIDJdID09PSAnPScgPyAyIDogYjY0W2xlbiAtIDFdID09PSAnPScgPyAxIDogMFxufVxuXG5mdW5jdGlvbiBieXRlTGVuZ3RoIChiNjQpIHtcbiAgLy8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG4gIHJldHVybiBiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnNDb3VudChiNjQpXG59XG5cbmZ1bmN0aW9uIHRvQnl0ZUFycmF5IChiNjQpIHtcbiAgdmFyIGksIGosIGwsIHRtcCwgcGxhY2VIb2xkZXJzLCBhcnJcbiAgdmFyIGxlbiA9IGI2NC5sZW5ndGhcbiAgcGxhY2VIb2xkZXJzID0gcGxhY2VIb2xkZXJzQ291bnQoYjY0KVxuXG4gIGFyciA9IG5ldyBBcnIobGVuICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cbiAgLy8gaWYgdGhlcmUgYXJlIHBsYWNlaG9sZGVycywgb25seSBnZXQgdXAgdG8gdGhlIGxhc3QgY29tcGxldGUgNCBjaGFyc1xuICBsID0gcGxhY2VIb2xkZXJzID4gMCA/IGxlbiAtIDQgOiBsZW5cblxuICB2YXIgTCA9IDBcblxuICBmb3IgKGkgPSAwLCBqID0gMDsgaSA8IGw7IGkgKz0gNCwgaiArPSAzKSB7XG4gICAgdG1wID0gKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMTgpIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDEyKSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDIpXSA8PCA2KSB8IHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMyldXG4gICAgYXJyW0wrK10gPSAodG1wID4+IDE2KSAmIDB4RkZcbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW0wrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICBpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG4gICAgdG1wID0gKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMikgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPj4gNClcbiAgICBhcnJbTCsrXSA9IHRtcCAmIDB4RkZcbiAgfSBlbHNlIGlmIChwbGFjZUhvbGRlcnMgPT09IDEpIHtcbiAgICB0bXAgPSAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkpXSA8PCAxMCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAxKV0gPDwgNCkgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPj4gMilcbiAgICBhcnJbTCsrXSA9ICh0bXAgPj4gOCkgJiAweEZGXG4gICAgYXJyW0wrK10gPSB0bXAgJiAweEZGXG4gIH1cblxuICByZXR1cm4gYXJyXG59XG5cbmZ1bmN0aW9uIHRyaXBsZXRUb0Jhc2U2NCAobnVtKSB7XG4gIHJldHVybiBsb29rdXBbbnVtID4+IDE4ICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDEyICYgMHgzRl0gKyBsb29rdXBbbnVtID4+IDYgJiAweDNGXSArIGxvb2t1cFtudW0gJiAweDNGXVxufVxuXG5mdW5jdGlvbiBlbmNvZGVDaHVuayAodWludDgsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHRtcFxuICB2YXIgb3V0cHV0ID0gW11cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyBpICs9IDMpIHtcbiAgICB0bXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG4gICAgb3V0cHV0LnB1c2godHJpcGxldFRvQmFzZTY0KHRtcCkpXG4gIH1cbiAgcmV0dXJuIG91dHB1dC5qb2luKCcnKVxufVxuXG5mdW5jdGlvbiBmcm9tQnl0ZUFycmF5ICh1aW50OCkge1xuICB2YXIgdG1wXG4gIHZhciBsZW4gPSB1aW50OC5sZW5ndGhcbiAgdmFyIGV4dHJhQnl0ZXMgPSBsZW4gJSAzIC8vIGlmIHdlIGhhdmUgMSBieXRlIGxlZnQsIHBhZCAyIGJ5dGVzXG4gIHZhciBvdXRwdXQgPSAnJ1xuICB2YXIgcGFydHMgPSBbXVxuICB2YXIgbWF4Q2h1bmtMZW5ndGggPSAxNjM4MyAvLyBtdXN0IGJlIG11bHRpcGxlIG9mIDNcblxuICAvLyBnbyB0aHJvdWdoIHRoZSBhcnJheSBldmVyeSB0aHJlZSBieXRlcywgd2UnbGwgZGVhbCB3aXRoIHRyYWlsaW5nIHN0dWZmIGxhdGVyXG4gIGZvciAodmFyIGkgPSAwLCBsZW4yID0gbGVuIC0gZXh0cmFCeXRlczsgaSA8IGxlbjI7IGkgKz0gbWF4Q2h1bmtMZW5ndGgpIHtcbiAgICBwYXJ0cy5wdXNoKGVuY29kZUNodW5rKHVpbnQ4LCBpLCAoaSArIG1heENodW5rTGVuZ3RoKSA+IGxlbjIgPyBsZW4yIDogKGkgKyBtYXhDaHVua0xlbmd0aCkpKVxuICB9XG5cbiAgLy8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuICBpZiAoZXh0cmFCeXRlcyA9PT0gMSkge1xuICAgIHRtcCA9IHVpbnQ4W2xlbiAtIDFdXG4gICAgb3V0cHV0ICs9IGxvb2t1cFt0bXAgPj4gMl1cbiAgICBvdXRwdXQgKz0gbG9va3VwWyh0bXAgPDwgNCkgJiAweDNGXVxuICAgIG91dHB1dCArPSAnPT0nXG4gIH0gZWxzZSBpZiAoZXh0cmFCeXRlcyA9PT0gMikge1xuICAgIHRtcCA9ICh1aW50OFtsZW4gLSAyXSA8PCA4KSArICh1aW50OFtsZW4gLSAxXSlcbiAgICBvdXRwdXQgKz0gbG9va3VwW3RtcCA+PiAxMF1cbiAgICBvdXRwdXQgKz0gbG9va3VwWyh0bXAgPj4gNCkgJiAweDNGXVxuICAgIG91dHB1dCArPSBsb29rdXBbKHRtcCA8PCAyKSAmIDB4M0ZdXG4gICAgb3V0cHV0ICs9ICc9J1xuICB9XG5cbiAgcGFydHMucHVzaChvdXRwdXQpXG5cbiAgcmV0dXJuIHBhcnRzLmpvaW4oJycpXG59XG4iLCIvKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG4vKiBlc2xpbnQtZGlzYWJsZSBuby1wcm90byAqL1xuXG4ndXNlIHN0cmljdCdcblxudmFyIGJhc2U2NCA9IHJlcXVpcmUoJ2Jhc2U2NC1qcycpXG52YXIgaWVlZTc1NCA9IHJlcXVpcmUoJ2llZWU3NTQnKVxuXG5leHBvcnRzLkJ1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5TbG93QnVmZmVyID0gU2xvd0J1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5cbnZhciBLX01BWF9MRU5HVEggPSAweDdmZmZmZmZmXG5leHBvcnRzLmtNYXhMZW5ndGggPSBLX01BWF9MRU5HVEhcblxuLyoqXG4gKiBJZiBgQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlRgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgUHJpbnQgd2FybmluZyBhbmQgcmVjb21tZW5kIHVzaW5nIGBidWZmZXJgIHY0Lnggd2hpY2ggaGFzIGFuIE9iamVjdFxuICogICAgICAgICAgICAgICBpbXBsZW1lbnRhdGlvbiAobW9zdCBjb21wYXRpYmxlLCBldmVuIElFNilcbiAqXG4gKiBCcm93c2VycyB0aGF0IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssIENocm9tZSA3KywgU2FmYXJpIDUuMSssXG4gKiBPcGVyYSAxMS42KywgaU9TIDQuMisuXG4gKlxuICogV2UgcmVwb3J0IHRoYXQgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCB0eXBlZCBhcnJheXMgaWYgdGhlIGFyZSBub3Qgc3ViY2xhc3NhYmxlXG4gKiB1c2luZyBfX3Byb3RvX18uIEZpcmVmb3ggNC0yOSBsYWNrcyBzdXBwb3J0IGZvciBhZGRpbmcgbmV3IHByb3BlcnRpZXMgdG8gYFVpbnQ4QXJyYXlgXG4gKiAoU2VlOiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD02OTU0MzgpLiBJRSAxMCBsYWNrcyBzdXBwb3J0XG4gKiBmb3IgX19wcm90b19fIGFuZCBoYXMgYSBidWdneSB0eXBlZCBhcnJheSBpbXBsZW1lbnRhdGlvbi5cbiAqL1xuQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgPSB0eXBlZEFycmF5U3VwcG9ydCgpXG5cbmlmICghQnVmZmVyLlRZUEVEX0FSUkFZX1NVUFBPUlQgJiYgdHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmXG4gICAgdHlwZW9mIGNvbnNvbGUuZXJyb3IgPT09ICdmdW5jdGlvbicpIHtcbiAgY29uc29sZS5lcnJvcihcbiAgICAnVGhpcyBicm93c2VyIGxhY2tzIHR5cGVkIGFycmF5IChVaW50OEFycmF5KSBzdXBwb3J0IHdoaWNoIGlzIHJlcXVpcmVkIGJ5ICcgK1xuICAgICdgYnVmZmVyYCB2NS54LiBVc2UgYGJ1ZmZlcmAgdjQueCBpZiB5b3UgcmVxdWlyZSBvbGQgYnJvd3NlciBzdXBwb3J0LidcbiAgKVxufVxuXG5mdW5jdGlvbiB0eXBlZEFycmF5U3VwcG9ydCAoKSB7XG4gIC8vIENhbiB0eXBlZCBhcnJheSBpbnN0YW5jZXMgY2FuIGJlIGF1Z21lbnRlZD9cbiAgdHJ5IHtcbiAgICB2YXIgYXJyID0gbmV3IFVpbnQ4QXJyYXkoMSlcbiAgICBhcnIuX19wcm90b19fID0ge19fcHJvdG9fXzogVWludDhBcnJheS5wcm90b3R5cGUsIGZvbzogZnVuY3Rpb24gKCkgeyByZXR1cm4gNDIgfX1cbiAgICByZXR1cm4gYXJyLmZvbygpID09PSA0MlxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuZnVuY3Rpb24gY3JlYXRlQnVmZmVyIChsZW5ndGgpIHtcbiAgaWYgKGxlbmd0aCA+IEtfTUFYX0xFTkdUSCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbnZhbGlkIHR5cGVkIGFycmF5IGxlbmd0aCcpXG4gIH1cbiAgLy8gUmV0dXJuIGFuIGF1Z21lbnRlZCBgVWludDhBcnJheWAgaW5zdGFuY2VcbiAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGxlbmd0aClcbiAgYnVmLl9fcHJvdG9fXyA9IEJ1ZmZlci5wcm90b3R5cGVcbiAgcmV0dXJuIGJ1ZlxufVxuXG4vKipcbiAqIFRoZSBCdWZmZXIgY29uc3RydWN0b3IgcmV0dXJucyBpbnN0YW5jZXMgb2YgYFVpbnQ4QXJyYXlgIHRoYXQgaGF2ZSB0aGVpclxuICogcHJvdG90eXBlIGNoYW5nZWQgdG8gYEJ1ZmZlci5wcm90b3R5cGVgLiBGdXJ0aGVybW9yZSwgYEJ1ZmZlcmAgaXMgYSBzdWJjbGFzcyBvZlxuICogYFVpbnQ4QXJyYXlgLCBzbyB0aGUgcmV0dXJuZWQgaW5zdGFuY2VzIHdpbGwgaGF2ZSBhbGwgdGhlIG5vZGUgYEJ1ZmZlcmAgbWV0aG9kc1xuICogYW5kIHRoZSBgVWludDhBcnJheWAgbWV0aG9kcy4gU3F1YXJlIGJyYWNrZXQgbm90YXRpb24gd29ya3MgYXMgZXhwZWN0ZWQgLS0gaXRcbiAqIHJldHVybnMgYSBzaW5nbGUgb2N0ZXQuXG4gKlxuICogVGhlIGBVaW50OEFycmF5YCBwcm90b3R5cGUgcmVtYWlucyB1bm1vZGlmaWVkLlxuICovXG5cbmZ1bmN0aW9uIEJ1ZmZlciAoYXJnLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgLy8gQ29tbW9uIGNhc2UuXG4gIGlmICh0eXBlb2YgYXJnID09PSAnbnVtYmVyJykge1xuICAgIGlmICh0eXBlb2YgZW5jb2RpbmdPck9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ0lmIGVuY29kaW5nIGlzIHNwZWNpZmllZCB0aGVuIHRoZSBmaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nJ1xuICAgICAgKVxuICAgIH1cbiAgICByZXR1cm4gYWxsb2NVbnNhZmUoYXJnKVxuICB9XG4gIHJldHVybiBmcm9tKGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG4vLyBGaXggc3ViYXJyYXkoKSBpbiBFUzIwMTYuIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvcHVsbC85N1xuaWYgKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC5zcGVjaWVzICYmXG4gICAgQnVmZmVyW1N5bWJvbC5zcGVjaWVzXSA9PT0gQnVmZmVyKSB7XG4gIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShCdWZmZXIsIFN5bWJvbC5zcGVjaWVzLCB7XG4gICAgdmFsdWU6IG51bGwsXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IGZhbHNlLFxuICAgIHdyaXRhYmxlOiBmYWxzZVxuICB9KVxufVxuXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyIC8vIG5vdCB1c2VkIGJ5IHRoaXMgaW1wbGVtZW50YXRpb25cblxuZnVuY3Rpb24gZnJvbSAodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1widmFsdWVcIiBhcmd1bWVudCBtdXN0IG5vdCBiZSBhIG51bWJlcicpXG4gIH1cblxuICBpZiAodmFsdWUgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgIHJldHVybiBmcm9tQXJyYXlCdWZmZXIodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIGZyb21TdHJpbmcodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQpXG4gIH1cblxuICByZXR1cm4gZnJvbU9iamVjdCh2YWx1ZSlcbn1cblxuLyoqXG4gKiBGdW5jdGlvbmFsbHkgZXF1aXZhbGVudCB0byBCdWZmZXIoYXJnLCBlbmNvZGluZykgYnV0IHRocm93cyBhIFR5cGVFcnJvclxuICogaWYgdmFsdWUgaXMgYSBudW1iZXIuXG4gKiBCdWZmZXIuZnJvbShzdHJbLCBlbmNvZGluZ10pXG4gKiBCdWZmZXIuZnJvbShhcnJheSlcbiAqIEJ1ZmZlci5mcm9tKGJ1ZmZlcilcbiAqIEJ1ZmZlci5mcm9tKGFycmF5QnVmZmVyWywgYnl0ZU9mZnNldFssIGxlbmd0aF1dKVxuICoqL1xuQnVmZmVyLmZyb20gPSBmdW5jdGlvbiAodmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gZnJvbSh2YWx1ZSwgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKVxufVxuXG4vLyBOb3RlOiBDaGFuZ2UgcHJvdG90eXBlICphZnRlciogQnVmZmVyLmZyb20gaXMgZGVmaW5lZCB0byB3b3JrYXJvdW5kIENocm9tZSBidWc6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9wdWxsLzE0OFxuQnVmZmVyLnByb3RvdHlwZS5fX3Byb3RvX18gPSBVaW50OEFycmF5LnByb3RvdHlwZVxuQnVmZmVyLl9fcHJvdG9fXyA9IFVpbnQ4QXJyYXlcblxuZnVuY3Rpb24gYXNzZXJ0U2l6ZSAoc2l6ZSkge1xuICBpZiAodHlwZW9mIHNpemUgIT09ICdudW1iZXInKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJzaXplXCIgYXJndW1lbnQgbXVzdCBiZSBhIG51bWJlcicpXG4gIH0gZWxzZSBpZiAoc2l6ZSA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJzaXplXCIgYXJndW1lbnQgbXVzdCBub3QgYmUgbmVnYXRpdmUnKVxuICB9XG59XG5cbmZ1bmN0aW9uIGFsbG9jIChzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICBhc3NlcnRTaXplKHNpemUpXG4gIGlmIChzaXplIDw9IDApIHtcbiAgICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUpXG4gIH1cbiAgaWYgKGZpbGwgIT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE9ubHkgcGF5IGF0dGVudGlvbiB0byBlbmNvZGluZyBpZiBpdCdzIGEgc3RyaW5nLiBUaGlzXG4gICAgLy8gcHJldmVudHMgYWNjaWRlbnRhbGx5IHNlbmRpbmcgaW4gYSBudW1iZXIgdGhhdCB3b3VsZFxuICAgIC8vIGJlIGludGVycHJldHRlZCBhcyBhIHN0YXJ0IG9mZnNldC5cbiAgICByZXR1cm4gdHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJ1xuICAgICAgPyBjcmVhdGVCdWZmZXIoc2l6ZSkuZmlsbChmaWxsLCBlbmNvZGluZylcbiAgICAgIDogY3JlYXRlQnVmZmVyKHNpemUpLmZpbGwoZmlsbClcbiAgfVxuICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUpXG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBmaWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICogYWxsb2Moc2l6ZVssIGZpbGxbLCBlbmNvZGluZ11dKVxuICoqL1xuQnVmZmVyLmFsbG9jID0gZnVuY3Rpb24gKHNpemUsIGZpbGwsIGVuY29kaW5nKSB7XG4gIHJldHVybiBhbGxvYyhzaXplLCBmaWxsLCBlbmNvZGluZylcbn1cblxuZnVuY3Rpb24gYWxsb2NVbnNhZmUgKHNpemUpIHtcbiAgYXNzZXJ0U2l6ZShzaXplKVxuICByZXR1cm4gY3JlYXRlQnVmZmVyKHNpemUgPCAwID8gMCA6IGNoZWNrZWQoc2l6ZSkgfCAwKVxufVxuXG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gQnVmZmVyKG51bSksIGJ5IGRlZmF1bHQgY3JlYXRlcyBhIG5vbi16ZXJvLWZpbGxlZCBCdWZmZXIgaW5zdGFuY2UuXG4gKiAqL1xuQnVmZmVyLmFsbG9jVW5zYWZlID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKHNpemUpXG59XG4vKipcbiAqIEVxdWl2YWxlbnQgdG8gU2xvd0J1ZmZlcihudW0pLCBieSBkZWZhdWx0IGNyZWF0ZXMgYSBub24temVyby1maWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICovXG5CdWZmZXIuYWxsb2NVbnNhZmVTbG93ID0gZnVuY3Rpb24gKHNpemUpIHtcbiAgcmV0dXJuIGFsbG9jVW5zYWZlKHNpemUpXG59XG5cbmZ1bmN0aW9uIGZyb21TdHJpbmcgKHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycgfHwgZW5jb2RpbmcgPT09ICcnKSB7XG4gICAgZW5jb2RpbmcgPSAndXRmOCdcbiAgfVxuXG4gIGlmICghQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJlbmNvZGluZ1wiIG11c3QgYmUgYSB2YWxpZCBzdHJpbmcgZW5jb2RpbmcnKVxuICB9XG5cbiAgdmFyIGxlbmd0aCA9IGJ5dGVMZW5ndGgoc3RyaW5nLCBlbmNvZGluZykgfCAwXG4gIHZhciBidWYgPSBjcmVhdGVCdWZmZXIobGVuZ3RoKVxuXG4gIHZhciBhY3R1YWwgPSBidWYud3JpdGUoc3RyaW5nLCBlbmNvZGluZylcblxuICBpZiAoYWN0dWFsICE9PSBsZW5ndGgpIHtcbiAgICAvLyBXcml0aW5nIGEgaGV4IHN0cmluZywgZm9yIGV4YW1wbGUsIHRoYXQgY29udGFpbnMgaW52YWxpZCBjaGFyYWN0ZXJzIHdpbGxcbiAgICAvLyBjYXVzZSBldmVyeXRoaW5nIGFmdGVyIHRoZSBmaXJzdCBpbnZhbGlkIGNoYXJhY3RlciB0byBiZSBpZ25vcmVkLiAoZS5nLlxuICAgIC8vICdhYnh4Y2QnIHdpbGwgYmUgdHJlYXRlZCBhcyAnYWInKVxuICAgIGJ1ZiA9IGJ1Zi5zbGljZSgwLCBhY3R1YWwpXG4gIH1cblxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUxpa2UgKGFycmF5KSB7XG4gIHZhciBsZW5ndGggPSBhcnJheS5sZW5ndGggPCAwID8gMCA6IGNoZWNrZWQoYXJyYXkubGVuZ3RoKSB8IDBcbiAgdmFyIGJ1ZiA9IGNyZWF0ZUJ1ZmZlcihsZW5ndGgpXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpICs9IDEpIHtcbiAgICBidWZbaV0gPSBhcnJheVtpXSAmIDI1NVxuICB9XG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbUFycmF5QnVmZmVyIChhcnJheSwgYnl0ZU9mZnNldCwgbGVuZ3RoKSB7XG4gIGlmIChieXRlT2Zmc2V0IDwgMCB8fCBhcnJheS5ieXRlTGVuZ3RoIDwgYnl0ZU9mZnNldCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcXCdvZmZzZXRcXCcgaXMgb3V0IG9mIGJvdW5kcycpXG4gIH1cblxuICBpZiAoYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQgKyAobGVuZ3RoIHx8IDApKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1xcJ2xlbmd0aFxcJyBpcyBvdXQgb2YgYm91bmRzJylcbiAgfVxuXG4gIHZhciBidWZcbiAgaWYgKGJ5dGVPZmZzZXQgPT09IHVuZGVmaW5lZCAmJiBsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5KVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQpXG4gIH0gZWxzZSB7XG4gICAgYnVmID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aClcbiAgfVxuXG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIGJ1Zi5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIHJldHVybiBidWZcbn1cblxuZnVuY3Rpb24gZnJvbU9iamVjdCAob2JqKSB7XG4gIGlmIChCdWZmZXIuaXNCdWZmZXIob2JqKSkge1xuICAgIHZhciBsZW4gPSBjaGVja2VkKG9iai5sZW5ndGgpIHwgMFxuICAgIHZhciBidWYgPSBjcmVhdGVCdWZmZXIobGVuKVxuXG4gICAgaWYgKGJ1Zi5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiBidWZcbiAgICB9XG5cbiAgICBvYmouY29weShidWYsIDAsIDAsIGxlbilcbiAgICByZXR1cm4gYnVmXG4gIH1cblxuICBpZiAob2JqKSB7XG4gICAgaWYgKGlzQXJyYXlCdWZmZXJWaWV3KG9iaikgfHwgJ2xlbmd0aCcgaW4gb2JqKSB7XG4gICAgICBpZiAodHlwZW9mIG9iai5sZW5ndGggIT09ICdudW1iZXInIHx8IG51bWJlcklzTmFOKG9iai5sZW5ndGgpKSB7XG4gICAgICAgIHJldHVybiBjcmVhdGVCdWZmZXIoMClcbiAgICAgIH1cbiAgICAgIHJldHVybiBmcm9tQXJyYXlMaWtlKG9iailcbiAgICB9XG5cbiAgICBpZiAob2JqLnR5cGUgPT09ICdCdWZmZXInICYmIEFycmF5LmlzQXJyYXkob2JqLmRhdGEpKSB7XG4gICAgICByZXR1cm4gZnJvbUFycmF5TGlrZShvYmouZGF0YSlcbiAgICB9XG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCdGaXJzdCBhcmd1bWVudCBtdXN0IGJlIGEgc3RyaW5nLCBCdWZmZXIsIEFycmF5QnVmZmVyLCBBcnJheSwgb3IgYXJyYXktbGlrZSBvYmplY3QuJylcbn1cblxuZnVuY3Rpb24gY2hlY2tlZCAobGVuZ3RoKSB7XG4gIC8vIE5vdGU6IGNhbm5vdCB1c2UgYGxlbmd0aCA8IEtfTUFYX0xFTkdUSGAgaGVyZSBiZWNhdXNlIHRoYXQgZmFpbHMgd2hlblxuICAvLyBsZW5ndGggaXMgTmFOICh3aGljaCBpcyBvdGhlcndpc2UgY29lcmNlZCB0byB6ZXJvLilcbiAgaWYgKGxlbmd0aCA+PSBLX01BWF9MRU5HVEgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byBhbGxvY2F0ZSBCdWZmZXIgbGFyZ2VyIHRoYW4gbWF4aW11bSAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAnc2l6ZTogMHgnICsgS19NQVhfTEVOR1RILnRvU3RyaW5nKDE2KSArICcgYnl0ZXMnKVxuICB9XG4gIHJldHVybiBsZW5ndGggfCAwXG59XG5cbmZ1bmN0aW9uIFNsb3dCdWZmZXIgKGxlbmd0aCkge1xuICBpZiAoK2xlbmd0aCAhPSBsZW5ndGgpIHsgLy8gZXNsaW50LWRpc2FibGUtbGluZSBlcWVxZXFcbiAgICBsZW5ndGggPSAwXG4gIH1cbiAgcmV0dXJuIEJ1ZmZlci5hbGxvYygrbGVuZ3RoKVxufVxuXG5CdWZmZXIuaXNCdWZmZXIgPSBmdW5jdGlvbiBpc0J1ZmZlciAoYikge1xuICByZXR1cm4gYiAhPSBudWxsICYmIGIuX2lzQnVmZmVyID09PSB0cnVlXG59XG5cbkJ1ZmZlci5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAoYSwgYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihhKSB8fCAhQnVmZmVyLmlzQnVmZmVyKGIpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnRzIG11c3QgYmUgQnVmZmVycycpXG4gIH1cblxuICBpZiAoYSA9PT0gYikgcmV0dXJuIDBcblxuICB2YXIgeCA9IGEubGVuZ3RoXG4gIHZhciB5ID0gYi5sZW5ndGhcblxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gTWF0aC5taW4oeCwgeSk7IGkgPCBsZW47ICsraSkge1xuICAgIGlmIChhW2ldICE9PSBiW2ldKSB7XG4gICAgICB4ID0gYVtpXVxuICAgICAgeSA9IGJbaV1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG5CdWZmZXIuaXNFbmNvZGluZyA9IGZ1bmN0aW9uIGlzRW5jb2RpbmcgKGVuY29kaW5nKSB7XG4gIHN3aXRjaCAoU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICBjYXNlICd1dGY4JzpcbiAgICBjYXNlICd1dGYtOCc6XG4gICAgY2FzZSAnYXNjaWknOlxuICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXR1cm4gdHJ1ZVxuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gZmFsc2VcbiAgfVxufVxuXG5CdWZmZXIuY29uY2F0ID0gZnVuY3Rpb24gY29uY2F0IChsaXN0LCBsZW5ndGgpIHtcbiAgaWYgKCFBcnJheS5pc0FycmF5KGxpc3QpKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0XCIgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzJylcbiAgfVxuXG4gIGlmIChsaXN0Lmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBCdWZmZXIuYWxsb2MoMClcbiAgfVxuXG4gIHZhciBpXG4gIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGxlbmd0aCA9IDBcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgbGVuZ3RoICs9IGxpc3RbaV0ubGVuZ3RoXG4gICAgfVxuICB9XG5cbiAgdmFyIGJ1ZmZlciA9IEJ1ZmZlci5hbGxvY1Vuc2FmZShsZW5ndGgpXG4gIHZhciBwb3MgPSAwXG4gIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgdmFyIGJ1ZiA9IGxpc3RbaV1cbiAgICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihidWYpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcImxpc3RcIiBhcmd1bWVudCBtdXN0IGJlIGFuIEFycmF5IG9mIEJ1ZmZlcnMnKVxuICAgIH1cbiAgICBidWYuY29weShidWZmZXIsIHBvcylcbiAgICBwb3MgKz0gYnVmLmxlbmd0aFxuICB9XG4gIHJldHVybiBidWZmZXJcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoc3RyaW5nLCBlbmNvZGluZykge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHN0cmluZykpIHtcbiAgICByZXR1cm4gc3RyaW5nLmxlbmd0aFxuICB9XG4gIGlmIChpc0FycmF5QnVmZmVyVmlldyhzdHJpbmcpIHx8IHN0cmluZyBpbnN0YW5jZW9mIEFycmF5QnVmZmVyKSB7XG4gICAgcmV0dXJuIHN0cmluZy5ieXRlTGVuZ3RoXG4gIH1cbiAgaWYgKHR5cGVvZiBzdHJpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgc3RyaW5nID0gJycgKyBzdHJpbmdcbiAgfVxuXG4gIHZhciBsZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGlmIChsZW4gPT09IDApIHJldHVybiAwXG5cbiAgLy8gVXNlIGEgZm9yIGxvb3AgdG8gYXZvaWQgcmVjdXJzaW9uXG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxlblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICBjYXNlIHVuZGVmaW5lZDpcbiAgICAgICAgcmV0dXJuIHV0ZjhUb0J5dGVzKHN0cmluZykubGVuZ3RoXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gbGVuICogMlxuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGxlbiA+Pj4gMVxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFRvQnl0ZXMoc3RyaW5nKS5sZW5ndGhcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgcmV0dXJuIHV0ZjhUb0J5dGVzKHN0cmluZykubGVuZ3RoIC8vIGFzc3VtZSB1dGY4XG4gICAgICAgIGVuY29kaW5nID0gKCcnICsgZW5jb2RpbmcpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5CdWZmZXIuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGhcblxuZnVuY3Rpb24gc2xvd1RvU3RyaW5nIChlbmNvZGluZywgc3RhcnQsIGVuZCkge1xuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuXG4gIC8vIE5vIG5lZWQgdG8gdmVyaWZ5IHRoYXQgXCJ0aGlzLmxlbmd0aCA8PSBNQVhfVUlOVDMyXCIgc2luY2UgaXQncyBhIHJlYWQtb25seVxuICAvLyBwcm9wZXJ0eSBvZiBhIHR5cGVkIGFycmF5LlxuXG4gIC8vIFRoaXMgYmVoYXZlcyBuZWl0aGVyIGxpa2UgU3RyaW5nIG5vciBVaW50OEFycmF5IGluIHRoYXQgd2Ugc2V0IHN0YXJ0L2VuZFxuICAvLyB0byB0aGVpciB1cHBlci9sb3dlciBib3VuZHMgaWYgdGhlIHZhbHVlIHBhc3NlZCBpcyBvdXQgb2YgcmFuZ2UuXG4gIC8vIHVuZGVmaW5lZCBpcyBoYW5kbGVkIHNwZWNpYWxseSBhcyBwZXIgRUNNQS0yNjIgNnRoIEVkaXRpb24sXG4gIC8vIFNlY3Rpb24gMTMuMy4zLjcgUnVudGltZSBTZW1hbnRpY3M6IEtleWVkQmluZGluZ0luaXRpYWxpemF0aW9uLlxuICBpZiAoc3RhcnQgPT09IHVuZGVmaW5lZCB8fCBzdGFydCA8IDApIHtcbiAgICBzdGFydCA9IDBcbiAgfVxuICAvLyBSZXR1cm4gZWFybHkgaWYgc3RhcnQgPiB0aGlzLmxlbmd0aC4gRG9uZSBoZXJlIHRvIHByZXZlbnQgcG90ZW50aWFsIHVpbnQzMlxuICAvLyBjb2VyY2lvbiBmYWlsIGJlbG93LlxuICBpZiAoc3RhcnQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkIHx8IGVuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgZW5kID0gdGhpcy5sZW5ndGhcbiAgfVxuXG4gIGlmIChlbmQgPD0gMCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgLy8gRm9yY2UgY29lcnNpb24gdG8gdWludDMyLiBUaGlzIHdpbGwgYWxzbyBjb2VyY2UgZmFsc2V5L05hTiB2YWx1ZXMgdG8gMC5cbiAgZW5kID4+Pj0gMFxuICBzdGFydCA+Pj49IDBcblxuICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgcmV0dXJuICcnXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIHdoaWxlICh0cnVlKSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsYXRpbjFTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICByZXR1cm4gYmFzZTY0U2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIHV0ZjE2bGVTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICAgICAgZW5jb2RpbmcgPSAoZW5jb2RpbmcgKyAnJykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuLy8gVGhpcyBwcm9wZXJ0eSBpcyB1c2VkIGJ5IGBCdWZmZXIuaXNCdWZmZXJgIChhbmQgdGhlIGBpcy1idWZmZXJgIG5wbSBwYWNrYWdlKVxuLy8gdG8gZGV0ZWN0IGEgQnVmZmVyIGluc3RhbmNlLiBJdCdzIG5vdCBwb3NzaWJsZSB0byB1c2UgYGluc3RhbmNlb2YgQnVmZmVyYFxuLy8gcmVsaWFibHkgaW4gYSBicm93c2VyaWZ5IGNvbnRleHQgYmVjYXVzZSB0aGVyZSBjb3VsZCBiZSBtdWx0aXBsZSBkaWZmZXJlbnRcbi8vIGNvcGllcyBvZiB0aGUgJ2J1ZmZlcicgcGFja2FnZSBpbiB1c2UuIFRoaXMgbWV0aG9kIHdvcmtzIGV2ZW4gZm9yIEJ1ZmZlclxuLy8gaW5zdGFuY2VzIHRoYXQgd2VyZSBjcmVhdGVkIGZyb20gYW5vdGhlciBjb3B5IG9mIHRoZSBgYnVmZmVyYCBwYWNrYWdlLlxuLy8gU2VlOiBodHRwczovL2dpdGh1Yi5jb20vZmVyb3NzL2J1ZmZlci9pc3N1ZXMvMTU0XG5CdWZmZXIucHJvdG90eXBlLl9pc0J1ZmZlciA9IHRydWVcblxuZnVuY3Rpb24gc3dhcCAoYiwgbiwgbSkge1xuICB2YXIgaSA9IGJbbl1cbiAgYltuXSA9IGJbbV1cbiAgYlttXSA9IGlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwMTYgPSBmdW5jdGlvbiBzd2FwMTYgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDIgIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDE2LWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDIpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyAxKVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDMyID0gZnVuY3Rpb24gc3dhcDMyICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSA0ICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAzMi1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSA0KSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgMylcbiAgICBzd2FwKHRoaXMsIGkgKyAxLCBpICsgMilcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXA2NCA9IGZ1bmN0aW9uIHN3YXA2NCAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgOCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgNjQtYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gOCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDcpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDYpXG4gICAgc3dhcCh0aGlzLCBpICsgMiwgaSArIDUpXG4gICAgc3dhcCh0aGlzLCBpICsgMywgaSArIDQpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uIHRvU3RyaW5nICgpIHtcbiAgdmFyIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW5ndGggPT09IDApIHJldHVybiAnJ1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCAwLCBsZW5ndGgpXG4gIHJldHVybiBzbG93VG9TdHJpbmcuYXBwbHkodGhpcywgYXJndW1lbnRzKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uIGVxdWFscyAoYikge1xuICBpZiAoIUJ1ZmZlci5pc0J1ZmZlcihiKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlcicpXG4gIGlmICh0aGlzID09PSBiKSByZXR1cm4gdHJ1ZVxuICByZXR1cm4gQnVmZmVyLmNvbXBhcmUodGhpcywgYikgPT09IDBcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gaW5zcGVjdCAoKSB7XG4gIHZhciBzdHIgPSAnJ1xuICB2YXIgbWF4ID0gZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFU1xuICBpZiAodGhpcy5sZW5ndGggPiAwKSB7XG4gICAgc3RyID0gdGhpcy50b1N0cmluZygnaGV4JywgMCwgbWF4KS5tYXRjaCgvLnsyfS9nKS5qb2luKCcgJylcbiAgICBpZiAodGhpcy5sZW5ndGggPiBtYXgpIHN0ciArPSAnIC4uLiAnXG4gIH1cbiAgcmV0dXJuICc8QnVmZmVyICcgKyBzdHIgKyAnPidcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5jb21wYXJlID0gZnVuY3Rpb24gY29tcGFyZSAodGFyZ2V0LCBzdGFydCwgZW5kLCB0aGlzU3RhcnQsIHRoaXNFbmQpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIodGFyZ2V0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXInKVxuICB9XG5cbiAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICBzdGFydCA9IDBcbiAgfVxuICBpZiAoZW5kID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmQgPSB0YXJnZXQgPyB0YXJnZXQubGVuZ3RoIDogMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNTdGFydCA9IDBcbiAgfVxuICBpZiAodGhpc0VuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhpc0VuZCA9IHRoaXMubGVuZ3RoXG4gIH1cblxuICBpZiAoc3RhcnQgPCAwIHx8IGVuZCA+IHRhcmdldC5sZW5ndGggfHwgdGhpc1N0YXJ0IDwgMCB8fCB0aGlzRW5kID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignb3V0IG9mIHJhbmdlIGluZGV4JylcbiAgfVxuXG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCAmJiBzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMFxuICB9XG4gIGlmICh0aGlzU3RhcnQgPj0gdGhpc0VuZCkge1xuICAgIHJldHVybiAtMVxuICB9XG4gIGlmIChzdGFydCA+PSBlbmQpIHtcbiAgICByZXR1cm4gMVxuICB9XG5cbiAgc3RhcnQgPj4+PSAwXG4gIGVuZCA+Pj49IDBcbiAgdGhpc1N0YXJ0ID4+Pj0gMFxuICB0aGlzRW5kID4+Pj0gMFxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQpIHJldHVybiAwXG5cbiAgdmFyIHggPSB0aGlzRW5kIC0gdGhpc1N0YXJ0XG4gIHZhciB5ID0gZW5kIC0gc3RhcnRcbiAgdmFyIGxlbiA9IE1hdGgubWluKHgsIHkpXG5cbiAgdmFyIHRoaXNDb3B5ID0gdGhpcy5zbGljZSh0aGlzU3RhcnQsIHRoaXNFbmQpXG4gIHZhciB0YXJnZXRDb3B5ID0gdGFyZ2V0LnNsaWNlKHN0YXJ0LCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgIGlmICh0aGlzQ29weVtpXSAhPT0gdGFyZ2V0Q29weVtpXSkge1xuICAgICAgeCA9IHRoaXNDb3B5W2ldXG4gICAgICB5ID0gdGFyZ2V0Q29weVtpXVxuICAgICAgYnJlYWtcbiAgICB9XG4gIH1cblxuICBpZiAoeCA8IHkpIHJldHVybiAtMVxuICBpZiAoeSA8IHgpIHJldHVybiAxXG4gIHJldHVybiAwXG59XG5cbi8vIEZpbmRzIGVpdGhlciB0aGUgZmlyc3QgaW5kZXggb2YgYHZhbGAgaW4gYGJ1ZmZlcmAgYXQgb2Zmc2V0ID49IGBieXRlT2Zmc2V0YCxcbi8vIE9SIHRoZSBsYXN0IGluZGV4IG9mIGB2YWxgIGluIGBidWZmZXJgIGF0IG9mZnNldCA8PSBgYnl0ZU9mZnNldGAuXG4vL1xuLy8gQXJndW1lbnRzOlxuLy8gLSBidWZmZXIgLSBhIEJ1ZmZlciB0byBzZWFyY2hcbi8vIC0gdmFsIC0gYSBzdHJpbmcsIEJ1ZmZlciwgb3IgbnVtYmVyXG4vLyAtIGJ5dGVPZmZzZXQgLSBhbiBpbmRleCBpbnRvIGBidWZmZXJgOyB3aWxsIGJlIGNsYW1wZWQgdG8gYW4gaW50MzJcbi8vIC0gZW5jb2RpbmcgLSBhbiBvcHRpb25hbCBlbmNvZGluZywgcmVsZXZhbnQgaXMgdmFsIGlzIGEgc3RyaW5nXG4vLyAtIGRpciAtIHRydWUgZm9yIGluZGV4T2YsIGZhbHNlIGZvciBsYXN0SW5kZXhPZlxuZnVuY3Rpb24gYmlkaXJlY3Rpb25hbEluZGV4T2YgKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIC8vIEVtcHR5IGJ1ZmZlciBtZWFucyBubyBtYXRjaFxuICBpZiAoYnVmZmVyLmxlbmd0aCA9PT0gMCkgcmV0dXJuIC0xXG5cbiAgLy8gTm9ybWFsaXplIGJ5dGVPZmZzZXRcbiAgaWYgKHR5cGVvZiBieXRlT2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gYnl0ZU9mZnNldFxuICAgIGJ5dGVPZmZzZXQgPSAwXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA+IDB4N2ZmZmZmZmYpIHtcbiAgICBieXRlT2Zmc2V0ID0gMHg3ZmZmZmZmZlxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPCAtMHg4MDAwMDAwMCkge1xuICAgIGJ5dGVPZmZzZXQgPSAtMHg4MDAwMDAwMFxuICB9XG4gIGJ5dGVPZmZzZXQgPSArYnl0ZU9mZnNldCAgLy8gQ29lcmNlIHRvIE51bWJlci5cbiAgaWYgKG51bWJlcklzTmFOKGJ5dGVPZmZzZXQpKSB7XG4gICAgLy8gYnl0ZU9mZnNldDogaXQgaXQncyB1bmRlZmluZWQsIG51bGwsIE5hTiwgXCJmb29cIiwgZXRjLCBzZWFyY2ggd2hvbGUgYnVmZmVyXG4gICAgYnl0ZU9mZnNldCA9IGRpciA/IDAgOiAoYnVmZmVyLmxlbmd0aCAtIDEpXG4gIH1cblxuICAvLyBOb3JtYWxpemUgYnl0ZU9mZnNldDogbmVnYXRpdmUgb2Zmc2V0cyBzdGFydCBmcm9tIHRoZSBlbmQgb2YgdGhlIGJ1ZmZlclxuICBpZiAoYnl0ZU9mZnNldCA8IDApIGJ5dGVPZmZzZXQgPSBidWZmZXIubGVuZ3RoICsgYnl0ZU9mZnNldFxuICBpZiAoYnl0ZU9mZnNldCA+PSBidWZmZXIubGVuZ3RoKSB7XG4gICAgaWYgKGRpcikgcmV0dXJuIC0xXG4gICAgZWxzZSBieXRlT2Zmc2V0ID0gYnVmZmVyLmxlbmd0aCAtIDFcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgMCkge1xuICAgIGlmIChkaXIpIGJ5dGVPZmZzZXQgPSAwXG4gICAgZWxzZSByZXR1cm4gLTFcbiAgfVxuXG4gIC8vIE5vcm1hbGl6ZSB2YWxcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdzdHJpbmcnKSB7XG4gICAgdmFsID0gQnVmZmVyLmZyb20odmFsLCBlbmNvZGluZylcbiAgfVxuXG4gIC8vIEZpbmFsbHksIHNlYXJjaCBlaXRoZXIgaW5kZXhPZiAoaWYgZGlyIGlzIHRydWUpIG9yIGxhc3RJbmRleE9mXG4gIGlmIChCdWZmZXIuaXNCdWZmZXIodmFsKSkge1xuICAgIC8vIFNwZWNpYWwgY2FzZTogbG9va2luZyBmb3IgZW1wdHkgc3RyaW5nL2J1ZmZlciBhbHdheXMgZmFpbHNcbiAgICBpZiAodmFsLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIC0xXG4gICAgfVxuICAgIHJldHVybiBhcnJheUluZGV4T2YoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH0gZWxzZSBpZiAodHlwZW9mIHZhbCA9PT0gJ251bWJlcicpIHtcbiAgICB2YWwgPSB2YWwgJiAweEZGIC8vIFNlYXJjaCBmb3IgYSBieXRlIHZhbHVlIFswLTI1NV1cbiAgICBpZiAodHlwZW9mIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIGlmIChkaXIpIHtcbiAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXkucHJvdG90eXBlLmluZGV4T2YuY2FsbChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldClcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LnByb3RvdHlwZS5sYXN0SW5kZXhPZi5jYWxsKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0KVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKGJ1ZmZlciwgWyB2YWwgXSwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcilcbiAgfVxuXG4gIHRocm93IG5ldyBUeXBlRXJyb3IoJ3ZhbCBtdXN0IGJlIHN0cmluZywgbnVtYmVyIG9yIEJ1ZmZlcicpXG59XG5cbmZ1bmN0aW9uIGFycmF5SW5kZXhPZiAoYXJyLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpIHtcbiAgdmFyIGluZGV4U2l6ZSA9IDFcbiAgdmFyIGFyckxlbmd0aCA9IGFyci5sZW5ndGhcbiAgdmFyIHZhbExlbmd0aCA9IHZhbC5sZW5ndGhcblxuICBpZiAoZW5jb2RpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgaWYgKGVuY29kaW5nID09PSAndWNzMicgfHwgZW5jb2RpbmcgPT09ICd1Y3MtMicgfHxcbiAgICAgICAgZW5jb2RpbmcgPT09ICd1dGYxNmxlJyB8fCBlbmNvZGluZyA9PT0gJ3V0Zi0xNmxlJykge1xuICAgICAgaWYgKGFyci5sZW5ndGggPCAyIHx8IHZhbC5sZW5ndGggPCAyKSB7XG4gICAgICAgIHJldHVybiAtMVxuICAgICAgfVxuICAgICAgaW5kZXhTaXplID0gMlxuICAgICAgYXJyTGVuZ3RoIC89IDJcbiAgICAgIHZhbExlbmd0aCAvPSAyXG4gICAgICBieXRlT2Zmc2V0IC89IDJcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiByZWFkIChidWYsIGkpIHtcbiAgICBpZiAoaW5kZXhTaXplID09PSAxKSB7XG4gICAgICByZXR1cm4gYnVmW2ldXG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBidWYucmVhZFVJbnQxNkJFKGkgKiBpbmRleFNpemUpXG4gICAgfVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKGRpcikge1xuICAgIHZhciBmb3VuZEluZGV4ID0gLTFcbiAgICBmb3IgKGkgPSBieXRlT2Zmc2V0OyBpIDwgYXJyTGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmIChyZWFkKGFyciwgaSkgPT09IHJlYWQodmFsLCBmb3VuZEluZGV4ID09PSAtMSA/IDAgOiBpIC0gZm91bmRJbmRleCkpIHtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggPT09IC0xKSBmb3VuZEluZGV4ID0gaVxuICAgICAgICBpZiAoaSAtIGZvdW5kSW5kZXggKyAxID09PSB2YWxMZW5ndGgpIHJldHVybiBmb3VuZEluZGV4ICogaW5kZXhTaXplXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoZm91bmRJbmRleCAhPT0gLTEpIGkgLT0gaSAtIGZvdW5kSW5kZXhcbiAgICAgICAgZm91bmRJbmRleCA9IC0xXG4gICAgICB9XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIGlmIChieXRlT2Zmc2V0ICsgdmFsTGVuZ3RoID4gYXJyTGVuZ3RoKSBieXRlT2Zmc2V0ID0gYXJyTGVuZ3RoIC0gdmFsTGVuZ3RoXG4gICAgZm9yIChpID0gYnl0ZU9mZnNldDsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIHZhciBmb3VuZCA9IHRydWVcbiAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdmFsTGVuZ3RoOyBqKyspIHtcbiAgICAgICAgaWYgKHJlYWQoYXJyLCBpICsgaikgIT09IHJlYWQodmFsLCBqKSkge1xuICAgICAgICAgIGZvdW5kID0gZmFsc2VcbiAgICAgICAgICBicmVha1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAoZm91bmQpIHJldHVybiBpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIC0xXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5jbHVkZXMgPSBmdW5jdGlvbiBpbmNsdWRlcyAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gdGhpcy5pbmRleE9mKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpICE9PSAtMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluZGV4T2YgPSBmdW5jdGlvbiBpbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiBiaWRpcmVjdGlvbmFsSW5kZXhPZih0aGlzLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCB0cnVlKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmxhc3RJbmRleE9mID0gZnVuY3Rpb24gbGFzdEluZGV4T2YgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIGJpZGlyZWN0aW9uYWxJbmRleE9mKHRoaXMsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGZhbHNlKVxufVxuXG5mdW5jdGlvbiBoZXhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIG9mZnNldCA9IE51bWJlcihvZmZzZXQpIHx8IDBcbiAgdmFyIHJlbWFpbmluZyA9IGJ1Zi5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKCFsZW5ndGgpIHtcbiAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgfSBlbHNlIHtcbiAgICBsZW5ndGggPSBOdW1iZXIobGVuZ3RoKVxuICAgIGlmIChsZW5ndGggPiByZW1haW5pbmcpIHtcbiAgICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICAgIH1cbiAgfVxuXG4gIC8vIG11c3QgYmUgYW4gZXZlbiBudW1iZXIgb2YgZGlnaXRzXG4gIHZhciBzdHJMZW4gPSBzdHJpbmcubGVuZ3RoXG4gIGlmIChzdHJMZW4gJSAyICE9PSAwKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdJbnZhbGlkIGhleCBzdHJpbmcnKVxuXG4gIGlmIChsZW5ndGggPiBzdHJMZW4gLyAyKSB7XG4gICAgbGVuZ3RoID0gc3RyTGVuIC8gMlxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICB2YXIgcGFyc2VkID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGlmIChudW1iZXJJc05hTihwYXJzZWQpKSByZXR1cm4gaVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IHBhcnNlZFxuICB9XG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIHV0ZjhXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKHV0ZjhUb0J5dGVzKHN0cmluZywgYnVmLmxlbmd0aCAtIG9mZnNldCksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGFzY2lpV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gbGF0aW4xV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYXNjaWlXcml0ZShidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGJhc2U2NFdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiB1Y3MyV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGYxNmxlVG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gd3JpdGUgKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcpXG4gIGlmIChvZmZzZXQgPT09IHVuZGVmaW5lZCkge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIGVuY29kaW5nKVxuICB9IGVsc2UgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkICYmIHR5cGVvZiBvZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICAgIG9mZnNldCA9IDBcbiAgLy8gQnVmZmVyI3dyaXRlKHN0cmluZywgb2Zmc2V0WywgbGVuZ3RoXVssIGVuY29kaW5nXSlcbiAgfSBlbHNlIGlmIChpc0Zpbml0ZShvZmZzZXQpKSB7XG4gICAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gICAgaWYgKGlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGxlbmd0aCA9IGxlbmd0aCA+Pj4gMFxuICAgICAgaWYgKGVuY29kaW5nID09PSB1bmRlZmluZWQpIGVuY29kaW5nID0gJ3V0ZjgnXG4gICAgfSBlbHNlIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgJ0J1ZmZlci53cml0ZShzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXRbLCBsZW5ndGhdKSBpcyBubyBsb25nZXIgc3VwcG9ydGVkJ1xuICAgIClcbiAgfVxuXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQgfHwgbGVuZ3RoID4gcmVtYWluaW5nKSBsZW5ndGggPSByZW1haW5pbmdcblxuICBpZiAoKHN0cmluZy5sZW5ndGggPiAwICYmIChsZW5ndGggPCAwIHx8IG9mZnNldCA8IDApKSB8fCBvZmZzZXQgPiB0aGlzLmxlbmd0aCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdBdHRlbXB0IHRvIHdyaXRlIG91dHNpZGUgYnVmZmVyIGJvdW5kcycpXG4gIH1cblxuICBpZiAoIWVuY29kaW5nKSBlbmNvZGluZyA9ICd1dGY4J1xuXG4gIHZhciBsb3dlcmVkQ2FzZSA9IGZhbHNlXG4gIGZvciAoOzspIHtcbiAgICBzd2l0Y2ggKGVuY29kaW5nKSB7XG4gICAgICBjYXNlICdoZXgnOlxuICAgICAgICByZXR1cm4gaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndXRmOCc6XG4gICAgICBjYXNlICd1dGYtOCc6XG4gICAgICAgIHJldHVybiB1dGY4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgICByZXR1cm4gYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdsYXRpbjEnOlxuICAgICAgY2FzZSAnYmluYXJ5JzpcbiAgICAgICAgcmV0dXJuIGxhdGluMVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIC8vIFdhcm5pbmc6IG1heExlbmd0aCBub3QgdGFrZW4gaW50byBhY2NvdW50IGluIGJhc2U2NFdyaXRlXG4gICAgICAgIHJldHVybiBiYXNlNjRXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICd1Y3MyJzpcbiAgICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgICByZXR1cm4gdWNzMldyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChsb3dlcmVkQ2FzZSkgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uIHRvSlNPTiAoKSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ0J1ZmZlcicsXG4gICAgZGF0YTogQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwodGhpcy5fYXJyIHx8IHRoaXMsIDApXG4gIH1cbn1cblxuZnVuY3Rpb24gYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIHV0ZjhTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcbiAgdmFyIHJlcyA9IFtdXG5cbiAgdmFyIGkgPSBzdGFydFxuICB3aGlsZSAoaSA8IGVuZCkge1xuICAgIHZhciBmaXJzdEJ5dGUgPSBidWZbaV1cbiAgICB2YXIgY29kZVBvaW50ID0gbnVsbFxuICAgIHZhciBieXRlc1BlclNlcXVlbmNlID0gKGZpcnN0Qnl0ZSA+IDB4RUYpID8gNFxuICAgICAgOiAoZmlyc3RCeXRlID4gMHhERikgPyAzXG4gICAgICA6IChmaXJzdEJ5dGUgPiAweEJGKSA/IDJcbiAgICAgIDogMVxuXG4gICAgaWYgKGkgKyBieXRlc1BlclNlcXVlbmNlIDw9IGVuZCkge1xuICAgICAgdmFyIHNlY29uZEJ5dGUsIHRoaXJkQnl0ZSwgZm91cnRoQnl0ZSwgdGVtcENvZGVQb2ludFxuXG4gICAgICBzd2l0Y2ggKGJ5dGVzUGVyU2VxdWVuY2UpIHtcbiAgICAgICAgY2FzZSAxOlxuICAgICAgICAgIGlmIChmaXJzdEJ5dGUgPCAweDgwKSB7XG4gICAgICAgICAgICBjb2RlUG9pbnQgPSBmaXJzdEJ5dGVcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAyOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHgxRikgPDwgMHg2IHwgKHNlY29uZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSAzOlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCkge1xuICAgICAgICAgICAgdGVtcENvZGVQb2ludCA9IChmaXJzdEJ5dGUgJiAweEYpIDw8IDB4QyB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKHRoaXJkQnl0ZSAmIDB4M0YpXG4gICAgICAgICAgICBpZiAodGVtcENvZGVQb2ludCA+IDB4N0ZGICYmICh0ZW1wQ29kZVBvaW50IDwgMHhEODAwIHx8IHRlbXBDb2RlUG9pbnQgPiAweERGRkYpKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgY2FzZSA0OlxuICAgICAgICAgIHNlY29uZEJ5dGUgPSBidWZbaSArIDFdXG4gICAgICAgICAgdGhpcmRCeXRlID0gYnVmW2kgKyAyXVxuICAgICAgICAgIGZvdXJ0aEJ5dGUgPSBidWZbaSArIDNdXG4gICAgICAgICAgaWYgKChzZWNvbmRCeXRlICYgMHhDMCkgPT09IDB4ODAgJiYgKHRoaXJkQnl0ZSAmIDB4QzApID09PSAweDgwICYmIChmb3VydGhCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweDEyIHwgKHNlY29uZEJ5dGUgJiAweDNGKSA8PCAweEMgfCAodGhpcmRCeXRlICYgMHgzRikgPDwgMHg2IHwgKGZvdXJ0aEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweEZGRkYgJiYgdGVtcENvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICAgICAgICAgIGNvZGVQb2ludCA9IHRlbXBDb2RlUG9pbnRcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGNvZGVQb2ludCA9PT0gbnVsbCkge1xuICAgICAgLy8gd2UgZGlkIG5vdCBnZW5lcmF0ZSBhIHZhbGlkIGNvZGVQb2ludCBzbyBpbnNlcnQgYVxuICAgICAgLy8gcmVwbGFjZW1lbnQgY2hhciAoVStGRkZEKSBhbmQgYWR2YW5jZSBvbmx5IDEgYnl0ZVxuICAgICAgY29kZVBvaW50ID0gMHhGRkZEXG4gICAgICBieXRlc1BlclNlcXVlbmNlID0gMVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50ID4gMHhGRkZGKSB7XG4gICAgICAvLyBlbmNvZGUgdG8gdXRmMTYgKHN1cnJvZ2F0ZSBwYWlyIGRhbmNlKVxuICAgICAgY29kZVBvaW50IC09IDB4MTAwMDBcbiAgICAgIHJlcy5wdXNoKGNvZGVQb2ludCA+Pj4gMTAgJiAweDNGRiB8IDB4RDgwMClcbiAgICAgIGNvZGVQb2ludCA9IDB4REMwMCB8IGNvZGVQb2ludCAmIDB4M0ZGXG4gICAgfVxuXG4gICAgcmVzLnB1c2goY29kZVBvaW50KVxuICAgIGkgKz0gYnl0ZXNQZXJTZXF1ZW5jZVxuICB9XG5cbiAgcmV0dXJuIGRlY29kZUNvZGVQb2ludHNBcnJheShyZXMpXG59XG5cbi8vIEJhc2VkIG9uIGh0dHA6Ly9zdGFja292ZXJmbG93LmNvbS9hLzIyNzQ3MjcyLzY4MDc0MiwgdGhlIGJyb3dzZXIgd2l0aFxuLy8gdGhlIGxvd2VzdCBsaW1pdCBpcyBDaHJvbWUsIHdpdGggMHgxMDAwMCBhcmdzLlxuLy8gV2UgZ28gMSBtYWduaXR1ZGUgbGVzcywgZm9yIHNhZmV0eVxudmFyIE1BWF9BUkdVTUVOVFNfTEVOR1RIID0gMHgxMDAwXG5cbmZ1bmN0aW9uIGRlY29kZUNvZGVQb2ludHNBcnJheSAoY29kZVBvaW50cykge1xuICB2YXIgbGVuID0gY29kZVBvaW50cy5sZW5ndGhcbiAgaWYgKGxlbiA8PSBNQVhfQVJHVU1FTlRTX0xFTkdUSCkge1xuICAgIHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFN0cmluZywgY29kZVBvaW50cykgLy8gYXZvaWQgZXh0cmEgc2xpY2UoKVxuICB9XG5cbiAgLy8gRGVjb2RlIGluIGNodW5rcyB0byBhdm9pZCBcImNhbGwgc3RhY2sgc2l6ZSBleGNlZWRlZFwiLlxuICB2YXIgcmVzID0gJydcbiAgdmFyIGkgPSAwXG4gIHdoaWxlIChpIDwgbGVuKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkoXG4gICAgICBTdHJpbmcsXG4gICAgICBjb2RlUG9pbnRzLnNsaWNlKGksIGkgKz0gTUFYX0FSR1VNRU5UU19MRU5HVEgpXG4gICAgKVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlTbGljZSAoYnVmLCBzdGFydCwgZW5kKSB7XG4gIHZhciByZXQgPSAnJ1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG5cbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICByZXQgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShidWZbaV0gJiAweDdGKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gbGF0aW4xU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldKVxuICB9XG4gIHJldHVybiByZXRcbn1cblxuZnVuY3Rpb24gaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiB1dGYxNmxlU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgYnl0ZXMgPSBidWYuc2xpY2Uoc3RhcnQsIGVuZClcbiAgdmFyIHJlcyA9ICcnXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgYnl0ZXMubGVuZ3RoOyBpICs9IDIpIHtcbiAgICByZXMgKz0gU3RyaW5nLmZyb21DaGFyQ29kZShieXRlc1tpXSArIChieXRlc1tpICsgMV0gKiAyNTYpKVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIHNsaWNlIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IH5+c3RhcnRcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyBsZW4gOiB+fmVuZFxuXG4gIGlmIChzdGFydCA8IDApIHtcbiAgICBzdGFydCArPSBsZW5cbiAgICBpZiAoc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgfSBlbHNlIGlmIChzdGFydCA+IGxlbikge1xuICAgIHN0YXJ0ID0gbGVuXG4gIH1cblxuICBpZiAoZW5kIDwgMCkge1xuICAgIGVuZCArPSBsZW5cbiAgICBpZiAoZW5kIDwgMCkgZW5kID0gMFxuICB9IGVsc2UgaWYgKGVuZCA+IGxlbikge1xuICAgIGVuZCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IHN0YXJ0KSBlbmQgPSBzdGFydFxuXG4gIHZhciBuZXdCdWYgPSB0aGlzLnN1YmFycmF5KHN0YXJ0LCBlbmQpXG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIG5ld0J1Zi5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIHJldHVybiBuZXdCdWZcbn1cblxuLypcbiAqIE5lZWQgdG8gbWFrZSBzdXJlIHRoYXQgYnVmZmVyIGlzbid0IHRyeWluZyB0byB3cml0ZSBvdXQgb2YgYm91bmRzLlxuICovXG5mdW5jdGlvbiBjaGVja09mZnNldCAob2Zmc2V0LCBleHQsIGxlbmd0aCkge1xuICBpZiAoKG9mZnNldCAlIDEpICE9PSAwIHx8IG9mZnNldCA8IDApIHRocm93IG5ldyBSYW5nZUVycm9yKCdvZmZzZXQgaXMgbm90IHVpbnQnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gbGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVHJ5aW5nIHRvIGFjY2VzcyBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnRMRSA9IGZ1bmN0aW9uIHJlYWRVSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XVxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50QkUgPSBmdW5jdGlvbiByZWFkVUludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcbiAgfVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF1cbiAgdmFyIG11bCA9IDFcbiAgd2hpbGUgKGJ5dGVMZW5ndGggPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1ieXRlTGVuZ3RoXSAqIG11bFxuICB9XG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50OCA9IGZ1bmN0aW9uIHJlYWRVSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZMRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQxNkJFID0gZnVuY3Rpb24gcmVhZFVJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSA8PCA4KSB8IHRoaXNbb2Zmc2V0ICsgMV1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiByZWFkVUludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICgodGhpc1tvZmZzZXRdKSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikpICtcbiAgICAgICh0aGlzW29mZnNldCArIDNdICogMHgxMDAwMDAwKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MzJCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSAqIDB4MTAwMDAwMCkgK1xuICAgICgodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICB0aGlzW29mZnNldCArIDNdKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnRMRSA9IGZ1bmN0aW9uIHJlYWRJbnRMRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCBieXRlTGVuZ3RoLCB0aGlzLmxlbmd0aClcblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdXG4gIHZhciBtdWwgPSAxXG4gIHZhciBpID0gMFxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIGldICogbXVsXG4gIH1cbiAgbXVsICo9IDB4ODBcblxuICBpZiAodmFsID49IG11bCkgdmFsIC09IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50QkUgPSBmdW5jdGlvbiByZWFkSW50QkUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoXG4gIHZhciBtdWwgPSAxXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIC0taV1cbiAgd2hpbGUgKGkgPiAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgLS1pXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiByZWFkSW50OCAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAxLCB0aGlzLmxlbmd0aClcbiAgaWYgKCEodGhpc1tvZmZzZXRdICYgMHg4MCkpIHJldHVybiAodGhpc1tvZmZzZXRdKVxuICByZXR1cm4gKCgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXRdIHwgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQxNkJFID0gZnVuY3Rpb24gcmVhZEludDE2QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldCArIDFdIHwgKHRoaXNbb2Zmc2V0XSA8PCA4KVxuICByZXR1cm4gKHZhbCAmIDB4ODAwMCkgPyB2YWwgfCAweEZGRkYwMDAwIDogdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyTEUgPSBmdW5jdGlvbiByZWFkSW50MzJMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcblxuICByZXR1cm4gKHRoaXNbb2Zmc2V0XSkgfFxuICAgICh0aGlzW29mZnNldCArIDFdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDNdIDw8IDI0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkJFID0gZnVuY3Rpb24gcmVhZEludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgMjQpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCAxNikgfFxuICAgICh0aGlzW29mZnNldCArIDJdIDw8IDgpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRMRSA9IGZ1bmN0aW9uIHJlYWRGbG9hdExFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0QkUgPSBmdW5jdGlvbiByZWFkRmxvYXRCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIGZhbHNlLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlTEUgPSBmdW5jdGlvbiByZWFkRG91YmxlTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCB0cnVlLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRG91YmxlQkUgPSBmdW5jdGlvbiByZWFkRG91YmxlQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgOCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgNTIsIDgpXG59XG5cbmZ1bmN0aW9uIGNoZWNrSW50IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJidWZmZXJcIiBhcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyIGluc3RhbmNlJylcbiAgaWYgKHZhbHVlID4gbWF4IHx8IHZhbHVlIDwgbWluKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXCJ2YWx1ZVwiIGFyZ3VtZW50IGlzIG91dCBvZiBib3VuZHMnKVxuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnRMRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbWF4Qnl0ZXMgPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aCkgLSAxXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbWF4Qnl0ZXMsIDApXG4gIH1cblxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICh2YWx1ZSAvIG11bCkgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludEJFID0gZnVuY3Rpb24gd3JpdGVVSW50QkUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIG1heEJ5dGVzID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpIC0gMVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG1heEJ5dGVzLCAwKVxuICB9XG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoIC0gMVxuICB2YXIgbXVsID0gMVxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAodmFsdWUgLyBtdWwpICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVVSW50OCAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDEsIDB4ZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2TEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweGZmZmYsIDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJMRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlVUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweGZmZmZmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDI0KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiAxNilcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnRMRSA9IGZ1bmN0aW9uIHdyaXRlSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIGxpbWl0ID0gTWF0aC5wb3coMiwgKDggKiBieXRlTGVuZ3RoKSAtIDEpXG5cbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBsaW1pdCAtIDEsIC1saW1pdClcbiAgfVxuXG4gIHZhciBpID0gMFxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gMFxuICB0aGlzW29mZnNldF0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICBpZiAodmFsdWUgPCAwICYmIHN1YiA9PT0gMCAmJiB0aGlzW29mZnNldCArIGkgLSAxXSAhPT0gMCkge1xuICAgICAgc3ViID0gMVxuICAgIH1cbiAgICB0aGlzW29mZnNldCArIGldID0gKCh2YWx1ZSAvIG11bCkgPj4gMCkgLSBzdWIgJiAweEZGXG4gIH1cblxuICByZXR1cm4gb2Zmc2V0ICsgYnl0ZUxlbmd0aFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50QkUgPSBmdW5jdGlvbiB3cml0ZUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBsaW1pdCA9IE1hdGgucG93KDIsICg4ICogYnl0ZUxlbmd0aCkgLSAxKVxuXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbGltaXQgLSAxLCAtbGltaXQpXG4gIH1cblxuICB2YXIgaSA9IGJ5dGVMZW5ndGggLSAxXG4gIHZhciBtdWwgPSAxXG4gIHZhciBzdWIgPSAwXG4gIHRoaXNbb2Zmc2V0ICsgaV0gPSB2YWx1ZSAmIDB4RkZcbiAgd2hpbGUgKC0taSA+PSAwICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgaWYgKHZhbHVlIDwgMCAmJiBzdWIgPT09IDAgJiYgdGhpc1tvZmZzZXQgKyBpICsgMV0gIT09IDApIHtcbiAgICAgIHN1YiA9IDFcbiAgICB9XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiB3cml0ZUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweDdmLCAtMHg4MClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmICsgdmFsdWUgKyAxXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAxXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gd3JpdGVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHg3ZmZmLCAtMHg4MDAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiB3cml0ZUludDMyTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAyXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgPj4+IDI0KVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MzJCRSA9IGZ1bmN0aW9uIHdyaXRlSW50MzJCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDQsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICBpZiAodmFsdWUgPCAwKSB2YWx1ZSA9IDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDFcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5mdW5jdGlvbiBjaGVja0lFRUU3NTQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgZXh0LCBtYXgsIG1pbikge1xuICBpZiAob2Zmc2V0ICsgZXh0ID4gYnVmLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG4gIGlmIChvZmZzZXQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW5kZXggb3V0IG9mIHJhbmdlJylcbn1cblxuZnVuY3Rpb24gd3JpdGVGbG9hdCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgY2hlY2tJRUVFNzU0KGJ1ZiwgdmFsdWUsIG9mZnNldCwgNCwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgMjMsIDQpXG4gIHJldHVybiBvZmZzZXQgKyA0XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdExFID0gZnVuY3Rpb24gd3JpdGVGbG9hdExFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0QkUgPSBmdW5jdGlvbiB3cml0ZUZsb2F0QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gd3JpdGVEb3VibGUgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrSUVFRTc1NChidWYsIHZhbHVlLCBvZmZzZXQsIDgsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cbiAgaWVlZTc1NC53cml0ZShidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgNTIsIDgpXG4gIHJldHVybiBvZmZzZXQgKyA4XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVMRSA9IGZ1bmN0aW9uIHdyaXRlRG91YmxlTEUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gd3JpdGVEb3VibGVCRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRG91YmxlKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuLy8gY29weSh0YXJnZXRCdWZmZXIsIHRhcmdldFN0YXJ0PTAsIHNvdXJjZVN0YXJ0PTAsIHNvdXJjZUVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5jb3B5ID0gZnVuY3Rpb24gY29weSAodGFyZ2V0LCB0YXJnZXRTdGFydCwgc3RhcnQsIGVuZCkge1xuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAodGFyZ2V0U3RhcnQgPj0gdGFyZ2V0Lmxlbmd0aCkgdGFyZ2V0U3RhcnQgPSB0YXJnZXQubGVuZ3RoXG4gIGlmICghdGFyZ2V0U3RhcnQpIHRhcmdldFN0YXJ0ID0gMFxuICBpZiAoZW5kID4gMCAmJiBlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICAvLyBDb3B5IDAgYnl0ZXM7IHdlJ3JlIGRvbmVcbiAgaWYgKGVuZCA9PT0gc3RhcnQpIHJldHVybiAwXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHRoaXMubGVuZ3RoID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgaWYgKHRhcmdldFN0YXJ0IDwgMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCd0YXJnZXRTdGFydCBvdXQgb2YgYm91bmRzJylcbiAgfVxuICBpZiAoc3RhcnQgPCAwIHx8IHN0YXJ0ID49IHRoaXMubGVuZ3RoKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc291cmNlU3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGlmIChlbmQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignc291cmNlRW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIC8vIEFyZSB3ZSBvb2I/XG4gIGlmIChlbmQgPiB0aGlzLmxlbmd0aCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCA8IGVuZCAtIHN0YXJ0KSB7XG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldFN0YXJ0ICsgc3RhcnRcbiAgfVxuXG4gIHZhciBsZW4gPSBlbmQgLSBzdGFydFxuICB2YXIgaVxuXG4gIGlmICh0aGlzID09PSB0YXJnZXQgJiYgc3RhcnQgPCB0YXJnZXRTdGFydCAmJiB0YXJnZXRTdGFydCA8IGVuZCkge1xuICAgIC8vIGRlc2NlbmRpbmcgY29weSBmcm9tIGVuZFxuICAgIGZvciAoaSA9IGxlbiAtIDE7IGkgPj0gMDsgLS1pKSB7XG4gICAgICB0YXJnZXRbaSArIHRhcmdldFN0YXJ0XSA9IHRoaXNbaSArIHN0YXJ0XVxuICAgIH1cbiAgfSBlbHNlIGlmIChsZW4gPCAxMDAwKSB7XG4gICAgLy8gYXNjZW5kaW5nIGNvcHkgZnJvbSBzdGFydFxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47ICsraSkge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRTdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgVWludDhBcnJheS5wcm90b3R5cGUuc2V0LmNhbGwoXG4gICAgICB0YXJnZXQsXG4gICAgICB0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksXG4gICAgICB0YXJnZXRTdGFydFxuICAgIClcbiAgfVxuXG4gIHJldHVybiBsZW5cbn1cblxuLy8gVXNhZ2U6XG4vLyAgICBidWZmZXIuZmlsbChudW1iZXJbLCBvZmZzZXRbLCBlbmRdXSlcbi8vICAgIGJ1ZmZlci5maWxsKGJ1ZmZlclssIG9mZnNldFssIGVuZF1dKVxuLy8gICAgYnVmZmVyLmZpbGwoc3RyaW5nWywgb2Zmc2V0WywgZW5kXV1bLCBlbmNvZGluZ10pXG5CdWZmZXIucHJvdG90eXBlLmZpbGwgPSBmdW5jdGlvbiBmaWxsICh2YWwsIHN0YXJ0LCBlbmQsIGVuY29kaW5nKSB7XG4gIC8vIEhhbmRsZSBzdHJpbmcgY2FzZXM6XG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIGlmICh0eXBlb2Ygc3RhcnQgPT09ICdzdHJpbmcnKSB7XG4gICAgICBlbmNvZGluZyA9IHN0YXJ0XG4gICAgICBzdGFydCA9IDBcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgZW5kID09PSAnc3RyaW5nJykge1xuICAgICAgZW5jb2RpbmcgPSBlbmRcbiAgICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gICAgfVxuICAgIGlmICh2YWwubGVuZ3RoID09PSAxKSB7XG4gICAgICB2YXIgY29kZSA9IHZhbC5jaGFyQ29kZUF0KDApXG4gICAgICBpZiAoY29kZSA8IDI1Nikge1xuICAgICAgICB2YWwgPSBjb2RlXG4gICAgICB9XG4gICAgfVxuICAgIGlmIChlbmNvZGluZyAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBlbmNvZGluZyAhPT0gJ3N0cmluZycpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ2VuY29kaW5nIG11c3QgYmUgYSBzdHJpbmcnKVxuICAgIH1cbiAgICBpZiAodHlwZW9mIGVuY29kaW5nID09PSAnc3RyaW5nJyAmJiAhQnVmZmVyLmlzRW5jb2RpbmcoZW5jb2RpbmcpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgfVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgdmFsID0gdmFsICYgMjU1XG4gIH1cblxuICAvLyBJbnZhbGlkIHJhbmdlcyBhcmUgbm90IHNldCB0byBhIGRlZmF1bHQsIHNvIGNhbiByYW5nZSBjaGVjayBlYXJseS5cbiAgaWYgKHN0YXJ0IDwgMCB8fCB0aGlzLmxlbmd0aCA8IHN0YXJ0IHx8IHRoaXMubGVuZ3RoIDwgZW5kKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ091dCBvZiByYW5nZSBpbmRleCcpXG4gIH1cblxuICBpZiAoZW5kIDw9IHN0YXJ0KSB7XG4gICAgcmV0dXJuIHRoaXNcbiAgfVxuXG4gIHN0YXJ0ID0gc3RhcnQgPj4+IDBcbiAgZW5kID0gZW5kID09PSB1bmRlZmluZWQgPyB0aGlzLmxlbmd0aCA6IGVuZCA+Pj4gMFxuXG4gIGlmICghdmFsKSB2YWwgPSAwXG5cbiAgdmFyIGlcbiAgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgZm9yIChpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgICAgdGhpc1tpXSA9IHZhbFxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB2YXIgYnl0ZXMgPSBCdWZmZXIuaXNCdWZmZXIodmFsKVxuICAgICAgPyB2YWxcbiAgICAgIDogbmV3IEJ1ZmZlcih2YWwsIGVuY29kaW5nKVxuICAgIHZhciBsZW4gPSBieXRlcy5sZW5ndGhcbiAgICBmb3IgKGkgPSAwOyBpIDwgZW5kIC0gc3RhcnQ7ICsraSkge1xuICAgICAgdGhpc1tpICsgc3RhcnRdID0gYnl0ZXNbaSAlIGxlbl1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpc1xufVxuXG4vLyBIRUxQRVIgRlVOQ1RJT05TXG4vLyA9PT09PT09PT09PT09PT09XG5cbnZhciBJTlZBTElEX0JBU0U2NF9SRSA9IC9bXisvMC05QS1aYS16LV9dL2dcblxuZnVuY3Rpb24gYmFzZTY0Y2xlYW4gKHN0cikge1xuICAvLyBOb2RlIHN0cmlwcyBvdXQgaW52YWxpZCBjaGFyYWN0ZXJzIGxpa2UgXFxuIGFuZCBcXHQgZnJvbSB0aGUgc3RyaW5nLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgc3RyID0gc3RyLnRyaW0oKS5yZXBsYWNlKElOVkFMSURfQkFTRTY0X1JFLCAnJylcbiAgLy8gTm9kZSBjb252ZXJ0cyBzdHJpbmdzIHdpdGggbGVuZ3RoIDwgMiB0byAnJ1xuICBpZiAoc3RyLmxlbmd0aCA8IDIpIHJldHVybiAnJ1xuICAvLyBOb2RlIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBiYXNlNjQgc3RyaW5ncyAobWlzc2luZyB0cmFpbGluZyA9PT0pLCBiYXNlNjQtanMgZG9lcyBub3RcbiAgd2hpbGUgKHN0ci5sZW5ndGggJSA0ICE9PSAwKSB7XG4gICAgc3RyID0gc3RyICsgJz0nXG4gIH1cbiAgcmV0dXJuIHN0clxufVxuXG5mdW5jdGlvbiB0b0hleCAobikge1xuICBpZiAobiA8IDE2KSByZXR1cm4gJzAnICsgbi50b1N0cmluZygxNilcbiAgcmV0dXJuIG4udG9TdHJpbmcoMTYpXG59XG5cbmZ1bmN0aW9uIHV0ZjhUb0J5dGVzIChzdHJpbmcsIHVuaXRzKSB7XG4gIHVuaXRzID0gdW5pdHMgfHwgSW5maW5pdHlcbiAgdmFyIGNvZGVQb2ludFxuICB2YXIgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aFxuICB2YXIgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcbiAgdmFyIGJ5dGVzID0gW11cblxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgY29kZVBvaW50ID0gc3RyaW5nLmNoYXJDb2RlQXQoaSlcblxuICAgIC8vIGlzIHN1cnJvZ2F0ZSBjb21wb25lbnRcbiAgICBpZiAoY29kZVBvaW50ID4gMHhEN0ZGICYmIGNvZGVQb2ludCA8IDB4RTAwMCkge1xuICAgICAgLy8gbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICghbGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgICAvLyBubyBsZWFkIHlldFxuICAgICAgICBpZiAoY29kZVBvaW50ID4gMHhEQkZGKSB7XG4gICAgICAgICAgLy8gdW5leHBlY3RlZCB0cmFpbFxuICAgICAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgICAgICAgIGNvbnRpbnVlXG4gICAgICAgIH0gZWxzZSBpZiAoaSArIDEgPT09IGxlbmd0aCkge1xuICAgICAgICAgIC8vIHVucGFpcmVkIGxlYWRcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdmFsaWQgbGVhZFxuICAgICAgICBsZWFkU3Vycm9nYXRlID0gY29kZVBvaW50XG5cbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gMiBsZWFkcyBpbiBhIHJvd1xuICAgICAgaWYgKGNvZGVQb2ludCA8IDB4REMwMCkge1xuICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuICAgICAgICBjb250aW51ZVxuICAgICAgfVxuXG4gICAgICAvLyB2YWxpZCBzdXJyb2dhdGUgcGFpclxuICAgICAgY29kZVBvaW50ID0gKGxlYWRTdXJyb2dhdGUgLSAweEQ4MDAgPDwgMTAgfCBjb2RlUG9pbnQgLSAweERDMDApICsgMHgxMDAwMFxuICAgIH0gZWxzZSBpZiAobGVhZFN1cnJvZ2F0ZSkge1xuICAgICAgLy8gdmFsaWQgYm1wIGNoYXIsIGJ1dCBsYXN0IGNoYXIgd2FzIGEgbGVhZFxuICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgfVxuXG4gICAgbGVhZFN1cnJvZ2F0ZSA9IG51bGxcblxuICAgIC8vIGVuY29kZSB1dGY4XG4gICAgaWYgKGNvZGVQb2ludCA8IDB4ODApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMSkgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChjb2RlUG9pbnQpXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDgwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2IHwgMHhDMCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTAwMDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyB8IDB4RTAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDYgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ICYgMHgzRiB8IDB4ODBcbiAgICAgIClcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA8IDB4MTEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDQpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweDEyIHwgMHhGMCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4QyAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBjb2RlIHBvaW50JylcbiAgICB9XG4gIH1cblxuICByZXR1cm4gYnl0ZXNcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0ciwgdW5pdHMpIHtcbiAgdmFyIGMsIGhpLCBsb1xuICB2YXIgYnl0ZUFycmF5ID0gW11cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcbiAgICBpZiAoKHVuaXRzIC09IDIpIDwgMCkgYnJlYWtcblxuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KGJhc2U2NGNsZWFuKHN0cikpXG59XG5cbmZ1bmN0aW9uIGJsaXRCdWZmZXIgKHNyYywgZHN0LCBvZmZzZXQsIGxlbmd0aCkge1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgaWYgKChpICsgb2Zmc2V0ID49IGRzdC5sZW5ndGgpIHx8IChpID49IHNyYy5sZW5ndGgpKSBicmVha1xuICAgIGRzdFtpICsgb2Zmc2V0XSA9IHNyY1tpXVxuICB9XG4gIHJldHVybiBpXG59XG5cbi8vIE5vZGUgMC4xMCBzdXBwb3J0cyBgQXJyYXlCdWZmZXJgIGJ1dCBsYWNrcyBgQXJyYXlCdWZmZXIuaXNWaWV3YFxuZnVuY3Rpb24gaXNBcnJheUJ1ZmZlclZpZXcgKG9iaikge1xuICByZXR1cm4gKHR5cGVvZiBBcnJheUJ1ZmZlci5pc1ZpZXcgPT09ICdmdW5jdGlvbicpICYmIEFycmF5QnVmZmVyLmlzVmlldyhvYmopXG59XG5cbmZ1bmN0aW9uIG51bWJlcklzTmFOIChvYmopIHtcbiAgcmV0dXJuIG9iaiAhPT0gb2JqIC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tc2VsZi1jb21wYXJlXG59XG4iLCJleHBvcnRzLnJlYWQgPSBmdW5jdGlvbiAoYnVmZmVyLCBvZmZzZXQsIGlzTEUsIG1MZW4sIG5CeXRlcykge1xuICB2YXIgZSwgbVxuICB2YXIgZUxlbiA9IG5CeXRlcyAqIDggLSBtTGVuIC0gMVxuICB2YXIgZU1heCA9ICgxIDw8IGVMZW4pIC0gMVxuICB2YXIgZUJpYXMgPSBlTWF4ID4+IDFcbiAgdmFyIG5CaXRzID0gLTdcbiAgdmFyIGkgPSBpc0xFID8gKG5CeXRlcyAtIDEpIDogMFxuICB2YXIgZCA9IGlzTEUgPyAtMSA6IDFcbiAgdmFyIHMgPSBidWZmZXJbb2Zmc2V0ICsgaV1cblxuICBpICs9IGRcblxuICBlID0gcyAmICgoMSA8PCAoLW5CaXRzKSkgLSAxKVxuICBzID4+PSAoLW5CaXRzKVxuICBuQml0cyArPSBlTGVuXG4gIGZvciAoOyBuQml0cyA+IDA7IGUgPSBlICogMjU2ICsgYnVmZmVyW29mZnNldCArIGldLCBpICs9IGQsIG5CaXRzIC09IDgpIHt9XG5cbiAgbSA9IGUgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgZSA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gbUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBtID0gbSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIGlmIChlID09PSAwKSB7XG4gICAgZSA9IDEgLSBlQmlhc1xuICB9IGVsc2UgaWYgKGUgPT09IGVNYXgpIHtcbiAgICByZXR1cm4gbSA/IE5hTiA6ICgocyA/IC0xIDogMSkgKiBJbmZpbml0eSlcbiAgfSBlbHNlIHtcbiAgICBtID0gbSArIE1hdGgucG93KDIsIG1MZW4pXG4gICAgZSA9IGUgLSBlQmlhc1xuICB9XG4gIHJldHVybiAocyA/IC0xIDogMSkgKiBtICogTWF0aC5wb3coMiwgZSAtIG1MZW4pXG59XG5cbmV4cG9ydHMud3JpdGUgPSBmdW5jdGlvbiAoYnVmZmVyLCB2YWx1ZSwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG0sIGNcbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBydCA9IChtTGVuID09PSAyMyA/IE1hdGgucG93KDIsIC0yNCkgLSBNYXRoLnBvdygyLCAtNzcpIDogMClcbiAgdmFyIGkgPSBpc0xFID8gMCA6IChuQnl0ZXMgLSAxKVxuICB2YXIgZCA9IGlzTEUgPyAxIDogLTFcbiAgdmFyIHMgPSB2YWx1ZSA8IDAgfHwgKHZhbHVlID09PSAwICYmIDEgLyB2YWx1ZSA8IDApID8gMSA6IDBcblxuICB2YWx1ZSA9IE1hdGguYWJzKHZhbHVlKVxuXG4gIGlmIChpc05hTih2YWx1ZSkgfHwgdmFsdWUgPT09IEluZmluaXR5KSB7XG4gICAgbSA9IGlzTmFOKHZhbHVlKSA/IDEgOiAwXG4gICAgZSA9IGVNYXhcbiAgfSBlbHNlIHtcbiAgICBlID0gTWF0aC5mbG9vcihNYXRoLmxvZyh2YWx1ZSkgLyBNYXRoLkxOMilcbiAgICBpZiAodmFsdWUgKiAoYyA9IE1hdGgucG93KDIsIC1lKSkgPCAxKSB7XG4gICAgICBlLS1cbiAgICAgIGMgKj0gMlxuICAgIH1cbiAgICBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIHZhbHVlICs9IHJ0IC8gY1xuICAgIH0gZWxzZSB7XG4gICAgICB2YWx1ZSArPSBydCAqIE1hdGgucG93KDIsIDEgLSBlQmlhcylcbiAgICB9XG4gICAgaWYgKHZhbHVlICogYyA+PSAyKSB7XG4gICAgICBlKytcbiAgICAgIGMgLz0gMlxuICAgIH1cblxuICAgIGlmIChlICsgZUJpYXMgPj0gZU1heCkge1xuICAgICAgbSA9IDBcbiAgICAgIGUgPSBlTWF4XG4gICAgfSBlbHNlIGlmIChlICsgZUJpYXMgPj0gMSkge1xuICAgICAgbSA9ICh2YWx1ZSAqIGMgLSAxKSAqIE1hdGgucG93KDIsIG1MZW4pXG4gICAgICBlID0gZSArIGVCaWFzXG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSB2YWx1ZSAqIE1hdGgucG93KDIsIGVCaWFzIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IDBcbiAgICB9XG4gIH1cblxuICBmb3IgKDsgbUxlbiA+PSA4OyBidWZmZXJbb2Zmc2V0ICsgaV0gPSBtICYgMHhmZiwgaSArPSBkLCBtIC89IDI1NiwgbUxlbiAtPSA4KSB7fVxuXG4gIGUgPSAoZSA8PCBtTGVuKSB8IG1cbiAgZUxlbiArPSBtTGVuXG4gIGZvciAoOyBlTGVuID4gMDsgYnVmZmVyW29mZnNldCArIGldID0gZSAmIDB4ZmYsIGkgKz0gZCwgZSAvPSAyNTYsIGVMZW4gLT0gOCkge31cblxuICBidWZmZXJbb2Zmc2V0ICsgaSAtIGRdIHw9IHMgKiAxMjhcbn1cbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG4vLyBjYWNoZWQgZnJvbSB3aGF0ZXZlciBnbG9iYWwgaXMgcHJlc2VudCBzbyB0aGF0IHRlc3QgcnVubmVycyB0aGF0IHN0dWIgaXRcbi8vIGRvbid0IGJyZWFrIHRoaW5ncy4gIEJ1dCB3ZSBuZWVkIHRvIHdyYXAgaXQgaW4gYSB0cnkgY2F0Y2ggaW4gY2FzZSBpdCBpc1xuLy8gd3JhcHBlZCBpbiBzdHJpY3QgbW9kZSBjb2RlIHdoaWNoIGRvZXNuJ3QgZGVmaW5lIGFueSBnbG9iYWxzLiAgSXQncyBpbnNpZGUgYVxuLy8gZnVuY3Rpb24gYmVjYXVzZSB0cnkvY2F0Y2hlcyBkZW9wdGltaXplIGluIGNlcnRhaW4gZW5naW5lcy5cblxudmFyIGNhY2hlZFNldFRpbWVvdXQ7XG52YXIgY2FjaGVkQ2xlYXJUaW1lb3V0O1xuXG5mdW5jdGlvbiBkZWZhdWx0U2V0VGltb3V0KCkge1xuICAgIHRocm93IG5ldyBFcnJvcignc2V0VGltZW91dCBoYXMgbm90IGJlZW4gZGVmaW5lZCcpO1xufVxuZnVuY3Rpb24gZGVmYXVsdENsZWFyVGltZW91dCAoKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdjbGVhclRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbihmdW5jdGlvbiAoKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBkZWZhdWx0U2V0VGltb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgaWYgKHR5cGVvZiBjbGVhclRpbWVvdXQgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgICAgIH1cbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGRlZmF1bHRDbGVhclRpbWVvdXQ7XG4gICAgfVxufSAoKSlcbmZ1bmN0aW9uIHJ1blRpbWVvdXQoZnVuKSB7XG4gICAgaWYgKGNhY2hlZFNldFRpbWVvdXQgPT09IHNldFRpbWVvdXQpIHtcbiAgICAgICAgLy9ub3JtYWwgZW52aXJvbWVudHMgaW4gc2FuZSBzaXR1YXRpb25zXG4gICAgICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfVxuICAgIC8vIGlmIHNldFRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRTZXRUaW1lb3V0ID09PSBkZWZhdWx0U2V0VGltb3V0IHx8ICFjYWNoZWRTZXRUaW1lb3V0KSAmJiBzZXRUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZFNldFRpbWVvdXQgPSBzZXRUaW1lb3V0O1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSBjYXRjaChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFNldFRpbWVvdXQuY2FsbChudWxsLCBmdW4sIDApO1xuICAgICAgICB9IGNhdGNoKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3JcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwodGhpcywgZnVuLCAwKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG59XG5mdW5jdGlvbiBydW5DbGVhclRpbWVvdXQobWFya2VyKSB7XG4gICAgaWYgKGNhY2hlZENsZWFyVGltZW91dCA9PT0gY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIC8vIGlmIGNsZWFyVGltZW91dCB3YXNuJ3QgYXZhaWxhYmxlIGJ1dCB3YXMgbGF0dGVyIGRlZmluZWRcbiAgICBpZiAoKGNhY2hlZENsZWFyVGltZW91dCA9PT0gZGVmYXVsdENsZWFyVGltZW91dCB8fCAhY2FjaGVkQ2xlYXJUaW1lb3V0KSAmJiBjbGVhclRpbWVvdXQpIHtcbiAgICAgICAgY2FjaGVkQ2xlYXJUaW1lb3V0ID0gY2xlYXJUaW1lb3V0O1xuICAgICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KG1hcmtlcik7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIC8vIHdoZW4gd2hlbiBzb21lYm9keSBoYXMgc2NyZXdlZCB3aXRoIHNldFRpbWVvdXQgYnV0IG5vIEkuRS4gbWFkZG5lc3NcbiAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gV2hlbiB3ZSBhcmUgaW4gSS5FLiBidXQgdGhlIHNjcmlwdCBoYXMgYmVlbiBldmFsZWQgc28gSS5FLiBkb2Vzbid0ICB0cnVzdCB0aGUgZ2xvYmFsIG9iamVjdCB3aGVuIGNhbGxlZCBub3JtYWxseVxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKG51bGwsIG1hcmtlcik7XG4gICAgICAgIH0gY2F0Y2ggKGUpe1xuICAgICAgICAgICAgLy8gc2FtZSBhcyBhYm92ZSBidXQgd2hlbiBpdCdzIGEgdmVyc2lvbiBvZiBJLkUuIHRoYXQgbXVzdCBoYXZlIHRoZSBnbG9iYWwgb2JqZWN0IGZvciAndGhpcycsIGhvcGZ1bGx5IG91ciBjb250ZXh0IGNvcnJlY3Qgb3RoZXJ3aXNlIGl0IHdpbGwgdGhyb3cgYSBnbG9iYWwgZXJyb3IuXG4gICAgICAgICAgICAvLyBTb21lIHZlcnNpb25zIG9mIEkuRS4gaGF2ZSBkaWZmZXJlbnQgcnVsZXMgZm9yIGNsZWFyVGltZW91dCB2cyBzZXRUaW1lb3V0XG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkQ2xlYXJUaW1lb3V0LmNhbGwodGhpcywgbWFya2VyKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG5cbn1cbnZhciBxdWV1ZSA9IFtdO1xudmFyIGRyYWluaW5nID0gZmFsc2U7XG52YXIgY3VycmVudFF1ZXVlO1xudmFyIHF1ZXVlSW5kZXggPSAtMTtcblxuZnVuY3Rpb24gY2xlYW5VcE5leHRUaWNrKCkge1xuICAgIGlmICghZHJhaW5pbmcgfHwgIWN1cnJlbnRRdWV1ZSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG4gICAgaWYgKGN1cnJlbnRRdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgcXVldWUgPSBjdXJyZW50UXVldWUuY29uY2F0KHF1ZXVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgfVxuICAgIGlmIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgZHJhaW5RdWV1ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgdGltZW91dCA9IHJ1blRpbWVvdXQoY2xlYW5VcE5leHRUaWNrKTtcbiAgICBkcmFpbmluZyA9IHRydWU7XG5cbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgd2hpbGUgKCsrcXVldWVJbmRleCA8IGxlbikge1xuICAgICAgICAgICAgaWYgKGN1cnJlbnRRdWV1ZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRRdWV1ZVtxdWV1ZUluZGV4XS5ydW4oKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxdWV1ZUluZGV4ID0gLTE7XG4gICAgICAgIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB9XG4gICAgY3VycmVudFF1ZXVlID0gbnVsbDtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIHJ1bkNsZWFyVGltZW91dCh0aW1lb3V0KTtcbn1cblxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICB2YXIgYXJncyA9IG5ldyBBcnJheShhcmd1bWVudHMubGVuZ3RoIC0gMSk7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBxdWV1ZS5wdXNoKG5ldyBJdGVtKGZ1biwgYXJncykpO1xuICAgIGlmIChxdWV1ZS5sZW5ndGggPT09IDEgJiYgIWRyYWluaW5nKSB7XG4gICAgICAgIHJ1blRpbWVvdXQoZHJhaW5RdWV1ZSk7XG4gICAgfVxufTtcblxuLy8gdjggbGlrZXMgcHJlZGljdGlibGUgb2JqZWN0c1xuZnVuY3Rpb24gSXRlbShmdW4sIGFycmF5KSB7XG4gICAgdGhpcy5mdW4gPSBmdW47XG4gICAgdGhpcy5hcnJheSA9IGFycmF5O1xufVxuSXRlbS5wcm90b3R5cGUucnVuID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZnVuLmFwcGx5KG51bGwsIHRoaXMuYXJyYXkpO1xufTtcbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucHJlcGVuZE9uY2VMaXN0ZW5lciA9IG5vb3A7XG5cbnByb2Nlc3MubGlzdGVuZXJzID0gZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFtdIH1cblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnU1QnLCAoKT0+e1xyXG4gICAgaXQoJ3Nob3VsZCBleGlzdCBhcyBhIGdsb2JhbCBvYmplY3QnLCAoKT0+e1xyXG4gICAgICAgIGV4cGVjdChTVCkudG8uYmUuYW4oJ29iamVjdCcpO1xyXG4gICAgfSk7XHJcbiAgICByZXF1aXJlKCcuL3NwZWMnKTtcclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdBcHAnLCAoKT0+e1xyXG4gICAgbGV0IGFwcCA9IG5ldyBTVC5BcHAoKTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSBhIHBpeGkgY2FudmFzIG9uIHRoZSBwYWdlJywgKCk9PntcclxuICAgICAgICBleHBlY3QoZG9jdW1lbnQuYm9keS5jb250YWlucyhhcHAucmVuZGVyZXIudmlldykpLnRvLmJlLnRydWU7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIGhhdmUgYSB2YWxpZCB0aGVtZScsICgpPT57XHJcbiAgICAgICAgZXhwZWN0KGFwcC50aGVtZSkudG8uYmUuYW4uaW5zdGFuY2VvZihTVC5UaGVtZSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIGhhdmUgYSB2YWxpZCByb290IHdpZGdldCcsICgpPT57XHJcbiAgICAgICAgZXhwZWN0KGFwcC5yb290KS50by5iZS5hbi5pbnN0YW5jZW9mKFNULldpZGdldHMuQmFzZVdpZGdldCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIHJlc2l6ZSB0aGUgcm9vdCB3aWRnZXQgdG8gbWF0Y2ggdGhlIHdpbmRvdycsICgpPT57XHJcbiAgICAgICAgd2luZG93LnJlc2l6ZUJ5KDMwMCwgMjAwKTtcclxuICAgICAgICBleHBlY3QoYXBwLnJvb3Qud2lkdGgpLnRvLmVxdWFsKHdpbmRvdy5pbm5lcldpZHRoKTtcclxuICAgICAgICBleHBlY3QoYXBwLnJvb3QuaGVpZ2h0KS50by5lcXVhbCh3aW5kb3cuaW5uZXJIZWlnaHQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNuYW1lJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGNoYW5nZSB0aGUgcGFnZSB0aXRsZScsICgpPT57XHJcbiAgICAgICAgICAgIGFwcC5uYW1lID0gJ1NhYmVyVG9vdGggVGVzdCc7XHJcbiAgICAgICAgICAgIGV4cGVjdChkb2N1bWVudC50aXRsZSkudG8uZXF1YWwoJ1NhYmVyVG9vdGggVGVzdCcpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNhdXRvUmVzaXplJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGFkZCBhIGxpc3RlbmVyIHRvIHJlc2l6ZSBldmVudCBpZiBzZXQgdG8gdHJ1ZSBhbmQgJyArXHJcbiAgICAgICAgICAgICdvbmUgZG9lc250IGFscmVhZHkgZXhpc3QnLCAoKT0+e1xyXG4gICAgICAgICAgICAgICAgYXBwLmF1dG9SZXNpemUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgbGV0IGxpc3RlbmVycyA9IGFwcC5saXN0ZW5lcnMoJ3Jlc2l6ZScpO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KGxpc3RlbmVycy5pbmRleE9mKGFwcC5yZXNpemVUb1dpbmRvdykpLnRvLm5vdC5lcXVhbCgtMSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIG5vdCBhZGQgbW9yZSB0aGFuIG9uZSBsaXN0ZW5lcicsICgpPT57XHJcbiAgICAgICAgICAgIGFwcC5hdXRvUmVzaXplID0gdHJ1ZTtcclxuICAgICAgICAgICAgbGV0IGxpc3RlbmVycyA9IGFwcC5saXN0ZW5lcnMoJ3Jlc2l6ZScpO1xyXG4gICAgICAgICAgICBleHBlY3QobGlzdGVuZXJzLmxlbmd0aCkudG8uZXF1YWwoMSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgcmVtb3ZlIHRoZSBsaXN0ZW5lciBmcm9tIHJlc2l6ZSBpZiBzZXQgdG8gZmFsc2UnLCAoKT0+e1xyXG4gICAgICAgICAgICBhcHAuYXV0b1Jlc2l6ZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBsZXQgbGlzdGVuZXJzID0gYXBwLmxpc3RlbmVycygncmVzaXplJyk7XHJcbiAgICAgICAgICAgIGV4cGVjdChsaXN0ZW5lcnMuaW5kZXhPZihhcHAucmVzaXplVG9XaW5kb3cpKS50by5lcXVhbCgtMSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdHcmFwaGljc0dlbicsICgpPT57XHJcbiAgICBkZXNjcmliZSgnI3JlY3RhbmdsZUdyYXBoaWMoKScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gYSBQaXhpLkdyYXBoaWNzIHdpdGggYSAnXHJcbiAgICAgICAgICAgICsgJ3dpZHRoIG9mIDgwIGFuZCBhIGhlaWdodCBvZiAxMDAnLCAoKT0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlY3RHcmFwaGljID1cclxuICAgICAgICAgICAgICAgICAgICBTVC5HcmFwaGljc0dlbi5yZWN0YW5nbGVHcmFwaGljKDgwLCAxMDAsIDB4MDAwMDAwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBleHBlY3QocmVjdEdyYXBoaWMpLnRvLmJlLmFuLmluc3RhbmNlb2YoUElYSS5HcmFwaGljcyk7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QocmVjdEdyYXBoaWMud2lkdGgpLnRvLmVxdWFsKDgwKTtcclxuICAgICAgICAgICAgICAgIGV4cGVjdChyZWN0R3JhcGhpYy5oZWlnaHQpLnRvLmVxdWFsKDEwMCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNyZWN0YW5nbGVUZXh0dXJlKCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIGEgUElYSS5UZXh0dXJlIHdpdGggYSdcclxuICAgICAgICAgICAgKyAnIHdpZHRoIG9mIDEwMCBhbmQgYSBoZWlnaHQgb2YgODAnLCAoKT0+e1xyXG4gICAgICAgICAgICAgICAgbGV0IHJlY3RUZXggPVxyXG4gICAgICAgICAgICAgICAgICAgIFNULkdyYXBoaWNzR2VuLnJlY3RhbmdsZVRleHR1cmUoMTAwLCA4MCwgMHgwMDAwMDApO1xyXG5cclxuICAgICAgICAgICAgICAgIGV4cGVjdChyZWN0VGV4KS50by5iZS5hbi5pbnN0YW5jZW9mKFBJWEkuVGV4dHVyZSk7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QocmVjdFRleC53aWR0aCkudG8uZXF1YWwoMTAwKTtcclxuICAgICAgICAgICAgICAgIGV4cGVjdChyZWN0VGV4LmhlaWdodCkudG8uZXF1YWwoODApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ1BhZGRpbmcnLCAoKT0+e1xyXG4gICAgbGV0IHBhZCA9IG5ldyBTVC5QYWRkaW5nKCk7XHJcbiAgICBpdCgnc2hvdWxkIGJlIGNyZWF0ZWQgd2l0aCBhIGRlZmF1bHQgb2YgMCcsICgpPT57XHJcbiAgICAgICAgZXhwZWN0KHBhZC5sZWZ0KS50by5lcXVhbCgwKTtcclxuICAgICAgICBleHBlY3QocGFkLnRvcCkudG8uZXF1YWwoMCk7XHJcbiAgICAgICAgZXhwZWN0KHBhZC5yaWdodCkudG8uZXF1YWwoMCk7XHJcbiAgICAgICAgZXhwZWN0KHBhZC5ib3R0b20pLnRvLmVxdWFsKDApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNzZXQoKScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBzZXQgZWFjaCBwYWRkaW5nIHRvIHRoZSB2YWx1ZXMgb2YgMSwyLDMsNCcsICgpPT57XHJcbiAgICAgICAgICAgIHBhZC5zZXQoMSwgMiwgMywgNCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChwYWQubGVmdCkudG8uZXF1YWwoMik7XHJcbiAgICAgICAgICAgIGV4cGVjdChwYWQudG9wKS50by5lcXVhbCgxKTtcclxuICAgICAgICAgICAgZXhwZWN0KHBhZC5yaWdodCkudG8uZXF1YWwoNCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChwYWQuYm90dG9tKS50by5lcXVhbCgzKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjc2V0QWxsVG8oKScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBzZXQgYWxsIHBhZGRpbmcgdmFsdWVzIHRvIDEwJywgKCk9PntcclxuICAgICAgICAgICAgcGFkLnNldEFsbFRvKDEwKTtcclxuICAgICAgICAgICAgZXhwZWN0KHBhZC5sZWZ0KS50by5lcXVhbCgxMCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChwYWQudG9wKS50by5lcXVhbCgxMCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChwYWQucmlnaHQpLnRvLmVxdWFsKDEwKTtcclxuICAgICAgICAgICAgZXhwZWN0KHBhZC5ib3R0b20pLnRvLmVxdWFsKDEwKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ1BvaW50JywgKCk9PntcclxuICAgIGxldCBwID0gbmV3IFNULlBvaW50KCk7XHJcbiAgICBpdCgnc2hvdWxkIGNyZWF0ZSB3aXRoIGRlZmF1bHQgeCBhbmQgeSBvZiAwJywgKCk9PntcclxuICAgICAgICBleHBlY3QocC54KS50by5lcXVhbCgwKTtcclxuICAgICAgICBleHBlY3QocC55KS50by5lcXVhbCgwKTtcclxuICAgIH0pO1xyXG4gICAgZGVzY3JpYmUoJyNzZXQoKScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBzZXQgeCBhbmQgeSB0byAyMCwgODAnLCAoKT0+e1xyXG4gICAgICAgICAgICBwLnNldCgyMCwgODApO1xyXG4gICAgICAgICAgICBleHBlY3QocC54KS50by5lcXVhbCgyMCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChwLnkpLnRvLmVxdWFsKDgwKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5kZXNjcmliZSgnU2V0dGluZ3MnLCAoKT0+e1xuICAgIGl0KCdzaG91bGQgaGF2ZSBhIGdsb2JhbCBpbnN0YW5jZScsICgpPT57XG4gICAgICAgIGV4cGVjdChTVC5zZXR0aW5ncykudG8ubm90LmJlLnVuaWRlbnRpZmllZDtcbiAgICB9KTtcblxuICAgIGRlc2NyaWJlKCcjYWRkKCknLCAoKT0+e1xuICAgICAgICBpdCgnc2hvdWxkIGFkZCB0aGUgZ2l2ZW4gb2JqZWN0IGFzIGEgcHJvcGVydHkgb2YgaXRzZWxmJywgKCk9PntcbiAgICAgICAgICAgIGxldCBvYmogPSB7XG4gICAgICAgICAgICAgICAgdHJ1Y2s6IHtcbiAgICAgICAgICAgICAgICAgICAgc2l6ZTogJ2JpZycsXG4gICAgICAgICAgICAgICAgICAgIHdlaWdodDogJ2hlYXZ5JyxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgU1Quc2V0dGluZ3MuYWRkKCd2ZWhpY2xlcycsIG9iaik7XG5cbiAgICAgICAgICAgIGV4cGVjdChTVC5zZXR0aW5ncy52ZWhpY2xlcy50cnVjay5zaXplKS50by5lcXVhbCgnYmlnJyk7XG4gICAgICAgICAgICBleHBlY3QoU1Quc2V0dGluZ3MudmVoaWNsZXMudHJ1Y2sud2VpZ2h0KS50by5lcXVhbCgnaGVhdnknKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdTaXplJywgKCk9PntcclxuICAgIGxldCBzID0gbmV3IFNULlNpemUoKTtcclxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHdpdGggZGVmYXVsdCBzaXplIG9mIDAnLCAoKT0+e1xyXG4gICAgICAgIGV4cGVjdChzLndpZHRoKS50by5lcXVhbCgwKTtcclxuICAgICAgICBleHBlY3Qocy5oZWlnaHQpLnRvLmVxdWFsKDApO1xyXG4gICAgfSk7XHJcbiAgICBkZXNjcmliZSgnI3NldCgpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCB3aWR0aCBhbmQgaGVpZ2h0IHRvIDIwLCA4MCcsICgpPT57XHJcbiAgICAgICAgICAgIHMuc2V0KDIwLCA4MCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChzLndpZHRoKS50by5lcXVhbCgyMCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChzLmhlaWdodCkudG8uZXF1YWwoODApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnVGhlbWUnLCAoKT0+e1xyXG4gICAgLy8gbGV0IGdyZXlUb2FkVGhlbWUgPSByZXF1aXJlKCcuLi8uLi90aGVtZXMvZ3JleVRvYWRUaGVtZScpO1xyXG4gICAgLy8gbGV0IGNoYW5nZSBvbmUgc3R5bGUgYmVjYXVzZSB0aGlzIHRoZW1lIGlzIHRoZSBzYW1lIGFzIHRoZSBkZWZhdWx0c1xyXG4gICAgZ3JleVRvYWRUaGVtZS5iYWNrZ3JvdW5kID0gMHhmZmZmZmY7XHJcbiAgICBncmV5VG9hZFRoZW1lLndpZGdldHMuYnV0dG9uLmhvdmVyID0gMHhmZjAwZmY7XHJcbiAgICBsZXQgdGhlbWUgPSBuZXcgU1QuVGhlbWUoZ3JleVRvYWRUaGVtZSk7XHJcbiAgICBsZXQgZGVmVGhlbWUgPSBuZXcgU1QuVGhlbWUoKTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIGxvYWQgdGhlIGdpdmVuIHN0eWxlcyB3aGVuIGNyZWF0ZWQnLCAoKT0+e1xyXG4gICAgICAgIGV4cGVjdCh0aGVtZS5iYWNrZ3JvdW5kKS50by5lcXVhbCgweGZmZmZmZik7XHJcbiAgICAgICAgZXhwZWN0KHRoZW1lLmNvbG9ycy5idXR0b24uaG92ZXIpLnRvLmVxdWFsKDB4ZmYwMGZmKTtcclxuICAgICAgICAvLyBub3QgZ29ubmEgY2hlY2sgZWFjaCBvbmUuIFRoaXMgc2hvdWxkIGJlIGVub3VnaFxyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBsb2FkIHRoZSBkZWZhdWx0IHN0eWxlcyBpZiBubyBzdHlsZSBpcyBnaXZlbicsICgpPT57XHJcbiAgICAgICAgZXhwZWN0KGRlZlRoZW1lLmJhY2tncm91bmQpLnRvLmVxdWFsKFNULlRoZW1lLmRlZmF1bHRzLmJhY2tncm91bmQpO1xyXG4gICAgICAgIGV4cGVjdChkZWZUaGVtZS5jb2xvcnMuYnV0dG9uLmhvdmVyKS50by5lcXVhbChTVC5UaGVtZS5kZWZhdWx0c1xyXG4gICAgICAgICAgICAud2lkZ2V0cy5idXR0b24uaG92ZXIpO1xyXG4gICAgICAgIC8vIG5vdCBnb25uYSBjaGVjayBlYWNoIG9uZS4gVGhpcyBzaG91bGQgYmUgZW5vdWdoXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2NvbG9ycycsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBlcXVhbCB0aGUgd2lkZ2V0cyBwb3J0aW9uIG9mIHRoZSBzdHlsZXMnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3QodGhlbWUuY29sb3JzKS50by5kZWVwLmVxdWFsKGdyZXlUb2FkVGhlbWUud2lkZ2V0cyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2ZvbnRTdHlsZXMnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgZXF1YWwgdGhlIHRleHQgcG9ydGlvbiBvZiB0aGUgc3R5bGVzJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHRoZW1lLmZvbnRTdHlsZXMpLnRvLmRlZXAuZXF1YWwoZ3JleVRvYWRUaGVtZS50ZXh0KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjZnJhbWVzJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGNvbnRhaW4gcmVjdHMgaW4gdGhlIHN0cnVjdHVyZSBvZiB0aGUgd2lkZ2V0cycgK1xyXG4gICAgICAgICAgICAnIHBvcnRpb24gb2YgdGhlIHN0eWxlcycsICgpPT57XHJcbiAgICAgICAgICAgICAgICAvLyB0ZXh0dXJlcyBiZWNvbWVzIGFuIGFsaWFzIGZvciBmcmFtZXMgdGhlcmVmb3JcclxuICAgICAgICAgICAgICAgIC8vIHNlZSAjdGV4dHVyZXNcclxuXHJcbiAgICAgICAgICAgICAgICAvLyB0cnkgYSBmZXcgb2YgdGhlbVxyXG4gICAgICAgICAgICAgICAgLy8gZXhwZWN0KHRoZW1lLmZyYW1lcy5idXR0b24uZW5hYmxlZCkudG8uYmUuYW5cclxuICAgICAgICAgICAgICAgIC8vICAgICAuaW5zdGFuY2VvZihQSVhJLlJlY3RhbmdsZSk7XHJcbiAgICAgICAgICAgICAgICAvLyBleHBlY3QodGhlbWUuZnJhbWVzLnBhbmVsLmhvdmVyKS50by5iZS5hblxyXG4gICAgICAgICAgICAgICAgLy8gICAgIC5pbnN0YW5jZW9mKFBJWEkuUmVjdGFuZ2xlKTtcclxuICAgICAgICAgICAgICAgIC8vIGV4cGVjdCh0aGVtZS5mcmFtZXMuc2xpZGVyLmJ1dHRvbi5lbmFibGVkKS50by5iZS5hblxyXG4gICAgICAgICAgICAgICAgLy8gICAgIC5pbnN0YW5jZW9mKFBJWEkuUmVjdGFuZ2xlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2Jhc2VUZXh0dXJlJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGJlIGEgUElYSS5CYXNlVGV4dHVyZScsICgpPT57XHJcbiAgICAgICAgICAgIGV4cGVjdCh0aGVtZS5iYXNlVGV4dHVyZSkudG8uYmUuYW4uaW5zdGFuY2VvZihQSVhJLkJhc2VUZXh0dXJlKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjdGV4dHVyZXMnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgY29udGFpbiB0ZXh0dXJlcyBpbiB0aGUgc3RydWN0dXJlIG9mIHRoZSB3aWRnZXRzJyArXHJcbiAgICAgICAgICAgICcgcG9ydGlvbiBvZiB0aGUgc3R5bGVzJywgKCk9PntcclxuICAgICAgICAgICAgICAgIC8vIHRyeSBhIGZldyBvZiB0aGVtXHJcbiAgICAgICAgICAgICAgICBleHBlY3QodGhlbWUudGV4dHVyZXMuYnV0dG9uLmVuYWJsZWQpLnRvLmJlLmFuXHJcbiAgICAgICAgICAgICAgICAgICAgLmluc3RhbmNlb2YoUElYSS5UZXh0dXJlKTtcclxuICAgICAgICAgICAgICAgIGV4cGVjdCh0aGVtZS50ZXh0dXJlcy5wYW5lbC5ob3ZlcikudG8uYmUuYW5cclxuICAgICAgICAgICAgICAgICAgICAuaW5zdGFuY2VvZihQSVhJLlRleHR1cmUpO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHRoZW1lLnRleHR1cmVzLnNsaWRlci5idXR0b24uZW5hYmxlZCkudG8uYmUuYW5cclxuICAgICAgICAgICAgICAgICAgICAuaW5zdGFuY2VvZihQSVhJLlRleHR1cmUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjYmFja2dyb3VuZCcsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBlcXVhbCB0aGUgY29sb3IgZ2l2ZW4gaW4gdGhlIHN0eWxlJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHRoZW1lLmJhY2tncm91bmQpLnRvLmVxdWFsKDB4ZmZmZmZmKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjZ2V0Q2xpcEdyYXBoaWMoKSAoU1RBVElDKScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gdGhlIGdsb2JhbCBjbGlwR3JhcGhpYycsICgpPT57XHJcbiAgICAgICAgICAgIGV4cGVjdChTVC5UaGVtZS5nZXRDbGlwR3JhcGhpYygpKS50by5iZS5hblxyXG4gICAgICAgICAgICAgICAgLmluc3RhbmNlb2YoUElYSS5HcmFwaGljcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3JlZ2lzdGVyRGVmYXVsdFdpZGdldFN0eWxlKCkgKFNUQVRJQyknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgYWRkIHRoZSBnaXZlbiBzdHlsZSB0byB0aGVtZS5kZWZhdWx0cyhnbG9iYWwpJywgKCk9PntcclxuICAgICAgICAgICAgbGV0IHN0eWxlID0ge1xyXG4gICAgICAgICAgICAgICAga25vYjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IDB4MDAwMDAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiAweGZmZmZmZixcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBTVC5UaGVtZS5yZWdpc3RlckRlZmF1bHRXaWRnZXRTdHlsZSgncGFuZScsIHN0eWxlKTtcclxuXHJcbiAgICAgICAgICAgIGV4cGVjdChTVC5UaGVtZS5kZWZhdWx0cy53aWRnZXRzLnBhbmUua25vYi5lbmFibGVkKVxyXG4gICAgICAgICAgICAgICAgLnRvLmVxdWFsKDB4MDAwMDAwKTtcclxuXHJcbiAgICAgICAgICAgIGV4cGVjdChTVC5UaGVtZS5kZWZhdWx0cy53aWRnZXRzLnBhbmUua25vYi5kaXNhYmxlZClcclxuICAgICAgICAgICAgICAgIC50by5lcXVhbCgweGZmZmZmZik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI21ha2VHcmFwaGljc1JlY3Vyc2l2ZSgpJywgKCk9PntcclxuICAgICAgICAvLyBub3QgbmVlZGVkIGlmIGZyYW1lcyB0ZXN0IGFib3ZlIHBhc3Nlc1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNtYWtlVGV4dHVyZSgpJywgKCk9PntcclxuICAgICAgICAvLyBub3QgbmVlZGVkIGlmIGJhc2VUZXh0dXJlIHRlc3QgYWJvdmUgcGFzc2VzXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI21ha2VUZXh0dXJlc1JlY3Vyc2l2ZSgpJywgKCk9PntcclxuICAgICAgICAvLyBub3QgbmVlZGVkIGlmIHRleHR1cmVzIHRleHQgYWJvdmUgcGFzc2VzXHJcbiAgICB9KTtcclxufSk7XHJcbiIsInJlcXVpcmUoJy4vVGhlbWUtc3BlYycpO1xyXG5yZXF1aXJlKCcuL1NpemUtc3BlYycpO1xyXG5yZXF1aXJlKCcuL1BvaW50LXNwZWMnKTtcclxucmVxdWlyZSgnLi9QYWRkaW5nLXNwZWMnKTtcclxucmVxdWlyZSgnLi9HcmFwaGljc0dlbi1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vQXBwLXNwZWMnKTtcclxucmVxdWlyZSgnLi93aWRnZXRzJyk7XHJcbnJlcXVpcmUoJy4vbGF5b3V0U3lzJyk7XG5yZXF1aXJlKCcuL1NldHRpbmdzLXNwZWMnKTtcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdBbGlnbm1lbnQnLCAoKT0+e1xyXG4gICAgbGV0IHdpZGdldDAgPSBuZXcgU1QuV2lkZ2V0cy5CYXNlV2lkZ2V0KCk7XHJcbiAgICB3aWRnZXQwLndpZHRoID0gNDAwOyB3aWRnZXQwLmhlaWdodCA9IDQwMDtcclxuICAgIGxldCB3aWRnZXQxID0gbmV3IFNULldpZGdldHMuQmFzZVdpZGdldCh3aWRnZXQwKTtcclxuICAgIHdpZGdldDEud2lkdGggPSAyMDA7IHdpZGdldDEuaGVpZ2h0ID0gMjAwO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjZ2V0T2Zmc2V0KCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIGEgcmVsYXRpdmUgb2Zmc2V0IGJhc2Ugb24gdGhlIGdpdmVuIGhvcml6b250YWwnXHJcbiAgICAgICAgICAgICsgJyBhbmQgdmVydGljYWwgYWxpZ25tZW50JywgKCk9PntcclxuICAgICAgICAgICAgICAgIHdpZGdldDAubGF5b3V0LmFsaWdubWVudC5oQWxpZ24gPSBTVC5BbGlnbm1lbnQuY2VudGVyO1xyXG4gICAgICAgICAgICAgICAgd2lkZ2V0MC5sYXlvdXQuYWxpZ25tZW50LnZBbGlnbiA9IFNULkFsaWdubWVudC5taWRkbGU7XHJcbiAgICAgICAgICAgICAgICBsZXQgb2ZmID0gbmV3IFNULlBvaW50KCk7XHJcbiAgICAgICAgICAgICAgICBvZmYgPSB3aWRnZXQwLmxheW91dC5hbGlnbm1lbnQuZ2V0T2Zmc2V0KHdpZGdldDAsXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkZ2V0MS53aWR0aCwgd2lkZ2V0MS5oZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgLy8gKHdpZGdldDAud2lkdGgvMikgLSAod2lkZ2V0MS53aWR0aC8yKVxyXG4gICAgICAgICAgICAgICAgZXhwZWN0KG9mZi54KS50by5lcXVhbCgxMDApO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KG9mZi55KS50by5lcXVhbCgxMDApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjbGVmdCcsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gcmVsYXRpdmUgcG9zaXRpb24gZm9yIGxlZnQgYWxpZ25tZW50JywgKCk9PntcclxuICAgICAgICAgICAgbGV0IG9mZiA9IFNULkFsaWdubWVudC5sZWZ0KDQwMCwgd2lkZ2V0MCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChvZmYpLnRvLmVxdWFsKDQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNjZW50ZXInLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIHJlbGF0aXZlIHBvc2l0aW9uIGZvciBjZW50ZXIgYWxpZ25tZW50JywgKCk9PntcclxuICAgICAgICAgICAgbGV0IG9mZiA9IFNULkFsaWdubWVudC5jZW50ZXIoMTAwLCB3aWRnZXQwKTtcclxuICAgICAgICAgICAgZXhwZWN0KG9mZikudG8uZXF1YWwoMTUwKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjcmlnaHQnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIHJlbGF0aXZlIHBvc2l0aW9uIGZvciByaWdodCBhbGlnbm1lbnQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgb2ZmID0gU1QuQWxpZ25tZW50LnJpZ2h0KDEwMCwgd2lkZ2V0MCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChvZmYpLnRvLmVxdWFsKDMwMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3RvcCcsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gcmVsYXRpdmUgcG9zaXRpb24gZm9yIHRvcCBhbGlnbm1lbnQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgb2ZmID0gU1QuQWxpZ25tZW50LnRvcCgxMDAsIHdpZGdldDApO1xyXG4gICAgICAgICAgICBleHBlY3Qob2ZmKS50by5lcXVhbCg0KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjbWlkZGxlJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHJldHVybiByZWxhdGl2ZSBwb3NpdGlvbiBmb3IgbWlkZGxlIGFsaWdubWVudCcsICgpPT57XHJcbiAgICAgICAgICAgIGxldCBvZmYgPSBTVC5BbGlnbm1lbnQubWlkZGxlKDEwMCwgd2lkZ2V0MCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChvZmYpLnRvLmVxdWFsKDE1MCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2JvdHRvbScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gcmVsYXRpdmUgcG9zaXRpb24gZm9yIGJvdHRvbSBhbGlnbm1lbnQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgb2ZmID0gU1QuQWxpZ25tZW50LmJvdHRvbSgxMDAsIHdpZGdldDApO1xyXG4gICAgICAgICAgICBleHBlY3Qob2ZmKS50by5lcXVhbCgzMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCJyZXF1aXJlKCcuL0FsaWdubWVudC1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vc2l6ZVBvbGljaWVzJyk7XHJcbnJlcXVpcmUoJy4vbGF5b3V0cycpO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnQmFzZUxheW91dCcsICgpPT57XHJcbiAgICBsZXQgd2lkZ2V0MCA9IG5ldyBTVC5XaWRnZXRzLlBhbmVsKG51bGwsIHt3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMH0pO1xyXG4gICAgbGV0IHdpZGdldDEgPSBuZXcgU1QuV2lkZ2V0cy5CdXR0b24od2lkZ2V0MCwge3dpZHRoOiAyMCwgaGVpZ2h0OiAyMH0pO1xyXG4gICAgd2lkZ2V0MS5wb3NpdGlvbi5zZXQoMjAsIDIwKTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2V4ZWMnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBwb3NpdGlvbiBvZiBpdHMgY2hpbGRyZW4gYW5kIGV4ZWMgdGhlaXIgbGF5b3VycycsXHJcbiAgICAgICAgKCk9PntcclxuICAgICAgICAgICAgLy8gcmVhbCBwb3NpdGlvbiBpc250IHNldCB1bnRpbCBsYXlvdXQgZXhlY3V0ZXNcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEudHJhbnNmb3JtLnBvc2l0aW9uLngpLnRvLmVxdWFsKDApO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS50cmFuc2Zvcm0ucG9zaXRpb24ueSkudG8uZXF1YWwoMCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgc3B5ID0gc2lub24uc3B5KHdpZGdldDEubGF5b3V0LCAnZXhlYycpO1xyXG5cclxuICAgICAgICAgICAgd2lkZ2V0MC5sYXlvdXQuZXhlYygpO1xyXG5cclxuICAgICAgICAgICAgZXhwZWN0KHNweS5jYWxsZWQpLnRvLmJlLnRydWU7XHJcblxyXG4gICAgICAgICAgICB3aWRnZXQxLmxheW91dC5leGVjLnJlc3RvcmUoKTtcclxuXHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLnRyYW5zZm9ybS5wb3NpdGlvbi54KS50by5lcXVhbCgyNCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLnRyYW5zZm9ybS5wb3NpdGlvbi55KS50by5lcXVhbCgyNCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdCb3hMYXlvdXQnLCAoKT0+e1xyXG4gICAgbGV0IHcwID0gbmV3IFNULldpZGdldHMuUGFuZWwobnVsbCwge3dpZHRoOiA0MDAsIGhlaWdodDogNDAwfSk7XHJcbiAgICB3MC5sYXlvdXQgPSBuZXcgU1QuTGF5b3V0cy5Cb3hMYXlvdXQodzAsIFNULlZFUlRJQ0FMKTtcclxuICAgIGxldCB3MSA9IG5ldyBTVC5XaWRnZXRzLkJ1dHRvbih3MCwge3dpZHRoOiAyMCwgaGVpZ2h0OiAyMH0pO1xyXG4gICAgbGV0IHcyID0gbmV3IFNULldpZGdldHMuQnV0dG9uKHcwLCB7d2lkdGg6IDIwLCBoZWlnaHQ6IDIwfSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcclxuICAgIGxldCB3MyA9IG5ldyBTVC5XaWRnZXRzLkJ1dHRvbih3MCwge3dpZHRoOiAyMCwgaGVpZ2h0OiAyMH0pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXHJcblxyXG4gICAgZGVzY3JpYmUoJyNpbml0VG90YWxDaGlsZHJlblNpemUoKScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBjYWxjdWxhdGUgdGhlIHRvdGFsIHNpemUgb2YgdGhlIGNoaWxkcmVuJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHcwLmxheW91dC5fdG90YWxDaGlsZHJlbldpZHRoKS50by5lcXVhbCgwKTtcclxuICAgICAgICAgICAgZXhwZWN0KHcwLmxheW91dC5fdG90YWxDaGlsZHJlbkhlaWdodCkudG8uZXF1YWwoMCk7XHJcblxyXG4gICAgICAgICAgICB3MC5sYXlvdXQuaW5pdFRvdGFsQ2hpbGRyZW5TaXplKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBhZGQgdG9nZXRoZXIgKyBzcGFjaW5nXHJcbiAgICAgICAgICAgIGV4cGVjdCh3MC5sYXlvdXQuX3RvdGFsQ2hpbGRyZW5XaWR0aCkudG8uZXF1YWwoNzIpO1xyXG4gICAgICAgICAgICBleHBlY3QodzAubGF5b3V0Ll90b3RhbENoaWxkcmVuSGVpZ2h0KS50by5lcXVhbCg3Mik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2JlZ2luSXRlcmF0aW9uKCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgcHJlcGFyZSB2YXJpYWJsZXMgYmVmb3JlIGl0ZXJhdGlvbicsICgpPT57XHJcbiAgICAgICAgICAgIGxldCB3TGF5b3V0ID0gdzAubGF5b3V0O1xyXG4gICAgICAgICAgICB3TGF5b3V0LmJlZ2luSXRlcmF0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICBleHBlY3Qod0xheW91dC5fdG90YWxDaGlsZHJlbkhlaWdodCkudG8uZXF1YWwoMCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3TGF5b3V0Ll90b3RhbENoaWxkcmVuV2lkdGgpLnRvLmVxdWFsKDApO1xyXG5cclxuICAgICAgICAgICAgZXhwZWN0KHdMYXlvdXQucG9zT2Zmc2V0LngpLnRvLmVxdWFsKDApO1xyXG4gICAgICAgICAgICBleHBlY3Qod0xheW91dC5wb3NPZmZzZXQueSkudG8uZXF1YWwoMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3NldENoaWxkUG9zKCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgY2hpbGQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgd0xheW91dCA9IHcwLmxheW91dDtcclxuICAgICAgICAgICAgd0xheW91dC5zZXRDaGlsZFBvcyh3MSk7XHJcblxyXG4gICAgICAgICAgICBleHBlY3Qod0xheW91dC5fdG90YWxDaGlsZHJlbldpZHRoKS50by5lcXVhbCgyNCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3TGF5b3V0Ll90b3RhbENoaWxkcmVuSGVpZ2h0KS50by5lcXVhbCgyNCk7XHJcblxyXG4gICAgICAgICAgICBleHBlY3QodzEudHJhbnNmb3JtLnBvc2l0aW9uLngpLnRvLmVxdWFsKDQpO1xyXG4gICAgICAgICAgICBleHBlY3QodzEudHJhbnNmb3JtLnBvc2l0aW9uLnkpLnRvLmVxdWFsKDQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnRml4ZWRMYXlvdXQnLCAoKT0+e1xyXG4gICAgbGV0IHcwID0gbmV3IFNULldpZGdldHMuUGFuZWwobnVsbCwge3dpZHRoOiA0MDAsIGhlaWdodDogNDAwfSk7XHJcbiAgICBsZXQgdzEgPSBuZXcgU1QuV2lkZ2V0cy5CdXR0b24odzApO1xyXG4gICAgdzEucG9zaXRpb24uc2V0KDEyLCAxMik7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNzZXRDaGlsZFBvcygpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCB0aGUgY2hpbGRzIHBvc2l0aW9uJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHcxLnRyYW5zZm9ybS5wb3NpdGlvbi54KS50by5lcXVhbCgwKTtcclxuICAgICAgICAgICAgZXhwZWN0KHcxLnRyYW5zZm9ybS5wb3NpdGlvbi55KS50by5lcXVhbCgwKTtcclxuXHJcbiAgICAgICAgICAgIHcwLmxheW91dC5zZXRDaGlsZFBvcyh3MSk7XHJcblxyXG4gICAgICAgICAgICBleHBlY3QodzEudHJhbnNmb3JtLnBvc2l0aW9uLngpLnRvLmVxdWFsKDE2KTtcclxuICAgICAgICAgICAgZXhwZWN0KHcxLnRyYW5zZm9ybS5wb3NpdGlvbi55KS50by5lcXVhbCgxNik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdIQm94TGF5b3V0JywgKCk9PntcclxuICAgIGl0KCdzaG91bGQgY29uc3RydWN0IGEgQm94TGF5b3V0IHdpdGggSE9SSVpPTlRBTCBvcmllbnRhdGlvbicsICgpPT57XHJcbiAgICAgICAgbGV0IHcxID0gbmV3IFNULldpZGdldHMuUGFuZWwoKTtcclxuXHJcbiAgICAgICAgdzEubGF5b3V0ID0gbmV3IFNULkxheW91dHMuSEJveExheW91dCh3MSk7XHJcbiAgICAgICAgZXhwZWN0KHcxLmxheW91dC5vcmllbnRhdGlvbikudG8uZXF1YWwoU1QuSE9SSVpPTlRBTCk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdWQm94TGF5b3V0JywgKCk9PntcclxuICAgIGl0KCdzaG91bGQgY29uc3RydWN0IGEgQm94TGF5b3V0IHdpdGggVkVSVElDQUwgb3JpZW50YXRpb24nLCAoKT0+e1xyXG4gICAgICAgIGxldCB3MSA9IG5ldyBTVC5XaWRnZXRzLlBhbmVsKCk7XHJcblxyXG4gICAgICAgIHcxLmxheW91dCA9IG5ldyBTVC5MYXlvdXRzLlZCb3hMYXlvdXQodzEpO1xyXG4gICAgICAgIGV4cGVjdCh3MS5sYXlvdXQub3JpZW50YXRpb24pLnRvLmVxdWFsKFNULlZFUlRJQ0FMKTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwicmVxdWlyZSgnLi9CYXNlTGF5b3V0LXNwZWMnKTtcclxucmVxdWlyZSgnLi9Cb3hMYXlvdXQtc3BlYycpO1xyXG5yZXF1aXJlKCcuL0ZpeGVkTGF5b3V0LXNwZWMnKTtcclxucmVxdWlyZSgnLi9IQm94TGF5b3V0LXNwZWMnKTtcclxucmVxdWlyZSgnLi9WQm94TGF5b3V0LXNwZWMnKTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ0Jhc2VQb2xpY3knLCAoKT0+e1xyXG4gICAgbGV0IHdpZGdldCA9IG5ldyBTVC5XaWRnZXRzLkJ1dHRvbigpO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjY2hpbGRQb2xpY3lGaW5pc2hlZCgpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGFkZCBlYWNoIGNoaWxkcyBzaXplIHRvIHRvdGFsQ2hpbGRyZW5GaW5pc2hlZFNpemUgYW5kJ1xyXG4gICAgICAgICAgICArICcgc3Vic3RyYWN0IDEgZnJvbSB0b3RhbENoaWxkcmVuRmluaXNoZWQnLCAoKT0+e1xyXG4gICAgICAgICAgICAgICAgd2lkZ2V0LmhQb2xpY3kudG90YWxDaGlsZHJlbkZpbmlzaGVkID0gMTtcclxuICAgICAgICAgICAgICAgIHdpZGdldC5oUG9saWN5LnRvdGFsQ2hpbGRyZW5GaW5pc2hlZFNpemUgPSAxMDA7XHJcbiAgICAgICAgICAgICAgICB3aWRnZXQuaFBvbGljeS5jaGlsZFBvbGljeUZpbmlzaGVkKDQwMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHdpZGdldC5oUG9saWN5LnRvdGFsQ2hpbGRyZW5GaW5pc2hlZCkudG8uZXF1YWwoMCk7XHJcbiAgICAgICAgICAgICAgICBleHBlY3Qod2lkZ2V0LmhQb2xpY3kudG90YWxDaGlsZHJlbkZpbmlzaGVkU2l6ZSkudG8uZXF1YWwoNTAwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2V4ZWMoKScsICgpPT57XHJcbiAgICAgICAgbGV0IHdpZGdldDIgPSBuZXcgU1QuV2lkZ2V0cy5CdXR0b24od2lkZ2V0KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCBhZGQgYSBvbmUgdGltZSBldmVudCdcclxuICAgICAgICArICcoIHJlZ2lzdGVyIHNpemUgd2l0aCBjaGlsZFBvbGljeUZpbmlzaGVkICkgYW5kIGV4ZWMgdGhlICdcclxuICAgICAgICArICdIT1JJWk9OVEFMIHNpemUgcG9saWN5IGZvciBlYWNoIGNoaWxkICdcclxuICAgICAgICArICd0aGF0IGlzIEhPUklaT05UQUwgYW5kIGFuIGluc3RhbmNlb2YgU1QuV2lkZ2V0cy5CYXNlV2lkZ2V0JywgKCk9PntcclxuICAgICAgICAgICAgbGV0IHNweSA9IHNpbm9uLnNweSh3aWRnZXQyLmhQb2xpY3ksICdleGVjJyk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLmhQb2xpY3kubGlzdGVuZXJzKCdmaW5pc2hlZCcsIHRydWUpKS50by5iZS5mYWxzZTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIpLnRvLmJlLmFuLmluc3RhbmNlb2YoU1QuV2lkZ2V0cy5CYXNlV2lkZ2V0KTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldC5oUG9saWN5Lm9yaWVudGF0aW9uKS50by5lcXVhbChTVC5IT1JJWk9OVEFMKTtcclxuICAgICAgICAgICAgd2lkZ2V0LmhQb2xpY3kuZXhlYygpO1xyXG5cclxuICAgICAgICAgICAgZXhwZWN0KHNweS5jYWxsZWQpLnRvLmJlLnRydWU7XHJcbiAgICAgICAgICAgIHdpZGdldDIuaFBvbGljeS5leGVjLnJlc3RvcmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCBhZGQgYSBvbmUgdGltZSBldmVudCdcclxuICAgICAgICArICcoIHJlZ2lzdGVyIHNpemUgd2l0aCBjaGlsZFBvbGljeUZpbmlzaGVkICkgYW5kIGV4ZWMgdGhlICdcclxuICAgICAgICArICdWRVJUSUNBTCBzaXplIHBvbGljeSBmb3IgZWFjaCBjaGlsZCAnXHJcbiAgICAgICAgKyAndGhhdCBpcyBWRVJUSUNBTCBhbmQgYW4gaW5zdGFuY2VvZiBTVC5XaWRnZXRzLkJhc2VXaWRnZXQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgc3B5ID0gc2lub24uc3B5KHdpZGdldDIudlBvbGljeSwgJ2V4ZWMnKTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIudlBvbGljeS5saXN0ZW5lcnMoJ2ZpbmlzaGVkJywgdHJ1ZSkpLnRvLmJlLmZhbHNlO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MikudG8uYmUuYW4uaW5zdGFuY2VvZihTVC5XaWRnZXRzLkJhc2VXaWRnZXQpO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0LnZQb2xpY3kub3JpZW50YXRpb24pLnRvLmVxdWFsKFNULlZFUlRJQ0FMKTtcclxuICAgICAgICAgICAgd2lkZ2V0LnZQb2xpY3kuZXhlYygpO1xyXG5cclxuICAgICAgICAgICAgZXhwZWN0KHNweS5jYWxsZWQpLnRvLmJlLnRydWU7XHJcbiAgICAgICAgICAgIHdpZGdldDIudlBvbGljeS5leGVjLnJlc3RvcmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCBjYWxsIHNpemVXaWRnZXRIb3Jpem9udGFsKCkgaWYgdGhlIHdpZGdldCBpcyBIT1JJWk9OVEFMJyxcclxuICAgICAgICAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgc3B5ID0gc2lub24uc3B5KHdpZGdldC5oUG9saWN5LCAnc2l6ZVdpZGdldEhvcml6b250YWwnKTtcclxuICAgICAgICAgICAgd2lkZ2V0LmhQb2xpY3kuZXhlYygpO1xyXG4gICAgICAgICAgICBleHBlY3Qoc3B5LmNhbGxlZCkudG8uYmUudHJ1ZTtcclxuICAgICAgICAgICAgd2lkZ2V0LmhQb2xpY3kuc2l6ZVdpZGdldEhvcml6b250YWwucmVzdG9yZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIGNhbGwgc2l6ZVdpZGdldFZlcnRpY2FsKCkgaWYgdGhlIHdpZGdldCBpcyBWRVJUSUNBTCcsXHJcbiAgICAgICAgKCk9PntcclxuICAgICAgICAgICAgbGV0IHNweSA9IHNpbm9uLnNweSh3aWRnZXQudlBvbGljeSwgJ3NpemVXaWRnZXRWZXJ0aWNhbCcpO1xyXG4gICAgICAgICAgICB3aWRnZXQudlBvbGljeS5leGVjKCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChzcHkuY2FsbGVkKS50by5iZS50cnVlO1xyXG4gICAgICAgICAgICB3aWRnZXQudlBvbGljeS5zaXplV2lkZ2V0VmVydGljYWwucmVzdG9yZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnRXhwYW5kaW5nUG9saWN5JywgKCk9PntcclxuICAgIGxldCB3aWRnZXQwID0gbmV3IFNULldpZGdldHMuQnV0dG9uKCk7XHJcbiAgICB3aWRnZXQwLndpZHRoID0gMjAwOyB3aWRnZXQwLmhlaWdodCA9IDIwMDtcclxuICAgIGxldCB3aWRnZXQxID0gbmV3IFNULldpZGdldHMuQnV0dG9uKHdpZGdldDApO1xyXG4gICAgd2lkZ2V0MS5oUG9saWN5ID0gbmV3IFNULlNpemVQb2xpY2llcy5FeHBhbmRpbmdQb2xpY3kod2lkZ2V0MSk7XHJcbiAgICB3aWRnZXQxLnZQb2xpY3kgPSBuZXcgU1QuU2l6ZVBvbGljaWVzLkV4cGFuZGluZ1BvbGljeSh3aWRnZXQxKTtcclxuICAgIHdpZGdldDEud2lkdGggPSAxMDA7IHdpZGdldDEuaGVpZ2h0ID0gMTAwO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjcGFyZW50UmVhZHlIJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNpemUgdGhlIHdpZGdldCB0byBtYXRjaCBpdHMgcGFyZW50cyB3aWR0aCAtIHBhZGRpbmcnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS53aWR0aCkudG8uZXF1YWwoMTAwKTtcclxuICAgICAgICAgICAgd2lkZ2V0MS5oUG9saWN5LnBhcmVudFJlYWR5SCgpO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS53aWR0aCkudG8uZXF1YWwoMTkyKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjcGFyZW50UmVhZHlWJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNpemUgdGhlIHdpZGdldCB0byBtYXRjaCBpdHMgcGFyZW50cyBoZWlnaHQgLSBwYWRkaW5nJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEuaGVpZ2h0KS50by5lcXVhbCgxMDApO1xyXG4gICAgICAgICAgICB3aWRnZXQxLnZQb2xpY3kucGFyZW50UmVhZHlWKCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLmhlaWdodCkudG8uZXF1YWwoMTkyKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ0ZpeGVkUG9saWN5JywgKCk9PntcclxuICAgIGxldCB3aWRnZXQgPSBuZXcgU1QuV2lkZ2V0cy5CdXR0b24oKTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3NpemVXaWRnZXRIb3Jpem9udGFsJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHZhbGlkYXRlIHRoZSB3aWR0aCBvZiB0aGUgd2lkZ2V0JywgKCk9PntcclxuICAgICAgICAgICAgbGV0IHNweSA9IHNpbm9uLnNweSh3aWRnZXQsICd2YWxpZGF0ZVdpZHRoJyk7XHJcbiAgICAgICAgICAgIHdpZGdldC5oUG9saWN5LnNpemVXaWRnZXRIb3Jpem9udGFsKCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChzcHkuY2FsbGVkKS50by5iZS50cnVlO1xyXG4gICAgICAgICAgICB3aWRnZXQudmFsaWRhdGVXaWR0aC5yZXN0b3JlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3NpemVXaWRnZXRWZXJ0aWNhbCcsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCB2YWxpZGF0ZSB0aGUgaGVpZ2h0IG9mIHRoZSB3aWRnZXQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgc3B5ID0gc2lub24uc3B5KHdpZGdldCwgJ3ZhbGlkYXRlSGVpZ2h0Jyk7XHJcbiAgICAgICAgICAgIHdpZGdldC52UG9saWN5LnNpemVXaWRnZXRWZXJ0aWNhbCgpO1xyXG4gICAgICAgICAgICBleHBlY3Qoc3B5LmNhbGxlZCkudG8uYmUudHJ1ZTtcclxuICAgICAgICAgICAgd2lkZ2V0LnZhbGlkYXRlSGVpZ2h0LnJlc3RvcmUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ1NoYXJlZEV4cGFuZGluZ1BvbGljeScsICgpPT57XHJcbiAgICBsZXQgd2lkZ2V0MCA9IG5ldyBTVC5XaWRnZXRzLlBhbmVsKG51bGwsIHt3aWR0aDogNDAwLCBoZWlnaHQ6IDQwMH0pO1xyXG4gICAgd2lkZ2V0MC5sYXlvdXQgPSBuZXcgU1QuTGF5b3V0cy5IQm94TGF5b3V0KHdpZGdldDApO1xyXG5cclxuICAgIGxldCB3aWRnZXQxID0gbmV3IFNULldpZGdldHMuQnV0dG9uKHdpZGdldDApO1xyXG4gICAgd2lkZ2V0MS5oUG9saWN5ID0gbmV3IFNULlNpemVQb2xpY2llcy5TaGFyZWRFeHBhbmRpbmdQb2xpY3kod2lkZ2V0MSk7XHJcbiAgICB3aWRnZXQxLnZQb2xpY3lcclxuICAgID0gbmV3IFNULlNpemVQb2xpY2llcy5TaGFyZWRFeHBhbmRpbmdQb2xpY3kod2lkZ2V0MSwgU1QuVkVSVElDQUwpO1xyXG5cclxuICAgIGxldCB3aWRnZXQyID0gbmV3IFNULldpZGdldHMuQnV0dG9uKHdpZGdldDApO1xyXG4gICAgd2lkZ2V0Mi5oUG9saWN5ID0gbmV3IFNULlNpemVQb2xpY2llcy5TaGFyZWRFeHBhbmRpbmdQb2xpY3kod2lkZ2V0Mik7XHJcbiAgICB3aWRnZXQyLnZQb2xpY3lcclxuICAgID0gbmV3IFNULlNpemVQb2xpY2llcy5TaGFyZWRFeHBhbmRpbmdQb2xpY3kod2lkZ2V0MiwgU1QuVkVSVElDQUwpO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjcGFyZW50UmVhZHlIJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNpemUgdGhlIHdpZGdldHMgZXF1YWwgc2l6ZSBpZiBhbGwgaGF2ZSBzaGFyZWQgcG9saWN5JywgKCk9PntcclxuICAgICAgICAgICAgd2lkZ2V0MC5oUG9saWN5LmV4ZWMoKTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEud2lkdGgpLnRvLmVxdWFsKDE5NCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLndpZHRoKS50by5lcXVhbCgxOTQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIGhhbmRsZSB3aWRnZXRzIHRoYXQgYXJlbnQgb2Ygc2hhcmVkIHBvbGljeScsICgpPT57XHJcbiAgICAgICAgICAgIGxldCBudWxsd2lkZ2V0ID0gbmV3IFNULldpZGdldHMuUGFuZWwoKTtcclxuICAgICAgICAgICAgbGV0IHdpZGdldDNcclxuICAgICAgICAgICAgPSBuZXcgU1QuV2lkZ2V0cy5CdXR0b24od2lkZ2V0MCwge3dpZHRoOiAxMDAsIGhlaWdodDogMTAwfSk7XHJcbiAgICAgICAgICAgIHdpZGdldDMuaFBvbGljeSA9IG5ldyBTVC5TaXplUG9saWNpZXMuRml4ZWRQb2xpY3kod2lkZ2V0Myk7XHJcbiAgICAgICAgICAgIHdpZGdldDAuaFBvbGljeS5leGVjKCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLndpZHRoKS50by5lcXVhbCgxNDIpO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0Mi53aWR0aCkudG8uZXF1YWwoMTQyKTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDMud2lkdGgpLnRvLmVxdWFsKDEwMCk7XHJcbiAgICAgICAgICAgIG51bGx3aWRnZXQuYWRkQ2hpbGQod2lkZ2V0Myk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3BhcmVudFJlYWR5VicsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBzaXplIHRoZSB3aWRnZXRzIGVxdWFsIHNpemUgaWYgYWxsIGhhdmUgc2hhcmVkIHBvbGljeScsICgpPT57XHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICBzYW1lIGFzIGFib3ZlIHRlc3QuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIGhhbmRsZSB3aWRnZXRzIHRoYXQgYXJlbnQgb2Ygc2hhcmVkIHBvbGljeScsICgpPT57XHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICBzYW1lIGFzIGFib3ZlIHRlc3QuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNjb25zdW1lVW51c2VkU3BhY2VIKCknLCAoKT0+e1xyXG4gICAgICAgIC8vIFRPRE9cclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjY29uc3VtZVVudXNlZFNwYWNlVigpJywgKCk9PntcclxuICAgICAgICAvLyBUT0RPXHJcbiAgICB9KTtcclxufSk7XHJcbiIsInJlcXVpcmUoJy4vQmFzZVBvbGljeS1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vRXhwYW5kaW5nUG9saWN5LXNwZWMnKTtcclxucmVxdWlyZSgnLi9GaXhlZFBvbGljeS1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vU2hhcmVkRXhwYW5kaW5nUG9saWN5LXNwZWMnKTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLypcclxuVE9ETzpcclxudGVzdCB0aGluZ3MgdGhhdCBzaG91bGQgaGFwcGVuIHdoZW4gZXZlbnRzIGFyZSBmaXJlZC5cclxuZWcuIHdoZW4gcGFkZGluZyBjaGFuZ2VzIF91cGRhdGVDbGlwR3JhcGhpYyBzaG91bGQgYmUgY2FsbGVkLlxyXG4gKi9cclxuXHJcbmRlc2NyaWJlKCdCYXNlV2lkZ2V0JywgKCk9PntcclxuICAgIGxldCB3aWRnZXQwID0gbmV3IFNULldpZGdldHMuUGFuZWwoKTtcbiAgICBsZXQgd2lkZ2V0MSA9IG5ldyBTVC5XaWRnZXRzLlBhbmVsKHdpZGdldDApO1xuICAgIGxldCB3aWRnZXQyID0gbmV3IFNULldpZGdldHMuUGFuZWwod2lkZ2V0MSk7XG5cclxuICAgIGJlZm9yZUVhY2goKCk9PntcclxuICAgICAgICB3aWRnZXQxLmxheW91dFxyXG4gICAgICAgICAgICA9IG5ldyBTVC5MYXlvdXRzLkZpeGVkTGF5b3V0KHdpZGdldDEpO1xyXG4gICAgICAgIHdpZGdldDIuaFBvbGljeVxyXG4gICAgICAgICAgICA9IG5ldyBTVC5TaXplUG9saWNpZXMuRml4ZWRQb2xpY3kod2lkZ2V0Mik7XG4gICAgICAgIHdpZGdldDAuaFBvbGljeVxyXG4gICAgICAgICAgICA9IG5ldyBTVC5TaXplUG9saWNpZXMuRml4ZWRQb2xpY3kod2lkZ2V0MCk7XG4gICAgICAgIHdpZGdldDEudmFsaWRhdGUoKTtcclxuICAgICAgICB3aWRnZXQwLnZhbGlkYXRlKCk7XHJcbiAgICAgICAgd2lkZ2V0Mi52YWxpZGF0ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBwYXJlbnQgb25lIHdpZGdldCB0byBhbm90aGVyJywgKCk9PntcclxuICAgICAgICBleHBlY3Qod2lkZ2V0Mi5wYXJlbnQpLnRvLmVxdWFsKHdpZGdldDEpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNiZWdpbkJ5cGFzc1VwZGF0ZSgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2VuZEJ5cGFzc1VwZGF0ZSgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3ZhbGlkYXRlV2lkdGgoKScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBrZWVwIHdpZGdldHMgd2lkdGggd2l0aGluIG1pbi9tYXgnLCAoKT0+e1xyXG4gICAgICAgICAgICB3aWRnZXQyLm1pbi53aWR0aCA9IDEwO1xyXG4gICAgICAgICAgICB3aWRnZXQyLm1heC53aWR0aCA9IDgwO1xyXG4gICAgICAgICAgICB3aWRnZXQyLndpZHRoID0gMTAwO1xyXG4gICAgICAgICAgICB3aWRnZXQyLnZhbGlkYXRlV2lkdGgoKTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIud2lkdGgpLnRvLmVxdWFsKDgwKTtcclxuICAgICAgICAgICAgd2lkZ2V0Mi53aWR0aCA9IDU7XHJcbiAgICAgICAgICAgIHdpZGdldDIudmFsaWRhdGVXaWR0aCgpO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0Mi53aWR0aCkudG8uZXF1YWwoMTApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyN2YWxpZGF0ZUhlaWdodCgpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGtlZXAgd2lkZ2V0cyBoZWlnaHQgd2l0aGluIG1pbi9tYXgnLCAoKT0+e1xyXG4gICAgICAgICAgICB3aWRnZXQyLm1pbi5oZWlnaHQgPSAxMDtcclxuICAgICAgICAgICAgd2lkZ2V0Mi5tYXguaGVpZ2h0ID0gODA7XHJcbiAgICAgICAgICAgIHdpZGdldDIuaGVpZ2h0ID0gMTAwO1xyXG4gICAgICAgICAgICB3aWRnZXQyLnZhbGlkYXRlSGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLmhlaWdodCkudG8uZXF1YWwoODApO1xyXG4gICAgICAgICAgICB3aWRnZXQyLmhlaWdodCA9IDU7XHJcbiAgICAgICAgICAgIHdpZGdldDIudmFsaWRhdGVIZWlnaHQoKTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIuaGVpZ2h0KS50by5lcXVhbCgxMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3VwZGF0ZSgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3ZhbGlkYXRlKCknLCAoKT0+e1xyXG5cclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjaW52YWxpZGF0ZSgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3JvdXRlSW52YWxpZGF0aW9uKCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgaW52YWxpZGF0ZSB0aGUgaGlnaGVzdCBwYXJlbnQnLCAoKT0+e1xyXG4gICAgICAgICAgICB3aWRnZXQxLmxheW91dFxyXG4gICAgICAgICAgICAgICAgPSBuZXcgU1QuTGF5b3V0cy5IQm94TGF5b3V0KHdpZGdldDEpO1xyXG4gICAgICAgICAgICB3aWRnZXQyLmxheW91dFxuICAgICAgICAgICAgICAgID0gbmV3IFNULkxheW91dHMuSEJveExheW91dCh3aWRnZXQyKTtcclxuICAgICAgICAgICAgICAgIHdpZGdldDIucm91dGVJbnZhbGlkYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQwLnZhbGlkKS50by5iZS5mYWxzZTtcclxuICAgICAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLnZhbGlkKS50by5iZS50cnVlO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIudmFsaWQpLnRvLmJlLnRydWU7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgaW52YWxpZGF0ZSB0aGUgZmlyc3QgcGFyZW50IHdpdGggYSBmaXhlZCBzaXplIHBvbGljeScsICgpPT57XHJcbiAgICAgICAgICAgIHdpZGdldDIucm91dGVJbnZhbGlkYXRpb24oKTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDAudmFsaWQpLnRvLmJlLnRydWU7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLnZhbGlkKS50by5iZS5mYWxzZTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIudmFsaWQpLnRvLmJlLnRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3JlY3Vyc2l2ZVJvdXRlVXBkYXRlKCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgcm91dGUgdXBkYXRlIHRvIGl0c2VsZiBpZiBubyBwYXJlbnQgZXhpc3QnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgdXBkYXRlU3B5ID0gc2lub24uc3B5KHdpZGdldDAsICd1cGRhdGUnKTtcclxuICAgICAgICAgICAgd2lkZ2V0MC5yZWN1cnNpdmVSb3V0ZVVwZGF0ZSgpO1xyXG4gICAgICAgICAgICBleHBlY3QodXBkYXRlU3B5LmNhbGxlZCkudG8uYmUudHJ1ZTtcclxuICAgICAgICAgICAgd2lkZ2V0MC51cGRhdGUucmVzdG9yZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIHJlY3Vyc2l2bGV5IHJ1biB0aGlzIGZ1bmN0aW9uIGlmIHRoZSBwYXJlbnQgaXMgdmFsaWQnLCAoKT0+e1xyXG4gICAgICAgICAgICB3aWRnZXQxLmludmFsaWRhdGUoKTtcclxuICAgICAgICAgICAgbGV0IHNweSA9IHNpbm9uLnNweSh3aWRnZXQxLCAncmVjdXJzaXZlUm91dGVVcGRhdGUnKTtcclxuICAgICAgICAgICAgd2lkZ2V0Mi5yZWN1cnNpdmVSb3V0ZVVwZGF0ZSgpO1xyXG4gICAgICAgICAgICBleHBlY3Qoc3B5LmNhbGxlZCkudG8uYmUudHJ1ZTtcclxuICAgICAgICAgICAgd2lkZ2V0MS5yZWN1cnNpdmVSb3V0ZVVwZGF0ZS5yZXN0b3JlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgcm91dGUgdXBkYXRlIHRvIGl0c2VsZiBpZiBwYXJlbnQgaXMgdmFsaWQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgdXBkYXRlU3B5ID0gc2lub24uc3B5KHdpZGdldDAsICd1cGRhdGUnKTtcclxuICAgICAgICAgICAgd2lkZ2V0MC5yZWN1cnNpdmVSb3V0ZVVwZGF0ZSgpO1xyXG4gICAgICAgICAgICBleHBlY3QodXBkYXRlU3B5LmNhbGxlZCkudG8uYmUudHJ1ZTtcclxuICAgICAgICAgICAgd2lkZ2V0MC51cGRhdGUucmVzdG9yZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNyZW5kZXJDYW52YXMoKScsICgpPT57XHJcblxyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNyZW5kZXJXZWJHTCgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3NldFBhcmVudCgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2FkZENoaWxkJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCBlYWNoIFBJWEkuQ29udGFpbmVycyBtYXNrIHRvIG51bGwnLCAoKT0+e1xuICAgICAgICAgICAgICAgIGxldCBwYyA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xyXG4gICAgICAgICAgICAgICAgd2lkZ2V0Mi5hZGRDaGlsZChwYyk7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QocGMubWFzaykudG8uYmUubnVsbDtcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgYWRkIGl0cyB0aGVtZSB0byBlYWNoIEJhc2VXaWRnZXQgY2hpbGQgYWRkZWQnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0Mi50aGVtZSkudG8uZXF1YWwod2lkZ2V0MS50aGVtZSk7XHJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBzZXQgbWFzayB0byBudWxsIGlmIGNoaWxkIGhhcyB1cGRhdGVPbkhvc3RDaGFuZ2VzID0gZmFsc2UgJ1xuICAgICAgICAgICAgKyAnZm9yIGJvdGggc2l6ZSBwb2xpY2llcycsICgpPT57XG4gICAgICAgICAgICAgICAgLy8gc2hvdWxkIHNldCB0byBwYXJlbnRcbiAgICAgICAgICAgIHdpZGdldDEubGF5b3V0ID0gbmV3IFNULkxheW91dHMuVkJveExheW91dCh3aWRnZXQxKTtcbiAgICAgICAgICAgIHdpZGdldDIuaFBvbGljeVxuICAgICAgICAgICAgPSBuZXcgU1QuU2l6ZVBvbGljaWVzLkZpeGVkUG9saWN5KHdpZGdldDIpO1xuXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0Mi5zaXplUHJveHkubWFzaykudG8uZXF1YWwod2lkZ2V0MS5jbGlwR3JhcGhpYyk7XG5cbiAgICAgICAgICAgIHdpZGdldDIuaFBvbGljeVxuICAgICAgICAgICAgPSBuZXcgU1QuU2l6ZVBvbGljaWVzLkV4cGFuZGluZ1BvbGljeSh3aWRnZXQyLCBTVC5IT1JJWk9OVEFMKTtcbiAgICAgICAgICAgIHdpZGdldDIudlBvbGljeVxuICAgICAgICAgICAgPSBuZXcgU1QuU2l6ZVBvbGljaWVzLkV4cGFuZGluZ1BvbGljeSh3aWRnZXQyLCBTVC5WRVJUSUNBTCk7XG5cbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLnNpemVQcm94eS5tYXNrKS50by5iZS5udWxsO1xuICAgICAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbWFzayBjaGlsZHJlbiBpZiBpdHMgbGF5b3V0IGhhcyB1cGRhdGVPbkhvc3RDaGFuZ2VzID0gdHJ1ZScsXG4gICAgICAgICgpPT57XG4gICAgICAgICAgICB3aWRnZXQxLmxheW91dCA9IG5ldyBTVC5MYXlvdXRzLkZpeGVkTGF5b3V0KHdpZGdldDEpO1xuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIuc2l6ZVByb3h5Lm1hc2spLnRvLmVxdWFsKHdpZGdldDEuY2xpcEdyYXBoaWMpO1xuICAgICAgICB9KTtcblxyXG4gICAgICAgIC8vIGl0KCdzaG91bGQgYWRkIGl0cyBjbGlwR3JhcGhpYyB0byBlYWNoIEJhc2VXaWRnZXQgY2hpbGQgYWRkZWRzJ1xuICAgICAgICAvLyAgICAgKyAnIHNpemUgcHJveHknLCAoKT0+e1xuICAgICAgICAvLyAgICAgZXhwZWN0KHdpZGdldDIuc2l6ZVByb3h5Lm1hc2spLnRvLmVxdWFsKHdpZGdldDEuY2xpcEdyYXBoaWMpO1xuICAgICAgICAvLyB9KTtcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2FkZENoaWxkQXQoKScsICgpPT57XHJcbiAgICAgICAgLy8gc2FtZSBhcyAjYWRkQ2hpbGRcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjb25DaGlsZHJlbkNoYW5nZSgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2FwcGx5UG9zaXRpb24oKScsICgpPT57XHJcblxyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJ191cGRhdGVDbGlwR3JhcGhpYygpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCB0byBzaXplIG9mIHdpZGdldCAtIHBhZGRpbmcnLCAoKT0+e1xuICAgICAgICAgICAgd2lkZ2V0Mi52UG9saWN5XG4gICAgICAgICAgICA9IG5ldyBTVC5TaXplUG9saWNpZXMuRml4ZWRQb2xpY3kod2lkZ2V0Mik7XG4gICAgICAgICAgICB3aWRnZXQyLm1heC53aWR0aCA9IDEwMDA7XHJcbiAgICAgICAgICAgIHdpZGdldDIubWF4LmhlaWdodCA9IDEwMDA7XHJcbiAgICAgICAgICAgIHdpZGdldDIud2lkdGggPSA0MDA7XHJcbiAgICAgICAgICAgIHdpZGdldDIuaGVpZ2h0ID0gNDAwO1xyXG4gICAgICAgICAgICB3aWRnZXQxLnVwZGF0ZSgpOyAvLyBzaG91bGQgY2FsbCBfdXBkYXRlQ2xpcEdyYXBoaWMoKVxyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0Mi5jbGlwR3JhcGhpYy53aWR0aCkudG8uZXF1YWwoMzkyKTtcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLmNsaXBHcmFwaGljLmhlaWdodCkudG8uZXF1YWwoMzkyKTtcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBwb3MgdG8gdGhlIHRvcCBsZWZ0IHBhZGRpbmcgdmFsdWVzJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIuY2xpcEdyYXBoaWMueCkudG8uZXF1YWwoNCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLmNsaXBHcmFwaGljLnkpLnRvLmVxdWFsKDQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIHNldCByZW5kZXJhYmxlIHRvIGZhbHNlJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIuY2xpcEdyYXBoaWMucmVuZGVyYWJsZSkudG8uYmUuZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3RoZW1lJywgKCk9PntcclxuICAgICAgICBsZXQgYVRobSA9IG5ldyBTVC5UaGVtZSgpO1xyXG4gICAgICAgIGl0KCdzaG91bGQgYXBwbHkgdGhlIHNldCB0aGVtZSB0byBjaGlsZHJlbiByZWN1cnNpdmVseScsICgpPT57XHJcbiAgICAgICAgICAgIHdpZGdldDAudGhlbWUgPSBhVGhtO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS50aGVtZSkudG8uZXF1YWwod2lkZ2V0MC50aGVtZSk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLnRoZW1lKS50by5lcXVhbCh3aWRnZXQxLnRoZW1lKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjZGlzYWJsZWQnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgZGlzYWJsZSBpdHNlbGYgYW5kIGl0cyBjaGlsZHJlbiB3aGVuIHNldCB0byBmYWxzZScsICgpPT57XHJcbiAgICAgICAgICAgIHdpZGdldDAuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MC5kaXNhYmxlZCkudG8uYmUudHJ1ZTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEuZGlzYWJsZWQpLnRvLmJlLnRydWU7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLmRpc2FibGVkKS50by5iZS50cnVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIGVuYWJsZSBpdHNlbGYgYW5kIGl0cyBjaGlsZHJlbiB3aGVuIHNldCB0byB0cnVlJywgKCk9PntcclxuICAgICAgICAgICAgd2lkZ2V0MC5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MC5kaXNhYmxlZCkudG8uYmUuZmFsc2U7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLmRpc2FibGVkKS50by5iZS5mYWxzZTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIuZGlzYWJsZWQpLnRvLmJlLmZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnI19ldmFsdWF0ZU1hc2soKScsICgpPT57XG4gICAgICAgIGl0KCdzaG91bGQgbWFzayBhbGwgY2hpbGRyZW4gaWYgbGF5b3V0LnVwZGF0ZU9uSG9zdENoYW5nZXMgPSB0cnVlJyxcbiAgICAgICAgKCk9PntcbiAgICAgICAgICAgIHdpZGdldDAubGF5b3V0ID0gbmV3IFNULkxheW91dHMuRml4ZWRMYXlvdXQod2lkZ2V0MCk7XG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS5tYXNrKS50by5lcXVhbCh3aWRnZXQwLmNsaXBHcmFwaGljKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBtYXNrIGNoaWxkIGlmIGVpdGhlciBwb2xpY3kgaGFzIHVwZGF0ZU9uSG9zdENoYW5nZXMgdHJ1ZSdcbiAgICAgICAgKyAnIGFuZCB0aGUgcGFyZW50cyBsYXlvdXQgaGFzIHVwZGF0ZU9uSG9zdENoYW5nZXMgZmFsc2UnLCAoKT0+e1xuICAgICAgICAgICAgd2lkZ2V0MC5sYXlvdXQgPSBuZXcgU1QuTGF5b3V0cy5WQm94TGF5b3V0KHdpZGdldDAsIFNULlZFUlRJQ0FMKTtcbiAgICAgICAgICAgIHdpZGdldDEuaFBvbGljeSA9IG5ldyBTVC5TaXplUG9saWNpZXMuRml4ZWRQb2xpY3kod2lkZ2V0MSk7XG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS5tYXNrKS50by5lcXVhbCh3aWRnZXQwLmNsaXBHcmFwaGljKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBzZXQgbWFzayB0byBudWxsIGlmIGxheW91dCBoYXMgdXBkYXRlT25Ib3N0Q2hhbmdlcyBmYWxzZSAnXG4gICAgICAgICsgJ2FuZCBjaGlsZHMgcG9saWNpZXMgaGF2ZSB1cGRhdGVPbkhvc3RDaGFuZ2VzIGZhbHNlJywgKCk9PntcbiAgICAgICAgICAgIHdpZGdldDAubGF5b3V0ID0gbmV3IFNULkxheW91dHMuVkJveExheW91dCh3aWRnZXQwLCBTVC5WRVJUSUNBTCk7XG4gICAgICAgICAgICB3aWRnZXQxLmhQb2xpY3lcbiAgICAgICAgICAgID0gbmV3IFNULlNpemVQb2xpY2llcy5FeHBhbmRpbmdQb2xpY3kod2lkZ2V0MSwgU1QuSE9SSVpPTlRBTCk7XG4gICAgICAgICAgICB3aWRnZXQxLnZQb2xpY3lcbiAgICAgICAgICAgID0gbmV3IFNULlNpemVQb2xpY2llcy5FeHBhbmRpbmdQb2xpY3kod2lkZ2V0MSwgU1QuVkVSVElDQUwpO1xuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEubWFzaykudG8uYmUubnVsbDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBzZXQgbWFzayB0byBudWxsIGlmIGNoaWxkIGlzIG5vdCBhIHdpZGdldCcsICgpPT57XG4gICAgICAgICAgICBsZXQgcGMgPSBuZXcgUElYSS5Db250YWluZXIoKTtcbiAgICAgICAgICAgIHdpZGdldDAuYWRkQ2hpbGQocGMpO1xuICAgICAgICAgICAgd2lkZ2V0MC5fZXZhbHVhdGVNYXNrKCk7XG4gICAgICAgICAgICBleHBlY3QocGMubWFzaykudG8uYmUubnVsbDtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnI2dldEZvY3VzZWRXaWRnZXQnLCAoKT0+e1xuICAgICAgICBpdCgnc2hvdWxkIHJldHVybiB0aGUgd2lkZ2V0IGN1cnJlbnRseSBpbiBmb2N1cycsICgpPT57XG4gICAgICAgICAgICB3aWRnZXQxLmZvY3VzKCk7XG4gICAgICAgICAgICBleHBlY3QoU1QuV2lkZ2V0cy5CYXNlV2lkZ2V0LmdldEZvY3VzZWRXaWRnZXQoKSkudG8uZXF1YWwod2lkZ2V0MSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdCdXR0b24nLCAoKT0+e1xyXG5cclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdMYWJlbCcsICgpPT57XHJcbiAgICBsZXQgbGFiZWwgPSBuZXcgU1QuV2lkZ2V0cy5MYWJlbChudWxsLCB7dGV4dDogJ3Rlc3QnfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBzZXQgdGV4dCBmcm9tIG9wdGlvbiBpZiBzZXQnLCAoKT0+e1xyXG4gICAgICAgIGV4cGVjdChsYWJlbC50ZXh0KS50by5lcXVhbCgndGVzdCcpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNfdGV4dE9iaicsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBoYXZlIGEgbnVsbCBtYXNrJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KGxhYmVsLl90ZXh0T2JqLm1hc2spLnRvLmVxdWFsKG51bGwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNfY2xpcEdyYXBoaWMnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgYmUgdW5yZW5kZXJhYmxlJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KGxhYmVsLl9jbGlwR3JhcGhpYy5yZW5kZXJhYmxlKS50by5lcXVhbChmYWxzZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3RleHQnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgdXBkYXRlIF90ZXh0T2JqcyB0ZXh0JywgKCk9PntcclxuICAgICAgICAgICAgbGFiZWwudGV4dCA9ICd1cGRhdGUnO1xyXG4gICAgICAgICAgICBleHBlY3QobGFiZWwuX3RleHRPYmoudGV4dCkudG8uZXF1YWwoJ3VwZGF0ZScpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnUGFuZWwnLCAoKT0+e1xyXG4gICAgbGV0IHBhbmVsID0gbmV3IFNULldpZGdldHMuUGFuZWwoKTtcclxuXHJcbiAgICBkZXNjcmliZSgnI19ia2dPYmonLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgYmUgYSBzcHJpdGUnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3QocGFuZWwuX2JrZ09iaikudG8uYmUuYW4uaW5zdGFuY2VvZihQSVhJLlNwcml0ZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdTSVRyYW5zZm9ybScsICgpPT57XHJcbiAgICBpdCgnc2hvdWxkIGFsbG93IGEgd2lkZ2V0IHRvIHRyYW5zZm9ybSBpdHMgZGltZW5zaW9ucydcclxuICAgICAgICArICcgaW5kZXBlbmRlbnQgZnJvbSBpdHMgcGFyZW50JywgKCk9PntcclxuICAgICAgICAgICAgbGV0IHdpZGdldDAgPSBuZXcgU1QuV2lkZ2V0cy5QYW5lbCgpO1xyXG4gICAgICAgICAgICB3aWRnZXQwLndpZHRoID0gMTAwMDtcclxuICAgICAgICAgICAgbGV0IHdpZGdldDEgPSBuZXcgU1QuV2lkZ2V0cy5QYW5lbCgpO1xyXG4gICAgICAgICAgICB3aWRnZXQxLndpZHRoID0gMjAwO1xyXG4gICAgICAgICAgICB3aWRnZXQwLmFkZENoaWxkKHdpZGdldDEpO1xyXG4gICAgICAgICAgICB3aWRnZXQwLndpZHRoID0gNTAwO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS53aWR0aCkudG8uZXF1YWwoMjAwKTtcclxuICAgICAgICB9KTtcclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8vIFRPRE86IFdvdWxkIGxpa2UgdG8gZ2V0IG1vcmUgdGVzdCBoZXJlIGF0IHNvbWUgcG9pbnRcclxuXHJcbmRlc2NyaWJlKCdTbGlkZXInLCAoKT0+e1xyXG4gICAgbGV0IHNsID0gbmV3IFNULldpZGdldHMuU2xpZGVyKG51bGwsIHt3aWR0aDogMjAwLCBoZWlnaHQ6IDMwfSk7XHJcbiAgICBzbC51cGRhdGUoKTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3RyYWNrJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGJlIGFuIGltYWdlIHdpZGdldCcsICgpPT57XHJcbiAgICAgICAgICAgIGV4cGVjdChzbC50cmFjaykudG8uYmUuYW4uaW5zdGFuY2VvZihTVC5XaWRnZXRzLkltYWdlKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjdHJhY2tIaXRSZWN0JywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGJlIGEgcmVjdGFuZ2xlJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHNsLnRyYWNrSGl0UmVjdCkudG8uYmUuYW4uaW5zdGFuY2VvZihQSVhJLlJlY3RhbmdsZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2J1dHRvbicsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBiZSBhbiBpbWFnZSB3aWRnZXQnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3Qoc2wuYnV0dG9uKS50by5iZS5hbi5pbnN0YW5jZW9mKFNULldpZGdldHMuSW1hZ2UpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyN1cGRhdGVUcmFja0hpdFJlY3QoKScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBzZXQgdGhlIHNpemUgb2YgdGhlIGNsaWNrYWJsZSBhcmVhIG9mIHRoZSB0cmFjaycsICgpPT57XHJcbiAgICAgICAgICAgIGV4cGVjdChzbC50cmFja0hpdFJlY3QueCkudG8uZXF1YWwoMCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChzbC50cmFja0hpdFJlY3QueSkudG8uZXF1YWwoLTUpO1xyXG4gICAgICAgICAgICBleHBlY3Qoc2wudHJhY2tIaXRSZWN0LndpZHRoKS50by5lcXVhbCgyMDApO1xyXG4gICAgICAgICAgICBleHBlY3Qoc2wudHJhY2tIaXRSZWN0LmhlaWdodCkudG8uZXF1YWwoc2wudHJhY2suaGVpZ2h0ICsgMTApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyN2YWx1ZScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBzZXQgdGhlIGJ1dHRvbnMgcG9zIHdoZW4gc2V0JywgKCk9PntcclxuICAgICAgICAgICAgc2wudmFsdWUgPSAwLjU7XHJcbiAgICAgICAgICAgIGNvbnN0IGFjdHVhbCA9IDkwO1xyXG4gICAgICAgICAgICBleHBlY3Qoc2wuYnV0dG9uLngpLnRvLmVxdWFsKGFjdHVhbCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIHRoZSB2YWx1ZSBmcm9tIHRoZSBwb3NpdGlvbicsICgpPT57XHJcbiAgICAgICAgICAgIGNvbnN0IGFjdHVhbCA9IDAuNTtcclxuICAgICAgICAgICAgZXhwZWN0KHNsLnZhbHVlKS50by5lcXVhbChhY3R1YWwpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNvcmllbnRhdGlvbicsICgpPT57XHJcbiAgICAgICAgc2wub3JpZW50YXRpb24gPSBTVC5IT1JJWk9OVEFMO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIHNldCB0aGUgbWluIGFuZCBtYXggaGVpZ2h0cyB3aGVuIHNldCcsICgpPT57XHJcbiAgICAgICAgICAgIGV4cGVjdChzbC5taW4uaGVpZ2h0KS50by5lcXVhbChzbC5idXR0b24uaGVpZ2h0KTtcclxuICAgICAgICAgICAgZXhwZWN0KHNsLm1pbi53aWR0aCkudG8uZXF1YWwoc2wuYnV0dG9uLndpZHRoKjIpO1xyXG4gICAgICAgICAgICBleHBlY3Qoc2wubWF4LmhlaWdodCkudG8uZXF1YWwoc2wuYnV0dG9uLmhlaWdodCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChzbC5tYXgud2lkdGgpLnRvLmVxdWFsKDEwMDAwKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCBzZXQgdGhlIHRyYWNrIHNpemUnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3Qoc2wudHJhY2sud2lkdGgpLnRvLmVxdWFsKHNsLndpZHRoKTtcclxuICAgICAgICAgICAgZXhwZWN0KHNsLnRyYWNrLmhlaWdodCkudG8uZXF1YWwoNSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgc2V0IGFsaWdubWVudHMnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3Qoc2wubGF5b3V0LmFsaWdubWVudC5oQWxpZ24pLnRvLmVxdWFsKFNULkFsaWdubWVudC5sZWZ0KTtcclxuICAgICAgICAgICAgZXhwZWN0KHNsLmxheW91dC5hbGlnbm1lbnQudkFsaWduKS50by5lcXVhbChTVC5BbGlnbm1lbnQubWlkZGxlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCBzZXQgdGhlIHRyYWNrcyBzaXplIHBvbGljaWVzJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHNsLnRyYWNrLmhQb2xpY3kpLnRvLmJlLmFuXHJcbiAgICAgICAgICAgICAgICAuaW5zdGFuY2VvZihTVC5TaXplUG9saWNpZXMuRXhwYW5kaW5nUG9saWN5KTtcclxuXHJcbiAgICAgICAgICAgIGV4cGVjdChzbC50cmFjay52UG9saWN5KS50by5iZS5hblxyXG4gICAgICAgICAgICAgICAgLmluc3RhbmNlb2YoU1QuU2l6ZVBvbGljaWVzLkZpeGVkUG9saWN5KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ1N0YWdlV2lkZ2V0JywgKCk9PntcclxuICAgIGl0KCdTaG91bGQgaGF2ZSBhIGJvdW5kcyBhcyBiaWcgYXMgdGhlIHVzZXIgZGVmaW5lZCBzaXplJywgKCk9PntcclxuICAgICAgICBsZXQgc3cgPSBuZXcgU1QuV2lkZ2V0cy5TdGFnZVdpZGdldChudWxsLCB7d2lkdGg6IDYwMCwgaGVpZ2h0OiA4MDB9KTtcclxuICAgICAgICBsZXQgYjEgPSBuZXcgU1QuV2lkZ2V0cy5CdXR0b24oc3csIHt3aWR0aDogOTAwLCBoZWlnaHQ6IDkwMH0pOyAvL2VzbGludC1kaXNhYmxlLWxpbmVcclxuICAgICAgICBsZXQgYjIgPSBuZXcgU1QuV2lkZ2V0cy5QYW5lbChzdywge3dpZHRoOiAxMDAsIGhlaWdodDogMTAwLCB4OiA3MDB9KTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxyXG4gICAgICAgIGxldCBib3VuZHMgPSBzdy5nZXRCb3VuZHMoKTtcclxuXHJcbiAgICAgICAgZXhwZWN0KGJvdW5kcy53aWR0aCkudG8uZXF1YWwoNjAwKTtcclxuICAgICAgICBleHBlY3QoYm91bmRzLmhlaWdodCkudG8uZXF1YWwoODAwKTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ1RleHRCdXR0b24nLCAoKT0+e1xyXG4gICAgZGVzY3JpYmUoJyNUZXh0JywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCB0aGUgdGV4dCBmb3IgdGhlIGNvbnRhaW5lZCBsYWJlbCcsICgpPT57XHJcbiAgICAgICAgICAgIGxldCB0YiA9IG5ldyBTVC5XaWRnZXRzLlRleHRCdXR0b24oKTtcclxuICAgICAgICAgICAgdGIudGV4dCA9ICdtZW93JztcclxuICAgICAgICAgICAgZXhwZWN0KHRiLmxhYmVsLnRleHQpLnRvLmVxdWFsKCdtZW93Jyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsInJlcXVpcmUoJy4vQmFzZVdpZGdldC1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vQnV0dG9uLXNwZWMnKTtcclxucmVxdWlyZSgnLi9MYWJlbC1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vUGFuZWwtc3BlYycpO1xyXG5yZXF1aXJlKCcuL1NJVHJhbnNmb3JtLXNwZWMnKTtcclxucmVxdWlyZSgnLi9TdGFnZVdpZGdldC1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vVGV4dEJ1dHRvbi1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vU2xpZGVyLXNwZWMnKTtcclxuIl19
