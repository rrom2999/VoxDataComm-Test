import React, { useEffect, useState } from "react";
import axios from "axios";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Papa from "papaparse";

const Home = () => {
  const [accomodations, setAccomodations] = useState([]);
  const [filteredAccommodations, setFilteredAccommodations] = useState([]);
  const [filterValues, setFilterValues] = useState({
    id: "",
    minPrice: "",
    maxPrice: "",
    rooms: "",
    meters: "",
    balcony: "",
    petFriendly: "",
    pool: "",
    garden: "",
  });

  const getAccommodations = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/get-accomodations"
      );
      setAccomodations(response.data);
      setFilteredAccommodations(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilterValues({ ...filterValues, [name]: value });
  };

  const applyFilters = () => {
    const { id, minPrice, maxPrice, rooms } = filterValues;
    let filteredData = accomodations.filter((accommodation) => {
      let match = true;

      if (id && accommodation.id !== parseInt(id)) {
        match = false;
      }

      if (minPrice && accommodation.price < parseFloat(minPrice)) {
        match = false;
      }

      if (maxPrice && accommodation.price > parseFloat(maxPrice)) {
        match = false;
      }

      if (rooms && accommodation.rooms !== parseInt(rooms)) {
        match = false;
      }

      return match;
    });
    setFilteredAccommodations(filteredData);
  };

  const generateCSV = (data) => {
    const csvData = Papa.unparse(data, {
      delimiter: ",",
      header: true,
    });
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "filtered-data.csv";
    link.click();
  };

  useEffect(() => {
    getAccommodations();
  }, []);

  return (
    <div className="m-4">
      <h1 className="text-xl">List of Accomodations</h1>
      <div className="flex mb-4">
        <TextField
          label="ID"
          name="id"
          type="number"
          value={filterValues.id}
          onChange={handleFilterChange}
          className="mr-2"
        />
        <TextField
          label="Precio mínimo"
          name="minPrice"
          type="number"
          value={filterValues.minPrice}
          onChange={handleFilterChange}
          className="mr-2"
        />
        <TextField
          label="Precio máximo"
          name="maxPrice"
          type="number"
          value={filterValues.maxPrice}
          onChange={handleFilterChange}
          className="mr-2"
        />
        <TextField
          label="Habitaciones"
          name="rooms"
          type="number"
          value={filterValues.rooms}
          onChange={handleFilterChange}
          className="mr-2"
        />
        <TextField
          label="Metros cuadrados"
          name="meters"
          type="number"
          value={filterValues.meters}
          onChange={handleFilterChange}
          className="mr-2"
        />
        <TextField
          label="Balcón"
          name="balcony"
          type="text"
          value={filterValues.balcony}
          onChange={handleFilterChange}
          className="mr-2"
        />
        <TextField
          label="Pet Friendly"
          name="petFriendly"
          type="text"
          value={filterValues.petFriendly}
          onChange={handleFilterChange}
          className="mr-2"
        />
        <TextField
          label="Piscina"
          name="pool"
          type="text"
          value={filterValues.pool}
          onChange={handleFilterChange}
          className="mr-2"
        />
        <TextField
          label="Jardín"
          name="garden"
          type="text"
          value={filterValues.garden}
          onChange={handleFilterChange}
          className="mr-2"
        />

        <Button className="mr-2" variant="contained" onClick={applyFilters}>
          Aplicar Filtros
        </Button>
        <Button
          variant="contained"
          onClick={() => generateCSV(filteredAccommodations)}
        >
          Descargar CSV
        </Button>
      </div>
      <TableContainer className="w-full" component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="List of Accomodations">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell align="left">Title</TableCell>
              <TableCell align="left">Advertiser</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Rooms</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAccommodations.map((row) => (
              <TableRow
                key={row.id}
                sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {row.id}
                </TableCell>
                <TableCell align="left">{row.title}</TableCell>
                <TableCell align="left">{row.advertiser}</TableCell>
                <TableCell align="right">{row.price}</TableCell>
                <TableCell align="right">{row.rooms}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Home;
