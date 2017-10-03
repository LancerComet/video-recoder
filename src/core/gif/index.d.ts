/**
 * Interface of param of Gif constuctor.
 *
 * @interface IGif
 */
interface IGif {
  /** Image Width. */
  width: number

  /** Image Height. */
  height: number

  /** FPS setting. */
  fps?: number

  /** Repart type. */
  repeat?: TGiftRepeatType

  /** Image quality. */
  quality?: number
}

/**
 * Repeat type:
 *  - -1: No repeat.
 *  - 0: Forever.
 *  - Int: Repeat count.
 */
type TGiftRepeatType = -1 | 0 | number
