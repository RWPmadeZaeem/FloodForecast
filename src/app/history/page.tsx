import Link from "next/link"

interface FloodEvent {
  year: number
  name: string
  summary: string
  livesLost: number
  damageCost: string
  wikipediaLink: string
}

const floodEvents: FloodEvent[] = [
  {
    year: 2022,
    name: "2022 Pakistan floods",
    summary: "Monsoon rains caused devastating floods affecting 33 million people.",
    livesLost: 1739,
    damageCost: "$40 billion",
    wikipediaLink: "https://en.wikipedia.org/wiki/2022_Pakistan_floods",
  },
  {
    year: 2010,
    name: "2010 Pakistan floods",
    summary: "Floods affected 20 million people and submerged one-fifth of the country's land.",
    livesLost: 2000,
    damageCost: "$43 billion",
    wikipediaLink: "https://en.wikipedia.org/wiki/2010_Pakistan_floods",
  },
  {
    year: 1992,
    name: "1992 Pakistan floods",
    summary: "Heavy monsoon rains caused widespread flooding in Punjab and Sindh provinces.",
    livesLost: 1834,
    damageCost: "$1 billion",
    wikipediaLink: "https://en.wikipedia.org/wiki/1992_Pakistan_floods",
  },
  {
    year: 1950,
    name: "1950 Pakistan floods",
    summary: "One of the worst floods in Pakistan's history, affecting Punjab and Sindh.",
    livesLost: 2910,
    damageCost: "Extensive (exact figure unavailable)",
    wikipediaLink: "https://en.wikipedia.org/wiki/1950_Pakistan_floods",
  },
]

export default function History() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Major Floods in Pakistan&apos;s History</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {floodEvents.map((event) => (
          <div key={event.year} className="border rounded-lg p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">
                {event.year}: {event.name}
              </h2>
              <p className="text-gray-600 mt-1">{event.summary}</p>
            </div>
            <div>
              <p className="mb-2">
                <strong>Lives lost:</strong> {event.livesLost.toLocaleString()}
              </p>
              <p className="mb-4">
                <strong>Estimated damage:</strong> {event.damageCost}
              </p>
              <Link
                href={event.wikipediaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-800 transition-colors"
              >
                Read more on Wikipedia
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
