import Link from "next/link";

interface FloodEvent {
  year: number;
  name: string;
  summary: string;
  livesLost: number;
  damageCost: string;
  wikipediaLink: string;
  imageUrl: string;
}

const floodEvents: FloodEvent[] = [
  {
    year: 2022,
    name: "2022 Pakistan floods",
    summary: "Monsoon rains caused devastating floods affecting 33 million people.",
    livesLost: 1739,
    damageCost: "$40 billion",
    wikipediaLink: "https://en.wikipedia.org/wiki/2022_Pakistan_floods",
    imageUrl: "/2022-floods.jpg",
  },
  {
    year: 2010,
    name: "2010 Pakistan floods",
    summary: "Floods affected 20 million people and submerged one-fifth of the country's land.",
    livesLost: 2000,
    damageCost: "$43 billion",
    wikipediaLink: "https://en.wikipedia.org/wiki/2010_Pakistan_floods",
    imageUrl: "/2010-floods.jpg",
  },
  {
    year: 1992,
    name: "1992 Pakistan floods",
    summary: "Heavy monsoon rains caused widespread flooding in Punjab and Sindh provinces.",
    livesLost: 1834,
    damageCost: "$1 billion",
    wikipediaLink: "https://en.wikipedia.org/wiki/1992_Pakistan_floods",
    imageUrl: "/1992-floods.jpg",
  },
  {
    year: 1950,
    name: "1950 Pakistan floods",
    summary: "One of the worst floods in Pakistan's history, affecting Punjab and Sindh.",
    livesLost: 2910,
    damageCost: "Extensive (exact figure unavailable)",
    wikipediaLink: "https://en.wikipedia.org/wiki/1950_Pakistan_floods",
    imageUrl: "/1950-floods.jpg",
  },
];

export default function History() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-10">Major Floods in Pakistan&apos;s History</h1>
      <div className="relative w-full max-w-4xl mx-auto">
        <div className="absolute left-1/2 w-1 bg-gray-300 h-full transform -translate-x-1/2"></div>
        {floodEvents.map((event, index) => (
          <div key={event.year} className={`relative flex items-center mb-10 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}> 
            <div className="w-6 h-6 bg-orange-500 rounded-full absolute left-1/2 transform -translate-x-1/2"></div>
            <div className="w-[calc(50%-2rem)] bg-white border border-gray-300 rounded-lg shadow-lg p-6 relative">
              <img src={event.imageUrl} alt={event.name} className="w-full h-48 object-cover rounded-lg shadow-md mb-4" />
              <h2 className="text-xl font-semibold text-black">{event.year}: {event.name}</h2>
              <p className="text-gray-600 mt-1">{event.summary}</p>
              <p className="mt-2 text-sm text-black"><strong>Lives lost:</strong> {event.livesLost.toLocaleString()}</p>
              <p className="text-sm text-black"><strong>Estimated damage:</strong> {event.damageCost}</p>
              <Link href={event.wikipediaLink} target="_blank" rel="noopener noreferrer" className="block mt-2 text-orange-600 hover:text-orange-800 transition-colors">
                Read more
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
