import Link from "next/link";

export default function Pokeball({
  title,
  desc,
  redirect,
  spin,
}: {
  title: string;
  desc: string;
  redirect?: string;
  spin?: boolean;
}) {
  const pokeballClassName = `border border-black rounded-full h-[250px] w-[250px] overflow-hidden relative mb-4 ${
    spin ? "animate-spin" : ""
  }`;
  const retComponent = redirect ? (
    <Link href={`/${redirect}`}>
      <button className={pokeballClassName}>
        <div className="h-1/2 bg-[#f00] border-b-8 border-black flex justify-center content-center flex-col text-white font-semibold text-lg">
          <span className="mt-3">{title}</span>
        </div>
        <div className="h-1/2 border-t-8 border-black pt-4">{desc}</div>

        <div className="border-8 border-black absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white h-[50px] w-[50px] rounded-full flex items-center justify-center">
          <div className="border border-black bg-white h-[20px] w-[20px] rounded-full"></div>
        </div>
      </button>
    </Link>
  ) : (
    <button className={pokeballClassName}>
      <div className="h-1/2 bg-[#f00] border-b-8 border-black flex justify-center content-center flex-col text-white font-semibold text-lg">
        <span className="mt-3">{title}</span>
      </div>
      <div className="h-1/2 border-t-8 border-black pt-4">{desc}</div>

      <div className="border-8 border-black absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white h-[50px] w-[50px] rounded-full flex items-center justify-center">
        <div className="border border-black bg-white h-[20px] w-[20px] rounded-full"></div>
      </div>
    </button>
  );
  return retComponent;
}
