import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { PokemonDescription } from 'src/app/services/pokemon.description';
import { Pokemon } from 'src/app/services/pokemon.model';
import { PokemonService } from 'src/app/services/pokemon.service';


@Component({
  selector: 'app-pokemon',
  templateUrl: './pokemon.page.html',
  styleUrls: ['./pokemon.page.scss'],
})
export class PokemonPage implements OnInit {

  @Input() id: string;
  pokemon: Pokemon;
  pokemonDescription: PokemonDescription;
  
  colours = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
  };

  statMax: number[] = []
  desc: string;

  constructor(private pokedexService: PokemonService, private route: ActivatedRoute, private router: Router) { }

  async ngOnInit() {
    const id: string = this.route.snapshot.params.id;
    this.pokemon = await this.pokedexService.getPokemon(id);
    this.pokemonDescription = (await this.pokedexService.getPokemonDescription(this.pokemon.species.url));
    this.selectDescription();
    this.setStatMax();
    this.setHabitat();
  }

  changeColor(type: string) {
    switch (type) {
      case "normal": return this.colours.normal;
      case "fire": return this.colours.fire;
      case "water": return this.colours.water;
      case "electric": return this.colours.electric;
      case "grass": return this.colours.grass;
      case "ice": return this.colours.ice;
      case "fighting": return this.colours.fighting;
      case "poison": return this.colours.poison;
      case "ground": return this.colours.ground;
      case "flying": return this.colours.flying;
      case "psychic": return this.colours.psychic;
      case "bug": return this.colours.bug;
      case "rock": return this.colours.rock;
      case "ghost": return this.colours.ghost;
      case "dragon": return this.colours.dragon;
      case "dark": return this.colours.dark;
      case "steel": return this.colours.steel;
      case "fairy": return this.colours.fairy;
    }
  }

  changeColorGender() {
    if (this.pokemonDescription?.gender_rate == -1) {
      return "#C6FFA8";
    }
    return "#4c8dff";
  }

  selectDescription() {
    const descrip = this.pokemonDescription.flavor_text_entries.filter(item => item.language.name == "en");
    const index = Math.floor(Math.random() * descrip.length);
    this.desc = descrip[index].flavor_text;
  }

  setStatMax() {
    switch (this.pokemonDescription.generation.name) {
      case "generation-i": this.statMax = [250, 134, 180, 154, 125, 150]; break;
      case "generation-ii": this.statMax = [255, 134, 230, 130, 230, 130]; break;
      case "generation-iii": this.statMax = [170, 160, 200, 150, 200, 160]; break;
      case "generation-iv": this.statMax = [150, 165, 168, 150, 150, 125]; break;
      case "generation-v": this.statMax = [165, 150, 145, 150, 135, 145]; break;
      case "generation-vi": this.statMax = [126, 131, 184, 131, 154, 126]; break;
      case "generation-vii": this.statMax = [223, 181, 211, 173, 142, 151]; break;
      case "generation-viii": this.statMax = [200, 145, 145, 145, 130, 200]; break;
    }
  }

  setHabitat() {
    if (this.pokemonDescription.habitat == null) this.pokemonDescription.habitat = ""
  }

  onSubmit = () => {
    let navigationExtras: NavigationExtras = {
           state: {
             data: this.pokemon
          }
        }
    this.router.navigate(['pokemon/'+this.route.snapshot.params.id+'/battle'], navigationExtras);
       }
}