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
      selected: false, // Agrega el estado de selección
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

  /* -------------------------------------------------------------------------------------- AUDIO ------------------ */

  getAudioPath(album: any, song: any, difficulty: string, trackNumber: number = 1): string {
    const cleanSong = song.name.replace(/[<>:"\/\\|?*]+/g, '').replace(/\.\.\./g, '').trim(); //Clean symbols from the song name so they match the folder name

    return `assets/audio/${album.class}/${album.id}/${song.id}. ${cleanSong}/${difficulty}/track (${trackNumber}).mp3`;
  }

  //Function to initialize the questions with a random track so the track is always the same for the same question
  async initializeQuestions() {
    for (let question of this.questionsArray) {
      const album = this.albums.find(a => a.id === question.albumID);
      if (!album) continue;
  
      const trackLimit = await this.countAvailableTracks(album, question, this.selectedDifficulty);
      question.selectedTrack = Math.floor(Math.random() * trackLimit) + 1; // Se almacena el track aleatorio
    }
  }

  //Función encargada de reproducir el fragmento de canción
  async playSong() {
    if (this.currentSongIndex >= this.questionsArray.length) return; // Salir si ya no hay más canciones
  
    const currentQuestion = this.questionsArray[this.currentSongIndex];
  
    // Encuentra el álbum correspondiente
    const album = this.albums.find(a => a.id === currentQuestion.albumID);
    if (!album) {
      console.error('Song not found:', currentQuestion.name);
      return;
    }
  
    // Usa el track preseleccionado en vez de generar uno nuevo
    const selectedTrack = currentQuestion.selectedTrack;
  
    // Construye la ruta del archivo de audio
    const audioPath = this.getAudioPath(album, currentQuestion, this.selectedDifficulty, selectedTrack);
  
    console.log('Playing:', audioPath);
  
    // Reproduce el audio
    const audio = new Audio(audioPath);
    audio.play().catch(err => console.error('Error playing the audio:', err));
  }

  //Función para contar los tracks disponibles de una canción en una dificultad
  async countAvailableTracks(album: any, song: any, difficulty: string): Promise<number> {
    let trackCount = 2; // Mínimo hay 2 tracks
    let trackNumber = 3; // Empezamos a contar desde el tercero

    while (true) {
      const path = this.getAudioPath(album, song, difficulty, trackNumber);
      try {
        const response = await fetch(path, { method: 'HEAD' });
        if (!response.ok) break; // Si el archivo no existe, para
        //if (response.status === 404) break; // Si el archivo no existe, para
        trackCount++;
        trackNumber++;
      } catch {
        break; // Si da error, para
      }
    }
    return trackCount;
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