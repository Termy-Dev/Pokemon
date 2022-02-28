import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Generation } from './pokemon.generation';
import { Pokemon } from './pokemon.model';
import { PokemonDescription } from './pokemon.description';
import { PokemonMoveDetail } from './pokemon.move.detail';

@Injectable({
  providedIn: 'root'
})
export class PokemonService {

  constructor(private http: HttpClient) { }

  url= 'https://pokeapi.co/api/v2/';
  
  getPokedex(gen:string){
   return this.http.get<Generation>(this.url+'generation/'+gen).toPromise();
 }

 getPokemon(id:string)
 {
   return this.http.get<Pokemon>(this.url+'pokemon/'+id).toPromise();
 }

 getPokemonDescription(url:string)
 {
   return this.http.get<PokemonDescription>(`${url}`).toPromise();
 }

 getPokemonMoveDetail(moveName:string)
 {
  return this.http.get<PokemonMoveDetail>(this.url+'move/'+moveName).toPromise();
 }
}
