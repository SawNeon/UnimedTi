import { useState } from 'react';
import './index.css'; // Seu CSS global
import { ProductForm } from './modules/Stock/pages/ProductForm';
import { ProductList } from './modules/Stock/pages/ProductList';
import type { ProductDTO } from './modules/Stock/types/Product';
import { ProductMovement } from './modules/Stock/pages/ProductMovement';

function App() {
  const [currentScreen, setCurrentScreen] = useState<'list' | 'form' | 'movement'>('list'); 
  const [editingProduct, setEditingProduct] = useState<ProductDTO | null>(null);


  const handleEdit = (product: ProductDTO) => {
    setEditingProduct(product); 
    setCurrentScreen('form');  
  };

  const handleNewItem = () => {
    setEditingProduct(null);   
    setCurrentScreen('form');
  };


  const handleBackToList = () => {
    setEditingProduct(null); 
    setCurrentScreen('list');
  };

  const handleMovement = () => {
    setCurrentScreen('movement');
  };

  return (
    <div className="app-container">
      <header style={{ 
        backgroundColor: 'rgba(0, 153, 93, 0.8)', 
        padding: '20px', 
        color: '#fff', 
        marginBottom: '20px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>Sistema Administrativo</h1>

        <nav>
          <button 
            onClick={handleBackToList}
            style={{ 
              marginRight: '10px', 
              backgroundColor: currentScreen === 'list' ? '#007a4d' : 'transparent',
              color: 'white',
              padding: '10px 15px', 
              cursor: 'pointer', 
              border: '1px solid white', 
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            Estoque
          </button>
          
          <button 
            onClick={handleNewItem} 
            style={{
              marginRight: '10px', 
              backgroundColor: currentScreen === 'form' ? '#007a4d' : 'transparent',
              color: 'white',
              padding: '10px 15px', 
              cursor: 'pointer', 
              border: '1px solid white', 
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            Novo item
          </button>
              <button 
            onClick={handleMovement} 
            style={{ 
              backgroundColor: currentScreen === 'movement' ? '#007a4d' : 'transparent',
              color: 'white',
              padding: '10px 15px',            
              cursor: 'pointer',
              border: '1px solid white',
              borderRadius: '4px',
              fontWeight: 'bold'
            }}
          >
            Movimentações
          </button>

        </nav>
      </header>

      <main>
        {currentScreen === 'list' && <ProductList onEdit={handleEdit} />}
        {currentScreen === 'form' && <ProductForm productToEdit={editingProduct} onSuccess={handleBackToList} />}
        {currentScreen === 'movement' && <ProductMovement onSuccess={handleBackToList} />}
      </main>
    </div>
  );
}

export default App;