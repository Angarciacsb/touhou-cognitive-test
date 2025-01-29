import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { albums } from '../data/albums-data';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-selection-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor],
  templateUrl: './selection-screen.component.html',
  styleUrls: ['./selection-screen.component.css']
})
export class SelectionScreenComponent {

  /* -------------------------------------------------------------------------------------- VARAIBLES -------------- */

  albumsPC98: { songs: { selected: boolean; id: number; name: string; tags: string[]; }[]; id: string; name: string; class: string; }[] = [];
  albumsMainGame: { songs: { selected: boolean; id: number; name: string; tags: string[]; }[]; id: string; name: string; class: string; }[] = [];
  albumsSpinOff: { songs: { selected: boolean; id: number; name: string; tags: string[]; }[]; id: string; name: string; class: string; }[] = [];
  albumsFighter: { songs: { selected: boolean; id: number; name: string; tags: string[]; }[]; id: string; name: string; class: string; }[] = [];
  albumsHifuuClub: { songs: { selected: boolean; id: number; name: string; tags: string[]; }[]; id: string; name: string; class: string; }[] = [];
  albumsPrintWorks: { songs: { selected: boolean; id: number; name: string; tags: string[]; }[]; id: string; name: string; class: string; }[] = [];

  selectedAlbum: any = null;

  selectedSongsTotal: number = 0;
  selectedSongsAlbum: number = 0;

  selectedTags: string[] = []; // Array de tags seleccionados

  selectedSongs: any[] = []; // Array de canciones seleccionadas

  questionsArray: any[] = []; // Array de preguntas
  numberOfQuestions: number = 1; // Número de preguntas a generar

  selectedDifficulty: string = ""; // Nivel de dificultad seleccionado

  isModalOpen = false;

  //Add "selected" property to each song
  albums = albums.map((album) => ({
    ...album,
    songs: album.songs.map((song) => ({
      ...song, // Copia todas las propiedades existentes de la canción
      selected: false // Agrega el estado de selección
    }))
  }));

  ngOnInit() {
    this.populateAlbums();
  }

  constructor(private router: Router) { }

  /* -------------------------------------------------------------------------------------- FORMAT ----------------- */

  //Función para contar el número de canciones seleccionadas en el álbum
  countSelectedSongsTotal() {
    this.selectedSongsTotal = 0;
    this.albums.forEach((album) => {
      album.songs.forEach((song) => {
        if (song.selected) {
          this.selectedSongsTotal++;
        }
      });
    });
  }

  //Función para seleccionar las canciones correspondientes en función a los tags
  selectSongs(event: Event, ...strings: string[]) { // "..." es un operador que convierte los parámetros en un array
    const isChecked = (event.target as HTMLInputElement).checked;
    this.albums.forEach((album) => {
      album.songs.forEach((song) => {
        //"every" comrpueba que todos los elementos del array coincidan, es decir, un AND. "some" para un OR.
        if (strings.every(tag => song.tags.includes(tag))) {
          song.selected = isChecked;
        }
      });
    });
  }

  //Example of how to use the AND (every) and OR (some) operators together for tag searching
  /*
  evento(event: Event, groupA: string[], groupB: string[]) {
    const isChecked = (event.target as HTMLInputElement).checked;
  
    this.albums.forEach((album) => {
      album.songs.forEach((song) => {
        const hasAtLeastOneA = groupA.length === 0 || groupA.some(tag => song.tags.includes(tag));
        const hasAllB = groupB.length === 0 || groupB.every(tag => song.tags.includes(tag));
  
        if (hasAtLeastOneA && hasAllB) {
          song.selected = isChecked;
        }
      });
    });
  }
  */

  //Función para seleccionar todas las canciones
  selectEverything(event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.albums.forEach((album) => {
      album.songs.forEach((song) => {
        if (isChecked) {
          song.selected = true;
        } else {
          song.selected = false;
        }
      });
    });
  }

  //Función para que el número de preguntas sea válido. Mínimo 1, máximo el doble de las canciones seleccionadas
  validateNumberOfQuestions(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    let value = parseInt(inputElement.value, 10);

    // Verifica si el valor es menor a 1 o no es un número válido.
    if (isNaN(value) || value < 1) {
      value = 1; // Corrige el valor a 1 si es inválido.
    }

    // Recalcula el número de canciones seleccionadas en este momento
    const selectedSongsCount = this.albums.reduce((total, album) => {
      return total + album.songs.filter(song => song.selected).length;
    }, 0);

    // Obtiene el límite máximo (doble de las canciones seleccionadas, mínimo 1)
    const maxLimit = Math.max(1, selectedSongsCount /** 2*/);  //Descomentar el *2 para duplicar el número de preguntas posibles

    // Si el valor supera el límite, lo ajusta al máximo permitido.
    if (value > maxLimit) {
      value = maxLimit;
    }

    // Actualiza el valor del input para reflejar el cambio.
    inputElement.value = value.toString();
    this.numberOfQuestions = value;
  }

