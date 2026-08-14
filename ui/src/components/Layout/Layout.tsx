import { Outlet } from 'react-router-dom';
import Sidebar from '../Sidebar/Sidebar';
import TopBar from '../TopBar/TopBar'; // Importando a TopBar que você moveu!
import './Layout.scss';

export default function Layout() {
  return (
    <div className="layout-container">
      {/* LADO ESQUERDO: O nosso novo componente Sidebar */}
      <Sidebar />

      {/* LADO DIREITO: TopBar + Conteúdo da Página */}
      <div className="main-wrapper">
        
        <TopBar />

        <main className="main-content">
          <Outlet />
        </main>
        
      </div>
    </div>
  );
}