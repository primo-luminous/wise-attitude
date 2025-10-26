import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/app/actions/auth';

export async function GET(request: NextRequest) {
  try {
    // ตรวจสอบ authentication
    const user = await getCurrentUser();
    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    // สร้าง ReadableStream สำหรับ Server-Sent Events
    const stream = new ReadableStream({
      start(controller) {
        // ส่ง initial connection message
        const sendEvent = (data: { type: string; message?: string; timestamp: string; notifications?: unknown[] }) => {
          const eventData = `data: ${JSON.stringify(data)}\n\n`;
          controller.enqueue(new TextEncoder().encode(eventData));
        };

        // ส่ง connection established message
        sendEvent({
          type: 'connected',
          message: 'Connected to notification stream',
          timestamp: new Date().toISOString()
        });

        // ตั้งค่า interval เพื่อตรวจสอบการแจ้งเตือนใหม่
        const checkInterval = setInterval(async () => {
          try {
            // ตรวจสอบการแจ้งเตือนใหม่จากฐานข้อมูล
            const { prisma } = await import('@/lib/prisma');
            
            const notifications = await prisma.notification.findMany({
              where: {
                employeeId: user.id,
                createdAt: {
                  gte: new Date(Date.now() - 10000) // ตรวจสอบ 10 วินาทีที่ผ่านมา
                }
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 5
            });

            if (notifications.length > 0) {
              // ส่งการแจ้งเตือนใหม่ไปยัง client
              sendEvent({
                type: 'new_notification',
                notifications: notifications,
                timestamp: new Date().toISOString()
              });
            }
          } catch (error) {
            console.error('Error checking notifications:', error);
          }
        }, 5000); // ตรวจสอบทุก 5 วินาที

        // Cleanup function
        const cleanup = () => {
          clearInterval(checkInterval);
          controller.close();
        };

        // ตรวจสอบการปิด connection
        request.signal.addEventListener('abort', cleanup);
        
        // ตั้งค่า timeout เพื่อปิด connection หลังจาก 30 นาที
        setTimeout(cleanup, 30 * 60 * 1000);
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control'
      }
    });

  } catch (error) {
    console.error('SSE Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
