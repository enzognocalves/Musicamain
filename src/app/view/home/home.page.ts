import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonContent, IonHeader, IonTitle, IonToolbar,
  IonButton, IonList, IonItem, IonLabel, IonIcon,
  IonButtons, IonSpinner
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { add, createOutline, trashOutline, logOutOutline, musicalNotesOutline } from 'ionicons/icons';
import { MusicasService, Musica } from 'src/app/service/musica.service';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonContent, IonHeader, IonTitle, IonToolbar,
    IonButton, IonList, IonItem, IonLabel, IonIcon,
    IonButtons, IonSpinner
  ]
})
export class HomePage implements OnInit {
  musicas: Musica[] = [];
  usuarioLogado: any = null;
  carregando = true;

  constructor(
    private router: Router, 
    private musicasService: MusicasService,
    private authService: AuthService
  ) {
    addIcons({ add, createOutline, trashOutline, logOutOutline, musicalNotesOutline });
  }

  async ngOnInit() {
    console.log('HomePage - ngOnInit iniciado');
    await this.carregarUsuario();
    await this.carregarMusicas();
  }

  async ionViewWillEnter() {
    console.log('HomePage - ionViewWillEnter iniciado');
    await this.carregarUsuario();
    await this.carregarMusicas();
  }

  carregarUsuario() {
    this.usuarioLogado = this.authService.getUsuarioLogado();
    console.log('Usuário logado:', this.usuarioLogado);
    console.log('User ID:', this.authService.getUserId());
    console.log('Está autenticado?', this.authService.isAuthenticated());
  }

  async carregarMusicas() {
    console.log('Carregar músicas iniciado');
    this.carregando = true;
    try {
      const userId = this.authService.getUserId();
      console.log('User ID para buscar músicas:', userId);
      
      if (!userId) {
        console.error('User ID é null!');
        this.musicas = [];
        return;
      }
      
      this.musicas = await this.musicasService.obterMusicas();
      console.log('Músicas carregadas:', this.musicas);
      console.log('Quantidade de músicas:', this.musicas.length);
      
    } catch (error) {
      console.error('Erro ao carregar músicas:', error);
    } finally {
      this.carregando = false;
      console.log('Carregando finalizado:', this.carregando);
    }
  }

  irParaCadastrar() {
    this.router.navigate(['/cadastrar']);
  }

  editarMusica(musica: Musica, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/detalhes', musica.id]);
  }

  async excluirMusica(musica: Musica, event: Event) {
    event.stopPropagation();
    if (confirm(`Excluir "${musica.nome}" - ${musica.artista}?`)) {
      const sucesso = await this.musicasService.excluirMusica(musica.id);
      if (sucesso) {
        await this.carregarMusicas(); // Recarrega a lista
      } else {
        alert('Erro ao excluir música.');
      }
    }
  }

  logout() {
    if (confirm('Deseja sair da aplicação?')) {
      this.authService.logout();
    }
  }
}