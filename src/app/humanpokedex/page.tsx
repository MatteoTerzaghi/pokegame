"use client";

import BackendService from "@/backend/backendFunc";
import { PokeInfo } from "@/backend/backendTypes";
import Card from "@/components/card";
import Pokeball from "@/components/pokeball";
import { faHome } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HumanPokedex() {
  const howManyPokemon = 1025;
  const howManyRound = 5;

  const [pokemon, changePokemon] = useState<PokeInfo | undefined>(undefined);

  const [typeOne, changeTypeOne] = useState("");
  const [typeTwo, changeTypeTwo] = useState("");
  const [gen, changeGen] = useState("");
  const [evolutionStage, changeEvStage] = useState(-1);
  const [nationalPokedexNumber, changeNatPokedex] = useState(0);
  const [nationalPokedexNumberPoints, changeNatPokedexPoints] = useState(0);
  const [loading, changeLoading] = useState(true);

  const [howManyGuessesAlready, changeHowManyGuessesAlready] = useState(0);
  const [showNextBtn, changeShowNextBtn] = useState(false);
  const [showResult, changeShowResult] = useState(false);

  const [showAnswers, changeShowAnsewrs] = useState(false);

  const [score, changeScore] = useState(0);

  function getRandomPokemon() {
    changeHowManyGuessesAlready(howManyGuessesAlready + 1);
    changeLoading(true);
    changeShowNextBtn(false);
    changeShowAnsewrs(false);
    changeTypeOne("");
    changeTypeTwo("");
    changeGen("");
    changeEvStage(-1);
    changeNatPokedex(0);
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

  function guessPokemonInformation() {
    let for_how_many_points = 0;

    // If the pokemon has TWO types then is 100 points each, if the pokemon has ONLY ONE type and the use put one type then is 200pts

    const arrTypesName = pokemon?.types.map((type) => type.type.name) ?? [];
    if (pokemon?.types.length == 2 && typeTwo) {
      for_how_many_points +=
        (arrTypesName.includes(typeOne) ? 100 : 0) +
        (arrTypesName.includes(typeTwo) ? 100 : 0);
    } else if (pokemon && pokemon?.types.length < 2 && !typeTwo) {
      for_how_many_points += arrTypesName.includes(typeOne) ? 200 : 0;
    }

    const pokeNumber =
      pokemon?.pokedex_numbers.find(
        (pokedex) => pokedex.pokedex.name === "national"
      )?.entry_number ?? 0;

    const errorPerc = Math.floor(
      Math.abs(nationalPokedexNumber - pokeNumber) / 100
    );

    for_how_many_points +=
      (pokemon?.generation.name === gen ? 300 : 0) +
        (pokemon?.evolutionStage === evolutionStage ? 100 : 0) +
        pokeNumber ===
      nationalPokedexNumber
        ? 500
        : errorPerc >= 0 && errorPerc < 5
        ? 400 - 100 * errorPerc
        : 0;

    changeScore(score + for_how_many_points);

    changeShowAnsewrs(true);
    changeShowNextBtn(true);
  }

  return (
    <div className="grid grid-cols-12 pt-20">
      {showResult ? (
        <Card>
          <div className="flex justify-between items-center mb-8">
            <div className="font-semibold text-3xl">
              Welcome to{" "}
              <span className="pokeTitle text-5xl">Human Pokedex</span>
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
              Welcome to{" "}
              <span className="pokeTitle text-5xl">Human Pokedex</span>
            </div>

            <Link href="/">
              <FontAwesomeIcon icon={faHome}></FontAwesomeIcon>
            </Link>
          </div>
          <div className="my-4">
            Human Pokedex is a game that try your pokemon knowledge, how many
            information can you give about a pokemon with just its name?
            <br />
            <br />
            Enjoy!
          </div>
          <div className="md:hidden mt-4 mb-12">
            <div className="text-end">
              <span className="me-4">
                Turn {howManyGuessesAlready}/{howManyRound}
              </span>
              Score: {score}
            </div>

            <div className="me-4">How much do you know about:</div>

            <span className="capitalize font-bold text-2xl">
              {pokemon?.names
                .find((name) => name.language.name === "en")
                ?.name.replaceAll("-", "")}
            </span>
          </div>

          <div className="md:flex md:justify-between md:items-center md:mt-4 md:mb-12 hidden">
            <div className="flex justify-start align-middle items-center">
              <span className="me-4">
                How much do you know about:{" "}
                <span className="capitalize font-bold text-2xl">
                  {pokemon?.names
                    .find((name) => name.language.name === "en")
                    ?.name.replaceAll("-", "")}
                </span>
              </span>
            </div>

            <div>
              <span className="me-4">
                Turn {howManyGuessesAlready}/{howManyRound}
              </span>
              Score: {score}
            </div>
          </div>

          <div>
            {!loading ? (
              <div className="grid grid-cols-12">
                <div className="sm:col-span-8 col-span-12 pb-6 md:px-6">
                  <div className="mb-4 h-[88px]">
                    <span className="font-bold text-lg">
                      Types (200 points)
                    </span>
                    <div className="flex">
                      <select
                        name="typeOne"
                        id="typeOne"
                        className="outline-none block w-48 my-1"
                        defaultValue={""}
                        onChange={(e) => changeTypeOne(e.target.value)}
                      >
                        <option value={""} disabled>
                          --- Select a Type ---
                        </option>
                        <option
                          disabled={typeTwo === "normal"}
                          value={"normal"}
                        >
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
                        <option
                          disabled={typeTwo === "flying"}
                          value={"flying"}
                        >
                          Flying
                        </option>
                        <option
                          disabled={typeTwo === "fighting"}
                          value={"fighting"}
                        >
                          Fighting
                        </option>
                        <option
                          disabled={typeTwo === "poison"}
                          value={"poison"}
                        >
                          Poison
                        </option>
                        <option
                          disabled={typeTwo === "electric"}
                          value={"electric"}
                        >
                          Electric
                        </option>
                        <option
                          disabled={typeTwo === "ground"}
                          value={"ground"}
                        >
                          Ground
                        </option>
                        <option disabled={typeTwo === "rock"} value={"rock"}>
                          Rock
                        </option>
                        <option
                          disabled={typeTwo === "psychic"}
                          value={"psychic"}
                        >
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
                        <option
                          disabled={typeTwo === "dragon"}
                          value={"dragon"}
                        >
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
                        defaultValue={""}
                        disabled={!typeOne}
                        onChange={(e) => changeTypeTwo(e.target.value)}
                      >
                        <option value={""}>Hasn&apos;t a second type</option>
                        <option
                          disabled={typeOne === "normal"}
                          value={"normal"}
                        >
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
                        <option
                          disabled={typeOne === "flying"}
                          value={"flying"}
                        >
                          Flying
                        </option>
                        <option
                          disabled={typeOne === "fighting"}
                          value={"fighting"}
                        >
                          Fighting
                        </option>
                        <option
                          disabled={typeOne === "poison"}
                          value={"poison"}
                        >
                          Poison
                        </option>
                        <option
                          disabled={typeOne === "electric"}
                          value={"electric"}
                        >
                          Electric
                        </option>
                        <option
                          disabled={typeOne === "ground"}
                          value={"ground"}
                        >
                          Ground
                        </option>
                        <option disabled={typeOne === "rock"} value={"rock"}>
                          Rock
                        </option>
                        <option
                          disabled={typeOne === "psychic"}
                          value={"psychic"}
                        >
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
                        <option
                          disabled={typeOne === "dragon"}
                          value={"dragon"}
                        >
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
                  <div className="mb-4 h-[52px]">
                    <span className="font-bold text-lg">
                      Generation (300 points)
                    </span>
                    <select
                      name="generation"
                      id="generation"
                      className="outline-none block"
                      defaultValue={""}
                      onChange={(e) => changeGen(e.target.value)}
                    >
                      <option value={""} disabled>
                        --- Select a Generation ---
                      </option>
                      <option value={"generation-i"}>Generation I</option>
                      <option value={"generation-ii"}>Generation II</option>
                      <option value={"generation-iii"}>Generation III</option>
                      <option value={"generation-iv"}>Generation IV</option>
                      <option value={"generation-v"}>Generation V</option>
                      <option value={"generation-vi"}>Generation VI</option>
                      <option value={"generation-vii"}>Generation VII</option>
                      <option value={"generation-viii"}>Generation VIII</option>
                      <option value={"generation-ix"}>Generation IX</option>
                    </select>
                  </div>
                  <div className="mb-4 h-[52px]">
                    <span className="font-bold text-lg">
                      Evolution Stage (100 points)
                    </span>

                    <select
                      name="evolutionStage"
                      id="evolutionStage"
                      className="outline-none block"
                      defaultValue={-1}
                      onChange={(e) => changeEvStage(+e.target.value)}
                    >
                      <option value={-1} disabled>
                        --- Select an Evolution Stage ---
                      </option>
                      <option value={0}>Has No Evolution</option>
                      <option value={1}>First Evolution</option>
                      <option value={2}>Second Evolution</option>
                      <option value={3}>Third Evolution</option>
                    </select>
                  </div>
                  <div className="mb-4 lg:h-[52px] md:h-[96px] sm:h-[116px] h-[68px]">
                    <span className="font-bold text-lg">
                      National Pokedex Number (500 points)
                    </span>

                    <div className="flex items-center">
                      <input
                        type="number"
                        className="no-outline"
                        defaultValue={0}
                        min={1}
                        max={howManyPokemon}
                        onChange={(e) => changeNatPokedex(+e.target.value)}
                      />

                      {(nationalPokedexNumber <= 0 ||
                        nationalPokedexNumber > howManyPokemon ||
                        isNaN(nationalPokedexNumber) ||
                        !Number.isInteger(nationalPokedexNumber)) && (
                        <span className="ms-2 text-sm">
                          (The number MUST be between 1 and {howManyPokemon} and
                          it must be an integer number)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {showAnswers && (
                  <div className="sm:col-span-4 col-span-12">
                    <div className="mb-4 sm:h-[88px] h-auto">
                      <span className="font-bold text-lg">
                        {(pokemon?.types.length === 2 &&
                          pokemon.types
                            .map((type) => type.type.name)
                            .includes(typeOne) &&
                          pokemon.types
                            .map((type) => type.type.name)
                            .includes(typeTwo)) ||
                        (pokemon?.types.length === 1 &&
                          !typeTwo &&
                          pokemon.types
                            .map((type) => type.type.name)
                            .includes(typeOne)) ? (
                          <span className="text-green-600">
                            <span className="sm:hidden">Types &nbsp;</span>
                            Correct!
                          </span>
                        ) : (
                          <span className="text-red-600">
                            <span className="sm:hidden">Types &nbsp;</span>Wrong
                          </span>
                        )}
                      </span>
                      <div>
                        <div
                          className="w-[75px] h-[28.5px] relative mx-2"
                          key={pokemon?.types[0].type.name}
                        >
                          <Image
                            src={`/types/${pokemon?.types[0].type.name}_word.webp`}
                            alt={`${pokemon?.types[0].type.name} image`}
                            fill
                            sizes="width:75px"
                          />
                        </div>
                      </div>
                      <div>
                        {pokemon && pokemon.types?.length > 1 && (
                          <div
                            className="w-[75px] h-[28.5px] relative mx-2"
                            key={pokemon?.types[1].type.name}
                          >
                            <Image
                              src={`/types/${pokemon?.types[1].type.name}_word.webp`}
                              alt={`${pokemon?.types[1].type.name} image`}
                              fill
                              sizes="width:75px"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="mb-4 sm:h-[52px] h-auto">
                      <span className="font-bold text-lg">
                        {gen === pokemon?.generation.name ? (
                          <span className="text-green-600">
                            <span className="sm:hidden">Types &nbsp;</span>
                            Correct!
                          </span>
                        ) : (
                          <span className="text-red-600">
                            <span className="sm:hidden">Types &nbsp;</span>Wrong
                          </span>
                        )}
                      </span>
                      <div>
                        <span className="capitalize">
                          {pokemon?.generation.name.split("-")[0]}
                        </span>
                        <span>
                          &nbsp;
                          {pokemon?.generation.name.split("-")[1].toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="mb-4 sm:h-[52px] h-auto">
                      <span className="font-bold text-lg">
                        {evolutionStage === pokemon?.evolutionStage ? (
                          <span className="text-green-600">
                            <span className="sm:hidden">Types &nbsp;</span>
                            Correct!
                          </span>
                        ) : (
                          <span className="text-red-600">
                            <span className="sm:hidden">Types &nbsp;</span>Wrong
                          </span>
                        )}
                      </span>

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
                    </div>
                    <div className="mb-4 sm:h-[52px] h-auto">
                      <span className="font-bold text-lg">
                        {nationalPokedexNumber ===
                        pokemon?.pokedex_numbers.find(
                          (pokedex) => pokedex.pokedex.name === "national"
                        )?.entry_number ? (
                          <span className="text-green-600">
                            <span className="sm:hidden">Types &nbsp;</span>
                            Correct!
                          </span>
                        ) : (
                          <span className="text-red-600">
                            <span className="sm:hidden">Types &nbsp;</span>Wrong{" "}
                            {nationalPokedexNumberPoints} Points
                          </span>
                        )}
                      </span>

                      <div>
                        {
                          pokemon?.pokedex_numbers.find(
                            (pokedex) => pokedex.pokedex.name === "national"
                          )?.entry_number
                        }
                      </div>
                    </div>
                  </div>
                )}
                <div className="col-span-12 text-center my-4">
                  <button
                    className="rounded bg-gray-200 px-3 py-1"
                    onClick={() => {
                      if (
                        showNextBtn &&
                        howManyGuessesAlready === howManyRound
                      ) {
                        changeShowResult(true);
                        getRandomPokemon();
                      } else if (showNextBtn) {
                        getRandomPokemon();
                      } else {
                        guessPokemonInformation();
                      }
                    }}
                    disabled={
                      !typeOne ||
                      evolutionStage === -1 ||
                      gen === "" ||
                      nationalPokedexNumber <= 0 ||
                      nationalPokedexNumber > howManyPokemon ||
                      isNaN(nationalPokedexNumber) ||
                      !Number.isInteger(nationalPokedexNumber)
                    }
                  >
                    {showNextBtn
                      ? howManyGuessesAlready === howManyRound
                        ? "Show Result"
                        : "Next"
                      : "Guess"}
                  </button>
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
