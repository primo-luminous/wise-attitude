import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Copyright */}
        <div className="text-sm text-gray-600">
          © 2024 WiseAttitude. All rights reserved.
        </div>

        {/* Footer Links */}
        <div className="flex items-center space-x-6">
          <Link 
            href="/main/privacy" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link 
            href="/main/terms" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Terms of Service
          </Link>
          <Link 
            href="/main/help" 
            className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            Help & Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
