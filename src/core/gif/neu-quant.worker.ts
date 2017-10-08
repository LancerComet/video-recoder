import { NeuQuant } from './neu-quant'

addEventListener('message', event => {
  const { pixels, quality, pixelCount } = <IPostedData> event.data

  // Create image quant.
  const imageQuant = new NeuQuant(pixels, quality)

  // Get color table.
  const colorTable = imageQuant.getColormap()

  // Index pixels.
    // Pixel Count. 3 bytes represent one pixel.
  const indexedPixels = new Uint8Array(pixelCount)

  // Map image pixels to new palette.
  let j = 0
  for (let i = 0; i < pixelCount; i++) {
    const index = imageQuant.lookupRGB(
      pixels[j++] & 0xff,
      pixels[j++] & 0xff,
      pixels[j++] & 0xff
    )

    indexedPixels[i] = index

    // Skip useless bit that created in gif.js line 425.
    j++
  }

  postMessage({
    colorTable,
    indexedPixels
  })
})

interface IPostedData {
  pixels: Uint8Array
  quality: number
  pixelCount: number
  currentFramePixelsData: Uint8Array
}
