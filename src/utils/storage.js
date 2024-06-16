export const getLocalStorage = (value) => {
  const serializedState = localStorage.getItem(value);
  if (serializedState === null) return undefined;
  try {
    return JSON.parse(serializedState);
  } catch (error) {
    return undefined;
  }
};

export const setLocalStorage = (key, value) => {
  const serializedState = JSON.stringify(value);
  localStorage.setItem(key, serializedState);
};

export const removeLocalStorage = (value) => {
  localStorage.removeItem(value);
};
export const clearLocalStorage = () => {
  localStorage.clear();
};
