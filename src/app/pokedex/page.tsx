"use client";

import BackendService from "@/backend/backendFunc";
import Card from "@/components/card";
import Pokeball from "@/components/pokeball";
import { faHome } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Pokedex() {
  const howManyPokemon = 1025;

  const [typeOne, changeTypeOne] = useState("");
  const [typeTwo, changeTypeTwo] = useState("");
  const [pokemonName, changePokemonName] = useState("");
  const [gen, changeGen] = useState(0);

  const [loading, changeLoading] = useState(true);

  const [allPokemon, changeAllPokemon] = useState<
    {
      id: string;
      name: string;
      types: string[];
    }[]
  >([]);

  const [filteredPokemon, changeFilteredPokemon] = useState<
    {
      id: string;
      name: string;
      types: string[];
    }[]
  >([]);

  useEffect(() => {
    const fetchAllPokemonAndTypes = async () => {
      const typePromises = [
        1, 12, 11, 10, 13, 7, 2, 3, 4, 5, 6, 8, 9, 14, 15, 16, 17, 18,
      ].map((typeNumber) => BackendService.getTypesInfo(typeNumber));

      const typeResponses = await Promise.all(typePromises);

      const pokemon: {
        id: string;
        name: string;
        types: string[];
      }[] = [];
      typeResponses.forEach((type) => {
        type?.pokemon?.forEach((pokemonWithType) => {
          const id = +pokemonWithType.pokemon.url.split("/")[6];
          if (id <= howManyPokemon) {
            if (
              pokemon.map((p) => p.name).includes(pokemonWithType.pokemon.name)
            ) {
              const index = pokemon.findIndex(
                (x) => x.name === pokemonWithType.pokemon.name
              );
              pokemon[index].types.push(type.name);
            } else {
              pokemon.push({
                id: id.toString(),
                name: pokemonWithType.pokemon.name,
                types: [type.name],
              });
            }
          }
        });
      });

      pokemon.map((p) => {
        if (p.name === "minior-red-meteor") {
          p.name = "minior";
        } else if (p.name === "mimikyu-disguised") {
          p.name = "mimikyu";
        }

        return p;
      });
      pokemon.sort((a, b) => +a.id - +b.id);
      changeAllPokemon(pokemon);
      changeFilteredPokemon(pokemon);
      changeLoading(false);
    };

    fetchAllPokemonAndTypes();
  }, []);

  async function filterPokemons() {
    changeLoading(true);
    let newFilteredPokemon = [...allPokemon];

    if (pokemonName) {
      newFilteredPokemon = newFilteredPokemon.filter((pokemon) =>
        pokemon.name.includes(pokemonName)
      );
    }

    if (typeOne) {
      newFilteredPokemon = newFilteredPokemon.filter((pokemon) =>
        pokemon.types.includes(typeOne)
      );
    }

    if (typeTwo) {
      newFilteredPokemon = newFilteredPokemon.filter((pokemon) =>
        pokemon.types.includes(typeTwo)
      );
    }

    if (gen > 0) {
      await BackendService.getGenerationsInfo(gen).then((gen) => {
        const genArr = gen.pokemon_species.map((p) => {
          if (p.name === "minior-red-meteor") {
            return "minior";
          }
          if (p.name === "mimikyu-disguised") {
            return "mimikyu";
          }
          return p.name;
        });

        newFilteredPokemon = newFilteredPokemon.filter((pokemon) =>
          genArr.includes(pokemon.name)
        );
      });
    }

    changeFilteredPokemon(newFilteredPokemon);
    changeLoading(false);
  }

  return (
    <div className="grid grid-cols-12 pt-20">
      <Card>
        <div className="flex justify-between items-center">
          <span className="font-semibold pokeTitle text-5xl">PokeDex</span>

          <Link href="/">
            <FontAwesomeIcon icon={faHome}></FontAwesomeIcon>
          </Link>
        </div>
        {!loading ? (
          <div>
            <div className="my-10 grid grid-cols-12">
              <div className="col-span-3">
                <div className="font-semibold text-lg">Filter by name</div>
                <input
                  className="w-[210px] outline-none"
                  id="pokemonNameSrc"
                  type="text"
                  placeholder="Search the pokemon name"
                  onChange={(e) => {
                    changePokemonName(
                      e.target.value.replaceAll(" ", "-").toLowerCase()
                    );
                  }}
                />
              </div>
              <div className="col-span-3">
                <div className="font-semibold text-lg">Filter by types</div>
                <div className="flex">
                  <select
                    name="typeOne"
                    id="typeOne"
                    className="outline-none block w-48 my-1"
                    defaultValue={typeOne}
                    onChange={(e) => {
                      if (e.target.value === "" && typeTwo) {
                        (document.getElementById("typeTwo") as any).value = "";
                        changeTypeTwo("");
                      }
                      changeTypeOne(e.target.value);
                    }}
                  >
                    <option value={""}>Any Type</option>
                    <option disabled={typeTwo === "normal"} value={"normal"}>
                      Normal
                    </option>
                    <option disabled={typeTwo === "fire"} value={"fire"}>
                      Fire
                    </option>
                    <option disabled={typeTwo === "water"} value={"water"}>
                      Water
                    </option>
                    <option disabled={typeTwo === "grass"} value={"grass"}>
                      Grass
                    </option>
                    <option disabled={typeTwo === "flying"} value={"flying"}>
                      Flying
                    </option>
                    <option
                      disabled={typeTwo === "fighting"}
                      value={"fighting"}
                    >
                      Fighting
                    </option>
                    <option disabled={typeTwo === "poison"} value={"poison"}>
                      Poison
                    </option>
                    <option
                      disabled={typeTwo === "electric"}
                      value={"electric"}
                    >
                      Electric
                    </option>
                    <option disabled={typeTwo === "ground"} value={"ground"}>
                      Ground
                    </option>
                    <option disabled={typeTwo === "rock"} value={"rock"}>
                      Rock
                    </option>
                    <option disabled={typeTwo === "psychic"} value={"psychic"}>
                      Psychic
                    </option>
                    <option disabled={typeTwo === "ice"} value={"ice"}>
                      Ice
                    </option>
                    <option disabled={typeTwo === "bug"} value={"bug"}>
                      Bug
                    </option>
                    <option disabled={typeTwo === "ghost"} value={"ghost"}>
                      Ghost
                    </option>
                    <option disabled={typeTwo === "steel"} value={"steel"}>
                      Steel
                    </option>
                    <option disabled={typeTwo === "dragon"} value={"dragon"}>
                      Dragon
                    </option>
                    <option disabled={typeTwo === "dark"} value={"dark"}>
                      Dark
                    </option>
                    <option disabled={typeTwo === "fairy"} value={"fairy"}>
                      Fairy
                    </option>
                  </select>
                  {typeOne && (
                    <div
                      className="w-[75px] h-[28.5px] relative mx-2"
                      key={typeOne}
                    >
                      <Image
                        src={`/types/${typeOne}_word.webp`}
                        alt={`${typeOne} image`}
                        fill
                        sizes="width:75px"
                      />
                    </div>
                  )}
                </div>
                <div className="flex">
                  <select
                    name="typeTwo"
                    id="typeTwo"
                    className="outline-none block w-48 my-1"
                    defaultValue={typeTwo}
                    disabled={!typeOne}
                    onChange={(e) => changeTypeTwo(e.target.value)}
                  >
                    <option value={""}>Any Type</option>
                    <option disabled={typeOne === "normal"} value={"normal"}>
                      Normal
                    </option>
                    <option disabled={typeOne === "fire"} value={"fire"}>
                      Fire
                    </option>
                    <option disabled={typeOne === "water"} value={"water"}>
                      Water
                    </option>
                    <option disabled={typeOne === "grass"} value={"grass"}>
                      Grass
                    </option>
                    <option disabled={typeOne === "flying"} value={"flying"}>
                      Flying
                    </option>
                    <option
                      disabled={typeOne === "fighting"}
                      value={"fighting"}
                    >
                      Fighting
                    </option>
                    <option disabled={typeOne === "poison"} value={"poison"}>
                      Poison
                    </option>
                    <option
                      disabled={typeOne === "electric"}
                      value={"electric"}
                    >
                      Electric
                    </option>
                    <option disabled={typeOne === "ground"} value={"ground"}>
                      Ground
                    </option>
                    <option disabled={typeOne === "rock"} value={"rock"}>
                      Rock
                    </option>
                    <option disabled={typeOne === "psychic"} value={"psychic"}>
                      Psychic
                    </option>
                    <option disabled={typeOne === "ice"} value={"ice"}>
                      Ice
                    </option>
                    <option disabled={typeOne === "bug"} value={"bug"}>
                      Bug
                    </option>
                    <option disabled={typeOne === "ghost"} value={"ghost"}>
                      Ghost
                    </option>
                    <option disabled={typeOne === "steel"} value={"steel"}>
                      Steel
                    </option>
                    <option disabled={typeOne === "dragon"} value={"dragon"}>
                      Dragon
                    </option>
                    <option disabled={typeOne === "dark"} value={"dark"}>
                      Dark
                    </option>
                    <option disabled={typeOne === "fairy"} value={"fairy"}>
                      Fairy
                    </option>
                  </select>
                  {typeTwo && (
                    <div
                      className="w-[75px] h-[28.5px] relative mx-2"
                      key={typeTwo}
                    >
                      <Image
                        src={`/types/${typeTwo}_word.webp`}
                        alt={`${typeTwo} image`}
                        fill
                        sizes="width:75px"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div className="col-span-2">
                <div className="font-semibold text-lg">
                  Filter by generation
                </div>
                <select
                  name="generation"
                  id="generationPicker"
                  className="outline-none block"
                  defaultValue={gen}
                  onChange={(e) => changeGen(+e.target.value)}
                >
                  <option value={0}>Any Generation</option>
                  <option value={1}>Generation I</option>
                  <option value={2}>Generation II</option>
                  <option value={3}>Generation III</option>
                  <option value={4}>Generation IV</option>
                  <option value={5}>Generation V</option>
                  <option value={6}>Generation VI</option>
                  <option value={7}>Generation VII</option>
                  <option value={8}>Generation VIII</option>
                  <option value={9}>Generation IX</option>
                </select>
              </div>

              <div className="col-span-2 col-start-11 flex justify-center items-center">
                <button
                  className="rounded bg-gray-200 px-3 py-1 me-2"
                  onClick={() => {
                    filterPokemons();
                  }}
                >
                  Filter
                </button>
                <button
                  className="rounded bg-gray-200 px-3 py-1"
                  onClick={() => {
                    if (typeOne) {
                      (document.getElementById("typeOne") as any).value = "";
                      changeTypeOne("");
                    }

                    if (typeTwo) {
                      (document.getElementById("typeTwo") as any).value = "";
                      changeTypeTwo("");
                    }

                    if (gen) {
                      (
                        document.getElementById("generationPicker") as any
                      ).value = 0;
                      changeGen(0);
                    }

                    if (pokemonName) {
                      (document.getElementById("pokemonNameSrc") as any).value =
                        "";
                      changePokemonName("");
                    }
                    changeFilteredPokemon(allPokemon);
                  }}
                >
                  Reset
                </button>
              </div>
            </div>
            <div className="grid grid-cols-5">
              {filteredPokemon.map((pokemon) => (
                <div className="col-span-1 my-10 text-center" key={pokemon.id}>
                  <Image
                    src={`https://img.pokemondb.net/sprites/home/normal/${pokemon.name}.png`}
                    alt={`${pokemon.name} Image`}
                    className="m-auto"
                    width={150}
                    height={150}
                  />
                  <div>
                    <div className="capitalize font-bold text-2xl">
                      {pokemon.name.replaceAll("-", " ")}
                    </div>
                    <div className="flex justify-center">
                      {pokemon.types.map((type) => (
                        <div
                          className="relative w-[75px] h-[28.5px] mx-1"
                          key={`${pokemon.id}_${type}`}
                        >
                          <Image
                            src={`/types/${type}_word.webp`}
                            alt={`${type} image`}
                            fill
                            sizes="width: 75px; height: 28.5px"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="flex justify-center align-middle my-10">
              <Pokeball title="" desc="" spin={true} />
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
