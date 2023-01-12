DROP TABLE IF EXISTS country_language;
DROP TABLE IF EXISTS language;
DROP TABLE IF EXISTS city_weather;
DROP TABLE IF EXISTS city;
DROP TABLE IF EXISTS country;

CREATE TABLE country (
  country_code CHAR(3) NOT NULL,
  country_code2 CHAR(2) NOT NULL,
  country_name VARCHAR(52) NOT NULL,
  continent VARCHAR(16) CHECK (continent IN ('Asia','Europe','North America','Africa','Oceania','Antarctica','South America')) NOT NULL DEFAULT 'North America',
  country_capital INTEGER DEFAULT NULL,
  country_population INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY(
    country_code
  )
);  

CREATE TABLE city (
  city_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  country_code CHAR(3) NOT NULL,
  city_name VARCHAR(64) NOT NULL,
  latitude decimal(8,6) DEFAULT NULL,
  longitude decimal(9,6) DEFAULT NULL,  
  city_population INTEGER DEFAULT NULL
);

CREATE TABLE city_weather (
  weather_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  city_id INTEGER NOT NULL,
  timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  temperature_low DECIMAL NULL,
  temperature_high DECIMAL NULL
);

CREATE TABLE language(
  language_code CHAR(3) NOT NULL,
  language_code2 CHAR(2) NOT NULL,
  language_name VARCHAR(30) NOT NULL,
  language_notes TEXT,
  PRIMARY KEY(
    language_code
  )
);

CREATE TABLE country_language(
  country_language_id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  country_code CHAR(3) NOT NULL,
  language_code CHAR(3) NOT NULL,
  is_official CHAR(1) CHECK(is_official IN ('T','F')) NOT NULL DEFAULT 'F',
  language_percentage DECIMAL(4,1) NOT NULL DEFAULT '0.0'
);