"use server";

export const fetchAnime = async (page: number, search?: string, kind?: string) => {
    let url = "";
    if (search || kind) {
       url = `https://api.jikan.moe/v4/anime?page=${page}&limit=8`;
       if (search) url += `&q=${encodeURIComponent(search)}`;
       if (kind) url += `&type=${encodeURIComponent(kind)}`;
    } else {
       url = `https://api.jikan.moe/v4/top/anime?page=${page}&limit=8`;
    }

    try {
      const response = await fetch(url, { cache: 'no-store' });
      const res = await response.json();
      
      return res.data || [];
    } catch (error) {
      console.error(error);
      return [];
    }
};