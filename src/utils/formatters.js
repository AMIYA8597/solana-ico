import { Buffer } from "buffer";
window.Buffer = window.Buffer || Buffer;

export const formatLargeNumber = (number) => {
    if (typeof number === 'object' && number.toString) {
      return number.toString();
    }
    return number;
  };
  
  