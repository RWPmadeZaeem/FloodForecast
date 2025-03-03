"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";




const navLinks = [
  { name: "Home", href: "/" },
  { name: "History", href: "/history" },
  { name: "Predictor", href: "/predictor" },

]

export default function Header() {
    const path = usePathname();
  return (
    <header className="border-b border-zinc-200">
      <div className="px-20 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">

            <Link href="/">
                <Image 
                    src="/logoFlood.png" 
                    alt="Logo"
                
            width={180}
            height={180}
          /> 
          </Link>

        </div>

        <nav>
          <ul className="flex items-center gap-6">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className={`${path === link.href ? 'text-orange-600 font-semibold' : 'text-zinc-600'} hover:text-orange-600 transition-colors`}>
                  {link.name}
                </Link>
              </li>
            ))}
            
          </ul>
        </nav>
      </div>
    </header>
  );
}