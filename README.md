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

```javascript
githubData: {
login: 'carltonj2000',
id: 834149,
node_id: 'MDQ6VXNlcjgzNDE0OQ==',
avatar_url: 'https://avatars.githubusercontent.com/u/834149?v=4',
gravatar_id: '',
url: 'https://api.github.com/users/carltonj2000',
html_url: 'https://github.com/carltonj2000',
followers_url: 'https://api.github.com/users/carltonj2000/followers',
following_url: 'https://api.github.com/users/carltonj2000/following{/other_user}',
gists_url: 'https://api.github.com/users/carltonj2000/gists{/gist_id}',
starred_url: 'https://api.github.com/users/carltonj2000/starred{/owner}{/repo}',
subscriptions_url: 'https://api.github.com/users/carltonj2000/subscriptions',
organizations_url: 'https://api.github.com/users/carltonj2000/orgs',
repos_url: 'https://api.github.com/users/carltonj2000/repos',
events_url: 'https://api.github.com/users/carltonj2000/events{/privacy}',
received_events_url: 'https://api.github.com/users/carltonj2000/received_events',
type: 'User',
site_admin: false,
name: 'Carlton Joseph',
company: 'Software Developer',
blog: '',
location: 'Las Vegas, Nevada, USA',
email: null,
hireable: null,
bio: null,
twitter_username: null,
public_repos: 497,
public_gists: 3,
followers: 2,
following: 0,
created_at: '2011-06-07T02:40:52Z',
updated_at: '2024-02-26T22:34:10Z'
}
```
