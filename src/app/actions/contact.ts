'use server';

import { z } from 'zod';
import { sendContactEmail } from '@/lib/email';

const ContactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function handleContactForm(
  prevState: unknown,
  formData: FormData
): Promise<{ success: boolean; message: string; errors?: Record<string, string> }> {
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    subject: formData.get('subject') as string,
    message: formData.get('message') as string,
  };

  const validation = ContactSchema.safeParse(rawData);

  if (!validation.success) {
    const errors: Record<string, string> = {};
    validation.error.issues.forEach((issue) => {
      if (issue.path[0]) {
        errors[issue.path[0] as string] = issue.message;
      }
    });
    return {
      success: false,
      message: 'Validation failed. Please correct the fields.',
      errors,
    };
  }

  const result = await sendContactEmail(validation.data);
  return result;
}
