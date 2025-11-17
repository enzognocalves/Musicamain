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
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    IonContent,
    IonItem, IonLabel, IonInput, IonButton,
    IonIcon, IonSpinner
  ]
})
export class RegistroPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  userData = {
    nome: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  async onSubmit() {
    // Validação básica
    if (!this.userData.nome || !this.userData.email || !this.userData.password || !this.userData.confirmPassword) {
      this.errorMessage = 'Por favor, preencha todos os campos.';
      return;
    }

    // Validação de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.userData.email)) {
      this.errorMessage = 'Por favor, insira um e-mail válido.';
      return;
    }

    // Validação de senha
    if (this.userData.password.length < 6) {
      this.errorMessage = 'A senha deve ter pelo menos 6 caracteres.';
      return;
    }

    // Validação de confirmação de senha
    if (this.userData.password !== this.userData.confirmPassword) {
      this.errorMessage = 'As senhas não coincidem.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const resultado = await this.authService.registrar(
        this.userData.nome, 
        this.userData.email, 
        this.userData.password
      );
      
      if (resultado.sucesso) {
        alert('Conta criada com sucesso!');
        this.router.navigate(['/home']);
      } else {
        this.errorMessage = resultado.mensagem || 'Erro ao criar conta.';
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

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}