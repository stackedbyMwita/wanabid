import React from 'react'

const Footer = () => {
  return (
    <div className="w-full bg-gray-800 text-gray-300 py-6 mt-12 hidden md:block">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <p className="text-sm">&copy; {new Date().getFullYear()} Wanabid. All rights reserved.</p>
        <div className="flex space-x-4 mt-4 md:mt-0">
          <a href="/about" className="text-sm hover:text-white">About</a>
          <a href="/contact" className="text-sm hover:text-white">Contact</a>
          <a href="/privacy" className="text-sm hover:text-white">Privacy Policy</a>
          <a href="/terms" className="text-sm hover:text-white">Terms of Service</a>
        </div>
      </div>
    </div>
  )
}

export default Footer
