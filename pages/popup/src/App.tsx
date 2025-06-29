import { useState, useEffect } from 'react';
import '@src/globals.css';
import { useSimpleStorage } from '@extension/shared/lib/hooks/useStorage';

export default function App() {
  const [isEnabled, setIsEnabled] = useSimpleStorage('enhancerEnabled', true);
  const [activeTab, setActiveTab] = useState<chrome.tabs.Tab | null>(null);

  useEffect(() => {
    // Obtém informação da aba atual
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      setActiveTab(tabs[0]);
    });
  }, []);

  // Verifica se estamos em uma página do mannco.store
  const isOnManncoSite = activeTab?.url?.includes('mannco.store') || false;

  return (
    <div className="w-80 p-4 font-sans text-white bg-gray-800">
      <h1 className="text-xl font-bold mb-4">Mannco.store Enhancer</h1>

      {!isOnManncoSite ? (
        <div className="text-yellow-400 mb-4">
          Esta extensão funciona apenas no site mannco.store
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isEnabled}
                  onChange={e => setIsEnabled(e.target.checked)}
                />
                <div
                  className={`w-10 h-5 ${
                    isEnabled ? 'bg-green-500' : 'bg-gray-600'
                  } rounded-full shadow-inner`}
                />
                <div
                  className={`absolute w-3 h-3 bg-white rounded-full top-1 transition-transform ${
                    isEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </div>
              <div className="ml-3 text-gray-100">{isEnabled ? 'Ativo' : 'Desativado'}</div>
            </label>
          </div>

          <div className="text-sm text-gray-300">
            <p>Funcionalidades:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Melhorias na interface</li>
              <li>Informações adicionais</li>
              <li>Cálculo de taxas</li>
              <li>Destaque de ofertas</li>
            </ul>
          </div>
        </>
      )}

      <div className="mt-4 text-xs text-gray-400 border-t border-gray-700 pt-2">
        v0.1.0 - Feito com ❤️ para a comunidade TF2
      </div>
    </div>
  );
}
