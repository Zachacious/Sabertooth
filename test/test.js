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

},{"./spec":12,"_process":4,"buffer":2}],6:[function(require,module,exports){
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

},{"_process":4,"buffer":2}],11:[function(require,module,exports){
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

},{"_process":4,"buffer":2}],12:[function(require,module,exports){
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

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\index.js","/test\\spec")

},{"./App-spec":6,"./GraphicsGen-spec":7,"./Padding-spec":8,"./Point-spec":9,"./Size-spec":10,"./Theme-spec":11,"./layoutSys":14,"./widgets":34,"_process":4,"buffer":2}],13:[function(require,module,exports){
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

},{"_process":4,"buffer":2}],14:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

require('./Alignment-spec');
require('./sizePolicies');
require('./layouts');

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\layoutSys\\index.js","/test\\spec\\layoutSys")

},{"./Alignment-spec":13,"./layouts":20,"./sizePolicies":25,"_process":4,"buffer":2}],15:[function(require,module,exports){
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

},{"_process":4,"buffer":2}],16:[function(require,module,exports){
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

},{"_process":4,"buffer":2}],17:[function(require,module,exports){
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

},{"_process":4,"buffer":2}],18:[function(require,module,exports){
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

},{"_process":4,"buffer":2}],19:[function(require,module,exports){
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

},{"_process":4,"buffer":2}],20:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

require('./BaseLayout-spec');
require('./BoxLayout-spec');
require('./FixedLayout-spec');
require('./HBoxLayout-spec');
require('./VBoxLayout-spec');

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\layoutSys\\layouts\\index.js","/test\\spec\\layoutSys\\layouts")

},{"./BaseLayout-spec":15,"./BoxLayout-spec":16,"./FixedLayout-spec":17,"./HBoxLayout-spec":18,"./VBoxLayout-spec":19,"_process":4,"buffer":2}],21:[function(require,module,exports){
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

},{"_process":4,"buffer":2}],22:[function(require,module,exports){
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

},{"_process":4,"buffer":2}],23:[function(require,module,exports){
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

},{"_process":4,"buffer":2}],24:[function(require,module,exports){
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

},{"_process":4,"buffer":2}],25:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

require('./BasePolicy-spec');
require('./ExpandingPolicy-spec');
require('./FixedPolicy-spec');
require('./SharedExpandingPolicy-spec');

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\layoutSys\\sizePolicies\\index.js","/test\\spec\\layoutSys\\sizePolicies")

},{"./BasePolicy-spec":21,"./ExpandingPolicy-spec":22,"./FixedPolicy-spec":23,"./SharedExpandingPolicy-spec":24,"_process":4,"buffer":2}],26:[function(require,module,exports){
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

},{"_process":4,"buffer":2}],27:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
'use strict';

