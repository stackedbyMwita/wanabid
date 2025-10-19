'use client'

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

const BreadCrumb = () => {
  const router = useRouter();
  return (
    <nav className="max-w-7xl mx-auto px-4 flex items-center gap-4 text-gray-500 m-2" aria-label="Breadcrumb">
      <button
        className='rounded-lg p-2 bg-gray-100 hover:bg-gray-200'
        onClick={() => router.back()}
      >
        <ChevronLeft />
      </button>
      <h1 className='text-sm text-gray-400'>
        Home / Products / Product Details
      </h1>
    </nav>
  )
}

export default BreadCrumb