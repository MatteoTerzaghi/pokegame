import {
  BaseResponse,
  ChainEvolutionInfo,
  GetPokemonInfoResponse,
  PokeInfo,
} from "./backendTypes";

async function authHttpCall(
  url: string,
  method: "POST" | "GET" | "PUT" | "DELETE"
  // headersValue?: { [key: string]: string },
  // body?: any
) {
  // const headers = new Headers();

  // if (headersValue) {
  //   Object.keys(headersValue).forEach((hKey) => {
  //     headers.append(hKey, headersValue[hKey]);
  //   });
  // }

  const resp = await fetch(url, {
    method,
    // headers,
    // body,
  });

  if (!resp.ok) {
    const returnErrResp: BaseResponse = {
      error: {
        code: `${resp.status}` as any,
        description: resp.statusText,
      },
      status: resp.status,
    };

    return returnErrResp;
  }

  return resp.json();
}

const BackendService = {
  async getPokemonInfo(pokeId: number): Promise<GetPokemonInfoResponse> {
    const a = await authHttpCall(
      `https://pokeapi.co/api/v2/pokemon-species/${pokeId}`,
      "GET"
    ).then(async (pokeAdvancedInfo: PokeInfo) => {
      const res = { ...pokeAdvancedInfo };
      res.pokeImg = `https://img.pokemondb.net/sprites/home/normal/${res.name}.png`;
      if (pokeAdvancedInfo?.name) {
        return await authHttpCall(
          `https://pokeapi.co/api/v2/pokemon/${pokeId}`,
          "GET"
        ).then(async (pokeType) => {
          if (pokeType?.types) {
            res.types = pokeType.types;
          }

          if (res?.evolution_chain?.url) {
            return await authHttpCall(`${res.evolution_chain.url}`, "GET").then(
              (chainEvo: ChainEvolutionInfo) => {
                if (chainEvo?.chain?.species?.name === res.name) {
                  res.evolutionStage = 1;
                } else if (
                  chainEvo?.chain?.evolves_to
                    ?.map((evolve_to) => evolve_to?.species?.name)
                    ?.includes(res.name)
                ) {
                  res.evolutionStage = 2;
                } else {
                  res.evolutionStage = 3;
                }

                return res;
              }
            );
          } else {
            res.evolutionStage = 0;
            return res;
          }
        });
      } else {
        return res;
      }
    });

    return a;
  },
};

export default BackendService;
