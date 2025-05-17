import { sendSMS } from '@/lib/twilio';
import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request) {
  // Verify authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const DEMO_DATE = '2023-05-29';
  
  try {
    // Get users (limit to 5 for demo)
    const { data: users, error } = await supabase
      .from('users')
      .select('phone, province')
      .limit(5);

    if (error) throw error;

    // Send alerts
    const results = await Promise.all(
      users.map(user => {
        const message = `🚨 Flood Alert for ${DEMO_DATE}: High risk in ${user.province}. ` +
                      `This is an automated demo alert.`;
        return sendSMS(user.phone, message);
      })
    );

    return NextResponse.json({
      success: true,
      date: DEMO_DATE,
      sent: results.filter(r => r.success).length,
      totalUsers: users.length
    });
  } catch (error) {
    console.error('Auto alert error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}