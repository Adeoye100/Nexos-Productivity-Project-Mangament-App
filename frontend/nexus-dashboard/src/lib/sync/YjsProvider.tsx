import React, { createContext, useContext, ReactNode } from 'react';
import * as Y from 'yjs';
import { ydoc } from './ydoc';

interface YjsContextType {
  doc: Y.Doc;
}

const YjsContext = createContext<YjsContextType | null>(null);

export const YjsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <YjsContext.Provider value={{ doc: ydoc }}>
      {children}
    </YjsContext.Provider>
  );
};

export const useYDoc = () => {
  const context = useContext(YjsContext);
  if (!context) {
    throw new Error('useYDoc must be used within a YjsProvider');
  }
  return context.doc;
};
