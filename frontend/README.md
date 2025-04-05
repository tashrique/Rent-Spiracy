# Rent-Spiracy Frontend

This is the Next.js frontend for the Rent-Spiracy application, providing a multilingual interface for rental scam detection.

## Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local file with your configuration
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

The site will be available at http://localhost:3000

## Features

- Multilingual support (English, Spanish, Chinese, Hindi)
- Dark theme UI with accessible contrast
- Scam detection form
- Lease agreement analysis
- Responsive design

## Deployment to Vercel

### Automatic Deployment

1. Push your code to a GitHub repository
2. Import your project to Vercel
3. Vercel will automatically detect the Next.js configuration
4. Set the following environment variables:
   - `NEXT_PUBLIC_API_URL`: URL of your backend API (e.g. https://rent-spiracy-api.onrender.com)
5. Deploy

### Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel
   ```

4. For production deployment:
   ```bash
   vercel --prod
   ```

## Environment Variables

- `NEXT_PUBLIC_API_URL`: URL of the backend API

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
