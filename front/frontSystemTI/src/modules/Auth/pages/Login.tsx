import { useState } from 'react';
import { User, LockKey, Eye, EyeClosed } from '@phosphor-icons/react';
import axios from 'axios';
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
    const [view, setView] = useState<'login' | 'forgot' | 'reset'>('login');
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const handleRequestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await axios.post('http://localhost:8080/api/auth/password-reset/request', { email });
            alert('Código enviado para o seu e-mail!');
            setView('reset');
        } catch {
            setError('E-mail não encontrado.');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await axios.post('http://localhost:8080/api/auth/password-reset/confirm', {
                token,
                newPassword
            });
            alert('Senha alterada com sucesso!');
            setView('login');
        } catch {
            setError('Código inválido ou expirado.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

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
                    <img src="/logoUnimed.svg" alt="Sistema TI" className={styles.logo} />
                </div>

                <h2 className={styles.systemName}>UniSys</h2>
                <h1 className={styles.welcomeTitle}>
                    {view === 'login' && 'Olá, bem-vindo(a)!'}
                    {view === 'forgot' && 'Recuperar senha'}
                    {view === 'reset' && 'Nova senha'}
                </h1>
                <p className={styles.subtitle}>
                    {view === 'login' && 'Acesse sua conta para continuar'}
                    {view === 'forgot' && 'Insira seu e-mail para receber o código'}
                    {view === 'reset' && 'Digite o código de 6 dígitos e sua nova senha'}
                </p>

                {view === 'login' && (
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
                                required
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
                                required
                            />
                            <button
                                type="button"
                                className={styles.iconButton}
                                onClick={() => setShowPassword(!showPassword)}
                                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                            >
                                {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
                            </button>
                        </div>

                        {error && <span className={styles.errorText}>{error}</span>}

                        <button type="submit" className={styles.button} disabled={loading}>
                            {loading ? 'Entrando...' : 'Acessar'}
                        </button>

                        <div className={styles.footerLinks}>
                            <button type="button" className={styles.link} onClick={() => setView('forgot')}>
                                Esqueceu sua senha?
                            </button>
                        </div>
                    </form>
                )}

                {view === 'forgot' && (
                    <form className={styles.form} onSubmit={handleRequestReset}>
                        <div className={styles.inputGroup}>
                            <User size={20} className={styles.inputIcon} />
                            <input
                                type="email"
                                placeholder="Seu e-mail cadastrado"
                                className={styles.input}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                        {error && <span className={styles.errorText}>{error}</span>}
                        <button type="submit" className={styles.button} disabled={loading}>
                            {loading ? 'Enviando...' : 'Enviar código'}
                        </button>
                        <button type="button" className={styles.link} onClick={() => setView('login')} disabled={loading}>
                            Voltar para o login
                        </button>
                    </form>
                )}

                {view === 'reset' && (
                    <form className={styles.form} onSubmit={handleConfirmReset}>
                        <div className={styles.inputGroup}>
                            <LockKey size={20} className={styles.inputIcon} />
                            <input
                                type="text"
                                placeholder="Código de 6 dígitos"
                                className={styles.input}
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                maxLength={6}
                                disabled={loading}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <LockKey size={20} className={styles.inputIcon} />
                            <input
                                type="password"
                                placeholder="Nova senha"
                                className={styles.input}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                disabled={loading}
                                required
                            />
                        </div>
                        {error && <span className={styles.errorText}>{error}</span>}
                        <button type="submit" className={styles.button} disabled={loading}>
                            {loading ? 'Alterando...' : 'Confirmar nova senha'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
