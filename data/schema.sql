DROP DATABASE quiet_spot;
CREATE DATABASE quiet_spot;

\c

DROP TABLE IF EXISTS favorites;
CREATE TABLE favorites (
    id SERIAL PRIMARY KEY,
    name TEXT,
    address TEXT,
    rating FLOAT,
    photo TEXT,
    places_id TEXT
);

INSERT INTO favorites (name, address, rating, photo, places_id) VALUES (
'Thomas Hammer Coffee Roasters', 
'101 West 8th Avenue, Spokane',
4,
'https://maps.googleapis.com/maps/api/place/photo?photoreference=CmRaAAAACpTcYB8QuzQtiergzlOdGfE3AugKka4WNS5W5WVv7BwtVqCmd0VNiEFHqO2Y_lo6We-Frzh6JQ4zJqGveOhSHftvykOEUwz4uJEiUsakOcQx00FKmIE3cquDtP0xogqzEhAvdcyE46PTkZqse8wYuBquGhSo6YdfR_5iHG3tgWdK-xd9ZWTePQ&maxheight=500&key=AIzaSyCkqF42wQoOPdYaWPhjEqqO2JqSvbDGiZE
', 
'cc5f8b0716393e24c94855e930a09ad05de961a1'
);

INSERT INTO favorites (name, address, rating, photo, places_id) VALUES (
    'Nordstrom Espresso Bar',
    '828 West Main Avenue, Spokane',
    3.8,
    'https://maps.googleapis.com/maps/api/place/photo?photoreference=CmRaAAAAJ-VOYD4h18yDiFIKkuwr86-owLFdcbk0c2diGO7oAxk275KHDMfydXuTcWkrLQZ7jtUaQylaGs4TFV73Q-pYt5UnfNOdTkRYUMQiP0FdxjEuhG_FlaNWFMyTdYh-MdDQEhA9y3y07iCwuZuuKR4K--qdGhTuYhq9mPeod9yMHFYxtraWllhQ3A&maxheight=500&key=AIzaSyCkqF42wQoOPdYaWPhjEqqO2JqSvbDGiZE',
    '973270f60d08b691429f65f04739862e5d67d96d'

);


DROP TABLE IF EXISTS searches;
CREATE TABLE searches (
    id SERIAL PRIMARY KEY,
    query TEXT,
    lat FLOAT,
    long FLOAT
);

INSERT INTO searches (query, lat, long) VALUES (
    'Seattle',
    47.734145,
    -122.2244331
);

INSERT INTO searches (query, lat, long) VALUES (
    '98052',
    47.6701193,
    -122.1182369
);