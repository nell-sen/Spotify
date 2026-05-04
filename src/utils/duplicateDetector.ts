export const normalizeTitle = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const isDuplicate = (videoId: string, existingIds: Set<string>): boolean => {
  return existingIds.has(videoId);
};

export const isDuplicateByTitle = (title: string, existingTitles: string[]): boolean => {
  const normalized = normalizeTitle(title);
  return existingTitles.some(t => normalizeTitle(t) === normalized);
};
