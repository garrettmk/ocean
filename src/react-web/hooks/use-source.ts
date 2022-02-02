import React from 'react';
import { Source, subscribe, pipe } from '@/client/utils';


// Subscribe to values emitted from a source
export function useSource<T>(source: Source<T> | undefined, initial?: T) {
  const [value, setValue] = React.useState<T | undefined>(initial);
  React.useEffect(() => {
    if (!source) {
      setValue(undefined);
      return;
    }

    pipe(source, subscribe(setValue));
  }, [source]);

  return value;
}


// Same as above, but takes a factory function instead of a source. The result
// of the factory is memoized using deps.
export function useSourceFactory<T>(sourceFn: () => Source<T> | undefined, deps: any[] = []) {
  const source = React.useMemo(() => sourceFn(), deps);
  return useSource(source);
}