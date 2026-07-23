const readingCache = new Map();

export function loadReading(number) {
  const readingNumber = Number(number);
  if (!Number.isInteger(readingNumber)) return Promise.reject(new Error("Invalid reading number"));
  if (readingCache.has(readingNumber)) return readingCache.get(readingNumber);

  const request = fetch(`${import.meta.env.BASE_URL}readings/${readingNumber}.json`)
    .then((response) => {
      if (!response.ok) throw new Error(`Reading ${readingNumber} returned ${response.status}`);
      return response.json();
    })
    .then((reading) => {
      if (reading?.number !== readingNumber || !reading.en?.text || !reading.fr?.text) {
        throw new Error(`Reading ${readingNumber} is malformed`);
      }
      return reading;
    })
    .catch((error) => {
      readingCache.delete(readingNumber);
      throw error;
    });

  readingCache.set(readingNumber, request);
  return request;
}

export function preloadReading(number) {
  return loadReading(number).catch(() => null);
}
