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
  UsersThree,
  Buildings,
  Printer as PrinterIcon,
  ChartLine
} from '@phosphor-icons/react';

import { AuthService } from './shared/services/authService';
import { AUTH_REQUIRED_EVENT, AUTH_TOKEN_KEY } from './shared/services/authSession';
import { getSelectedUnitId, setSelectedUnitId } from './shared/services/unitSession';
import { MeService } from './shared/services/meService';
import { accessibleUnits, canOperate, canOperateAllUnits, canSee } from './shared/types/Access';
import type { MeDTO, ModuleKey, UnitAccess, UserDTO } from './shared/types/Access';
import { UserList } from './modules/Users/pages/UserList';
import { UserForm } from './modules/Users/pages/UserForm';
import { EnterpriseList } from './modules/Registry/pages/EnterpriseList';
import { EnterpriseForm } from './modules/Registry/pages/EnterpriseForm';
import { SectorList } from './modules/Registry/pages/SectorList';
import { SectorForm } from './modules/Registry/pages/SectorForm';
import type { EnterpriseDTO, SectorDTO } from './shared/types/Registry';
import { SectorService } from './modules/Registry/services/RegistryService';
import { PrinterClosing } from './modules/Printers/pages/PrinterClosing';
import { PrinterList } from './modules/Printers/pages/PrinterList';
import { PrinterForm } from './modules/Printers/pages/PrinterForm';
import { ReadingForm } from './modules/Printers/pages/ReadingForm';
import type { PrinterDTO, ReadingDTO } from './shared/types/Printer';
import { Dashboard } from './modules/Dashboard/pages/Dashboard';
import { Login } from './modules/Auth/pages/Login';

type ActiveModule = 'welcome' | 'dashboard' | 'stock' | 'asset' | 'order' | 'financial' | 'printers' | 'users' | 'registry';

/** Cada modulo de tela corresponde a um modulo de permissao do backend. */
const MODULE_PERMISSION: Record<Exclude<ActiveModule, 'welcome'>, ModuleKey> = {
  // O painel soma contratos e impressoras; a regra real está em podeVerModulo,
  // porque ele exige leitura NOS DOIS e este mapa só comporta um.
  dashboard: 'FINANCIAL',
  stock: 'STOCK',
  asset: 'ASSET',
  order: 'ORDER',
  financial: 'FINANCIAL',
  printers: 'PRINTER',
  users: 'USER_MANAGEMENT',
  // Empresas e setores sao configuracao do sistema, entao seguem a mesma
  // permissao da gestao de usuarios.
  registry: 'USER_MANAGEMENT'
};
type ActiveScreen = 'list' | 'form' | 'movement' | 'costCenters' | 'transfer';

type SidebarModule = Exclude<ActiveModule, 'welcome'>;

type NavItem = { module: SidebarModule; label: string; icon: typeof Package };

/** Módulos da rotina diária — ocupam o corpo do menu. */
const OPERATION_MODULES: NavItem[] = [
  { module: 'dashboard', label: 'Painel', icon: ChartLine },
  { module: 'stock', label: 'Estoque', icon: Package },
  { module: 'asset', label: 'Ativos', icon: Desktop },
  { module: 'order', label: 'Pedidos', icon: ShoppingCart },
  { module: 'financial', label: 'Financeiro', icon: InvoiceIcon },
  { module: 'printers', label: 'Impressoras', icon: PrinterIcon }
];

/**
 * Administração — fica no rodapé, junto do Sair. É função de manutenção, não de
 * rotina: misturá-la aos módulos operacionais dá a ela um peso que não tem.
 */
const ADMIN_MODULES: NavItem[] = [
  { module: 'registry', label: 'Cadastros', icon: Buildings },
  { module: 'users', label: 'Usuários', icon: UsersThree }
];

const QUICK_CARD_HINT: Record<SidebarModule, string> = {
  dashboard: 'Custos e indicadores',
  stock: 'Produtos e movimentações',
  asset: 'Patrimônio e empréstimos',
  order: 'Solicitações de compra',
  financial: 'Contratos e notas',
  printers: 'Contagem e rateio',
  users: 'Acessos e perfis',
  registry: 'Empresas e setores'
};

