-- Introduction Data Definition queries (Postgres version)
-- By:  Mackenzie Jackson
-- Converted from MySQL for Neon/Postgres deployment

-- Drop tables if they already exist (in reverse dependency order)
DROP TABLE IF EXISTS BooksBorrowers CASCADE;
DROP TABLE IF EXISTS Checkouts CASCADE;
DROP TABLE IF EXISTS Staff CASCADE;
DROP TABLE IF EXISTS Borrowers CASCADE;
DROP TABLE IF EXISTS Books CASCADE;
DROP TABLE IF EXISTS Libraries CASCADE;

-- Create Libraries table
CREATE TABLE Libraries (
    libraryID SERIAL PRIMARY KEY,
    libraryName VARCHAR(50) NOT NULL,
    libraryAddress VARCHAR(50) NOT NULL,
    contactNumber VARCHAR(50) NOT NULL
);

-- Create Books table
CREATE TABLE Books (
    bookID SERIAL PRIMARY KEY,
    bookTitle VARCHAR(50) NOT NULL,
    bookAuthor VARCHAR(50) NOT NULL,
    bookGenre VARCHAR(50) NOT NULL,
    librariesLibraryID INT NOT NULL,
    CONSTRAINT fkBooksLibrary FOREIGN KEY (librariesLibraryID) REFERENCES Libraries(libraryID) ON DELETE CASCADE
);

-- Create Borrowers table
CREATE TABLE Borrowers (
    userID SERIAL PRIMARY KEY,
    userName VARCHAR(50) NOT NULL,
    userAddress VARCHAR(50) NOT NULL,
    userPhone VARCHAR(50) NOT NULL
);

-- Create Staff table
CREATE TABLE Staff (
    staffID SERIAL PRIMARY KEY,
    staffName VARCHAR(50) NOT NULL,
    staffTitle VARCHAR(50) NOT NULL,
    staffExtension INT,
    librariesLibraryID INT,
    CONSTRAINT fkStaffLibrary FOREIGN KEY (librariesLibraryID) REFERENCES Libraries(libraryID) ON DELETE SET NULL
);

-- Create Checkouts table
CREATE TABLE Checkouts (
    checkoutID SERIAL PRIMARY KEY,
    dueDate DATE NOT NULL,
    librariesLibraryID INT NOT NULL,
    booksBookID INT NOT NULL,
    borrowersUserID INT NOT NULL,
    staffStaffID INT NOT NULL,
    CONSTRAINT fkCheckoutsLibrary FOREIGN KEY (librariesLibraryID) REFERENCES Libraries(libraryID) ON DELETE CASCADE,
    CONSTRAINT fkCheckoutsBook FOREIGN KEY (booksBookID) REFERENCES Books(bookID) ON DELETE RESTRICT,
    CONSTRAINT fkCheckoutsBorrower FOREIGN KEY (borrowersUserID) REFERENCES Borrowers(userID) ON DELETE CASCADE,
    CONSTRAINT fkCheckoutsStaff FOREIGN KEY (staffStaffID) REFERENCES Staff(staffID) ON DELETE RESTRICT
);

-- Create BooksBorrowers table
CREATE TABLE BooksBorrowers (
    booksBookID INT NOT NULL,
    borrowersUserID INT NOT NULL,
    PRIMARY KEY (booksBookID, borrowersUserID),
    CONSTRAINT fkBooksHasBorrowersBook FOREIGN KEY (booksBookID) REFERENCES Books(bookID) ON DELETE CASCADE,
    CONSTRAINT fkBooksHasBorrowersBorrower FOREIGN KEY (borrowersUserID) REFERENCES Borrowers(userID) ON DELETE CASCADE
);

-- Insert data into Libraries table
INSERT INTO Libraries (libraryName, libraryAddress, contactNumber)
VALUES
('Mansfield', '123 E. Broadway St, Sunnyside, OR, 93643', '503-234-9999'),
('Bluehill', '560 Wyatt Ave, Sunnyside, OR, 94645', '503-234-9923'),
('Lovewood', '62 S. Goven St, Sunnyside, OR, 94222', '503-234-9876'),
('Harrington', '236 Blackwater Blvd, Sunnyside, OR, 93432', '503-234-9944');

-- Insert data into Books table
INSERT INTO Books (bookTitle, bookAuthor, bookGenre, librariesLibraryID)
VALUES
('Python Crash Course', 'Eric Matthes', 'Nonfiction', 2),
('Solito: a memoir', 'Javier Zamora', 'Biography', 1),
('The Seven Year Slip', 'Ashley Poston', 'Fiction', 1),
('A Mind Awake', 'C.S. Lewis', 'Nonfiction', 4);

-- Insert data into Borrowers table
INSERT INTO Borrowers (userName, userAddress, userPhone)
VALUES
('Mary Johnson', '232 Westgate Ave, Sunnyside, OR, 95645', '503-244-5699'),
('James Bason', '1212 Apple Way, Sunnyside, OR, 94645', '503-454-2323'),
('Laury Hanns', '45 Maury Lane, Sunnyside, OR, 94223', '503-234-4343'),
('Edward Halle', '44 Ferry St, Sunnyside, OR, 93432', '503-576-9941');

-- Insert data into Staff table
INSERT INTO Staff (staffName, staffTitle, staffExtension, librariesLibraryID)
VALUES
('Amy Lane', 'Library Manager', 121, 3),
('Adam Ghuyen', 'Reference Librarian', NULL, 2),
('Brenda Cordelle', 'Book Buyer', 120, 2),
('Synthia Hart', 'Children Librarian', 124, 4);

-- Insert data into Checkouts table
INSERT INTO Checkouts (dueDate, librariesLibraryID, booksBookID, borrowersUserID, staffStaffID)
VALUES
('2024-10-28', 1, 1, 1, 1),
('2024-11-01', 2, 2, 2, 2),
('2024-11-05', 3, 3, 3, 3),
('2024-11-10', 4, 4, 4, 4);

-- Insert data into BooksBorrowers table
INSERT INTO BooksBorrowers (booksBookID, borrowersUserID)
VALUES
(1, 1),
(1, 2),
(2, 3),
(3, 4);
