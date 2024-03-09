const express = require("express");
const app = express();

const dotenv = require("dotenv");
const csvParser = require("csv-parser");
const mysql = require("mysql2/promise");
const fs = require("fs/promises");
const cors = require("cors");

dotenv.config();

// Reading environment variables
const dbHost = process.env.DB_HOST;
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbDatabase = process.env.DB_DATABASE;

const dbConfig = {
  host: dbHost,
  user: dbUser,
  password: dbPassword,
  database: dbDatabase,
};

app.use(express.json());
app.use(cors());

// Routes
app.get("/", (req, res) => {
  res.send("Hello World");
});

// Exercise 1: data import
app.get("/read-csv", async (req, res) => {
  try {
    const data = await fs.readFile("./assets/resource_accommodation.csv");

    const parser = csvParser();
    const rows = [];

    parser.on("data", (row) => rows.push(row)).write(data);

    const connection = await mysql.createConnection(dbConfig);

    let counter = 1;
    for (const row of rows) {
      const columns = [
        "latitude",
        "longitude",
        "id",
        "title",
        "advertiser",
        "ad_description",
        "reformed",
        "phone_number",
        "accomodation_type",
        "price",
        "price_per_meter",
        "address",
        "province",
        "city",
        "s_meters",
        "rooms",
        "bathrooms",
        "parking",
        "second_hand",
        "fitted_wardrobes",
        "built_in",
        "furnished",
        "heating",
        "e_certification",
        "floor",
        "exterior",
        "indoor",
        "elevator",
        "ad_date",
        "street",
        "neighborhood",
        "district",
        "terrace",
        "storage_room",
        "kitchen",
        "equipped_kitchen",
        "air_conditioning",
        "pool",
        "garden",
        "useful_s_meters",
        "reduced_mobility_friendly",
        "floors",
        "pet_friendly",
        "balcony",
      ];

      const quotedColumns = columns.map((column) => `\`${column}\``).join(", ");

      const keys = Object.keys(row);
      let columnCounter = 0;

      //Column names: Latitud,Longitud,"ID",Titulo,Anunciante,Descripcion,Reformado,Telefonos,Tipo,Precio,Precio por metro,Direccion,Provincia,Ciudad,Metros cuadrados,Habitaciones,Baños,Parking,Segunda mano,Armarios Empotrados,Construido en,Amueblado,Calefacción individual,Certificación energética,Planta,Exterior,Interior,Ascensor,Fecha,Calle,Barrio,Distrito,Terraza,Trastero,Cocina Equipada,Cocina equipada,Aire acondicionado,Piscina,Jardín,Metros cuadrados útiles,Apto para personas con movilidad reducida,Plantas,Se admiten mascotas,Balcón

      // Columns that should be decimal: "Latitud", "Longitud", "Precio", "Precio por metro"
      // Columns that should be decimal: 0, 1, 9, 10

      // Columns that should be int: "Metros cuadrados", "Habitaciones", "Baños", "Construido en", "Metros cuadrados útiles", "Plantas"
      // Columns that should be int: 14, 15, 16, 20, 39, 41

      // Columns that should be boolean: "Reformado", "Parking", "Segunda mano", "Armarios empotrados", "Amueblado", "Calefacción individual", "Exterior", "Interior", "Ascensor", "Terraza", "Trastero", "Cocina Equipada", "Cocina equipada", "Aire acondicionado", "Piscina", "Jardín", "Apto para personas con movilidad reducida", "Se adminten mascotas", "Balcón"
      // Columns that should be boolean: 6, 17, 18, 19, 21, 22, 25, 26, 27, 32, 33, 34, 35, 36, 37, 38, 40, 42, 43

      // Columns that should be date: "Fecha"
      // Columns that should be date: 28

      // The rest should be treated as a string

      const values = keys
        .map((key) => {
          let value = row[key];
          if (
            columnCounter === 0 ||
            columnCounter === 1 ||
            columnCounter === 9 ||
            columnCounter === 10
          ) {
            value = parseFloat(value);
          } else if (
            columnCounter === 14 ||
            columnCounter === 15 ||
            columnCounter === 16 ||
            columnCounter === 20 ||
            columnCounter === 39 ||
            columnCounter === 41
          ) {
            value = parseInt(value);
            if (isNaN(value)) {
              value = "NULL";
            }
          } else if (
            columnCounter === 6 ||
            columnCounter === 17 ||
            columnCounter === 18 ||
            columnCounter === 19 ||
            columnCounter === 21 ||
            columnCounter === 22 ||
            columnCounter === 25 ||
            columnCounter === 26 ||
            columnCounter === 27 ||
            columnCounter === 32 ||
            columnCounter === 33 ||
            columnCounter === 34 ||
            columnCounter === 35 ||
            columnCounter === 36 ||
            columnCounter === 37 ||
            columnCounter === 38 ||
            columnCounter === 40 ||
            columnCounter === 42 ||
            columnCounter === 43
          ) {
            value = value === "TRUE";
          } else if (columnCounter === 28) {
            const dateRegex = /\d{4}\/\d{2}\/\d{2}/;
            const dateMatch = value.match(dateRegex);
            if (dateMatch) {
              value = `"${value}"`;
            } else {
              value = "NULL";
            }
          } else if (columnCounter == 5) {
            value = `"Description not available"`;
          } else {
            value = `"${value}"`;
          }
          columnCounter++;
          return `${value}`;
        })
        .join(", ");

      counter++;
      const sqlInsert = `INSERT INTO accomodation (${quotedColumns}) VALUES (${values})`;
      console.log(sqlInsert);
      const [result] = await connection.query(sqlInsert);
    }
  } catch (error) {
    console.error("Error inserting row", error);
  }
  res.send("Endpoint: read-csv");
});

