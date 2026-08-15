import AnimeCard, { AnimeProp } from "@/components/AnimeCard";
import AnimeManager from "@/components/AnimeManager";
import { fetchAnime } from "./action";

async function Home() {
  const data = await fetchAnime(1); 
  return (
    <main className="sm:p-16 py-16 px-8 flex flex-col gap-10">
      <h2 className="text-3xl text-white font-bold">Explore Anime</h2>
      <AnimeManager initialData={data} />
    </main>
  );
}

export default Home;
