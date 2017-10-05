declare module 'worker-loader*' {
  const content: any
  export = content
}

/**
 * Overriding postMessage function in worker,
 *
 * @param {*} value
 * @param {string} [targetOrigin]
 */
declare function postMessage (value: any, targetOrigin?: string)
