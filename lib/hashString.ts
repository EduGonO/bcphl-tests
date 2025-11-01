export const hashString = (value: string): number => {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    const charCode = value.charCodeAt(index);
    hash = (hash << 5) - hash + charCode;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export default hashString;
