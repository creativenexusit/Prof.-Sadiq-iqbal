import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import { Profile } from '@/models/Profile';
import { Publication } from '@/models/Publication';
import { AcademicItem } from '@/models/AcademicItem';
import {
  initialProfileData,
  initialPublicationsData,
  initialAcademicItemsData,
} from '@/lib/seedData';

export async function GET() {
  try {
    await connectDB();

    // 1. Seed or update Profile
    let profile = await Profile.findOne();
    if (!profile) {
      profile = await Profile.create(initialProfileData);
    }

    // 2. Seed Publications if empty
    const pubCount = await Publication.countDocuments();
    if (pubCount === 0) {
      await Publication.insertMany(initialPublicationsData);
    }

    // 3. Seed AcademicItems if empty
    const itemCount = await AcademicItem.countDocuments();
    if (itemCount === 0) {
      await AcademicItem.insertMany(initialAcademicItemsData);
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with initial academic portfolio data.',
      counts: {
        profile: 1,
        publications: await Publication.countDocuments(),
        academicItems: await AcademicItem.countDocuments(),
      },
    });
  } catch (error: unknown) {
    console.error('Seed error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error during database seeding';
    return NextResponse.json(
      {
        success: false,
        error: message,
        note: 'Make sure MONGODB_URI in .env.local is reachable and valid.',
      },
      { status: 500 }
    );
  }
}
