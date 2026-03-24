// src/modules/Auth/pages/Login.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LockKey, Eye, EyeClosed, Intersect } from '@phosphor-icons/react';
import { AuthService } from '../../../shared/services/authService';
import styles from './Login.module.css';

interface LoginProps {
  onLoginSuccess: () => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    

    
    try {
      await AuthService.login({ login, password });
      

      onLoginSuccess(); 
      
    } catch (err) {
            console.error(err);
            setError('Usuário ou senha inválidos.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>


                <div className={styles.logoContainer}>
                    <Intersect size={48} color="#d1d1d1" weight="fill" />
                </div>

                <h2 className={styles.systemName}>Entrar no Sistema TI</h2>
                <h1 className={styles.welcomeTitle}>Olá, Bem-vindo(a)!</h1>
                <p className={styles.subtitle}>Acesse sua conta para continuar</p>

                <form className={styles.form} onSubmit={handleLogin}>

                    <div className={styles.inputGroup}>
                        <User size={20} className={styles.inputIcon} />
                        <input
                            type="text"
                            placeholder="Usuário"
                            className={styles.input}
                            value={login}
                            onChange={(e) => setLogin(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <LockKey size={20} className={styles.inputIcon} />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Senha"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                        />
                        <button
                            type="button"
                            className={styles.iconButton}
                            onClick={() => setShowPassword(!showPassword)}
                            tabIndex={-1}
                        >
                            {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
                        </button>
                    </div>

                    {error && <span className={styles.errorText}>{error}</span>}

                    <button type="submit" className={styles.button} disabled={loading}>
                        {loading ? 'Entrando...' : 'Acessar'}
                    </button>
                </form>

                <div className={styles.footerLinks}>
                    <button type="button" className={styles.link}>
                        Esqueceu sua senha?
                    </button>
                    <button type="button" className={styles.link}>
                        Não tem conta? Solicite acesso.
                    </button>
                </div>

            </div>
        </div>
    );
}