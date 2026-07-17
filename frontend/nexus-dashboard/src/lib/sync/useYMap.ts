import { useEffect, useState, useCallback, useMemo } from 'react';
import * as Y from 'yjs';
import { useYDoc } from './YjsProvider';

export function useYMap<T = any>(mapName: string) {
  const doc = useYDoc();
  const ymap = useMemo(() => doc.getMap<T>(mapName), [doc, mapName]);
  const [state, setState] = useState<Record<string, T>>(() => ymap.toJSON());

  useEffect(() => {
    const observer = () => {
      setState(ymap.toJSON());
    };

    ymap.observe(observer);
    // Initial sync in case it changed between initialization and observation
    setState(ymap.toJSON());

    return () => {
      ymap.unobserve(observer);
    };
  }, [ymap]);

  const set = useCallback((key: string, value: T) => {
    ymap.set(key, value);
  }, [ymap]);

  const remove = useCallback((key: string) => {
    ymap.delete(key);
  }, [ymap]);

  const get = useCallback((key: string) => {
    return ymap.get(key);
  }, [ymap]);

  return {
    state,
    set,
    remove,
    get,
    ymap // Expose underlying Y.Map for advanced use if needed
  };
}
