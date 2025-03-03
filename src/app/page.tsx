import { FaChartLine, FaDatabase, FaExclamationTriangle } from 'react-icons/fa'; // Importing icons from FontAwesome
export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-[url('/heroImage.jpg')] bg-cover bg-center flex items-center justify-center h-[60vh] py-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-5xl font-bold text-zinc-100 mb-6">
                Flood Prediction in Endangered Areas of Pakistan
              </h1>
              <p className="text-xl text-zinc-200 mb-8">
                Leveraging advanced analytics and historical data to protect vulnerable communities from flood disasters.
              </p>
              <div className="flex gap-4">
                <a href="/predictor" className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors">
                  Try Predictor
                </a>
                <a href="/history" className=" text-white bg-zinc-900 px-6 py-3 rounded-lg hover:bg-zinc-800 transition-colors shadow-lg">
                  View History
                </a>
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 ">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Predictive Analytics Card */}
            <div className="p-8 border-2 rounded-lg min-h-[300px] flex flex-col items-center justify-center">
              <div className="flex justify-center mb-4">
                <FaChartLine className="text-4xl text-orange-600" /> {/* Icon for Predictive Analytics */}
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">Predictive Analytics</h3>
              <p className="text-zinc-600 text-center">
                Advanced machine learning models to forecast potential flood events.
              </p>
            </div>

            {/* Historical Data Card */}
            <div className="p-8 border-2 rounded-lg min-h-[300px] flex flex-col items-center justify-center">
              <div className="flex justify-center mb-4">
                <FaDatabase className="text-4xl text-orange-600" /> {/* Icon for Historical Data */}
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">Historical Data</h3>
              <p className="text-zinc-600 text-center">
                Comprehensive database of past flood events and their impacts.
              </p>
            </div>

            {/* Risk Assessment Card */}
            <div className="p-8 border-2 rounded-lg min-h-[300px] flex flex-col items-center justify-center">
              <div className="flex justify-center mb-4">
                <FaExclamationTriangle className="text-4xl text-orange-600" /> {/* Icon for Risk Assessment */}
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">Risk Assessment</h3>
              <p className="text-zinc-600 text-center">
                Detailed analysis of vulnerable areas and population centers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-zinc-800 text-white py-24 h-[40vh]">
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
