/**
 * ByteArray Class.
 *
 * @class ByteArray
 */
class ByteArray {
  data: number[] = []

  getBinaryData () {
    return new Uint8Array(this.data)
  }

  writeByte (value) {
    this.data.push(value)
  }

  writeUTFBytes (str: string) {
    for (let i = 0, length = str.length; i < length; i++) {
      this.writeByte(str.charCodeAt(i))
    }
  }

  writeBytes (arr: number[], offset?: number, length?: number) {
    for (let i = offset || 0, len = length || arr.length; i < len; i++) {
      this.writeByte(arr[i])
    }
  }
}

export {
  ByteArray
}
