import React from 'react';


export type UseUrlQueryParamOptions<T = any> = {
  default?: T,
  serialize?: (value: T) => string,
  deserialize?: (value: string) => T
}

const defaultOptions: Required<UseUrlQueryParamOptions> = {
  default: null,
  serialize: identity,
  deserialize: identity
}

// Like useState(), but for URL query params
// Takes the name of the value and optionally a default and serializer/deserializer function
export function useUrlQueryParam<T = any>(name: string, options: UseUrlQueryParamOptions<T> = {}) : [T, (v: T) => void] {
  const _options = { ...(defaultOptions as Required<UseUrlQueryParamOptions<T>>), ...options };

  // Start with the current value, and update if it changes
  const [value, setValue] = React.useState<T>(getQueryParam(name, _options));
  useHistoryStateListener(() => setValue(getQueryParam(name, _options)), [name]);

  // Curry setQueryParam using the given param name
  const setter = React.useCallback((newValue: any) => {
    setQueryParam(name, newValue, _options);
    setValue(getQueryParam(name, _options));
  }, [name, ...Object.values(_options)]);

  return [value, setter];
}


// For booleans
const defaultBooleanOptions: Required<UseUrlQueryParamOptions<boolean>> = {
  default: false,
  serialize: (v) => v ? '1' : '0',
  deserialize: (v) => parseInt(v) ? true : false
}

export function useUrlQueryParamBoolean(name: string, defaultValue: boolean = false) {
  const _options = { ...defaultBooleanOptions, default: defaultValue };
  return useUrlQueryParam(name, _options);
}


// For string arrays
const defaultArrayOptions: Required<UseUrlQueryParamOptions<string[]>> = {
  default: [],
  serialize: (v) => encodeURIComponent(v.join(',')),
  deserialize: (v) => decodeURIComponent(v).split(',')
}

export function useUrlQueryParamArray(name: string) {
  return useUrlQueryParam(name, defaultArrayOptions);
}


// Used as a default serializer/deserializer
function identity(value: any) {
  return value;
}

// Call the given callback if any history change events occur
function useHistoryStateListener(onChange: () => void, deps: any[]) {
  React.useEffect(() => {
    window.addEventListener('popstate', onChange);
    window.addEventListener('pushstate', onChange);
    window.addEventListener('replacestate', onChange);

    return () => {
      window.removeEventListener('popstate', onChange);
      window.removeEventListener('pushstate', onChange);
      window.removeEventListener('replacestate', onChange);
    };
  }, deps);
}

// Get a query param by name, using the given default and deserializer
function getQueryParam(name: string, options: Required<UseUrlQueryParamOptions>) {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(name);

  return value === null ? options.default : options.deserialize(value);
}

// Set a query param by name, first serializing the value
// If the value matches the given default, remove it from the string to make it as short
// as possible
function setQueryParam(name: string, value: any, options: Required<UseUrlQueryParamOptions>) {
  const params = new URLSearchParams(window.location.search);

  if (value === null || value === undefined || value === options.default)
    params.delete(name);
  else
    params.set(name, options.serialize(value));

  window.history.pushState(null, window.document.title, `?${params.toString()}`);
}