# Next JS with Lucia Auth

You need a google app password form nodemailer to work.
I think you generate an app password via:
Google Account -> Security -> 2 Step Verification -> App Password

Some commands

```bash
npx drizzle-kit generate:pg
npx drizzle-kit push:pg
npm run db:push
npm run db:studio
# generate random secret
openssl rand -hex 12
```

## Creation History

The code in this repository is based on:

- https://github.com/ugurkellecioglu/next-14-lucia-auth-postgresql-drizzle-typescript-example
- https://youtu.be/JIIy7VkiTqU?si=gbWe8iYpDrvmCj-U
- https://youtu.be/UdwP5ep7TH8?si=986zj7Lgnp02TStn
- https://youtu.be/H-msUYltDbs?si=V5mskt0Q1LEKgUtE

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
npm i nodemailer
npm i -D @types/nodemailer
```

```bash
npm i arctic
```

## SQL

```sql
delete from session;
delete from email_verification;
delete from "user";
```

## Google

Go to google cloud console.
Select Project -> New Project -> Enter name -> click create project
Select create project -> api & services -> oauth consent screen
eternal -> email etc -> add scopes -> userinfo.email, userinfo.profile

credentials -> Create OAuth cliend Id -> applicaton type -> web app
name -> nextjs-auth-ex7, origins -> http://localhost:3000
redirect uri http://localhost:3000/api/oauth/google

## GitHub

Create GitHub App via:

Settings -> Developer Settings -> Register a new GitHub App
then select Permissions & Events -> access email address
