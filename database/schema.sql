-- StayHub Database Schema
-- Run setup.js (npm run setup) to create DB and seed data automatically
-- Or run this file manually after creating the ReservaHotelera database

USE ReservaHotelera;
GO

CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL,
    email NVARCHAR(150) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    role NVARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    phone NVARCHAR(20),
    created_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Hotels (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(150) NOT NULL,
    description NVARCHAR(MAX),
    address NVARCHAR(200),
    neighborhood NVARCHAR(100),
    city NVARCHAR(100) NOT NULL,
    stars INT NOT NULL CHECK (stars BETWEEN 1 AND 5),
    rating DECIMAL(3,1) DEFAULT 0,
    review_count INT DEFAULT 0,
    price_from DECIMAL(12,2) NOT NULL,
    image_url NVARCHAR(500),
    amenities NVARCHAR(500),
    is_active BIT DEFAULT 1,
    created_at DATETIME DEFAULT GETDATE()
);
GO

CREATE TABLE Rooms (
    id INT IDENTITY(1,1) PRIMARY KEY,
    hotel_id INT NOT NULL REFERENCES Hotels(id),
    name NVARCHAR(100) NOT NULL,
    type NVARCHAR(20) NOT NULL CHECK (type IN ('single', 'double', 'suite', 'deluxe')),
    capacity INT NOT NULL,
    price_per_night DECIMAL(12,2) NOT NULL,
    description NVARCHAR(MAX),
    image_url NVARCHAR(500),
    is_available BIT DEFAULT 1
);
GO

CREATE TABLE Bookings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL REFERENCES Users(id),
    room_id INT NOT NULL REFERENCES Rooms(id),
    hotel_id INT NOT NULL REFERENCES Hotels(id),
    check_in DATE NOT NULL,
    check_out DATE NOT NULL,
    guests INT NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    guest_name NVARCHAR(100) NOT NULL,
    guest_email NVARCHAR(150) NOT NULL,
    guest_phone NVARCHAR(20),
    special_requests NVARCHAR(500),
    created_at DATETIME DEFAULT GETDATE()
);
GO
