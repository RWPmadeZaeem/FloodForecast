"use client"

import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 ">
      <div className=" px-20 py-12">
        <div className="flex flex-col md:flex-row justify-between">
          
          <div>
            <h3 className="font-semibold mb-3">About FloodForecast</h3>
            <p className="text-zinc-500 text-sm">
              Helping communities prepare for and respond to flooding events through predictive analytics and historical data.
            </p>
          </div>

          <div >
            <h3 className="font-semibold  mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-zinc-500 hover:text-zinc-950 text-sm transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-zinc-500 hover:text-zinc-950 text-sm transition-colors">
                  History
                </Link>
              </li>
              <li>
                <Link href="/predictor" className="text-zinc-500 hover:text-zinc-950 text-sm transition-colors">
                  Predictor
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Contact</h3>
            <p className="text-zinc-500 text-sm">
              Email: contact@floodforecast.com<br />
              Phone: (555) 123-4567
            </p>
          </div>

        </div>
        
        <div className="mt-8 pt-6 border-t border-zinc-200">
          <p className="text-center text-zinc-500 text-sm">
            © {new Date().getFullYear()} FloodForecast. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

