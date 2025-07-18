'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default function Header() {
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link href="/public" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L13.09 8.26L19 7L14.74 12L19 17L13.09 15.74L12 22L10.91 15.74L5 17L9.26 12L5 7L10.91 8.26L12 2Z" fill="white"/>
                </svg>
              </div>
              <span className="text-xl font-semibold text-gray-900">Note Prompt</span>
            </Link>
          </div>

          {/* Navigation Icons */}
          <div className="flex items-center space-x-4">
            {isAuthenticated && (
              <>
                <Link href="/prompts">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-2">
                      <path d="M19 3H5C3.89 3 3 3.89 3 5V19C3 20.11 3.89 21 5 21H19C20.11 21 21 20.11 21 19V5C21 3.89 20.11 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
                      <path d="M7 7H17V9H7V7ZM7 11H17V13H7V11ZM7 15H14V17H7V15Z" fill="currentColor"/>
                    </svg>
                    管理
                  </Button>
                </Link>

                <Link href="/prompts/new">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-2">
                      <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="currentColor"/>
                    </svg>
                    新建
                  </Button>
                </Link>

                <Link href="/public">
                  <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-2">
                      <path d="M12 2C6.48 2 2 6.48 2 12S6.48 22 12 22 22 17.52 22 12 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12S7.59 4 12 4 20 7.59 20 12 16.41 20 12 20Z" fill="currentColor"/>
                      <path d="M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18C14.66 18 16.95 16.36 17.72 14H16.65C16.01 15.25 14.62 16 13 16C10.79 16 9 14.21 9 12S10.79 8 13 8C14.62 8 16.01 8.75 16.65 10H17.72C16.95 7.64 14.66 6 12 6Z" fill="currentColor"/>
                    </svg>
                    合集
                  </Button>
                </Link>
              </>
            )}

            {/* Language Switcher */}
            <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-1">
                <path d="M12.87 15.07L10.33 12.56L10.36 12.53C12.1 10.59 13.34 8.36 14.07 6H17V4H10V2H8V4H1V6H12.17C11.5 7.92 10.44 9.75 9 11.35C8.07 10.32 7.3 9.19 6.69 8H4.69C5.42 9.63 6.42 11.17 7.67 12.56L2.58 17.58L4 19L9 14L12.11 17.11L12.87 15.07ZM18.5 10H16.5L12 22H14L15.12 19H19.87L21 22H23L18.5 10ZM15.88 17L17.5 12.67L19.12 17H15.88Z" fill="currentColor"/>
              </svg>
              中
            </Button>

            {/* User Avatar or Sign In */}
            {isAuthenticated ? (
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src="/avatar-placeholder.png" alt="User" />
                <AvatarFallback className="bg-purple-500 text-white text-sm">H</AvatarFallback>
              </Avatar>
            ) : (
              <Button size="sm" onClick={() => setIsAuthenticated(true)}>
                登录
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
