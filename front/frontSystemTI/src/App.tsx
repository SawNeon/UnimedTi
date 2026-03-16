import { useState } from 'react';
import './index.css';
import { ProductForm } from './modules/Stock/pages/ProductForm';
import { ProductList } from './modules/Stock/pages/ProductList';
import type { ProductDTO } from './modules/Stock/types/Product';
import { ProductMovement } from './modules/Stock/pages/ProductMovement';
import type { AssetDTO } from './modules/Asset/types/Asset';
import { AssetForm } from './modules/Asset/pages/AssetForm';
import { Package, Desktop, House } from '@phosphor-icons/react';

function App() {

  const [activeModule, setActiveModule] = useState<'welcome' | 'stock' | 'asset'>('welcome');

  const [stockScreen, setStockScreen] = useState<'list' | 'form' | 'movement'>('list');

  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);

  const handleSelectModule = (module: 'welcome' | 'stock' | 'asset') => {
    setActiveModule(module);
    if (module === 'stock') {
      setStockScreen('list');
      setEditingProduct(null);
    }
  };
  const handleEdit = (product: ProductDTO) => {
    setEditingProduct(product); 
    setStockScreen('form');  
  };

  const handleNewItem = () => {
    setEditingProduct(null);   
    setStockScreen('form');
  };


  const handleBackToList = () => {
    setEditingProduct(null); 
    setStockScreen('list');
  };

  const handleMovement = () => {
    setStockScreen('movement');
  };

  const renderMainContent = () => {
    if (activeModule === 'welcome') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', color: '#3a7d71', marginBottom: '10px' }}>Olá, Bem-vindo(a)!</h1>
          <p style={{ fontSize: '1.2rem', color: '#666' }}>Selecione um módulo no menu lateral para começar.</p>
        </div>
      );
    }

    if (activeModule === 'asset') {
      return <AssetForm onSuccess={() => handleSelectModule('welcome')} />;
    }

    if (activeModule === 'stock') {
      if (stockScreen === 'form') {
        return <ProductForm productToEdit={editingProduct} onSuccess={handleBackToList} />;
      }
      if (stockScreen === 'movement') {
        return <ProductMovement onSuccess={handleBackToList} />;
      }
      return <ProductList onEdit={handleEdit} />;
    }
  };

  return (
    <div className="app-layout">
      
      <aside style={{ backgroundColor: '#1b4b43', padding: '20px', color: 'white', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '30px' }}>
          <div><img src="./public/logoUnimed.svg" alt="Logo" style={{ width: '50px', height: '50px', objectFit: 'contain' }} /></div>
          <h2 style={{ fontSize: '18px', margin: 0 }}>Sistema TI</h2>
        </div>

        <button onClick={() => handleSelectModule('welcome')} style={getSidebarButtonStyle(activeModule === 'welcome')}>
          <House size={20} /> Início
        </button>

        <button onClick={() => handleSelectModule('stock')} style={getSidebarButtonStyle(activeModule === 'stock')}>
          <Package size={20} /> Estoque
        </button>

        <button onClick={() => handleSelectModule('asset')} style={getSidebarButtonStyle(activeModule === 'asset')}>
          <Desktop size={20} /> Ativos
        </button>
      </aside>

      <div className="main-area">
        
        <header style={{ backgroundColor: 'white', padding: '20px 30px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: '#333', fontSize: '20px' }}>
            {activeModule === 'welcome' && 'Página Inicial'}
            {activeModule === 'stock' && 'Gestão de Estoque'}
            {activeModule === 'asset' && 'Gestão de Ativos'}
          </h2>

          {activeModule === 'stock' && (
            <nav style={{ display: 'flex', gap: '10px' }}>
              <button onClick={handleBackToList} style={getHeaderButtonStyle(stockScreen === 'list')}>
                Ver Lista
              </button>
              <button onClick={handleNewItem} style={getHeaderButtonStyle(stockScreen === 'form')}>
                + Novo item
              </button>
              <button onClick={handleMovement} style={getHeaderButtonStyle(stockScreen === 'movement')}>
                Movimentações
              </button>
            </nav>
          )}
        </header>


        <main className="content-container">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}

const getSidebarButtonStyle = (isActive: boolean) => ({
  display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 15px',
  backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
  color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer',
  textAlign: 'left' as const, fontSize: '15px', fontWeight: isActive ? 'bold' : 'normal',
  transition: '0.2s'
});

const getHeaderButtonStyle = (isActive: boolean) => ({
  backgroundColor: isActive ? '#3a7d71' : '#f0f0f0',
  color: isActive ? 'white' : '#333',
  padding: '8px 15px', cursor: 'pointer', border: 'none', borderRadius: '4px',
  fontWeight: 'bold', transition: '0.2s'
});

export default App;
