import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonButton, IonList, IonItem, IonLabel, IonInput, 
  IonSelect, IonSelectOption, IonBackButton, IonButtons,
  IonIcon
} from '@ionic/angular/standalone';
import { MusicasService, Musica, NovaMusica } from 'src/app/service/musica.service';

@Component({
  selector: 'app-detalhes',
  templateUrl: './detalhes.page.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonList, IonItem, IonLabel,
    IonInput, IonSelect, IonSelectOption, IonBackButton,
    IonButtons, IonIcon
  ]
})
export class DetalhesPage implements OnInit {
  musica: Musica | null = null;
  artista = '';
  nome = '';
  duracao = '';
  album = '';
  genero = '';
  generos = ['Pop', 'Rock', 'Hip Hop', 'Eletrônica', 'MPB', 'Sertanejo', 'Funk', 'R&B', 'Jazz', 'Clássica', 'Reggae', 'Metal', 'Country', 'Blues', 'Outro'];
  carregando = true;
  salvando = false;

  constructor(
    private route: ActivatedRoute, 
    private router: Router, 
    private musicasService: MusicasService
  ) {}

  async ngOnInit() {
    await this.carregarMusica();
  }

  async carregarMusica() {
    this.carregando = true;
    try {
      const id = this.route.snapshot.paramMap.get('id');
      console.log('Carregando música ID:', id);
      
      if (id) {
        const musicaEncontrada = await this.musicasService.obterMusicaPorId(id);
        console.log('Música encontrada:', musicaEncontrada);
        
        if (musicaEncontrada) {
          this.musica = musicaEncontrada;
          this.artista = this.musica.artista;
          this.nome = this.musica.nome;
          this.duracao = this.musica.duracao;
          this.album = this.musica.album;
          this.genero = this.musica.genero;
        } else {
          alert('Música não encontrada.');
          this.router.navigate(['/home']);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar música:', error);
      alert('Erro ao carregar dados da música.');
      this.router.navigate(['/home']);
    } finally {
      this.carregando = false;
    }
  }

  // VALIDAÇÃO EM TEMPO REAL NO INPUT
  formatarDuracao(event: any) {
    let valor = event.target.value;
    
    // Remove caracteres não numéricos exceto :
    valor = valor.replace(/[^0-9:]/g, '');
    
    // Limita a 5 caracteres (MM:SS)
    if (valor.length > 5) {
      valor = valor.substring(0, 5);
    }
    
    // Auto-insere : após 2 dígitos
    if (valor.length === 2 && !valor.includes(':')) {
      valor = valor + ':';
    }
    
    this.duracao = valor;
  }

  async salvarAlteracoes() {
    if (this.musica && this.artista && this.nome && this.duracao && this.album && this.genero) {
      
      // VALIDAÇÃO FINAL
      if (!this.musicasService.validarDuracao(this.duracao)) {
        alert('Formato de duração inválido!\nUse o formato MM:SS (ex: 3:45)\nMáximo: 59:59');
        return;
      }

      this.salvando = true;

      try {
        const musicaAtualizada: NovaMusica = { 
          artista: this.artista, 
          nome: this.nome, 
          duracao: this.duracao, 
          album: this.album, 
          genero: this.genero 
        };
        
        console.log('Salvando alterações:', this.musica.id, musicaAtualizada);
        
        const resultado = await this.musicasService.atualizarMusica(this.musica.id, musicaAtualizada);
        
        if (resultado.sucesso) {
          alert('Música atualizada com sucesso!');
          this.router.navigate(['/home']);
        } else {
          alert(resultado.mensagem || 'Erro ao atualizar música');
        }
      } catch (error) {
        console.error('Erro ao salvar:', error);
        alert('Erro inesperado ao atualizar música.');
      } finally {
        this.salvando = false;
      }
    } else {
      alert('Preencha todos os campos.');
    }
  }

  async excluirMusica() {
    if (this.musica) {
      const confirmacao = confirm(`Tem certeza que deseja excluir "${this.musica.nome}" - ${this.musica.artista}?`);
      
      if (confirmacao) {
        try {
          const sucesso = await this.musicasService.excluirMusica(this.musica.id);
          if (sucesso) {
            alert('Música excluída com sucesso!');
            this.router.navigate(['/home']);
          } else {
            alert('Erro ao excluir música.');
          }
        } catch (error) {
          console.error('Erro ao excluir:', error);
          alert('Erro inesperado ao excluir música.');
        }
      }
    }
  }

  voltarParaHome() {
    this.router.navigate(['/home']);
  }

  // Verifica se houve alterações nos dados
  houveAlteracoes(): boolean {
    if (!this.musica) return false;
    
    return this.artista !== this.musica.artista ||
           this.nome !== this.musica.nome ||
           this.duracao !== this.musica.duracao ||
           this.album !== this.musica.album ||
           this.genero !== this.musica.genero;
  }
}