"use client";

import BackendService from "@/backend/backendFunc";
import { PokeInfo } from "@/backend/backendTypes";
import Card from "@/components/card";
import Pokeball from "@/components/pokeball";
import { similarityPercentage } from "@/utilitiesFunc/utilitiesFuncs";
import { faHome } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function WhoIsThatPokemon() {
  const howManyPokemon = 1025;

  const [pokemon, changePokemon] = useState<PokeInfo | undefined>(undefined);
  const [nameGuessed, changeNameGuessed] = useState("");

  const [bestStreak, changeBestStreak] = useState(0);
  const [currentStreak, changeCurrentStreak] = useState(0);

  const [loading, changeLoading] = useState(true);
  const [showNextBtn, changeShowNextBtn] = useState(false);

  function getRandomPokemon() {
    changeLoading(true);
    changeShowNextBtn(false);
    changeNameGuessed("");
    const pokeNumber = Math.ceil(Math.random() * howManyPokemon) ?? 1;
    BackendService.getPokemonInfo(pokeNumber).then((pokemon) => {
      if (pokemon.name === "minior-red-meteor") {
        pokemon.name = "minior";
      } else if (pokemon.name === "mimikyu-disguised") {
        pokemon.name = "mimikyu";
      }

      if (pokemon?.id) {
        changePokemon(pokemon);
      }

      changeLoading(false);
    });
  }

  useEffect(() => {
    getRandomPokemon();
  }, []);

  return (
    <div className="grid grid-cols-12 py-20">
      <Card>
        <div className="flex justify-between items-center">
          <div className="font-semibold text-3xl">
            Welcome to{" "}
            <span className="pokeTitle text-5xl">Who&apos;s that Pokemon</span>
          </div>

          <Link href="/">
            <FontAwesomeIcon icon={faHome}></FontAwesomeIcon>
          </Link>
        </div>
        <div className="my-4">
          Do I need to add something? I don&apos;t think so.
          <br />
          <br />
          Enjoy!
        </div>

        <div>
          {!loading ? (
            <div>
              <div className="flex justify-center items-center">
                <div className="mx-4">Current Streak: {currentStreak}</div>
                <div className="mx-4">Best Streak: {bestStreak}</div>
              </div>
              <div className="flex justify-center items-center">
                <div className="relative h-[420px] w-[420px]">
                  <Image
                    src={pokemon?.pokeImg ?? ""}
                    alt="Mysterious pokemon shape"
                    fill
                    sizes="min-width: 420px"
                    priority
                    className={showNextBtn ? "" : "brightness-0"}
                  />
                </div>
              </div>
              <div className="flex justify-center items-center mt-4">
                <div>
                  {showNextBtn && (
                    <div>
                      <span
                        className={`capitalize font-bold ${
                          nameGuessed.toLowerCase() ===
                          pokemon?.name.replaceAll("-", " ").toLowerCase()
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {!nameGuessed
                          ? `It's ${pokemon?.name.replaceAll("-", " ")}`
                          : nameGuessed.toLowerCase() ===
                            pokemon?.name.replaceAll("-", " ").toLowerCase()
                          ? `CORRECT! It's ${pokemon?.name.replaceAll(
                              "-",
                              " "
                            )}`
                          : `WRONG! It's ${pokemon?.name.replaceAll("-", " ")}`}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-center items-center">
                    <input
                      className="outline-none"
                      autoFocus
                      type="text"
                      placeholder="Who's That Pokemon?"
                      onChange={(e) => changeNameGuessed(e.target.value)}
                    ></input>
                    {showNextBtn ? (
                      <button
                        className="rounded bg-gray-200 px-3 py-1 me-2"
                        onClick={() => getRandomPokemon()}
                        autoFocus
                      >
                        Next
                      </button>
                    ) : (
                      <div>
                        <button
                          className="rounded bg-gray-200 px-3 py-1 me-2"
                          onClick={() => {
                            if (
                              nameGuessed.toLowerCase() ===
                                pokemon?.name
                                  .replaceAll("-", " ")
                                  .toLowerCase() ||
                              similarityPercentage(
                                nameGuessed.toLowerCase(),
                                pokemon?.name
                                  .replaceAll("-", " ")
                                  .toLowerCase() ?? ""
                              ) >= 80
                            ) {
                              const newCurrentStreak = currentStreak + 1;
                              changeCurrentStreak(newCurrentStreak);
                              if (newCurrentStreak > bestStreak) {
                                changeBestStreak(newCurrentStreak);
                              }
                            } else {
                              changeCurrentStreak(0);
                            }
                            changeShowNextBtn(true);
                          }}
                        >
                          Guess
                        </button>
                        <button
                          className="rounded bg-gray-200 px-3 py-1"
                          onClick={() => {
                            changeCurrentStreak(0);
                            changeShowNextBtn(true);
                          }}
                        >
                          Skip
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
