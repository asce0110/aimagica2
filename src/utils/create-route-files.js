const fs = require('fs');
const path = require('path');

const routeTemplate = (routeName) => `import { Hono } from 'hono'

type Bindings = {
  CACHE: KVNamespace
  IMAGES: R2Bucket
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  NEXT_PUBLIC_R2_PUBLIC_URL: string
  ENVIRONMENT: string
}

export const ${routeName}Routes = new Hono<{ Bindings: Bindings }>()

// TODO: Implement ${routeName} routes
${routeName}Routes.get('/', async (c) => {
  return c.json({ message: '${routeName.charAt(0).toUpperCase() + routeName.slice(1)} endpoint' })
})
`;

const routes = [
  'dashboard',
  'styles', 
  'models',
  'upload',
  'featured'
];

const apiDir = path.join(__dirname, '../routes/api');

routes.forEach(routeName => {
  const filePath = path.join(apiDir, `${routeName}.ts`);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, routeTemplate(routeName));
    console.log(`✅ Created ${routeName}.ts`);
  } else {
    console.log(`⚠️  ${routeName}.ts already exists`);
  }
});

console.log('🎉 Route files creation completed!');