describe('Button', function () {});

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/test\\spec\\widgets\\Button-spec.js","/test\\spec\\widgets")

},{"_process":4,"buffer":2}],28:[function(require,module,exports){
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

},{"_process":4,"buffer":2}],29:[function(require,module,exports){
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

},{"_process":4,"buffer":2}],30:[function(require,module,exports){
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

},{"_process":4,"buffer":2}],31:[function(require,module,exports){
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

},{"_process":4,"buffer":2}],32:[function(require,module,exports){
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

},{"_process":4,"buffer":2}],33:[function(require,module,exports){
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

},{"_process":4,"buffer":2}],34:[function(require,module,exports){
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

},{"./BaseWidget-spec":26,"./Button-spec":27,"./Label-spec":28,"./Panel-spec":29,"./SITransform-spec":30,"./Slider-spec":31,"./StageWidget-spec":32,"./TextButton-spec":33,"_process":4,"buffer":2}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYmFzZTY0LWpzL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2J1ZmZlci9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9pZWVlNzU0L2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsInRlc3RcXHRlc3RcXGluZGV4LmpzIiwidGVzdFxcc3BlY1xcdGVzdFxcc3BlY1xcQXBwLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx0ZXN0XFxzcGVjXFxHcmFwaGljc0dlbi1zcGVjLmpzIiwidGVzdFxcc3BlY1xcdGVzdFxcc3BlY1xcUGFkZGluZy1zcGVjLmpzIiwidGVzdFxcc3BlY1xcdGVzdFxcc3BlY1xcUG9pbnQtc3BlYy5qcyIsInRlc3RcXHNwZWNcXHRlc3RcXHNwZWNcXFNpemUtc3BlYy5qcyIsInRlc3RcXHNwZWNcXHRlc3RcXHNwZWNcXFRoZW1lLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx0ZXN0XFxzcGVjXFxpbmRleC5qcyIsInRlc3RcXHNwZWNcXGxheW91dFN5c1xcdGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxBbGlnbm1lbnQtc3BlYy5qcyIsInRlc3RcXHNwZWNcXGxheW91dFN5c1xcdGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxpbmRleC5qcyIsInRlc3RcXHNwZWNcXGxheW91dFN5c1xcbGF5b3V0c1xcdGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxsYXlvdXRzXFxCYXNlTGF5b3V0LXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXGxheW91dHNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcbGF5b3V0c1xcQm94TGF5b3V0LXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXGxheW91dHNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcbGF5b3V0c1xcRml4ZWRMYXlvdXQtc3BlYy5qcyIsInRlc3RcXHNwZWNcXGxheW91dFN5c1xcbGF5b3V0c1xcdGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxsYXlvdXRzXFxIQm94TGF5b3V0LXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXGxheW91dHNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcbGF5b3V0c1xcVkJveExheW91dC1zcGVjLmpzIiwidGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxsYXlvdXRzXFx0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXGxheW91dHNcXGluZGV4LmpzIiwidGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxzaXplUG9saWNpZXNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcc2l6ZVBvbGljaWVzXFxCYXNlUG9saWN5LXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXHNpemVQb2xpY2llc1xcdGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxzaXplUG9saWNpZXNcXEV4cGFuZGluZ1BvbGljeS1zcGVjLmpzIiwidGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxzaXplUG9saWNpZXNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcc2l6ZVBvbGljaWVzXFxGaXhlZFBvbGljeS1zcGVjLmpzIiwidGVzdFxcc3BlY1xcbGF5b3V0U3lzXFxzaXplUG9saWNpZXNcXHRlc3RcXHNwZWNcXGxheW91dFN5c1xcc2l6ZVBvbGljaWVzXFxTaGFyZWRFeHBhbmRpbmdQb2xpY3ktc3BlYy5qcyIsInRlc3RcXHNwZWNcXGxheW91dFN5c1xcc2l6ZVBvbGljaWVzXFx0ZXN0XFxzcGVjXFxsYXlvdXRTeXNcXHNpemVQb2xpY2llc1xcaW5kZXguanMiLCJ0ZXN0XFxzcGVjXFx3aWRnZXRzXFx0ZXN0XFxzcGVjXFx3aWRnZXRzXFxCYXNlV2lkZ2V0LXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx3aWRnZXRzXFx0ZXN0XFxzcGVjXFx3aWRnZXRzXFxCdXR0b24tc3BlYy5qcyIsInRlc3RcXHNwZWNcXHdpZGdldHNcXHRlc3RcXHNwZWNcXHdpZGdldHNcXExhYmVsLXNwZWMuanMiLCJ0ZXN0XFxzcGVjXFx3aWRnZXRzXFx0ZXN0XFxzcGVjXFx3aWRnZXRzXFxQYW5lbC1zcGVjLmpzIiwidGVzdFxcc3BlY1xcd2lkZ2V0c1xcdGVzdFxcc3BlY1xcd2lkZ2V0c1xcU0lUcmFuc2Zvcm0tc3BlYy5qcyIsInRlc3RcXHNwZWNcXHdpZGdldHNcXHRlc3RcXHNwZWNcXHdpZGdldHNcXFNsaWRlci1zcGVjLmpzIiwidGVzdFxcc3BlY1xcd2lkZ2V0c1xcdGVzdFxcc3BlY1xcd2lkZ2V0c1xcU3RhZ2VXaWRnZXQtc3BlYy5qcyIsInRlc3RcXHNwZWNcXHdpZGdldHNcXHRlc3RcXHNwZWNcXHdpZGdldHNcXFRleHRCdXR0b24tc3BlYy5qcyIsInRlc3RcXHNwZWNcXHdpZGdldHNcXHRlc3RcXHNwZWNcXHdpZGdldHNcXGluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7O0FDMXFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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WUFBSTtBQUNsRCxnQkFBSSxLQUFLLElBQUksR0FBRyxPQUFILENBQVcsVUFBZixFQUFUO0FBQ0EsZUFBRyxJQUFILEdBQVUsTUFBVjtBQUNBLG1CQUFPLEdBQUcsS0FBSCxDQUFTLElBQWhCLEVBQXNCLEVBQXRCLENBQXlCLEtBQXpCLENBQStCLE1BQS9CO0FBQ0gsU0FKRDtBQUtILEtBTkQ7QUFPSCxDQVJEOzs7Ozs7OztBQ0ZBLFFBQVEsbUJBQVI7QUFDQSxRQUFRLGVBQVI7QUFDQSxRQUFRLGNBQVI7QUFDQSxRQUFRLGNBQVI7QUFDQSxRQUFRLG9CQUFSO0FBQ0EsUUFBUSxvQkFBUjtBQUNBLFFBQVEsbUJBQVI7QUFDQSxRQUFRLGVBQVIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnXG5cbmV4cG9ydHMuYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGhcbmV4cG9ydHMudG9CeXRlQXJyYXkgPSB0b0J5dGVBcnJheVxuZXhwb3J0cy5mcm9tQnl0ZUFycmF5ID0gZnJvbUJ5dGVBcnJheVxuXG52YXIgbG9va3VwID0gW11cbnZhciByZXZMb29rdXAgPSBbXVxudmFyIEFyciA9IHR5cGVvZiBVaW50OEFycmF5ICE9PSAndW5kZWZpbmVkJyA/IFVpbnQ4QXJyYXkgOiBBcnJheVxuXG52YXIgY29kZSA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJ1xuZm9yICh2YXIgaSA9IDAsIGxlbiA9IGNvZGUubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgbG9va3VwW2ldID0gY29kZVtpXVxuICByZXZMb29rdXBbY29kZS5jaGFyQ29kZUF0KGkpXSA9IGlcbn1cblxucmV2TG9va3VwWyctJy5jaGFyQ29kZUF0KDApXSA9IDYyXG5yZXZMb29rdXBbJ18nLmNoYXJDb2RlQXQoMCldID0gNjNcblxuZnVuY3Rpb24gcGxhY2VIb2xkZXJzQ291bnQgKGI2NCkge1xuICB2YXIgbGVuID0gYjY0Lmxlbmd0aFxuICBpZiAobGVuICUgNCA+IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuICB9XG5cbiAgLy8gdGhlIG51bWJlciBvZiBlcXVhbCBzaWducyAocGxhY2UgaG9sZGVycylcbiAgLy8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuICAvLyByZXByZXNlbnQgb25lIGJ5dGVcbiAgLy8gaWYgdGhlcmUgaXMgb25seSBvbmUsIHRoZW4gdGhlIHRocmVlIGNoYXJhY3RlcnMgYmVmb3JlIGl0IHJlcHJlc2VudCAyIGJ5dGVzXG4gIC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2VcbiAgcmV0dXJuIGI2NFtsZW4gLSAyXSA9PT0gJz0nID8gMiA6IGI2NFtsZW4gLSAxXSA9PT0gJz0nID8gMSA6IDBcbn1cblxuZnVuY3Rpb24gYnl0ZUxlbmd0aCAoYjY0KSB7XG4gIC8vIGJhc2U2NCBpcyA0LzMgKyB1cCB0byB0d28gY2hhcmFjdGVycyBvZiB0aGUgb3JpZ2luYWwgZGF0YVxuICByZXR1cm4gYjY0Lmxlbmd0aCAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzQ291bnQoYjY0KVxufVxuXG5mdW5jdGlvbiB0b0J5dGVBcnJheSAoYjY0KSB7XG4gIHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG4gIHZhciBsZW4gPSBiNjQubGVuZ3RoXG4gIHBsYWNlSG9sZGVycyA9IHBsYWNlSG9sZGVyc0NvdW50KGI2NClcblxuICBhcnIgPSBuZXcgQXJyKGxlbiAqIDMgLyA0IC0gcGxhY2VIb2xkZXJzKVxuXG4gIC8vIGlmIHRoZXJlIGFyZSBwbGFjZWhvbGRlcnMsIG9ubHkgZ2V0IHVwIHRvIHRoZSBsYXN0IGNvbXBsZXRlIDQgY2hhcnNcbiAgbCA9IHBsYWNlSG9sZGVycyA+IDAgPyBsZW4gLSA0IDogbGVuXG5cbiAgdmFyIEwgPSAwXG5cbiAgZm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuICAgIHRtcCA9IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDE4KSB8IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDEpXSA8PCAxMikgfCAocmV2TG9va3VwW2I2NC5jaGFyQ29kZUF0KGkgKyAyKV0gPDwgNikgfCByZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSArIDMpXVxuICAgIGFycltMKytdID0gKHRtcCA+PiAxNikgJiAweEZGXG4gICAgYXJyW0wrK10gPSAodG1wID4+IDgpICYgMHhGRlxuICAgIGFycltMKytdID0gdG1wICYgMHhGRlxuICB9XG5cbiAgaWYgKHBsYWNlSG9sZGVycyA9PT0gMikge1xuICAgIHRtcCA9IChyZXZMb29rdXBbYjY0LmNoYXJDb2RlQXQoaSldIDw8IDIpIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldID4+IDQpXG4gICAgYXJyW0wrK10gPSB0bXAgJiAweEZGXG4gIH0gZWxzZSBpZiAocGxhY2VIb2xkZXJzID09PSAxKSB7XG4gICAgdG1wID0gKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpKV0gPDwgMTApIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMSldIDw8IDQpIHwgKHJldkxvb2t1cFtiNjQuY2hhckNvZGVBdChpICsgMildID4+IDIpXG4gICAgYXJyW0wrK10gPSAodG1wID4+IDgpICYgMHhGRlxuICAgIGFycltMKytdID0gdG1wICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIGFyclxufVxuXG5mdW5jdGlvbiB0cmlwbGV0VG9CYXNlNjQgKG51bSkge1xuICByZXR1cm4gbG9va3VwW251bSA+PiAxOCAmIDB4M0ZdICsgbG9va3VwW251bSA+PiAxMiAmIDB4M0ZdICsgbG9va3VwW251bSA+PiA2ICYgMHgzRl0gKyBsb29rdXBbbnVtICYgMHgzRl1cbn1cblxuZnVuY3Rpb24gZW5jb2RlQ2h1bmsgKHVpbnQ4LCBzdGFydCwgZW5kKSB7XG4gIHZhciB0bXBcbiAgdmFyIG91dHB1dCA9IFtdXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSArPSAzKSB7XG4gICAgdG1wID0gKHVpbnQ4W2ldIDw8IDE2KSArICh1aW50OFtpICsgMV0gPDwgOCkgKyAodWludDhbaSArIDJdKVxuICAgIG91dHB1dC5wdXNoKHRyaXBsZXRUb0Jhc2U2NCh0bXApKVxuICB9XG4gIHJldHVybiBvdXRwdXQuam9pbignJylcbn1cblxuZnVuY3Rpb24gZnJvbUJ5dGVBcnJheSAodWludDgpIHtcbiAgdmFyIHRtcFxuICB2YXIgbGVuID0gdWludDgubGVuZ3RoXG4gIHZhciBleHRyYUJ5dGVzID0gbGVuICUgMyAvLyBpZiB3ZSBoYXZlIDEgYnl0ZSBsZWZ0LCBwYWQgMiBieXRlc1xuICB2YXIgb3V0cHV0ID0gJydcbiAgdmFyIHBhcnRzID0gW11cbiAgdmFyIG1heENodW5rTGVuZ3RoID0gMTYzODMgLy8gbXVzdCBiZSBtdWx0aXBsZSBvZiAzXG5cbiAgLy8gZ28gdGhyb3VnaCB0aGUgYXJyYXkgZXZlcnkgdGhyZWUgYnl0ZXMsIHdlJ2xsIGRlYWwgd2l0aCB0cmFpbGluZyBzdHVmZiBsYXRlclxuICBmb3IgKHZhciBpID0gMCwgbGVuMiA9IGxlbiAtIGV4dHJhQnl0ZXM7IGkgPCBsZW4yOyBpICs9IG1heENodW5rTGVuZ3RoKSB7XG4gICAgcGFydHMucHVzaChlbmNvZGVDaHVuayh1aW50OCwgaSwgKGkgKyBtYXhDaHVua0xlbmd0aCkgPiBsZW4yID8gbGVuMiA6IChpICsgbWF4Q2h1bmtMZW5ndGgpKSlcbiAgfVxuXG4gIC8vIHBhZCB0aGUgZW5kIHdpdGggemVyb3MsIGJ1dCBtYWtlIHN1cmUgdG8gbm90IGZvcmdldCB0aGUgZXh0cmEgYnl0ZXNcbiAgaWYgKGV4dHJhQnl0ZXMgPT09IDEpIHtcbiAgICB0bXAgPSB1aW50OFtsZW4gLSAxXVxuICAgIG91dHB1dCArPSBsb29rdXBbdG1wID4+IDJdXG4gICAgb3V0cHV0ICs9IGxvb2t1cFsodG1wIDw8IDQpICYgMHgzRl1cbiAgICBvdXRwdXQgKz0gJz09J1xuICB9IGVsc2UgaWYgKGV4dHJhQnl0ZXMgPT09IDIpIHtcbiAgICB0bXAgPSAodWludDhbbGVuIC0gMl0gPDwgOCkgKyAodWludDhbbGVuIC0gMV0pXG4gICAgb3V0cHV0ICs9IGxvb2t1cFt0bXAgPj4gMTBdXG4gICAgb3V0cHV0ICs9IGxvb2t1cFsodG1wID4+IDQpICYgMHgzRl1cbiAgICBvdXRwdXQgKz0gbG9va3VwWyh0bXAgPDwgMikgJiAweDNGXVxuICAgIG91dHB1dCArPSAnPSdcbiAgfVxuXG4gIHBhcnRzLnB1c2gob3V0cHV0KVxuXG4gIHJldHVybiBwYXJ0cy5qb2luKCcnKVxufVxuIiwiLyohXG4gKiBUaGUgYnVmZmVyIG1vZHVsZSBmcm9tIG5vZGUuanMsIGZvciB0aGUgYnJvd3Nlci5cbiAqXG4gKiBAYXV0aG9yICAgRmVyb3NzIEFib3VraGFkaWplaCA8ZmVyb3NzQGZlcm9zcy5vcmc+IDxodHRwOi8vZmVyb3NzLm9yZz5cbiAqIEBsaWNlbnNlICBNSVRcbiAqL1xuLyogZXNsaW50LWRpc2FibGUgbm8tcHJvdG8gKi9cblxuJ3VzZSBzdHJpY3QnXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IFNsb3dCdWZmZXJcbmV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVMgPSA1MFxuXG52YXIgS19NQVhfTEVOR1RIID0gMHg3ZmZmZmZmZlxuZXhwb3J0cy5rTWF4TGVuZ3RoID0gS19NQVhfTEVOR1RIXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUYDpcbiAqICAgPT09IHRydWUgICAgVXNlIFVpbnQ4QXJyYXkgaW1wbGVtZW50YXRpb24gKGZhc3Rlc3QpXG4gKiAgID09PSBmYWxzZSAgIFByaW50IHdhcm5pbmcgYW5kIHJlY29tbWVuZCB1c2luZyBgYnVmZmVyYCB2NC54IHdoaWNoIGhhcyBhbiBPYmplY3RcbiAqICAgICAgICAgICAgICAgaW1wbGVtZW50YXRpb24gKG1vc3QgY29tcGF0aWJsZSwgZXZlbiBJRTYpXG4gKlxuICogQnJvd3NlcnMgdGhhdCBzdXBwb3J0IHR5cGVkIGFycmF5cyBhcmUgSUUgMTArLCBGaXJlZm94IDQrLCBDaHJvbWUgNyssIFNhZmFyaSA1LjErLFxuICogT3BlcmEgMTEuNissIGlPUyA0LjIrLlxuICpcbiAqIFdlIHJlcG9ydCB0aGF0IHRoZSBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgdHlwZWQgYXJyYXlzIGlmIHRoZSBhcmUgbm90IHN1YmNsYXNzYWJsZVxuICogdXNpbmcgX19wcm90b19fLiBGaXJlZm94IDQtMjkgbGFja3Mgc3VwcG9ydCBmb3IgYWRkaW5nIG5ldyBwcm9wZXJ0aWVzIHRvIGBVaW50OEFycmF5YFxuICogKFNlZTogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4KS4gSUUgMTAgbGFja3Mgc3VwcG9ydFxuICogZm9yIF9fcHJvdG9fXyBhbmQgaGFzIGEgYnVnZ3kgdHlwZWQgYXJyYXkgaW1wbGVtZW50YXRpb24uXG4gKi9cbkJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUID0gdHlwZWRBcnJheVN1cHBvcnQoKVxuXG5pZiAoIUJ1ZmZlci5UWVBFRF9BUlJBWV9TVVBQT1JUICYmIHR5cGVvZiBjb25zb2xlICE9PSAndW5kZWZpbmVkJyAmJlxuICAgIHR5cGVvZiBjb25zb2xlLmVycm9yID09PSAnZnVuY3Rpb24nKSB7XG4gIGNvbnNvbGUuZXJyb3IoXG4gICAgJ1RoaXMgYnJvd3NlciBsYWNrcyB0eXBlZCBhcnJheSAoVWludDhBcnJheSkgc3VwcG9ydCB3aGljaCBpcyByZXF1aXJlZCBieSAnICtcbiAgICAnYGJ1ZmZlcmAgdjUueC4gVXNlIGBidWZmZXJgIHY0LnggaWYgeW91IHJlcXVpcmUgb2xkIGJyb3dzZXIgc3VwcG9ydC4nXG4gIClcbn1cblxuZnVuY3Rpb24gdHlwZWRBcnJheVN1cHBvcnQgKCkge1xuICAvLyBDYW4gdHlwZWQgYXJyYXkgaW5zdGFuY2VzIGNhbiBiZSBhdWdtZW50ZWQ/XG4gIHRyeSB7XG4gICAgdmFyIGFyciA9IG5ldyBVaW50OEFycmF5KDEpXG4gICAgYXJyLl9fcHJvdG9fXyA9IHtfX3Byb3RvX186IFVpbnQ4QXJyYXkucHJvdG90eXBlLCBmb286IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH19XG4gICAgcmV0dXJuIGFyci5mb28oKSA9PT0gNDJcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUJ1ZmZlciAobGVuZ3RoKSB7XG4gIGlmIChsZW5ndGggPiBLX01BWF9MRU5HVEgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignSW52YWxpZCB0eXBlZCBhcnJheSBsZW5ndGgnKVxuICB9XG4gIC8vIFJldHVybiBhbiBhdWdtZW50ZWQgYFVpbnQ4QXJyYXlgIGluc3RhbmNlXG4gIHZhciBidWYgPSBuZXcgVWludDhBcnJheShsZW5ndGgpXG4gIGJ1Zi5fX3Byb3RvX18gPSBCdWZmZXIucHJvdG90eXBlXG4gIHJldHVybiBidWZcbn1cblxuLyoqXG4gKiBUaGUgQnVmZmVyIGNvbnN0cnVjdG9yIHJldHVybnMgaW5zdGFuY2VzIG9mIGBVaW50OEFycmF5YCB0aGF0IGhhdmUgdGhlaXJcbiAqIHByb3RvdHlwZSBjaGFuZ2VkIHRvIGBCdWZmZXIucHJvdG90eXBlYC4gRnVydGhlcm1vcmUsIGBCdWZmZXJgIGlzIGEgc3ViY2xhc3Mgb2ZcbiAqIGBVaW50OEFycmF5YCwgc28gdGhlIHJldHVybmVkIGluc3RhbmNlcyB3aWxsIGhhdmUgYWxsIHRoZSBub2RlIGBCdWZmZXJgIG1ldGhvZHNcbiAqIGFuZCB0aGUgYFVpbnQ4QXJyYXlgIG1ldGhvZHMuIFNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0XG4gKiByZXR1cm5zIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIFRoZSBgVWludDhBcnJheWAgcHJvdG90eXBlIHJlbWFpbnMgdW5tb2RpZmllZC5cbiAqL1xuXG5mdW5jdGlvbiBCdWZmZXIgKGFyZywgZW5jb2RpbmdPck9mZnNldCwgbGVuZ3RoKSB7XG4gIC8vIENvbW1vbiBjYXNlLlxuICBpZiAodHlwZW9mIGFyZyA9PT0gJ251bWJlcicpIHtcbiAgICBpZiAodHlwZW9mIGVuY29kaW5nT3JPZmZzZXQgPT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICdJZiBlbmNvZGluZyBpcyBzcGVjaWZpZWQgdGhlbiB0aGUgZmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZydcbiAgICAgIClcbiAgICB9XG4gICAgcmV0dXJuIGFsbG9jVW5zYWZlKGFyZylcbiAgfVxuICByZXR1cm4gZnJvbShhcmcsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbn1cblxuLy8gRml4IHN1YmFycmF5KCkgaW4gRVMyMDE2LiBTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9mZXJvc3MvYnVmZmVyL3B1bGwvOTdcbmlmICh0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wuc3BlY2llcyAmJlxuICAgIEJ1ZmZlcltTeW1ib2wuc3BlY2llc10gPT09IEJ1ZmZlcikge1xuICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQnVmZmVyLCBTeW1ib2wuc3BlY2llcywge1xuICAgIHZhbHVlOiBudWxsLFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiBmYWxzZSxcbiAgICB3cml0YWJsZTogZmFsc2VcbiAgfSlcbn1cblxuQnVmZmVyLnBvb2xTaXplID0gODE5MiAvLyBub3QgdXNlZCBieSB0aGlzIGltcGxlbWVudGF0aW9uXG5cbmZ1bmN0aW9uIGZyb20gKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcInZhbHVlXCIgYXJndW1lbnQgbXVzdCBub3QgYmUgYSBudW1iZXInKVxuICB9XG5cbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIpIHtcbiAgICByZXR1cm4gZnJvbUFycmF5QnVmZmVyKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiBmcm9tU3RyaW5nKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0KVxuICB9XG5cbiAgcmV0dXJuIGZyb21PYmplY3QodmFsdWUpXG59XG5cbi8qKlxuICogRnVuY3Rpb25hbGx5IGVxdWl2YWxlbnQgdG8gQnVmZmVyKGFyZywgZW5jb2RpbmcpIGJ1dCB0aHJvd3MgYSBUeXBlRXJyb3JcbiAqIGlmIHZhbHVlIGlzIGEgbnVtYmVyLlxuICogQnVmZmVyLmZyb20oc3RyWywgZW5jb2RpbmddKVxuICogQnVmZmVyLmZyb20oYXJyYXkpXG4gKiBCdWZmZXIuZnJvbShidWZmZXIpXG4gKiBCdWZmZXIuZnJvbShhcnJheUJ1ZmZlclssIGJ5dGVPZmZzZXRbLCBsZW5ndGhdXSlcbiAqKi9cbkJ1ZmZlci5mcm9tID0gZnVuY3Rpb24gKHZhbHVlLCBlbmNvZGluZ09yT2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGZyb20odmFsdWUsIGVuY29kaW5nT3JPZmZzZXQsIGxlbmd0aClcbn1cblxuLy8gTm90ZTogQ2hhbmdlIHByb3RvdHlwZSAqYWZ0ZXIqIEJ1ZmZlci5mcm9tIGlzIGRlZmluZWQgdG8gd29ya2Fyb3VuZCBDaHJvbWUgYnVnOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvcHVsbC8xNDhcbkJ1ZmZlci5wcm90b3R5cGUuX19wcm90b19fID0gVWludDhBcnJheS5wcm90b3R5cGVcbkJ1ZmZlci5fX3Byb3RvX18gPSBVaW50OEFycmF5XG5cbmZ1bmN0aW9uIGFzc2VydFNpemUgKHNpemUpIHtcbiAgaWYgKHR5cGVvZiBzaXplICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wic2l6ZVwiIGFyZ3VtZW50IG11c3QgYmUgYSBudW1iZXInKVxuICB9IGVsc2UgaWYgKHNpemUgPCAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1wic2l6ZVwiIGFyZ3VtZW50IG11c3Qgbm90IGJlIG5lZ2F0aXZlJylcbiAgfVxufVxuXG5mdW5jdGlvbiBhbGxvYyAoc2l6ZSwgZmlsbCwgZW5jb2RpbmcpIHtcbiAgYXNzZXJ0U2l6ZShzaXplKVxuICBpZiAoc2l6ZSA8PSAwKSB7XG4gICAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcihzaXplKVxuICB9XG4gIGlmIChmaWxsICE9PSB1bmRlZmluZWQpIHtcbiAgICAvLyBPbmx5IHBheSBhdHRlbnRpb24gdG8gZW5jb2RpbmcgaWYgaXQncyBhIHN0cmluZy4gVGhpc1xuICAgIC8vIHByZXZlbnRzIGFjY2lkZW50YWxseSBzZW5kaW5nIGluIGEgbnVtYmVyIHRoYXQgd291bGRcbiAgICAvLyBiZSBpbnRlcnByZXR0ZWQgYXMgYSBzdGFydCBvZmZzZXQuXG4gICAgcmV0dXJuIHR5cGVvZiBlbmNvZGluZyA9PT0gJ3N0cmluZydcbiAgICAgID8gY3JlYXRlQnVmZmVyKHNpemUpLmZpbGwoZmlsbCwgZW5jb2RpbmcpXG4gICAgICA6IGNyZWF0ZUJ1ZmZlcihzaXplKS5maWxsKGZpbGwpXG4gIH1cbiAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcihzaXplKVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqIGFsbG9jKHNpemVbLCBmaWxsWywgZW5jb2RpbmddXSlcbiAqKi9cbkJ1ZmZlci5hbGxvYyA9IGZ1bmN0aW9uIChzaXplLCBmaWxsLCBlbmNvZGluZykge1xuICByZXR1cm4gYWxsb2Moc2l6ZSwgZmlsbCwgZW5jb2RpbmcpXG59XG5cbmZ1bmN0aW9uIGFsbG9jVW5zYWZlIChzaXplKSB7XG4gIGFzc2VydFNpemUoc2l6ZSlcbiAgcmV0dXJuIGNyZWF0ZUJ1ZmZlcihzaXplIDwgMCA/IDAgOiBjaGVja2VkKHNpemUpIHwgMClcbn1cblxuLyoqXG4gKiBFcXVpdmFsZW50IHRvIEJ1ZmZlcihudW0pLCBieSBkZWZhdWx0IGNyZWF0ZXMgYSBub24temVyby1maWxsZWQgQnVmZmVyIGluc3RhbmNlLlxuICogKi9cbkJ1ZmZlci5hbGxvY1Vuc2FmZSA9IGZ1bmN0aW9uIChzaXplKSB7XG4gIHJldHVybiBhbGxvY1Vuc2FmZShzaXplKVxufVxuLyoqXG4gKiBFcXVpdmFsZW50IHRvIFNsb3dCdWZmZXIobnVtKSwgYnkgZGVmYXVsdCBjcmVhdGVzIGEgbm9uLXplcm8tZmlsbGVkIEJ1ZmZlciBpbnN0YW5jZS5cbiAqL1xuQnVmZmVyLmFsbG9jVW5zYWZlU2xvdyA9IGZ1bmN0aW9uIChzaXplKSB7XG4gIHJldHVybiBhbGxvY1Vuc2FmZShzaXplKVxufVxuXG5mdW5jdGlvbiBmcm9tU3RyaW5nIChzdHJpbmcsIGVuY29kaW5nKSB7XG4gIGlmICh0eXBlb2YgZW5jb2RpbmcgIT09ICdzdHJpbmcnIHx8IGVuY29kaW5nID09PSAnJykge1xuICAgIGVuY29kaW5nID0gJ3V0ZjgnXG4gIH1cblxuICBpZiAoIUJ1ZmZlci5pc0VuY29kaW5nKGVuY29kaW5nKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiZW5jb2RpbmdcIiBtdXN0IGJlIGEgdmFsaWQgc3RyaW5nIGVuY29kaW5nJylcbiAgfVxuXG4gIHZhciBsZW5ndGggPSBieXRlTGVuZ3RoKHN0cmluZywgZW5jb2RpbmcpIHwgMFxuICB2YXIgYnVmID0gY3JlYXRlQnVmZmVyKGxlbmd0aClcblxuICB2YXIgYWN0dWFsID0gYnVmLndyaXRlKHN0cmluZywgZW5jb2RpbmcpXG5cbiAgaWYgKGFjdHVhbCAhPT0gbGVuZ3RoKSB7XG4gICAgLy8gV3JpdGluZyBhIGhleCBzdHJpbmcsIGZvciBleGFtcGxlLCB0aGF0IGNvbnRhaW5zIGludmFsaWQgY2hhcmFjdGVycyB3aWxsXG4gICAgLy8gY2F1c2UgZXZlcnl0aGluZyBhZnRlciB0aGUgZmlyc3QgaW52YWxpZCBjaGFyYWN0ZXIgdG8gYmUgaWdub3JlZC4gKGUuZy5cbiAgICAvLyAnYWJ4eGNkJyB3aWxsIGJlIHRyZWF0ZWQgYXMgJ2FiJylcbiAgICBidWYgPSBidWYuc2xpY2UoMCwgYWN0dWFsKVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG5mdW5jdGlvbiBmcm9tQXJyYXlMaWtlIChhcnJheSkge1xuICB2YXIgbGVuZ3RoID0gYXJyYXkubGVuZ3RoIDwgMCA/IDAgOiBjaGVja2VkKGFycmF5Lmxlbmd0aCkgfCAwXG4gIHZhciBidWYgPSBjcmVhdGVCdWZmZXIobGVuZ3RoKVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSArPSAxKSB7XG4gICAgYnVmW2ldID0gYXJyYXlbaV0gJiAyNTVcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21BcnJheUJ1ZmZlciAoYXJyYXksIGJ5dGVPZmZzZXQsIGxlbmd0aCkge1xuICBpZiAoYnl0ZU9mZnNldCA8IDAgfHwgYXJyYXkuYnl0ZUxlbmd0aCA8IGJ5dGVPZmZzZXQpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignXFwnb2Zmc2V0XFwnIGlzIG91dCBvZiBib3VuZHMnKVxuICB9XG5cbiAgaWYgKGFycmF5LmJ5dGVMZW5ndGggPCBieXRlT2Zmc2V0ICsgKGxlbmd0aCB8fCAwKSkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcXCdsZW5ndGhcXCcgaXMgb3V0IG9mIGJvdW5kcycpXG4gIH1cblxuICB2YXIgYnVmXG4gIGlmIChieXRlT2Zmc2V0ID09PSB1bmRlZmluZWQgJiYgbGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBidWYgPSBuZXcgVWludDhBcnJheShhcnJheSlcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCkge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0KVxuICB9IGVsc2Uge1xuICAgIGJ1ZiA9IG5ldyBVaW50OEFycmF5KGFycmF5LCBieXRlT2Zmc2V0LCBsZW5ndGgpXG4gIH1cblxuICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZVxuICBidWYuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICByZXR1cm4gYnVmXG59XG5cbmZ1bmN0aW9uIGZyb21PYmplY3QgKG9iaikge1xuICBpZiAoQnVmZmVyLmlzQnVmZmVyKG9iaikpIHtcbiAgICB2YXIgbGVuID0gY2hlY2tlZChvYmoubGVuZ3RoKSB8IDBcbiAgICB2YXIgYnVmID0gY3JlYXRlQnVmZmVyKGxlbilcblxuICAgIGlmIChidWYubGVuZ3RoID09PSAwKSB7XG4gICAgICByZXR1cm4gYnVmXG4gICAgfVxuXG4gICAgb2JqLmNvcHkoYnVmLCAwLCAwLCBsZW4pXG4gICAgcmV0dXJuIGJ1ZlxuICB9XG5cbiAgaWYgKG9iaikge1xuICAgIGlmIChpc0FycmF5QnVmZmVyVmlldyhvYmopIHx8ICdsZW5ndGgnIGluIG9iaikge1xuICAgICAgaWYgKHR5cGVvZiBvYmoubGVuZ3RoICE9PSAnbnVtYmVyJyB8fCBudW1iZXJJc05hTihvYmoubGVuZ3RoKSkge1xuICAgICAgICByZXR1cm4gY3JlYXRlQnVmZmVyKDApXG4gICAgICB9XG4gICAgICByZXR1cm4gZnJvbUFycmF5TGlrZShvYmopXG4gICAgfVxuXG4gICAgaWYgKG9iai50eXBlID09PSAnQnVmZmVyJyAmJiBBcnJheS5pc0FycmF5KG9iai5kYXRhKSkge1xuICAgICAgcmV0dXJuIGZyb21BcnJheUxpa2Uob2JqLmRhdGEpXG4gICAgfVxuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcignRmlyc3QgYXJndW1lbnQgbXVzdCBiZSBhIHN0cmluZywgQnVmZmVyLCBBcnJheUJ1ZmZlciwgQXJyYXksIG9yIGFycmF5LWxpa2Ugb2JqZWN0LicpXG59XG5cbmZ1bmN0aW9uIGNoZWNrZWQgKGxlbmd0aCkge1xuICAvLyBOb3RlOiBjYW5ub3QgdXNlIGBsZW5ndGggPCBLX01BWF9MRU5HVEhgIGhlcmUgYmVjYXVzZSB0aGF0IGZhaWxzIHdoZW5cbiAgLy8gbGVuZ3RoIGlzIE5hTiAod2hpY2ggaXMgb3RoZXJ3aXNlIGNvZXJjZWQgdG8gemVyby4pXG4gIGlmIChsZW5ndGggPj0gS19NQVhfTEVOR1RIKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0F0dGVtcHQgdG8gYWxsb2NhdGUgQnVmZmVyIGxhcmdlciB0aGFuIG1heGltdW0gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgJ3NpemU6IDB4JyArIEtfTUFYX0xFTkdUSC50b1N0cmluZygxNikgKyAnIGJ5dGVzJylcbiAgfVxuICByZXR1cm4gbGVuZ3RoIHwgMFxufVxuXG5mdW5jdGlvbiBTbG93QnVmZmVyIChsZW5ndGgpIHtcbiAgaWYgKCtsZW5ndGggIT0gbGVuZ3RoKSB7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgZXFlcWVxXG4gICAgbGVuZ3RoID0gMFxuICB9XG4gIHJldHVybiBCdWZmZXIuYWxsb2MoK2xlbmd0aClcbn1cblxuQnVmZmVyLmlzQnVmZmVyID0gZnVuY3Rpb24gaXNCdWZmZXIgKGIpIHtcbiAgcmV0dXJuIGIgIT0gbnVsbCAmJiBiLl9pc0J1ZmZlciA9PT0gdHJ1ZVxufVxuXG5CdWZmZXIuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKGEsIGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYSkgfHwgIUJ1ZmZlci5pc0J1ZmZlcihiKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50cyBtdXN0IGJlIEJ1ZmZlcnMnKVxuICB9XG5cbiAgaWYgKGEgPT09IGIpIHJldHVybiAwXG5cbiAgdmFyIHggPSBhLmxlbmd0aFxuICB2YXIgeSA9IGIubGVuZ3RoXG5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IE1hdGgubWluKHgsIHkpOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAoYVtpXSAhPT0gYltpXSkge1xuICAgICAgeCA9IGFbaV1cbiAgICAgIHkgPSBiW2ldXG4gICAgICBicmVha1xuICAgIH1cbiAgfVxuXG4gIGlmICh4IDwgeSkgcmV0dXJuIC0xXG4gIGlmICh5IDwgeCkgcmV0dXJuIDFcbiAgcmV0dXJuIDBcbn1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiBpc0VuY29kaW5nIChlbmNvZGluZykge1xuICBzd2l0Y2ggKFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKSkge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdsYXRpbjEnOlxuICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgY2FzZSAnYmFzZTY0JzpcbiAgICBjYXNlICd1Y3MyJzpcbiAgICBjYXNlICd1Y3MtMic6XG4gICAgY2FzZSAndXRmMTZsZSc6XG4gICAgY2FzZSAndXRmLTE2bGUnOlxuICAgICAgcmV0dXJuIHRydWVcbiAgICBkZWZhdWx0OlxuICAgICAgcmV0dXJuIGZhbHNlXG4gIH1cbn1cblxuQnVmZmVyLmNvbmNhdCA9IGZ1bmN0aW9uIGNvbmNhdCAobGlzdCwgbGVuZ3RoKSB7XG4gIGlmICghQXJyYXkuaXNBcnJheShsaXN0KSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wibGlzdFwiIGFyZ3VtZW50IG11c3QgYmUgYW4gQXJyYXkgb2YgQnVmZmVycycpXG4gIH1cblxuICBpZiAobGlzdC5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4gQnVmZmVyLmFsbG9jKDApXG4gIH1cblxuICB2YXIgaVxuICBpZiAobGVuZ3RoID09PSB1bmRlZmluZWQpIHtcbiAgICBsZW5ndGggPSAwXG4gICAgZm9yIChpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgIGxlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWZmZXIgPSBCdWZmZXIuYWxsb2NVbnNhZmUobGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgIHZhciBidWYgPSBsaXN0W2ldXG4gICAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYnVmKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXCJsaXN0XCIgYXJndW1lbnQgbXVzdCBiZSBhbiBBcnJheSBvZiBCdWZmZXJzJylcbiAgICB9XG4gICAgYnVmLmNvcHkoYnVmZmVyLCBwb3MpXG4gICAgcG9zICs9IGJ1Zi5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmZmVyXG59XG5cbmZ1bmN0aW9uIGJ5dGVMZW5ndGggKHN0cmluZywgZW5jb2RpbmcpIHtcbiAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdHJpbmcpKSB7XG4gICAgcmV0dXJuIHN0cmluZy5sZW5ndGhcbiAgfVxuICBpZiAoaXNBcnJheUJ1ZmZlclZpZXcoc3RyaW5nKSB8fCBzdHJpbmcgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikge1xuICAgIHJldHVybiBzdHJpbmcuYnl0ZUxlbmd0aFxuICB9XG4gIGlmICh0eXBlb2Ygc3RyaW5nICE9PSAnc3RyaW5nJykge1xuICAgIHN0cmluZyA9ICcnICsgc3RyaW5nXG4gIH1cblxuICB2YXIgbGVuID0gc3RyaW5nLmxlbmd0aFxuICBpZiAobGVuID09PSAwKSByZXR1cm4gMFxuXG4gIC8vIFVzZSBhIGZvciBsb29wIHRvIGF2b2lkIHJlY3Vyc2lvblxuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnYXNjaWknOlxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsZW5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgY2FzZSB1bmRlZmluZWQ6XG4gICAgICAgIHJldHVybiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aFxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIGxlbiAqIDJcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBsZW4gPj4+IDFcbiAgICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICAgIHJldHVybiBiYXNlNjRUb0J5dGVzKHN0cmluZykubGVuZ3RoXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHJldHVybiB1dGY4VG9CeXRlcyhzdHJpbmcpLmxlbmd0aCAvLyBhc3N1bWUgdXRmOFxuICAgICAgICBlbmNvZGluZyA9ICgnJyArIGVuY29kaW5nKS50b0xvd2VyQ2FzZSgpXG4gICAgICAgIGxvd2VyZWRDYXNlID0gdHJ1ZVxuICAgIH1cbiAgfVxufVxuQnVmZmVyLmJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoXG5cbmZ1bmN0aW9uIHNsb3dUb1N0cmluZyAoZW5jb2RpbmcsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxvd2VyZWRDYXNlID0gZmFsc2VcblxuICAvLyBObyBuZWVkIHRvIHZlcmlmeSB0aGF0IFwidGhpcy5sZW5ndGggPD0gTUFYX1VJTlQzMlwiIHNpbmNlIGl0J3MgYSByZWFkLW9ubHlcbiAgLy8gcHJvcGVydHkgb2YgYSB0eXBlZCBhcnJheS5cblxuICAvLyBUaGlzIGJlaGF2ZXMgbmVpdGhlciBsaWtlIFN0cmluZyBub3IgVWludDhBcnJheSBpbiB0aGF0IHdlIHNldCBzdGFydC9lbmRcbiAgLy8gdG8gdGhlaXIgdXBwZXIvbG93ZXIgYm91bmRzIGlmIHRoZSB2YWx1ZSBwYXNzZWQgaXMgb3V0IG9mIHJhbmdlLlxuICAvLyB1bmRlZmluZWQgaXMgaGFuZGxlZCBzcGVjaWFsbHkgYXMgcGVyIEVDTUEtMjYyIDZ0aCBFZGl0aW9uLFxuICAvLyBTZWN0aW9uIDEzLjMuMy43IFJ1bnRpbWUgU2VtYW50aWNzOiBLZXllZEJpbmRpbmdJbml0aWFsaXphdGlvbi5cbiAgaWYgKHN0YXJ0ID09PSB1bmRlZmluZWQgfHwgc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgPSAwXG4gIH1cbiAgLy8gUmV0dXJuIGVhcmx5IGlmIHN0YXJ0ID4gdGhpcy5sZW5ndGguIERvbmUgaGVyZSB0byBwcmV2ZW50IHBvdGVudGlhbCB1aW50MzJcbiAgLy8gY29lcmNpb24gZmFpbCBiZWxvdy5cbiAgaWYgKHN0YXJ0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIGlmIChlbmQgPT09IHVuZGVmaW5lZCB8fCBlbmQgPiB0aGlzLmxlbmd0aCkge1xuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIH1cblxuICBpZiAoZW5kIDw9IDApIHtcbiAgICByZXR1cm4gJydcbiAgfVxuXG4gIC8vIEZvcmNlIGNvZXJzaW9uIHRvIHVpbnQzMi4gVGhpcyB3aWxsIGFsc28gY29lcmNlIGZhbHNleS9OYU4gdmFsdWVzIHRvIDAuXG4gIGVuZCA+Pj49IDBcbiAgc3RhcnQgPj4+PSAwXG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiAnJ1xuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB3aGlsZSAodHJ1ZSkge1xuICAgIHN3aXRjaCAoZW5jb2RpbmcpIHtcbiAgICAgIGNhc2UgJ2hleCc6XG4gICAgICAgIHJldHVybiBoZXhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICd1dGY4JzpcbiAgICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgICAgcmV0dXJuIHV0ZjhTbGljZSh0aGlzLCBzdGFydCwgZW5kKVxuXG4gICAgICBjYXNlICdhc2NpaSc6XG4gICAgICAgIHJldHVybiBhc2NpaVNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ2xhdGluMSc6XG4gICAgICBjYXNlICdiaW5hcnknOlxuICAgICAgICByZXR1cm4gbGF0aW4xU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgY2FzZSAnYmFzZTY0JzpcbiAgICAgICAgcmV0dXJuIGJhc2U2NFNsaWNlKHRoaXMsIHN0YXJ0LCBlbmQpXG5cbiAgICAgIGNhc2UgJ3VjczInOlxuICAgICAgY2FzZSAndWNzLTInOlxuICAgICAgY2FzZSAndXRmMTZsZSc6XG4gICAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICAgIHJldHVybiB1dGYxNmxlU2xpY2UodGhpcywgc3RhcnQsIGVuZClcblxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgaWYgKGxvd2VyZWRDYXNlKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmtub3duIGVuY29kaW5nOiAnICsgZW5jb2RpbmcpXG4gICAgICAgIGVuY29kaW5nID0gKGVuY29kaW5nICsgJycpLnRvTG93ZXJDYXNlKClcbiAgICAgICAgbG93ZXJlZENhc2UgPSB0cnVlXG4gICAgfVxuICB9XG59XG5cbi8vIFRoaXMgcHJvcGVydHkgaXMgdXNlZCBieSBgQnVmZmVyLmlzQnVmZmVyYCAoYW5kIHRoZSBgaXMtYnVmZmVyYCBucG0gcGFja2FnZSlcbi8vIHRvIGRldGVjdCBhIEJ1ZmZlciBpbnN0YW5jZS4gSXQncyBub3QgcG9zc2libGUgdG8gdXNlIGBpbnN0YW5jZW9mIEJ1ZmZlcmBcbi8vIHJlbGlhYmx5IGluIGEgYnJvd3NlcmlmeSBjb250ZXh0IGJlY2F1c2UgdGhlcmUgY291bGQgYmUgbXVsdGlwbGUgZGlmZmVyZW50XG4vLyBjb3BpZXMgb2YgdGhlICdidWZmZXInIHBhY2thZ2UgaW4gdXNlLiBUaGlzIG1ldGhvZCB3b3JrcyBldmVuIGZvciBCdWZmZXJcbi8vIGluc3RhbmNlcyB0aGF0IHdlcmUgY3JlYXRlZCBmcm9tIGFub3RoZXIgY29weSBvZiB0aGUgYGJ1ZmZlcmAgcGFja2FnZS5cbi8vIFNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Zlcm9zcy9idWZmZXIvaXNzdWVzLzE1NFxuQnVmZmVyLnByb3RvdHlwZS5faXNCdWZmZXIgPSB0cnVlXG5cbmZ1bmN0aW9uIHN3YXAgKGIsIG4sIG0pIHtcbiAgdmFyIGkgPSBiW25dXG4gIGJbbl0gPSBiW21dXG4gIGJbbV0gPSBpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc3dhcDE2ID0gZnVuY3Rpb24gc3dhcDE2ICgpIHtcbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGlmIChsZW4gJSAyICE9PSAwKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0J1ZmZlciBzaXplIG11c3QgYmUgYSBtdWx0aXBsZSBvZiAxNi1iaXRzJylcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgaSArPSAyKSB7XG4gICAgc3dhcCh0aGlzLCBpLCBpICsgMSlcbiAgfVxuICByZXR1cm4gdGhpc1xufVxuXG5CdWZmZXIucHJvdG90eXBlLnN3YXAzMiA9IGZ1bmN0aW9uIHN3YXAzMiAoKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuICUgNCAhPT0gMCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdCdWZmZXIgc2l6ZSBtdXN0IGJlIGEgbXVsdGlwbGUgb2YgMzItYml0cycpXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW47IGkgKz0gNCkge1xuICAgIHN3YXAodGhpcywgaSwgaSArIDMpXG4gICAgc3dhcCh0aGlzLCBpICsgMSwgaSArIDIpXG4gIH1cbiAgcmV0dXJuIHRoaXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zd2FwNjQgPSBmdW5jdGlvbiBzd2FwNjQgKCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgaWYgKGxlbiAlIDggIT09IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQnVmZmVyIHNpemUgbXVzdCBiZSBhIG11bHRpcGxlIG9mIDY0LWJpdHMnKVxuICB9XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpICs9IDgpIHtcbiAgICBzd2FwKHRoaXMsIGksIGkgKyA3KVxuICAgIHN3YXAodGhpcywgaSArIDEsIGkgKyA2KVxuICAgIHN3YXAodGhpcywgaSArIDIsIGkgKyA1KVxuICAgIHN3YXAodGhpcywgaSArIDMsIGkgKyA0KVxuICB9XG4gIHJldHVybiB0aGlzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbiB0b1N0cmluZyAoKSB7XG4gIHZhciBsZW5ndGggPSB0aGlzLmxlbmd0aFxuICBpZiAobGVuZ3RoID09PSAwKSByZXR1cm4gJydcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHJldHVybiB1dGY4U2xpY2UodGhpcywgMCwgbGVuZ3RoKVxuICByZXR1cm4gc2xvd1RvU3RyaW5nLmFwcGx5KHRoaXMsIGFyZ3VtZW50cylcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbiBlcXVhbHMgKGIpIHtcbiAgaWYgKCFCdWZmZXIuaXNCdWZmZXIoYikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0FyZ3VtZW50IG11c3QgYmUgYSBCdWZmZXInKVxuICBpZiAodGhpcyA9PT0gYikgcmV0dXJuIHRydWVcbiAgcmV0dXJuIEJ1ZmZlci5jb21wYXJlKHRoaXMsIGIpID09PSAwXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuaW5zcGVjdCA9IGZ1bmN0aW9uIGluc3BlY3QgKCkge1xuICB2YXIgc3RyID0gJydcbiAgdmFyIG1heCA9IGV4cG9ydHMuSU5TUEVDVF9NQVhfQllURVNcbiAgaWYgKHRoaXMubGVuZ3RoID4gMCkge1xuICAgIHN0ciA9IHRoaXMudG9TdHJpbmcoJ2hleCcsIDAsIG1heCkubWF0Y2goLy57Mn0vZykuam9pbignICcpXG4gICAgaWYgKHRoaXMubGVuZ3RoID4gbWF4KSBzdHIgKz0gJyAuLi4gJ1xuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgc3RyICsgJz4nXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuY29tcGFyZSA9IGZ1bmN0aW9uIGNvbXBhcmUgKHRhcmdldCwgc3RhcnQsIGVuZCwgdGhpc1N0YXJ0LCB0aGlzRW5kKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKHRhcmdldCkpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBcmd1bWVudCBtdXN0IGJlIGEgQnVmZmVyJylcbiAgfVxuXG4gIGlmIChzdGFydCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgc3RhcnQgPSAwXG4gIH1cbiAgaWYgKGVuZCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgZW5kID0gdGFyZ2V0ID8gdGFyZ2V0Lmxlbmd0aCA6IDBcbiAgfVxuICBpZiAodGhpc1N0YXJ0ID09PSB1bmRlZmluZWQpIHtcbiAgICB0aGlzU3RhcnQgPSAwXG4gIH1cbiAgaWYgKHRoaXNFbmQgPT09IHVuZGVmaW5lZCkge1xuICAgIHRoaXNFbmQgPSB0aGlzLmxlbmd0aFxuICB9XG5cbiAgaWYgKHN0YXJ0IDwgMCB8fCBlbmQgPiB0YXJnZXQubGVuZ3RoIHx8IHRoaXNTdGFydCA8IDAgfHwgdGhpc0VuZCA+IHRoaXMubGVuZ3RoKSB7XG4gICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ291dCBvZiByYW5nZSBpbmRleCcpXG4gIH1cblxuICBpZiAodGhpc1N0YXJ0ID49IHRoaXNFbmQgJiYgc3RhcnQgPj0gZW5kKSB7XG4gICAgcmV0dXJuIDBcbiAgfVxuICBpZiAodGhpc1N0YXJ0ID49IHRoaXNFbmQpIHtcbiAgICByZXR1cm4gLTFcbiAgfVxuICBpZiAoc3RhcnQgPj0gZW5kKSB7XG4gICAgcmV0dXJuIDFcbiAgfVxuXG4gIHN0YXJ0ID4+Pj0gMFxuICBlbmQgPj4+PSAwXG4gIHRoaXNTdGFydCA+Pj49IDBcbiAgdGhpc0VuZCA+Pj49IDBcblxuICBpZiAodGhpcyA9PT0gdGFyZ2V0KSByZXR1cm4gMFxuXG4gIHZhciB4ID0gdGhpc0VuZCAtIHRoaXNTdGFydFxuICB2YXIgeSA9IGVuZCAtIHN0YXJ0XG4gIHZhciBsZW4gPSBNYXRoLm1pbih4LCB5KVxuXG4gIHZhciB0aGlzQ29weSA9IHRoaXMuc2xpY2UodGhpc1N0YXJ0LCB0aGlzRW5kKVxuICB2YXIgdGFyZ2V0Q29weSA9IHRhcmdldC5zbGljZShzdGFydCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICBpZiAodGhpc0NvcHlbaV0gIT09IHRhcmdldENvcHlbaV0pIHtcbiAgICAgIHggPSB0aGlzQ29weVtpXVxuICAgICAgeSA9IHRhcmdldENvcHlbaV1cbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG5cbiAgaWYgKHggPCB5KSByZXR1cm4gLTFcbiAgaWYgKHkgPCB4KSByZXR1cm4gMVxuICByZXR1cm4gMFxufVxuXG4vLyBGaW5kcyBlaXRoZXIgdGhlIGZpcnN0IGluZGV4IG9mIGB2YWxgIGluIGBidWZmZXJgIGF0IG9mZnNldCA+PSBgYnl0ZU9mZnNldGAsXG4vLyBPUiB0aGUgbGFzdCBpbmRleCBvZiBgdmFsYCBpbiBgYnVmZmVyYCBhdCBvZmZzZXQgPD0gYGJ5dGVPZmZzZXRgLlxuLy9cbi8vIEFyZ3VtZW50czpcbi8vIC0gYnVmZmVyIC0gYSBCdWZmZXIgdG8gc2VhcmNoXG4vLyAtIHZhbCAtIGEgc3RyaW5nLCBCdWZmZXIsIG9yIG51bWJlclxuLy8gLSBieXRlT2Zmc2V0IC0gYW4gaW5kZXggaW50byBgYnVmZmVyYDsgd2lsbCBiZSBjbGFtcGVkIHRvIGFuIGludDMyXG4vLyAtIGVuY29kaW5nIC0gYW4gb3B0aW9uYWwgZW5jb2RpbmcsIHJlbGV2YW50IGlzIHZhbCBpcyBhIHN0cmluZ1xuLy8gLSBkaXIgLSB0cnVlIGZvciBpbmRleE9mLCBmYWxzZSBmb3IgbGFzdEluZGV4T2ZcbmZ1bmN0aW9uIGJpZGlyZWN0aW9uYWxJbmRleE9mIChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcsIGRpcikge1xuICAvLyBFbXB0eSBidWZmZXIgbWVhbnMgbm8gbWF0Y2hcbiAgaWYgKGJ1ZmZlci5sZW5ndGggPT09IDApIHJldHVybiAtMVxuXG4gIC8vIE5vcm1hbGl6ZSBieXRlT2Zmc2V0XG4gIGlmICh0eXBlb2YgYnl0ZU9mZnNldCA9PT0gJ3N0cmluZycpIHtcbiAgICBlbmNvZGluZyA9IGJ5dGVPZmZzZXRcbiAgICBieXRlT2Zmc2V0ID0gMFxuICB9IGVsc2UgaWYgKGJ5dGVPZmZzZXQgPiAweDdmZmZmZmZmKSB7XG4gICAgYnl0ZU9mZnNldCA9IDB4N2ZmZmZmZmZcbiAgfSBlbHNlIGlmIChieXRlT2Zmc2V0IDwgLTB4ODAwMDAwMDApIHtcbiAgICBieXRlT2Zmc2V0ID0gLTB4ODAwMDAwMDBcbiAgfVxuICBieXRlT2Zmc2V0ID0gK2J5dGVPZmZzZXQgIC8vIENvZXJjZSB0byBOdW1iZXIuXG4gIGlmIChudW1iZXJJc05hTihieXRlT2Zmc2V0KSkge1xuICAgIC8vIGJ5dGVPZmZzZXQ6IGl0IGl0J3MgdW5kZWZpbmVkLCBudWxsLCBOYU4sIFwiZm9vXCIsIGV0Yywgc2VhcmNoIHdob2xlIGJ1ZmZlclxuICAgIGJ5dGVPZmZzZXQgPSBkaXIgPyAwIDogKGJ1ZmZlci5sZW5ndGggLSAxKVxuICB9XG5cbiAgLy8gTm9ybWFsaXplIGJ5dGVPZmZzZXQ6IG5lZ2F0aXZlIG9mZnNldHMgc3RhcnQgZnJvbSB0aGUgZW5kIG9mIHRoZSBidWZmZXJcbiAgaWYgKGJ5dGVPZmZzZXQgPCAwKSBieXRlT2Zmc2V0ID0gYnVmZmVyLmxlbmd0aCArIGJ5dGVPZmZzZXRcbiAgaWYgKGJ5dGVPZmZzZXQgPj0gYnVmZmVyLmxlbmd0aCkge1xuICAgIGlmIChkaXIpIHJldHVybiAtMVxuICAgIGVsc2UgYnl0ZU9mZnNldCA9IGJ1ZmZlci5sZW5ndGggLSAxXG4gIH0gZWxzZSBpZiAoYnl0ZU9mZnNldCA8IDApIHtcbiAgICBpZiAoZGlyKSBieXRlT2Zmc2V0ID0gMFxuICAgIGVsc2UgcmV0dXJuIC0xXG4gIH1cblxuICAvLyBOb3JtYWxpemUgdmFsXG4gIGlmICh0eXBlb2YgdmFsID09PSAnc3RyaW5nJykge1xuICAgIHZhbCA9IEJ1ZmZlci5mcm9tKHZhbCwgZW5jb2RpbmcpXG4gIH1cblxuICAvLyBGaW5hbGx5LCBzZWFyY2ggZWl0aGVyIGluZGV4T2YgKGlmIGRpciBpcyB0cnVlKSBvciBsYXN0SW5kZXhPZlxuICBpZiAoQnVmZmVyLmlzQnVmZmVyKHZhbCkpIHtcbiAgICAvLyBTcGVjaWFsIGNhc2U6IGxvb2tpbmcgZm9yIGVtcHR5IHN0cmluZy9idWZmZXIgYWx3YXlzIGZhaWxzXG4gICAgaWYgKHZhbC5sZW5ndGggPT09IDApIHtcbiAgICAgIHJldHVybiAtMVxuICAgIH1cbiAgICByZXR1cm4gYXJyYXlJbmRleE9mKGJ1ZmZlciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKVxuICB9IGVsc2UgaWYgKHR5cGVvZiB2YWwgPT09ICdudW1iZXInKSB7XG4gICAgdmFsID0gdmFsICYgMHhGRiAvLyBTZWFyY2ggZm9yIGEgYnl0ZSB2YWx1ZSBbMC0yNTVdXG4gICAgaWYgKHR5cGVvZiBVaW50OEFycmF5LnByb3RvdHlwZS5pbmRleE9mID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICBpZiAoZGlyKSB7XG4gICAgICAgIHJldHVybiBVaW50OEFycmF5LnByb3RvdHlwZS5pbmRleE9mLmNhbGwoYnVmZmVyLCB2YWwsIGJ5dGVPZmZzZXQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gVWludDhBcnJheS5wcm90b3R5cGUubGFzdEluZGV4T2YuY2FsbChidWZmZXIsIHZhbCwgYnl0ZU9mZnNldClcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGFycmF5SW5kZXhPZihidWZmZXIsIFsgdmFsIF0sIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBkaXIpXG4gIH1cblxuICB0aHJvdyBuZXcgVHlwZUVycm9yKCd2YWwgbXVzdCBiZSBzdHJpbmcsIG51bWJlciBvciBCdWZmZXInKVxufVxuXG5mdW5jdGlvbiBhcnJheUluZGV4T2YgKGFyciwgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgZGlyKSB7XG4gIHZhciBpbmRleFNpemUgPSAxXG4gIHZhciBhcnJMZW5ndGggPSBhcnIubGVuZ3RoXG4gIHZhciB2YWxMZW5ndGggPSB2YWwubGVuZ3RoXG5cbiAgaWYgKGVuY29kaW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9IFN0cmluZyhlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgIGlmIChlbmNvZGluZyA9PT0gJ3VjczInIHx8IGVuY29kaW5nID09PSAndWNzLTInIHx8XG4gICAgICAgIGVuY29kaW5nID09PSAndXRmMTZsZScgfHwgZW5jb2RpbmcgPT09ICd1dGYtMTZsZScpIHtcbiAgICAgIGlmIChhcnIubGVuZ3RoIDwgMiB8fCB2YWwubGVuZ3RoIDwgMikge1xuICAgICAgICByZXR1cm4gLTFcbiAgICAgIH1cbiAgICAgIGluZGV4U2l6ZSA9IDJcbiAgICAgIGFyckxlbmd0aCAvPSAyXG4gICAgICB2YWxMZW5ndGggLz0gMlxuICAgICAgYnl0ZU9mZnNldCAvPSAyXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gcmVhZCAoYnVmLCBpKSB7XG4gICAgaWYgKGluZGV4U2l6ZSA9PT0gMSkge1xuICAgICAgcmV0dXJuIGJ1ZltpXVxuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYnVmLnJlYWRVSW50MTZCRShpICogaW5kZXhTaXplKVxuICAgIH1cbiAgfVxuXG4gIHZhciBpXG4gIGlmIChkaXIpIHtcbiAgICB2YXIgZm91bmRJbmRleCA9IC0xXG4gICAgZm9yIChpID0gYnl0ZU9mZnNldDsgaSA8IGFyckxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAocmVhZChhcnIsIGkpID09PSByZWFkKHZhbCwgZm91bmRJbmRleCA9PT0gLTEgPyAwIDogaSAtIGZvdW5kSW5kZXgpKSB7XG4gICAgICAgIGlmIChmb3VuZEluZGV4ID09PSAtMSkgZm91bmRJbmRleCA9IGlcbiAgICAgICAgaWYgKGkgLSBmb3VuZEluZGV4ICsgMSA9PT0gdmFsTGVuZ3RoKSByZXR1cm4gZm91bmRJbmRleCAqIGluZGV4U2l6ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKGZvdW5kSW5kZXggIT09IC0xKSBpIC09IGkgLSBmb3VuZEluZGV4XG4gICAgICAgIGZvdW5kSW5kZXggPSAtMVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBpZiAoYnl0ZU9mZnNldCArIHZhbExlbmd0aCA+IGFyckxlbmd0aCkgYnl0ZU9mZnNldCA9IGFyckxlbmd0aCAtIHZhbExlbmd0aFxuICAgIGZvciAoaSA9IGJ5dGVPZmZzZXQ7IGkgPj0gMDsgaS0tKSB7XG4gICAgICB2YXIgZm91bmQgPSB0cnVlXG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHZhbExlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmIChyZWFkKGFyciwgaSArIGopICE9PSByZWFkKHZhbCwgaikpIHtcbiAgICAgICAgICBmb3VuZCA9IGZhbHNlXG4gICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYgKGZvdW5kKSByZXR1cm4gaVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiAtMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLmluY2x1ZGVzID0gZnVuY3Rpb24gaW5jbHVkZXMgKHZhbCwgYnl0ZU9mZnNldCwgZW5jb2RpbmcpIHtcbiAgcmV0dXJuIHRoaXMuaW5kZXhPZih2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSAhPT0gLTFcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbmRleE9mID0gZnVuY3Rpb24gaW5kZXhPZiAodmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZykge1xuICByZXR1cm4gYmlkaXJlY3Rpb25hbEluZGV4T2YodGhpcywgdmFsLCBieXRlT2Zmc2V0LCBlbmNvZGluZywgdHJ1ZSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5sYXN0SW5kZXhPZiA9IGZ1bmN0aW9uIGxhc3RJbmRleE9mICh2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nKSB7XG4gIHJldHVybiBiaWRpcmVjdGlvbmFsSW5kZXhPZih0aGlzLCB2YWwsIGJ5dGVPZmZzZXQsIGVuY29kaW5nLCBmYWxzZSlcbn1cblxuZnVuY3Rpb24gaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBpZiAoc3RyTGVuICUgMiAhPT0gMCkgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCBoZXggc3RyaW5nJylcblxuICBpZiAobGVuZ3RoID4gc3RyTGVuIC8gMikge1xuICAgIGxlbmd0aCA9IHN0ckxlbiAvIDJcbiAgfVxuICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgdmFyIHBhcnNlZCA9IHBhcnNlSW50KHN0cmluZy5zdWJzdHIoaSAqIDIsIDIpLCAxNilcbiAgICBpZiAobnVtYmVySXNOYU4ocGFyc2VkKSkgcmV0dXJuIGlcbiAgICBidWZbb2Zmc2V0ICsgaV0gPSBwYXJzZWRcbiAgfVxuICByZXR1cm4gaVxufVxuXG5mdW5jdGlvbiB1dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gYmxpdEJ1ZmZlcih1dGY4VG9CeXRlcyhzdHJpbmcsIGJ1Zi5sZW5ndGggLSBvZmZzZXQpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBhc2NpaVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIoYXNjaWlUb0J5dGVzKHN0cmluZyksIGJ1Ziwgb2Zmc2V0LCBsZW5ndGgpXG59XG5cbmZ1bmN0aW9uIGxhdGluMVdyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGFzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBiYXNlNjRXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHJldHVybiBibGl0QnVmZmVyKGJhc2U2NFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuZnVuY3Rpb24gdWNzMldyaXRlIChidWYsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgcmV0dXJuIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nLCBidWYubGVuZ3RoIC0gb2Zmc2V0KSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZSA9IGZ1bmN0aW9uIHdyaXRlIChzdHJpbmcsIG9mZnNldCwgbGVuZ3RoLCBlbmNvZGluZykge1xuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nKVxuICBpZiAob2Zmc2V0ID09PSB1bmRlZmluZWQpIHtcbiAgICBlbmNvZGluZyA9ICd1dGY4J1xuICAgIGxlbmd0aCA9IHRoaXMubGVuZ3RoXG4gICAgb2Zmc2V0ID0gMFxuICAvLyBCdWZmZXIjd3JpdGUoc3RyaW5nLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmIChsZW5ndGggPT09IHVuZGVmaW5lZCAmJiB0eXBlb2Ygb2Zmc2V0ID09PSAnc3RyaW5nJykge1xuICAgIGVuY29kaW5nID0gb2Zmc2V0XG4gICAgbGVuZ3RoID0gdGhpcy5sZW5ndGhcbiAgICBvZmZzZXQgPSAwXG4gIC8vIEJ1ZmZlciN3cml0ZShzdHJpbmcsIG9mZnNldFssIGxlbmd0aF1bLCBlbmNvZGluZ10pXG4gIH0gZWxzZSBpZiAoaXNGaW5pdGUob2Zmc2V0KSkge1xuICAgIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICAgIGlmIChpc0Zpbml0ZShsZW5ndGgpKSB7XG4gICAgICBsZW5ndGggPSBsZW5ndGggPj4+IDBcbiAgICAgIGlmIChlbmNvZGluZyA9PT0gdW5kZWZpbmVkKSBlbmNvZGluZyA9ICd1dGY4J1xuICAgIH0gZWxzZSB7XG4gICAgICBlbmNvZGluZyA9IGxlbmd0aFxuICAgICAgbGVuZ3RoID0gdW5kZWZpbmVkXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICdCdWZmZXIud3JpdGUoc3RyaW5nLCBlbmNvZGluZywgb2Zmc2V0WywgbGVuZ3RoXSkgaXMgbm8gbG9uZ2VyIHN1cHBvcnRlZCdcbiAgICApXG4gIH1cblxuICB2YXIgcmVtYWluaW5nID0gdGhpcy5sZW5ndGggLSBvZmZzZXRcbiAgaWYgKGxlbmd0aCA9PT0gdW5kZWZpbmVkIHx8IGxlbmd0aCA+IHJlbWFpbmluZykgbGVuZ3RoID0gcmVtYWluaW5nXG5cbiAgaWYgKChzdHJpbmcubGVuZ3RoID4gMCAmJiAobGVuZ3RoIDwgMCB8fCBvZmZzZXQgPCAwKSkgfHwgb2Zmc2V0ID4gdGhpcy5sZW5ndGgpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignQXR0ZW1wdCB0byB3cml0ZSBvdXRzaWRlIGJ1ZmZlciBib3VuZHMnKVxuICB9XG5cbiAgaWYgKCFlbmNvZGluZykgZW5jb2RpbmcgPSAndXRmOCdcblxuICB2YXIgbG93ZXJlZENhc2UgPSBmYWxzZVxuICBmb3IgKDs7KSB7XG4gICAgc3dpdGNoIChlbmNvZGluZykge1xuICAgICAgY2FzZSAnaGV4JzpcbiAgICAgICAgcmV0dXJuIGhleFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ3V0ZjgnOlxuICAgICAgY2FzZSAndXRmLTgnOlxuICAgICAgICByZXR1cm4gdXRmOFdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG5cbiAgICAgIGNhc2UgJ2FzY2lpJzpcbiAgICAgICAgcmV0dXJuIGFzY2lpV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAnbGF0aW4xJzpcbiAgICAgIGNhc2UgJ2JpbmFyeSc6XG4gICAgICAgIHJldHVybiBsYXRpbjFXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBjYXNlICdiYXNlNjQnOlxuICAgICAgICAvLyBXYXJuaW5nOiBtYXhMZW5ndGggbm90IHRha2VuIGludG8gYWNjb3VudCBpbiBiYXNlNjRXcml0ZVxuICAgICAgICByZXR1cm4gYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcblxuICAgICAgY2FzZSAndWNzMic6XG4gICAgICBjYXNlICd1Y3MtMic6XG4gICAgICBjYXNlICd1dGYxNmxlJzpcbiAgICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgICAgcmV0dXJuIHVjczJXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBpZiAobG93ZXJlZENhc2UpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Vua25vd24gZW5jb2Rpbmc6ICcgKyBlbmNvZGluZylcbiAgICAgICAgZW5jb2RpbmcgPSAoJycgKyBlbmNvZGluZykudG9Mb3dlckNhc2UoKVxuICAgICAgICBsb3dlcmVkQ2FzZSA9IHRydWVcbiAgICB9XG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS50b0pTT04gPSBmdW5jdGlvbiB0b0pTT04gKCkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdCdWZmZXInLFxuICAgIGRhdGE6IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKHRoaXMuX2FyciB8fCB0aGlzLCAwKVxuICB9XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKHN0YXJ0ID09PSAwICYmIGVuZCA9PT0gYnVmLmxlbmd0aCkge1xuICAgIHJldHVybiBiYXNlNjQuZnJvbUJ5dGVBcnJheShidWYpXG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1Zi5zbGljZShzdGFydCwgZW5kKSlcbiAgfVxufVxuXG5mdW5jdGlvbiB1dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBlbmQgPSBNYXRoLm1pbihidWYubGVuZ3RoLCBlbmQpXG4gIHZhciByZXMgPSBbXVxuXG4gIHZhciBpID0gc3RhcnRcbiAgd2hpbGUgKGkgPCBlbmQpIHtcbiAgICB2YXIgZmlyc3RCeXRlID0gYnVmW2ldXG4gICAgdmFyIGNvZGVQb2ludCA9IG51bGxcbiAgICB2YXIgYnl0ZXNQZXJTZXF1ZW5jZSA9IChmaXJzdEJ5dGUgPiAweEVGKSA/IDRcbiAgICAgIDogKGZpcnN0Qnl0ZSA+IDB4REYpID8gM1xuICAgICAgOiAoZmlyc3RCeXRlID4gMHhCRikgPyAyXG4gICAgICA6IDFcblxuICAgIGlmIChpICsgYnl0ZXNQZXJTZXF1ZW5jZSA8PSBlbmQpIHtcbiAgICAgIHZhciBzZWNvbmRCeXRlLCB0aGlyZEJ5dGUsIGZvdXJ0aEJ5dGUsIHRlbXBDb2RlUG9pbnRcblxuICAgICAgc3dpdGNoIChieXRlc1BlclNlcXVlbmNlKSB7XG4gICAgICAgIGNhc2UgMTpcbiAgICAgICAgICBpZiAoZmlyc3RCeXRlIDwgMHg4MCkge1xuICAgICAgICAgICAgY29kZVBvaW50ID0gZmlyc3RCeXRlXG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMjpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4MUYpIDw8IDB4NiB8IChzZWNvbmRCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHg3Rikge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgMzpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBpZiAoKHNlY29uZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAodGhpcmRCeXRlICYgMHhDMCkgPT09IDB4ODApIHtcbiAgICAgICAgICAgIHRlbXBDb2RlUG9pbnQgPSAoZmlyc3RCeXRlICYgMHhGKSA8PCAweEMgfCAoc2Vjb25kQnl0ZSAmIDB4M0YpIDw8IDB4NiB8ICh0aGlyZEJ5dGUgJiAweDNGKVxuICAgICAgICAgICAgaWYgKHRlbXBDb2RlUG9pbnQgPiAweDdGRiAmJiAodGVtcENvZGVQb2ludCA8IDB4RDgwMCB8fCB0ZW1wQ29kZVBvaW50ID4gMHhERkZGKSkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrXG4gICAgICAgIGNhc2UgNDpcbiAgICAgICAgICBzZWNvbmRCeXRlID0gYnVmW2kgKyAxXVxuICAgICAgICAgIHRoaXJkQnl0ZSA9IGJ1ZltpICsgMl1cbiAgICAgICAgICBmb3VydGhCeXRlID0gYnVmW2kgKyAzXVxuICAgICAgICAgIGlmICgoc2Vjb25kQnl0ZSAmIDB4QzApID09PSAweDgwICYmICh0aGlyZEJ5dGUgJiAweEMwKSA9PT0gMHg4MCAmJiAoZm91cnRoQnl0ZSAmIDB4QzApID09PSAweDgwKSB7XG4gICAgICAgICAgICB0ZW1wQ29kZVBvaW50ID0gKGZpcnN0Qnl0ZSAmIDB4RikgPDwgMHgxMiB8IChzZWNvbmRCeXRlICYgMHgzRikgPDwgMHhDIHwgKHRoaXJkQnl0ZSAmIDB4M0YpIDw8IDB4NiB8IChmb3VydGhCeXRlICYgMHgzRilcbiAgICAgICAgICAgIGlmICh0ZW1wQ29kZVBvaW50ID4gMHhGRkZGICYmIHRlbXBDb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgICAgICAgICBjb2RlUG9pbnQgPSB0ZW1wQ29kZVBvaW50XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChjb2RlUG9pbnQgPT09IG51bGwpIHtcbiAgICAgIC8vIHdlIGRpZCBub3QgZ2VuZXJhdGUgYSB2YWxpZCBjb2RlUG9pbnQgc28gaW5zZXJ0IGFcbiAgICAgIC8vIHJlcGxhY2VtZW50IGNoYXIgKFUrRkZGRCkgYW5kIGFkdmFuY2Ugb25seSAxIGJ5dGVcbiAgICAgIGNvZGVQb2ludCA9IDB4RkZGRFxuICAgICAgYnl0ZXNQZXJTZXF1ZW5jZSA9IDFcbiAgICB9IGVsc2UgaWYgKGNvZGVQb2ludCA+IDB4RkZGRikge1xuICAgICAgLy8gZW5jb2RlIHRvIHV0ZjE2IChzdXJyb2dhdGUgcGFpciBkYW5jZSlcbiAgICAgIGNvZGVQb2ludCAtPSAweDEwMDAwXG4gICAgICByZXMucHVzaChjb2RlUG9pbnQgPj4+IDEwICYgMHgzRkYgfCAweEQ4MDApXG4gICAgICBjb2RlUG9pbnQgPSAweERDMDAgfCBjb2RlUG9pbnQgJiAweDNGRlxuICAgIH1cblxuICAgIHJlcy5wdXNoKGNvZGVQb2ludClcbiAgICBpICs9IGJ5dGVzUGVyU2VxdWVuY2VcbiAgfVxuXG4gIHJldHVybiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkocmVzKVxufVxuXG4vLyBCYXNlZCBvbiBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vYS8yMjc0NzI3Mi82ODA3NDIsIHRoZSBicm93c2VyIHdpdGhcbi8vIHRoZSBsb3dlc3QgbGltaXQgaXMgQ2hyb21lLCB3aXRoIDB4MTAwMDAgYXJncy5cbi8vIFdlIGdvIDEgbWFnbml0dWRlIGxlc3MsIGZvciBzYWZldHlcbnZhciBNQVhfQVJHVU1FTlRTX0xFTkdUSCA9IDB4MTAwMFxuXG5mdW5jdGlvbiBkZWNvZGVDb2RlUG9pbnRzQXJyYXkgKGNvZGVQb2ludHMpIHtcbiAgdmFyIGxlbiA9IGNvZGVQb2ludHMubGVuZ3RoXG4gIGlmIChsZW4gPD0gTUFYX0FSR1VNRU5UU19MRU5HVEgpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZS5hcHBseShTdHJpbmcsIGNvZGVQb2ludHMpIC8vIGF2b2lkIGV4dHJhIHNsaWNlKClcbiAgfVxuXG4gIC8vIERlY29kZSBpbiBjaHVua3MgdG8gYXZvaWQgXCJjYWxsIHN0YWNrIHNpemUgZXhjZWVkZWRcIi5cbiAgdmFyIHJlcyA9ICcnXG4gIHZhciBpID0gMFxuICB3aGlsZSAoaSA8IGxlbikge1xuICAgIHJlcyArPSBTdHJpbmcuZnJvbUNoYXJDb2RlLmFwcGx5KFxuICAgICAgU3RyaW5nLFxuICAgICAgY29kZVBvaW50cy5zbGljZShpLCBpICs9IE1BWF9BUkdVTUVOVFNfTEVOR1RIKVxuICAgIClcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgKytpKSB7XG4gICAgcmV0ICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnVmW2ldICYgMHg3RilcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGxhdGluMVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHJldCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7ICsraSkge1xuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbmZ1bmN0aW9uIGhleFNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcblxuICBpZiAoIXN0YXJ0IHx8IHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIGlmICghZW5kIHx8IGVuZCA8IDAgfHwgZW5kID4gbGVuKSBlbmQgPSBsZW5cblxuICB2YXIgb3V0ID0gJydcbiAgZm9yICh2YXIgaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICBvdXQgKz0gdG9IZXgoYnVmW2ldKVxuICB9XG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyAoYnl0ZXNbaSArIDFdICogMjU2KSlcbiAgfVxuICByZXR1cm4gcmVzXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUuc2xpY2UgPSBmdW5jdGlvbiBzbGljZSAoc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gdGhpcy5sZW5ndGhcbiAgc3RhcnQgPSB+fnN0YXJ0XG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gbGVuIDogfn5lbmRcblxuICBpZiAoc3RhcnQgPCAwKSB7XG4gICAgc3RhcnQgKz0gbGVuXG4gICAgaWYgKHN0YXJ0IDwgMCkgc3RhcnQgPSAwXG4gIH0gZWxzZSBpZiAoc3RhcnQgPiBsZW4pIHtcbiAgICBzdGFydCA9IGxlblxuICB9XG5cbiAgaWYgKGVuZCA8IDApIHtcbiAgICBlbmQgKz0gbGVuXG4gICAgaWYgKGVuZCA8IDApIGVuZCA9IDBcbiAgfSBlbHNlIGlmIChlbmQgPiBsZW4pIHtcbiAgICBlbmQgPSBsZW5cbiAgfVxuXG4gIGlmIChlbmQgPCBzdGFydCkgZW5kID0gc3RhcnRcblxuICB2YXIgbmV3QnVmID0gdGhpcy5zdWJhcnJheShzdGFydCwgZW5kKVxuICAvLyBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZVxuICBuZXdCdWYuX19wcm90b19fID0gQnVmZmVyLnByb3RvdHlwZVxuICByZXR1cm4gbmV3QnVmXG59XG5cbi8qXG4gKiBOZWVkIHRvIG1ha2Ugc3VyZSB0aGF0IGJ1ZmZlciBpc24ndCB0cnlpbmcgdG8gd3JpdGUgb3V0IG9mIGJvdW5kcy5cbiAqL1xuZnVuY3Rpb24gY2hlY2tPZmZzZXQgKG9mZnNldCwgZXh0LCBsZW5ndGgpIHtcbiAgaWYgKChvZmZzZXQgJSAxKSAhPT0gMCB8fCBvZmZzZXQgPCAwKSB0aHJvdyBuZXcgUmFuZ2VFcnJvcignb2Zmc2V0IGlzIG5vdCB1aW50JylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1RyeWluZyB0byBhY2Nlc3MgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50TEUgPSBmdW5jdGlvbiByZWFkVUludExFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciB2YWwgPSB0aGlzW29mZnNldF1cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgdmFsICs9IHRoaXNbb2Zmc2V0ICsgaV0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludEJFID0gZnVuY3Rpb24gcmVhZFVJbnRCRSAob2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG4gIH1cblxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWJ5dGVMZW5ndGhdXG4gIHZhciBtdWwgPSAxXG4gIHdoaWxlIChieXRlTGVuZ3RoID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0tYnl0ZUxlbmd0aF0gKiBtdWxcbiAgfVxuXG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiByZWFkVUludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiByZWFkVUludDE2TEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMiwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiB0aGlzW29mZnNldF0gfCAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRVSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRVSW50MTZCRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuICh0aGlzW29mZnNldF0gPDwgOCkgfCB0aGlzW29mZnNldCArIDFdXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZFVJbnQzMkxFID0gZnVuY3Rpb24gcmVhZFVJbnQzMkxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAoKHRoaXNbb2Zmc2V0XSkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgOCkgfFxuICAgICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpKSArXG4gICAgICAodGhpc1tvZmZzZXQgKyAzXSAqIDB4MTAwMDAwMClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiByZWFkVUludDMyQkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0gKiAweDEwMDAwMDApICtcbiAgICAoKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgdGhpc1tvZmZzZXQgKyAzXSlcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50TEUgPSBmdW5jdGlvbiByZWFkSW50TEUgKG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGJ5dGVMZW5ndGggPSBieXRlTGVuZ3RoID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgYnl0ZUxlbmd0aCwgdGhpcy5sZW5ndGgpXG5cbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XVxuICB2YXIgbXVsID0gMVxuICB2YXIgaSA9IDBcbiAgd2hpbGUgKCsraSA8IGJ5dGVMZW5ndGggJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB2YWwgKz0gdGhpc1tvZmZzZXQgKyBpXSAqIG11bFxuICB9XG4gIG11bCAqPSAweDgwXG5cbiAgaWYgKHZhbCA+PSBtdWwpIHZhbCAtPSBNYXRoLnBvdygyLCA4ICogYnl0ZUxlbmd0aClcblxuICByZXR1cm4gdmFsXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludEJFID0gZnVuY3Rpb24gcmVhZEludEJFIChvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIGJ5dGVMZW5ndGgsIHRoaXMubGVuZ3RoKVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aFxuICB2YXIgbXVsID0gMVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAtLWldXG4gIHdoaWxlIChpID4gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHZhbCArPSB0aGlzW29mZnNldCArIC0taV0gKiBtdWxcbiAgfVxuICBtdWwgKj0gMHg4MFxuXG4gIGlmICh2YWwgPj0gbXVsKSB2YWwgLT0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpXG5cbiAgcmV0dXJuIHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQ4ID0gZnVuY3Rpb24gcmVhZEludDggKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgMSwgdGhpcy5sZW5ndGgpXG4gIGlmICghKHRoaXNbb2Zmc2V0XSAmIDB4ODApKSByZXR1cm4gKHRoaXNbb2Zmc2V0XSlcbiAgcmV0dXJuICgoMHhmZiAtIHRoaXNbb2Zmc2V0XSArIDEpICogLTEpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2TEUgPSBmdW5jdGlvbiByZWFkSW50MTZMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCAyLCB0aGlzLmxlbmd0aClcbiAgdmFyIHZhbCA9IHRoaXNbb2Zmc2V0XSB8ICh0aGlzW29mZnNldCArIDFdIDw8IDgpXG4gIHJldHVybiAodmFsICYgMHg4MDAwKSA/IHZhbCB8IDB4RkZGRjAwMDAgOiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZCRSA9IGZ1bmN0aW9uIHJlYWRJbnQxNkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDIsIHRoaXMubGVuZ3RoKVxuICB2YXIgdmFsID0gdGhpc1tvZmZzZXQgKyAxXSB8ICh0aGlzW29mZnNldF0gPDwgOClcbiAgcmV0dXJuICh2YWwgJiAweDgwMDApID8gdmFsIHwgMHhGRkZGMDAwMCA6IHZhbFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRJbnQzMkxFID0gZnVuY3Rpb24gcmVhZEludDMyTEUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG5cbiAgcmV0dXJuICh0aGlzW29mZnNldF0pIHxcbiAgICAodGhpc1tvZmZzZXQgKyAxXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMl0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAzXSA8PCAyNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJCRSA9IGZ1bmN0aW9uIHJlYWRJbnQzMkJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDQsIHRoaXMubGVuZ3RoKVxuXG4gIHJldHVybiAodGhpc1tvZmZzZXRdIDw8IDI0KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgMV0gPDwgMTYpIHxcbiAgICAodGhpc1tvZmZzZXQgKyAyXSA8PCA4KSB8XG4gICAgKHRoaXNbb2Zmc2V0ICsgM10pXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEZsb2F0TEUgPSBmdW5jdGlvbiByZWFkRmxvYXRMRSAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tPZmZzZXQob2Zmc2V0LCA0LCB0aGlzLmxlbmd0aClcbiAgcmV0dXJuIGllZWU3NTQucmVhZCh0aGlzLCBvZmZzZXQsIHRydWUsIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdEJFID0gZnVuY3Rpb24gcmVhZEZsb2F0QkUgKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrT2Zmc2V0KG9mZnNldCwgNCwgdGhpcy5sZW5ndGgpXG4gIHJldHVybiBpZWVlNzU0LnJlYWQodGhpcywgb2Zmc2V0LCBmYWxzZSwgMjMsIDQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUxFID0gZnVuY3Rpb24gcmVhZERvdWJsZUxFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgdHJ1ZSwgNTIsIDgpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZERvdWJsZUJFID0gZnVuY3Rpb24gcmVhZERvdWJsZUJFIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja09mZnNldChvZmZzZXQsIDgsIHRoaXMubGVuZ3RoKVxuICByZXR1cm4gaWVlZTc1NC5yZWFkKHRoaXMsIG9mZnNldCwgZmFsc2UsIDUyLCA4KVxufVxuXG5mdW5jdGlvbiBjaGVja0ludCAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBleHQsIG1heCwgbWluKSB7XG4gIGlmICghQnVmZmVyLmlzQnVmZmVyKGJ1ZikpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1wiYnVmZmVyXCIgYXJndW1lbnQgbXVzdCBiZSBhIEJ1ZmZlciBpbnN0YW5jZScpXG4gIGlmICh2YWx1ZSA+IG1heCB8fCB2YWx1ZSA8IG1pbikgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1widmFsdWVcIiBhcmd1bWVudCBpcyBvdXQgb2YgYm91bmRzJylcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludExFID0gZnVuY3Rpb24gd3JpdGVVSW50TEUgKHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBieXRlTGVuZ3RoID0gYnl0ZUxlbmd0aCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgdmFyIG1heEJ5dGVzID0gTWF0aC5wb3coMiwgOCAqIGJ5dGVMZW5ndGgpIC0gMVxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIG1heEJ5dGVzLCAwKVxuICB9XG5cbiAgdmFyIG11bCA9IDFcbiAgdmFyIGkgPSAwXG4gIHRoaXNbb2Zmc2V0XSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoKytpIDwgYnl0ZUxlbmd0aCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAodmFsdWUgLyBtdWwpICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnRCRSA9IGZ1bmN0aW9uIHdyaXRlVUludEJFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgYnl0ZUxlbmd0aCA9IGJ5dGVMZW5ndGggPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBtYXhCeXRlcyA9IE1hdGgucG93KDIsIDggKiBieXRlTGVuZ3RoKSAtIDFcbiAgICBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBtYXhCeXRlcywgMClcbiAgfVxuXG4gIHZhciBpID0gYnl0ZUxlbmd0aCAtIDFcbiAgdmFyIG11bCA9IDFcbiAgdGhpc1tvZmZzZXQgKyBpXSA9IHZhbHVlICYgMHhGRlxuICB3aGlsZSAoLS1pID49IDAgJiYgKG11bCAqPSAweDEwMCkpIHtcbiAgICB0aGlzW29mZnNldCArIGldID0gKHZhbHVlIC8gbXVsKSAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50OCA9IGZ1bmN0aW9uIHdyaXRlVUludDggKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAxLCAweGZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2TEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQxNkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMiwgMHhmZmZmLCAwKVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMlxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgdGhpc1tvZmZzZXQgKyAzXSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDFdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZVVJbnQzMkJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHhmZmZmZmZmZiwgMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlID4+PiAyNClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gMTYpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgM10gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50TEUgPSBmdW5jdGlvbiB3cml0ZUludExFICh2YWx1ZSwgb2Zmc2V0LCBieXRlTGVuZ3RoLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIHZhciBsaW1pdCA9IE1hdGgucG93KDIsICg4ICogYnl0ZUxlbmd0aCkgLSAxKVxuXG4gICAgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbGltaXQgLSAxLCAtbGltaXQpXG4gIH1cblxuICB2YXIgaSA9IDBcbiAgdmFyIG11bCA9IDFcbiAgdmFyIHN1YiA9IDBcbiAgdGhpc1tvZmZzZXRdID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgrK2kgPCBieXRlTGVuZ3RoICYmIChtdWwgKj0gMHgxMDApKSB7XG4gICAgaWYgKHZhbHVlIDwgMCAmJiBzdWIgPT09IDAgJiYgdGhpc1tvZmZzZXQgKyBpIC0gMV0gIT09IDApIHtcbiAgICAgIHN1YiA9IDFcbiAgICB9XG4gICAgdGhpc1tvZmZzZXQgKyBpXSA9ICgodmFsdWUgLyBtdWwpID4+IDApIC0gc3ViICYgMHhGRlxuICB9XG5cbiAgcmV0dXJuIG9mZnNldCArIGJ5dGVMZW5ndGhcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludEJFID0gZnVuY3Rpb24gd3JpdGVJbnRCRSAodmFsdWUsIG9mZnNldCwgYnl0ZUxlbmd0aCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICB2YXIgbGltaXQgPSBNYXRoLnBvdygyLCAoOCAqIGJ5dGVMZW5ndGgpIC0gMSlcblxuICAgIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGJ5dGVMZW5ndGgsIGxpbWl0IC0gMSwgLWxpbWl0KVxuICB9XG5cbiAgdmFyIGkgPSBieXRlTGVuZ3RoIC0gMVxuICB2YXIgbXVsID0gMVxuICB2YXIgc3ViID0gMFxuICB0aGlzW29mZnNldCArIGldID0gdmFsdWUgJiAweEZGXG4gIHdoaWxlICgtLWkgPj0gMCAmJiAobXVsICo9IDB4MTAwKSkge1xuICAgIGlmICh2YWx1ZSA8IDAgJiYgc3ViID09PSAwICYmIHRoaXNbb2Zmc2V0ICsgaSArIDFdICE9PSAwKSB7XG4gICAgICBzdWIgPSAxXG4gICAgfVxuICAgIHRoaXNbb2Zmc2V0ICsgaV0gPSAoKHZhbHVlIC8gbXVsKSA+PiAwKSAtIHN1YiAmIDB4RkZcbiAgfVxuXG4gIHJldHVybiBvZmZzZXQgKyBieXRlTGVuZ3RoXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQ4ID0gZnVuY3Rpb24gd3JpdGVJbnQ4ICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgMSwgMHg3ZiwgLTB4ODApXG4gIGlmICh2YWx1ZSA8IDApIHZhbHVlID0gMHhmZiArIHZhbHVlICsgMVxuICB0aGlzW29mZnNldF0gPSAodmFsdWUgJiAweGZmKVxuICByZXR1cm4gb2Zmc2V0ICsgMVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZMRSA9IGZ1bmN0aW9uIHdyaXRlSW50MTZMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIGNoZWNrSW50KHRoaXMsIHZhbHVlLCBvZmZzZXQsIDIsIDB4N2ZmZiwgLTB4ODAwMClcbiAgdGhpc1tvZmZzZXRdID0gKHZhbHVlICYgMHhmZilcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSA+Pj4gOClcbiAgcmV0dXJuIG9mZnNldCArIDJcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDE2QkUgPSBmdW5jdGlvbiB3cml0ZUludDE2QkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCAyLCAweDdmZmYsIC0weDgwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gOClcbiAgdGhpc1tvZmZzZXQgKyAxXSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHJldHVybiBvZmZzZXQgKyAyXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkxFID0gZnVuY3Rpb24gd3JpdGVJbnQzMkxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkgY2hlY2tJbnQodGhpcywgdmFsdWUsIG9mZnNldCwgNCwgMHg3ZmZmZmZmZiwgLTB4ODAwMDAwMDApXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSAmIDB4ZmYpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDgpXG4gIHRoaXNbb2Zmc2V0ICsgMl0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlID4+PiAyNClcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyQkUgPSBmdW5jdGlvbiB3cml0ZUludDMyQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHZhbHVlID0gK3ZhbHVlXG4gIG9mZnNldCA9IG9mZnNldCA+Pj4gMFxuICBpZiAoIW5vQXNzZXJ0KSBjaGVja0ludCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCA0LCAweDdmZmZmZmZmLCAtMHg4MDAwMDAwMClcbiAgaWYgKHZhbHVlIDwgMCkgdmFsdWUgPSAweGZmZmZmZmZmICsgdmFsdWUgKyAxXG4gIHRoaXNbb2Zmc2V0XSA9ICh2YWx1ZSA+Pj4gMjQpXG4gIHRoaXNbb2Zmc2V0ICsgMV0gPSAodmFsdWUgPj4+IDE2KVxuICB0aGlzW29mZnNldCArIDJdID0gKHZhbHVlID4+PiA4KVxuICB0aGlzW29mZnNldCArIDNdID0gKHZhbHVlICYgMHhmZilcbiAgcmV0dXJuIG9mZnNldCArIDRcbn1cblxuZnVuY3Rpb24gY2hlY2tJRUVFNzU0IChidWYsIHZhbHVlLCBvZmZzZXQsIGV4dCwgbWF4LCBtaW4pIHtcbiAgaWYgKG9mZnNldCArIGV4dCA+IGJ1Zi5sZW5ndGgpIHRocm93IG5ldyBSYW5nZUVycm9yKCdJbmRleCBvdXQgb2YgcmFuZ2UnKVxuICBpZiAob2Zmc2V0IDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ0luZGV4IG91dCBvZiByYW5nZScpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICB2YWx1ZSA9ICt2YWx1ZVxuICBvZmZzZXQgPSBvZmZzZXQgPj4+IDBcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGNoZWNrSUVFRTc1NChidWYsIHZhbHVlLCBvZmZzZXQsIDQsIDMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgsIC0zLjQwMjgyMzQ2NjM4NTI4ODZlKzM4KVxuICB9XG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxuICByZXR1cm4gb2Zmc2V0ICsgNFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRmxvYXRMRSA9IGZ1bmN0aW9uIHdyaXRlRmxvYXRMRSAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIHdyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gd3JpdGVGbG9hdEJFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVGbG9hdCh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIHdyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgdmFsdWUgPSArdmFsdWVcbiAgb2Zmc2V0ID0gb2Zmc2V0ID4+PiAwXG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBjaGVja0lFRUU3NTQoYnVmLCB2YWx1ZSwgb2Zmc2V0LCA4LCAxLjc5NzY5MzEzNDg2MjMxNTdFKzMwOCwgLTEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4KVxuICB9XG4gIGllZWU3NTQud3JpdGUoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxuICByZXR1cm4gb2Zmc2V0ICsgOFxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlRG91YmxlTEUgPSBmdW5jdGlvbiB3cml0ZURvdWJsZUxFICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gd3JpdGVEb3VibGUodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVEb3VibGVCRSA9IGZ1bmN0aW9uIHdyaXRlRG91YmxlQkUgKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiB3cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGNvcHkodGFyZ2V0QnVmZmVyLCB0YXJnZXRTdGFydD0wLCBzb3VyY2VTdGFydD0wLCBzb3VyY2VFbmQ9YnVmZmVyLmxlbmd0aClcbkJ1ZmZlci5wcm90b3R5cGUuY29weSA9IGZ1bmN0aW9uIGNvcHkgKHRhcmdldCwgdGFyZ2V0U3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgaWYgKCFzdGFydCkgc3RhcnQgPSAwXG4gIGlmICghZW5kICYmIGVuZCAhPT0gMCkgZW5kID0gdGhpcy5sZW5ndGhcbiAgaWYgKHRhcmdldFN0YXJ0ID49IHRhcmdldC5sZW5ndGgpIHRhcmdldFN0YXJ0ID0gdGFyZ2V0Lmxlbmd0aFxuICBpZiAoIXRhcmdldFN0YXJ0KSB0YXJnZXRTdGFydCA9IDBcbiAgaWYgKGVuZCA+IDAgJiYgZW5kIDwgc3RhcnQpIGVuZCA9IHN0YXJ0XG5cbiAgLy8gQ29weSAwIGJ5dGVzOyB3ZSdyZSBkb25lXG4gIGlmIChlbmQgPT09IHN0YXJ0KSByZXR1cm4gMFxuICBpZiAodGFyZ2V0Lmxlbmd0aCA9PT0gMCB8fCB0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIDBcblxuICAvLyBGYXRhbCBlcnJvciBjb25kaXRpb25zXG4gIGlmICh0YXJnZXRTdGFydCA8IDApIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcigndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIH1cbiAgaWYgKHN0YXJ0IDwgMCB8fCBzdGFydCA+PSB0aGlzLmxlbmd0aCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBpZiAoZW5kIDwgMCkgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ3NvdXJjZUVuZCBvdXQgb2YgYm91bmRzJylcblxuICAvLyBBcmUgd2Ugb29iP1xuICBpZiAoZW5kID4gdGhpcy5sZW5ndGgpIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0U3RhcnQgPCBlbmQgLSBzdGFydCkge1xuICAgIGVuZCA9IHRhcmdldC5sZW5ndGggLSB0YXJnZXRTdGFydCArIHN0YXJ0XG4gIH1cblxuICB2YXIgbGVuID0gZW5kIC0gc3RhcnRcbiAgdmFyIGlcblxuICBpZiAodGhpcyA9PT0gdGFyZ2V0ICYmIHN0YXJ0IDwgdGFyZ2V0U3RhcnQgJiYgdGFyZ2V0U3RhcnQgPCBlbmQpIHtcbiAgICAvLyBkZXNjZW5kaW5nIGNvcHkgZnJvbSBlbmRcbiAgICBmb3IgKGkgPSBsZW4gLSAxOyBpID49IDA7IC0taSkge1xuICAgICAgdGFyZ2V0W2kgKyB0YXJnZXRTdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgICB9XG4gIH0gZWxzZSBpZiAobGVuIDwgMTAwMCkge1xuICAgIC8vIGFzY2VuZGluZyBjb3B5IGZyb20gc3RhcnRcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgIHRhcmdldFtpICsgdGFyZ2V0U3RhcnRdID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICB9IGVsc2Uge1xuICAgIFVpbnQ4QXJyYXkucHJvdG90eXBlLnNldC5jYWxsKFxuICAgICAgdGFyZ2V0LFxuICAgICAgdGhpcy5zdWJhcnJheShzdGFydCwgc3RhcnQgKyBsZW4pLFxuICAgICAgdGFyZ2V0U3RhcnRcbiAgICApXG4gIH1cblxuICByZXR1cm4gbGVuXG59XG5cbi8vIFVzYWdlOlxuLy8gICAgYnVmZmVyLmZpbGwobnVtYmVyWywgb2Zmc2V0WywgZW5kXV0pXG4vLyAgICBidWZmZXIuZmlsbChidWZmZXJbLCBvZmZzZXRbLCBlbmRdXSlcbi8vICAgIGJ1ZmZlci5maWxsKHN0cmluZ1ssIG9mZnNldFssIGVuZF1dWywgZW5jb2RpbmddKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gZmlsbCAodmFsLCBzdGFydCwgZW5kLCBlbmNvZGluZykge1xuICAvLyBIYW5kbGUgc3RyaW5nIGNhc2VzOlxuICBpZiAodHlwZW9mIHZhbCA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAodHlwZW9mIHN0YXJ0ID09PSAnc3RyaW5nJykge1xuICAgICAgZW5jb2RpbmcgPSBzdGFydFxuICAgICAgc3RhcnQgPSAwXG4gICAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGVuZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVuY29kaW5nID0gZW5kXG4gICAgICBlbmQgPSB0aGlzLmxlbmd0aFxuICAgIH1cbiAgICBpZiAodmFsLmxlbmd0aCA9PT0gMSkge1xuICAgICAgdmFyIGNvZGUgPSB2YWwuY2hhckNvZGVBdCgwKVxuICAgICAgaWYgKGNvZGUgPCAyNTYpIHtcbiAgICAgICAgdmFsID0gY29kZVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAoZW5jb2RpbmcgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgZW5jb2RpbmcgIT09ICdzdHJpbmcnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdlbmNvZGluZyBtdXN0IGJlIGEgc3RyaW5nJylcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBlbmNvZGluZyA9PT0gJ3N0cmluZycgJiYgIUJ1ZmZlci5pc0VuY29kaW5nKGVuY29kaW5nKSkge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5rbm93biBlbmNvZGluZzogJyArIGVuY29kaW5nKVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIHZhbCA9IHZhbCAmIDI1NVxuICB9XG5cbiAgLy8gSW52YWxpZCByYW5nZXMgYXJlIG5vdCBzZXQgdG8gYSBkZWZhdWx0LCBzbyBjYW4gcmFuZ2UgY2hlY2sgZWFybHkuXG4gIGlmIChzdGFydCA8IDAgfHwgdGhpcy5sZW5ndGggPCBzdGFydCB8fCB0aGlzLmxlbmd0aCA8IGVuZCkge1xuICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdPdXQgb2YgcmFuZ2UgaW5kZXgnKVxuICB9XG5cbiAgaWYgKGVuZCA8PSBzdGFydCkge1xuICAgIHJldHVybiB0aGlzXG4gIH1cblxuICBzdGFydCA9IHN0YXJ0ID4+PiAwXG4gIGVuZCA9IGVuZCA9PT0gdW5kZWZpbmVkID8gdGhpcy5sZW5ndGggOiBlbmQgPj4+IDBcblxuICBpZiAoIXZhbCkgdmFsID0gMFxuXG4gIHZhciBpXG4gIGlmICh0eXBlb2YgdmFsID09PSAnbnVtYmVyJykge1xuICAgIGZvciAoaSA9IHN0YXJ0OyBpIDwgZW5kOyArK2kpIHtcbiAgICAgIHRoaXNbaV0gPSB2YWxcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdmFyIGJ5dGVzID0gQnVmZmVyLmlzQnVmZmVyKHZhbClcbiAgICAgID8gdmFsXG4gICAgICA6IG5ldyBCdWZmZXIodmFsLCBlbmNvZGluZylcbiAgICB2YXIgbGVuID0gYnl0ZXMubGVuZ3RoXG4gICAgZm9yIChpID0gMDsgaSA8IGVuZCAtIHN0YXJ0OyArK2kpIHtcbiAgICAgIHRoaXNbaSArIHN0YXJ0XSA9IGJ5dGVzW2kgJSBsZW5dXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXNcbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG52YXIgSU5WQUxJRF9CQVNFNjRfUkUgPSAvW14rLzAtOUEtWmEtei1fXS9nXG5cbmZ1bmN0aW9uIGJhc2U2NGNsZWFuIChzdHIpIHtcbiAgLy8gTm9kZSBzdHJpcHMgb3V0IGludmFsaWQgY2hhcmFjdGVycyBsaWtlIFxcbiBhbmQgXFx0IGZyb20gdGhlIHN0cmluZywgYmFzZTY0LWpzIGRvZXMgbm90XG4gIHN0ciA9IHN0ci50cmltKCkucmVwbGFjZShJTlZBTElEX0JBU0U2NF9SRSwgJycpXG4gIC8vIE5vZGUgY29udmVydHMgc3RyaW5ncyB3aXRoIGxlbmd0aCA8IDIgdG8gJydcbiAgaWYgKHN0ci5sZW5ndGggPCAyKSByZXR1cm4gJydcbiAgLy8gTm9kZSBhbGxvd3MgZm9yIG5vbi1wYWRkZWQgYmFzZTY0IHN0cmluZ3MgKG1pc3NpbmcgdHJhaWxpbmcgPT09KSwgYmFzZTY0LWpzIGRvZXMgbm90XG4gIHdoaWxlIChzdHIubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgIHN0ciA9IHN0ciArICc9J1xuICB9XG4gIHJldHVybiBzdHJcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyaW5nLCB1bml0cykge1xuICB1bml0cyA9IHVuaXRzIHx8IEluZmluaXR5XG4gIHZhciBjb2RlUG9pbnRcbiAgdmFyIGxlbmd0aCA9IHN0cmluZy5sZW5ndGhcbiAgdmFyIGxlYWRTdXJyb2dhdGUgPSBudWxsXG4gIHZhciBieXRlcyA9IFtdXG5cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGNvZGVQb2ludCA9IHN0cmluZy5jaGFyQ29kZUF0KGkpXG5cbiAgICAvLyBpcyBzdXJyb2dhdGUgY29tcG9uZW50XG4gICAgaWYgKGNvZGVQb2ludCA+IDB4RDdGRiAmJiBjb2RlUG9pbnQgPCAweEUwMDApIHtcbiAgICAgIC8vIGxhc3QgY2hhciB3YXMgYSBsZWFkXG4gICAgICBpZiAoIWxlYWRTdXJyb2dhdGUpIHtcbiAgICAgICAgLy8gbm8gbGVhZCB5ZXRcbiAgICAgICAgaWYgKGNvZGVQb2ludCA+IDB4REJGRikge1xuICAgICAgICAgIC8vIHVuZXhwZWN0ZWQgdHJhaWxcbiAgICAgICAgICBpZiAoKHVuaXRzIC09IDMpID4gLTEpIGJ5dGVzLnB1c2goMHhFRiwgMHhCRiwgMHhCRClcbiAgICAgICAgICBjb250aW51ZVxuICAgICAgICB9IGVsc2UgaWYgKGkgKyAxID09PSBsZW5ndGgpIHtcbiAgICAgICAgICAvLyB1bnBhaXJlZCBsZWFkXG4gICAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgICAgY29udGludWVcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHZhbGlkIGxlYWRcbiAgICAgICAgbGVhZFN1cnJvZ2F0ZSA9IGNvZGVQb2ludFxuXG4gICAgICAgIGNvbnRpbnVlXG4gICAgICB9XG5cbiAgICAgIC8vIDIgbGVhZHMgaW4gYSByb3dcbiAgICAgIGlmIChjb2RlUG9pbnQgPCAweERDMDApIHtcbiAgICAgICAgaWYgKCh1bml0cyAtPSAzKSA+IC0xKSBieXRlcy5wdXNoKDB4RUYsIDB4QkYsIDB4QkQpXG4gICAgICAgIGxlYWRTdXJyb2dhdGUgPSBjb2RlUG9pbnRcbiAgICAgICAgY29udGludWVcbiAgICAgIH1cblxuICAgICAgLy8gdmFsaWQgc3Vycm9nYXRlIHBhaXJcbiAgICAgIGNvZGVQb2ludCA9IChsZWFkU3Vycm9nYXRlIC0gMHhEODAwIDw8IDEwIHwgY29kZVBvaW50IC0gMHhEQzAwKSArIDB4MTAwMDBcbiAgICB9IGVsc2UgaWYgKGxlYWRTdXJyb2dhdGUpIHtcbiAgICAgIC8vIHZhbGlkIGJtcCBjaGFyLCBidXQgbGFzdCBjaGFyIHdhcyBhIGxlYWRcbiAgICAgIGlmICgodW5pdHMgLT0gMykgPiAtMSkgYnl0ZXMucHVzaCgweEVGLCAweEJGLCAweEJEKVxuICAgIH1cblxuICAgIGxlYWRTdXJyb2dhdGUgPSBudWxsXG5cbiAgICAvLyBlbmNvZGUgdXRmOFxuICAgIGlmIChjb2RlUG9pbnQgPCAweDgwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDEpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goY29kZVBvaW50KVxuICAgIH0gZWxzZSBpZiAoY29kZVBvaW50IDwgMHg4MDApIHtcbiAgICAgIGlmICgodW5pdHMgLT0gMikgPCAwKSBicmVha1xuICAgICAgYnl0ZXMucHVzaChcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiB8IDB4QzAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDEwMDAwKSB7XG4gICAgICBpZiAoKHVuaXRzIC09IDMpIDwgMCkgYnJlYWtcbiAgICAgIGJ5dGVzLnB1c2goXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgfCAweEUwLFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHg2ICYgMHgzRiB8IDB4ODAsXG4gICAgICAgIGNvZGVQb2ludCAmIDB4M0YgfCAweDgwXG4gICAgICApXG4gICAgfSBlbHNlIGlmIChjb2RlUG9pbnQgPCAweDExMDAwMCkge1xuICAgICAgaWYgKCh1bml0cyAtPSA0KSA8IDApIGJyZWFrXG4gICAgICBieXRlcy5wdXNoKFxuICAgICAgICBjb2RlUG9pbnQgPj4gMHgxMiB8IDB4RjAsXG4gICAgICAgIGNvZGVQb2ludCA+PiAweEMgJiAweDNGIHwgMHg4MCxcbiAgICAgICAgY29kZVBvaW50ID4+IDB4NiAmIDB4M0YgfCAweDgwLFxuICAgICAgICBjb2RlUG9pbnQgJiAweDNGIHwgMHg4MFxuICAgICAgKVxuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgY29kZSBwb2ludCcpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVzXG59XG5cbmZ1bmN0aW9uIGFzY2lpVG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xuICAgIC8vIE5vZGUncyBjb2RlIHNlZW1zIHRvIGJlIGRvaW5nIHRoaXMgYW5kIG5vdCAmIDB4N0YuLlxuICAgIGJ5dGVBcnJheS5wdXNoKHN0ci5jaGFyQ29kZUF0KGkpICYgMHhGRilcbiAgfVxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIHV0ZjE2bGVUb0J5dGVzIChzdHIsIHVuaXRzKSB7XG4gIHZhciBjLCBoaSwgbG9cbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgKytpKSB7XG4gICAgaWYgKCh1bml0cyAtPSAyKSA8IDApIGJyZWFrXG5cbiAgICBjID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBoaSA9IGMgPj4gOFxuICAgIGxvID0gYyAlIDI1NlxuICAgIGJ5dGVBcnJheS5wdXNoKGxvKVxuICAgIGJ5dGVBcnJheS5wdXNoKGhpKVxuICB9XG5cbiAgcmV0dXJuIGJ5dGVBcnJheVxufVxuXG5mdW5jdGlvbiBiYXNlNjRUb0J5dGVzIChzdHIpIHtcbiAgcmV0dXJuIGJhc2U2NC50b0J5dGVBcnJheShiYXNlNjRjbGVhbihzdHIpKVxufVxuXG5mdW5jdGlvbiBibGl0QnVmZmVyIChzcmMsIGRzdCwgb2Zmc2V0LCBsZW5ndGgpIHtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7ICsraSkge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSkgYnJlYWtcbiAgICBkc3RbaSArIG9mZnNldF0gPSBzcmNbaV1cbiAgfVxuICByZXR1cm4gaVxufVxuXG4vLyBOb2RlIDAuMTAgc3VwcG9ydHMgYEFycmF5QnVmZmVyYCBidXQgbGFja3MgYEFycmF5QnVmZmVyLmlzVmlld2BcbmZ1bmN0aW9uIGlzQXJyYXlCdWZmZXJWaWV3IChvYmopIHtcbiAgcmV0dXJuICh0eXBlb2YgQXJyYXlCdWZmZXIuaXNWaWV3ID09PSAnZnVuY3Rpb24nKSAmJiBBcnJheUJ1ZmZlci5pc1ZpZXcob2JqKVxufVxuXG5mdW5jdGlvbiBudW1iZXJJc05hTiAob2JqKSB7XG4gIHJldHVybiBvYmogIT09IG9iaiAvLyBlc2xpbnQtZGlzYWJsZS1saW5lIG5vLXNlbGYtY29tcGFyZVxufVxuIiwiZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBuQml0cyA9IC03XG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcbiAgdmFyIGQgPSBpc0xFID8gLTEgOiAxXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcbiAgdmFyIGQgPSBpc0xFID8gMSA6IC0xXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxuLy8gY2FjaGVkIGZyb20gd2hhdGV2ZXIgZ2xvYmFsIGlzIHByZXNlbnQgc28gdGhhdCB0ZXN0IHJ1bm5lcnMgdGhhdCBzdHViIGl0XG4vLyBkb24ndCBicmVhayB0aGluZ3MuICBCdXQgd2UgbmVlZCB0byB3cmFwIGl0IGluIGEgdHJ5IGNhdGNoIGluIGNhc2UgaXQgaXNcbi8vIHdyYXBwZWQgaW4gc3RyaWN0IG1vZGUgY29kZSB3aGljaCBkb2Vzbid0IGRlZmluZSBhbnkgZ2xvYmFscy4gIEl0J3MgaW5zaWRlIGFcbi8vIGZ1bmN0aW9uIGJlY2F1c2UgdHJ5L2NhdGNoZXMgZGVvcHRpbWl6ZSBpbiBjZXJ0YWluIGVuZ2luZXMuXG5cbnZhciBjYWNoZWRTZXRUaW1lb3V0O1xudmFyIGNhY2hlZENsZWFyVGltZW91dDtcblxuZnVuY3Rpb24gZGVmYXVsdFNldFRpbW91dCgpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3NldFRpbWVvdXQgaGFzIG5vdCBiZWVuIGRlZmluZWQnKTtcbn1cbmZ1bmN0aW9uIGRlZmF1bHRDbGVhclRpbWVvdXQgKCkge1xuICAgIHRocm93IG5ldyBFcnJvcignY2xlYXJUaW1lb3V0IGhhcyBub3QgYmVlbiBkZWZpbmVkJyk7XG59XG4oZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2V0VGltZW91dCA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IHNldFRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gZGVmYXVsdFNldFRpbW91dDtcbiAgICAgICAgfVxuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgY2FjaGVkU2V0VGltZW91dCA9IGRlZmF1bHRTZXRUaW1vdXQ7XG4gICAgfVxuICAgIHRyeSB7XG4gICAgICAgIGlmICh0eXBlb2YgY2xlYXJUaW1lb3V0ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBjbGVhclRpbWVvdXQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgICAgICB9XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBjYWNoZWRDbGVhclRpbWVvdXQgPSBkZWZhdWx0Q2xlYXJUaW1lb3V0O1xuICAgIH1cbn0gKCkpXG5mdW5jdGlvbiBydW5UaW1lb3V0KGZ1bikge1xuICAgIGlmIChjYWNoZWRTZXRUaW1lb3V0ID09PSBzZXRUaW1lb3V0KSB7XG4gICAgICAgIC8vbm9ybWFsIGVudmlyb21lbnRzIGluIHNhbmUgc2l0dWF0aW9uc1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChmdW4sIDApO1xuICAgIH1cbiAgICAvLyBpZiBzZXRUaW1lb3V0IHdhc24ndCBhdmFpbGFibGUgYnV0IHdhcyBsYXR0ZXIgZGVmaW5lZFxuICAgIGlmICgoY2FjaGVkU2V0VGltZW91dCA9PT0gZGVmYXVsdFNldFRpbW91dCB8fCAhY2FjaGVkU2V0VGltZW91dCkgJiYgc2V0VGltZW91dCkge1xuICAgICAgICBjYWNoZWRTZXRUaW1lb3V0ID0gc2V0VGltZW91dDtcbiAgICAgICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuLCAwKTtcbiAgICB9XG4gICAgdHJ5IHtcbiAgICAgICAgLy8gd2hlbiB3aGVuIHNvbWVib2R5IGhhcyBzY3Jld2VkIHdpdGggc2V0VGltZW91dCBidXQgbm8gSS5FLiBtYWRkbmVzc1xuICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dChmdW4sIDApO1xuICAgIH0gY2F0Y2goZSl7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBXaGVuIHdlIGFyZSBpbiBJLkUuIGJ1dCB0aGUgc2NyaXB0IGhhcyBiZWVuIGV2YWxlZCBzbyBJLkUuIGRvZXNuJ3QgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRTZXRUaW1lb3V0LmNhbGwobnVsbCwgZnVuLCAwKTtcbiAgICAgICAgfSBjYXRjaChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yXG4gICAgICAgICAgICByZXR1cm4gY2FjaGVkU2V0VGltZW91dC5jYWxsKHRoaXMsIGZ1biwgMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxufVxuZnVuY3Rpb24gcnVuQ2xlYXJUaW1lb3V0KG1hcmtlcikge1xuICAgIGlmIChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGNsZWFyVGltZW91dCkge1xuICAgICAgICAvL25vcm1hbCBlbnZpcm9tZW50cyBpbiBzYW5lIHNpdHVhdGlvbnNcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICAvLyBpZiBjbGVhclRpbWVvdXQgd2Fzbid0IGF2YWlsYWJsZSBidXQgd2FzIGxhdHRlciBkZWZpbmVkXG4gICAgaWYgKChjYWNoZWRDbGVhclRpbWVvdXQgPT09IGRlZmF1bHRDbGVhclRpbWVvdXQgfHwgIWNhY2hlZENsZWFyVGltZW91dCkgJiYgY2xlYXJUaW1lb3V0KSB7XG4gICAgICAgIGNhY2hlZENsZWFyVGltZW91dCA9IGNsZWFyVGltZW91dDtcbiAgICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChtYXJrZXIpO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgICAvLyB3aGVuIHdoZW4gc29tZWJvZHkgaGFzIHNjcmV3ZWQgd2l0aCBzZXRUaW1lb3V0IGJ1dCBubyBJLkUuIG1hZGRuZXNzXG4gICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQobWFya2VyKTtcbiAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIFdoZW4gd2UgYXJlIGluIEkuRS4gYnV0IHRoZSBzY3JpcHQgaGFzIGJlZW4gZXZhbGVkIHNvIEkuRS4gZG9lc24ndCAgdHJ1c3QgdGhlIGdsb2JhbCBvYmplY3Qgd2hlbiBjYWxsZWQgbm9ybWFsbHlcbiAgICAgICAgICAgIHJldHVybiBjYWNoZWRDbGVhclRpbWVvdXQuY2FsbChudWxsLCBtYXJrZXIpO1xuICAgICAgICB9IGNhdGNoIChlKXtcbiAgICAgICAgICAgIC8vIHNhbWUgYXMgYWJvdmUgYnV0IHdoZW4gaXQncyBhIHZlcnNpb24gb2YgSS5FLiB0aGF0IG11c3QgaGF2ZSB0aGUgZ2xvYmFsIG9iamVjdCBmb3IgJ3RoaXMnLCBob3BmdWxseSBvdXIgY29udGV4dCBjb3JyZWN0IG90aGVyd2lzZSBpdCB3aWxsIHRocm93IGEgZ2xvYmFsIGVycm9yLlxuICAgICAgICAgICAgLy8gU29tZSB2ZXJzaW9ucyBvZiBJLkUuIGhhdmUgZGlmZmVyZW50IHJ1bGVzIGZvciBjbGVhclRpbWVvdXQgdnMgc2V0VGltZW91dFxuICAgICAgICAgICAgcmV0dXJuIGNhY2hlZENsZWFyVGltZW91dC5jYWxsKHRoaXMsIG1hcmtlcik7XG4gICAgICAgIH1cbiAgICB9XG5cblxuXG59XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBpZiAoIWRyYWluaW5nIHx8ICFjdXJyZW50UXVldWUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBydW5UaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBydW5DbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBydW5UaW1lb3V0KGRyYWluUXVldWUpO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnByZXBlbmRPbmNlTGlzdGVuZXIgPSBub29wO1xuXG5wcm9jZXNzLmxpc3RlbmVycyA9IGZ1bmN0aW9uIChuYW1lKSB7IHJldHVybiBbXSB9XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ1NUJywgKCk9PntcclxuICAgIGl0KCdzaG91bGQgZXhpc3QgYXMgYSBnbG9iYWwgb2JqZWN0JywgKCk9PntcclxuICAgICAgICBleHBlY3QoU1QpLnRvLmJlLmFuKCdvYmplY3QnKTtcclxuICAgIH0pO1xyXG4gICAgcmVxdWlyZSgnLi9zcGVjJyk7XHJcbn0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnQXBwJywgKCk9PntcclxuICAgIGxldCBhcHAgPSBuZXcgU1QuQXBwKCk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgYSBwaXhpIGNhbnZhcyBvbiB0aGUgcGFnZScsICgpPT57XHJcbiAgICAgICAgZXhwZWN0KGRvY3VtZW50LmJvZHkuY29udGFpbnMoYXBwLnJlbmRlcmVyLnZpZXcpKS50by5iZS50cnVlO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBoYXZlIGEgdmFsaWQgdGhlbWUnLCAoKT0+e1xyXG4gICAgICAgIGV4cGVjdChhcHAudGhlbWUpLnRvLmJlLmFuLmluc3RhbmNlb2YoU1QuVGhlbWUpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBoYXZlIGEgdmFsaWQgcm9vdCB3aWRnZXQnLCAoKT0+e1xyXG4gICAgICAgIGV4cGVjdChhcHAucm9vdCkudG8uYmUuYW4uaW5zdGFuY2VvZihTVC5XaWRnZXRzLkJhc2VXaWRnZXQpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCByZXNpemUgdGhlIHJvb3Qgd2lkZ2V0IHRvIG1hdGNoIHRoZSB3aW5kb3cnLCAoKT0+e1xyXG4gICAgICAgIHdpbmRvdy5yZXNpemVCeSgzMDAsIDIwMCk7XHJcbiAgICAgICAgZXhwZWN0KGFwcC5yb290LndpZHRoKS50by5lcXVhbCh3aW5kb3cuaW5uZXJXaWR0aCk7XHJcbiAgICAgICAgZXhwZWN0KGFwcC5yb290LmhlaWdodCkudG8uZXF1YWwod2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjbmFtZScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBjaGFuZ2UgdGhlIHBhZ2UgdGl0bGUnLCAoKT0+e1xyXG4gICAgICAgICAgICBhcHAubmFtZSA9ICdTYWJlclRvb3RoIFRlc3QnO1xyXG4gICAgICAgICAgICBleHBlY3QoZG9jdW1lbnQudGl0bGUpLnRvLmVxdWFsKCdTYWJlclRvb3RoIFRlc3QnKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjYXV0b1Jlc2l6ZScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBhZGQgYSBsaXN0ZW5lciB0byByZXNpemUgZXZlbnQgaWYgc2V0IHRvIHRydWUgYW5kICcgK1xyXG4gICAgICAgICAgICAnb25lIGRvZXNudCBhbHJlYWR5IGV4aXN0JywgKCk9PntcclxuICAgICAgICAgICAgICAgIGFwcC5hdXRvUmVzaXplID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgIGxldCBsaXN0ZW5lcnMgPSBhcHAubGlzdGVuZXJzKCdyZXNpemUnKTtcclxuICAgICAgICAgICAgICAgIGV4cGVjdChsaXN0ZW5lcnMuaW5kZXhPZihhcHAucmVzaXplVG9XaW5kb3cpKS50by5ub3QuZXF1YWwoLTEpO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCBub3QgYWRkIG1vcmUgdGhhbiBvbmUgbGlzdGVuZXInLCAoKT0+e1xyXG4gICAgICAgICAgICBhcHAuYXV0b1Jlc2l6ZSA9IHRydWU7XHJcbiAgICAgICAgICAgIGxldCBsaXN0ZW5lcnMgPSBhcHAubGlzdGVuZXJzKCdyZXNpemUnKTtcclxuICAgICAgICAgICAgZXhwZWN0KGxpc3RlbmVycy5sZW5ndGgpLnRvLmVxdWFsKDEpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIHJlbW92ZSB0aGUgbGlzdGVuZXIgZnJvbSByZXNpemUgaWYgc2V0IHRvIGZhbHNlJywgKCk9PntcclxuICAgICAgICAgICAgYXBwLmF1dG9SZXNpemUgPSBmYWxzZTtcclxuICAgICAgICAgICAgbGV0IGxpc3RlbmVycyA9IGFwcC5saXN0ZW5lcnMoJ3Jlc2l6ZScpO1xyXG4gICAgICAgICAgICBleHBlY3QobGlzdGVuZXJzLmluZGV4T2YoYXBwLnJlc2l6ZVRvV2luZG93KSkudG8uZXF1YWwoLTEpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnR3JhcGhpY3NHZW4nLCAoKT0+e1xyXG4gICAgZGVzY3JpYmUoJyNyZWN0YW5nbGVHcmFwaGljKCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIGEgUGl4aS5HcmFwaGljcyB3aXRoIGEgJ1xyXG4gICAgICAgICAgICArICd3aWR0aCBvZiA4MCBhbmQgYSBoZWlnaHQgb2YgMTAwJywgKCk9PntcclxuICAgICAgICAgICAgICAgIGxldCByZWN0R3JhcGhpYyA9XHJcbiAgICAgICAgICAgICAgICAgICAgU1QuR3JhcGhpY3NHZW4ucmVjdGFuZ2xlR3JhcGhpYyg4MCwgMTAwLCAweDAwMDAwMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHJlY3RHcmFwaGljKS50by5iZS5hbi5pbnN0YW5jZW9mKFBJWEkuR3JhcGhpY3MpO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHJlY3RHcmFwaGljLndpZHRoKS50by5lcXVhbCg4MCk7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QocmVjdEdyYXBoaWMuaGVpZ2h0KS50by5lcXVhbCgxMDApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjcmVjdGFuZ2xlVGV4dHVyZSgpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHJldHVybiBhIFBJWEkuVGV4dHVyZSB3aXRoIGEnXHJcbiAgICAgICAgICAgICsgJyB3aWR0aCBvZiAxMDAgYW5kIGEgaGVpZ2h0IG9mIDgwJywgKCk9PntcclxuICAgICAgICAgICAgICAgIGxldCByZWN0VGV4ID1cclxuICAgICAgICAgICAgICAgICAgICBTVC5HcmFwaGljc0dlbi5yZWN0YW5nbGVUZXh0dXJlKDEwMCwgODAsIDB4MDAwMDAwKTtcclxuXHJcbiAgICAgICAgICAgICAgICBleHBlY3QocmVjdFRleCkudG8uYmUuYW4uaW5zdGFuY2VvZihQSVhJLlRleHR1cmUpO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHJlY3RUZXgud2lkdGgpLnRvLmVxdWFsKDEwMCk7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QocmVjdFRleC5oZWlnaHQpLnRvLmVxdWFsKDgwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdQYWRkaW5nJywgKCk9PntcclxuICAgIGxldCBwYWQgPSBuZXcgU1QuUGFkZGluZygpO1xyXG4gICAgaXQoJ3Nob3VsZCBiZSBjcmVhdGVkIHdpdGggYSBkZWZhdWx0IG9mIDAnLCAoKT0+e1xyXG4gICAgICAgIGV4cGVjdChwYWQubGVmdCkudG8uZXF1YWwoMCk7XHJcbiAgICAgICAgZXhwZWN0KHBhZC50b3ApLnRvLmVxdWFsKDApO1xyXG4gICAgICAgIGV4cGVjdChwYWQucmlnaHQpLnRvLmVxdWFsKDApO1xyXG4gICAgICAgIGV4cGVjdChwYWQuYm90dG9tKS50by5lcXVhbCgwKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjc2V0KCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgc2V0IGVhY2ggcGFkZGluZyB0byB0aGUgdmFsdWVzIG9mIDEsMiwzLDQnLCAoKT0+e1xyXG4gICAgICAgICAgICBwYWQuc2V0KDEsIDIsIDMsIDQpO1xyXG4gICAgICAgICAgICBleHBlY3QocGFkLmxlZnQpLnRvLmVxdWFsKDIpO1xyXG4gICAgICAgICAgICBleHBlY3QocGFkLnRvcCkudG8uZXF1YWwoMSk7XHJcbiAgICAgICAgICAgIGV4cGVjdChwYWQucmlnaHQpLnRvLmVxdWFsKDQpO1xyXG4gICAgICAgICAgICBleHBlY3QocGFkLmJvdHRvbSkudG8uZXF1YWwoMyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3NldEFsbFRvKCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgc2V0IGFsbCBwYWRkaW5nIHZhbHVlcyB0byAxMCcsICgpPT57XHJcbiAgICAgICAgICAgIHBhZC5zZXRBbGxUbygxMCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChwYWQubGVmdCkudG8uZXF1YWwoMTApO1xyXG4gICAgICAgICAgICBleHBlY3QocGFkLnRvcCkudG8uZXF1YWwoMTApO1xyXG4gICAgICAgICAgICBleHBlY3QocGFkLnJpZ2h0KS50by5lcXVhbCgxMCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChwYWQuYm90dG9tKS50by5lcXVhbCgxMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdQb2ludCcsICgpPT57XHJcbiAgICBsZXQgcCA9IG5ldyBTVC5Qb2ludCgpO1xyXG4gICAgaXQoJ3Nob3VsZCBjcmVhdGUgd2l0aCBkZWZhdWx0IHggYW5kIHkgb2YgMCcsICgpPT57XHJcbiAgICAgICAgZXhwZWN0KHAueCkudG8uZXF1YWwoMCk7XHJcbiAgICAgICAgZXhwZWN0KHAueSkudG8uZXF1YWwoMCk7XHJcbiAgICB9KTtcclxuICAgIGRlc2NyaWJlKCcjc2V0KCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgc2V0IHggYW5kIHkgdG8gMjAsIDgwJywgKCk9PntcclxuICAgICAgICAgICAgcC5zZXQoMjAsIDgwKTtcclxuICAgICAgICAgICAgZXhwZWN0KHAueCkudG8uZXF1YWwoMjApO1xyXG4gICAgICAgICAgICBleHBlY3QocC55KS50by5lcXVhbCg4MCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdTaXplJywgKCk9PntcclxuICAgIGxldCBzID0gbmV3IFNULlNpemUoKTtcclxuICAgIGl0KCdzaG91bGQgY3JlYXRlIHdpdGggZGVmYXVsdCBzaXplIG9mIDAnLCAoKT0+e1xyXG4gICAgICAgIGV4cGVjdChzLndpZHRoKS50by5lcXVhbCgwKTtcclxuICAgICAgICBleHBlY3Qocy5oZWlnaHQpLnRvLmVxdWFsKDApO1xyXG4gICAgfSk7XHJcbiAgICBkZXNjcmliZSgnI3NldCgpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCB3aWR0aCBhbmQgaGVpZ2h0IHRvIDIwLCA4MCcsICgpPT57XHJcbiAgICAgICAgICAgIHMuc2V0KDIwLCA4MCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChzLndpZHRoKS50by5lcXVhbCgyMCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChzLmhlaWdodCkudG8uZXF1YWwoODApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnVGhlbWUnLCAoKT0+e1xyXG4gICAgLy8gbGV0IGdyZXlUb2FkVGhlbWUgPSByZXF1aXJlKCcuLi8uLi90aGVtZXMvZ3JleVRvYWRUaGVtZScpO1xyXG4gICAgLy8gbGV0IGNoYW5nZSBvbmUgc3R5bGUgYmVjYXVzZSB0aGlzIHRoZW1lIGlzIHRoZSBzYW1lIGFzIHRoZSBkZWZhdWx0c1xyXG4gICAgZ3JleVRvYWRUaGVtZS5iYWNrZ3JvdW5kID0gMHhmZmZmZmY7XHJcbiAgICBncmV5VG9hZFRoZW1lLndpZGdldHMuYnV0dG9uLmhvdmVyID0gMHhmZjAwZmY7XHJcbiAgICBsZXQgdGhlbWUgPSBuZXcgU1QuVGhlbWUoZ3JleVRvYWRUaGVtZSk7XHJcbiAgICBsZXQgZGVmVGhlbWUgPSBuZXcgU1QuVGhlbWUoKTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIGxvYWQgdGhlIGdpdmVuIHN0eWxlcyB3aGVuIGNyZWF0ZWQnLCAoKT0+e1xyXG4gICAgICAgIGV4cGVjdCh0aGVtZS5iYWNrZ3JvdW5kKS50by5lcXVhbCgweGZmZmZmZik7XHJcbiAgICAgICAgZXhwZWN0KHRoZW1lLmNvbG9ycy5idXR0b24uaG92ZXIpLnRvLmVxdWFsKDB4ZmYwMGZmKTtcclxuICAgICAgICAvLyBub3QgZ29ubmEgY2hlY2sgZWFjaCBvbmUuIFRoaXMgc2hvdWxkIGJlIGVub3VnaFxyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBsb2FkIHRoZSBkZWZhdWx0IHN0eWxlcyBpZiBubyBzdHlsZSBpcyBnaXZlbicsICgpPT57XHJcbiAgICAgICAgZXhwZWN0KGRlZlRoZW1lLmJhY2tncm91bmQpLnRvLmVxdWFsKFNULlRoZW1lLmRlZmF1bHRzLmJhY2tncm91bmQpO1xyXG4gICAgICAgIGV4cGVjdChkZWZUaGVtZS5jb2xvcnMuYnV0dG9uLmhvdmVyKS50by5lcXVhbChTVC5UaGVtZS5kZWZhdWx0c1xyXG4gICAgICAgICAgICAud2lkZ2V0cy5idXR0b24uaG92ZXIpO1xyXG4gICAgICAgIC8vIG5vdCBnb25uYSBjaGVjayBlYWNoIG9uZS4gVGhpcyBzaG91bGQgYmUgZW5vdWdoXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2NvbG9ycycsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBlcXVhbCB0aGUgd2lkZ2V0cyBwb3J0aW9uIG9mIHRoZSBzdHlsZXMnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3QodGhlbWUuY29sb3JzKS50by5kZWVwLmVxdWFsKGdyZXlUb2FkVGhlbWUud2lkZ2V0cyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2ZvbnRTdHlsZXMnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgZXF1YWwgdGhlIHRleHQgcG9ydGlvbiBvZiB0aGUgc3R5bGVzJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHRoZW1lLmZvbnRTdHlsZXMpLnRvLmRlZXAuZXF1YWwoZ3JleVRvYWRUaGVtZS50ZXh0KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjZnJhbWVzJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGNvbnRhaW4gcmVjdHMgaW4gdGhlIHN0cnVjdHVyZSBvZiB0aGUgd2lkZ2V0cycgK1xyXG4gICAgICAgICAgICAnIHBvcnRpb24gb2YgdGhlIHN0eWxlcycsICgpPT57XHJcbiAgICAgICAgICAgICAgICAvLyB0ZXh0dXJlcyBiZWNvbWVzIGFuIGFsaWFzIGZvciBmcmFtZXMgdGhlcmVmb3JcclxuICAgICAgICAgICAgICAgIC8vIHNlZSAjdGV4dHVyZXNcclxuXHJcbiAgICAgICAgICAgICAgICAvLyB0cnkgYSBmZXcgb2YgdGhlbVxyXG4gICAgICAgICAgICAgICAgLy8gZXhwZWN0KHRoZW1lLmZyYW1lcy5idXR0b24uZW5hYmxlZCkudG8uYmUuYW5cclxuICAgICAgICAgICAgICAgIC8vICAgICAuaW5zdGFuY2VvZihQSVhJLlJlY3RhbmdsZSk7XHJcbiAgICAgICAgICAgICAgICAvLyBleHBlY3QodGhlbWUuZnJhbWVzLnBhbmVsLmhvdmVyKS50by5iZS5hblxyXG4gICAgICAgICAgICAgICAgLy8gICAgIC5pbnN0YW5jZW9mKFBJWEkuUmVjdGFuZ2xlKTtcclxuICAgICAgICAgICAgICAgIC8vIGV4cGVjdCh0aGVtZS5mcmFtZXMuc2xpZGVyLmJ1dHRvbi5lbmFibGVkKS50by5iZS5hblxyXG4gICAgICAgICAgICAgICAgLy8gICAgIC5pbnN0YW5jZW9mKFBJWEkuUmVjdGFuZ2xlKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2Jhc2VUZXh0dXJlJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGJlIGEgUElYSS5CYXNlVGV4dHVyZScsICgpPT57XHJcbiAgICAgICAgICAgIGV4cGVjdCh0aGVtZS5iYXNlVGV4dHVyZSkudG8uYmUuYW4uaW5zdGFuY2VvZihQSVhJLkJhc2VUZXh0dXJlKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjdGV4dHVyZXMnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgY29udGFpbiB0ZXh0dXJlcyBpbiB0aGUgc3RydWN0dXJlIG9mIHRoZSB3aWRnZXRzJyArXHJcbiAgICAgICAgICAgICcgcG9ydGlvbiBvZiB0aGUgc3R5bGVzJywgKCk9PntcclxuICAgICAgICAgICAgICAgIC8vIHRyeSBhIGZldyBvZiB0aGVtXHJcbiAgICAgICAgICAgICAgICBleHBlY3QodGhlbWUudGV4dHVyZXMuYnV0dG9uLmVuYWJsZWQpLnRvLmJlLmFuXHJcbiAgICAgICAgICAgICAgICAgICAgLmluc3RhbmNlb2YoUElYSS5UZXh0dXJlKTtcclxuICAgICAgICAgICAgICAgIGV4cGVjdCh0aGVtZS50ZXh0dXJlcy5wYW5lbC5ob3ZlcikudG8uYmUuYW5cclxuICAgICAgICAgICAgICAgICAgICAuaW5zdGFuY2VvZihQSVhJLlRleHR1cmUpO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHRoZW1lLnRleHR1cmVzLnNsaWRlci5idXR0b24uZW5hYmxlZCkudG8uYmUuYW5cclxuICAgICAgICAgICAgICAgICAgICAuaW5zdGFuY2VvZihQSVhJLlRleHR1cmUpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjYmFja2dyb3VuZCcsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBlcXVhbCB0aGUgY29sb3IgZ2l2ZW4gaW4gdGhlIHN0eWxlJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHRoZW1lLmJhY2tncm91bmQpLnRvLmVxdWFsKDB4ZmZmZmZmKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjZ2V0Q2xpcEdyYXBoaWMoKSAoU1RBVElDKScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gdGhlIGdsb2JhbCBjbGlwR3JhcGhpYycsICgpPT57XHJcbiAgICAgICAgICAgIGV4cGVjdChTVC5UaGVtZS5nZXRDbGlwR3JhcGhpYygpKS50by5iZS5hblxyXG4gICAgICAgICAgICAgICAgLmluc3RhbmNlb2YoUElYSS5HcmFwaGljcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3JlZ2lzdGVyRGVmYXVsdFdpZGdldFN0eWxlKCkgKFNUQVRJQyknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgYWRkIHRoZSBnaXZlbiBzdHlsZSB0byB0aGVtZS5kZWZhdWx0cyhnbG9iYWwpJywgKCk9PntcclxuICAgICAgICAgICAgbGV0IHN0eWxlID0ge1xyXG4gICAgICAgICAgICAgICAga25vYjoge1xyXG4gICAgICAgICAgICAgICAgICAgIGVuYWJsZWQ6IDB4MDAwMDAwLFxyXG4gICAgICAgICAgICAgICAgICAgIGRpc2FibGVkOiAweGZmZmZmZixcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH07XHJcblxyXG4gICAgICAgICAgICBTVC5UaGVtZS5yZWdpc3RlckRlZmF1bHRXaWRnZXRTdHlsZSgncGFuZScsIHN0eWxlKTtcclxuXHJcbiAgICAgICAgICAgIGV4cGVjdChTVC5UaGVtZS5kZWZhdWx0cy53aWRnZXRzLnBhbmUua25vYi5lbmFibGVkKVxyXG4gICAgICAgICAgICAgICAgLnRvLmVxdWFsKDB4MDAwMDAwKTtcclxuXHJcbiAgICAgICAgICAgIGV4cGVjdChTVC5UaGVtZS5kZWZhdWx0cy53aWRnZXRzLnBhbmUua25vYi5kaXNhYmxlZClcclxuICAgICAgICAgICAgICAgIC50by5lcXVhbCgweGZmZmZmZik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI21ha2VHcmFwaGljc1JlY3Vyc2l2ZSgpJywgKCk9PntcclxuICAgICAgICAvLyBub3QgbmVlZGVkIGlmIGZyYW1lcyB0ZXN0IGFib3ZlIHBhc3Nlc1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNtYWtlVGV4dHVyZSgpJywgKCk9PntcclxuICAgICAgICAvLyBub3QgbmVlZGVkIGlmIGJhc2VUZXh0dXJlIHRlc3QgYWJvdmUgcGFzc2VzXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI21ha2VUZXh0dXJlc1JlY3Vyc2l2ZSgpJywgKCk9PntcclxuICAgICAgICAvLyBub3QgbmVlZGVkIGlmIHRleHR1cmVzIHRleHQgYWJvdmUgcGFzc2VzXHJcbiAgICB9KTtcclxufSk7XHJcbiIsInJlcXVpcmUoJy4vVGhlbWUtc3BlYycpO1xyXG5yZXF1aXJlKCcuL1NpemUtc3BlYycpO1xyXG5yZXF1aXJlKCcuL1BvaW50LXNwZWMnKTtcclxucmVxdWlyZSgnLi9QYWRkaW5nLXNwZWMnKTtcclxucmVxdWlyZSgnLi9HcmFwaGljc0dlbi1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vQXBwLXNwZWMnKTtcclxucmVxdWlyZSgnLi93aWRnZXRzJyk7XHJcbnJlcXVpcmUoJy4vbGF5b3V0U3lzJyk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdBbGlnbm1lbnQnLCAoKT0+e1xyXG4gICAgbGV0IHdpZGdldDAgPSBuZXcgU1QuV2lkZ2V0cy5CYXNlV2lkZ2V0KCk7XHJcbiAgICB3aWRnZXQwLndpZHRoID0gNDAwOyB3aWRnZXQwLmhlaWdodCA9IDQwMDtcclxuICAgIGxldCB3aWRnZXQxID0gbmV3IFNULldpZGdldHMuQmFzZVdpZGdldCh3aWRnZXQwKTtcclxuICAgIHdpZGdldDEud2lkdGggPSAyMDA7IHdpZGdldDEuaGVpZ2h0ID0gMjAwO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjZ2V0T2Zmc2V0KCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIGEgcmVsYXRpdmUgb2Zmc2V0IGJhc2Ugb24gdGhlIGdpdmVuIGhvcml6b250YWwnXHJcbiAgICAgICAgICAgICsgJyBhbmQgdmVydGljYWwgYWxpZ25tZW50JywgKCk9PntcclxuICAgICAgICAgICAgICAgIHdpZGdldDAubGF5b3V0LmFsaWdubWVudC5oQWxpZ24gPSBTVC5BbGlnbm1lbnQuY2VudGVyO1xyXG4gICAgICAgICAgICAgICAgd2lkZ2V0MC5sYXlvdXQuYWxpZ25tZW50LnZBbGlnbiA9IFNULkFsaWdubWVudC5taWRkbGU7XHJcbiAgICAgICAgICAgICAgICBsZXQgb2ZmID0gbmV3IFNULlBvaW50KCk7XHJcbiAgICAgICAgICAgICAgICBvZmYgPSB3aWRnZXQwLmxheW91dC5hbGlnbm1lbnQuZ2V0T2Zmc2V0KHdpZGdldDAsXHJcbiAgICAgICAgICAgICAgICAgICAgd2lkZ2V0MS53aWR0aCwgd2lkZ2V0MS5oZWlnaHQpO1xyXG4gICAgICAgICAgICAgICAgLy8gKHdpZGdldDAud2lkdGgvMikgLSAod2lkZ2V0MS53aWR0aC8yKVxyXG4gICAgICAgICAgICAgICAgZXhwZWN0KG9mZi54KS50by5lcXVhbCgxMDApO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KG9mZi55KS50by5lcXVhbCgxMDApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjbGVmdCcsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gcmVsYXRpdmUgcG9zaXRpb24gZm9yIGxlZnQgYWxpZ25tZW50JywgKCk9PntcclxuICAgICAgICAgICAgbGV0IG9mZiA9IFNULkFsaWdubWVudC5sZWZ0KDQwMCwgd2lkZ2V0MCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChvZmYpLnRvLmVxdWFsKDQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNjZW50ZXInLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIHJlbGF0aXZlIHBvc2l0aW9uIGZvciBjZW50ZXIgYWxpZ25tZW50JywgKCk9PntcclxuICAgICAgICAgICAgbGV0IG9mZiA9IFNULkFsaWdubWVudC5jZW50ZXIoMTAwLCB3aWRnZXQwKTtcclxuICAgICAgICAgICAgZXhwZWN0KG9mZikudG8uZXF1YWwoMTUwKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjcmlnaHQnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgcmV0dXJuIHJlbGF0aXZlIHBvc2l0aW9uIGZvciByaWdodCBhbGlnbm1lbnQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgb2ZmID0gU1QuQWxpZ25tZW50LnJpZ2h0KDEwMCwgd2lkZ2V0MCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChvZmYpLnRvLmVxdWFsKDMwMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3RvcCcsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gcmVsYXRpdmUgcG9zaXRpb24gZm9yIHRvcCBhbGlnbm1lbnQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgb2ZmID0gU1QuQWxpZ25tZW50LnRvcCgxMDAsIHdpZGdldDApO1xyXG4gICAgICAgICAgICBleHBlY3Qob2ZmKS50by5lcXVhbCg0KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjbWlkZGxlJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHJldHVybiByZWxhdGl2ZSBwb3NpdGlvbiBmb3IgbWlkZGxlIGFsaWdubWVudCcsICgpPT57XHJcbiAgICAgICAgICAgIGxldCBvZmYgPSBTVC5BbGlnbm1lbnQubWlkZGxlKDEwMCwgd2lkZ2V0MCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChvZmYpLnRvLmVxdWFsKDE1MCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2JvdHRvbScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gcmVsYXRpdmUgcG9zaXRpb24gZm9yIGJvdHRvbSBhbGlnbm1lbnQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgb2ZmID0gU1QuQWxpZ25tZW50LmJvdHRvbSgxMDAsIHdpZGdldDApO1xyXG4gICAgICAgICAgICBleHBlY3Qob2ZmKS50by5lcXVhbCgzMDApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCJyZXF1aXJlKCcuL0FsaWdubWVudC1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vc2l6ZVBvbGljaWVzJyk7XHJcbnJlcXVpcmUoJy4vbGF5b3V0cycpO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnQmFzZUxheW91dCcsICgpPT57XHJcbiAgICBsZXQgd2lkZ2V0MCA9IG5ldyBTVC5XaWRnZXRzLlBhbmVsKG51bGwsIHt3aWR0aDogMTAwLCBoZWlnaHQ6IDEwMH0pO1xyXG4gICAgbGV0IHdpZGdldDEgPSBuZXcgU1QuV2lkZ2V0cy5CdXR0b24od2lkZ2V0MCwge3dpZHRoOiAyMCwgaGVpZ2h0OiAyMH0pO1xyXG4gICAgd2lkZ2V0MS5wb3NpdGlvbi5zZXQoMjAsIDIwKTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2V4ZWMnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBwb3NpdGlvbiBvZiBpdHMgY2hpbGRyZW4gYW5kIGV4ZWMgdGhlaXIgbGF5b3VycycsXHJcbiAgICAgICAgKCk9PntcclxuICAgICAgICAgICAgLy8gcmVhbCBwb3NpdGlvbiBpc250IHNldCB1bnRpbCBsYXlvdXQgZXhlY3V0ZXNcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEudHJhbnNmb3JtLnBvc2l0aW9uLngpLnRvLmVxdWFsKDApO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS50cmFuc2Zvcm0ucG9zaXRpb24ueSkudG8uZXF1YWwoMCk7XHJcblxyXG4gICAgICAgICAgICBsZXQgc3B5ID0gc2lub24uc3B5KHdpZGdldDEubGF5b3V0LCAnZXhlYycpO1xyXG5cclxuICAgICAgICAgICAgd2lkZ2V0MC5sYXlvdXQuZXhlYygpO1xyXG5cclxuICAgICAgICAgICAgZXhwZWN0KHNweS5jYWxsZWQpLnRvLmJlLnRydWU7XHJcblxyXG4gICAgICAgICAgICB3aWRnZXQxLmxheW91dC5leGVjLnJlc3RvcmUoKTtcclxuXHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLnRyYW5zZm9ybS5wb3NpdGlvbi54KS50by5lcXVhbCgyNCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLnRyYW5zZm9ybS5wb3NpdGlvbi55KS50by5lcXVhbCgyNCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdCb3hMYXlvdXQnLCAoKT0+e1xyXG4gICAgbGV0IHcwID0gbmV3IFNULldpZGdldHMuUGFuZWwobnVsbCwge3dpZHRoOiA0MDAsIGhlaWdodDogNDAwfSk7XHJcbiAgICB3MC5sYXlvdXQgPSBuZXcgU1QuTGF5b3V0cy5Cb3hMYXlvdXQodzAsIFNULlZFUlRJQ0FMKTtcclxuICAgIGxldCB3MSA9IG5ldyBTVC5XaWRnZXRzLkJ1dHRvbih3MCwge3dpZHRoOiAyMCwgaGVpZ2h0OiAyMH0pO1xyXG4gICAgbGV0IHcyID0gbmV3IFNULldpZGdldHMuQnV0dG9uKHcwLCB7d2lkdGg6IDIwLCBoZWlnaHQ6IDIwfSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcclxuICAgIGxldCB3MyA9IG5ldyBTVC5XaWRnZXRzLkJ1dHRvbih3MCwge3dpZHRoOiAyMCwgaGVpZ2h0OiAyMH0pOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXHJcblxyXG4gICAgZGVzY3JpYmUoJyNpbml0VG90YWxDaGlsZHJlblNpemUoKScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBjYWxjdWxhdGUgdGhlIHRvdGFsIHNpemUgb2YgdGhlIGNoaWxkcmVuJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHcwLmxheW91dC5fdG90YWxDaGlsZHJlbldpZHRoKS50by5lcXVhbCgwKTtcclxuICAgICAgICAgICAgZXhwZWN0KHcwLmxheW91dC5fdG90YWxDaGlsZHJlbkhlaWdodCkudG8uZXF1YWwoMCk7XHJcblxyXG4gICAgICAgICAgICB3MC5sYXlvdXQuaW5pdFRvdGFsQ2hpbGRyZW5TaXplKCk7XHJcblxyXG4gICAgICAgICAgICAvLyBhZGQgdG9nZXRoZXIgKyBzcGFjaW5nXHJcbiAgICAgICAgICAgIGV4cGVjdCh3MC5sYXlvdXQuX3RvdGFsQ2hpbGRyZW5XaWR0aCkudG8uZXF1YWwoNzIpO1xyXG4gICAgICAgICAgICBleHBlY3QodzAubGF5b3V0Ll90b3RhbENoaWxkcmVuSGVpZ2h0KS50by5lcXVhbCg3Mik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2JlZ2luSXRlcmF0aW9uKCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgcHJlcGFyZSB2YXJpYWJsZXMgYmVmb3JlIGl0ZXJhdGlvbicsICgpPT57XHJcbiAgICAgICAgICAgIGxldCB3TGF5b3V0ID0gdzAubGF5b3V0O1xyXG4gICAgICAgICAgICB3TGF5b3V0LmJlZ2luSXRlcmF0aW9uKCk7XHJcblxyXG4gICAgICAgICAgICBleHBlY3Qod0xheW91dC5fdG90YWxDaGlsZHJlbkhlaWdodCkudG8uZXF1YWwoMCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3TGF5b3V0Ll90b3RhbENoaWxkcmVuV2lkdGgpLnRvLmVxdWFsKDApO1xyXG5cclxuICAgICAgICAgICAgZXhwZWN0KHdMYXlvdXQucG9zT2Zmc2V0LngpLnRvLmVxdWFsKDApO1xyXG4gICAgICAgICAgICBleHBlY3Qod0xheW91dC5wb3NPZmZzZXQueSkudG8uZXF1YWwoMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3NldENoaWxkUG9zKCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBwb3NpdGlvbiBvZiB0aGUgY2hpbGQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgd0xheW91dCA9IHcwLmxheW91dDtcclxuICAgICAgICAgICAgd0xheW91dC5zZXRDaGlsZFBvcyh3MSk7XHJcblxyXG4gICAgICAgICAgICBleHBlY3Qod0xheW91dC5fdG90YWxDaGlsZHJlbldpZHRoKS50by5lcXVhbCgyNCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3TGF5b3V0Ll90b3RhbENoaWxkcmVuSGVpZ2h0KS50by5lcXVhbCgyNCk7XHJcblxyXG4gICAgICAgICAgICBleHBlY3QodzEudHJhbnNmb3JtLnBvc2l0aW9uLngpLnRvLmVxdWFsKDQpO1xyXG4gICAgICAgICAgICBleHBlY3QodzEudHJhbnNmb3JtLnBvc2l0aW9uLnkpLnRvLmVxdWFsKDQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnRml4ZWRMYXlvdXQnLCAoKT0+e1xyXG4gICAgbGV0IHcwID0gbmV3IFNULldpZGdldHMuUGFuZWwobnVsbCwge3dpZHRoOiA0MDAsIGhlaWdodDogNDAwfSk7XHJcbiAgICBsZXQgdzEgPSBuZXcgU1QuV2lkZ2V0cy5CdXR0b24odzApO1xyXG4gICAgdzEucG9zaXRpb24uc2V0KDEyLCAxMik7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNzZXRDaGlsZFBvcygpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCB0aGUgY2hpbGRzIHBvc2l0aW9uJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHcxLnRyYW5zZm9ybS5wb3NpdGlvbi54KS50by5lcXVhbCgwKTtcclxuICAgICAgICAgICAgZXhwZWN0KHcxLnRyYW5zZm9ybS5wb3NpdGlvbi55KS50by5lcXVhbCgwKTtcclxuXHJcbiAgICAgICAgICAgIHcwLmxheW91dC5zZXRDaGlsZFBvcyh3MSk7XHJcblxyXG4gICAgICAgICAgICBleHBlY3QodzEudHJhbnNmb3JtLnBvc2l0aW9uLngpLnRvLmVxdWFsKDE2KTtcclxuICAgICAgICAgICAgZXhwZWN0KHcxLnRyYW5zZm9ybS5wb3NpdGlvbi55KS50by5lcXVhbCgxNik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdIQm94TGF5b3V0JywgKCk9PntcclxuICAgIGl0KCdzaG91bGQgY29uc3RydWN0IGEgQm94TGF5b3V0IHdpdGggSE9SSVpPTlRBTCBvcmllbnRhdGlvbicsICgpPT57XHJcbiAgICAgICAgbGV0IHcxID0gbmV3IFNULldpZGdldHMuUGFuZWwoKTtcclxuXHJcbiAgICAgICAgdzEubGF5b3V0ID0gbmV3IFNULkxheW91dHMuSEJveExheW91dCh3MSk7XHJcbiAgICAgICAgZXhwZWN0KHcxLmxheW91dC5vcmllbnRhdGlvbikudG8uZXF1YWwoU1QuSE9SSVpPTlRBTCk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdWQm94TGF5b3V0JywgKCk9PntcclxuICAgIGl0KCdzaG91bGQgY29uc3RydWN0IGEgQm94TGF5b3V0IHdpdGggVkVSVElDQUwgb3JpZW50YXRpb24nLCAoKT0+e1xyXG4gICAgICAgIGxldCB3MSA9IG5ldyBTVC5XaWRnZXRzLlBhbmVsKCk7XHJcblxyXG4gICAgICAgIHcxLmxheW91dCA9IG5ldyBTVC5MYXlvdXRzLlZCb3hMYXlvdXQodzEpO1xyXG4gICAgICAgIGV4cGVjdCh3MS5sYXlvdXQub3JpZW50YXRpb24pLnRvLmVxdWFsKFNULlZFUlRJQ0FMKTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwicmVxdWlyZSgnLi9CYXNlTGF5b3V0LXNwZWMnKTtcclxucmVxdWlyZSgnLi9Cb3hMYXlvdXQtc3BlYycpO1xyXG5yZXF1aXJlKCcuL0ZpeGVkTGF5b3V0LXNwZWMnKTtcclxucmVxdWlyZSgnLi9IQm94TGF5b3V0LXNwZWMnKTtcclxucmVxdWlyZSgnLi9WQm94TGF5b3V0LXNwZWMnKTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ0Jhc2VQb2xpY3knLCAoKT0+e1xyXG4gICAgbGV0IHdpZGdldCA9IG5ldyBTVC5XaWRnZXRzLkJ1dHRvbigpO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjY2hpbGRQb2xpY3lGaW5pc2hlZCgpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGFkZCBlYWNoIGNoaWxkcyBzaXplIHRvIHRvdGFsQ2hpbGRyZW5GaW5pc2hlZFNpemUgYW5kJ1xyXG4gICAgICAgICAgICArICcgc3Vic3RyYWN0IDEgZnJvbSB0b3RhbENoaWxkcmVuRmluaXNoZWQnLCAoKT0+e1xyXG4gICAgICAgICAgICAgICAgd2lkZ2V0LmhQb2xpY3kudG90YWxDaGlsZHJlbkZpbmlzaGVkID0gMTtcclxuICAgICAgICAgICAgICAgIHdpZGdldC5oUG9saWN5LnRvdGFsQ2hpbGRyZW5GaW5pc2hlZFNpemUgPSAxMDA7XHJcbiAgICAgICAgICAgICAgICB3aWRnZXQuaFBvbGljeS5jaGlsZFBvbGljeUZpbmlzaGVkKDQwMCk7XHJcblxyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHdpZGdldC5oUG9saWN5LnRvdGFsQ2hpbGRyZW5GaW5pc2hlZCkudG8uZXF1YWwoMCk7XHJcbiAgICAgICAgICAgICAgICBleHBlY3Qod2lkZ2V0LmhQb2xpY3kudG90YWxDaGlsZHJlbkZpbmlzaGVkU2l6ZSkudG8uZXF1YWwoNTAwKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2V4ZWMoKScsICgpPT57XHJcbiAgICAgICAgbGV0IHdpZGdldDIgPSBuZXcgU1QuV2lkZ2V0cy5CdXR0b24od2lkZ2V0KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCBhZGQgYSBvbmUgdGltZSBldmVudCdcclxuICAgICAgICArICcoIHJlZ2lzdGVyIHNpemUgd2l0aCBjaGlsZFBvbGljeUZpbmlzaGVkICkgYW5kIGV4ZWMgdGhlICdcclxuICAgICAgICArICdIT1JJWk9OVEFMIHNpemUgcG9saWN5IGZvciBlYWNoIGNoaWxkICdcclxuICAgICAgICArICd0aGF0IGlzIEhPUklaT05UQUwgYW5kIGFuIGluc3RhbmNlb2YgU1QuV2lkZ2V0cy5CYXNlV2lkZ2V0JywgKCk9PntcclxuICAgICAgICAgICAgbGV0IHNweSA9IHNpbm9uLnNweSh3aWRnZXQyLmhQb2xpY3ksICdleGVjJyk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLmhQb2xpY3kubGlzdGVuZXJzKCdmaW5pc2hlZCcsIHRydWUpKS50by5iZS5mYWxzZTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIpLnRvLmJlLmFuLmluc3RhbmNlb2YoU1QuV2lkZ2V0cy5CYXNlV2lkZ2V0KTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldC5oUG9saWN5Lm9yaWVudGF0aW9uKS50by5lcXVhbChTVC5IT1JJWk9OVEFMKTtcclxuICAgICAgICAgICAgd2lkZ2V0LmhQb2xpY3kuZXhlYygpO1xyXG5cclxuICAgICAgICAgICAgZXhwZWN0KHNweS5jYWxsZWQpLnRvLmJlLnRydWU7XHJcbiAgICAgICAgICAgIHdpZGdldDIuaFBvbGljeS5leGVjLnJlc3RvcmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCBhZGQgYSBvbmUgdGltZSBldmVudCdcclxuICAgICAgICArICcoIHJlZ2lzdGVyIHNpemUgd2l0aCBjaGlsZFBvbGljeUZpbmlzaGVkICkgYW5kIGV4ZWMgdGhlICdcclxuICAgICAgICArICdWRVJUSUNBTCBzaXplIHBvbGljeSBmb3IgZWFjaCBjaGlsZCAnXHJcbiAgICAgICAgKyAndGhhdCBpcyBWRVJUSUNBTCBhbmQgYW4gaW5zdGFuY2VvZiBTVC5XaWRnZXRzLkJhc2VXaWRnZXQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgc3B5ID0gc2lub24uc3B5KHdpZGdldDIudlBvbGljeSwgJ2V4ZWMnKTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIudlBvbGljeS5saXN0ZW5lcnMoJ2ZpbmlzaGVkJywgdHJ1ZSkpLnRvLmJlLmZhbHNlO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MikudG8uYmUuYW4uaW5zdGFuY2VvZihTVC5XaWRnZXRzLkJhc2VXaWRnZXQpO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0LnZQb2xpY3kub3JpZW50YXRpb24pLnRvLmVxdWFsKFNULlZFUlRJQ0FMKTtcclxuICAgICAgICAgICAgd2lkZ2V0LnZQb2xpY3kuZXhlYygpO1xyXG5cclxuICAgICAgICAgICAgZXhwZWN0KHNweS5jYWxsZWQpLnRvLmJlLnRydWU7XHJcbiAgICAgICAgICAgIHdpZGdldDIudlBvbGljeS5leGVjLnJlc3RvcmUoKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCBjYWxsIHNpemVXaWRnZXRIb3Jpem9udGFsKCkgaWYgdGhlIHdpZGdldCBpcyBIT1JJWk9OVEFMJyxcclxuICAgICAgICAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgc3B5ID0gc2lub24uc3B5KHdpZGdldC5oUG9saWN5LCAnc2l6ZVdpZGdldEhvcml6b250YWwnKTtcclxuICAgICAgICAgICAgd2lkZ2V0LmhQb2xpY3kuZXhlYygpO1xyXG4gICAgICAgICAgICBleHBlY3Qoc3B5LmNhbGxlZCkudG8uYmUudHJ1ZTtcclxuICAgICAgICAgICAgd2lkZ2V0LmhQb2xpY3kuc2l6ZVdpZGdldEhvcml6b250YWwucmVzdG9yZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIGNhbGwgc2l6ZVdpZGdldFZlcnRpY2FsKCkgaWYgdGhlIHdpZGdldCBpcyBWRVJUSUNBTCcsXHJcbiAgICAgICAgKCk9PntcclxuICAgICAgICAgICAgbGV0IHNweSA9IHNpbm9uLnNweSh3aWRnZXQudlBvbGljeSwgJ3NpemVXaWRnZXRWZXJ0aWNhbCcpO1xyXG4gICAgICAgICAgICB3aWRnZXQudlBvbGljeS5leGVjKCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChzcHkuY2FsbGVkKS50by5iZS50cnVlO1xyXG4gICAgICAgICAgICB3aWRnZXQudlBvbGljeS5zaXplV2lkZ2V0VmVydGljYWwucmVzdG9yZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcbn0pO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG5kZXNjcmliZSgnRXhwYW5kaW5nUG9saWN5JywgKCk9PntcclxuICAgIGxldCB3aWRnZXQwID0gbmV3IFNULldpZGdldHMuQnV0dG9uKCk7XHJcbiAgICB3aWRnZXQwLndpZHRoID0gMjAwOyB3aWRnZXQwLmhlaWdodCA9IDIwMDtcclxuICAgIGxldCB3aWRnZXQxID0gbmV3IFNULldpZGdldHMuQnV0dG9uKHdpZGdldDApO1xyXG4gICAgd2lkZ2V0MS5oUG9saWN5ID0gbmV3IFNULlNpemVQb2xpY2llcy5FeHBhbmRpbmdQb2xpY3kod2lkZ2V0MSk7XHJcbiAgICB3aWRnZXQxLnZQb2xpY3kgPSBuZXcgU1QuU2l6ZVBvbGljaWVzLkV4cGFuZGluZ1BvbGljeSh3aWRnZXQxKTtcclxuICAgIHdpZGdldDEud2lkdGggPSAxMDA7IHdpZGdldDEuaGVpZ2h0ID0gMTAwO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjcGFyZW50UmVhZHlIJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNpemUgdGhlIHdpZGdldCB0byBtYXRjaCBpdHMgcGFyZW50cyB3aWR0aCAtIHBhZGRpbmcnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS53aWR0aCkudG8uZXF1YWwoMTAwKTtcclxuICAgICAgICAgICAgd2lkZ2V0MS5oUG9saWN5LnBhcmVudFJlYWR5SCgpO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS53aWR0aCkudG8uZXF1YWwoMTkyKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjcGFyZW50UmVhZHlWJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNpemUgdGhlIHdpZGdldCB0byBtYXRjaCBpdHMgcGFyZW50cyBoZWlnaHQgLSBwYWRkaW5nJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEuaGVpZ2h0KS50by5lcXVhbCgxMDApO1xyXG4gICAgICAgICAgICB3aWRnZXQxLnZQb2xpY3kucGFyZW50UmVhZHlWKCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLmhlaWdodCkudG8uZXF1YWwoMTkyKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ0ZpeGVkUG9saWN5JywgKCk9PntcclxuICAgIGxldCB3aWRnZXQgPSBuZXcgU1QuV2lkZ2V0cy5CdXR0b24oKTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3NpemVXaWRnZXRIb3Jpem9udGFsJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHZhbGlkYXRlIHRoZSB3aWR0aCBvZiB0aGUgd2lkZ2V0JywgKCk9PntcclxuICAgICAgICAgICAgbGV0IHNweSA9IHNpbm9uLnNweSh3aWRnZXQsICd2YWxpZGF0ZVdpZHRoJyk7XHJcbiAgICAgICAgICAgIHdpZGdldC5oUG9saWN5LnNpemVXaWRnZXRIb3Jpem9udGFsKCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChzcHkuY2FsbGVkKS50by5iZS50cnVlO1xyXG4gICAgICAgICAgICB3aWRnZXQudmFsaWRhdGVXaWR0aC5yZXN0b3JlKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3NpemVXaWRnZXRWZXJ0aWNhbCcsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCB2YWxpZGF0ZSB0aGUgaGVpZ2h0IG9mIHRoZSB3aWRnZXQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgc3B5ID0gc2lub24uc3B5KHdpZGdldCwgJ3ZhbGlkYXRlSGVpZ2h0Jyk7XHJcbiAgICAgICAgICAgIHdpZGdldC52UG9saWN5LnNpemVXaWRnZXRWZXJ0aWNhbCgpO1xyXG4gICAgICAgICAgICBleHBlY3Qoc3B5LmNhbGxlZCkudG8uYmUudHJ1ZTtcclxuICAgICAgICAgICAgd2lkZ2V0LnZhbGlkYXRlSGVpZ2h0LnJlc3RvcmUoKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ1NoYXJlZEV4cGFuZGluZ1BvbGljeScsICgpPT57XHJcbiAgICBsZXQgd2lkZ2V0MCA9IG5ldyBTVC5XaWRnZXRzLlBhbmVsKG51bGwsIHt3aWR0aDogNDAwLCBoZWlnaHQ6IDQwMH0pO1xyXG4gICAgd2lkZ2V0MC5sYXlvdXQgPSBuZXcgU1QuTGF5b3V0cy5IQm94TGF5b3V0KHdpZGdldDApO1xyXG5cclxuICAgIGxldCB3aWRnZXQxID0gbmV3IFNULldpZGdldHMuQnV0dG9uKHdpZGdldDApO1xyXG4gICAgd2lkZ2V0MS5oUG9saWN5ID0gbmV3IFNULlNpemVQb2xpY2llcy5TaGFyZWRFeHBhbmRpbmdQb2xpY3kod2lkZ2V0MSk7XHJcbiAgICB3aWRnZXQxLnZQb2xpY3lcclxuICAgID0gbmV3IFNULlNpemVQb2xpY2llcy5TaGFyZWRFeHBhbmRpbmdQb2xpY3kod2lkZ2V0MSwgU1QuVkVSVElDQUwpO1xyXG5cclxuICAgIGxldCB3aWRnZXQyID0gbmV3IFNULldpZGdldHMuQnV0dG9uKHdpZGdldDApO1xyXG4gICAgd2lkZ2V0Mi5oUG9saWN5ID0gbmV3IFNULlNpemVQb2xpY2llcy5TaGFyZWRFeHBhbmRpbmdQb2xpY3kod2lkZ2V0Mik7XHJcbiAgICB3aWRnZXQyLnZQb2xpY3lcclxuICAgID0gbmV3IFNULlNpemVQb2xpY2llcy5TaGFyZWRFeHBhbmRpbmdQb2xpY3kod2lkZ2V0MiwgU1QuVkVSVElDQUwpO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjcGFyZW50UmVhZHlIJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNpemUgdGhlIHdpZGdldHMgZXF1YWwgc2l6ZSBpZiBhbGwgaGF2ZSBzaGFyZWQgcG9saWN5JywgKCk9PntcclxuICAgICAgICAgICAgd2lkZ2V0MC5oUG9saWN5LmV4ZWMoKTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEud2lkdGgpLnRvLmVxdWFsKDE5NCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLndpZHRoKS50by5lcXVhbCgxOTQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIGhhbmRsZSB3aWRnZXRzIHRoYXQgYXJlbnQgb2Ygc2hhcmVkIHBvbGljeScsICgpPT57XHJcbiAgICAgICAgICAgIGxldCBudWxsd2lkZ2V0ID0gbmV3IFNULldpZGdldHMuUGFuZWwoKTtcclxuICAgICAgICAgICAgbGV0IHdpZGdldDNcclxuICAgICAgICAgICAgPSBuZXcgU1QuV2lkZ2V0cy5CdXR0b24od2lkZ2V0MCwge3dpZHRoOiAxMDAsIGhlaWdodDogMTAwfSk7XHJcbiAgICAgICAgICAgIHdpZGdldDMuaFBvbGljeSA9IG5ldyBTVC5TaXplUG9saWNpZXMuRml4ZWRQb2xpY3kod2lkZ2V0Myk7XHJcbiAgICAgICAgICAgIHdpZGdldDAuaFBvbGljeS5leGVjKCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLndpZHRoKS50by5lcXVhbCgxNDIpO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0Mi53aWR0aCkudG8uZXF1YWwoMTQyKTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDMud2lkdGgpLnRvLmVxdWFsKDEwMCk7XHJcbiAgICAgICAgICAgIG51bGx3aWRnZXQuYWRkQ2hpbGQod2lkZ2V0Myk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3BhcmVudFJlYWR5VicsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBzaXplIHRoZSB3aWRnZXRzIGVxdWFsIHNpemUgaWYgYWxsIGhhdmUgc2hhcmVkIHBvbGljeScsICgpPT57XHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICBzYW1lIGFzIGFib3ZlIHRlc3QuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIGhhbmRsZSB3aWRnZXRzIHRoYXQgYXJlbnQgb2Ygc2hhcmVkIHBvbGljeScsICgpPT57XHJcbiAgICAgICAgICAgIC8qXHJcbiAgICAgICAgICAgICAgICBzYW1lIGFzIGFib3ZlIHRlc3QuXHJcbiAgICAgICAgICAgICAqL1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNjb25zdW1lVW51c2VkU3BhY2VIKCknLCAoKT0+e1xyXG4gICAgICAgIC8vIFRPRE9cclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjY29uc3VtZVVudXNlZFNwYWNlVigpJywgKCk9PntcclxuICAgICAgICAvLyBUT0RPXHJcbiAgICB9KTtcclxufSk7XHJcbiIsInJlcXVpcmUoJy4vQmFzZVBvbGljeS1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vRXhwYW5kaW5nUG9saWN5LXNwZWMnKTtcclxucmVxdWlyZSgnLi9GaXhlZFBvbGljeS1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vU2hhcmVkRXhwYW5kaW5nUG9saWN5LXNwZWMnKTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLypcclxuVE9ETzpcclxudGVzdCB0aGluZ3MgdGhhdCBzaG91bGQgaGFwcGVuIHdoZW4gZXZlbnRzIGFyZSBmaXJlZC5cclxuZWcuIHdoZW4gcGFkZGluZyBjaGFuZ2VzIF91cGRhdGVDbGlwR3JhcGhpYyBzaG91bGQgYmUgY2FsbGVkLlxyXG4gKi9cclxuXHJcbmRlc2NyaWJlKCdCYXNlV2lkZ2V0JywgKCk9PntcclxuICAgIGxldCB3aWRnZXQwID0gbmV3IFNULldpZGdldHMuUGFuZWwoKTtcbiAgICBsZXQgd2lkZ2V0MSA9IG5ldyBTVC5XaWRnZXRzLlBhbmVsKHdpZGdldDApO1xuICAgIGxldCB3aWRnZXQyID0gbmV3IFNULldpZGdldHMuUGFuZWwod2lkZ2V0MSk7XG5cclxuICAgIGJlZm9yZUVhY2goKCk9PntcclxuICAgICAgICB3aWRnZXQxLmxheW91dFxyXG4gICAgICAgICAgICA9IG5ldyBTVC5MYXlvdXRzLkZpeGVkTGF5b3V0KHdpZGdldDEpO1xyXG4gICAgICAgIHdpZGdldDIuaFBvbGljeVxyXG4gICAgICAgICAgICA9IG5ldyBTVC5TaXplUG9saWNpZXMuRml4ZWRQb2xpY3kod2lkZ2V0Mik7XG4gICAgICAgIHdpZGdldDAuaFBvbGljeVxyXG4gICAgICAgICAgICA9IG5ldyBTVC5TaXplUG9saWNpZXMuRml4ZWRQb2xpY3kod2lkZ2V0MCk7XG4gICAgICAgIHdpZGdldDEudmFsaWRhdGUoKTtcclxuICAgICAgICB3aWRnZXQwLnZhbGlkYXRlKCk7XHJcbiAgICAgICAgd2lkZ2V0Mi52YWxpZGF0ZSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgaXQoJ3Nob3VsZCBwYXJlbnQgb25lIHdpZGdldCB0byBhbm90aGVyJywgKCk9PntcclxuICAgICAgICBleHBlY3Qod2lkZ2V0Mi5wYXJlbnQpLnRvLmVxdWFsKHdpZGdldDEpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNiZWdpbkJ5cGFzc1VwZGF0ZSgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2VuZEJ5cGFzc1VwZGF0ZSgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3ZhbGlkYXRlV2lkdGgoKScsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBrZWVwIHdpZGdldHMgd2lkdGggd2l0aGluIG1pbi9tYXgnLCAoKT0+e1xyXG4gICAgICAgICAgICB3aWRnZXQyLm1pbi53aWR0aCA9IDEwO1xyXG4gICAgICAgICAgICB3aWRnZXQyLm1heC53aWR0aCA9IDgwO1xyXG4gICAgICAgICAgICB3aWRnZXQyLndpZHRoID0gMTAwO1xyXG4gICAgICAgICAgICB3aWRnZXQyLnZhbGlkYXRlV2lkdGgoKTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIud2lkdGgpLnRvLmVxdWFsKDgwKTtcclxuICAgICAgICAgICAgd2lkZ2V0Mi53aWR0aCA9IDU7XHJcbiAgICAgICAgICAgIHdpZGdldDIudmFsaWRhdGVXaWR0aCgpO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0Mi53aWR0aCkudG8uZXF1YWwoMTApO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyN2YWxpZGF0ZUhlaWdodCgpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGtlZXAgd2lkZ2V0cyBoZWlnaHQgd2l0aGluIG1pbi9tYXgnLCAoKT0+e1xyXG4gICAgICAgICAgICB3aWRnZXQyLm1pbi5oZWlnaHQgPSAxMDtcclxuICAgICAgICAgICAgd2lkZ2V0Mi5tYXguaGVpZ2h0ID0gODA7XHJcbiAgICAgICAgICAgIHdpZGdldDIuaGVpZ2h0ID0gMTAwO1xyXG4gICAgICAgICAgICB3aWRnZXQyLnZhbGlkYXRlSGVpZ2h0KCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLmhlaWdodCkudG8uZXF1YWwoODApO1xyXG4gICAgICAgICAgICB3aWRnZXQyLmhlaWdodCA9IDU7XHJcbiAgICAgICAgICAgIHdpZGdldDIudmFsaWRhdGVIZWlnaHQoKTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIuaGVpZ2h0KS50by5lcXVhbCgxMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3VwZGF0ZSgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3ZhbGlkYXRlKCknLCAoKT0+e1xyXG5cclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjaW52YWxpZGF0ZSgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3JvdXRlSW52YWxpZGF0aW9uKCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgaW52YWxpZGF0ZSB0aGUgaGlnaGVzdCBwYXJlbnQnLCAoKT0+e1xyXG4gICAgICAgICAgICB3aWRnZXQxLmxheW91dFxyXG4gICAgICAgICAgICAgICAgPSBuZXcgU1QuTGF5b3V0cy5IQm94TGF5b3V0KHdpZGdldDEpO1xyXG4gICAgICAgICAgICB3aWRnZXQyLmxheW91dFxuICAgICAgICAgICAgICAgID0gbmV3IFNULkxheW91dHMuSEJveExheW91dCh3aWRnZXQyKTtcclxuICAgICAgICAgICAgICAgIHdpZGdldDIucm91dGVJbnZhbGlkYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQwLnZhbGlkKS50by5iZS5mYWxzZTtcclxuICAgICAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLnZhbGlkKS50by5iZS50cnVlO1xyXG4gICAgICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIudmFsaWQpLnRvLmJlLnRydWU7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgaW52YWxpZGF0ZSB0aGUgZmlyc3QgcGFyZW50IHdpdGggYSBmaXhlZCBzaXplIHBvbGljeScsICgpPT57XHJcbiAgICAgICAgICAgIHdpZGdldDIucm91dGVJbnZhbGlkYXRpb24oKTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDAudmFsaWQpLnRvLmJlLnRydWU7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLnZhbGlkKS50by5iZS5mYWxzZTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIudmFsaWQpLnRvLmJlLnRydWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3JlY3Vyc2l2ZVJvdXRlVXBkYXRlKCknLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgcm91dGUgdXBkYXRlIHRvIGl0c2VsZiBpZiBubyBwYXJlbnQgZXhpc3QnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgdXBkYXRlU3B5ID0gc2lub24uc3B5KHdpZGdldDAsICd1cGRhdGUnKTtcclxuICAgICAgICAgICAgd2lkZ2V0MC5yZWN1cnNpdmVSb3V0ZVVwZGF0ZSgpO1xyXG4gICAgICAgICAgICBleHBlY3QodXBkYXRlU3B5LmNhbGxlZCkudG8uYmUudHJ1ZTtcclxuICAgICAgICAgICAgd2lkZ2V0MC51cGRhdGUucmVzdG9yZSgpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIHJlY3Vyc2l2bGV5IHJ1biB0aGlzIGZ1bmN0aW9uIGlmIHRoZSBwYXJlbnQgaXMgdmFsaWQnLCAoKT0+e1xyXG4gICAgICAgICAgICB3aWRnZXQxLmludmFsaWRhdGUoKTtcclxuICAgICAgICAgICAgbGV0IHNweSA9IHNpbm9uLnNweSh3aWRnZXQxLCAncmVjdXJzaXZlUm91dGVVcGRhdGUnKTtcclxuICAgICAgICAgICAgd2lkZ2V0Mi5yZWN1cnNpdmVSb3V0ZVVwZGF0ZSgpO1xyXG4gICAgICAgICAgICBleHBlY3Qoc3B5LmNhbGxlZCkudG8uYmUudHJ1ZTtcclxuICAgICAgICAgICAgd2lkZ2V0MS5yZWN1cnNpdmVSb3V0ZVVwZGF0ZS5yZXN0b3JlKCk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgcm91dGUgdXBkYXRlIHRvIGl0c2VsZiBpZiBwYXJlbnQgaXMgdmFsaWQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgdXBkYXRlU3B5ID0gc2lub24uc3B5KHdpZGdldDAsICd1cGRhdGUnKTtcclxuICAgICAgICAgICAgd2lkZ2V0MC5yZWN1cnNpdmVSb3V0ZVVwZGF0ZSgpO1xyXG4gICAgICAgICAgICBleHBlY3QodXBkYXRlU3B5LmNhbGxlZCkudG8uYmUudHJ1ZTtcclxuICAgICAgICAgICAgd2lkZ2V0MC51cGRhdGUucmVzdG9yZSgpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNyZW5kZXJDYW52YXMoKScsICgpPT57XHJcblxyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyNyZW5kZXJXZWJHTCgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3NldFBhcmVudCgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2FkZENoaWxkJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCBlYWNoIFBJWEkuQ29udGFpbmVycyBtYXNrIHRvIG51bGwnLCAoKT0+e1xuICAgICAgICAgICAgICAgIGxldCBwYyA9IG5ldyBQSVhJLkNvbnRhaW5lcigpO1xyXG4gICAgICAgICAgICAgICAgd2lkZ2V0Mi5hZGRDaGlsZChwYyk7XHJcbiAgICAgICAgICAgICAgICBleHBlY3QocGMubWFzaykudG8uYmUubnVsbDtcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgYWRkIGl0cyB0aGVtZSB0byBlYWNoIEJhc2VXaWRnZXQgY2hpbGQgYWRkZWQnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0Mi50aGVtZSkudG8uZXF1YWwod2lkZ2V0MS50aGVtZSk7XHJcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBzZXQgbWFzayB0byBudWxsIGlmIGNoaWxkIGhhcyB1cGRhdGVPbkhvc3RDaGFuZ2VzID0gZmFsc2UgJ1xuICAgICAgICAgICAgKyAnZm9yIGJvdGggc2l6ZSBwb2xpY2llcycsICgpPT57XG4gICAgICAgICAgICAgICAgLy8gc2hvdWxkIHNldCB0byBwYXJlbnRcbiAgICAgICAgICAgIHdpZGdldDEubGF5b3V0ID0gbmV3IFNULkxheW91dHMuVkJveExheW91dCh3aWRnZXQxKTtcbiAgICAgICAgICAgIHdpZGdldDIuaFBvbGljeVxuICAgICAgICAgICAgPSBuZXcgU1QuU2l6ZVBvbGljaWVzLkZpeGVkUG9saWN5KHdpZGdldDIpO1xuXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0Mi5zaXplUHJveHkubWFzaykudG8uZXF1YWwod2lkZ2V0MS5jbGlwR3JhcGhpYyk7XG5cbiAgICAgICAgICAgIHdpZGdldDIuaFBvbGljeVxuICAgICAgICAgICAgPSBuZXcgU1QuU2l6ZVBvbGljaWVzLkV4cGFuZGluZ1BvbGljeSh3aWRnZXQyLCBTVC5IT1JJWk9OVEFMKTtcbiAgICAgICAgICAgIHdpZGdldDIudlBvbGljeVxuICAgICAgICAgICAgPSBuZXcgU1QuU2l6ZVBvbGljaWVzLkV4cGFuZGluZ1BvbGljeSh3aWRnZXQyLCBTVC5WRVJUSUNBTCk7XG5cbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLnNpemVQcm94eS5tYXNrKS50by5iZS5udWxsO1xuICAgICAgICB9KTtcblxuICAgIGl0KCdzaG91bGQgbWFzayBjaGlsZHJlbiBpZiBpdHMgbGF5b3V0IGhhcyB1cGRhdGVPbkhvc3RDaGFuZ2VzID0gdHJ1ZScsXG4gICAgICAgICgpPT57XG4gICAgICAgICAgICB3aWRnZXQxLmxheW91dCA9IG5ldyBTVC5MYXlvdXRzLkZpeGVkTGF5b3V0KHdpZGdldDEpO1xuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIuc2l6ZVByb3h5Lm1hc2spLnRvLmVxdWFsKHdpZGdldDEuY2xpcEdyYXBoaWMpO1xuICAgICAgICB9KTtcblxyXG4gICAgICAgIC8vIGl0KCdzaG91bGQgYWRkIGl0cyBjbGlwR3JhcGhpYyB0byBlYWNoIEJhc2VXaWRnZXQgY2hpbGQgYWRkZWRzJ1xuICAgICAgICAvLyAgICAgKyAnIHNpemUgcHJveHknLCAoKT0+e1xuICAgICAgICAvLyAgICAgZXhwZWN0KHdpZGdldDIuc2l6ZVByb3h5Lm1hc2spLnRvLmVxdWFsKHdpZGdldDEuY2xpcEdyYXBoaWMpO1xuICAgICAgICAvLyB9KTtcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2FkZENoaWxkQXQoKScsICgpPT57XHJcbiAgICAgICAgLy8gc2FtZSBhcyAjYWRkQ2hpbGRcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjb25DaGlsZHJlbkNoYW5nZSgpJywgKCk9PntcclxuXHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI2FwcGx5UG9zaXRpb24oKScsICgpPT57XHJcblxyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJ191cGRhdGVDbGlwR3JhcGhpYygpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCB0byBzaXplIG9mIHdpZGdldCAtIHBhZGRpbmcnLCAoKT0+e1xuICAgICAgICAgICAgd2lkZ2V0Mi52UG9saWN5XG4gICAgICAgICAgICA9IG5ldyBTVC5TaXplUG9saWNpZXMuRml4ZWRQb2xpY3kod2lkZ2V0Mik7XG4gICAgICAgICAgICB3aWRnZXQyLm1heC53aWR0aCA9IDEwMDA7XHJcbiAgICAgICAgICAgIHdpZGdldDIubWF4LmhlaWdodCA9IDEwMDA7XHJcbiAgICAgICAgICAgIHdpZGdldDIud2lkdGggPSA0MDA7XHJcbiAgICAgICAgICAgIHdpZGdldDIuaGVpZ2h0ID0gNDAwO1xyXG4gICAgICAgICAgICB3aWRnZXQxLnVwZGF0ZSgpOyAvLyBzaG91bGQgY2FsbCBfdXBkYXRlQ2xpcEdyYXBoaWMoKVxyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0Mi5jbGlwR3JhcGhpYy53aWR0aCkudG8uZXF1YWwoMzkyKTtcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLmNsaXBHcmFwaGljLmhlaWdodCkudG8uZXF1YWwoMzkyKTtcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBwb3MgdG8gdGhlIHRvcCBsZWZ0IHBhZGRpbmcgdmFsdWVzJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIuY2xpcEdyYXBoaWMueCkudG8uZXF1YWwoNCk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLmNsaXBHcmFwaGljLnkpLnRvLmVxdWFsKDQpO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIHNldCByZW5kZXJhYmxlIHRvIGZhbHNlJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIuY2xpcEdyYXBoaWMucmVuZGVyYWJsZSkudG8uYmUuZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3RoZW1lJywgKCk9PntcclxuICAgICAgICBsZXQgYVRobSA9IG5ldyBTVC5UaGVtZSgpO1xyXG4gICAgICAgIGl0KCdzaG91bGQgYXBwbHkgdGhlIHNldCB0aGVtZSB0byBjaGlsZHJlbiByZWN1cnNpdmVseScsICgpPT57XHJcbiAgICAgICAgICAgIHdpZGdldDAudGhlbWUgPSBhVGhtO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS50aGVtZSkudG8uZXF1YWwod2lkZ2V0MC50aGVtZSk7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLnRoZW1lKS50by5lcXVhbCh3aWRnZXQxLnRoZW1lKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjZGlzYWJsZWQnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgZGlzYWJsZSBpdHNlbGYgYW5kIGl0cyBjaGlsZHJlbiB3aGVuIHNldCB0byBmYWxzZScsICgpPT57XHJcbiAgICAgICAgICAgIHdpZGdldDAuZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MC5kaXNhYmxlZCkudG8uYmUudHJ1ZTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEuZGlzYWJsZWQpLnRvLmJlLnRydWU7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQyLmRpc2FibGVkKS50by5iZS50cnVlO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpdCgnc2hvdWxkIGVuYWJsZSBpdHNlbGYgYW5kIGl0cyBjaGlsZHJlbiB3aGVuIHNldCB0byB0cnVlJywgKCk9PntcclxuICAgICAgICAgICAgd2lkZ2V0MC5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MC5kaXNhYmxlZCkudG8uYmUuZmFsc2U7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLmRpc2FibGVkKS50by5iZS5mYWxzZTtcclxuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDIuZGlzYWJsZWQpLnRvLmJlLmZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XG5cbiAgICBkZXNjcmliZSgnI19ldmFsdWF0ZU1hc2soKScsICgpPT57XG4gICAgICAgIGl0KCdzaG91bGQgbWFzayBhbGwgY2hpbGRyZW4gaWYgbGF5b3V0LnVwZGF0ZU9uSG9zdENoYW5nZXMgPSB0cnVlJyxcbiAgICAgICAgKCk9PntcbiAgICAgICAgICAgIHdpZGdldDAubGF5b3V0ID0gbmV3IFNULkxheW91dHMuRml4ZWRMYXlvdXQod2lkZ2V0MCk7XG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS5tYXNrKS50by5lcXVhbCh3aWRnZXQwLmNsaXBHcmFwaGljKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBtYXNrIGNoaWxkIGlmIGVpdGhlciBwb2xpY3kgaGFzIHVwZGF0ZU9uSG9zdENoYW5nZXMgdHJ1ZSdcbiAgICAgICAgKyAnIGFuZCB0aGUgcGFyZW50cyBsYXlvdXQgaGFzIHVwZGF0ZU9uSG9zdENoYW5nZXMgZmFsc2UnLCAoKT0+e1xuICAgICAgICAgICAgd2lkZ2V0MC5sYXlvdXQgPSBuZXcgU1QuTGF5b3V0cy5WQm94TGF5b3V0KHdpZGdldDAsIFNULlZFUlRJQ0FMKTtcbiAgICAgICAgICAgIHdpZGdldDEuaFBvbGljeSA9IG5ldyBTVC5TaXplUG9saWNpZXMuRml4ZWRQb2xpY3kod2lkZ2V0MSk7XG4gICAgICAgICAgICBleHBlY3Qod2lkZ2V0MS5tYXNrKS50by5lcXVhbCh3aWRnZXQwLmNsaXBHcmFwaGljKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBzZXQgbWFzayB0byBudWxsIGlmIGxheW91dCBoYXMgdXBkYXRlT25Ib3N0Q2hhbmdlcyBmYWxzZSAnXG4gICAgICAgICsgJ2FuZCBjaGlsZHMgcG9saWNpZXMgaGF2ZSB1cGRhdGVPbkhvc3RDaGFuZ2VzIGZhbHNlJywgKCk9PntcbiAgICAgICAgICAgIHdpZGdldDAubGF5b3V0ID0gbmV3IFNULkxheW91dHMuVkJveExheW91dCh3aWRnZXQwLCBTVC5WRVJUSUNBTCk7XG4gICAgICAgICAgICB3aWRnZXQxLmhQb2xpY3lcbiAgICAgICAgICAgID0gbmV3IFNULlNpemVQb2xpY2llcy5FeHBhbmRpbmdQb2xpY3kod2lkZ2V0MSwgU1QuSE9SSVpPTlRBTCk7XG4gICAgICAgICAgICB3aWRnZXQxLnZQb2xpY3lcbiAgICAgICAgICAgID0gbmV3IFNULlNpemVQb2xpY2llcy5FeHBhbmRpbmdQb2xpY3kod2lkZ2V0MSwgU1QuVkVSVElDQUwpO1xuICAgICAgICAgICAgZXhwZWN0KHdpZGdldDEubWFzaykudG8uYmUubnVsbDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaXQoJ3Nob3VsZCBzZXQgbWFzayB0byBudWxsIGlmIGNoaWxkIGlzIG5vdCBhIHdpZGdldCcsICgpPT57XG4gICAgICAgICAgICBsZXQgcGMgPSBuZXcgUElYSS5Db250YWluZXIoKTtcbiAgICAgICAgICAgIHdpZGdldDAuYWRkQ2hpbGQocGMpO1xuICAgICAgICAgICAgd2lkZ2V0MC5fZXZhbHVhdGVNYXNrKCk7XG4gICAgICAgICAgICBleHBlY3QocGMubWFzaykudG8uYmUubnVsbDtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ0J1dHRvbicsICgpPT57XHJcblxyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ0xhYmVsJywgKCk9PntcclxuICAgIGxldCBsYWJlbCA9IG5ldyBTVC5XaWRnZXRzLkxhYmVsKG51bGwsIHt0ZXh0OiAndGVzdCd9KTtcclxuXHJcbiAgICBpdCgnc2hvdWxkIHNldCB0ZXh0IGZyb20gb3B0aW9uIGlmIHNldCcsICgpPT57XHJcbiAgICAgICAgZXhwZWN0KGxhYmVsLnRleHQpLnRvLmVxdWFsKCd0ZXN0Jyk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI190ZXh0T2JqJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGhhdmUgYSBudWxsIG1hc2snLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3QobGFiZWwuX3RleHRPYmoubWFzaykudG8uZXF1YWwobnVsbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI19jbGlwR3JhcGhpYycsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBiZSB1bnJlbmRlcmFibGUnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3QobGFiZWwuX2NsaXBHcmFwaGljLnJlbmRlcmFibGUpLnRvLmVxdWFsKGZhbHNlKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjdGV4dCcsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCB1cGRhdGUgX3RleHRPYmpzIHRleHQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsYWJlbC50ZXh0ID0gJ3VwZGF0ZSc7XHJcbiAgICAgICAgICAgIGV4cGVjdChsYWJlbC5fdGV4dE9iai50ZXh0KS50by5lcXVhbCgndXBkYXRlJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbmRlc2NyaWJlKCdQYW5lbCcsICgpPT57XHJcbiAgICBsZXQgcGFuZWwgPSBuZXcgU1QuV2lkZ2V0cy5QYW5lbCgpO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjX2JrZ09iaicsICgpPT57XHJcbiAgICAgICAgaXQoJ3Nob3VsZCBiZSBhIHNwcml0ZScsICgpPT57XHJcbiAgICAgICAgICAgIGV4cGVjdChwYW5lbC5fYmtnT2JqKS50by5iZS5hbi5pbnN0YW5jZW9mKFBJWEkuU3ByaXRlKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ1NJVHJhbnNmb3JtJywgKCk9PntcclxuICAgIGl0KCdzaG91bGQgYWxsb3cgYSB3aWRnZXQgdG8gdHJhbnNmb3JtIGl0cyBkaW1lbnNpb25zJ1xyXG4gICAgICAgICsgJyBpbmRlcGVuZGVudCBmcm9tIGl0cyBwYXJlbnQnLCAoKT0+e1xyXG4gICAgICAgICAgICBsZXQgd2lkZ2V0MCA9IG5ldyBTVC5XaWRnZXRzLlBhbmVsKCk7XHJcbiAgICAgICAgICAgIHdpZGdldDAud2lkdGggPSAxMDAwO1xyXG4gICAgICAgICAgICBsZXQgd2lkZ2V0MSA9IG5ldyBTVC5XaWRnZXRzLlBhbmVsKCk7XHJcbiAgICAgICAgICAgIHdpZGdldDEud2lkdGggPSAyMDA7XHJcbiAgICAgICAgICAgIHdpZGdldDAuYWRkQ2hpbGQod2lkZ2V0MSk7XHJcbiAgICAgICAgICAgIHdpZGdldDAud2lkdGggPSA1MDA7XHJcbiAgICAgICAgICAgIGV4cGVjdCh3aWRnZXQxLndpZHRoKS50by5lcXVhbCgyMDApO1xyXG4gICAgICAgIH0pO1xyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLy8gVE9ETzogV291bGQgbGlrZSB0byBnZXQgbW9yZSB0ZXN0IGhlcmUgYXQgc29tZSBwb2ludFxyXG5cclxuZGVzY3JpYmUoJ1NsaWRlcicsICgpPT57XHJcbiAgICBsZXQgc2wgPSBuZXcgU1QuV2lkZ2V0cy5TbGlkZXIobnVsbCwge3dpZHRoOiAyMDAsIGhlaWdodDogMzB9KTtcclxuICAgIHNsLnVwZGF0ZSgpO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjdHJhY2snLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgYmUgYW4gaW1hZ2Ugd2lkZ2V0JywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHNsLnRyYWNrKS50by5iZS5hbi5pbnN0YW5jZW9mKFNULldpZGdldHMuSW1hZ2UpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZGVzY3JpYmUoJyN0cmFja0hpdFJlY3QnLCAoKT0+e1xyXG4gICAgICAgIGl0KCdzaG91bGQgYmUgYSByZWN0YW5nbGUnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3Qoc2wudHJhY2tIaXRSZWN0KS50by5iZS5hbi5pbnN0YW5jZW9mKFBJWEkuUmVjdGFuZ2xlKTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlc2NyaWJlKCcjYnV0dG9uJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIGJlIGFuIGltYWdlIHdpZGdldCcsICgpPT57XHJcbiAgICAgICAgICAgIGV4cGVjdChzbC5idXR0b24pLnRvLmJlLmFuLmluc3RhbmNlb2YoU1QuV2lkZ2V0cy5JbWFnZSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3VwZGF0ZVRyYWNrSGl0UmVjdCgpJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCB0aGUgc2l6ZSBvZiB0aGUgY2xpY2thYmxlIGFyZWEgb2YgdGhlIHRyYWNrJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHNsLnRyYWNrSGl0UmVjdC54KS50by5lcXVhbCgwKTtcclxuICAgICAgICAgICAgZXhwZWN0KHNsLnRyYWNrSGl0UmVjdC55KS50by5lcXVhbCgtNSk7XHJcbiAgICAgICAgICAgIGV4cGVjdChzbC50cmFja0hpdFJlY3Qud2lkdGgpLnRvLmVxdWFsKDIwMCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChzbC50cmFja0hpdFJlY3QuaGVpZ2h0KS50by5lcXVhbChzbC50cmFjay5oZWlnaHQgKyAxMCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI3ZhbHVlJywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCB0aGUgYnV0dG9ucyBwb3Mgd2hlbiBzZXQnLCAoKT0+e1xyXG4gICAgICAgICAgICBzbC52YWx1ZSA9IDAuNTtcclxuICAgICAgICAgICAgY29uc3QgYWN0dWFsID0gOTA7XHJcbiAgICAgICAgICAgIGV4cGVjdChzbC5idXR0b24ueCkudG8uZXF1YWwoYWN0dWFsKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCByZXR1cm4gdGhlIHZhbHVlIGZyb20gdGhlIHBvc2l0aW9uJywgKCk9PntcclxuICAgICAgICAgICAgY29uc3QgYWN0dWFsID0gMC41O1xyXG4gICAgICAgICAgICBleHBlY3Qoc2wudmFsdWUpLnRvLmVxdWFsKGFjdHVhbCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZXNjcmliZSgnI29yaWVudGF0aW9uJywgKCk9PntcclxuICAgICAgICBzbC5vcmllbnRhdGlvbiA9IFNULkhPUklaT05UQUw7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgc2V0IHRoZSBtaW4gYW5kIG1heCBoZWlnaHRzIHdoZW4gc2V0JywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHNsLm1pbi5oZWlnaHQpLnRvLmVxdWFsKHNsLmJ1dHRvbi5oZWlnaHQpO1xyXG4gICAgICAgICAgICBleHBlY3Qoc2wubWluLndpZHRoKS50by5lcXVhbChzbC5idXR0b24ud2lkdGgqMik7XG4gICAgICAgICAgICBleHBlY3Qoc2wubWF4LmhlaWdodCkudG8uZXF1YWwoc2wuYnV0dG9uLmhlaWdodCk7XHJcbiAgICAgICAgICAgIGV4cGVjdChzbC5tYXgud2lkdGgpLnRvLmVxdWFsKDEwMDAwKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCBzZXQgdGhlIHRyYWNrIHNpemUnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3Qoc2wudHJhY2sud2lkdGgpLnRvLmVxdWFsKHNsLndpZHRoKTtcclxuICAgICAgICAgICAgZXhwZWN0KHNsLnRyYWNrLmhlaWdodCkudG8uZXF1YWwoNSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGl0KCdzaG91bGQgc2V0IGFsaWdubWVudHMnLCAoKT0+e1xyXG4gICAgICAgICAgICBleHBlY3Qoc2wubGF5b3V0LmFsaWdubWVudC5oQWxpZ24pLnRvLmVxdWFsKFNULkFsaWdubWVudC5sZWZ0KTtcclxuICAgICAgICAgICAgZXhwZWN0KHNsLmxheW91dC5hbGlnbm1lbnQudkFsaWduKS50by5lcXVhbChTVC5BbGlnbm1lbnQubWlkZGxlKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaXQoJ3Nob3VsZCBzZXQgdGhlIHRyYWNrcyBzaXplIHBvbGljaWVzJywgKCk9PntcclxuICAgICAgICAgICAgZXhwZWN0KHNsLnRyYWNrLmhQb2xpY3kpLnRvLmJlLmFuXHJcbiAgICAgICAgICAgICAgICAuaW5zdGFuY2VvZihTVC5TaXplUG9saWNpZXMuRXhwYW5kaW5nUG9saWN5KTtcclxuXHJcbiAgICAgICAgICAgIGV4cGVjdChzbC50cmFjay52UG9saWN5KS50by5iZS5hblxyXG4gICAgICAgICAgICAgICAgLmluc3RhbmNlb2YoU1QuU2l6ZVBvbGljaWVzLkZpeGVkUG9saWN5KTtcclxuICAgICAgICB9KTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ1N0YWdlV2lkZ2V0JywgKCk9PntcclxuICAgIGl0KCdTaG91bGQgaGF2ZSBhIGJvdW5kcyBhcyBiaWcgYXMgdGhlIHVzZXIgZGVmaW5lZCBzaXplJywgKCk9PntcclxuICAgICAgICBsZXQgc3cgPSBuZXcgU1QuV2lkZ2V0cy5TdGFnZVdpZGdldChudWxsLCB7d2lkdGg6IDYwMCwgaGVpZ2h0OiA4MDB9KTtcclxuICAgICAgICBsZXQgYjEgPSBuZXcgU1QuV2lkZ2V0cy5CdXR0b24oc3csIHt3aWR0aDogOTAwLCBoZWlnaHQ6IDkwMH0pOyAvL2VzbGludC1kaXNhYmxlLWxpbmVcclxuICAgICAgICBsZXQgYjIgPSBuZXcgU1QuV2lkZ2V0cy5QYW5lbChzdywge3dpZHRoOiAxMDAsIGhlaWdodDogMTAwLCB4OiA3MDB9KTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxyXG4gICAgICAgIGxldCBib3VuZHMgPSBzdy5nZXRCb3VuZHMoKTtcclxuXHJcbiAgICAgICAgZXhwZWN0KGJvdW5kcy53aWR0aCkudG8uZXF1YWwoNjAwKTtcclxuICAgICAgICBleHBlY3QoYm91bmRzLmhlaWdodCkudG8uZXF1YWwoODAwKTtcclxuICAgIH0pO1xyXG59KTtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuZGVzY3JpYmUoJ1RleHRCdXR0b24nLCAoKT0+e1xyXG4gICAgZGVzY3JpYmUoJyNUZXh0JywgKCk9PntcclxuICAgICAgICBpdCgnc2hvdWxkIHNldCB0aGUgdGV4dCBmb3IgdGhlIGNvbnRhaW5lZCBsYWJlbCcsICgpPT57XHJcbiAgICAgICAgICAgIGxldCB0YiA9IG5ldyBTVC5XaWRnZXRzLlRleHRCdXR0b24oKTtcclxuICAgICAgICAgICAgdGIudGV4dCA9ICdtZW93JztcclxuICAgICAgICAgICAgZXhwZWN0KHRiLmxhYmVsLnRleHQpLnRvLmVxdWFsKCdtZW93Jyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9KTtcclxufSk7XHJcbiIsInJlcXVpcmUoJy4vQmFzZVdpZGdldC1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vQnV0dG9uLXNwZWMnKTtcclxucmVxdWlyZSgnLi9MYWJlbC1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vUGFuZWwtc3BlYycpO1xyXG5yZXF1aXJlKCcuL1NJVHJhbnNmb3JtLXNwZWMnKTtcclxucmVxdWlyZSgnLi9TdGFnZVdpZGdldC1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vVGV4dEJ1dHRvbi1zcGVjJyk7XHJcbnJlcXVpcmUoJy4vU2xpZGVyLXNwZWMnKTtcclxuIl19
