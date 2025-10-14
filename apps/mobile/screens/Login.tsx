import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { loginWithPassword, signUpWithPassword } from '../api/auth';

const MIN_PASSWORD_LENGTH = 6;

type AuthMode = 'login' | 'register';

type LoginScreenProps = {
  initialError?: string | null;
  onAuthenticated?: () => void;
};

const MODE_METADATA: Record<
  AuthMode,
  { title: string; description: string; cta: string; submitting: string }
> = {
  login: {
    title: 'Acesse sua conta',
    description:
      'Entre com seu e-mail institucional para acompanhar eventos, presenças e conquistas do EDClub.',
    cta: 'Entrar',
    submitting: 'Entrando...',
  },
  register: {
    title: 'Crie sua conta',
    description:
      'Cadastre-se para desbloquear sua agenda acadêmica, registrar presenças e compartilhar novidades com a turma.',
    cta: 'Criar conta',
    submitting: 'Criando conta...',
  },
};

const LoginScreen: React.FC<LoginScreenProps> = ({ initialError, onAuthenticated }) => {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setError(initialError ?? null);
  }, [initialError]);

  const { title, description, cta, submitting: submittingLabel } = useMemo(
    () => MODE_METADATA[mode],
    [mode],
  );

  const resetMessages = () => {
    setError(null);
    setFeedback(null);
  };

  const handleModeChange = (nextMode: AuthMode) => {
    if (nextMode === mode) {
      return;
    }

    setMode(nextMode);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    resetMessages();
  };

  const validate = (): boolean => {
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Informe um e-mail institucional válido.');
      return false;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`A senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
      return false;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('As senhas informadas não coincidem.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (submitting) {
      return;
    }

    resetMessages();

    if (!validate()) {
      return;
    }

    const trimmedEmail = email.trim().toLowerCase();

    setSubmitting(true);

    try {
      if (mode === 'login') {
        await loginWithPassword(trimmedEmail, password);
        setFeedback('Login realizado! Redirecionando...');
      } else {
        const result = await signUpWithPassword(trimmedEmail, password);

        if (result.session) {
          setFeedback('Conta criada com sucesso! Redirecionando...');
        } else {
          setFeedback(
            'Conta criada! Verifique seu e-mail para confirmar o cadastro antes de acessar.',
          );
        }
      }

      onAuthenticated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir a operação.');
    } finally {
      setSubmitting(false);
    }
  };

  const isSubmitDisabled = useMemo(() => {
    if (submitting) {
      return true;
    }

    if (!email.trim() || !password.trim()) {
      return true;
    }

    if (mode === 'register' && !confirmPassword.trim()) {
      return true;
    }

    return false;
  }, [confirmPassword, email, mode, password, submitting]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.brand}>EDClub</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{description}</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.modeSwitch}>
              {(['login', 'register'] as const).map((item) => (
                <Pressable
                  key={item}
                  accessibilityRole="button"
                  onPress={() => handleModeChange(item)}
                  style={({ pressed }) => [
                    styles.modeButton,
                    mode === item && styles.modeButtonActive,
                    pressed && styles.modeButtonPressed,
                  ]}
                >
                  <Text style={[styles.modeButtonText, mode === item && styles.modeButtonTextActive]}>
                    {item === 'login' ? 'Entrar' : 'Registrar'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>E-mail institucional</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                inputMode="email"
                keyboardType="email-address"
                placeholder="nome@email.com"
                placeholderTextColor="#94a3b8"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
                onSubmitEditing={() => {
                  if (mode === 'login') {
                    handleSubmit();
                  }
                }}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete={mode === 'login' ? 'password' : 'new-password'}
                placeholder="••••••••"
                placeholderTextColor="#94a3b8"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                returnKeyType={mode === 'register' ? 'next' : 'done'}
                onSubmitEditing={handleSubmit}
              />
            </View>

            {mode === 'register' ? (
              <View style={styles.field}>
                <Text style={styles.label}>Confirmar senha</Text>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="password"
                  placeholder="Repita a senha"
                  placeholderTextColor="#94a3b8"
                  secureTextEntry
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                />
              </View>
            ) : null}

            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitDisabled}
              onPress={handleSubmit}
              style={({ pressed }) => [
                styles.submitButton,
                (pressed || submitting) && styles.submitButtonPressed,
                isSubmitDisabled && styles.submitButtonDisabled,
              ]}
            >
              {submitting ? (
                <View style={styles.submitButtonContent}>
                  <ActivityIndicator color="#ffffff" />
                  <Text style={styles.submitButtonLoadingText}>{submittingLabel}</Text>
                </View>
              ) : (
                <Text style={styles.submitButtonText}>{cta}</Text>
              )}
            </Pressable>

            <Text style={styles.switchText}>
              {mode === 'login' ? 'Ainda não possui acesso?' : 'Já possui uma conta?'}{' '}
              <Text
                accessibilityRole="button"
                onPress={() => handleModeChange(mode === 'login' ? 'register' : 'login')}
                style={styles.switchLink}
              >
                {mode === 'login' ? 'Crie uma conta' : 'Faça login'}
              </Text>
            </Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Plataforma oficial de engajamento acadêmico da FIAP.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 24,
    gap: 12,
  },
  brand: {
    fontSize: 18,
    fontWeight: '600',
    color: '#cbd5f5',
    letterSpacing: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: '#e2e8f0',
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 24,
    gap: 16,
    shadowColor: '#0f172a',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  modeSwitch: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#2563eb',
  },
  modeButtonPressed: {
    opacity: 0.85,
  },
  modeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
  },
  modeButtonTextActive: {
    color: '#ffffff',
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  input: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#0f172a',
    borderWidth: 1,
    borderColor: '#d0d7e2',
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
  },
  feedbackText: {
    fontSize: 13,
    color: '#047857',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonPressed: {
    opacity: 0.9,
  },
  submitButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonLoadingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#475569',
  },
  switchLink: {
    color: '#2563eb',
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  footerText: {
    color: '#cbd5f5',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LoginScreen;
