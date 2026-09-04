import { useEffect, useState } from 'react';
import './index.css';

import { ProductForm } from './modules/Stock/pages/ProductForm';
import { ProductList } from './modules/Stock/pages/ProductList';
import { ProductMovement } from './modules/Stock/pages/ProductMovement';
import { ProductTransfer } from './modules/Stock/pages/ProductTransfer';
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
  InvoiceIcon,
  UsersThree
} from '@phosphor-icons/react';

import { AuthService } from './shared/services/authService';
import { AUTH_REQUIRED_EVENT, AUTH_TOKEN_KEY } from './shared/services/authSession';
import { getSelectedUnitId, setSelectedUnitId } from './shared/services/unitSession';
import { MeService } from './shared/services/meService';
import { accessibleUnits, canOperate, canOperateAllUnits, canSee } from './shared/types/Access';
import type { MeDTO, ModuleKey, UnitAccess, UserDTO } from './shared/types/Access';
import { UserList } from './modules/Users/pages/UserList';
import { UserForm } from './modules/Users/pages/UserForm';
import { Login } from './modules/Auth/pages/Login';

type ActiveModule = 'welcome' | 'stock' | 'asset' | 'order' | 'financial' | 'users';

/** Cada modulo de tela corresponde a um modulo de permissao do backend. */
const MODULE_PERMISSION: Record<Exclude<ActiveModule, 'welcome'>, ModuleKey> = {
  stock: 'STOCK',
  asset: 'ASSET',
  order: 'ORDER',
  financial: 'FINANCIAL',
  users: 'USER_MANAGEMENT'
};
type ActiveScreen = 'list' | 'form' | 'movement' | 'costCenters' | 'transfer';

type SidebarModule = Exclude<ActiveModule, 'welcome'>;

type NavItem = { module: SidebarModule; label: string; icon: typeof Package };

/** Módulos da rotina diária — ocupam o corpo do menu. */
const OPERATION_MODULES: NavItem[] = [
  { module: 'stock', label: 'Estoque', icon: Package },
  { module: 'asset', label: 'Ativos', icon: Desktop },
  { module: 'order', label: 'Pedidos', icon: ShoppingCart },
  { module: 'financial', label: 'Financeiro', icon: InvoiceIcon }
];

/**
 * Administração — fica no rodapé, junto do Sair. É função de manutenção, não de
 * rotina: misturá-la aos módulos operacionais dá a ela um peso que não tem.
 */
const ADMIN_MODULES: NavItem[] = [
  { module: 'users', label: 'Usuários', icon: UsersThree }
];

