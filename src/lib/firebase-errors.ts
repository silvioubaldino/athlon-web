/**
 * Maps Firebase Auth error codes to user-facing PT-BR messages.
 */
export function getAuthErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/user-not-found':        'Usuário não encontrado.',
    'auth/wrong-password':        'Senha incorreta.',
    'auth/invalid-email':         'E-mail inválido.',
    'auth/invalid-credential':    'E-mail ou senha incorretos.',
    'auth/email-already-in-use':  'Este e-mail já está cadastrado.',
    'auth/weak-password':         'A senha deve ter ao menos 6 caracteres.',
    'auth/user-disabled':         'Esta conta foi desabilitada.',
    'auth/too-many-requests':     'Muitas tentativas. Tente novamente mais tarde.',
    'auth/network-request-failed':'Falha de rede. Verifique sua conexão.',
    'auth/popup-closed-by-user':  'Login com Google cancelado.',
    'auth/popup-blocked':         'O popup foi bloqueado pelo navegador. Permita popups para este site.',
    'auth/cancelled-popup-request': 'Login com Google cancelado.',
    'auth/account-exists-with-different-credential':
      'Já existe uma conta com este e-mail. Tente outro método de login.',
  }
  return messages[code] ?? 'Erro de autenticação. Tente novamente.'
}
