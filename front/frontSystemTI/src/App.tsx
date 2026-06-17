import { useEffect, useState } from 'react';
import './index.css';

import { ProductForm } from './modules/Stock/pages/ProductForm';
import { ProductList } from './modules/Stock/pages/ProductList';
import { ProductMovement } from './modules/Stock/pages/ProductMovement';
import type { ProductDTO } from './modules/Stock/types/Product';

import { AssetForm } from './modules/Asset/pages/AssetForm';
import { AssetList } from './modules/Asset/pages/AssetList';
import { AssetMovement } from './modules/Asset/pages/AssetMovement';
import type { AssetDTO } from './modules/Asset/types/Asset';

import { OrderList } from './modules/Order/pages/OrderList';
import { OrderForm } from './modules/Order/pages/OrderForm';

import { ContractList } from './modules/Financial/pages/ContractList';
import { CostCenterView } from './modules/Financial/pages/CostCenterView';
import { ContractForm } from './modules/Financial/pages/ContractForm';

import {
  Package,
  Desktop,
  House,
  SignOut,
  ShoppingCart,
  InvoiceIcon
} from '@phosphor-icons/react';

import { AuthService } from './shared/services/authService';
import { AUTH_REQUIRED_EVENT, AUTH_TOKEN_KEY } from './shared/services/authSession';
import { Login } from './modules/Auth/pages/Login';

