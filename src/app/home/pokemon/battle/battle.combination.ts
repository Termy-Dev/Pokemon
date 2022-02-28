interface BattleCombination {
    name: string;
    immunes: string[];
    weaknesses: string[];
    strengths: string[];
}
const combination: BattleCombination[] = [
    { name: "normal", immunes: ["ghost"], weaknesses: ["rock", "steel"], strengths: [] },
    { name: "fire", immunes: [], weaknesses: ["fire", "water", "rock", "dragon"], strengths: ["grass", "ice", "bug", "steel"] },
    { name: "water", immunes: [], weaknesses: ["water", "grass", "dragon"], strengths: ["fire", "ground", "rock"] },
    { name: "electric", immunes: ["ground"], weaknesses: ["electric", "grass", "dragon"], strengths: ["water", "flying"] },
    { name: "grass", immunes: [], weaknesses: ["fire", "grass", "poison", "flying", "bug", "dragon", "steel"], strengths: ["water", "ground", "rock"] },
    { name: "ice", immunes: [], weaknesses: ["fire", "water", "ice", "steel"], strengths: ["grass", "ground", "flying", "dragon"] },
    { name: "fighting", immunes: ["ghost"], weaknesses: ["poison", "flying", "psychic", "bug", "fairy"], strengths: ["normal", "ice", "rock", "dark", "steel"] },
    { name: "poison", immunes: ["steel"], weaknesses: ["poison", "ground", "rock", "ghost"], strengths: ["grass", "fairy"] },
    { name: "ground", immunes: ["flying"], weaknesses: ["grass", "bug"], strengths: ["fire", "electric", "poison", "rock", "steel"] },
    { name: "flying", immunes: [], weaknesses: ["electric", "rock", "steel"], strengths: ["grass", "fighting", "bug"] },
    { name: "psychic", immunes: ["dark"], weaknesses: ["psychic", "steel"], strengths: ["fighting", "poison"] },
    { name: "bug", immunes: [], weaknesses: ["fire", "fighting", "poison", "flying", "ghost", "steel", "fairy"], strengths: ["grass", "psychic", "dark"] },
    { name: "rock", immunes: [], weaknesses: ["fighting", "ground", "steel"], strengths: ["fire", "ice", "flying", "bug"] },
    { name: "ghost", immunes: ["normal"], weaknesses: ["dark"], strengths: ["psychic", "ghost"] },
    { name: "dragon", immunes: ["fairy"], weaknesses: ["steel"], strengths: ["dragon"] },
    { name: "dark", immunes: [], weaknesses: ["fighting", "dark", "fairy"], strengths: ["psychic", "ghost"] },
    { name: "steel", immunes: [], weaknesses: ["fire", "water", "electric", "steel"], strengths: ["ice", "rock", "fairy"] },
    { name: "fairy", immunes: [], weaknesses: ["fire", "poison", "steel"], strengths: ["fighting", "dragon", "dark"] }]

export function getValue(typeAtt: string, typePoke: string[]) {
    const types = combination.find(item => item.name == typeAtt);
    return typePoke.reduce(function (acc: number, item: string): number {
        types.immunes.find(element => element == item) ? acc = 0 : types.weaknesses.find(element => element == item) ? acc = acc * 0.5 : types.strengths.find(element => element == item) ? acc = acc * 2 : null;
        return acc;
    }, 1)
}