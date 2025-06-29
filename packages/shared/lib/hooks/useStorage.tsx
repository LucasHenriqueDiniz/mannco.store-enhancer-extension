import React, { useRef, useSyncExternalStore } from 'react';
import type { BaseStorage } from '@extension/storage';

type WrappedPromise = ReturnType<typeof wrapPromise>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const storageMap: Map<BaseStorage<any>, WrappedPromise> = new Map();

export const useStorage = <
  Storage extends BaseStorage<Data>,
  Data = Storage extends BaseStorage<infer Data> ? Data : unknown,
>(
  storage: Storage,
) => {
  const initializedRef = useRef(false);
  const _data = useSyncExternalStore<Data | null>(storage.subscribe, storage.getSnapshot);

  if (!storageMap.has(storage)) {
    storageMap.set(storage, wrapPromise(storage.get()));
  }
  if (_data !== null || initializedRef.current) {
    storageMap.set(storage, { read: () => _data });
    initializedRef.current = true;
  }

  return (_data ?? storageMap.get(storage)!.read()) as Exclude<Data, PromiseLike<unknown>>;
};

// Função simplificada para o caso específico que precisamos
export function useSimpleStorage<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  // Estado local para manter o valor
  const [value, setValue] = React.useState<T>(defaultValue);

  // Efeito para carregar o valor do armazenamento quando o componente montar
  React.useEffect(() => {
    chrome.storage.local.get(key).then(result => {
      if (result[key] !== undefined) {
        setValue(result[key]);
      }
    });

    // Ouvinte para detectar mudanças no armazenamento
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, area: string) => {
      if (area === 'local' && changes[key]) {
        setValue(changes[key].newValue);
      }
    };

    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }, [key]);

  // Função para atualizar o valor no armazenamento
  const updateValue = (newValue: T) => {
    chrome.storage.local.set({ [key]: newValue });
    setValue(newValue);
  };

  return [value, updateValue];
}

const wrapPromise = <R,>(promise: Promise<R>) => {
  let status = 'pending';
  let result: R;
  const suspender = promise.then(
    r => {
      status = 'success';
      result = r;
    },
    e => {
      status = 'error';
      result = e;
    },
  );

  return {
    read() {
      switch (status) {
        case 'pending':
          throw suspender;
        case 'error':
          throw result;
        default:
          return result;
      }
    },
  };
};
