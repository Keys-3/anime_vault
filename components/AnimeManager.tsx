"use client";

import { useState, useEffect, useRef } from "react";
import { fetchAnime } from "@/app/action";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import AnimeCard, { AnimeProp } from "@/components/AnimeCard";

interface Props {
  initialData: AnimeProp[];
}

const categories = [
  { value: "", label: "All Categories" },
  { value: "tv", label: "TV" },
  { value: "movie", label: "Movie" },
  { value: "ova", label: "OVA" },
  { value: "ona", label: "ONA" },
  { value: "special", label: "Special" },
];

export default function AnimeManager({ initialData }: Props) {
  const [data, setData] = useState<AnimeProp[]>(initialData);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(2);
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true);

  const { ref, inView } = useInView();

  // Reset and fetch when search or category changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const fetchNewData = async () => {
      setLoading(true);
      try {
        const res = await fetchAnime(1, search, category);
        setData(res);
        setPage(2);
      } catch (error) {
        console.error("Failed to fetch anime", error);
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timer = setTimeout(() => {
      fetchNewData();
    }, 1000);

    return () => clearTimeout(timer);
  }, [search, category]);

  // Load more when scrolled to bottom
  useEffect(() => {
    if (inView && !loading) {
      const loadMore = async () => {
        const res = await fetchAnime(page, search, category);
        if (res.length > 0) {
          setData((prev) => [...prev, ...res]);
          setPage((prev) => prev + 1);
        }
      };
      loadMore();
    }
  }, [inView, page, search, category, loading]);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-8 w-full justify-between items-center bg-[#161921] p-4 rounded-xl shadow-lg">
        <div className="w-full sm:w-2/3 flex items-center bg-[#0F1117] rounded-lg px-4 border border-transparent focus-within:border-red-500 transition-colors duration-300">
          <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
          <input
            type="text"
            placeholder="Search anime..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-white px-4 py-3 focus:outline-none transition-all duration-300"
          />
        </div>
        <div className="w-full sm:w-1/3 relative">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full bg-[#0F1117] text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 transition-all duration-300 cursor-pointer appearance-none border border-transparent"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
             <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      {loading && data.length === 0 ? (
        <section className="flex justify-center items-center w-full min-h-[50vh]">
          <Image src="/spinner.svg" alt="spinner" width={56} height={56} className="object-contain" />
        </section>
      ) : data.length === 0 ? (
        <section className="flex flex-col justify-center items-center w-full min-h-[50vh] gap-4">
          <p className="text-white text-xl font-bold">No anime found!</p>
          <div className="flex gap-4">
            <button 
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetchAnime(1, search, category);
                  setData(res);
                  setPage(2);
                } finally {
                  setLoading(false);
                }
              }}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => {
                setSearch("");
                setCategory("");
              }}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </section>
      ) : (
        <>
          <section className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-10">
            {data.map((item: AnimeProp, index: number) => (
              <AnimeCard key={item.mal_id} anime={item} index={index} />
            ))}
          </section>
          
          <section className="flex justify-center items-center w-full mt-10">
            <div ref={ref}>
              <Image
                src="/spinner.svg"
                alt="spinner"
                width={56}
                height={56}
                className="object-contain"
              />
            </div>
          </section>
        </>
      )}
    </>
  );
}
