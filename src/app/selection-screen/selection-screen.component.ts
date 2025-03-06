import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { albums } from '../data/albums-data';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-selection-screen',
  standalone: true,
  imports: [CommonModule, FormsModule, NgFor, DragDropModule],
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

  questionsArray: any[] = []; // Array de preguntas
  numberOfQuestions: number = 1; // Número de preguntas a generar

  selectedDifficulty: string = ""; // Nivel de dificultad seleccionado

  customLists: any[] = []; // Array de listas personalizadas

  isAlertModalOpen = false;
  alertModalMessage = "";
  alertModalActionsVisible = false;

  isCreateListModalOpen = false;
  createListModalInputValue = "";
  createListModalMessage = "";
  isRenamingList: boolean = false;
  originalListName: string = "";

  isDeleteListModalOpen = false;
  deleteListModalMessage = "";
  listToDelete: string = "";

  isCustomListsModalOpen = false;

  isSongListModalOpen = false;

  //Add "selected" property to each song
  albums = albums.map((album) => ({
    ...album,
    songs: album.songs.map((song) => ({
      ...song, // Copia todas las propiedades existentes de la canción
      selected: false, // Agrega el estado de selección
      albumID: album.id // Agrega el ID del álbum. Esto se usa para generar la ruta del archivo de audio
    }))
  }));

  ngOnInit() {
    this.populateAlbums();
    this.loadCustomLists();
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

    // Copia del array para evitar duplicados
    const tempSongs = [...this.getSelectedSongs()];

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

    // Verificar si hay suficientes canciones seleccionadas
    if (this.getSelectedSongs().length === 0) {
      console.warn("No hay canciones seleccionadas.");
      return;
    }

    const questions = [];
    const maxQuestions = Math.min(this.selectedSongsTotal, this.getSelectedSongs().length * 2); // Máximo 2 veces por canción

    // Mapa para contar cuántas veces se ha agregado cada canción
    const songCountMap = new Map<string, number>();

    while (questions.length < maxQuestions) {
      // Seleccionar una canción aleatoria
      const randomIndex = Math.floor(Math.random() * this.getSelectedSongs().length);
      const song = this.getSelectedSongs()[randomIndex];

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
      this.openAlertModal("There are no songs selected");
      //alert("There are no songs selected.");
    } else if (this.selectedDifficulty === "") {
      this.openAlertModal("Select a difficulty level");
      //alert("Select a difficulty level.");
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

  //Función que guarda en un array las canciones seleccionadas en el momento
  getSelectedSongs() {
    return this.albums.flatMap(album => album.songs.filter(song => song.selected));
  }

  /* -------------------------------------------------------------------------------------- CUSTOM LISTS ----------- */

  //Load the custom lists from local storage
  loadCustomLists() {
    const order = localStorage.getItem("customListsOrder");

    if (order) {
      this.customLists = JSON.parse(order).filter((list: string) => localStorage.getItem(list));
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key !== "customListsOrder" && !this.customLists.includes(key)) {
          this.customLists.push(key); //Add new custom lists to the array
        }
      }
    } else {
      this.customLists = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== "customListsOrder") { //Ignore the customListsOrder key
          this.customLists.push(key);
        }
      }
      this.saveOrder();
    }
  }

  //Saves current order of custom lists in local storage
  saveOrder() {
    localStorage.setItem("customListsOrder", JSON.stringify(this.customLists))
  }

  //Drag and drop custom lists to change their order
  dropList(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.customLists, event.previousIndex, event.currentIndex);
    this.saveOrder();
  }

  //Create a new custom list
  addCustomList() {
    if (this.createListModalInputValue.trim() === "") {
      this.openAlertModal("Name cannot be empty");
      return;
    } else if (this.checkDuplicatedListName(this.createListModalInputValue.trim())) {
      this.openAlertModal("This name is already in use");
      return;
    }

    if (this.isRenamingList) {
      // Renombrar: Guardar la nueva lista y eliminar la anterior
      const listData = localStorage.getItem(this.originalListName);
      if (listData) {
        localStorage.setItem(this.createListModalInputValue, listData);
        localStorage.removeItem(this.originalListName);
      }
    } else {
      // Crear nueva lista
      if (this.selectedSongsTotal <= 0) {
        console.log("No songs selected");
        this.openAlertModal("You must select the songs before adding them");
        this.closeCustomListsModal();
        return;
      } else {
        localStorage.setItem(this.createListModalInputValue, JSON.stringify(this.getSelectedSongs()));
      }
    }

    this.loadCustomLists();
    this.closeCreateListModal();
  }

  //Load the selected songs from a custom list
  loadCustomList(listName: string) {
    const listData = localStorage.getItem(listName);

    if (listData) {
      const savedSongs: { albumID: string; id: number }[] = JSON.parse(listData); //Assigning the data type is necessary to avoid errors whem comparing the songs

      this.albums.forEach(album => {
        album.songs.forEach(song => {
          song.selected = savedSongs.some(s => s.albumID === album.id && s.id === song.id);
        });
      });

      this.countSelectedSongsTotal();
    } else {
      this.openAlertModal("Error: This list does not exist.");
    }
  }

  //Rename a custom list. It opens the create list modal with the current name
  renameCustomList(customList: string) {
    this.openCreateListModal(true, customList);
  }
  //Delete a custom list
  deleteCustomList(customList: string) {
    localStorage.removeItem(customList);
    this.loadCustomLists();
    this.closeDeleteListModal();
  }
  //Export a custom list to a .txt file
  exportCustomList(listName: string) {
    const listData = localStorage.getItem(listName);
    if (!listData) {
      console.error("List not found in localStorage");
      return;
    }

    // Create a Blob object containing the list data
    const blob = new Blob([listData], { type: "text/plain" });

    // Generate a URL for the Blob object
    const url = URL.createObjectURL(blob);

    // Create an <a> element dynamically
    const a = document.createElement("a");
    a.href = url; // Set the link to the Blob URL
    a.download = `${listName}.txt`; // Define the file name

    // Simulate a click to trigger the download
    a.click();

    // Revoke the Blob URL to free up memory
    URL.revokeObjectURL(url);

    //this.openAlertModal("The list name is on the file name. When importing, the list will be named after the file.");
  }

  //Event handler for importing a custom list
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const content = reader.result as string;
        const fileName = file.name.replace(/\.txt$/, ""); // Remove .txt extension
        this.importCustomList(content, fileName);
      };

      reader.readAsText(file);
    }
  }
  //Import a custom list from a .txt file
  importCustomList(content: string, listName: string) {
    try {
      const songs = JSON.parse(content.trim());
      if (!Array.isArray(songs)) {
        throw new Error("Invalid file format");
      } else if (this.checkDuplicatedListName(listName)) {
        throw new Error("A list with this name already exists");
      }

      localStorage.setItem(listName, JSON.stringify(songs));
      this.loadCustomLists();
      this.openAlertModal(`Custom list "${listName}" imported successfully!`);
    } catch (error) {
      this.openAlertModal("Error importing file:\n" + error);
    }
  }

  //Function to check if a custom list name is already in use
  checkDuplicatedListName(listName: string){
      for (let i = 0; i < this.customLists.length; i++) {
        if(this.customLists[i] === listName){
          return true;
        }
      }
      return false;
    }

  //Function to get the local storage data. For debugging purposes
  getLocalStaorage() {
    //window.localStorage.clear();
    for (let i = 0; i < this.customLists.length; i++) {
      console.log(this.customLists[i]);
      console.log(window.localStorage.getItem(this.customLists[i]));
    }
  }

  /* -------------------------------------------------------------------------------------- MODAL ------------------ */

  //ALERT MODAL
  openAlertModal(message: string) {
    this.isAlertModalOpen = true;
    this.alertModalMessage = message;
  }
  closeAlertModal() {
    this.isAlertModalOpen = false;
  }

  //CUSTOM LISTS MODAL
  openCustomListsModal() {
    this.isCustomListsModalOpen = true;
  }

  closeCustomListsModal() {
    this.isCustomListsModalOpen = false;
  }

  //CREATE LIST MODAL. If isRenaming is false, the user is creating a new list. If it's true, the user is renaming a list
  openCreateListModal(isRenaming: boolean = false, customList: string = "") {
    this.isRenamingList = isRenaming;
    this.createListModalInputValue = isRenaming ? customList : "";
    this.originalListName = isRenaming ? customList : "";
    this.createListModalMessage = !isRenaming ? "Name your custom list" : "Rename your custom list";
    this.isCreateListModalOpen = true;
  }


  closeCreateListModal() {
    this.isCreateListModalOpen = false;
  }

  openDeleteListModal(customList: string) {
    this.deleteListModalMessage = "Are you sure you want to delete the list " + customList + "?";
    this.isDeleteListModalOpen = true;
    this.listToDelete = customList;
  }

  closeDeleteListModal() {
    this.isDeleteListModalOpen = false;
  }

  //SONG LIST MODAL
  openSongListModal(albumIndex: number) {
    this.isSongListModalOpen = true;
    this.selectedAlbum = this.albums[albumIndex];
  }

  closeSongListModal() {
    this.isSongListModalOpen = false;
    this.selectedAlbum = null;
  }
}