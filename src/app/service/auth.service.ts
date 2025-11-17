import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FirebaseService } from './firebase.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private firebaseService = inject(FirebaseService);
  private router = inject(Router);

  constructor() {}

  // Registrar novo usuário
  async registrar(nome: string, email: string, password: string): Promise<{sucesso: boolean, mensagem?: string}> {
    try {
      const userCredential = await this.firebaseService.registrarUsuario(email, password, nome);
      
      // Salvar token e dados no localStorage
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        nome: nome
      }));

      return { sucesso: true };
    } catch (error: any) {
      let mensagem = 'Erro ao criar conta. Tente novamente.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          mensagem = 'Este e-mail já está em uso.';
          break;
        case 'auth/invalid-email':
          mensagem = 'E-mail inválido.';
          break;
        case 'auth/weak-password':
          mensagem = 'Senha muito fraca. Use pelo menos 6 caracteres.';
          break;
        default:
          mensagem = error.message || 'Erro desconhecido.';
      }
      
      return { sucesso: false, mensagem };
    }
  }

  // Login do usuário
  async login(email: string, password: string): Promise<{sucesso: boolean, mensagem?: string}> {
    try {
      const userCredential = await this.firebaseService.loginUsuario(email, password);
      
      // Obter dados adicionais do usuário - CORRIGIDO
      const userData = await this.firebaseService.obterDadosUsuario(userCredential.user.uid);
      
      // Salvar token e dados no localStorage
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        nome: userData?.nome || 'Usuário' // Agora userData pode ser null
      }));

      return { sucesso: true };
    } catch (error: any) {
      let mensagem = 'Erro ao fazer login. Tente novamente.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          mensagem = 'Usuário não encontrado.';
          break;
        case 'auth/wrong-password':
          mensagem = 'Senha incorreta.';
          break;
        case 'auth/invalid-email':
          mensagem = 'E-mail inválido.';
          break;
        case 'auth/user-disabled':
          mensagem = 'Esta conta foi desativada.';
          break;
        default:
          mensagem = error.message || 'Erro desconhecido.';
      }
      
      return { sucesso: false, mensagem };
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await this.firebaseService.logout();
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  }

  // Verificar autenticação
  isAuthenticated(): boolean {
    return this.firebaseService.isAuthenticated();
  }

  // Obter dados do usuário logado
  getUsuarioLogado(): any {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Obter UID do usuário
  getUserId(): string | null {
    const user = this.getUsuarioLogado();
    return user ? user.uid : null;
  }
}