// Exercise 2: filter by price range and number of rooms
app.get("/filter-by-price-range", async (req, res) => {
  console.log("filter-by-price-range");
  const { minPrice, maxPrice } = req.query;
  const connection = await mysql.createConnection(dbConfig);
  const [rows] = await connection.query(
    `SELECT * FROM accomodation WHERE price >= ${minPrice} AND price <= ${maxPrice}`
  );
  res.json(rows);
});

app.get("/filter-by-rooms", async (req, res) => {
  console.log("filter-by-rooms");
  const { roomsDesired } = req.query;
  const connection = await mysql.createConnection(dbConfig);
  const [rows] = await connection.query(
    `SELECT * FROM accomodation WHERE rooms = ${roomsDesired}`
  );
  res.json(rows);
});

// Exercise 3: Process data
app.get("/get-avg-price", async (req, res) => {
  console.log("get-avg-price");
  const { lat, long, distance } = req.query;
  const connection = await mysql.createConnection(dbConfig);

  // Distance =  sqrt((latitude - lat)^2 + (longitude - long)^2 )
  // Distance * Distance = (latitude - lat)(latitud - lat) + (longitude - long)(longitude - long)
  const [rows] = await connection.query(
    `SELECT AVG(price_per_meter) as avgPricePerMeter FROM accomodation WHERE (latitude - ${lat}) * (latitude - ${lat}) + (longitude - ${long}) * (longitude - ${long}) <= ${
      distance * distance
    }`
  );

  res.json(rows);
});

// Extra exercise
app.get("/get-list-inside-area", async (req, res) => {
  console.log("get-list-inside-area");
  const { lat, long, distance } = req.query;
  const connection = await mysql.createConnection(dbConfig);
  const [rows] = await connection.query(
    `SELECT * FROM accomodation WHERE (latitude - ${lat}) * (latitude - ${lat}) + (longitude - ${long}) * (longitude - ${long}) <= ${
      distance * distance
    }`
  );

  res.json(rows);
});

// Exercise 4: Generate report
app.get("/generate-report", async (req, res) => {
  console.log("generate-report");
  const { filterType, reportType } = req.query;
  if (filterType === "price") {
    const { minPrice, maxPrice } = req.query;
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query(
      `SELECT * FROM accomodation WHERE price >= ${minPrice} AND price <= ${maxPrice} ORDER BY price DESC`
    );
    if (reportType === "csv") {
      const csvData = rows
        .map((row) => {
          return Object.values(row).join(",");
        })
        .join("\n");
      await fs.writeFile(
        `./generated-reports/price_report_${Date.now()}.csv`,
        csvData
      );
    } else if (reportType === "pdf") {
      const pdf = require("pdfkit");
      const fs = require("fs");
      const doc = new pdf();
      doc.pipe(
        fs.createWriteStream(
          `./generated-reports/price_report_${Date.now()}.pdf`
        )
      );
      doc.text(JSON.stringify(rows));
      doc.end();
    }
  } else if (filterType === "rooms") {
    const { roomsDesired } = req.query;
    const connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query(
      `SELECT * FROM accomodation WHERE rooms = ${roomsDesired} ORDER BY price DESC`
    );
    if (reportType === "csv") {
      const csvData = rows
        .map((row) => {
          return Object.values(row).join(",");
        })
        .join("\n");
      await fs.writeFile(
        `./generated-reports/rooms_report_${Date.now()}.csv`,
        csvData
      );
    } else if (reportType === "pdf") {
      const pdf = require("pdfkit");
      const fs = require("fs");
      const doc = new pdf();
      doc.pipe(
        fs.createWriteStream(
          `./generated-reports/rooms_report_${Date.now()}.pdf`
        )
      );
      doc.text(JSON.stringify(rows));
      doc.end();
    }
  }

  res.json("Report generated, check directory generated_reports/");
});

