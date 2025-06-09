const loaders = [
  { id: 1, imgSrc: "assets/loaders/heartythink.gif" },
  { id: 2, imgSrc: "assets/loaders/heartyread.gif" },
  { id: 3, imgSrc: "assets/loaders/heartynotes.gif" },
  { id: 4, imgSrc: "assets/loaders/heartysearch.gif" },
  { id: 5, imgSrc: "assets/loaders/heartycompare.gif" },
  { id: 6, imgSrc: "assets/loaders/heartywave.gif" },
];

export default function getRandomLoader() {
  const randomIndex = Math.floor(Math.random() * loaders.length);
  return loaders[randomIndex].imgSrc;
}