const QUICK_CARD_HINT: Record<SidebarModule, string> = {
  stock: 'Produtos e movimentações',
  asset: 'Patrimônio e empréstimos',
  order: 'Solicitações de compra',
  financial: 'Contratos e notas',
  users: 'Acessos e perfis'
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    AuthService.isAuthenticated()
  );

  const [activeModule, setActiveModule] = useState<ActiveModule>('welcome');
  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('list');
  const [editingItem, setEditingItem] = useState<ProductDTO | AssetDTO | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // Unidade operacional: Operadora ou Hospital. Define QUAL estoque está em tela.
  const [units, setUnits] = useState<UnitAccess[]>([]);
  const [activeUnitId, setActiveUnitId] = useState<string>('');

  // Perfil e alcance do usuário logado. É daqui que sai o menu — mas quem recusa
  // a operação é o @PreAuthorize no backend, não esta tela.
  const [me, setMe] = useState<MeDTO | null>(null);
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);

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

  // O alcance vem do backend em /users/me: o menu mostra só o que a pessoa
  // realmente acessa, e o seletor só as unidades que ela opera.
  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;

    MeService.get()
      .then((data) => {
        if (cancelled) return;
        setMe(data);

        const allowed = accessibleUnits(data, 'STOCK');
        setUnits(allowed);

        const stored = getSelectedUnitId();
        const valid = allowed.find(u => u.unitId === stored) ?? allowed[0];
        if (valid) {
          setActiveUnitId(valid.unitId);
          setSelectedUnitId(valid.unitId);
        } else {
          setActiveUnitId('');
        }
      })
      .catch((error) => {
        console.error('Erro ao carregar o perfil do usuário:', error);
      });

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const handleChangeUnit = (unitId: string) => {
    setActiveUnitId(unitId);
    setSelectedUnitId(unitId);
    // Trocar de estoque volta para a lista: um formulário aberto pertencia ao
    // estoque anterior e salvá-lo na nova unidade seria um engano silencioso.
    setActiveScreen('list');
    setEditingItem(null);
  };

  const activeUnitName = units.find(u => u.unitId === activeUnitId)?.unitName ?? '';

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
    if (activeModule === 'users') return 'Gestão de usuários';
    if (activeModule === 'financial' && activeScreen === 'costCenters') {
      return 'Centros de custo';
    }

    return 'Gestão financeira';
  };

  const getPageDescription = () => {
    if (activeModule === 'welcome') return 'Escolha um módulo para começar sua rotina.';
    if (activeModule === 'stock') {
      return activeUnitName
        ? `Produtos, saldos mínimos e movimentações do estoque ${activeUnitName}.`
        : 'Produtos, saldos mínimos e movimentações de estoque.';
    }
    if (activeModule === 'asset') return 'Controle de patrimônio, disponibilidade e empréstimos.';
    if (activeModule === 'order') return 'Solicitações, anexos e acompanhamento de compras.';
    if (activeModule === 'users') {
      return 'Quem acessa o sistema, com qual perfil e em quais unidades.';
    }
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
            <span className="welcome-kicker">UniSys</span>
            <h1>Gestão do setor de TI em um só lugar</h1>
            <p>
              Acompanhe estoque, ativos, pedidos e contratos com uma navegação
              mais clara para a rotina da equipe.
            </p>
          </div>

          <div className="quick-grid" aria-label="Acesso rápido aos módulos">
            {OPERATION_MODULES
              .filter(item => canSee(me, MODULE_PERMISSION[item.module]))
              .map(item => (
                <button
                  key={item.module}
                  className="quick-card"
                  onClick={() => handleSelectModule(item.module)}
                >
                  <item.icon size={28} weight="duotone" />
                  <strong>{item.label}</strong>
                  <span>{QUICK_CARD_HINT[item.module]}</span>
                </button>
              ))}
          </div>
        </section>
      );
    }

    if (activeModule === 'stock') {
      // Sem unidade resolvida não há "o estoque" — evita chamar a API sem unitId
      // e receber 400 na cara do operador.
      if (!activeUnitId) {
        return <p style={{ padding: 20 }}>Carregando unidades...</p>;
      }

      if (activeScreen === 'form') {
        return (
          <ProductForm
            productToEdit={editingItem as ProductDTO | null}
            onSuccess={handleBackToList}
            unitId={activeUnitId}
            unitName={activeUnitName}
          />
        );
      }

      if (activeScreen === 'movement') {
        return (
          <ProductMovement
            onSuccess={handleBackToList}
            unitId={activeUnitId}
            unitName={activeUnitName}
          />
        );
      }

      if (activeScreen === 'transfer') {
        return (
          <ProductTransfer
            onSuccess={handleBackToList}
            units={units}
            currentUnitId={activeUnitId}
          />
        );
      }

      return (
        <ProductList
          onEdit={handleEdit}
          unitId={activeUnitId}
          canDelete={canOperateAllUnits(me, 'STOCK')}
        />
      );
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

    if (activeModule === 'users') {
      if (activeScreen === 'form') {
        return (
          <UserForm
            userToEdit={editingUser}
            onSuccess={() => { setEditingUser(null); handleBackToList(); }}
          />
        );
      }

      return (
        <UserList
          onEdit={(user) => { setEditingUser(user); setActiveScreen('form'); }}
          canOperate={canOperate(me, 'USER_MANAGEMENT')}
          currentUserId={me?.id ?? null}
        />
      );
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

    if (activeModule === 'users') {
      return (
        <nav className="header-actions" aria-label="Ações do módulo de usuários">
          <button
            className={`header-action ${activeScreen === 'list' ? 'is-active' : ''}`}
            onClick={() => { setEditingUser(null); handleBackToList(); }}
          >
            Ver lista
          </button>

          {canOperate(me, 'USER_MANAGEMENT') && (
            <button
              className={`header-action ${activeScreen === 'form' ? 'is-active' : ''}`}
              onClick={() => { setEditingUser(null); setActiveScreen('form'); }}
            >
              + Novo usuário
            </button>
          )}
        </nav>
      );
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

        {activeModule === 'stock' && (
          <button
            className={`header-action ${activeScreen === 'transfer' ? 'is-active' : ''}`}
            onClick={() => setActiveScreen('transfer')}
          >
            Transferir
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
            <strong>UniSys</strong>
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

          {/* O menu mostra só o que a pessoa alcança. É conveniência de tela: o
              backend recusaria a chamada de qualquer forma. */}
          {OPERATION_MODULES.filter(item => canSee(me, MODULE_PERMISSION[item.module])).map(item => (
            <button
              key={item.module}
              onClick={() => handleSelectModule(item.module)}
              className={getSidebarClassName(item.module)}
            >
              <item.icon size={20} /> {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          {ADMIN_MODULES.filter(item => canSee(me, MODULE_PERMISSION[item.module])).map(item => (
            <button
              key={item.module}
              onClick={() => handleSelectModule(item.module)}
              className={getSidebarClassName(item.module)}
            >
              <item.icon size={20} /> {item.label}
            </button>
          ))}

          <button onClick={handleLogout} className="sidebar-button logout-button">
            <SignOut size={20} /> Sair
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="app-header">
          <div className="page-heading">
            <span className="page-eyebrow">Módulo ativo</span>
            <h2>{getPageTitle()}</h2>
            <p>{getPageDescription()}</p>
          </div>

          {activeModule === 'stock' && units.length > 0 && (
            <div className="unit-picker">
              <label htmlFor="unit-select">Estoque</label>
              <select
                id="unit-select"
                value={activeUnitId}
                onChange={(e) => handleChangeUnit(e.target.value)}
              >
                {units.map(unit => (
                  <option key={unit.unitId} value={unit.unitId}>{unit.unitName}</option>
                ))}
              </select>
            </div>
          )}

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
