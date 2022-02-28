import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'pokemon/:id',
    loadChildren: () => import('./home/pokemon/pokemon.module').then( m => m.PokemonPageModule)
  },
  {
    path: 'pokemon/:id/battle',
    loadChildren: () => import('./home/pokemon/battle/battle.module').then( m => m.BattlePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
