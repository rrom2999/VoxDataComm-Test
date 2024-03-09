import { useEffect, useState } from "react";
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
import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";
import Checkbox from "@mui/material/Checkbox";

const Home = () => {
  const [accomodations, setAccomodations] = useState([]);
  const [filteredAccommodations, setFilteredAccommodations] = useState([]);
  const [filterValues, setFilterValues] = useState({
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
    const {
      minPrice,
      maxPrice,
      rooms,
      meters,
      balcony,
      petFriendly,
      pool,
      garden,
    } = filterValues;
    let filteredData = accomodations.filter((accommodation) => {
      let match = true;
      if (minPrice && accommodation.price < parseFloat(minPrice)) {
        match = false;
      }
      if (maxPrice && accommodation.price > parseFloat(maxPrice)) {
        match = false;
      }
      if (rooms && accommodation.rooms !== parseInt(rooms)) {
        match = false;
      }
      if (meters && accommodation.s_meters <= parseInt(meters)) {
        match = false;
      }
      if (balcony && !accommodation.balcony) {
        match = false;
      }
      if (petFriendly && !accommodation.petFriendly) {
        match = false;
      }
      if (pool && !accommodation.pool) {
        match = false;
      }
      if (garden && !accommodation.garden) {
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

  const [data, setData] = useState([]);
  const [columnArray, setColumnArray] = useState([]);
  const [valuesArray, setValuesArray] = useState([]);

  const handleFile = (e) => {
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (result) {
        const columnArray = [];
        const valuesArray = [];

        result.data.map((d) => {
          columnArray.push(Object.keys(d));
          valuesArray.push(Object.values(d));
        });

        setData(result.data);
        setColumnArray(columnArray[0]);
        setValuesArray(valuesArray);
      },
    });
  };

  const sendData = () => {
    const url = "http://localhost:3000/update-accomodation";
    axios
      .put(url, valuesArray)
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  useEffect(() => {
    getAccommodations();
  }, []);

  return (
    <div className="m-4">
      <h1 className="text-4xl my-3">Lista de propiedades</h1>
      <div className="flex flex-wrap gap-4">
        <TextField
          label="Precio mínimo"
          name="minPrice"
          type="number"
          value={filterValues.minPrice}
          onChange={handleFilterChange}
        />
        <TextField
          label="Precio máximo"
          name="maxPrice"
          type="number"
          value={filterValues.maxPrice}
          onChange={handleFilterChange}
        />
        <TextField
          label="Habitaciones"
          name="rooms"
          type="number"
          value={filterValues.rooms}
          onChange={handleFilterChange}
        />
        <TextField
          label="Metros cuadrados"
          name="meters"
          type="number"
          value={filterValues.meters}
          onChange={handleFilterChange}
        />
        {/* <TextField
          label="Balcón"
          name="balcony"
          type="text"
          value={filterValues.balcony}
          onChange={handleFilterChange}
        />
        <TextField
          label="Pet Friendly"
          name="petFriendly"
          type="text"
          value={filterValues.petFriendly}
          onChange={handleFilterChange}
        />
        <TextField
          label="Piscina"
          name="pool"
          type="text"
          value={filterValues.pool}
          onChange={handleFilterChange}
        />
        <TextField
          label="Jardín"
          name="garden"
          type="text"
          value={filterValues.garden}
          onChange={handleFilterChange}
        /> */}
      </div>
      <div className="flex items-center">
        <Checkbox label="Balcón" name="balcony" onChange={handleFilterChange} />
        <p className="">Balcón</p>
      </div>
      <div className="flex items-center">
        <Checkbox
          label="Pet Friendly"
          name="petFriendly"
          onChange={handleFilterChange}
        />
        <p className="">Pet Friendly</p>
      </div>
      <div className="flex items-center">
        <Checkbox label="Piscina" name="pool" onChange={handleFilterChange} />
        <p className="">Piscina</p>
      </div>
      <div className="flex items-center">
        <Checkbox label="Jardín" name="garden" onChange={handleFilterChange} />
        <p className="">Jardín</p>
      </div>
      <div className="flex flex-wrap gap-4 my-4">
        <Button className="" variant="contained" onClick={applyFilters}>
          Aplicar Filtros
        </Button>
        <Button
          variant="contained"
          onClick={() => generateCSV(filteredAccommodations)}
        >
          Descargar CSV
        </Button>
      </div>
      <div>
        <h2 className="text-2xl my-3">Importar CSV</h2>
        <input
          type="file"
          name="file"
          accept=".csv"
          onChange={handleFile}
        ></input>
        <Button onClick={sendData} variant="contained">
          Send data to API
        </Button>
      </div>
      <TableContainer className="w-full" component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="List of Accomodations">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell align="left">Titulo</TableCell>
              <TableCell align="left">Anunciante</TableCell>
              <TableCell align="right">Precio</TableCell>
              <TableCell align="right">Habitaciones</TableCell>
              <TableCell align="right">Metros</TableCell>
              <TableCell align="right">Con Balcón</TableCell>
              <TableCell align="right">Pet Friendly</TableCell>
              <TableCell align="right">Con Piscina</TableCell>
              <TableCell align="right">Con Jardín</TableCell>
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
                <TableCell align="right">{row.s_meters}</TableCell>
                <TableCell align="right">
                  {row.balcony ? (
                    <CheckIcon color="secondary" />
                  ) : (
                    <ClearIcon color="disabled" />
                  )}
                </TableCell>
                <TableCell align="right">
                  {row.petFriendly ? (
                    <CheckIcon color="secondary" />
                  ) : (
                    <ClearIcon color="disabled" />
                  )}
                </TableCell>
                <TableCell align="right">
                  {row.pool ? (
                    <CheckIcon color="secondary" />
                  ) : (
                    <ClearIcon color="disabled" />
                  )}
                </TableCell>
                <TableCell align="right">
                  {row.garden ? (
                    <CheckIcon color="secondary" />
                  ) : (
                    <ClearIcon color="disabled" />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Home;
