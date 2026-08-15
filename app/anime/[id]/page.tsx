import Image from "next/image";
import Link from "next/link";
import EpisodePlayer from "@/components/EpisodePlayer";

interface PageProps {
  params: { id: string };
}

async function getAnimeDetails(id: string) {
  const query = `
    query($id: Int) {
      Media(id: $id, type: ANIME) {
        id
        title { english romaji }
        coverImage { large }
        format
        episodes
        averageScore
        status
        description(asHtml: false)
        trailer { id site }
      }
    }
  `;
  try {
    const res = await fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, variables: { id: parseInt(id) } }),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    const media = json.data?.Media;
    if (!media) return null;
    
    return {
      mal_id: media.id,
      title: media.title.romaji,
      title_english: media.title.english || media.title.romaji,
      images: { jpg: { large_image_url: media.coverImage.large } },
      type: media.format || "Anime",
      episodes: media.episodes,
      score: media.averageScore ? media.averageScore / 10 : null,
      status: media.status,
      synopsis: media.description,
      trailer: media.trailer?.site === "youtube" ? { youtube_id: media.trailer.id } : null
    };
  } catch (e) {
    return null;
  }
}

export default async function AnimeDetails({ params }: PageProps) {
  const anime = await getAnimeDetails(params.id);

  if (!anime) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-white">
        <h1 className="text-3xl font-bold mb-4">Anime not found or API rate limit reached</h1>
        <Link href="/" className="text-red-500 hover:underline">Go back home</Link>
      </div>
    );
  }

  const episodesCount = anime.episodes || 12; // Fallback to 12 if null
  const animeName = anime.title_english || anime.title;

  return (
    <main className="max-w-7xl mx-auto px-8 py-16 text-white flex flex-col gap-12">
      <Link href="/" className="text-red-500 hover:text-red-400 transition-colors flex items-center gap-2 mb-2 w-fit bg-[#161921] px-4 py-2 rounded-lg shadow-sm border border-gray-800 hover:border-red-500/50">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        Back to Explore
      </Link>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row gap-10 items-start">
        <div className="relative w-full md:w-[350px] aspect-[2/3] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-gray-800 shrink-0 group">
          <Image
            src={anime.images?.jpg?.large_image_url || "/placeholder.jpg"}
            alt={animeName}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
        </div>
        
        <div className="flex-1 flex flex-col gap-5">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400 mb-2">{animeName}</h1>
          </div>
          
          <div className="flex flex-wrap gap-3 my-2">
            <span className="py-1.5 px-4 bg-[#161921] rounded-full text-sm font-bold capitalize text-white shadow-sm border border-gray-700 tracking-wide">
              {anime.type || "Anime"}
            </span>
            <span className="py-1.5 px-4 bg-[#161921] rounded-full text-sm font-bold text-[#FFAD49] shadow-sm border border-gray-700 flex items-center gap-1.5 tracking-wide">
              <Image src="/star.svg" alt="star" width={16} height={16} />
              {anime.score || "N/A"}
            </span>
            <span className="py-1.5 px-4 bg-[#161921] rounded-full text-sm font-bold text-gray-300 shadow-sm border border-gray-700 tracking-wide">
              {anime.status}
            </span>
            {anime.rating && (
              <span className="py-1.5 px-4 bg-red-900/40 text-red-400 rounded-full text-sm font-bold shadow-sm border border-red-900/50 tracking-wide">
                {anime.rating.split(" ")[0]}
              </span>
            )}
          </div>

          <div className="text-gray-300 leading-relaxed text-base bg-[#161921]/60 backdrop-blur-sm p-6 md:p-8 rounded-2xl shadow-xl border border-gray-800 mt-2">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              Synopsis
            </h3>
            {anime.synopsis ? (
              <div className="prose prose-invert max-w-none">
                 <p>{anime.synopsis}</p>
              </div>
            ) : (
              <p className="italic text-gray-500">No description available for this anime.</p>
            )}
          </div>
        </div>
      </div>

      <EpisodePlayer anime={anime} episodesCount={episodesCount} />
    </main>
  );
}
