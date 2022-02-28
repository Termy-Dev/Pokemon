import { Component, OnInit } from '@angular/core';
import { PokemonSpecy } from '../services/pokemon.generation';
import { PokemonService } from '../services/pokemon.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  pokedex: PokemonSpecy[] = [];
  load = false;
  gen: string[] = ["Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ", "Ⅵ", "Ⅶ", "Ⅷ"];

  constructor(private pokedexService: PokemonService) { }

  async ngOnInit() {
    this.pokedex = (await this.pokedexService.getPokedex("1")).pokemon_species;
    this.oreder();
    setTimeout(() => this.load = true, 1000);
  }

  oreder() {
    this.pokedex.sort((a, b) => (Number(a.url.split("/")[6]) > Number(b.url.split("/")[6])) ? 1 : ((Number(b.url.split("/")[6]) > Number(a.url.split("/")[6])) ? -1 : 0))
  }

  openDetails(url: string) {
    return "/pokemon/" + url.split("/")[6];
  }

  getImg(url: string) {
    return "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" + url.split("/")[6] + ".png";
  }

  toggleTheme(event)
  {
    event.detail.checked? document.body.setAttribute('color-theme','dark') :document.body.setAttribute('color-theme','light');
  }

  async segmentChanged(ev: CustomEvent) {
    
    if(ev.detail.value!=undefined)
    {
      this.load = false;
      this.pokedex = (await this.pokedexService.getPokedex(ev.detail.value)).pokemon_species;
      this.oreder()
      setTimeout(() => this.load = true, 1000);
    }
  }
}
