import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    // Só registramos que o componente carregou para debugging
    console.log('content ui loaded');
  }, []);

  // Não renderizamos nenhuma UI já que não queremos uma barra em todas as páginas
  // O content script principal já cuida de aplicar as melhorias ao mannco.store
  return null;
}
