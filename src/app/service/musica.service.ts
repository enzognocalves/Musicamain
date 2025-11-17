import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import { FirebaseService } from './firebase.service';

export interface Musica {
  id: string;
  artista: string;
  nome: string;
  duracao: string;
  album: string;
  genero: string;
  userId: string;
  dataCriacao: Date;
}

export type NovaMusica = Omit<Musica, 'id' | 'userId' | 'dataCriacao'>;

@Injectable({
  providedIn: 'root'
})
export class MusicasService {
  private authService = inject(AuthService);
  private firebaseService = inject(FirebaseService);

  // VALIDAÇÃO DA DURAÇÃO
  validarDuracao(duracao: string): boolean {
    const regex = /^[0-9]{1,2}:[0-9]{2}$/;
    if (!regex.test(duracao)) return false;
    
    const [minutos, segundos] = duracao.split(':').map(Number);
    return minutos <= 59 && segundos <= 59;
  }

  // ADICIONAR MÚSICA
  async adicionarMusica(musica: NovaMusica): Promise<{sucesso: boolean, mensagem?: string}> {
    try {
      const userId = this.authService.getUserId();
      if (!userId) {
        return { sucesso: false, mensagem: 'Usuário não autenticado.' };
      }

      if (!this.validarDuracao(musica.duracao)) {
        return { sucesso: false, mensagem: 'Formato de duração inválido. Use MM:SS (ex: 3:45). Máximo: 59:59' };
      }

      const musicaCompleta = {
        ...musica,
        userId: userId,
        dataCriacao: new Date()
      };

      await this.firebaseService.adicionarMusica(musicaCompleta);
      return { sucesso: true };
    } catch (error: any) {
      return { sucesso: false, mensagem: error.message || 'Erro ao salvar música.' };
    }
  }

  // OBTER MÚSICAS DO USUÁRIO
  async obterMusicas(): Promise<Musica[]> {
    try {
      const userId = this.authService.getUserId();
      if (!userId) return [];
      
      return await this.firebaseService.obterMusicasPorUsuario(userId);
    } catch (error) {
      console.error('Erro ao carregar músicas:', error);
      return [];
    }
  }

  // OBTER MÚSICA POR ID
  async obterMusicaPorId(id: string): Promise<Musica | undefined> {
    try {
      const userId = this.authService.getUserId();
      if (!userId) return undefined;
      
      return await this.firebaseService.obterMusicaPorId(id, userId);
    } catch (error) {
      console.error('Erro ao carregar música:', error);
      return undefined;
    }
  }

  // ATUALIZAR MÚSICA - CORRIGIDO
async atualizarMusica(id: string, musicaAtualizada: NovaMusica): Promise<{sucesso: boolean, mensagem?: string}> {
  try {
    const userId = this.authService.getUserId();
    if (!userId) {
      return { sucesso: false, mensagem: 'Usuário não autenticado.' };
    }

    // VALIDAÇÃO ANTES DE ATUALIZAR
    if (!this.validarDuracao(musicaAtualizada.duracao)) {
      return { sucesso: false, mensagem: 'Formato de duração inválido. Use MM:SS (ex: 3:45). Máximo: 59:59' };
    }

    console.log('Atualizando música no serviço:', id, musicaAtualizada);
    await this.firebaseService.atualizarMusica(id, musicaAtualizada);
    
    return { sucesso: true };
  } catch (error: any) {
    console.error('Erro no serviço ao atualizar música:', error);
    return { sucesso: false, mensagem: error.message || 'Erro ao atualizar música.' };
  }
}

// EXCLUIR MÚSICA - CORRIGIDO
async excluirMusica(id: string): Promise<boolean> {
  try {
    const userId = this.authService.getUserId();
    if (!userId) return false;
    
    console.log('Excluindo música no serviço:', id);
    await this.firebaseService.excluirMusica(id);
    return true;
  } catch (error) {
    console.error('Erro no serviço ao excluir música:', error);
    return false;
  }
}
}