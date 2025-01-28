
export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-blue-50 py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-5xl font-bold text-zinc-900 mb-6">
                Flood Prediction in Endangered Areas of Pakistan
              </h1>
              <p className="text-xl text-zinc-600 mb-8">
                Leveraging advanced analytics and historical data to protect vulnerable communities from flood disasters.
              </p>
              <div className="flex gap-4">
                <a href="/predictor" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  Try Predictor
                </a>
                <a href="/history" className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
                  View History
                </a>
              </div>
            </div>
            <div className="md:w-1/2">
              <img src="/pakistan-map.png" alt="Pakistan Map" className="rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Predictive Analytics</h3>
              <p className="text-zinc-600">Advanced machine learning models to forecast potential flood events.</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Historical Data</h3>
              <p className="text-zinc-600">Comprehensive database of past flood events and their impacts.</p>
            </div>
            <div className="p-6 border rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Risk Assessment</h3>
              <p className="text-zinc-600">Detailed analysis of vulnerable areas and population centers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-zinc-900 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-lg mb-8">Join us in protecting communities through data-driven flood prediction.</p>
          <a href="/login" className="bg-white text-zinc-900 px-8 py-3 rounded-lg hover:bg-zinc-100 transition-colors">
            Sign Up Now
          </a>
        </div>
      </section>
    </main>
  );
}
