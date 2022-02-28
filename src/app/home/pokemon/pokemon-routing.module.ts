import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PokemonPage } from './pokemon.page';

const routes: Routes = [
  {
    path: '',
    component: PokemonPage
  },
  {
    path: 'battle',
    loadChildren: () => import('./battle/battle.module').then( m => m.BattlePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PokemonPageRoutingModule {}
