class ByteArray {
  data: number[] = []

  getData () {
    return new Uint8Array(this.data)
  }

  writeByte (value: number) {
    this.data.push(value)
  }

  writeUTFBytes (string: string) {
    for (let i = 0, length = string.length; i < length; i++) {
      this.writeByte(string.charCodeAt(i))
    }
  }

  writeBytes (array: number[]) {
    for (let i = 0, length = array.length; i < length; i++) {
      this.writeByte(array[i])
    }
  }
}

export {
  ByteArray
}
