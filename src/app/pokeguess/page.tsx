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

export default function PokeGuess() {
  const startingPoints = 1000;
  const howManyPokemon = 1025;
  const howManyRound = 5;

  const [pokemon, changePokemon] = useState<PokeInfo | undefined>(undefined);
  const [unlockedImg, unlockImg] = useState(false);
  const [unlockedTypes, unlockTypes] = useState(false);
  const [unlockedGen, unlockGen] = useState(false);
  const [unlockedEvStage, unlockEvStage] = useState(false);
  const [unlockedNatPokedex, unlockNatPokedex] = useState(false);
  const [loading, changeLoading] = useState(true);

  const [pokeGuess, changePokeGuess] = useState("");

  const [howManyGuessesAlready, changeHowManyGuessesAlready] = useState(1);
  const [showNextBtn, changeShowNextBtn] = useState(false);
  const [showBanner, changeShowBanner] = useState(0); // 0 do not show banner 1 show worng answer 2 show right answer
  const [showResult, changeShowResult] = useState(false);

  const [score, changeScore] = useState(0);

  function getRandomPokemon() {
    changeLoading(true);
    changeShowBanner(0);
    changeShowNextBtn(false);
    changePokeGuess("");
    unlockImg(false);
    unlockTypes(false);
    unlockGen(false);
    unlockEvStage(false);
    unlockNatPokedex(false);
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

  function guessPokemon() {
    (document.getElementById("inputPokemonNameGuess") as any).value = "";

    const for_how_many_points =
      startingPoints -
      (unlockedImg ? 300 : 0) -
      (unlockedTypes ? 200 : 0) -
      (unlockedGen ? 100 : 0) -
      (unlockedEvStage ? 100 : 0) -
      (unlockedNatPokedex ? 100 : 0);

    const guessedPokemonLowerCase = pokeGuess
      .toLowerCase()
      .replaceAll(" ", "-");

    let similarPokemon =
      pokemon?.names
        .map((name) => name.name.toLowerCase())
        .find((name) => name === guessedPokemonLowerCase) ?? "";

    if (!similarPokemon) {
      pokemon?.names
        .map((name) => name.name.toLowerCase())
        .forEach((pokemon) => {
          if (
            similarityPercentage(pokemon, guessedPokemonLowerCase) >= 80 &&
            !similarPokemon
          ) {
            similarPokemon = pokemon;
          }
        });
    }

    if (!similarPokemon) {
      similarPokemon = guessedPokemonLowerCase;
    }

    changePokeGuess(similarPokemon);

    if (
      pokemon?.names
        .map((name) => name.name.toLowerCase())
        .includes(similarPokemon)
    ) {
      changeScore(score + for_how_many_points);
      changeShowBanner(2);
    } else {
      changeShowBanner(1);
    }

    changeShowNextBtn(true);

    unlockImg(true);
    unlockTypes(true);
    unlockGen(true);
    unlockEvStage(true);
    unlockNatPokedex(true);
  }

  return (
    <div className="grid grid-cols-12 py-20">
      {showResult ? (
        <Card>
          <div className="flex justify-between items-center mb-8">
            <div className="font-semibold text-3xl">
              Welcome to <span className="pokeTitle text-5xl">PokeGuess</span>
            </div>

            <Link href="/">
              <FontAwesomeIcon icon={faHome}></FontAwesomeIcon>
            </Link>
          </div>
          Your final score was {score}. <br /> Do you want to do better?
          <br />
          <button
            className="rounded bg-gray-200 px-3 py-1 mt-2"
            onClick={() => {
              changeHowManyGuessesAlready(1);
              changeScore(0);
              changeShowResult(false);
            }}
          >
            Click Here
          </button>
        </Card>
      ) : (
        <Card>
          <div className="flex justify-between items-center">
            <div className="font-semibold text-3xl">
              Welcome to <span className="pokeTitle text-5xl">PokeGuess</span>
            </div>

            <Link href="/">
              <FontAwesomeIcon icon={faHome}></FontAwesomeIcon>
            </Link>
          </div>
          <div className="my-4">
            PokeGuess is a game in which you start with 1000 points and the
            description of the mysterious pokemon and <b>ONLY ONE</b> guess.
            (Don&apos;t worry the guess is NOT case sensitive, but the name must
            be right)
            <br />
            <br />
            Don&apos;t worry you can buy more hints by clicking on the black box
            hidding the information you desire. The price of the bought items
            will be deducted from the starting 1000 points.
            <br />
            <br />
            Enjoy!
          </div>
          <div
            className={`lg:flex lg:justify-between lg:items-center mt-4 text-[13px] xl:text-base ${
              showBanner > 0 ? "mb-4" : "mb-12"
            }`}
          >
            <div className="hidden md:flex lg:justify-start align-middle items-center md:justify-between">
              <span className="me-4">The Mysterious Pokemon is: </span>
              <input
                className="outline-none"
                placeholder="Insert your answer"
                onChange={(e) => changePokeGuess(e.target.value)}
                id="inputPokemonNameGuess"
              ></input>
              <button
                className="rounded bg-gray-200 px-3 py-1"
                onClick={() => guessPokemon()}
                disabled={showNextBtn || loading}
              >
                {!showNextBtn ? (
                  <span>
                    Guess for{" "}
                    {startingPoints -
                      (unlockedImg ? 300 : 0) -
                      (unlockedTypes ? 200 : 0) -
                      (unlockedGen ? 100 : 0) -
                      (unlockedEvStage ? 100 : 0) -
                      (unlockedNatPokedex ? 100 : 0)}{" "}
                    Points
                  </span>
                ) : (
                  <span>
                    {showBanner === 1 && <span>Next Time</span>}
                    {showBanner === 2 && <span>Congratulations!</span>}
                  </span>
                )}
              </button>
            </div>

            <div className="md:hidden">
              <div className="me-4">The Mysterious Pokemon is: </div>
              <div className="flex items-center justify-between">
                <input
                  className="outline-none"
                  placeholder="Insert your answer"
                  onChange={(e) => changePokeGuess(e.target.value)}
                  id="inputPokemonNameGuess"
                ></input>
                <button
                  className="rounded bg-gray-200 px-3 py-1"
                  onClick={() => guessPokemon()}
                  disabled={showNextBtn || loading}
                >
                  {!showNextBtn ? (
                    <span>
                      Guess for{" "}
                      {startingPoints -
                        (unlockedImg ? 300 : 0) -
                        (unlockedTypes ? 200 : 0) -
                        (unlockedGen ? 100 : 0) -
                        (unlockedEvStage ? 100 : 0) -
                        (unlockedNatPokedex ? 100 : 0)}{" "}
                      Points
                    </span>
                  ) : (
                    <span>
                      {showBanner === 1 && <span>Next Time</span>}
                      {showBanner === 2 && <span>Congratulations!</span>}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="flex justify-end items-center mt-2 lg:mt-0">
              <span className="me-4">
                Turn {howManyGuessesAlready}/{howManyRound}
              </span>
              Score: {score}
            </div>
          </div>

          {showBanner > 0 && (
            <div
              className={`mt-4 mb-12 border-4 rounded p-6 flex items-center justify-between ${
                showBanner === 1
                  ? "bg-red-200 border-red-400 text-red-800 font-bold"
                  : ""
              } ${
                showBanner === 2
                  ? "bg-green-200 border-green-400 text-green-800 font-bold"
                  : ""
              }`}
            >
              <div>
                {showBanner === 1 && (
                  <span>
                    Sorry but <span className="capitalize">{pokeGuess}</span>{" "}
                    was not the right answer. The right answer was{" "}
                    <span className="capitalize">
                      {
                        pokemon?.names.find(
                          (name) => name.language.name === "en"
                        )?.name
                      }
                    </span>
                  </span>
                )}
                {showBanner === 2 && (
                  <span>
                    Congratulations the answer was{" "}
                    <span className="capitalize">{pokeGuess}</span>!
                  </span>
                )}
              </div>

              {showNextBtn && (
                <button
                  onClick={() => {
                    changeHowManyGuessesAlready(howManyGuessesAlready + 1);
                    if (howManyGuessesAlready === howManyRound) {
                      changeShowResult(true);
                    }
                    getRandomPokemon();
                  }}
                >
                  {howManyGuessesAlready === howManyRound
                    ? "Show Results"
                    : "Next"}
                </button>
              )}
            </div>
          )}

          <div>
            {!loading ? (
              <div className="flex flex-wrap lg:flex-nowrap">
                <div className="sm:min-h-[450px] sm:min-w-[450px] min-h-[320px] min-w-[320px] px-6 mb-4 lg:p-0 lg:mb-0">
                  {!unlockedImg ? (
                    <button
                      className="text-white w-full bg-black mb-4 sm:h-[406px] h-[276px] flex justify-center align-middle items-center"
                      onClick={() => unlockImg(true)}
                    >
                      -300 points
                    </button>
                  ) : (
                    <div className="relative sm:h-[406px] sm:w-[406px] h-[276px] w-[276px] mb-4 mx-auto">
                      <Image
                        src={pokemon?.pokeImg ?? ""}
                        alt={`${pokemon?.name} image`}
                        sizes="min-width: 276px"
                        fill
                      />
                    </div>
                  )}
                  <div className="flex items-center h-[28.5px]">
                    <span className="font-bold text-lg me-2">Types</span>
                    {!unlockedTypes ? (
                      <button
                        className="w-full min-h-6 bg-black text-white flex justify-center align-middle items-center"
                        onClick={() => unlockTypes(true)}
                      >
                        -200 points
                      </button>
                    ) : (
                      <div className="flex">
                        {pokemon?.types.map((type) => {
                          return (
                            <div
                              className="w-[75px] h-[28.5px] relative mx-2"
                              key={type?.slot}
                            >
                              <Image
                                src={`/types/${
                                  type?.type?.name ?? ""
                                }_word.webp`}
                                alt={`${type.type.name} image`}
                                fill
                                sizes="width:75px"
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
                <div className="pb-6 px-6">
                  <div className="mb-4">
                    <span className="font-bold text-lg">Description</span>
                    <div className="w-full">
                      {pokemon?.flavor_text_entries
                        .filter((fte) => fte.language.name === "en")[0]
                        .flavor_text.replaceAll(
                          new RegExp(pokemon?.name, "ig"),
                          "__________"
                        )}
                    </div>
                  </div>
                  <div className="mb-4">
                    <span className="font-bold text-lg">Generation</span>
                    {!unlockedGen ? (
                      <button
                        className="w-24 h-6 bg-black text-white flex justify-center align-middle items-center"
                        onClick={() => unlockGen(true)}
                      >
                        -100 points
                      </button>
                    ) : (
                      <div>
                        <span className="capitalize">
                          {pokemon?.generation.name.split("-")[0]}
                        </span>
                        <span>
                          &nbsp;
                          {pokemon?.generation.name.split("-")[1].toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="mb-4">
                    <span className="font-bold text-lg">Evolution Stage</span>
                    {!unlockedEvStage ? (
                      <button
                        className="w-36 h-6 bg-black text-white flex justify-center align-middle items-center"
                        onClick={() => unlockEvStage(true)}
                      >
                        -100 points
                      </button>
                    ) : (
                      <div>
                        {pokemon?.evolutionStage === 0
                          ? "Has No Evoulution"
                          : pokemon?.evolutionStage === 1
                          ? "First Evolution"
                          : pokemon?.evolutionStage === 2
                          ? "Second Evolution"
                          : pokemon?.evolutionStage === 3
                          ? "Third Evolution"
                          : "Error"}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="font-bold text-lg">
                      National Pokedex Number
                    </span>
                    {!unlockedNatPokedex ? (
                      <button
                        className="w-24 h-6 bg-black text-white flex justify-center align-middle items-center"
                        onClick={() => unlockNatPokedex(true)}
                      >
                        -100 points
                      </button>
                    ) : (
                      <div>
                        {
                          pokemon?.pokedex_numbers.find(
                            (pokedex) => pokedex.pokedex.name === "national"
                          )?.entry_number
                        }
                      </div>
                    )}
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
      )}
    </div>
  );
}
