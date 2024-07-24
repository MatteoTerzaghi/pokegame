export enum ServerErrorCode {
  InvalidAPIToken = "1000",
  SubscriberIDNotFound = "1001",
  InstallationIDNotFound = "1002",
  StoreTypeNotFound = "1003",
  WrongStoreType = "1004",
  GenericError = "1005",
  InvalidAppID = "1006",
  Unauthorized = "1007",
  ProductIDNotFound = "1008",
  AppIDNotFound = "1009",
  InvalidParameter = "1010",
  AppleReceiptStatusError = "1011",
  InvalidFieldValueError = "1012",
  InvalidFieldNameError = "1013",
}

export enum ServerStatus {
  OK = 200,
  Created = 201,
  NoContent = 204,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  NotFound = 404,
  ServiceUnavailable = 503,
}

interface ResponseError {
  code: ServerErrorCode;
  description: string;
}

export interface BaseResponse {
  error?: ResponseError;
  status: ServerStatus;
}

export interface NameAndAPI {
  name: string;
  url: string;
}

export interface PokedexNumber {
  entry_number: number;
  pokedex: NameAndAPI;
}

export interface PokeName {
  name: string;
  language: NameAndAPI;
}

export interface FlavorTextEntries {
  flavor_text: string;
  language: NameAndAPI;
  version: NameAndAPI;
}

export interface FormDescription {
  description: string;
  language: NameAndAPI;
}

export interface Genera {
  genus: string;
  language: NameAndAPI;
}

export interface Varieties {
  is_default: string;
  pokemon: NameAndAPI;
}

export interface Type {
  slot: number;
  type: NameAndAPI;
}

export interface Pokemon {
  slot: number;
  pokemon: NameAndAPI;
}

export interface PokeInfo extends BaseResponse {
  id: number;
  name: string;
  order: number;
  gender_rate: number;
  capture_rate: number;
  base_happiness: number;
  is_baby: boolean;
  is_legendary: boolean;
  is_mythical: boolean;
  hatch_counter: number;
  has_gender_differences: boolean;
  forms_switchable: boolean;
  pokedex_numbers: PokedexNumber[];
  color: NameAndAPI;
  evolves_from_species: NameAndAPI;
  evolution_chain: NameAndAPI;
  generation: NameAndAPI;
  names: PokeName[];
  flavor_text_entries: FlavorTextEntries[];
  form_descriptions: FormDescription[];
  genera: Genera[];
  varieties: Varieties[];

  types: Type[];
  evolutionStage: number;

  pokeImg: string;

  // growth_rate: {
  //   name: "medium";
  //   url: "https://pokeapi.co/api/v2/growth-rate/2/";
  // };
  // egg_groups: [
  //   {
  //     name: "bug";
  //     url: "https://pokeapi.co/api/v2/egg-group/3/";
  //   }
  // ];
  // shape: {
  //   name: "squiggle";
  //   url: "https://pokeapi.co/api/v2/pokemon-shape/2/";
  // };
  // habitat: null;
}

export interface EvolveDetails {
  gender: number;
  held_item: NameAndAPI;
  item: NameAndAPI;
  known_move: NameAndAPI;
  known_move_type: NameAndAPI;
  location: NameAndAPI;
  min_affection: number;
  min_beauty: number;
  min_happiness: number;
  min_level: number;
  needs_overworld_rain: boolean;
  party_species: NameAndAPI;
  party_type: NameAndAPI;
  relative_physical_stats: number;
  time_of_day: string;
  trade_species: NameAndAPI;
  trigger: NameAndAPI;
  turn_upside_down: boolean;
}
export interface EvolveTo {
  evolution_details: EvolveDetails[];
  evolves_to: EvolveTo[];
  is_baby: boolean;
  species: NameAndAPI;
}

export interface ChainEvolutionInfo {
  baby_trigger_item: NameAndAPI;
  chain: EvolveTo;
  id: number;
}

export interface TypesInfo extends BaseResponse {
  id: number;
  name: string;
  pokemon: Pokemon[];
}

export interface GenerationsInfo extends BaseResponse {
  id: number;
  name: string;
  pokemon_species: NameAndAPI[];
}

export interface SomePokemon extends BaseResponse {
  count: number;
  results: NameAndAPI[];
}

export type GetTypesInfoResponse = TypesInfo;
export type GetGenerationsInfoResponse = GenerationsInfo;
export type GetPokemonInfoResponse = PokeInfo;
export type GetSomePokemonResponse = SomePokemon;
