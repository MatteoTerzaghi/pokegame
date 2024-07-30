"use client";

import BackendService from "@/backend/backendFunc";
import { PokeInfo } from "@/backend/backendTypes";
import Card from "@/components/card";
import Pokeball from "@/components/pokeball";
import { faChevronDown, faHome } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";

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
  const [showTypesDropdown, changeShowTypesDropdown] = useState(0);

  const [score, changeScore] = useState(0);

  function getRandomPokemon() {
    changeHowManyGuessesAlready(howManyGuessesAlready + 1);
    changeLoading(true);
    changeShowNextBtn(false);
    changeShowAnsewrs(false);
    changeNatPokedexPoints(0);
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

  useLayoutEffect(() => {
    function onClickFunc(ev: any) {
      let isATypePickerClick = ev.target.id === "typePicker";
      let targetParent = ev.target.parentElement;

      while (!isATypePickerClick) {
        if (targetParent.nodeName === "BODY") {
          break;
        }

        isATypePickerClick = targetParent.id === "typePicker";

        if (!targetParent.parentElement) {
          break;
        }

        targetParent = targetParent.parentElement;
      }

      if (!isATypePickerClick && showTypesDropdown > 0) {
        changeShowTypesDropdown(0);
      }
    }
    window.addEventListener("click", onClickFunc);
    return () => window.removeEventListener("click", onClickFunc);
  }, [showTypesDropdown]);

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

    const natPokedexPoints =
      pokeNumber === nationalPokedexNumber
        ? 500
        : 401 -
          (Math.abs(pokeNumber - nationalPokedexNumber) > 401
            ? 401
            : Math.abs(pokeNumber - nationalPokedexNumber));
    //   : errorPerc >= 0 && errorPerc < 5
    //   ? 400 - 100 * errorPerc
    //   : 0;

    for_how_many_points +=
      (pokemon?.generation.name === gen ? 300 : 0) +
      (pokemon?.evolutionStage === evolutionStage ? 100 : 0) +
      natPokedexPoints;

    changeNatPokedexPoints(natPokedexPoints);

    changeScore(score + for_how_many_points);

    changeShowAnsewrs(true);
    changeShowNextBtn(true);
  }

  return (
    <div className="grid grid-cols-12 py-20">
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
                <div className="col-span-full mb-4 text-center flex justify-center items-center">
                  <div className="relative h-[320px] w-[320px]">
                    <Image
                      src={pokemon?.pokeImg ?? ""}
                      alt="Mysterious pokemon image"
                      fill
                      sizes="min-width: 320px"
                    />
                  </div>
                </div>
                <div className="sm:col-span-8 col-span-12 pb-6 md:px-6">
                  <div className="mb-4 h-[88px]">
                    <span className="font-bold text-lg">
                      Types (200 points)
                    </span>
                    <div className="flex relative">
                      <button
                        id="typePicker"
                        className="capitalize w-52 text-start flex justify-between items-center"
                        onClick={() => changeShowTypesDropdown(1)}
                      >
                        <span>{typeOne === "" ? "Any Type" : typeOne}</span>
                        <FontAwesomeIcon icon={faChevronDown} />
                      </button>

                      {showTypesDropdown === 1 && (
                        <div className="absolute grid grid-cols-3 -top-10 w-[280px] bg-white z-10 rounded-3xl shadow-lg border text-sm py-2 px-3">
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={typeOne === ""}
                            onClick={() => {
                              changeTypeOne("");
                              changeTypeTwo("");
                            }}
                          >
                            Any Type
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("normal")}
                            onClick={() => changeTypeOne("normal")}
                          >
                            <Image
                              src="/types/normal_logo.webp"
                              alt="Normal Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("normal")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Normal
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("fire")}
                            onClick={() => changeTypeOne("fire")}
                          >
                            <Image
                              src="/types/fire_logo.webp"
                              alt="Fire Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("fire")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Fire
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("water")}
                            onClick={() => changeTypeOne("water")}
                          >
                            <Image
                              src="/types/water_logo.webp"
                              alt="Water Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("water")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Water
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("grass")}
                            onClick={() => changeTypeOne("grass")}
                          >
                            <Image
                              src="/types/grass_logo.webp"
                              alt="Grass Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("grass")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Grass
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("flying")}
                            onClick={() => changeTypeOne("flying")}
                          >
                            <Image
                              src="/types/flying_logo.webp"
                              alt="Flying Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("flying")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Flying
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("fighting")}
                            onClick={() => changeTypeOne("fighting")}
                          >
                            <Image
                              src="/types/fighting_logo.webp"
                              alt="Fighting Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("fighting")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Fighting
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("poison")}
                            onClick={() => changeTypeOne("poison")}
                          >
                            <Image
                              src="/types/poison_logo.webp"
                              alt="Poison Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("poison")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Poison
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("electric")}
                            onClick={() => changeTypeOne("electric")}
                          >
                            <Image
                              src="/types/electric_logo.webp"
                              alt="Electric Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("electric")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Electric
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("ground")}
                            onClick={() => changeTypeOne("ground")}
                          >
                            <Image
                              src="/types/ground_logo.webp"
                              alt="Ground Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("ground")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Ground
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("rock")}
                            onClick={() => changeTypeOne("rock")}
                          >
                            <Image
                              src="/types/rock_logo.webp"
                              alt="Rock Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("rock")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Rock
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("psychic")}
                            onClick={() => changeTypeOne("psychic")}
                          >
                            <Image
                              src="/types/psychic_logo.webp"
                              alt="Psychic Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("psychic")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Psychic
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("ice")}
                            onClick={() => changeTypeOne("ice")}
                          >
                            <Image
                              src="/types/ice_logo.webp"
                              alt="Ice Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("ice")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Ice
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("bug")}
                            onClick={() => changeTypeOne("bug")}
                          >
                            <Image
                              src="/types/bug_logo.webp"
                              alt="Bug Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("bug")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Bug
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("ghost")}
                            onClick={() => changeTypeOne("ghost")}
                          >
                            <Image
                              src="/types/ghost_logo.webp"
                              alt="Ghost Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("ghost")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Ghost
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("steel")}
                            onClick={() => changeTypeOne("steel")}
                          >
                            <Image
                              src="/types/steel_logo.webp"
                              alt="Steel Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("steel")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Steel
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("dragon")}
                            onClick={() => changeTypeOne("dragon")}
                          >
                            <Image
                              src="/types/dragon_logo.webp"
                              alt="Dragon Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("dragon")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Dragon
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("dark")}
                            onClick={() => changeTypeOne("dark")}
                          >
                            <Image
                              src="/types/dark_logo.webp"
                              alt="Dark Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("dark")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Dark
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("fairy")}
                            onClick={() => changeTypeOne("fairy")}
                          >
                            <Image
                              src="/types/fairy_logo.webp"
                              alt="Fairy Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("fairy")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Fairy
                          </button>
                        </div>
                      )}

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
                    <div className="relative flex">
                      <button
                        id="typePicker"
                        className="capitalize w-52 text-start flex justify-between items-center disabled:text-gray-400"
                        onClick={() => changeShowTypesDropdown(2)}
                        disabled={!typeOne}
                      >
                        <span>
                          {typeTwo === "" ? "Has Only One Type" : typeTwo}
                        </span>

                        <FontAwesomeIcon icon={faChevronDown} />
                      </button>

                      {showTypesDropdown === 2 && (
                        <div className="absolute grid grid-cols-3 -top-10 w-[280px] bg-white z-10 rounded-3xl shadow-lg border text-sm py-2 px-3">
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={typeTwo === ""}
                            onClick={() => {
                              changeTypeTwo("");
                            }}
                          >
                            Has Only One Type
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("normal")}
                            onClick={() => changeTypeTwo("normal")}
                          >
                            <Image
                              src="/types/normal_logo.webp"
                              alt="Normal Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("normal")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Normal
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("fire")}
                            onClick={() => changeTypeTwo("fire")}
                          >
                            <Image
                              src="/types/fire_logo.webp"
                              alt="Fire Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("fire")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Fire
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("water")}
                            onClick={() => changeTypeTwo("water")}
                          >
                            <Image
                              src="/types/water_logo.webp"
                              alt="Water Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("water")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Water
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("grass")}
                            onClick={() => changeTypeTwo("grass")}
                          >
                            <Image
                              src="/types/grass_logo.webp"
                              alt="Grass Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("grass")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Grass
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("flying")}
                            onClick={() => changeTypeTwo("flying")}
                          >
                            <Image
                              src="/types/flying_logo.webp"
                              alt="Flying Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("flying")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Flying
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("fighting")}
                            onClick={() => changeTypeTwo("fighting")}
                          >
                            <Image
                              src="/types/fighting_logo.webp"
                              alt="Fighting Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("fighting")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Fighting
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("poison")}
                            onClick={() => changeTypeTwo("poison")}
                          >
                            <Image
                              src="/types/poison_logo.webp"
                              alt="Poison Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("poison")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Poison
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("electric")}
                            onClick={() => changeTypeTwo("electric")}
                          >
                            <Image
                              src="/types/electric_logo.webp"
                              alt="Electric Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("electric")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Electric
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("ground")}
                            onClick={() => changeTypeTwo("ground")}
                          >
                            <Image
                              src="/types/ground_logo.webp"
                              alt="Ground Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("ground")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Ground
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("rock")}
                            onClick={() => changeTypeTwo("rock")}
                          >
                            <Image
                              src="/types/rock_logo.webp"
                              alt="Rock Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("rock")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Rock
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("psychic")}
                            onClick={() => changeTypeTwo("psychic")}
                          >
                            <Image
                              src="/types/psychic_logo.webp"
                              alt="Psychic Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("psychic")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Psychic
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("ice")}
                            onClick={() => changeTypeTwo("ice")}
                          >
                            <Image
                              src="/types/ice_logo.webp"
                              alt="Ice Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("ice")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Ice
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("bug")}
                            onClick={() => changeTypeTwo("bug")}
                          >
                            <Image
                              src="/types/bug_logo.webp"
                              alt="Bug Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("bug")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Bug
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("ghost")}
                            onClick={() => changeTypeTwo("ghost")}
                          >
                            <Image
                              src="/types/ghost_logo.webp"
                              alt="Ghost Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("ghost")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Ghost
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("steel")}
                            onClick={() => changeTypeTwo("steel")}
                          >
                            <Image
                              src="/types/steel_logo.webp"
                              alt="Steel Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("steel")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Steel
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("dragon")}
                            onClick={() => changeTypeTwo("dragon")}
                          >
                            <Image
                              src="/types/dragon_logo.webp"
                              alt="Dragon Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("dragon")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Dragon
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("dark")}
                            onClick={() => changeTypeTwo("dark")}
                          >
                            <Image
                              src="/types/dark_logo.webp"
                              alt="Dark Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("dark")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Dark
                          </button>
                          <button
                            className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                            disabled={[typeOne, typeTwo].includes("fairy")}
                            onClick={() => changeTypeTwo("fairy")}
                          >
                            <Image
                              src="/types/fairy_logo.webp"
                              alt="Fairy Icon"
                              width={20}
                              height={20}
                              className={`me-1 ${
                                [typeOne, typeTwo].includes("fairy")
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            Fairy
                          </button>
                        </div>
                      )}

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
