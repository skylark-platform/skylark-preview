import { ExtensionMessage } from "../interfaces";

export const hasProperty = <T, K extends PropertyKey>(
  object: T,
  property: K,
): object is T & Record<K, unknown> =>
  Object.prototype.hasOwnProperty.call(object, property);

export const compareArrays = (a: unknown[], b: unknown[]) =>
  a.length === b.length && a.every((element, index) => element === b[index]);

export const sendExtensionMessage = (message: ExtensionMessage) =>
  browser.runtime.sendMessage(message);
