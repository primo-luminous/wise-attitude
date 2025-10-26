'use client';

import { useRouter } from 'next/navigation';
import { useEffect, FC } from 'react';

const HomePage: FC = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace('/main');
  }, [router]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-transparent border-gray-400" />
    </div>
  );
};

export default HomePage;
