# TaskGoblin 

TaskGoblin is a full-stack task management application built as a group
project during a Spring Boot course. The goal is to provide one place
for organizing everyday tasks, lists, notes and calendar events, while
giving us practical experience building a complete application with a
Java/Spring Boot backend, a relational database and a browser-based
frontend.

## Features

TaskGoblin currently includes:

-   User registration and login
-   JWT-based authentication
-   User profile and settings
-   Tasks with due dates, priorities and status
-   Recurring tasks
-   Complete, undo completion and reopen task flows
-   Task lists with progress tracking
-   Notes
-   Calendar events and calendar search
-   Daily overview
-   Categories in the backend/API
-   Random quotes on the home page
-   Swedish and English UI translations
-   Light/dark theme settings
-   Account and password management

## Tech stack

### Backend

-   Java 21
-   Spring Boot 4.0.6
-   Spring Web MVC
-   Spring Data JPA
-   Hibernate
-   Spring Security
-   Bean Validation
-   JJWT
-   BCrypt password hashing
-   Maven

### Database

-   MySQL

### Frontend

-   HTML
-   CSS
-   Vanilla JavaScript
-   Fetch API

The frontend is served as static resources by the same Spring Boot
application.

## Architecture

The backend follows a layered structure:

``` text
HTTP request
     ↓
Security / JWT filter
     ↓
Controller
     ↓
Service
     ↓
Repository
     ↓
JPA / Hibernate
     ↓
MySQL
```

Responses travel back through the application and are exposed to the
frontend using DTOs.

The main packages are:

``` text
src/main/java/com/example/taskgoblin/
├── controller/     REST endpoints
├── dto/            Request and response data
├── exception/      Exceptions and global error handling
├── mapper/         Entity ↔ DTO mapping
├── model/          JPA entities and enums
├── repository/     Database access with Spring Data JPA
├── security/       Spring Security and JWT filter
└── service/        Application and business logic
```

Static frontend files are located in:

``` text
src/main/resources/static/
├── css/
├── images/
├── js/
└── *.html
```

## How a request moves through TaskGoblin

For example, when the frontend requests a user's tasks:

1.  JavaScript sends an HTTP request.
2.  Spring Security checks the JWT for protected API requests.
3.  `TaskController` receives the request.
4.  `TaskService` handles the application logic and user-specific rules.
5.  `TaskRepository` accesses the database through Spring Data JPA.
6.  Hibernate maps database rows to Java entities.
7.  The application maps entities to DTOs.
8.  Spring returns the response as JSON.
9.  JavaScript renders the result in the UI.

This separation keeps HTTP handling, business logic and database access
in different layers.

## Security

TaskGoblin uses Spring Security with stateless JWT authentication.

When a user logs in:

1.  The email and password are sent to `POST /auth/login`.
2.  Spring authenticates the credentials.
3.  The backend generates a signed JWT.
4.  The frontend uses the token for authenticated API requests.
5.  `JwtAuthFilter` validates the token before protected requests reach
    the controllers.

Passwords are encoded with BCrypt before storage.

Public resources include the authentication endpoints and static
frontend assets. Other backend requests require authentication.

> Never commit database credentials or JWT secrets to the repository.
> Configure secrets through environment variables or another local
> configuration method.

## Main API areas

The application contains endpoints for:

| Area | Base path | Examples |
| --- | --- | --- |
| Authentication | `/auth` | Register and login |
| Tasks | `/tasks` | Create, read, update, delete, complete and reopen tasks |
| Lists | `/lists` | Manage task lists, list tasks and progress |
| Notes | `/notes` | Create, read, update and delete notes |
| Calendar | `/calendar` | Calendar overview and search |
| Events | `/events` | Create, update and delete events |
| User | `/user` | Profile, password, settings and account |
| Categories | `/categories` | Category management |
| Quotes | `/api/quotes` | Random quote |

## Recurring functionality

TaskGoblin supports recurring tasks, lists and calendar events.

Recurring items can be configured with recurrence settings so that new 
occurrences can be created according to the selected schedule. The recurrence 
logic is handled in the service layer, keeping application rules separate from 
HTTP handling and database access.

## Validation and error handling

Incoming data is validated with Jakarta Bean Validation.

The backend also contains a global exception handler and custom
exceptions for cases such as:

-   Resource not found
-   Invalid due dates
-   Invalid events
-   Invalid recurring tasks
-   Attempting to complete an already completed item
-   Attempting to reopen an already open item

This allows the API to return structured error responses instead of
exposing internal exceptions to the frontend.

## Running the project locally

### Requirements

Install:

-   Java 21
-   MySQL
-   Maven, or use the included Maven Wrapper

### 1. Clone the repository

``` bash
git clone <repository-url>
cd taskgoblin
```

### 2. Configure MySQL

TaskGoblin currently uses MySQL and Hibernate schema validation:

``` properties
spring.jpa.hibernate.ddl-auto=validate
```

This means a compatible database schema must already exist before the
application starts.

Configure the database connection using these values:

``` text
DB_URL
DB_USERNAME
DB_PASSWORD
```

The application also requires JWT configuration corresponding to:

``` text
jwt.secret
jwt.expiration
```

Keep these values outside version control.

### 3. Start the application

macOS/Linux:

``` bash
./mvnw spring-boot:run
```

Windows:

``` powershell
mvnw.cmd spring-boot:run
```

When Spring Boot has started, open:

``` text
http://localhost:8080
```

### 4. Create an account

Use the registration page to create a user, then log in to access
TaskGoblin.

## Frontend pages

The application includes dedicated views for:

-   Home
-   Today's Overview
-   Tasks
-   Lists
-   Notes
-   Calendar
-   Profile
-   Settings
-   Login and registration

The frontend communicates with the Spring Boot backend using the Fetch
API.

## Testing

The project currently contains a basic Spring Boot context test:

``` bash
./mvnw test
```

Automated test coverage is currently limited and is an area for future
development.

## Current limitations and future improvements

TaskGoblin was developed as a course project and there are still areas
that could be expanded, including:

-   More automated unit and integration tests
-   Further development of category functionality in the frontend
-   Improved production-ready database migration/setup
-   Expanded sharing and reminder functionality
-   Calendar day and week views that display scheduled events as a proper timetable
-   Further accessibility and UX testing
-   Production deployment configuration

Some domain models for future functionality, such as reminders and
sharing, already exist in the project but are not presented here as
completed user-facing features.

## What we learned

The project gave us practical experience with the complete flow of a
Spring Boot application, including:

-   Designing REST APIs
-   Separating controllers, services and repositories
-   Mapping relational data with JPA/Hibernate
-   Working with entity relationships
-   Using DTOs and mapper classes
-   Validation and global exception handling
-   Authentication with Spring Security and JWT
-   Connecting a Java backend to MySQL
-   Connecting a vanilla JavaScript frontend to a REST API
-   Collaborating with Git and GitHub

## Team

TaskGoblin was developed as a group project by:

-   Caroline Enggren
-   Josefine Asplund
-   Mette Karlsson
-   Sofie Törnqvist

------------------------------------------------------------------------

Built with Java, Spring Boot and an unreasonable number of
goblin-related decisions. 