/**
 * O painel reúne custo de contratos e de impressoras. Sem leitura nos dois ele
 * mostraria metade dos números como se fosse o total, então exige os dois.
 */
function podeVerModulo(me: MeDTO | null, module: SidebarModule): boolean {
  if (module === 'dashboard') {
    return canSee(me, 'FINANCIAL') && canSee(me, 'PRINTER');
  }
  return canSee(me, MODULE_PERMISSION[module]);
}

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

  // Cadastros: empresas e setores dividem a mesma tela, alternadas pela aba.
  const [registryTab, setRegistryTab] = useState<'enterprises' | 'sectors'>('enterprises');
  const [editingEnterprise, setEditingEnterprise] = useState<EnterpriseDTO | null>(null);
  const [editingSector, setEditingSector] = useState<SectorDTO | null>(null);
  // Salvar uma empresa muda o nome exibido na lista de setores.
  const [registryReloadToken, setRegistryReloadToken] = useState(0);

  // Impressoras: o fechamento do mês e o cadastro dividem a mesma tela.
  const [printerTab, setPrinterTab] = useState<'closing' | 'registry'>('closing');
  const [editingPrinter, setEditingPrinter] = useState<PrinterDTO | null>(null);
  const [editingReading, setEditingReading] = useState<ReadingDTO | null>(null);
  const [printerReloadToken, setPrinterReloadToken] = useState(0);
  // Carregados aqui porque o rateio de leitura e o do cadastro usam a mesma lista.
  const [sectorsForShares, setSectorsForShares] = useState<SectorDTO[]>([]);

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

  useEffect(() => {
    if (activeModule !== 'printers') return;

    SectorService.getAll()
      .then(setSectorsForShares)
      .catch((error) => console.error('Erro ao carregar setores:', error));
  }, [activeModule]);

  const handlePrinterTab = (tab: 'closing' | 'registry') => {
    setPrinterTab(tab);
    setActiveScreen('list');
    setEditingPrinter(null);
    setEditingReading(null);
  };

  const handlePrinterSaved = () => {
    setEditingPrinter(null);
    setEditingReading(null);
    setPrinterReloadToken(token => token + 1);
    setActiveScreen('list');
  };

  const handleSelectModule = (module: ActiveModule) => {
    setActiveModule(module);
    setActiveScreen('list');
    setEditingItem(null);
    setSelectedInvoiceId(null);
    setEditingUser(null);
    setEditingEnterprise(null);
    setEditingSector(null);
    setEditingPrinter(null);
    setEditingReading(null);
  };

  /** Trocar de aba fecha o formulário: ele pertencia à outra entidade. */
  const handleRegistryTab = (tab: 'enterprises' | 'sectors') => {
    setRegistryTab(tab);
    setActiveScreen('list');
    setEditingEnterprise(null);
    setEditingSector(null);
  };

  const handleRegistrySaved = () => {
    setEditingEnterprise(null);
    setEditingSector(null);
    setRegistryReloadToken(token => token + 1);
    setActiveScreen('list');
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
    if (activeModule === 'dashboard') return 'Painel de custos';
    if (activeModule === 'printers') {
      return printerTab === 'closing' ? 'Fechamento de impressoras' : 'Cadastro de impressoras';
    }
    if (activeModule === 'users') return 'Gestão de usuários';
    if (activeModule === 'registry') {
      return registryTab === 'enterprises' ? 'Empresas' : 'Setores';
    }
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
    if (activeModule === 'dashboard') {
      return 'Evolução do gasto, custo por empresa e por centro de custo.';
    }
    if (activeModule === 'printers') {
      return printerTab === 'closing'
        ? 'Contagem do mês, importação do PrintWay e custo por empresa e centro de custo.'
        : 'O parque de impressoras e o rateio padrão de cada uma.';
    }
    if (activeModule === 'users') {
      return 'Quem acessa o sistema, com qual perfil e em quais unidades.';
    }
    if (activeModule === 'registry') {
      return registryTab === 'enterprises'
        ? 'Os CNPJs do grupo. Contrato e nota fiscal pertencem a um deles.'
        : 'Os centros de custo usados no rateio e no destino do consumo.';
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
              .filter(item => podeVerModulo(me, item.module))
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

    if (activeModule === 'dashboard') {
      return <Dashboard />;
    }

    if (activeModule === 'printers') {
      const podeFechar = canOperate(me, 'PRINTER');
      const podeCadastrar = canOperate(me, 'USER_MANAGEMENT');

      if (activeScreen === 'form') {
        return editingReading
          ? (
            <ReadingForm
              reading={editingReading}
              sectors={sectorsForShares}
              onSuccess={handlePrinterSaved}
              onCancel={() => { setEditingReading(null); setActiveScreen('list'); }}
            />
          )
          : <PrinterForm printerToEdit={editingPrinter} onSuccess={handlePrinterSaved} />;
      }

      return printerTab === 'closing'
        ? (
          <PrinterClosing
            canOperate={podeFechar}
            onEditReading={(reading) => { setEditingReading(reading); setActiveScreen('form'); }}
            reloadToken={printerReloadToken}
          />
        )
        : (
          <PrinterList
            onEdit={(printer) => { setEditingPrinter(printer); setActiveScreen('form'); }}
            canOperate={podeCadastrar}
            reloadToken={printerReloadToken}
          />
        );
    }

    if (activeModule === 'registry') {
      const podeOperar = canOperate(me, 'USER_MANAGEMENT');

      if (activeScreen === 'form') {
        return registryTab === 'enterprises'
          ? <EnterpriseForm enterpriseToEdit={editingEnterprise} onSuccess={handleRegistrySaved} />
          : <SectorForm sectorToEdit={editingSector} onSuccess={handleRegistrySaved} />;
      }

      return registryTab === 'enterprises'
        ? (
          <EnterpriseList
            onEdit={(enterprise) => { setEditingEnterprise(enterprise); setActiveScreen('form'); }}
            canOperate={podeOperar}
            onChanged={() => setRegistryReloadToken(token => token + 1)}
          />
        )
        : (
          <SectorList
            onEdit={(sector) => { setEditingSector(sector); setActiveScreen('form'); }}
            canOperate={podeOperar}
            reloadToken={registryReloadToken}
          />
        );
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
    // O painel tem o próprio filtro de mês dentro do card, então não usa a barra
    // de ações; sem este retorno ele herdava os botões do bloco padrão.
    if (activeModule === 'welcome' || activeModule === 'dashboard') {
      return null;
    }

    if (activeModule === 'printers') {
      return (
        <nav className="header-actions" aria-label="Ações do módulo de impressoras">
          <button
            className={`header-action ${printerTab === 'closing' && activeScreen === 'list' ? 'is-active' : ''}`}
            onClick={() => handlePrinterTab('closing')}
          >
            Fechamento
          </button>

          <button
            className={`header-action ${printerTab === 'registry' && activeScreen === 'list' ? 'is-active' : ''}`}
            onClick={() => handlePrinterTab('registry')}
          >
            Impressoras
          </button>

          {printerTab === 'registry' && canOperate(me, 'USER_MANAGEMENT') && (
            <button
              className={`header-action ${activeScreen === 'form' ? 'is-active' : ''}`}
              onClick={() => {
                setEditingPrinter(null);
                setEditingReading(null);
                setActiveScreen('form');
              }}
            >
              + Nova impressora
            </button>
          )}
        </nav>
      );
    }

    if (activeModule === 'registry') {
      return (
        <nav className="header-actions" aria-label="Ações do módulo de cadastros">
          <button
            className={`header-action ${registryTab === 'enterprises' && activeScreen === 'list' ? 'is-active' : ''}`}
            onClick={() => handleRegistryTab('enterprises')}
          >
            Empresas
          </button>

          <button
            className={`header-action ${registryTab === 'sectors' && activeScreen === 'list' ? 'is-active' : ''}`}
            onClick={() => handleRegistryTab('sectors')}
          >
            Setores
          </button>

          {canOperate(me, 'USER_MANAGEMENT') && (
            <button
              className={`header-action ${activeScreen === 'form' ? 'is-active' : ''}`}
              onClick={() => {
                setEditingEnterprise(null);
                setEditingSector(null);
                setActiveScreen('form');
              }}
            >
              {registryTab === 'enterprises' ? '+ Nova empresa' : '+ Novo setor'}
            </button>
          )}
        </nav>
      );
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
          {OPERATION_MODULES.filter(item => podeVerModulo(me, item.module)).map(item => (
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
