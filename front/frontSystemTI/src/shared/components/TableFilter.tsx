import { useState } from 'react';
import styles from './TableFilter.module.css';
import { MagnifyingGlass, Eraser } from '@phosphor-icons/react';


export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterField {
  name: string;    
  label: string;    
  type: 'text' | 'select' | 'date'; 
  options?: FilterOption[]; 
  placeholder?: string;
}

interface TableFilterProps {
  fields: FilterField[];
  onFilter: (values: Record<string, string>) => void;
  onClear: () => void;
}

export function TableFilter({ fields, onFilter, onClear }: TableFilterProps) {
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string) => {
    setFilterValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleApplyFilter = () => {
    onFilter(filterValues);
  };

  const handleClear = () => {
    setFilterValues({}); 
    onClear();           
  };

  return (
    <div className={styles.filterContainer}>
      {fields.map((field) => (
        <div key={field.name} className={styles.formGroup}>
          <label className={styles.label}>{field.label}</label>
          
          {field.type === 'select' ? (
            <select
              className={styles.input}
              value={filterValues[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
            >
              <option value="">Todos</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              className={styles.input}
              placeholder={field.placeholder}
              value={filterValues[field.name] || ''}
              onChange={(e) => handleChange(field.name, e.target.value)}
            />
          )}
        </div>
      ))}

      <div className={styles.buttonContainer}>
        <button onClick={handleClear} className={styles.clearButton} title="Limpar Filtros">
          <Eraser size={20} />
        </button>
        <button onClick={handleApplyFilter} className={styles.filterButton}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MagnifyingGlass size={20} />
            Filtrar
          </div>
        </button>
      </div>
    </div>
  );
}