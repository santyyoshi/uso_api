import React, { useState, useEffect } from "react";
import axios from "axios";
import CryptoJS from "crypto-js";
import {
  AppBar,
  Toolbar,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

const API_BASE_URL = "https://gateway.marvel.com/v1/public/characters";
const PUBLIC_KEY = "d2a6eb86f6bd9ca47f42865ff3aafc70";
const PRIVATE_KEY = "ffcaed5bd7db12510cdb29811854c9e04630b9db";

const generateHash = (timestamp) => {
  return CryptoJS.MD5(`${timestamp}${PRIVATE_KEY}${PUBLIC_KEY}`).toString();
};

function App() {
  const [characters, setCharacters] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filter, setFilter] = useState("todos");

  const fetchCharacters = async () => {
    setLoading(true);
    const timestamp = Date.now();
    const hash = generateHash(timestamp);

    try {
      const params = {
        ts: timestamp,
        apikey: PUBLIC_KEY,
        hash: hash,
      };

      if (search) {
        params.nameStartsWith = search;
      }

      const response = await axios.get(API_BASE_URL, { params });
      setCharacters(response.data.data.results);
    } catch (error) {
      console.log(error);
      alert("Error al cargar los datos. Revisa tu conexión o las claves.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCharacters();
  }, []);

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleFilterChange = (event) => {
    setFilter(event.target.value);
    // Nota: no usa el filtro directamente aún
  };

  const handleSearch = () => {
    fetchCharacters();
  };

  const handleCardClick = (character) => {
    setSelectedCharacter(character);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCharacter(null);
  };

  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Marvel Finder</Typography>
        </Toolbar>
      </AppBar>
      <div style={{ padding: "1rem" }}>
        <TextField
          variant="outlined"
          placeholder="Buscar personajes"
          value={search}
          onChange={handleSearchChange}
          style={{ marginRight: "1rem", width: "300px" }}
        />
        <FormControl style={{ minWidth: "120px" }}>
          <InputLabel>Filtro</InputLabel>
          <Select value={filter} onChange={handleFilterChange}>
            <MenuItem value="todos">Todos</MenuItem>
            {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
              <MenuItem key={letter} value={letter}>
                {letter}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={handleSearch} style={{ marginLeft: "1rem" }}>
          Buscar
        </Button>
      </div>
      <Grid container spacing={2} style={{ padding: "1rem" }}>
        {loading ? (
          <CircularProgress style={{ margin: "auto" }} />
        ) : characters.length > 0 ? (
          characters.map((character) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={character.id}>
              <Card onClick={() => handleCardClick(character)}>
                <CardMedia
                  component="img"
                  image={`${character.thumbnail.path}.${character.thumbnail.extension}`}
                  alt={character.name}
                />
                <CardContent>
                  <Typography>{character.name}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          <Typography style={{ textAlign: "center", width: "100%" }}>
            No se encontraron personajes.
          </Typography>
        )}
      </Grid>
      {selectedCharacter && (
        <Dialog open={dialogOpen} onClose={handleCloseDialog}>
          <DialogTitle>{selectedCharacter.name}</DialogTitle>
          <DialogContent>
            <img
              src={`${selectedCharacter.thumbnail.path}.${selectedCharacter.thumbnail.extension}`}
              alt={selectedCharacter.name}
              style={{ width: "100%" }}
            />
            <Typography>{selectedCharacter.description || "Sin descripción."}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      )}
    </div>
  );
}

export default App;
