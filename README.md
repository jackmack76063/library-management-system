# 📚 Library Management System

A full-stack web application for managing library operations — books, borrowers, staff, and checkouts — across multiple library branches, with a normalized relational database and a live deployment.

**🔗 Live demo:** [library-management-system-nkt5.onrender.com](https://library-management-system-nkt5.onrender.com)

## Overview

This project manages a multi-branch library system: tracking which books live at which branch, who's borrowed what, which staff member processed a checkout, and the many-to-many relationships between books and the borrowers who've read them. It supports full CRUD (Create, Read, Update, Delete) operations across every entity, backed by a properly normalized relational schema with enforced referential integrity.

## Schema Design

The database models 6 entities:

- **Libraries** — branch locations
- **Books** — tied to a specific library
- **Borrowers** — library patrons
- **Staff** — employees, tied to a specific library
- **Checkouts** — records linking a book, borrower, staff member, and library together for a single checkout event
- **BooksBorrowers** — a junction table modeling the many-to-many relationship between books and borrowers over time

Foreign key behavior was deliberately chosen per relationship rather than defaulted:
- Deleting a **Library** cascades to its Books and sets Staff's library reference to `NULL` (staff aren't deleted, just unassigned)
- Deleting a **Book** or **Staff member** is *restricted* if they're tied to an active Checkout — protecting historical checkout records from being orphaned

## Tech Stack

**Backend:** Node.js, Express
**Database:** PostgreSQL (originally built on MySQL for a course project, migrated for deployment)
**Views:** Handlebars (`.hbs`)
**Styling:** [Pico.css](https://picocss.com/)
**Hosting:** [Render](https://render.com) (app) + [Neon](https://neon.tech) (serverless Postgres)

## Notable Technical Details

- **Parameterized queries** throughout every CRUD route to prevent SQL injection — no user input is ever concatenated directly into a SQL string
- **Connection pooling** so the app can handle multiple simultaneous requests without one blocking another
- **Concurrent queries** (`Promise.all`) on pages that need data from multiple tables at once, rather than querying sequentially
- **MySQL → Postgres migration**: swapped the database driver, converted `?` placeholders to Postgres's `$1, $2...` syntax, and resolved a case-sensitivity issue — Postgres lowercases unquoted column names by default, so every `SELECT` explicitly aliases columns back to the camelCase the views expect

## Running Locally

```bash
cd source_code
npm install
```

Create a `.env` file (see `.env.example`) with your own Postgres connection string, then run the schema:

```bash
# In your Postgres client of choice, run:
database/DDL_postgres.sql
```

Start the app:

```bash
node app.js
```

## Collaboration Note

This was originally built as a two-person project for CS 340 (Introduction to Databases) at Oregon State University. The deployment migration (Postgres conversion, Neon/Render setup, bug fixes) was completed independently afterward.
