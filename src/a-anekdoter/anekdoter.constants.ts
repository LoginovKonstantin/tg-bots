export const URLS = {
  AnekdotRuMemDay: 'https://www.anekdot.ru/release/mem/day/',
  AnekdotRuJokeDay: 'https://www.anekdot.ru/release/anekdot/day/',
  Boobs: (clientId: string) =>
    `https://api.unsplash.com/photos/random?client_id=${clientId}&query=lingerie&query=hot`,
};
