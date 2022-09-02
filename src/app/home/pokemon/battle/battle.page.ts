import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { Pokemon } from 'src/app/services/pokemon.model';
import { PokemonService } from 'src/app/services/pokemon.service';
import { getValue } from './battle.combination';
import { ScreenOrientation } from '@awesome-cordova-plugins/screen-orientation/ngx';

interface BattlePokemon {
  name: string;
  statsBase: StatsPokemon[];
  moves?: MovePokemon[];
  isAlive: boolean;
  statsBattle: StatsPokemon[];
  imageUrl: string;
  types: string[];
}

interface StatsPokemon {
  name?: string;
  value?: number;
}

interface MovePokemon {
  name: string;
  power: number; //null
  accuracy: number; //null
  stateChange?: StatsPokemon[]; // []
  type: string;
  drain: number; //0
  healing: number; //0
  crit_rate: number; //0
  target: string;
}

@Component({
  selector: 'app-battle',
  templateUrl: './battle.page.html',
  styleUrls: ['./battle.page.scss'],
})

export class BattlePage implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router, private pokedexService: PokemonService, private alertCtr: AlertController, private screenOrientation: ScreenOrientation) {
    this.route.queryParams.subscribe(params => {
      if (this.router.getCurrentNavigation().extras.state) {
        this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE);
        this.setPokemon(this.router.getCurrentNavigation().extras.state.data, 0)
      } else {
        this.router.navigate(['/home']);
      }
    });

  }

  battlePokemon: BattlePokemon[] = [];
  text: string;
  load = false;
  textDamage: string[] = [];
  enabledButton = true;

  async ngOnInit() {
    const id = Math.floor(Math.random() * 898) + 1;
    this.setPokemon(await this.pokedexService.getPokemon(String(id)), 1);
    this.battlePokemon.map(async item => {
      this.selectMove(await this.pokedexService.getPokemon(item.name)).then(response => {
        item.moves = response
      })
      item.name = item.name[0].toUpperCase() + item.name.slice(1);
    })
    this.text = "What Will " + this.battlePokemon[0].name + " do?";
    setTimeout(() => this.load = true, 2000);
  }

  setPokemon(pokemon: Pokemon, select: number) {
    this.battlePokemon[select] = {
      name: pokemon.name,
      statsBase: pokemon.stats.map(item => { return { value: item.base_stat, name: item.stat.name } }),
      isAlive: true,
      statsBattle: pokemon.stats.map(item => { return { value: item.base_stat, name: item.stat.name } }),
      imageUrl: pokemon.sprites.back_default,
      types: pokemon.types.map(item => item.type.name)
    }
    select == 1 && (this.battlePokemon[select].imageUrl = pokemon.sprites.front_default);
  }

  async selectMove(pokemon: Pokemon) {

    let move: MovePokemon[] = [];
    let change: StatsPokemon[] = [];
    if (pokemon.moves.length > 4) {
      let addMove = 0;
      do {
        let index = Math.floor(Math.random() * pokemon.moves.length);
        if (move.find(item => item.name === pokemon.moves[index].move.name) === undefined) {
          let moveDetail = await this.pokedexService.getPokemonMoveDetail(pokemon.moves[index].move.name);
          if (moveDetail.power != null || addMove > 1) {
            moveDetail.stat_changes.length > 0 && (moveDetail.stat_changes.map(item => change.push({ name: item.stat.name, value: item.change })))
            move.push({
              name: pokemon.moves[index].move.name,
              power: moveDetail.power,
              accuracy: moveDetail.accuracy,
              type: moveDetail.type.name,
              drain: moveDetail.meta.drain,
              healing: moveDetail.meta.healing,
              crit_rate: moveDetail.meta.crit_rate,
              target: moveDetail.target.name,
              stateChange: change
            });
            addMove++;
          }
        }
      } while (addMove < 4)
    } else {
      pokemon.moves.map(async item => {
        let moveDetail = await this.pokedexService.getPokemonMoveDetail(item.move.name);
        moveDetail.stat_changes.length > 0 && (moveDetail.stat_changes.map(item => change.push({ name: item.stat.name, value: item.change })))
        move.push({
          name: item.move.name,
          power: moveDetail.power,
          accuracy: moveDetail.accuracy,
          type: moveDetail.type.name,
          drain: moveDetail.meta.drain,
          healing: moveDetail.meta.healing,
          crit_rate: moveDetail.meta.crit_rate,
          target: moveDetail.target.name,
          stateChange: change
        });

      })
    }
    return move;
  }

  async attack(index: number) {

    let select = 0;
    let turn = 1;
    this.enabledButton = false;
    do {
      this.text = this.battlePokemon[select].name + " used " + this.battlePokemon[select].moves[index].name + "!";
      if (this.battlePokemon[select].moves[index].name != "transform") {
        if (this.attackOnTarget(select, index)) {
          this.battlePokemon[select].moves[index].healing > 0 &&( this.healingTarget(select, index) )
          this.battlePokemon[select].moves[index].drain != 0 &&( await this.drainTarget(select, index, turn))
          this.battlePokemon[select].moves[index].power != null &&( this.calcAttack(index, turn, select) )
          if (this.battlePokemon[select].isAlive || this.battlePokemon[turn].isAlive) {
            this.battlePokemon[select].moves[index].stateChange.length > 0 && ( this.changeState(index, turn, select))
          } else {
            this.battlePokemon[turn].isAlive == false ? await this.presentAlert(select) : await this.presentAlert(turn)
            break;
          }

        } else {
          this.textDamage[turn] = "Evaded"
        }
      }
      else {
        this.battlePokemon[select].moves = this.battlePokemon[turn].moves;
      }
      await new Promise(f => setTimeout(f, 1500));
      this.textDamage[select] = "";
      this.textDamage[turn] = "";
      if (this.battlePokemon[turn].isAlive) {

        if (turn == 1) {
          turn--;
          select++;
          index = this.decisionMove(select);
        } else {
          select++;
        }

      } else {
        await this.presentAlert(select);
        break;
      }
      await new Promise(f => setTimeout(f, 500));
    } while (select < 2)
    this.enabledButton = true;
    this.text = "What Will " + this.battlePokemon[0].name + " do?";
  }

  decisionMove(select: number) {
    let rankMoves: number[] = [];
    const stateHp = this.battlePokemon[select - 1].statsBattle[0].value;
    const hp = (stateHp / 100) * (Math.log2(stateHp / 100));
    const { types } = { ...this.battlePokemon[select - 1] };
    const { statsBattle, statsBase } = { ...this.battlePokemon[select] };
    rankMoves = this.battlePokemon[select].moves.reduce(function (acc: number[], item: MovePokemon) {
      let { accuracy, power, healing, drain, type } = { ...item };
      let comb = getValue(type, types);
      let rand = (Math.random() * 2) + 1;
      accuracy != null ? accuracy = (accuracy / 100) * (Math.log2(accuracy / 100)) : accuracy = 1;
      if (power != null) {
        power = (power / 100) * (Math.log2(power / 100));
      } else {
        if (healing > 0 || drain != 0) {
          if (statsBattle[0].value < stateHp && statsBattle[0].value <= (statsBase[0].value * 0.6)) {
            healing > drain ? power = healing : power = drain;
          } else {
            drain != 0 ? power = drain : power = healing;
          }
        } else {
          power = (10 / 100) * (Math.log2(10 / 100));
        }
      }
      acc.push((hp + accuracy + power + rand + comb));
      return acc;
    }, [] as number[])
    return rankMoves.indexOf(Math.max(...rankMoves));
  }

  calcAttack(index: number, turn: number, select: number) {
    let damage = 0;
    damage = Math.round((((2 / 5 + 2) * this.battlePokemon[select].statsBattle[1].value * (this.battlePokemon[select].moves[index].power / this.battlePokemon[turn].statsBattle[2].value)) / 50 + 2) * getValue(this.battlePokemon[select].moves[index].type, this.battlePokemon[turn].types) * (Math.random() * 2)) * this.criticalHit(select, index);
    if (this.battlePokemon[turn].statsBattle[0].value - damage > 0) {
      this.battlePokemon[turn].statsBattle[0].value = this.battlePokemon[turn].statsBattle[0].value - damage;
    } else {
      this.battlePokemon[turn].statsBattle[0].value = 0;
      this.battlePokemon[turn].isAlive = false;
    }
    damage > 0 ? this.textDamage[turn] = "- " + damage + " HP" : this.textDamage[turn] = "Immune"
  }

  criticalHit(select: number, index: number) {
    let chance;
    let critValue;
    switch (this.battlePokemon[select].moves[index].crit_rate) {
      case 0: chance = 0.065; break;
      case 1: chance = 0.125; break;
      case 2: chance = 0.25; break;
      case 3: chance = 0.33; break;
      default: chance = 0.5;
    }
    (Math.floor(Math.random() * 256) + 1) < Math.floor(255 * chance) ? critValue = Math.round((1.5 + ((4 * this.battlePokemon[select].moves[index].power) / (200 + this.battlePokemon[select].moves[index].power)))) : critValue = 1
    return critValue;
  }

  attackOnTarget(select: number, indMove: number) {
    if ((Math.floor(Math.random() * 256) + 1) < (255 * (this.battlePokemon[select].moves[indMove].accuracy / 100)) || this.battlePokemon[select].moves[indMove].accuracy == null) {
      return true;
    }
    return false;
  }

  healingTarget(select: number, index: number) {
    const healigValue = Math.round(this.battlePokemon[select].statsBase[0].value * this.battlePokemon[select].moves[index].healing / 100);
    (this.battlePokemon[select].statsBattle[0].value + healigValue) > this.battlePokemon[select].statsBase[0].value ? this.battlePokemon[select].statsBattle[0].value = this.battlePokemon[select].statsBase[0].value : this.battlePokemon[select].statsBattle[0].value = this.battlePokemon[select].statsBattle[0].value + healigValue;
    this.textDamage[select] = "+ " + healigValue + " HP";
  }

  async drainTarget(select: number, index: number, turn: number) {
    const drainValue = Math.round(this.battlePokemon[turn].statsBase[0].value * this.battlePokemon[select].moves[index].drain / 100);
    if (drainValue > 0) {
      (this.battlePokemon[select].statsBattle[0].value + drainValue) > this.battlePokemon[select].statsBase[0].value ? this.battlePokemon[select].statsBattle[0].value = this.battlePokemon[select].statsBase[0].value : this.battlePokemon[select].statsBattle[0].value = this.battlePokemon[select].statsBattle[0].value + drainValue;
      this.textDamage[select] = "+ " + drainValue + " HP";
      if ((this.battlePokemon[turn].statsBattle[0].value - drainValue) <= 0) {
        this.textDamage[turn] = "- " + drainValue + " HP";
        this.battlePokemon[turn].statsBattle[0].value = 0;
        this.battlePokemon[turn].isAlive = false;

      } else {
        this.battlePokemon[turn].statsBattle[0].value = this.battlePokemon[turn].statsBattle[0].value - drainValue;
        this.textDamage[turn] = "- " + drainValue + " HP";
      }

    } else {
      if ((this.battlePokemon[select].statsBattle[0].value + drainValue) <= 0) {
        this.textDamage[select] = "- " + Math.abs(drainValue) + " HP";
        this.battlePokemon[select].statsBattle[0].value = 0;
        this.battlePokemon[select].isAlive = false;

      } else {
        this.battlePokemon[select].statsBattle[0].value = this.battlePokemon[select].statsBattle[0].value + drainValue;
        this.textDamage[select] = "- " + Math.abs(drainValue) + " HP";
        (this.battlePokemon[turn].statsBattle[0].value - drainValue) > this.battlePokemon[turn].statsBase[0].value ? this.battlePokemon[turn].statsBattle[0].value = this.battlePokemon[turn].statsBase[0].value : this.battlePokemon[turn].statsBattle[0].value = this.battlePokemon[turn].statsBattle[0].value - drainValue;
        this.textDamage[turn] = "+ " + Math.abs(drainValue) + " HP";
      }
    }
    await new Promise(f => setTimeout(f, 1000));
  }
  changeState(index, turn, select) {
    if (this.battlePokemon[select].moves[index].target.includes("user") || this.battlePokemon[select].moves[index].target.includes("ally") || this.battlePokemon[select].moves[index].target.includes("allies")) {
      this.battlePokemon[select].moves[index].stateChange.map(item => this.battlePokemon[select].statsBattle.find(elem => {
        if (elem.name === item.name) elem.value = elem.value + item.value
      }))
    } else {
      this.battlePokemon[select].moves[index].stateChange.map(item => this.battlePokemon[turn].statsBattle.find(elem => {
        if (elem.name === item.name) elem.value = elem.value + item.value
      }))
    }

  }

  async presentAlert(winner: number) {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    this.screenOrientation.unlock();
    let title, subTitle;
    if (winner == 0) {
      title = "You Win!";
      subTitle = "Congratulation " + this.battlePokemon[winner].name + " Won!!!"
    } else {
      title = "You Lose!";
      subTitle = this.battlePokemon[winner - 1].name + " Lost!!!"
    }
    const alert = await this.alertCtr.create({
      header: title,
      message: subTitle,
      buttons: ["OK"]
    });
    await alert.present();
    this.router.navigate(['/home']);
  }
  toHome() {
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.PORTRAIT);
    this.screenOrientation.unlock();
    this.router.navigate(['/home']);
  }
}