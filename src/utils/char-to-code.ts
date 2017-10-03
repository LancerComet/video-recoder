/**
 * Transform char to ASCII code.
 *
 * @param {string} char
 * @returns {number}
 */
function charToCode (char: string): number {
  return char.charCodeAt(0)
}

export {
  charToCode
}
