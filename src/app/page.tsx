import Card from "@/components/card";
import Pokeball from "@/components/pokeball";

export default function Home() {
  return (
    <main className="grid grid-cols-12 py-20">
      <Card>
        <div className="font-semibold text-3xl">
          Welcome to <span className="pokeTitle text-5xl">PokeGame</span>
        </div>

        <div className="flex mt-10 justify-around flex-wrap">
          <Pokeball
            title="PokeGuess"
            desc="Guess Pokemon by Infos"
            redirect="pokeguess"
          />

          <Pokeball
            title="Human Pokedex"
            desc="How many Pokemon infos you know"
            redirect="humanpokedex"
          />

          <Pokeball
            title="Who's that pokemon?"
            desc="Guess the pokemon by it's shape"
            redirect="whosthatpokemon"
          />

          <Pokeball
            title="PokeName"
            desc="How many pokemon can you name in a few minutes"
            redirect="pokename"
          />

          <Pokeball
            title="PokeDex"
            desc="Search pokemon to learn more"
            redirect="pokedex"
          />
        </div>
      </Card>
    </main>
  );
}
