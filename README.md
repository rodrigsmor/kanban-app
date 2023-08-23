<h1 align="center">RUMA - Kanban App</h1>

## 📒 Introduction

Ruma is an agile Kanban-based project and task management web app. On this platform, you'll be able to create boards, distribute tasks across columns, and enhance productivity. The goal is to simplify project tracking, task allocation, deadlines, and routines.

---

## 📜 Table of contents

- [📒 Introduction](#-introduction)
- [📜 Table of contents](#-table-of-contents)
- [⚒️ Technologies](#️-technologies)
- [📥 Installation](#-installation)
- [⚙️ Settings](#️-settings)
- [🚀 How to run?](#-how-to-run)
  - [🏃🏽‍♂️ Runnning the application](#️-runnning-the-application)
  - [📚 Documentation](#-documentation)
  - [✅ Running tests](#-running-tests)
- [🌎 Support links and tutorials](#-support-links-and-tutorials)
- [👨🏽‍🦱 Author](#-author)

---

## ⚒️ Technologies

<div>
  <img src="https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white" alt="Docker"/>
  <img src="https://img.shields.io/badge/NPM-%23CB3837.svg?style=for-the-badge&logo=npm&logoColor=white" alt="NPM" />
  <img src="https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/figma-%23F24E1E.svg?style=for-the-badge&logo=figma&logoColor=white" alt="Figma" />
  <img src="https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white" alt="Typescript" />
  <img src="https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white" alt="Nest.js" />
  <img src="https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white" alt="Jest.js" />
  <img src="https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens" alt="JWT Authentication" />
  <img src="https://img.shields.io/badge/-Swagger-%23Clojure?style=for-the-badge&logo=swagger&logoColor=white" alt="Swagger" />
</div>

## 📥 Installation

To clone the application on your own device, simply run the following command in the terminal:

````
git clone https://github.com/rodrigsmor/kanban-app.git
`````

Make sure you have the git CLI installed correctly on your device. If you don't have git installed, you can find out how to do this by clicking [here](#🌎-support-links-and-tutorials).

## ⚙️ Settings

First of all, in order to run the application, you need to create an `.env` file in the root directory, in which you will define the application's environment variables.

Starting with the database connection environment variables, you will need to configure the following variables:

```
POSTGRES_DB=<the database name>
POSTGRES_USER=<the database username>
POSTGRES_PASSWORD=<the database user’s password>
DB_PORT=<the host port of your database>

# pay attention to setting the correct values in the database URL
DATABASE_URL=postgres://<database username>:<database password>@db:<database port>/<database name>?schema=public
```

Once the database variables have been defined, you will need to define other service environment variables related to security, service integration and other details that are important for the smooth running of the application.

````
# SERVICES PORTS
# You can set the ports however you like
API_PORT=<The pattern is 3000>
FRONTEND_PORT=<The patterns is 3001>

# SECURITY
JWT_SECRET_KEY=<set your secret key to make your API more secure!>
ENCRYPT_SALT=<set an ecrypt salt>
````

Whew! To complete our configuration, you just need to set some environment variables to allow the application to send emails using the `nodemailer` library. You will need to set the environment variables below:

````
# EMAIL SENDER
MAILER_USER=<your e-mail address>
MAILER_PASS=<your e-mail password>
MAILER_SENDER=<the e-mail address responsible for sending the e-mails>
MAILER_HOST=<the SMTP host based on your e-mail address>
````

Yahoo! You have finished configuring the application and should now be able to run it on your own device.

## 🚀 How to run?

With everything set up correctly, we can now run the application. First of all, you need to build the container images with docker compose. To do this, run the following command in your terminal (remember to run it in the root directory of the project):

````
docker-compose build
````

Once the image has been built, simply generate the migrations to the database using `prisma`, so that you can keep the data and have a more dynamic experience with the application. Just run the command below:

````
docker-compose run backend npx prisma migrate dev
````

That’s it! Now you can fully enjoy the application. Just run it on your own device.

---

### 🏃🏽‍♂️ Runnning the application

Now that all the settings have been made, you can proceed with running the application. To do this, simply run the following command:

````
docker-compose up
````

In case the migrations and other settings have been made, you can build and run the container image by executing the following command:

`````
docker-compose up --build
`````

---

### 📚 Documentation

In case you want to access the application's documentation, follow the steps above and, once the application is running, simply access the links below:

- API DOCUMENTATION: `http://localhost:3000/docs`

That's it! You now have access to an arsenal of information about how the application works and its routes.

---

### ✅ Running tests

If you want to run tests, just run the following commands:

````
# run backend tests
docker-compose run backend npm run test
````

## 🌎 Support links and tutorials

- 🔗 Nest.js documentation: https://docs.nestjs.com/
- 🔗 Next.js documentation: https://nextjs.org/docs
- 🔗 Docker documentation: https://docs.docker.com/
- 🔗 SMTP nodemailer: https://nodemailer.com/smtp/
- 🔗 PostgreSQL docker host: https://hub.docker.com/_/postgres
- 🔗 Jest documentation: https://jestjs.io/docs/getting-started
- 🔗 GIT installing tutorial: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git

## 👨🏽‍🦱 Author

<img height="100px" src="https://avatars.githubusercontent.com/u/78985382?v=4" alt="Rodrigo profile picture">
<p>Developed with love by <b size="48px">Rodrigo Moreira</b> 
 💜🚀</p>

---

<div>
  <a href="mailto:rodrigsmor.pf@gmail.com">
    <img src="https://img.shields.io/badge/Gmail-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="gmail">
  </a>
  <a href="https://www.linkedin.com/in/psrodrigomoreira/">
    <img src="https://img.shields.io/badge/linkedin-%230077B5.svg?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn">
  </a>
  <a href="https://www.behance.net/rodrigsmor">
    <img src="https://img.shields.io/badge/Behance-1769ff?style=for-the-badge&logo=behance&logoColor=white" alt="behance">
  </a>
  <a href="https://dev.to/psrodrigs">
    <img src="https://img.shields.io/badge/dev.to-0A0A0A?style=for-the-badge&logo=devdotto&logoColor=white" alt="dev.to">
  </a>
</div>

[def]: #📒-introduction
