"use server";

export const fetchAnime = async (page: number, search?: string, kind?: string) => {
    const query = `
      query($page: Int, $search: String, $format: MediaFormat) {
        Page(page: $page, perPage: 8) {
          media(search: $search, format: $format, type: ANIME, sort: POPULARITY_DESC) {
            id
            title {
              english
              romaji
            }
            coverImage {
              large
            }
            format
            episodes
            averageScore
          }
        }
      }
    `;

    let format: string | undefined = undefined;
    if (kind) {
      const formatMap: Record<string, string> = {
        tv: "TV", movie: "MOVIE", ova: "OVA", ona: "ONA", special: "SPECIAL"
      };
      format = formatMap[kind.toLowerCase()];
    }

    const variables: any = { page };
    if (search) variables.search = search;
    if (format) variables.format = format;

    try {
      const response = await fetch("https://graphql.anilist.co", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ query, variables }),
        cache: "no-store",
      });

      const res = await response.json();
      
      const media = res.data?.Page?.media || [];
      
      // Map to AnimeProp interface
      return media.map((item: any) => ({
        mal_id: item.id,
        title: item.title.romaji,
        title_english: item.title.english || item.title.romaji,
        images: {
          jpg: {
            large_image_url: item.coverImage.large
          }
        },
        type: item.format || "TV",
        episodes: item.episodes || 0,
        score: item.averageScore ? item.averageScore / 10 : 0 // Anilist score is 0-100, we want 0-10
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
};