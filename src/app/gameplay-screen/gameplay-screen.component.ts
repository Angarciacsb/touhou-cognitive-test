import { Component } from '@angular/core';
import { albums } from '../data/albums-data';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgFor } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-gameplay-screen',
  imports: [CommonModule, FormsModule, NgFor],
  templateUrl: './gameplay-screen.component.html',
  styleUrl: './gameplay-screen.component.css'
})
export class GameplayScreenComponent {
  /* -------------------------------------------------------------------------------------- VARAIBLES -------------- */
  constructor(private router: Router) { }

  albumsPC98: { songs: { selected: boolean; id: number; name: string; tags: string[]; }[]; id: string; name: string; class: string; }[] = [];
  albumsMainGame: { songs: { selected: boolean; id: number; name: string; tags: string[]; }[]; id: string; name: string; class: string; }[] = [];
  albumsSpinOff: { songs: { selected: boolean; id: number; name: string; tags: string[]; }[]; id: string; name: string; class: string; }[] = [];
  albumsFighter: { songs: { selected: boolean; id: number; name: string; tags: string[]; }[]; id: string; name: string; class: string; }[] = [];
  albumsHifuuClub: { songs: { selected: boolean; id: number; name: string; tags: string[]; }[]; id: string; name: string; class: string; }[] = [];
  albumsPrintWorks: { songs: { selected: boolean; id: number; name: string; tags: string[]; }[]; id: string; name: string; class: string; }[] = [];

  selectedAlbum: any = null;

  questionsArray: any[] = []; // Array de preguntas
  selectedDifficulty: string = ''; // Dificultad seleccionada

  selectedSong: any = null; // Canción seleccionada

  currentSongIndex: number = 0; // Índice de la canción actual
  answersArray: any[] = []; // Array de respuestas

  isModalOpen = false;

  //Add "selected" property to each song
  albums = albums.map((album) => ({
    ...album,
    songs: album.songs.map((song) => ({
      ...song, // Copia todas las propiedades existentes de la canción
      selected: false // Agrega el estado de selección
    }))
  }));


  ngOnInit(): void {
    this.populateAlbums();
    // Recibir los datos enviados desde selection-screen
    const state = history.state;
    if (state.questions && state.difficulty !== undefined) {
      this.questionsArray = state.questions;
      this.selectedDifficulty = state.difficulty;
    }
    //console.log(this.selectedDifficulty);
    //console.log(this.questionsArray);
    this.questionsArray.forEach((question, index) => {
      console.log(index + ". " + question.name);
    });
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

  //Función que guarda en el array de respuestas la canción seleccionada y avanza en el array de preguntas
  selectSong() {
    if (this.currentSongIndex < this.questionsArray.length) {
      if (!this.selectedSong) {
        alert("No song selected");
      } else {
        this.answersArray.push(this.selectedSong);
        this.currentSongIndex++;
        this.playSong();
        //console.log("Índice: " + this.currentSongIndex);

        // 🚀 Si es la última canción, cambia de componente automáticamente
        if (this.currentSongIndex >= this.questionsArray.length) {
          setTimeout(() => this.changeComponent(), 500); // Pequeña pausa para fluidez
        }
      }
    }
  }

  //Función que cambia de componente enviando las preguntas y las respuestas
  changeComponent() {
    this.router.navigate(['/score-screen'], {
      state: {
        answers: this.answersArray,
        questions: this.questionsArray
      }
    });
  }

  //Función encargada de reproducir el fragmento de canción
  playSong() {

  }

  /* -------------------------------------------------------------------------------------- SONG LIST -------------- */



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