  //Función para generar el array de preguntas. No permite duplicados
  createGameQuestionsNoDupes(): void {
    // Filtramos las canciones seleccionadas
    const selectedSongs = this.albums.flatMap(album => album.songs.filter(song => song.selected));

    // Copia del array para evitar duplicados
    const tempSongs = [...selectedSongs];

    for (let i = 0; i < this.numberOfQuestions; i++) {
      // Seleccionar un índice aleatorio
      const randomIndex = Math.floor(Math.random() * tempSongs.length);

      // Agregar la canción aleatoria a questions
      this.questionsArray.push(tempSongs[randomIndex]);

      // Eliminar la canción seleccionada para evitar duplicados
      tempSongs.splice(randomIndex, 1); // Comentar esta línea para permitir duplicados
    }
    //console.log("Preguntas generadas:", this.questionsArray);
  }

  //Función para generar el array de preguntas. Permite un duplicado
  createGameQuestions1Dupe(): void {
    // Filtramos las canciones seleccionadas
    const selectedSongs = this.albums.flatMap(album => album.songs.filter(song => song.selected));

    // Verificar si hay suficientes canciones seleccionadas
    if (selectedSongs.length === 0) {
      console.warn("No hay canciones seleccionadas.");
      return;
    }

    const questions = [];
    const maxQuestions = Math.min(this.selectedSongsTotal, selectedSongs.length * 2); // Máximo 2 veces por canción

    // Mapa para contar cuántas veces se ha agregado cada canción
    const songCountMap = new Map<string, number>();

    while (questions.length < maxQuestions) {
      // Seleccionar una canción aleatoria
      const randomIndex = Math.floor(Math.random() * selectedSongs.length);
      const song = selectedSongs[randomIndex];

      // Obtener cuántas veces ha sido seleccionada
      const count = songCountMap.get(song.name) || 0;

      // Si aún no ha alcanzado el límite de 2 repeticiones, añadirla
      if (count < 2) {
        questions.push(song);
        songCountMap.set(song.name, count + 1);
      }
    }

    console.log("Preguntas generadas:", questions);
  }

  getDifficultyLevel(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.selectedDifficulty = inputElement.nextElementSibling?.textContent?.trim() || '';

    //console.log("Dificultad seleccionada:", this.selectedDifficulty);
  }

  //Función asociada al botón de "Play" para iniciar el juego
  //Comprueba el número de canciones seleccionadas y envía un array con una selección aleatoria de canciones con el número de preguntas seleccionado
  playGame(): void {
    if (this.selectedSongsTotal <= 0) {
      alert("There are no songs selected.");
    } else if (this.selectedDifficulty === "") {
      alert("Select a difficulty level.");
    } else {
      this.questionsArray = [];
      this.createGameQuestionsNoDupes();
      //Navegar a gameplay-screen y enviar las preguntas y la dificultad seleccionada
      this.router.navigate(['/gameplay-screen'], {
        state: {
          questions: this.questionsArray,
          difficulty: this.selectedDifficulty
        }
      });
    }
  }

  /* -------------------------------------------------------------------------------------- ALBUM LIST ------------- */

  //Función para clasificar los albums en sus respectivas categorías
  populateAlbums() {
    this.albums.forEach((element) => {
      switch (element.class) {
        case "PC-98":
          this.albumsPC98.push(element);
          break;
        case "Main game":
          this.albumsMainGame.push(element);
          break;
        case "Spin off":
          this.albumsSpinOff.push(element);
          break;
        case "Fighter":
          this.albumsFighter.push(element);
          break;
        case "Hifuu Club":
          this.albumsHifuuClub.push(element);
          break;
        case "Print works":
          this.albumsPrintWorks.push(element);
          break;
      }
    });
  }

  //Función que selecciona un album para mostrar sus canciones
  selectAlbum(album: { songs: { selected: boolean; id: number; name: string; tags: string[]; }[]; id: string; name: string; class: string; }) {
    this.selectedAlbum = album;
  }

  countSelectedSongsAlbum(album: { songs: { selected: boolean; id: number; name: string; tags: string[]; }[]; id: string; name: string; class: string; }) {
    this.selectedSongsAlbum = 0;
    album.songs.forEach((song) => {
      if (song.selected) {
        this.selectedSongsAlbum++;
      }
    });
    return this.selectedSongsAlbum;
  }

  /* -------------------------------------------------------------------------------------- SONG LIST -------------- */

  selectAllSongs() {
    if (this.selectedAlbum) {
      this.selectedAlbum.songs.forEach((song: any) => (song.selected = true));
      this.countSelectedSongsTotal();
    }
  }

  deselectAllSongs() {
    if (this.selectedAlbum) {
      this.selectedAlbum.songs.forEach((song: any) => (song.selected = false));
      this.countSelectedSongsTotal();
    }
  }

  /* -------------------------------------------------------------------------------------- MODAL ------------------ */

  openModal(albumIndex: number) {
    this.selectedAlbum = this.albums[albumIndex];
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedAlbum = null;
  }
}