app.post("/login", async (req, res) => {
  console.log("login ----");
  const { email, password } = req.body;
  const connection = await mysql.createConnection(dbConfig);

  try {
    const sql = "SELECT * FROM users WHERE email = ? AND pass = ?";
    const values = [email, password];

    const [result] = await connection.query(sql, values);
    console.log(result);
    if (result.length > 0) {
      console.log("Login successful");
      res.json({ message: "Login successful" });
    } else {
      console.log("Login failed");
      res.status(404).json({ message: "Login failed" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal server error" });
  } finally {
    await connection.end();
  }
});

app.put("/update-accomodation", async (req, res) => {
  console.log("update-accomodation");
  const data = req.body;
  console.log(data);

  const connection = await mysql.createConnection(dbConfig);
  const columns = [
    "latitude",
    "longitude",
    "id",
    "title",
    "advertiser",
    "ad_description",
    "reformed",
    "phone_number",
    "accomodation_type",
    "price",
    "price_per_meter",
    "address",
    "province",
    "city",
    "s_meters",
    "rooms",
    "bathrooms",
    "parking",
    "second_hand",
    "fitted_wardrobes",
    "built_in",
    "furnished",
    "heating",
    "e_certification",
    "floor",
    "exterior",
    "indoor",
    "elevator",
    "ad_date",
    "street",
    "neighborhood",
    "district",
    "terrace",
    "storage_room",
    "kitchen",
    "equipped_kitchen",
    "air_conditioning",
    "pool",
    "garden",
    "useful_s_meters",
    "reduced_mobility_friendly",
    "floors",
    "pet_friendly",
    "balcony",
  ];
  const quotedColumns = columns.map((column) => `\`${column}\``).join(", ");
  for (const row of data) {
    let counter = 0;
    const values = Object.values(row)
      .map((value) => {
        // Validate the index of the value to set the correct type
        // Columns that should be decimal: "Latitud", "Longitud", "Precio", "Precio por metro"
        // Indexes that should be decimal: 0, 1, 9, 10

        // Columns that should be int: "Metros cuadrados", "Habitaciones", "Baños", "Construido en", "Metros cuadrados útiles", "Plantas"
        // Indexes that should be int: 14, 15, 16, 20, 39, 41

        // Columns that should be boolean: "Reformado", "Parking", "Segunda mano", "Armarios empotrados", "Amueblado", "Calefacción individual", "Exterior", "Interior", "Ascensor", "Terraza", "Trastero", "Cocina Equipada", "Cocina equipada", "Aire acondicionado", "Piscina", "Jardín", "Apto para personas con movilidad reducida", "Se adminten mascotas", "Balcón"
        // Indexes that should be boolean: 6, 17, 18, 19, 21, 22, 25, 26, 27, 32, 33, 34, 35, 36, 37, 38, 40, 42, 43

        // Columns that should be date: "Fecha"
        // Indexes that should be date: 28

        // The rest should be treated as a string

        if (counter === 0 || counter === 1 || counter === 9 || counter === 10) {
          value = parseFloat(value);
        } else if (
          counter === 14 ||
          counter === 15 ||
          counter === 16 ||
          counter === 20 ||
          counter === 39 ||
          counter === 41
        ) {
          value = parseInt(value);
          if (isNaN(value)) {
            value = "NULL";
          }
        } else if (
          counter === 6 ||
          counter === 17 ||
          counter === 18 ||
          counter === 19 ||
          counter === 21 ||
          counter === 22 ||
          counter === 25 ||
          counter === 26 ||
          counter === 27 ||
          counter === 32 ||
          counter === 33 ||
          counter === 34 ||
          counter === 35 ||
          counter === 36 ||
          counter === 37 ||
          counter === 38 ||
          counter === 40 ||
          counter === 42 ||
          counter === 43
        ) {
          value = value === "TRUE";
        } else if (counter === 28) {
          const dateRegex = /\d{4}\/\d{2}\/\d{2}/;
          const dateMatch = value.match(dateRegex);
          if (dateMatch) {
            value = `"${value}"`;
          } else {
            value = "NULL";
          }
        } else if (counter == 5) {
          value = `"Description not available"`;
        } else {
          value = `"${value}"`;
        }
      })
      .join(", ");

    counter++;
    const sqlInsert = `INSERT INTO accomodation (${quotedColumns}) VALUES (${values})`;
    console.log(sqlInsert);
    const [result] = await connection.query(sqlInsert);
  }
  res.json("Data updated");
});

app.get("/get-accomodations", async (req, res) => {
  const connection = await mysql.createConnection(dbConfig);
  const [rows] = await connection.query("SELECT * FROM accomodation");
  res.json(rows);
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
