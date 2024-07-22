"use client";

import BackendService from "@/backend/backendFunc";
import { PokeInfo } from "@/backend/backendTypes";
import Card from "@/components/card";
import Pokeball from "@/components/pokeball";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function PokeGuess() {
  const howManyPokemon = 1025;
  const [pokemon, changePokemon] = useState<PokeInfo | undefined>(undefined);

  useEffect(() => {
    const pokeNumber = Math.ceil(Math.random() * 1025) ?? 1;
    BackendService.getPokemonInfo(pokeNumber).then((pokemon) => {
      if (pokemon?.id) {
        changePokemon(pokemon);
      }
    });
  }, []);

  return (
    <div className="grid grid-cols-12 pt-20">
      <Card>
        <div className="font-semibold text-3xl">
          Welcome to <span className="pokeTitle text-5xl">PokeGuess</span>
        </div>
        <div className="flex">
          <input placeholder="Insert your answer"></input>
          <button>Enter</button>
        </div>
        <div>
          {pokemon?.name ? (
            <div>
              <Image
                src={pokemon?.pokeImg ?? ""}
                alt={`${pokemon?.name} image`}
                width={250}
                height={250}
              />
            </div>
          ) : (
            <div className="flex justify-center align-middle">
              <Pokeball title="" desc="" spin={true} />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
