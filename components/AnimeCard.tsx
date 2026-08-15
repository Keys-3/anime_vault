import Image from "next/image";
import Link from "next/link";
import { MotionDiv } from "./MotionDiv"

export interface AnimeProp {
  mal_id: number;
  title: string;
  title_english: string;
  images: {
    jpg: {
      large_image_url: string;
    };
  };
  type: string;
  episodes: number;
  score: number;
}

interface Prop {
  anime: AnimeProp;
  index: number;
}
const variants ={
  hidden: {opacity:0},
  visible: {opacity:1},
}
function AnimeCard({ anime, index }: Prop) {
  const animeName = anime.title_english || anime.title;
  
  return (
    <Link href={`/anime/${anime.mal_id}`} className="w-full">
      <MotionDiv
        variants={variants}
        initial="hidden"
        animate="visible"
        transition={{delay: index*0.25, ease:"easeInOut", duration: 0.5,}}
        viewport={{amount:0}}
        className="max-w-sm rounded relative w-full group hover:scale-105 hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer z-0 hover:z-10">
        <div className="relative w-full h-[37vh]">
          <Image
            src={anime.images.jpg.large_image_url}
            alt={animeName}
            fill
            className="rounded-xl group-hover:brightness-110 transition-all duration-300 object-cover"
          />
        </div>
        <div className="py-4 flex flex-col gap-3">
          <div className="flex justify-between items-center gap-1">
            <h2 className="font-bold text-white text-xl line-clamp-1 w-full group-hover:text-red-500 transition-colors duration-300" title={animeName}>
              {animeName}
            </h2>
            <div className="py-1 px-2 bg-[#161921] rounded-sm group-hover:bg-red-600 transition-colors duration-300">
              <p className="text-white text-sm font-bold capitalize">
                {anime.type || "Anime"}
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="flex flex-row gap-2 items-center">
              <Image
                src="/episodes.svg"
                alt="episodes"
                width={20}
                height={20}
                className="object-contain"
              />
              <p className="text-base text-white font-bold">
                {anime.episodes || "?"}
              </p>
            </div>
            <div className="flex flex-row gap-2 items-center">
              <Image
                src="/star.svg"
                alt="star"
                width={18}
                height={18}
                className="object-contain"
              />
              <p className="text-base font-bold text-[#FFAD49]">{anime.score || "N/A"}</p>
            </div>
          </div>
        </div>
      </MotionDiv>
    </Link>
  );
}

export default AnimeCard;
