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