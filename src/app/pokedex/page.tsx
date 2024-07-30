"use client";

import BackendService from "@/backend/backendFunc";
import Card from "@/components/card";
import Pokeball from "@/components/pokeball";
import { similarityPercentage } from "@/utilitiesFunc/utilitiesFuncs";
import { faChevronDown, faHome } from "@fortawesome/pro-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useLayoutEffect, useState } from "react";

export default function Pokedex() {
  const howManyPokemon = 1025;

  const [typeOne, changeTypeOne] = useState("");
  const [typeTwo, changeTypeTwo] = useState("");
  const [pokemonName, changePokemonName] = useState("");
  const [gen, changeGen] = useState(0);

  const [showTypesDropdown, changeShowTypesDropdown] = useState(0); //0 dont show 1 show first type dropdown 2 second

  const [hoveredPokemonName, changeHoveredPokemonName] = useState("");

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

  const [similarNamesPokemon, changeSimilarNamesPokemon] = useState<string[]>(
    []
  );

  useLayoutEffect(() => {
    function onClickFunc(ev: any) {
      if (ev.target.id !== "pokemonChoice" && similarNamesPokemon.length > 0) {
        changeSimilarNamesPokemon([]);

        (document.getElementById("pokemonNameSrc") as any).value = "";
      }

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
  }, [similarNamesPokemon, showTypesDropdown]);

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

    if (typeTwo && typeTwo !== "no_second_type") {
      newFilteredPokemon = newFilteredPokemon.filter((pokemon) =>
        pokemon.types.includes(typeTwo)
      );
    } else if (typeTwo && typeTwo === "no_second_type") {
      newFilteredPokemon = newFilteredPokemon.filter(
        (pokemon) =>
          pokemon.types.includes(typeOne) && pokemon.types.length === 1
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
    <div className="grid grid-cols-12 py-20">
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
              <div className="col-span-full mb-4 relative">
                <div className="font-semibold text-lg">Filter by name</div>
                <input
                  className="w-[210px] outline-none"
                  id="pokemonNameSrc"
                  type="text"
                  placeholder="Search the pokemon name"
                  onChange={(e) => {
                    const insertString = e.target.value
                      .replaceAll(" ", "-")
                      .toLowerCase();
                    const newSimilarPokemon: string[] = [];
                    allPokemon
                      .map((pokemon) => pokemon.name)
                      .forEach((pokeName) => {
                        if (
                          newSimilarPokemon.length <= 5 &&
                          (similarityPercentage(pokeName, insertString) >= 50 ||
                            pokeName.includes(insertString))
                        ) {
                          newSimilarPokemon.push(pokeName);
                        }
                      });
                    changeSimilarNamesPokemon(newSimilarPokemon);
                    changePokemonName(insertString);
                  }}
                />
                {similarNamesPokemon.length > 0 && (
                  <div className="absolute bg-white rounded-3xl shadow-lg border py-2 w-64 top-14 z-10">
                    {similarNamesPokemon.map((name) => (
                      <button
                        key={name}
                        className="capitalize block px-5 py-2"
                        id="pokemonChoice"
                        onClick={() => {
                          if (typeOne) {
                            (document.getElementById("typeOne") as any).value =
                              "";
                            changeTypeOne("");
                          }

                          if (typeTwo) {
                            (document.getElementById("typeTwo") as any).value =
                              "";
                            changeTypeTwo("");
                          }

                          if (gen) {
                            (
                              document.getElementById("generationPicker") as any
                            ).value = 0;
                            changeGen(0);
                          }

                          if (pokemonName) {
                            (
                              document.getElementById("pokemonNameSrc") as any
                            ).value = "";
                            changePokemonName("");
                          }

                          const newFilteredArray: {
                            id: string;
                            name: string;
                            types: string[];
                          }[] = [];

                          const thatPokemon = allPokemon.find(
                            (pokemon) => pokemon.name === name
                          );

                          if (thatPokemon) {
                            newFilteredArray.push(thatPokemon);
                          }

                          changeFilteredPokemon(newFilteredArray);
                          changeSimilarNamesPokemon([]);
                        }}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-span-full mb-4">
                <div className="font-semibold text-lg">Filter by types</div>
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
                <div className="flex relative">
                  <button
                    id="typePicker"
                    className="capitalize w-52 text-start flex justify-between items-center disabled:text-gray-400"
                    disabled={!typeOne}
                    onClick={() => changeShowTypesDropdown(2)}
                  >
                    <span>
                      {typeTwo === "" || typeTwo === "no_second_type"
                        ? typeTwo === ""
                          ? "Any Type"
                          : "Has Only One Type"
                        : typeTwo}
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
                        Any Type
                      </button>
                      <button
                        className="col-auto flex items-center py-1 disabled:text-gray-400 w-full"
                        disabled={typeTwo === "no_second_type"}
                        onClick={() => {
                          changeTypeTwo("no_second_type");
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

                  {typeTwo && typeTwo !== "no_second_type" && (
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
              <div className="col-span-full mb-4">
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

              <div className="col-span-full flex justify-center items-center">
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
            <div className="grid lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-3 grid-cols-1">
              {filteredPokemon.map((pokemon) => (
                <div
                  className="col-span-1 my-10 text-center relative"
                  key={pokemon.id}
                  onMouseEnter={() => changeHoveredPokemonName(pokemon.name)}
                  onMouseLeave={() => changeHoveredPokemonName("")}
                >
                  {hoveredPokemonName === pokemon.name && (
                    <Image
                      alt="shiny particles"
                      src="/shiny_particles.png"
                      className="top-0 right-0 absolute"
                      width={50}
                      height={50}
                    />
                  )}
                  <Image
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${
                      hoveredPokemonName === pokemon.name
                        ? `shiny/${pokemon.id}`
                        : `${pokemon.id}`
                    }.png`}
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