type ActiveModule = 'welcome' | 'stock' | 'asset' | 'order' | 'financial';
type ActiveScreen = 'list' | 'form' | 'movement' | 'costCenters';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    AuthService.isAuthenticated()
  );

  const [activeModule, setActiveModule] = useState<ActiveModule>('welcome');
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('list');
  const [editingItem, setEditingItem] = useState<ProductDTO | AssetDTO | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    const sendToLogin = () => {
      setIsAuthenticated(false);
      setActiveModule('welcome');
      setActiveScreen('list');
      setEditingItem(null);
      setSelectedInvoiceId(null);
    };

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === AUTH_TOKEN_KEY && !event.newValue) {
        sendToLogin();
      }
    };

    window.addEventListener(AUTH_REQUIRED_EVENT, sendToLogin);
    window.addEventListener('storage', handleStorageChange);

    if (!AuthService.isAuthenticated()) {
      sendToLogin();
    }

    return () => {
      window.removeEventListener(AUTH_REQUIRED_EVENT, sendToLogin);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleSelectModule = (module: ActiveModule) => {
    setActiveModule(module);
    setActiveScreen('list');
    setEditingItem(null);
    setSelectedInvoiceId(null);
  };

  const handleEdit = (item: ProductDTO | AssetDTO) => {
    setEditingItem(item);
    setActiveScreen('form');
  };

  const handleNewItem = () => {
    setEditingItem(null);
    setActiveScreen('form');
  };

  const handleBackToList = () => {
    setEditingItem(null);
    setSelectedInvoiceId(null);
    setActiveScreen('list');
  };

  const handleMovement = () => {
    setActiveScreen('movement');
  };

  const handleLogout = () => {
    AuthService.logout();
  };

  const handleOpenCostCenters = (invoiceId: string) => {
    setSelectedInvoiceId(invoiceId);
    setActiveModule('financial');
    setActiveScreen('costCenters');
  };

  const getPageTitle = () => {
    if (activeModule === 'welcome') return 'Página inicial';
    if (activeModule === 'stock') return 'Gestão de estoque';
    if (activeModule === 'asset') return 'Gestão de ativos';
    if (activeModule === 'order') return 'Pedidos de compras';
    if (activeModule === 'financial' && activeScreen === 'costCenters') {
      return 'Centros de custo';
    }

    return 'Gestão financeira';
  };

  const getPageDescription = () => {
    if (activeModule === 'welcome') return 'Escolha um módulo para começar sua rotina.';
    if (activeModule === 'stock') return 'Produtos, saldos mínimos e movimentações de estoque.';
    if (activeModule === 'asset') return 'Controle de patrimônio, disponibilidade e empréstimos.';
    if (activeModule === 'order') return 'Solicitações, anexos e acompanhamento de compras.';
    if (activeModule === 'financial' && activeScreen === 'costCenters') {
      return 'Distribuição da nota por áreas e centros de custo.';
    }

    return 'Contratos, lançamentos mensais e notas vinculadas.';
  };

  const renderMainContent = () => {
    if (activeModule === 'welcome') {
      return (
        <section className="welcome-panel">
          <div className="welcome-copy">
            <span className="welcome-kicker">Sistema TI</span>
            <h1>Gestão do setor de TI em um só lugar</h1>
            <p>
              Acompanhe estoque, ativos, pedidos e contratos com uma navegação
              mais clara para a rotina da equipe.
            </p>
          </div>

          <div className="quick-grid" aria-label="Acesso rápido aos módulos">
            <button className="quick-card" onClick={() => handleSelectModule('stock')}>
              <Package size={28} weight="duotone" />
              <strong>Estoque</strong>
              <span>Produtos e movimentações</span>
            </button>

            <button className="quick-card" onClick={() => handleSelectModule('asset')}>
              <Desktop size={28} weight="duotone" />
              <strong>Ativos</strong>
              <span>Patrimônio e empréstimos</span>
            </button>

            <button className="quick-card" onClick={() => handleSelectModule('order')}>
              <ShoppingCart size={28} weight="duotone" />
              <strong>Pedidos</strong>
              <span>Solicitações de compra</span>
            </button>

            <button className="quick-card" onClick={() => handleSelectModule('financial')}>
              <InvoiceIcon size={28} weight="duotone" />
              <strong>Financeiro</strong>
              <span>Contratos e notas</span>
            </button>
          </div>
        </section>
      );
    }

    if (activeModule === 'stock') {
      if (activeScreen === 'form') {
        return (
          <ProductForm
            productToEdit={editingItem as ProductDTO | null}
            onSuccess={handleBackToList}
          />
        );
      }

      if (activeScreen === 'movement') {
        return <ProductMovement onSuccess={handleBackToList} />;
      }

      return <ProductList onEdit={handleEdit} />;
    }

    if (activeModule === 'asset') {
      if (activeScreen === 'form') {
        return (
          <AssetForm
            assetToEdit={editingItem as AssetDTO | null}
            onSuccess={handleBackToList}
          />
        );
      }

      if (activeScreen === 'movement') {
        return <AssetMovement onSuccess={handleBackToList} />;
      }

      return <AssetList onEdit={handleEdit} />;
    }

    if (activeModule === 'order') {
      if (activeScreen === 'form') {
        return <OrderForm onSucess={handleBackToList} />;
      }

      return <OrderList />;
    }

    if (activeModule === 'financial') {
      if (activeScreen === 'form') {
        return <ContractForm onSuccess={handleBackToList} />;
      }

      if (activeScreen === 'costCenters' && selectedInvoiceId) {
        return (
          <CostCenterView invoiceId={selectedInvoiceId} onBack={handleBackToList} />
        );
      }

      return <ContractList onOpenCostCenters={handleOpenCostCenters} />;
    }

    return null;
  };

  const renderModuleActions = () => {
    if (activeModule === 'welcome') {
      return null;
    }

    if (activeModule === 'financial') {
      return (
        <nav className="header-actions" aria-label="Ações do módulo financeiro">
          <button
            className={`header-action ${activeScreen === 'list' ? 'is-active' : ''}`}
            onClick={handleBackToList}
          >
            Ver lista
          </button>

          <button
            className={`header-action ${activeScreen === 'form' ? 'is-active' : ''}`}
            onClick={handleNewItem}
          >
            + Novo contrato
          </button>
        </nav>
      );
    }

    return (
      <nav className="header-actions" aria-label="Ações do módulo">
        <button
          className={`header-action ${activeScreen === 'list' ? 'is-active' : ''}`}
          onClick={handleBackToList}
        >
          Ver lista
        </button>

        <button
          className={`header-action ${activeScreen === 'form' ? 'is-active' : ''}`}
          onClick={handleNewItem}
        >
          {activeModule === 'stock'
            ? '+ Novo produto'
            : activeModule === 'asset'
              ? '+ Novo ativo'
              : '+ Novo pedido'}
        </button>

        {activeModule !== 'order' && (
          <button
            className={`header-action ${activeScreen === 'movement' ? 'is-active' : ''}`}
            onClick={handleMovement}
          >
            {activeModule === 'stock' ? 'Movimentações' : 'Empréstimos'}
          </button>
        )}
      </nav>
    );
  };

  const getSidebarClassName = (module: ActiveModule) => (
    `sidebar-button ${activeModule === module ? 'is-active' : ''}`
  );

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(AuthService.isAuthenticated())} />;
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <img src="/logoUnimed.svg" alt="Sistema TI" className="brand-logo" />
          <div className="brand-text">
            <strong>Sistema TI</strong>
            <span>Gestão operacional</span>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Módulos do sistema">
          <button
            onClick={() => handleSelectModule('welcome')}
            className={getSidebarClassName('welcome')}
          >
            <House size={20} /> Início
          </button>

          <button
            onClick={() => handleSelectModule('stock')}
            className={getSidebarClassName('stock')}
          >
            <Package size={20} /> Estoque
          </button>

          <button
            onClick={() => handleSelectModule('asset')}
            className={getSidebarClassName('asset')}
          >
            <Desktop size={20} /> Ativos
          </button>

          <button
            onClick={() => handleSelectModule('order')}
            className={getSidebarClassName('order')}
          >
            <ShoppingCart size={20} /> Pedidos
          </button>

          <button
            onClick={() => handleSelectModule('financial')}
            className={getSidebarClassName('financial')}
          >
            <InvoiceIcon size={20} /> Financeiro
          </button>
        </nav>

        <button onClick={handleLogout} className="sidebar-button logout-button">
          <SignOut size={20} /> Sair
        </button>
      </aside>

      <div className="main-area">
        <header className="app-header">
          <div className="page-heading">
            <span className="page-eyebrow">Módulo ativo</span>
            <h2>{getPageTitle()}</h2>
            <p>{getPageDescription()}</p>
          </div>

          {renderModuleActions()}
        </header>

        <main className="content-container">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}

export default App;
