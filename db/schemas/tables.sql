-- Create categories table
CREATE TABLE categories (
    id PRIMARY KEY GENERATED ALWAYS AS IDENTITY ,
    cat_name VARCHAR(60) UNIQUE NOT NULL ,
    summary VARCHAR(200) NOT NULL ,
    store_id INT ,
    FOREIGN KEY (store_id) REFERENCES stores(id)
);

-- Create materials table
CREATE TABLE materials (
    id PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    mat_name VARCHAR(100) NOT NULL ,
    stock INT NOT NULL ,
    price FLOAT NOT NULL , 
    category_id INT ,
    img_url TEXT ,
    img_id TEXT ,
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
-- Create enum type for days of the week
CREATE TYPE day_of_week AS ENUM(
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday') ; 

-- Create location table 
CREATE TABLE locations (
    id PRIMARY KEY GENERATED ALWAYS AS IDENTITY , 
    state VARCHAR(20) NOT NULL   , 
    address VARCHAR(255) NOT NULL ,
    phone_number VARCHAR(15) ,
     open day_of_week[], 
    zip_code VARCHAR(20) NOT NULL ,
    store_id INT NOT NULL ,
    FOREIGN KEY (store_id) REFERENCES stores(id) 
);

-- Create store table 
CREATE TABLE stores(
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY , 
    name VARCHAR(50) NOT NULL , 
    date_opened DATE NOT NULL  
)