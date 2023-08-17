<h1 align="center">RUMA - Kanban App</h1>

## 📒 Introduction

Ruma is an agile Kanban-based project and task management web app. On this platform, you'll be able to create boards, distribute tasks across columns, and enhance productivity. The goal is to simplify project tracking, task allocation, deadlines, and routines.

---

## 📚 Table of contents


---

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


## 🌎 Support links and tutorials

- 🔗 Nest.js documentation: https://docs.nestjs.com/
- 🔗 Next.js documentation: https://nextjs.org/docs
- 🔗 Docker documentation: https://docs.docker.com/
- 🔗 SMTP nodemailer: https://nodemailer.com/smtp/
- 🔗 PostgreSQL docker host: https://hub.docker.com/_/postgres
- 🔗 Jest documentation: https://jestjs.io/docs/getting-started
- 🔗 GIT installing tutorial: https://git-scm.com/book/en/v2/Getting-Started-Installing-Git