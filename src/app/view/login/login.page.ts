import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  IonContent, IonItem, IonLabel, IonInput, IonButton,
  IonIcon, IonSpinner
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/service/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent,
    IonItem, IonLabel, IonInput, IonButton,
    IonIcon, IonSpinner
  ]
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = {
    email: '',
    password: ''
  };

  isLoading = false;
  errorMessage = '';
  showPassword = false;

  async onSubmit() {
    // Validação básica
    if (!this.credentials.email || !this.credentials.password) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.credentials.email)) {
      this.errorMessage = 'Por favor, insira um e-mail válido.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const resultado = await this.authService.login(this.credentials.email, this.credentials.password);
      
      if (resultado.sucesso) {
        this.router.navigate(['/home']);
      } else {
        this.errorMessage = resultado.mensagem || 'Erro ao fazer login.';
      }
    } catch (error) {
      this.errorMessage = 'Erro inesperado. Tente novamente.';
    } finally {
      this.isLoading = false;
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Método adicionado para corrigir o erro
  forgotPassword() {
    console.log('Redirecionar para recuperação de senha');
    // this.router.navigate(['/forgot-password']);
    alert('Funcionalidade de recuperação de senha em desenvolvimento.');
  }

  createAccount() {
    this.router.navigate(['/registro']);
  }
}