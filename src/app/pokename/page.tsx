"use client";

import BackendService from "@/backend/backendFunc";
import { NameAndAPI, PokeInfo } from "@/backend/backendTypes";
import Card from "@/components/card";
import Pokeball from "@/components/pokeball";
import { similarityPercentage } from "@/utilitiesFunc/utilitiesFuncs";
import { faHome } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function PokeName() {
  const howManyPokemon = 1025;
  const howManyTypes = 18;
  const howManyGen = 9;

  const [loading, changeLoading] = useState(false);

  const [timerStarted, changeTimerStarted] = useState(false);
  const [timerEnded, changeTimerEnded] = useState(false);

  const allTypes = [
    { id: 1, name: "Normal" },
    { id: 2, name: "Fighting" },
    { id: 3, name: "Flying" },
    { id: 4, name: "Poison" },
    { id: 5, name: "Ground" },
    { id: 6, name: "Rock" },
    { id: 7, name: "Bug" },
    { id: 8, name: "Ghost" },
    { id: 9, name: "Steel" },
    { id: 10, name: "Fire" },
    { id: 11, name: "Water" },
    { id: 12, name: "Grass" },
    { id: 13, name: "Electric" },
    { id: 14, name: "Psychic" },
    { id: 15, name: "Ice" },
    { id: 16, name: "Dragon" },
    { id: 17, name: "Dark" },
    { id: 18, name: "Fairy" },
  ];
  const [types, changeTypes] =
    useState<{ name: string; id: number }[]>(allTypes);

  const allGens = [
    { id: 1, name: "Generation I" },
    { id: 2, name: "Generation II" },
    { id: 3, name: "Generation III" },
    { id: 4, name: "Generation IV" },
    { id: 5, name: "Generation V" },
    { id: 6, name: "Generation VI" },
    { id: 7, name: "Generation VII" },
    { id: 8, name: "Generation VIII" },
    { id: 9, name: "Generation IX" },
  ];
  const [gens, changeGens] = useState<{ name: string; id: number }[]>(allGens);

  const [guessedPokemon, changeGuessedPokemon] = useState<string[]>([]);

  const [allGuessablePokemon, changeAllGuessablePokemon] = useState<
    { name: string; id: string }[]
  >([]);

  const [seconds, changeSeconds] = useState(120);
  const [lastseconds, changeLastSeconds] = useState(120);

  function randomEl(
    nTypes: number,
    arr: { name: string; id: number }[],
    newArrFunc: Dispatch<SetStateAction<{ name: string; id: number }[]>>
  ) {
    const newArr: { name: string; id: number }[] = [];
    const howMany = Math.ceil(Math.random() * (nTypes - 1)) + 1;
    for (let i = 0; i < howMany; i += 1) {
      const newNumber = Math.ceil(Math.random() * (nTypes - 1)) + 1;
      if (!newArr.map((item) => item.id).includes(newNumber)) {
        newArr.push(arr.find((a) => a.id === newNumber) ?? arr[0]);
      }
    }

    newArrFunc(newArr);
  }

  async function startTimer() {
    changeLoading(true);
    changeLastSeconds(seconds);
    const allTypesPokemons: { name: string; id: string }[] = [];
    const allGensPokemons: { name: string; id: string }[] = [];

    // When you have all the pokemon for each type and all the pokemon for gen make an inner join (Attention to the async)
    if (types.length === howManyTypes && gens.length === howManyGen) {
      await BackendService.getSomePokemon(howManyPokemon, 0).then(
        (pokemons) => {
          changeAllGuessablePokemon(
            pokemons.results.map((pokemon) => {
              if (pokemon.name === "minior-red-meteor") {
                pokemon.name = "minior";
              } else if (pokemon.name === "mimikyu-disguised") {
                pokemon.name = "mimikyu";
              }

              return { name: pokemon.name, id: pokemon.url.split("/")[6] };
            })
          );
          changeLoading(false);
          changeTimerStarted(true);
        }
      );
    } else {
      const fetchData = async () => {
        try {
          if (types.length < howManyTypes && types.length > 0) {
            const typePromises = types.map((type) =>
              BackendService.getTypesInfo(type.id)
            );
            const typeResponses = await Promise.all(typePromises);

            typeResponses.forEach((response) => {
              response.pokemon.forEach((pokemon) => {
                if (pokemon.pokemon.name === "minior-red-meteor") {
                  pokemon.pokemon.name = "minior";
                } else if (pokemon.pokemon.name === "mimikyu-disguised") {
                  pokemon.pokemon.name = "mimikyu";
                }

                allTypesPokemons.push({
                  name: pokemon.pokemon.name,
                  id: pokemon.pokemon.url.split("/")[6],
                });
              });
            });
          }

          if (gens.length < howManyGen && gens.length > 0) {
            const genPromises = gens.map((gen) =>
              BackendService.getGenerationsInfo(gen.id)
            );
            const genResponses = await Promise.all(genPromises);

            genResponses.forEach((response) => {
              response.pokemon_species.forEach((pokemon) => {
                if (pokemon.name === "minior-red-meteor") {
                  pokemon.name = "minior";
                } else if (pokemon.name === "mimikyu-disguised") {
                  pokemon.name = "mimikyu";
                }

                allGensPokemons.push({
                  name: pokemon.name,
                  id: pokemon.url.split("/")[6],
                });
              });
            });
          }
        } catch (error) {
          console.error("Error fetching data", error);
        }
      };

      fetchData().then(() => {
        if (allGensPokemons.length === 0 || allTypesPokemons.length === 0) {
          const newAllGuess: { name: string; id: string }[] =
            allGensPokemons.length > 0 ? allGensPokemons : allTypesPokemons;

          newAllGuess.sort((a, b) => +a.id - +b.id);

          changeAllGuessablePokemon(newAllGuess);
          changeLoading(false);
          changeTimerStarted(true);
        } else {
          const newAllGuess: { name: string; id: string }[] = [];
          allGensPokemons.forEach((genPokemon) => {
            if (
              allTypesPokemons
                .map((pokemon) => pokemon.id)
                .includes(genPokemon.id)
            ) {
              newAllGuess.push(genPokemon);
            }
          });

          newAllGuess.sort((a, b) => +a.id - +b.id);

          changeAllGuessablePokemon(newAllGuess);
          changeLoading(false);
          changeTimerStarted(true);
        }
      });
    }
  }

  useEffect(() => {
    if (timerStarted && seconds > 0) {
      const interval = setInterval(() => {
        changeSeconds(seconds - 1);
      }, 1000);

      return () => clearInterval(interval);
    } else if (seconds === 0) {
      changeTimerEnded(true);
    }
  }, [timerStarted, seconds]);

  return (
    <div className="grid grid-cols-12 py-20">
      <Card>
        <div className="flex justify-between items-center">
          <div className="font-semibold text-3xl">
            Welcome to <span className="pokeTitle text-5xl">PokeName</span>
          </div>

          <Link href="/">
            <FontAwesomeIcon icon={faHome}></FontAwesomeIcon>
          </Link>
        </div>
        <div className="my-4">
          How many pokemon can you name in a few minutes. <br />
          You can also increase the difficulness level by choosing only some the
          type(s) and generation(s).
          <br />
          <br />
          Enjoy!
        </div>

        {!timerStarted && (
          <div className="grid grid-cols-12">
            <div className="xl:grid-cols-5 lg:grid-cols-6 sm:col-span-5 col-span-6 grid self-baseline">
              <div className="xl:col-span-2 lg:col-span-3 col-full">
                Types
                <div className="mb-4">
                  <button
                    className="rounded bg-gray-200 px-3 py-1 mt-2 me-2 text-sm"
                    onClick={() => changeTypes(allTypes)}
                  >
                    All
                  </button>
                  <button
                    className="rounded bg-gray-200 px-3 py-1 mt-2 me-2 text-sm"
                    onClick={() =>
                      randomEl(howManyTypes, allTypes, changeTypes)
                    }
                  >
                    Random
                  </button>
                  <button
                    className="rounded bg-gray-200 px-3 py-1 mt-2 text-sm"
                    onClick={() => changeTypes([])}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="lg:col-span-3 col-full px-2">
                <div>
                  <div>
                    <input
                      type="checkbox"
                      checked={types.map((t) => t.id).includes(1)}
                      name="types"
                      id="normal"
                      className="me-1"
                      onChange={(e) => {
                        let newTypeArr = [...types];
                        if (e.target.checked) {
                          newTypeArr.push(
                            allTypes?.find((t) => t.id === 1) ?? allTypes[0]
                          );
                        } else {
                          newTypeArr = newTypeArr.filter((t) => t.id !== 1);
                        }
                        changeTypes(newTypeArr);
                      }}
                    />
                    <label htmlFor="normal">Normal</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={types.map((t) => t.id).includes(10)}
                      name="types"
                      id="fire"
                      className="me-1"
                      onChange={(e) => {
                        let newTypeArr = [...types];
                        if (e.target.checked) {
                          newTypeArr.push(
                            allTypes?.find((t) => t.id === 10) ?? allTypes[0]
                          );
                        } else {
                          newTypeArr = newTypeArr.filter((t) => t.id !== 10);
                        }
                        changeTypes(newTypeArr);
                      }}
                    />
                    <label htmlFor="fire">Fire</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={types.map((t) => t.id).includes(11)}
                      name="types"
                      id="water"
                      className="me-1"
                      onChange={(e) => {
                        let newTypeArr = [...types];
                        if (e.target.checked) {
                          newTypeArr.push(
                            allTypes?.find((t) => t.id === 11) ?? allTypes[0]
                          );
                        } else {
                          newTypeArr = newTypeArr.filter((t) => t.id !== 11);
                        }
                        changeTypes(newTypeArr);
                      }}
                    />
                    <label htmlFor="water">Water</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={types.map((t) => t.id).includes(12)}
                      name="types"
                      id="grass"
                      className="me-1"
                      onChange={(e) => {
                        let newTypeArr = [...types];
                        if (e.target.checked) {
                          newTypeArr.push(
                            allTypes?.find((t) => t.id === 12) ?? allTypes[0]
                          );
                        } else {
                          newTypeArr = newTypeArr.filter((t) => t.id !== 12);
                        }
                        changeTypes(newTypeArr);
                      }}
                    />
                    <label htmlFor="grass">Grass</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={types.map((t) => t.id).includes(3)}
                      name="types"
                      id="flying"
                      className="me-1"
                      onChange={(e) => {
                        let newTypeArr = [...types];
                        if (e.target.checked) {
                          newTypeArr.push(
                            allTypes?.find((t) => t.id === 3) ?? allTypes[0]
                          );
                        } else {
                          newTypeArr = newTypeArr.filter((t) => t.id !== 3);
                        }
                        changeTypes(newTypeArr);
                      }}
                    />
                    <label htmlFor="flying">Flying</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={types.map((t) => t.id).includes(2)}
                      name="types"
                      id="fighting"
                      className="me-1"
                      onChange={(e) => {
                        let newTypeArr = [...types];
                        if (e.target.checked) {
                          newTypeArr.push(
                            allTypes?.find((t) => t.id === 2) ?? allTypes[0]
                          );
                        } else {
                          newTypeArr = newTypeArr.filter((t) => t.id !== 2);
                        }
                        changeTypes(newTypeArr);
                      }}
                    />
                    <label htmlFor="fighting">Fighting</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={types.map((t) => t.id).includes(4)}
                      name="types"
                      id="poison"
                      className="me-1"
                      onChange={(e) => {
                        let newTypeArr = [...types];
                        if (e.target.checked) {
                          newTypeArr.push(
                            allTypes?.find((t) => t.id === 4) ?? allTypes[0]
                          );
                        } else {
                          newTypeArr = newTypeArr.filter((t) => t.id !== 4);
                        }
                        changeTypes(newTypeArr);
                      }}
                    />
                    <label htmlFor="poison">Poison</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={types.map((t) => t.id).includes(13)}
                      name="types"
                      id="electric"
                      className="me-1"
                      onChange={(e) => {
                        let newTypeArr = [...types];
                        if (e.target.checked) {
                          newTypeArr.push(
                            allTypes?.find((t) => t.id === 13) ?? allTypes[0]
                          );
                        } else {
                          newTypeArr = newTypeArr.filter((t) => t.id !== 13);
                        }
                        changeTypes(newTypeArr);
                      }}
                    />
                    <label htmlFor="electric">Electric</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={types.map((t) => t.id).includes(5)}
                      name="types"
                      id="ground"
                      className="me-1"
                      onChange={(e) => {
                        let newTypeArr = [...types];
                        if (e.target.checked) {
                          newTypeArr.push(
                            allTypes?.find((t) => t.id === 5) ?? allTypes[0]
                          );
                        } else {
                          newTypeArr = newTypeArr.filter((t) => t.id !== 5);
                        }
                        changeTypes(newTypeArr);
                      }}
                    />
                    <label htmlFor="ground">Ground</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={types.map((t) => t.id).includes(6)}
                      name="types"
                      id="rock"
                      className="me-1"
                      onChange={(e) => {
                        let newTypeArr = [...types];
                        if (e.target.checked) {
                          newTypeArr.push(
                            allTypes?.find((t) => t.id === 6) ?? allTypes[0]
                          );
                        } else {
                          newTypeArr = newTypeArr.filter((t) => t.id !== 6);
                        }
                        changeTypes(newTypeArr);
                      }}
                    />
                    <label htmlFor="rock">Rock</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={types.map((t) => t.id).includes(14)}
                      name="types"
                      id="psychic"
                      className="me-1"
                      onChange={(e) => {
                        let newTypeArr = [...types];
                        if (e.target.checked) {
                          newTypeArr.push(
                            allTypes?.find((t) => t.id === 14) ?? allTypes[0]
                          );
                        } else {
                          newTypeArr = newTypeArr.filter((t) => t.id !== 14);
                        }
                        changeTypes(newTypeArr);
                      }}
                    />
                    <label htmlFor="psychic">Psychic</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={types.map((t) => t.id).includes(15)}
                      name="types"
                      id="ice"
                      className="me-1"
                      onChange={(e) => {
                        let newTypeArr = [...types];
                        if (e.target.checked) {
                          newTypeArr.push(
                            allTypes?.find((t) => t.id === 15) ?? allTypes[0]
                          );
                        } else {
                          newTypeArr = newTypeArr.filter((t) => t.id !== 15);
                        }
                        changeTypes(newTypeArr);
                      }}
                    />
                    <label htmlFor="ice">Ice</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={types.map((t) => t.id).includes(7)}
                      name="types"
                      id="bug"
                      className="me-1"
                      onChange={(e) => {
                        let newTypeArr = [...types];
                        if (e.target.checked) {
                          newTypeArr.push(
                            allTypes?.find((t) => t.id === 7) ?? allTypes[0]
                          );
                        } else {
                          newTypeArr = newTypeArr.filter((t) => t.id !== 7);
                        }
                        changeTypes(newTypeArr);
                      }}
                    />
                    <label htmlFor="bug">Bug</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={types.map((t) => t.id).includes(8)}
                      name="types"
                      id="ghost"
                      className="me-1"
                      onChange={(e) => {
                        let newTypeArr = [...types];
                        if (e.target.checked) {
                          newTypeArr.push(
                            allTypes?.find((t) => t.id === 8) ?? allTypes[0]
                          );
                        } else {
                          newTypeArr = newTypeArr.filter((t) => t.id !== 8);
                        }
                        changeTypes(newTypeArr);
                      }}
                    />
                    <label htmlFor="ghost">Ghost</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={types.map((t) => t.id).includes(9)}
                      name="types"
                      id="steel"
                      className="me-1"
                      onChange={(e) => {
                        let newTypeArr = [...types];
                        if (e.target.checked) {
                          newTypeArr.push(
                            allTypes?.find((t) => t.id === 9) ?? allTypes[0]
                          );
                        } else {
                          newTypeArr = newTypeArr.filter((t) => t.id !== 9);
                        }
                        changeTypes(newTypeArr);
                      }}
                    />
                    <label htmlFor="steel">Steel</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={types.map((t) => t.id).includes(16)}
                      name="types"
                      id="dragon"
                      className="me-1"
                      onChange={(e) => {
                        let newTypeArr = [...types];
                        if (e.target.checked) {
                          newTypeArr.push(
                            allTypes?.find((t) => t.id === 16) ?? allTypes[0]
                          );
                        } else {
                          newTypeArr = newTypeArr.filter((t) => t.id !== 16);
                        }
                        changeTypes(newTypeArr);
                      }}
                    />
                    <label htmlFor="dragon">Dragon</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={types.map((t) => t.id).includes(17)}
                      name="types"
                      id="dark"
                      className="me-1"
                      onChange={(e) => {
                        let newTypeArr = [...types];
                        if (e.target.checked) {
                          newTypeArr.push(
                            allTypes?.find((t) => t.id === 17) ?? allTypes[0]
                          );
                        } else {
                          newTypeArr = newTypeArr.filter((t) => t.id !== 17);
                        }
                        changeTypes(newTypeArr);
                      }}
                    />
                    <label htmlFor="dark">Dark</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={types.map((t) => t.id).includes(18)}
                      name="types"
                      id="fairy"
                      className="me-1"
                      onChange={(e) => {
                        let newTypeArr = [...types];
                        if (e.target.checked) {
                          newTypeArr.push(
                            allTypes?.find((t) => t.id === 18) ?? allTypes[0]
                          );
                        } else {
                          newTypeArr = newTypeArr.filter((t) => t.id !== 18);
                        }
                        changeTypes(newTypeArr);
                      }}
                    />
                    <label htmlFor="fairy">Fairy</label>
                  </div>
                </div>
              </div>
            </div>
            <div className="xl:grid-cols-5 lg:grid-cols-6 xl:col-span-4 sm:col-span-5 col-span-6 grid self-baseline">
              <div className="xl:col-span-2 lg:col-span-3 col-full">
                Generations
                <div className="mb-4">
                  <button
                    className="rounded bg-gray-200 px-3 py-1 mt-2 me-2 text-sm"
                    onClick={() => changeGens(allGens)}
                  >
                    All
                  </button>
                  <button
                    className="rounded bg-gray-200 px-3 py-1 mt-2 me-2 text-sm"
                    onClick={() => randomEl(howManyGen, allGens, changeGens)}
                  >
                    Random
                  </button>
                  <button
                    className="rounded bg-gray-200 px-3 py-1 mt-2 text-sm"
                    onClick={() => changeGens([])}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="lg:col-span-3 col-full px-2">
                <div className="mb-4">
                  <div>
                    <input
                      type="checkbox"
                      checked={gens.map((g) => g.id).includes(1)}
                      name="types"
                      id="generation-i"
                      className="me-1"
                      onChange={(e) => {
                        let newGensArr = [...gens];
                        if (e.target.checked) {
                          newGensArr.push(
                            allGens.find((gen) => gen.id === 1) ?? allGens[0]
                          );
                        } else {
                          newGensArr = newGensArr.filter((t) => t.id !== 1);
                        }
                        changeGens(newGensArr);
                      }}
                    />
                    <label htmlFor="generation-i">Generation I</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={gens.map((g) => g.id).includes(2)}
                      name="types"
                      id="generation-ii"
                      className="me-1"
                      onChange={(e) => {
                        let newGensArr = [...gens];
                        if (e.target.checked) {
                          newGensArr.push(
                            allGens.find((gen) => gen.id === 2) ?? allGens[0]
                          );
                        } else {
                          newGensArr = newGensArr.filter((t) => t.id !== 2);
                        }
                        changeGens(newGensArr);
                      }}
                    />
                    <label htmlFor="generation-ii">Generation II</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={gens.map((g) => g.id).includes(3)}
                      name="types"
                      id="generation-iii"
                      className="me-1"
                      onChange={(e) => {
                        let newGensArr = [...gens];
                        if (e.target.checked) {
                          newGensArr.push(
                            allGens.find((gen) => gen.id === 3) ?? allGens[0]
                          );
                        } else {
                          newGensArr = newGensArr.filter((t) => t.id !== 3);
                        }
                        changeGens(newGensArr);
                      }}
                    />
                    <label htmlFor="generation-iii">Generation III</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={gens.map((g) => g.id).includes(4)}
                      name="types"
                      id="generation-iv"
                      className="me-1"
                      onChange={(e) => {
                        let newGensArr = [...gens];
                        if (e.target.checked) {
                          newGensArr.push(
                            allGens.find((gen) => gen.id === 4) ?? allGens[0]
                          );
                        } else {
                          newGensArr = newGensArr.filter((t) => t.id !== 4);
                        }
                        changeGens(newGensArr);
                      }}
                    />
                    <label htmlFor="generation-iv">Generation IV</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={gens.map((g) => g.id).includes(5)}
                      name="types"
                      id="generation-v"
                      className="me-1"
                      onChange={(e) => {
                        let newGensArr = [...gens];
                        if (e.target.checked) {
                          newGensArr.push(
                            allGens.find((gen) => gen.id === 5) ?? allGens[0]
                          );
                        } else {
                          newGensArr = newGensArr.filter((t) => t.id !== 5);
                        }
                        changeGens(newGensArr);
                      }}
                    />
                    <label htmlFor="generation-v">Generation V</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={gens.map((g) => g.id).includes(6)}
                      name="types"
                      id="generation-vi"
                      className="me-1"
                      onChange={(e) => {
                        let newGensArr = [...gens];
                        if (e.target.checked) {
                          newGensArr.push(
                            allGens.find((gen) => gen.id === 6) ?? allGens[0]
                          );
                        } else {
                          newGensArr = newGensArr.filter((t) => t.id !== 6);
                        }
                        changeGens(newGensArr);
                      }}
                    />
                    <label htmlFor="generation-vi">Generation VI</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={gens.map((g) => g.id).includes(7)}
                      name="types"
                      id="generation-vii"
                      className="me-1"
                      onChange={(e) => {
                        let newGensArr = [...gens];
                        if (e.target.checked) {
                          newGensArr.push(
                            allGens.find((gen) => gen.id === 7) ?? allGens[0]
                          );
                        } else {
                          newGensArr = newGensArr.filter((t) => t.id !== 7);
                        }
                        changeGens(newGensArr);
                      }}
                    />
                    <label htmlFor="generation-vii">Generation VII</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={gens.map((g) => g.id).includes(8)}
                      name="types"
                      id="generation-viii"
                      className="me-1"
                      onChange={(e) => {
                        let newGensArr = [...gens];
                        if (e.target.checked) {
                          newGensArr.push(
                            allGens.find((gen) => gen.id === 8) ?? allGens[0]
                          );
                        } else {
                          newGensArr = newGensArr.filter((t) => t.id !== 8);
                        }
                        changeGens(newGensArr);
                      }}
                    />
                    <label htmlFor="generation-viii">Generation VIII</label>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={gens.map((g) => g.id).includes(9)}
                      name="types"
                      id="generation-ix"
                      className="me-1"
                      onChange={(e) => {
                        let newGensArr = [...gens];
                        if (e.target.checked) {
                          newGensArr.push(
                            allGens.find((gen) => gen.id === 9) ?? allGens[0]
                          );
                        } else {
                          newGensArr = newGensArr.filter((t) => t.id !== 9);
                        }
                        changeGens(newGensArr);
                      }}
                    />
                    <label htmlFor="generation-ix">Generation IX</label>
                  </div>
                </div>

                <div className="sm:hidden">
                  <div className="mb-4">
                    <div>Seconds</div>
                    <input
                      className="max-w-[60px] border p-1 rounded"
                      type="number"
                      onChange={(e) =>
                        changeSeconds(Math.ceil(+e.target.value))
                      }
                      value={seconds}
                    />
                  </div>
                  <button
                    className="rounded bg-gray-200 px-3 py-1"
                    onClick={() => {
                      if (
                        gens.length > 0 &&
                        types.length > 0 &&
                        !isNaN(seconds) &&
                        seconds > 0
                      ) {
                        startTimer();
                      }
                    }}
                  >
                    START!
                  </button>
                </div>
              </div>
            </div>
            <div className="col-span-1 xl:col-start-11 col-start-10 xl:block hidden">
              <div>Seconds</div>
              <input
                className="max-w-[60px] border p-1 rounded"
                type="number"
                onChange={(e) => changeSeconds(Math.ceil(+e.target.value))}
                value={seconds}
              />
            </div>
            <div className="xl:col-span-1 col-span-2 text-center xl:block hidden">
              <button
                className="rounded bg-gray-200 px-3 py-1"
                onClick={() => {
                  if (
                    gens.length > 0 &&
                    types.length > 0 &&
                    !isNaN(seconds) &&
                    seconds > 0
                  ) {
                    startTimer();
                  }
                }}
              >
                START!
              </button>
            </div>
            <div className="col-span-2 text-center xl:hidden sm:block hidden">
              <div className="mb-4">
                <div>Seconds</div>
                <input
                  className="max-w-[60px] border p-1 rounded"
                  type="number"
                  onChange={(e) => changeSeconds(Math.ceil(+e.target.value))}
                  value={seconds}
                />
              </div>
              <button
                className="rounded bg-gray-200 px-3 py-1"
                onClick={() => {
                  if (
                    gens.length > 0 &&
                    types.length > 0 &&
                    !isNaN(seconds) &&
                    seconds > 0
                  ) {
                    startTimer();
                  }
                }}
              >
                START!
              </button>
            </div>
          </div>
        )}

        <div>
          {!loading && timerStarted ? (
            <div>
              {!timerEnded ? (
                <div>
                  {guessedPokemon.length > 0 && (
                    <div
                      className={`font-bold text-lg ${
                        allGuessablePokemon
                          .map((gp) => gp.name)
                          .includes(guessedPokemon[guessedPokemon.length - 1])
                          ? guessedPokemon.indexOf(
                              guessedPokemon[guessedPokemon.length - 1]
                            ) ===
                            guessedPokemon.length - 1
                            ? "text-green-600"
                            : "text-yellow-500"
                          : "text-red-600"
                      }`}
                    >
                      <span className="capitalize">
                        {guessedPokemon[guessedPokemon.length - 1].replaceAll(
                          "-",
                          " "
                        )}{" "}
                      </span>
                      was{" "}
                      {allGuessablePokemon
                        .map((gp) => gp.name)
                        .includes(guessedPokemon[guessedPokemon.length - 1])
                        ? guessedPokemon.indexOf(
                            guessedPokemon[guessedPokemon.length - 1]
                          ) ===
                          guessedPokemon.length - 1
                          ? "found"
                          : "already found"
                        : "not found"}
                    </div>
                  )}
                  <div className="lg:flex items-center hidden">
                    <div className="me-2">
                      There are {allGuessablePokemon.length} possible pokemon:
                    </div>
                    <input
                      placeholder="Guess a pokemon"
                      className="outline-none me-2"
                      autoFocus
                      id="guessPokemonInput"
                    />
                    <button
                      className="rounded bg-gray-200 px-3 py-1"
                      onClick={() => {
                        const newGuessedPokemon = [...guessedPokemon];

                        const inputGuessValue = document.getElementById(
                          "guessPokemonInput"
                        ) as any;

                        let guessedPokemonLowerCase = inputGuessValue.value
                          .replaceAll(" ", "-")
                          .toLowerCase();

                        let similarPokemon =
                          allGuessablePokemon
                            .map((pokemon) => pokemon.name)
                            .find(
                              (pokeName) => pokeName === guessedPokemonLowerCase
                            ) ?? "";

                        if (!similarPokemon) {
                          allGuessablePokemon
                            .map((pokemon) => pokemon.name)
                            .forEach((pokemon) => {
                              if (
                                similarityPercentage(
                                  pokemon,
                                  guessedPokemonLowerCase
                                ) >= 80 &&
                                !similarPokemon
                              ) {
                                similarPokemon = pokemon;
                              }
                            });
                        }

                        if (!similarPokemon) {
                          similarPokemon = guessedPokemonLowerCase;
                        }

                        newGuessedPokemon.push(similarPokemon);
                        inputGuessValue.value = "";
                        inputGuessValue.focus();

                        changeGuessedPokemon(newGuessedPokemon);
                      }}
                    >
                      Guess
                    </button>
                  </div>
                  <div className="lg:hidden">
                    <div className="me-2">
                      There are {allGuessablePokemon.length} possible pokemon:
                    </div>
                    <div className="flex justify-between items-center">
                      <input
                        placeholder="Guess a pokemon"
                        className="outline-none me-2"
                        autoFocus
                        id="guessPokemonInputSmall"
                      />
                      <button
                        className="rounded bg-gray-200 px-3 py-1"
                        onClick={() => {
                          const newGuessedPokemon = [...guessedPokemon];

                          const inputGuessValue = document.getElementById(
                            "guessPokemonInputSmall"
                          ) as any;

                          newGuessedPokemon.push(
                            inputGuessValue.value
                              .replaceAll(" ", "-")
                              .toLowerCase()
                          );
                          inputGuessValue.value = "";
                          inputGuessValue.focus();

                          changeGuessedPokemon(newGuessedPokemon);
                        }}
                      >
                        Guess
                      </button>
                    </div>
                  </div>
                  <div className="m-2 flex items-center justify-between">
                    <div className="flex items-center max-w-[calc(100%-60px)]">
                      <span>
                        <div>
                          <div className="capitalize">
                            <span className="font-bold text-lg">Type</span>:{" "}
                            {types.length === howManyTypes
                              ? "All"
                              : types
                                  .sort(
                                    (a, b) => (a.name as any) - (b.name as any)
                                  )
                                  .map((t) => t.name)
                                  .join(", ")}
                          </div>
                          <div className="capitalize">
                            <span className="font-bold text-lg">
                              Generation
                            </span>
                            :{" "}
                            {gens.length === howManyGen
                              ? "All"
                              : gens
                                  .sort((a, b) => a.id - b.id)
                                  .map((g) => g.name)
                                  .join(", ")}
                          </div>
                        </div>
                      </span>
                    </div>

                    <div>
                      {Math.floor(seconds / 60)} :{" "}
                      {seconds - Math.floor(seconds / 60) * 60 < 10
                        ? `0${seconds - Math.floor(seconds / 60) * 60}`
                        : seconds - Math.floor(seconds / 60) * 60}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center mb-4">
                  <span>
                    You guessed{" "}
                    {
                      guessedPokemon.filter((pokemon) =>
                        allGuessablePokemon
                          .map((guesspok) => guesspok.name)
                          .includes(pokemon)
                      ).length
                    }{" "}
                    out of {allGuessablePokemon.length} possible
                  </span>
                  <button
                    className="rounded bg-gray-200 px-3 py-1 ms-2"
                    onClick={() => {
                      changeSeconds(lastseconds);
                      changeGuessedPokemon([]);
                      changeAllGuessablePokemon([]);
                      changeTimerEnded(false);
                      changeTimerStarted(false);
                    }}
                  >
                    Retry
                  </button>
                </div>
              )}
              <div className="grid grid-cols-12">
                {allGuessablePokemon.map((pokemon) => (
                  <div
                    className={`capitalize lg:col-span-2 col-span-4 border p-2 m-2 ${
                      guessedPokemon.includes(pokemon.name)
                        ? "bg-green-200 border-green-400 text-green-600 border-4"
                        : timerEnded
                        ? "bg-red-200 border-red-400 text-red-600 border-4"
                        : ""
                    }`}
                    key={pokemon.id}
                  >
                    {pokemon.id}.{" "}
                    <span>
                      {guessedPokemon.includes(pokemon.name) || timerEnded
                        ? pokemon.name.replaceAll("-", " ")
                        : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex justify-center align-middle">
              {loading && <Pokeball title="" desc="" spin={true} />}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
