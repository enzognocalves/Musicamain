import { Routes } from '@angular/router';
import { HomePage } from './view/home/home.page';
import { CadastrarPage } from './view/cadastrar/cadastrar.page';
import { DetalhesPage } from './view/detalhes/detalhes.page';
import { LoginPage } from './view/login/login.page';
import { RegistroPage } from './view/registro/registro.page';
import { AuthGuard } from './service/auth.guard';

export const routes: Routes = [
  // Redireciona para login como página inicial
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  
  // Rotas públicas
  { path: 'login', component: LoginPage },
  { path: 'registro', component: RegistroPage },
  
  // Rotas protegidas
  { 
    path: 'home', 
    component: HomePage,
    canActivate: [AuthGuard]
  },
  { 
    path: 'cadastrar', 
    component: CadastrarPage,
    canActivate: [AuthGuard]
  },
  { 
    path: 'detalhes/:id', 
    component: DetalhesPage,
    canActivate: [AuthGuard]
  },
  
  // Redireciona qualquer rota não encontrada para o login
  { path: '**', redirectTo: 'login' }
];