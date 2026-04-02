-- StayHub Seed Data
-- NOTE: This file uses placeholder password hashes.
-- Run "npm run setup" in /backend to seed with real bcrypt hashes.
-- Admin: admin@hoteleria.com / Admin123!
-- Users: carlos@email.com, maria@email.com, juan@email.com / User123!

USE ReservaHotelera;
GO

-- Users (passwords are placeholder hashes - use setup.js for real hashes)
INSERT INTO Users (name, email, password_hash, role, phone) VALUES
('Administrador StayHub', 'admin@hoteleria.com', '$2a$12$placeholder_run_setup_js', 'admin', '3001234567'),
('Carlos Mendoza', 'carlos@email.com', '$2a$12$placeholder_run_setup_js', 'user', '3109876543'),
('María García', 'maria@email.com', '$2a$12$placeholder_run_setup_js', 'user', '3155551234'),
('Juan Pérez', 'juan@email.com', '$2a$12$placeholder_run_setup_js', 'user', '3187654321');
GO

-- Hotels (8 hotels in Bucaramanga)
INSERT INTO Hotels (name, description, address, neighborhood, city, stars, rating, review_count, price_from, image_url, amenities) VALUES
('Hotel Dann Carlton Bucaramanga',
 'El hotel más lujoso de Bucaramanga, ubicado en el corazón de Cabecera del Llano.',
 'Calle 47 # 28-27, Cabecera del Llano', 'Cabecera del Llano', 'Bucaramanga', 5, 9.2, 1847, 280000,
 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
 'WiFi,Piscina,Spa,Restaurante,Gimnasio,Parqueadero,Bar,Aire acondicionado,Room service,Lavandería'),

('Hotel Chicamocha',
 'Hotel tradicional en el centro de Bucaramanga con más de 40 años de historia.',
 'Carrera 19 # 31-16, Centro', 'Centro', 'Bucaramanga', 4, 8.5, 923, 150000,
 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80',
 'WiFi,Restaurante,Parqueadero,Sala de conferencias,Aire acondicionado,Room service'),

('Hotel Ruitoque Condominio',
 'Exclusivo hotel campestre con impresionantes vistas al cañón del Chicamocha.',
 'Km 5 Vía Ruitoque, Ruitoque Alto', 'Ruitoque Alto', 'Bucaramanga', 4, 8.8, 412, 200000,
 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80',
 'WiFi,Piscina,Restaurante,Parqueadero,Zonas verdes,Aire acondicionado,Jacuzzi'),

('Hotel Toscana Suites',
 'Moderno hotel de suites en el sector de Cabecera, cerca de centros comerciales.',
 'Calle 54 # 32-15, Cabecera', 'Cabecera', 'Bucaramanga', 3, 8.1, 567, 120000,
 'https://images.unsplash.com/photo-1596386461350-326ccb383e9f?w=800&q=80',
 'WiFi,Parqueadero,Cocina,Aire acondicionado,Lavandería'),

('Hotel Bolívar Inn',
 'Acogedor hotel boutique en el Centro Histórico, a pasos del Parque García Rovira.',
 'Calle 35 # 12-08, Centro Histórico', 'Centro Histórico', 'Bucaramanga', 3, 7.9, 334, 95000,
 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&q=80',
 'WiFi,Restaurante,Parqueadero,Aire acondicionado'),

('Hotel Bucarica',
 'Emblemático hotel frente al Parque Santander, uno de los más reconocidos de la ciudad.',
 'Carrera 19 # 36-32, Parque Santander', 'Parque Santander', 'Bucaramanga', 4, 8.3, 1102, 180000,
 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80',
 'WiFi,Restaurante,Bar,Sala de conferencias,Parqueadero,Gimnasio,Aire acondicionado,Room service'),

('Hotel Virrey',
 'Hotel familiar en el barrio La Victoria con excelente relación calidad-precio.',
 'Carrera 27 # 45-67, La Victoria', 'La Victoria', 'Bucaramanga', 3, 7.6, 228, 110000,
 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80',
 'WiFi,Parqueadero,Aire acondicionado,Desayuno incluido'),

('Hotel Cañaveral Suites',
 'Moderno hotel en el exclusivo sector de Cañaveral, cerca del estadio Alfonso López.',
 'Avenida Cañaveral # 48-50, Cañaveral', 'Cañaveral', 'Bucaramanga', 4, 8.6, 789, 160000,
 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?w=800&q=80',
 'WiFi,Piscina,Restaurante,Parqueadero,Gimnasio,Aire acondicionado,Spa,Bar');
GO
