# Next JS with Lucia Auth

Some commands

```bash
npm run db:push
npm run db:studio
# generate random secret
openssl rand -hex 12
```

## Creation History

The code in this repository is based on:

- https://youtu.be/JIIy7VkiTqU?si=gbWe8iYpDrvmCj-U

## Code History

```bash
npx create-next-app@latest
cd nextjs-auth-ex7
npm install lucia oslo
npm install @lucia-auth/adapter-drizzle
npm i drizzle-orm @vercel/postgres
npm i -D drizzle-kit
npm i pg
npm install dotenv --save
npx shadcn-ui@latest init
npx shadcn-ui@latest add form button input toast card
npm install react-hook-form
npm install @hookform/resolvers
```

```bash
npm i jsonwebtoken
npm i -D @types/jsonwebtoken
npm i argon2
```

```bash
npm i usehooks-ts
```

## SQL

```sql
delete from session;
delete from email_verification;
delete from "user";
```
