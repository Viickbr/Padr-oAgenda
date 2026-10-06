import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Pessoa } from './pessoa/pessoa';
import { Padrao } from './padrao/padrao';
import { NaoEncontrada } from './nao-encontrada/nao-encontrada';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  { path: 'home',   component: Home },
  { path: 'pessoa', component: Pessoa },
  { path: 'padrao', component: Padrao },

  // curinga: precisa ser SEMPRE a ultima rota
  { path: '**', component: NaoEncontrada }
];
