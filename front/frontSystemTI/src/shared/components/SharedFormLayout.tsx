import React from 'react';
// Vamos criar um CSS específico para ele para não depender do módulo de Stock
import styles from './SharedFormLayout.module.css'; 

interface SharedFormLayoutProps {
  title: string;
  icon: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  submitText: string;
  children: React.ReactNode;
}

export function SharedFormLayout({ 
  title, 
  icon, 
  onSubmit, 
  onCancel, 
  submitText, 
  children 
}: SharedFormLayoutProps) {
  return (
    <div className={styles.pageContainer}>
      <div className={styles.card}>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
          {icon}
          <h2 className={styles.title}>{title}</h2>
        </div>

        <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {children}

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{ flex: 1, padding: '12px', backgroundColor: '#ccc', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              Cancelar
            </button>

            <button
              type="submit"
              style={{ flex: 1, padding: '12px', backgroundColor: '#3a7d71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}