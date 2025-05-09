/**
 * @voilajs/appkit - Cache value serializer
 * @module @voilajs/appkit/cache/serializer
 */

/**
 * Creates a serializer for cache values
 * @param {Object} [options] - Serializer options
 * @returns {Object} Serializer with serialize/deserialize methods
 */
export function createSerializer(options = {}) {
    return {
      serialize(value) {
        try {
          return JSON.stringify(value);
        } catch (error) {
          throw new Error(`Failed to serialize value: ${error.message}`);
        }
      },
  
      deserialize(data) {
        try {
          return JSON.parse(data);
        } catch (error) {
          throw new Error(`Failed to deserialize value: ${error.message}`);
        }
      }
    };
  }