/**
 * StayHub Database Setup Script
 * Run with: npm run setup
 * This script creates the database, tables, and seeds all data with real bcrypt hashes.
 */

const sql = require('mssql');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const masterConfig = {
  server: process.env.DB_SERVER || 'localhost',
  database: 'master',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

const dbConfig = {
  server: process.env.DB_SERVER || 'localhost',
  database: 'ReservaHotelera',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function setup() {
  let masterPool, dbPool;

  try {
    console.log('Conectando a SQL Server (master)...');
    masterPool = await sql.connect(masterConfig);

    // Drop and recreate database
    console.log('Recreando base de datos ReservaHotelera...');
    await masterPool.request().query(`
      IF EXISTS (SELECT name FROM sys.databases WHERE name = 'ReservaHotelera')
      BEGIN
        ALTER DATABASE ReservaHotelera SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
        DROP DATABASE ReservaHotelera;
      END
    `);
    await masterPool.request().query('CREATE DATABASE ReservaHotelera');
    console.log('Base de datos creada.');
    await masterPool.close();

    console.log('Conectando a ReservaHotelera...');
    dbPool = await sql.connect(dbConfig);

    // Create tables
    console.log('Creando tablas...');
    await dbPool.request().query(`
      CREATE TABLE Users (
        id INT IDENTITY(1,1) PRIMARY KEY,
        name NVARCHAR(100) NOT NULL,
        email NVARCHAR(150) NOT NULL UNIQUE,
        password_hash NVARCHAR(255) NOT NULL,
        role NVARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        phone NVARCHAR(20),
        created_at DATETIME DEFAULT GETDATE()
      )
    `);

    await dbPool.request().query(`
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
      )
    `);

    await dbPool.request().query(`
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
      )
    `);

    await dbPool.request().query(`
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
      )
    `);

    console.log('Tablas creadas exitosamente.');

    // Generate bcrypt hashes
    console.log('Generando hashes de contraseñas...');
    const adminHash = await bcrypt.hash('Admin123!', 12);
    const user1Hash = await bcrypt.hash('User123!', 12);
    const user2Hash = await bcrypt.hash('User123!', 12);
    const user3Hash = await bcrypt.hash('User123!', 12);

    // Seed users
    console.log('Insertando usuarios...');
    await dbPool.request()
      .input('name', sql.NVarChar, 'Administrador StayHub')
      .input('email', sql.NVarChar, 'admin@hoteleria.com')
      .input('hash', sql.NVarChar, adminHash)
      .input('phone', sql.NVarChar, '3001234567')
      .query("INSERT INTO Users (name, email, password_hash, role, phone) VALUES (@name, @email, @hash, 'admin', @phone)");

    await dbPool.request()
      .input('name', sql.NVarChar, 'Carlos Mendoza')
      .input('email', sql.NVarChar, 'carlos@email.com')
      .input('hash', sql.NVarChar, user1Hash)
      .input('phone', sql.NVarChar, '3109876543')
      .query("INSERT INTO Users (name, email, password_hash, role, phone) VALUES (@name, @email, @hash, 'user', @phone)");

    await dbPool.request()
      .input('name', sql.NVarChar, 'María García')
      .input('email', sql.NVarChar, 'maria@email.com')
      .input('hash', sql.NVarChar, user2Hash)
      .input('phone', sql.NVarChar, '3155551234')
      .query("INSERT INTO Users (name, email, password_hash, role, phone) VALUES (@name, @email, @hash, 'user', @phone)");

    await dbPool.request()
      .input('name', sql.NVarChar, 'Juan Pérez')
      .input('email', sql.NVarChar, 'juan@email.com')
      .input('hash', sql.NVarChar, user3Hash)
      .input('phone', sql.NVarChar, '3187654321')
      .query("INSERT INTO Users (name, email, password_hash, role, phone) VALUES (@name, @email, @hash, 'user', @phone)");

    console.log('Usuarios creados: admin@hoteleria.com / Admin123! | carlos@email.com / User123!');

    // Seed hotels
    console.log('Insertando hoteles...');
    const hotels = [
      {
        name: 'Hotel Dann Carlton Bucaramanga',
        description: 'El hotel más lujoso de Bucaramanga, ubicado en el corazón de Cabecera del Llano. Ofrece habitaciones de clase mundial, restaurante gourmet, spa y piscina con vista panorámica a la ciudad.',
        address: 'Calle 47 # 28-27, Cabecera del Llano',
        neighborhood: 'Cabecera del Llano',
        city: 'Bucaramanga',
        stars: 5,
        rating: 9.2,
        review_count: 1847,
        price_from: 280000,
        image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
        amenities: 'WiFi,Piscina,Spa,Restaurante,Gimnasio,Parqueadero,Bar,Aire acondicionado,Room service,Lavandería'
      },
      {
        name: 'Hotel Chicamocha',
        description: 'Hotel tradicional en el centro de Bucaramanga con más de 40 años de historia. Ideal para viajeros de negocios y turistas que desean explorar el centro histórico y comercial de la ciudad.',
        address: 'Carrera 19 # 31-16, Centro',
        neighborhood: 'Centro',
        city: 'Bucaramanga',
        stars: 4,
        rating: 8.5,
        review_count: 923,
        price_from: 150000,
        image_url: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
        amenities: 'WiFi,Restaurante,Parqueadero,Sala de conferencias,Aire acondicionado,Room service'
      },
      {
        name: 'Hotel Ruitoque Condominio',
        description: 'Exclusivo hotel campestre en las alturas de Ruitoque Alto con impresionantes vistas al cañón del Chicamocha. Ambiente tranquilo, rodeado de naturaleza, perfecto para escapadas románticas.',
        address: 'Km 5 Vía Ruitoque, Ruitoque Alto',
        neighborhood: 'Ruitoque Alto',
        city: 'Bucaramanga',
        stars: 4,
        rating: 8.8,
        review_count: 412,
        price_from: 200000,
        image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
        amenities: 'WiFi,Piscina,Restaurante,Parqueadero,Zonas verdes,Aire acondicionado,Jacuzzi'
      },
      {
        name: 'Hotel Toscana Suites',
        description: 'Moderno hotel de suites en el sector de Cabecera, cerca de centros comerciales, restaurantes y vida nocturna. Habitaciones amplias con cocina incorporada, ideal para estancias largas.',
        address: 'Calle 54 # 32-15, Cabecera',
        neighborhood: 'Cabecera',
        city: 'Bucaramanga',
        stars: 3,
        rating: 8.1,
        review_count: 567,
        price_from: 120000,
        image_url: 'https://images.unsplash.com/photo-1596386461350-326ccb383e9f?w=800&q=80',
        amenities: 'WiFi,Parqueadero,Cocina,Aire acondicionado,Lavandería'
      },
      {
        name: 'Hotel Bolívar Inn',
        description: 'Acogedor hotel boutique en el Centro Histórico de Bucaramanga, a pasos del Parque García Rovira. Ambiente colonial con servicios modernos, perfecto para conocer la historia bumanguesa.',
        address: 'Calle 35 # 12-08, Centro Histórico',
        neighborhood: 'Centro Histórico',
        city: 'Bucaramanga',
        stars: 3,
        rating: 7.9,
        review_count: 334,
        price_from: 95000,
        image_url: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
        amenities: 'WiFi,Restaurante,Parqueadero,Aire acondicionado'
      },
      {
        name: 'Hotel Bucarica',
        description: 'Emblemático hotel frente al Parque Santander, uno de los más reconocidos de la ciudad. Cuenta con amplias instalaciones, restaurante, salones de eventos y una ubicación privilegiada en el corazón de Bucaramanga.',
        address: 'Carrera 19 # 36-32, Parque Santander',
        neighborhood: 'Parque Santander',
        city: 'Bucaramanga',
        stars: 4,
        rating: 8.3,
        review_count: 1102,
        price_from: 180000,
        image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
        amenities: 'WiFi,Restaurante,Bar,Sala de conferencias,Parqueadero,Gimnasio,Aire acondicionado,Room service'
      },
      {
        name: 'Hotel Virrey',
        description: 'Hotel familiar en el barrio La Victoria, con excelente relación calidad-precio. Ambiente tranquilo, habitaciones bien equipadas y amable atención al cliente. A 10 minutos del centro comercial Cacique.',
        address: 'Carrera 27 # 45-67, La Victoria',
        neighborhood: 'La Victoria',
        city: 'Bucaramanga',
        stars: 3,
        rating: 7.6,
        review_count: 228,
        price_from: 110000,
        image_url: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
        amenities: 'WiFi,Parqueadero,Aire acondicionado,Desayuno incluido'
      },
      {
        name: 'Hotel Cañaveral Suites',
        description: 'Moderno hotel en el dinámico sector de Cañaveral, uno de los más exclusivos de Bucaramanga. Cerca del estadio Alfonso López, centros comerciales y la zona Rosa. Ideal para viajeros exigentes.',
        address: 'Avenida Cañaveral # 48-50, Cañaveral',
        neighborhood: 'Cañaveral',
        city: 'Bucaramanga',
        stars: 4,
        rating: 8.6,
        review_count: 789,
        price_from: 160000,
        image_url: 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800&q=80',
        amenities: 'WiFi,Piscina,Restaurante,Parqueadero,Gimnasio,Aire acondicionado,Spa,Bar'
      }
    ];

    const hotelIds = [];
    for (const hotel of hotels) {
      const r = await dbPool.request()
        .input('name', sql.NVarChar, hotel.name)
        .input('description', sql.NVarChar, hotel.description)
        .input('address', sql.NVarChar, hotel.address)
        .input('neighborhood', sql.NVarChar, hotel.neighborhood)
        .input('city', sql.NVarChar, hotel.city)
        .input('stars', sql.Int, hotel.stars)
        .input('rating', sql.Decimal(3,1), hotel.rating)
        .input('review_count', sql.Int, hotel.review_count)
        .input('price_from', sql.Decimal(12,2), hotel.price_from)
        .input('image_url', sql.NVarChar, hotel.image_url)
        .input('amenities', sql.NVarChar, hotel.amenities)
        .query(`INSERT INTO Hotels (name, description, address, neighborhood, city, stars, rating, review_count, price_from, image_url, amenities, is_active)
                OUTPUT INSERTED.id
                VALUES (@name, @description, @address, @neighborhood, @city, @stars, @rating, @review_count, @price_from, @image_url, @amenities, 1)`);
      hotelIds.push(r.recordset[0].id);
    }
    console.log(`${hotels.length} hoteles insertados.`);

    // Seed rooms
    console.log('Insertando habitaciones...');
    const roomsData = [
      // Hotel Dann Carlton (hotelIds[0]) - 5 stars
      { hotel_idx: 0, name: 'Habitación Estándar Sencilla', type: 'single', capacity: 1, price: 280000, desc: 'Habitación elegante con cama doble, vista a la ciudad y amenidades de lujo.' },
      { hotel_idx: 0, name: 'Habitación Deluxe Doble', type: 'double', capacity: 2, price: 380000, desc: 'Amplia habitación con dos camas Queen y vista panorámica a Bucaramanga.' },
      { hotel_idx: 0, name: 'Suite Ejecutiva', type: 'suite', capacity: 2, price: 580000, desc: 'Suite de lujo con sala de estar, jacuzzi y servicio personalizado 24/7.' },
      { hotel_idx: 0, name: 'Suite Presidencial', type: 'suite', capacity: 4, price: 950000, desc: 'La mejor suite del hotel con terraza privada, sala comedor y mayordomo personal.' },

      // Hotel Chicamocha (hotelIds[1]) - 4 stars
      { hotel_idx: 1, name: 'Habitación Sencilla', type: 'single', capacity: 1, price: 150000, desc: 'Habitación confortable con cama sencilla, perfecta para viajeros de negocios.' },
      { hotel_idx: 1, name: 'Habitación Doble Estándar', type: 'double', capacity: 2, price: 210000, desc: 'Habitación con dos camas individuales, escritorio y baño completo.' },
      { hotel_idx: 1, name: 'Habitación Doble Superior', type: 'deluxe', capacity: 2, price: 280000, desc: 'Habitación premium con cama King, minibar y vista al centro de la ciudad.' },

      // Hotel Ruitoque (hotelIds[2]) - 4 stars
      { hotel_idx: 2, name: 'Cabaña Estándar', type: 'double', capacity: 2, price: 200000, desc: 'Acogedora cabaña con cama Queen, terraza y vista al jardín tropical.' },
      { hotel_idx: 2, name: 'Cabaña Deluxe con Jacuzzi', type: 'deluxe', capacity: 2, price: 320000, desc: 'Cabaña de lujo con jacuzzi privado y espectacular vista al cañón del Chicamocha.' },
      { hotel_idx: 2, name: 'Suite Honeymoon', type: 'suite', capacity: 2, price: 450000, desc: 'Suite romántica con decoración especial, pétalos de rosas y cena incluida.' },
      { hotel_idx: 2, name: 'Villa Familiar', type: 'deluxe', capacity: 4, price: 520000, desc: 'Amplia villa con dos habitaciones, sala y cocina, perfecta para familias.' },

      // Hotel Toscana (hotelIds[3]) - 3 stars
      { hotel_idx: 3, name: 'Suite Estudio', type: 'single', capacity: 1, price: 120000, desc: 'Suite compacta con cocina, ideal para estadías largas.' },
      { hotel_idx: 3, name: 'Suite Junior', type: 'double', capacity: 2, price: 165000, desc: 'Suite con sala integrada, cocina equipada y cama doble.' },
      { hotel_idx: 3, name: 'Suite Familiar', type: 'suite', capacity: 4, price: 240000, desc: 'Amplia suite de dos habitaciones con cocina completa y sala de estar.' },

      // Hotel Bolívar Inn (hotelIds[4]) - 3 stars
      { hotel_idx: 4, name: 'Habitación Sencilla Económica', type: 'single', capacity: 1, price: 95000, desc: 'Habitación limpia y cómoda en el corazón histórico de Bucaramanga.' },
      { hotel_idx: 4, name: 'Habitación Doble Colonial', type: 'double', capacity: 2, price: 145000, desc: 'Habitación con decoración colonial, camas dobles y baño privado.' },
      { hotel_idx: 4, name: 'Habitación Superior', type: 'deluxe', capacity: 3, price: 190000, desc: 'Habitación espaciosa con cama King y dos camas adicionales.' },

      // Hotel Bucarica (hotelIds[5]) - 4 stars
      { hotel_idx: 5, name: 'Habitación Estándar', type: 'single', capacity: 1, price: 180000, desc: 'Habitación clásica con vista al Parque Santander.' },
      { hotel_idx: 5, name: 'Habitación Doble', type: 'double', capacity: 2, price: 250000, desc: 'Habitación amplia con cama King y acceso al área de piscina.' },
      { hotel_idx: 5, name: 'Suite Junior Ejecutiva', type: 'suite', capacity: 2, price: 350000, desc: 'Suite para ejecutivos con sala de trabajo y minibar.' },
      { hotel_idx: 5, name: 'Suite Deluxe', type: 'deluxe', capacity: 3, price: 420000, desc: 'Lujosa suite con sala independiente y servicio de mayordomo.' },

      // Hotel Virrey (hotelIds[6]) - 3 stars
      { hotel_idx: 6, name: 'Habitación Sencilla', type: 'single', capacity: 1, price: 110000, desc: 'Habitación acogedora con todo lo necesario para una estancia cómoda.' },
      { hotel_idx: 6, name: 'Habitación Doble', type: 'double', capacity: 2, price: 160000, desc: 'Habitación familiar con dos camas y desayuno incluido.' },
      { hotel_idx: 6, name: 'Habitación Triple', type: 'deluxe', capacity: 3, price: 200000, desc: 'Habitación espaciosa para tres personas, ideal para grupos.' },

      // Hotel Cañaveral (hotelIds[7]) - 4 stars
      { hotel_idx: 7, name: 'Habitación Estándar Deluxe', type: 'double', capacity: 2, price: 160000, desc: 'Elegante habitación con cama King y acceso a piscina.' },
      { hotel_idx: 7, name: 'Suite Business', type: 'suite', capacity: 2, price: 280000, desc: 'Suite ejecutiva con área de trabajo, impresora y pantalla grande.' },
      { hotel_idx: 7, name: 'Suite Premium con Vista', type: 'suite', capacity: 2, price: 380000, desc: 'Suite de lujo con terraza y vista al estadio Alfonso López.' },
      { hotel_idx: 7, name: 'Suite Familiar Deluxe', type: 'deluxe', capacity: 4, price: 450000, desc: 'Espaciosa suite familiar con dos habitaciones y sala de estar.' }
    ];

    const roomIds = [];
    for (const room of roomsData) {
      const r = await dbPool.request()
        .input('hotel_id', sql.Int, hotelIds[room.hotel_idx])
        .input('name', sql.NVarChar, room.name)
        .input('type', sql.NVarChar, room.type)
        .input('capacity', sql.Int, room.capacity)
        .input('price', sql.Decimal(12,2), room.price)
        .input('desc', sql.NVarChar, room.desc)
        .query(`INSERT INTO Rooms (hotel_id, name, type, capacity, price_per_night, description, is_available)
                OUTPUT INSERTED.id
                VALUES (@hotel_id, @name, @type, @capacity, @price, @desc, 1)`);
      roomIds.push({ id: r.recordset[0].id, hotel_idx: room.hotel_idx, hotel_id: hotelIds[room.hotel_idx] });
    }
    console.log(`${roomsData.length} habitaciones insertadas.`);

    // Seed sample bookings
    console.log('Insertando reservas de ejemplo...');
    const today = new Date();
    const fmt = (d) => d.toISOString().split('T')[0];
    const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

    const bookings = [
      // Carlos (user id=2) - past confirmed booking at Hotel Dann Carlton
      {
        user_id: 2, room_id: roomIds[0].id, hotel_id: roomIds[0].hotel_id,
        check_in: fmt(addDays(today, -15)), check_out: fmt(addDays(today, -12)),
        guests: 1, total_price: 840000, status: 'confirmed',
        guest_name: 'Carlos Mendoza', guest_email: 'carlos@email.com', guest_phone: '3109876543'
      },
      // Carlos - upcoming booking at Hotel Bucarica
      {
        user_id: 2, room_id: roomIds[16].id, hotel_id: roomIds[16].hotel_id,
        check_in: fmt(addDays(today, 10)), check_out: fmt(addDays(today, 13)),
        guests: 1, total_price: 540000, status: 'confirmed',
        guest_name: 'Carlos Mendoza', guest_email: 'carlos@email.com', guest_phone: '3109876543'
      },
      // María (user id=3) - booking at Hotel Ruitoque
      {
        user_id: 3, room_id: roomIds[8].id, hotel_id: roomIds[8].hotel_id,
        check_in: fmt(addDays(today, 5)), check_out: fmt(addDays(today, 8)),
        guests: 2, total_price: 960000, status: 'confirmed',
        guest_name: 'María García', guest_email: 'maria@email.com', guest_phone: '3155551234',
        special_requests: 'Por favor preparar la habitación con pétalos de rosas, es nuestro aniversario.'
      },
      // María - cancelled booking
      {
        user_id: 3, room_id: roomIds[12].id, hotel_id: roomIds[12].hotel_id,
        check_in: fmt(addDays(today, -5)), check_out: fmt(addDays(today, -3)),
        guests: 2, total_price: 330000, status: 'cancelled',
        guest_name: 'María García', guest_email: 'maria@email.com', guest_phone: '3155551234'
      },
      // Juan (user id=4) - booking at Hotel Cañaveral
      {
        user_id: 4, room_id: roomIds[24].id, hotel_id: roomIds[24].hotel_id,
        check_in: fmt(addDays(today, 20)), check_out: fmt(addDays(today, 25)),
        guests: 2, total_price: 1900000, status: 'confirmed',
        guest_name: 'Juan Pérez', guest_email: 'juan@email.com', guest_phone: '3187654321'
      },
      // Juan - past booking
      {
        user_id: 4, room_id: roomIds[4].id, hotel_id: roomIds[4].hotel_id,
        check_in: fmt(addDays(today, -30)), check_out: fmt(addDays(today, -28)),
        guests: 1, total_price: 300000, status: 'confirmed',
        guest_name: 'Juan Pérez', guest_email: 'juan@email.com', guest_phone: '3187654321'
      }
    ];

    for (const b of bookings) {
      await dbPool.request()
        .input('user_id', sql.Int, b.user_id)
        .input('room_id', sql.Int, b.room_id)
        .input('hotel_id', sql.Int, b.hotel_id)
        .input('check_in', sql.Date, b.check_in)
        .input('check_out', sql.Date, b.check_out)
        .input('guests', sql.Int, b.guests)
        .input('total_price', sql.Decimal(12,2), b.total_price)
        .input('status', sql.NVarChar, b.status)
        .input('guest_name', sql.NVarChar, b.guest_name)
        .input('guest_email', sql.NVarChar, b.guest_email)
        .input('guest_phone', sql.NVarChar, b.guest_phone)
        .input('special_requests', sql.NVarChar, b.special_requests || null)
        .query(`INSERT INTO Bookings (user_id, room_id, hotel_id, check_in, check_out, guests, total_price,
                  status, guest_name, guest_email, guest_phone, special_requests)
                VALUES (@user_id, @room_id, @hotel_id, @check_in, @check_out, @guests, @total_price,
                  @status, @guest_name, @guest_email, @guest_phone, @special_requests)`);
    }
    console.log(`${bookings.length} reservas de ejemplo insertadas.`);

    await dbPool.close();

    console.log('\n========================================');
    console.log('  ✅ Base de datos configurada exitosamente');
    console.log('========================================');
    console.log('\nCredenciales de acceso:');
    console.log('  Admin:  admin@hoteleria.com  /  Admin123!');
    console.log('  User 1: carlos@email.com     /  User123!');
    console.log('  User 2: maria@email.com      /  User123!');
    console.log('  User 3: juan@email.com       /  User123!');
    console.log('\nEjecuta "npm run dev" en /backend para iniciar el servidor.');
    console.log('========================================\n');

  } catch (err) {
    console.error('Error en setup:', err);
    if (masterPool) await masterPool.close().catch(() => {});
    if (dbPool) await dbPool.close().catch(() => {});
    process.exit(1);
  }
}

setup();
