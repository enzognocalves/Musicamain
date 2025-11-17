import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar, 
  IonButton, IonList, IonItem, IonLabel, IonInput, 
  IonSelect, IonSelectOption, IonBackButton, IonButtons
} from '@ionic/angular/standalone';
import { MusicasService, NovaMusica } from 'src/app/service/musica.service';

@Component({
  selector: 'app-cadastrar',
  templateUrl: './cadastrar.page.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonList, IonItem, IonLabel,
    IonInput, IonSelect, IonSelectOption, IonBackButton,
    IonButtons
  ]
})
export class CadastrarPage {
  artista = '';
  nome = '';
  duracao = '';
  album = '';
  genero = '';
  generos = ['Pop', 'Rock', 'Hip Hop', 'Eletrônica', 'MPB', 'Sertanejo', 'Funk', 'R&B', 'Jazz', 'Clássica', 'Reggae', 'Metal', 'Country', 'Blues', 'Outro'];

  constructor(
    private musicasService: MusicasService, 
    private router: Router
  ) {}

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

  async salvarMusica() {
    if (this.artista && this.nome && this.duracao && this.album && this.genero) {
      
      // VALIDAÇÃO FINAL
      if (!this.musicasService.validarDuracao(this.duracao)) {
        alert('Formato de duração inválido!\nUse o formato MM:SS (ex: 3:45)\nMáximo: 59:59');
        return;
      }

      const musica: NovaMusica = { 
        artista: this.artista, 
        nome: this.nome, 
        duracao: this.duracao, 
        album: this.album, 
        genero: this.genero 
      };
      
      const resultado = await this.musicasService.adicionarMusica(musica);
      
      if (resultado.sucesso) {
        alert('Música salva com sucesso!');
        this.router.navigate(['/home']);
      } else {
        alert(resultado.mensagem || 'Erro ao salvar música');
      }
    } else {
      alert('Preencha todos os campos.');
    }
  }

  limparFormulario() {
    this.artista = '';
    this.nome = '';
    this.duracao = '';
    this.album = '';
    this.genero = '';
  }

  voltarParaHome() {
    this.router.navigate(['/home']);
  }
}